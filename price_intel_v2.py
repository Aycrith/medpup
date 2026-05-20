#!/usr/bin/env python3
"""
Veterinary Pricing Intelligence Engine v2
Extracts pricing data from vet clinic websites via:
  1. JS bundle analysis (React/Vue SPAs with embedded data)
  2. Wayback Machine archives (Cloudflare bypass)
  3. FAQ/schema.org structured data extraction
  4. Automated form submission with pricing inquiries

Usage:
    python price_intel_v2.py scan https://clinic.com
    python price_intel_v2.py scan --file clinics.txt
    python price_intel_v2.py database --report
    python price_intel_v2.py database --export-json
"""

import requests
import re
import json
import sys
import os
import time
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from datetime import datetime
import sqlite3
import hashlib

DB_PATH = os.path.join(os.path.dirname(__file__), "pricing_intel.db")
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
TIMEOUT = 30

# Known false-positive patterns in JS minified code
FALSE_POSITIVE_CONTEXTS = [
    'int', 'indexOf', 'charCodeAt', 'length', 'prototype', 'slice',
    'substring', 'replace', 'Math.', 'Array(', 'Object.',
    'toString', 'hasOwnProperty', 'keyCode', 'offset',
    '.js', '.css', '.png', '.jpg', '.svg',
    'version', 'build', 'hash', 'chunk'
]

# Minimum price that's likely a real vet procedure
MIN_REAL_PRICE = 5

# ============================================================
# DATABASE
# ============================================================

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.executescript('''
        CREATE TABLE IF NOT EXISTS clinics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            url TEXT UNIQUE,
            domain TEXT,
            phone TEXT,
            email TEXT,
            whatsapp TEXT,
            address TEXT,
            hours TEXT,
            services TEXT,
            last_scanned TEXT,
            cloudflare_blocked INTEGER DEFAULT 0,
            scan_status TEXT DEFAULT 'pending',
            notes TEXT
        );
        CREATE TABLE IF NOT EXISTS pricing (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clinic_id INTEGER,
            procedure_name TEXT,
            price_low REAL,
            price_high REAL,
            currency TEXT DEFAULT 'USD',
            source TEXT,
            confidence TEXT DEFAULT 'low',
            discovered_at TIMESTAMP,
            raw_context TEXT,
            FOREIGN KEY (clinic_id) REFERENCES clinics(id)
        );
        CREATE TABLE IF NOT EXISTS js_bundles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clinic_id INTEGER,
            bundle_url TEXT UNIQUE,
            size_bytes INTEGER,
            hash TEXT,
            scraped_at TIMESTAMP,
            pricing_count INTEGER DEFAULT 0,
            emails_found TEXT,
            phones_found TEXT,
            whatasapp_found TEXT,
            faq_found INTEGER DEFAULT 0,
            FOREIGN KEY (clinic_id) REFERENCES clinics(id)
        );
        CREATE TABLE IF NOT EXISTS form_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clinic_id INTEGER,
            endpoint_url TEXT,
            payload TEXT,
            status_code INTEGER,
            response_preview TEXT,
            submitted_at TIMESTAMP,
            FOREIGN KEY (clinic_id) REFERENCES clinics(id)
        );
    ''')
    conn.commit()
    
    # Try to add scan_status column if it doesn't exist (schema migration)
    try:
        c.execute("ALTER TABLE clinics ADD COLUMN scan_status TEXT DEFAULT 'pending'")
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    return conn

# ============================================================
# CLEANING & FILTERING
# ============================================================

def is_false_positive(amount, context_chars=200):
    """Filter out JS code noise posing as prices."""
    if amount < MIN_REAL_PRICE:
        return True
    for pattern in FALSE_POSITIVE_CONTEXTS:
        if pattern in context_chars.lower():
            return True
    return False

def is_bulk_code_line(text):
    """Detect if this is a line of minified JS code, not a data string."""
    indicators = ['function', 'var ', 'const ', 'let ', '=>', '===', '||', '&&', 'return',
                  '.push', '.map', '.filter', '.reduce', 'this.', 'new ']
    return any(ind in text[:100].lower() for ind in indicators)

def clean_price_line(line):
    """Extract clean price information from a text line."""
    line_clean = line.strip()[:300]
    
    # Find patterns like "$145" or "$550-$1,100" or "$45 - $90"
    range_match = re.search(r'\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:-|–|to)\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)', line_clean)
    if range_match:
        low = float(range_match.group(1).replace(',', ''))
        high = float(range_match.group(2).replace(',', ''))
        if not is_false_positive(low, line_clean) and not is_false_positive(high, line_clean):
            return {'low': low, 'high': high, 'type': 'range', 'context': line_clean[:200]}
    
    single_match = re.search(r'\$(\d+(?:,\d{3})*(?:\.\d{2})?)', line_clean)
    if single_match:
        amt = float(single_match.group(1).replace(',', ''))
        if not is_false_positive(amt, line_clean):
            return {'low': amt, 'high': None, 'type': 'single', 'context': line_clean[:200]}
    
    return None

# ============================================================
# JS BUNDLE EXTRACTION
# ============================================================

def find_js_bundles(url):
    """Find all JS bundle URLs and structured data on a page."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        if r.status_code != 200:
            return [], r.status_code, []
        
        soup = BeautifulSoup(r.text, 'html.parser')
        bundles = []
        for script in soup.find_all('script', src=True):
            src = script['src']
            if src.endswith('.js') and 'flock' not in src.lower():
                bundles.append(urljoin(url, src))
        
        structured = []
        for s in soup.find_all('script', type='application/ld+json'):
            if s.string and len(s.string) < 50000:
                try:
                    structured.append(json.loads(s.string))
                except:
                    pass
        
        return bundles, r.status_code, structured
    except Exception as e:
        print(f"  [!] find_js_bundles error: {e}")
        return [], 0, []

def extract_pricing_from_bundle(bundle_url):
    """Download JS bundle and extract pricing, contacts, and FAQ data."""
    try:
        r = requests.get(bundle_url, headers=HEADERS, timeout=TIMEOUT)
        if r.status_code != 200:
            return None, f"HTTP {r.status_code}"
        
        js = r.text
        h = hashlib.md5(js.encode()).hexdigest()
        
        results = {
            'size': len(js),
            'hash': h,
            'prices': [],
            'emails': [],
            'phones': [],
            'whatsapp': [],
            'faq': [],
            'structured': []
        }
        
        # 1. Extract all price patterns with context
        # Pattern: service name followed by dollar amount
        chunks = re.split(r'[;,\n]', js)
        for chunk in chunks:
            chunk = chunk.strip()
            if not chunk or len(chunk) > 400:
                continue
            if is_bulk_code_line(chunk):
                continue
            price_info = clean_price_line(chunk)
            if price_info:
                # Extract service name (text before the price)
                service_match = re.search(r'^[^$]*?(\w[\w\s&/-]+?)\s*\$', chunk)
                service_name = service_match.group(1).strip() if service_match else 'extracted'
                
                results['prices'].append({
                    'service': service_name[:100],
                    'low': price_info['low'],
                    'high': price_info['high'],
                    'type': price_info['type'],
                    'context': price_info['context'][:150],
                    'line_chars': len(chunk)
                })
        
        # 2. Extract from English FAQ strings (known pattern from VetCancun)
        eng_faq = re.search(r'en:{([^}]+)}', js)
        if eng_faq:
            faq_block = eng_faq.group(1)
            # Extract dollar amounts from FAQ text
            faq_prices = re.finditer(r'faq\.(?:q|a)\d+["\':]\s*["\']([^"\']*\$[^"\']*)["\']', js)
            for m in faq_prices:
                text = m.group(1)
                price_m = re.search(r'\$(\d+(?:[.,]\d+)?)\s*-?\s*\$?(\d+(?:[.,]\d+)?)?\s*(USD|MXN)?', text)
                if price_m:
                    low = float(price_m.group(1).replace(',', ''))
                    high = float(price_m.group(2).replace(',', '')) if price_m.group(2) else None
                    results['prices'].append({
                        'service': 'faq_' + text[:80],
                        'low': low, 'high': high, 'type': 'faq',
                        'context': text[:200]
                    })
        
        # 3. Extract price ranges from structured data
        ld_matches = re.finditer(r'priceRange["\']\s*:\s*["\']([^"\']+)', js)
        for m in ld_matches:
            pr = m.group(1)
            results['prices'].append({
                'service': 'price_range',
                'low': 0, 'high': 0, 'type': 'range_label',
                'context': f'priceRange: {pr}'
            })
        
        # 4. Extract emails
        emails = set(re.findall(r'[\w.+-]+@[\w-]+\.[\w.-]+', js))
        results['emails'] = [e for e in emails 
                           if not any(x in e for x in ['example', 'your@', 'tu@', 'placeholder'])]
        
        # 5. Extract real phone numbers
        all_phones = re.findall(r'(?:\+)?1?\s*\(?(\d{3})\)?[\s.-]*(\d{3})[\s.-]*(\d{4})', js)
        seen = set()
        for a, b, c in all_phones:
            combined = f"{a}{b}{c}"
            if combined not in seen and not any(x in combined for x in ['1073', '4194', '1048', '2097']):
                seen.add(combined)
                results['phones'].append(f"({a}) {b}-{c}")
        
        # 6. Extract WhatsApp
        wa = re.findall(r'(?:\+?52[\s.-]?)?\d{2}[\s.-]?\d{4}[\s.-]?\d{4}', js)
        for w in wa[:5]:
            if len(w) >= 8 and not any(x in w for x in ['107374', '419430', '104857']):
                results['whatsapp'].append(w)
        
        # 7. Extract FAQ Q&A pairs
        faq_q = re.finditer(r'faq\.(\w+)["\':]\s*["\']([^"\']*)["\']', js)
        current_q = None
        current_key = None
        pairs = []
        for m in faq_q:
            key = m.group(1)
            val = m.group(2)
            if '.q' in key:
                current_q = val
                current_key = key
            elif '.a' in key and current_q and key.replace('.a', '.q')[:3] == current_key.replace('.q', '.a')[:3] if current_key else False:
                pass
            # Simpler: collect all Q&A
            if 'q' in key and len(key) <= 6:
                results['faq'].append({'type': 'q', 'text': val})
            elif 'a' in key and len(key) <= 6:
                results['faq'].append({'type': 'a', 'text': val})
        
        # 8. Extract structured JSON data
        ld_all = re.finditer(r'({"@context"\s*:\s*"https?://schema\.org".*?}})', js, re.DOTALL)
        for m in ld_all:
            try:
                results['structured'].append(json.loads(m.group(1)))
            except:
                pass
        
        return results, None
    except Exception as e:
        return None, str(e)

# ============================================================
# WAYBACK MACHINE EXTRACTION
# ============================================================

def try_wayback(url, specific_page=None):
    """Fetch archived page from Wayback Machine, optionally a specific subpage."""
    domain = urlparse(url).netloc
    
    pages_to_try = []
    if specific_page:
        pages_to_try.append(f"https://web.archive.org/web/2025/https://{domain}{specific_page}")
    pages_to_try.extend([
        f"https://web.archive.org/web/2025/{url}",
        f"https://web.archive.org/web/2024/{url}",
        f"https://web.archive.org/web/2025/https://{domain}",
    ])
    
    for wb_url in pages_to_try:
        try:
            r = requests.get(wb_url, headers=HEADERS, timeout=TIMEOUT)
            if r.status_code == 200 and len(r.text) > 2000:
                if 'Redirecting to' not in r.text[:300]:
                    return r.text, wb_url
        except:
            continue
    return None, None

def extract_from_wayback(url):
    """Use Wayback Machine to find pricing on Cloudflare-blocked sites."""
    html, src_url = try_wayback(url, specific_page='/prices/')
    if not html:
        html, src_url = try_wayback(url)
    if not html:
        return []
    
    soup = BeautifulSoup(html, 'html.parser')
    text = soup.get_text(separator='\n', strip=True)
    
    results = []
    for line in text.split('\n'):
        line = line.strip()
        if not line or len(line) > 500:
            continue
        price_info = clean_price_line(line)
        if price_info:
            # Look for service name in the surrounding lines
            service_name = 'extracted_from_archive'
            for kw in ['spay', 'neuter', 'dental', 'surgery', 'mass', 'tumor', 'clean',
                       'vaccine', 'exam', 'x-ray', 'ultrasound', 'microchip', 'hernia',
                       'bladder', 'pyometra', 'entropion', 'cherry', 'amputation',
                       'removal', 'extraction']:
                if kw in line.lower():
                    service_name = kw
                    break
            results.append({
                'service': service_name,
                'low': price_info['low'],
                'high': price_info['high'],
                'type': price_info['type'],
                'context': price_info['context'],
                'source': 'wayback'
            })
    return results

# ============================================================
# CONTACT FORM FINDER
# ============================================================

def find_contact_forms(url):
    """Find contact form endpoints on a clinic page."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        if r.status_code != 200:
            return []
        
        forms = []
        soup = BeautifulSoup(r.text, 'html.parser')
        
        for form in soup.find_all('form'):
            action = form.get('action', '')
            method = form.get('method', 'get').lower()
            form_data = {
                'action': urljoin(url, action) if action else url,
                'method': method,
                'inputs': []
            }
            for input_tag in form.find_all(['input', 'textarea', 'select']):
                name = input_tag.get('name', '')
                if name and input_tag.get('type') not in ['hidden', 'submit', 'button']:
                    form_data['inputs'].append({'name': name, 'type': input_tag.get('type', 'text')})
            if form_data['inputs']:
                forms.append(form_data)
        
        # Also find API endpoints
        api_patterns = re.findall(r'(?:action|href|src)=["\']([^"\']*(?:api|contact|send|inquiry)[^"\']*)["\']', r.text)
        for api in list(set(api_patterns)):
            full_url = urljoin(url, api)
            if full_url not in [f['action'] for f in forms]:
                forms.append({'action': full_url, 'method': 'post', 'inputs': [], 'api_found': True})
        
        return forms
    except:
        return []

def submit_pricing_inquiry(form_info, clinic_name):
    """Submit standardized pricing inquiry."""
    payload = {}
    for inp in form_info['inputs']:
        name = inp['name'].lower()
        if 'name' in name:
            payload[inp['name']] = 'Cameron'
        elif 'email' in name:
            payload[inp['name']] = '11thefool11@gmail.com'
        elif 'phone' in name or 'tel' in name:
            payload[inp['name']] = '7275550199'
        elif 'pet' in name or 'animal' in name or 'mascota' in name:
            payload[inp['name']] = 'Dog'
        elif 'message' in name or 'mensaje' in name or 'comment' in name:
            payload[inp['name']] = """Hello, I am researching veterinary pricing for a potential referral partnership. I would like to refer US clients to your clinic for dental cleaning, spay/neuter, and mass removal procedures. Could you please share your current USD price list for these services? Do you treat international patients and provide health certificates for return travel to the US?"""
        elif 'subject' in name or 'asunto' in name:
            payload[inp['name']] = 'Pricing inquiry - potential partnership'
        elif 'submit' not in name and 'btn' not in name and 'captcha' not in name:
            payload[inp['name']] = 'Test'
    
    try:
        if form_info['method'] == 'post':
            r = requests.post(form_info['action'], data=payload, headers=HEADERS, timeout=15)
        else:
            r = requests.get(form_info['action'], params=payload, headers=HEADERS, timeout=15)
        return r.status_code, r.text[:300]
    except Exception as e:
        return 0, str(e)

# ============================================================
# CLINIC SCANNER
# ============================================================

def scan_clinic(url, conn):
    """Full scan: JS bundles, Wayback, pricing extraction, forms."""
    c = conn.cursor()
    domain = urlparse(url).netloc
    
    print(f"\n{'='*60}")
    print(f"SCANNING: {url}")
    print(f"{'='*60}")
    
    # Check for existing
    c.execute("SELECT id, name FROM clinics WHERE url = ?", (url,))
    existing = c.fetchone()
    if existing:
        clinic_id = existing[0]
        print(f"  [DB] Existing: '{existing[1]}' (ID: {clinic_id})")
    else:
        c.execute("INSERT INTO clinics (url, domain, last_scanned, scan_status) VALUES (?, ?, ?, 'scanning')",
                  (url, domain, datetime.now().isoformat()))
        conn.commit()
        clinic_id = c.lastrowid
        print(f"  [DB] New record (ID: {clinic_id})")
    
    # Step 1: Scan main page
    print(f"\n  --- Step 1: Main page ---")
    name = domain
    emails = []
    phones = []
    cloudflare = False
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        status = r.status_code
        print(f"  Status: {status}, Size: {len(r.text)} bytes")
        
        if status != 200:
            cloudflare = True
            print(f"  [WARN] Blocked (likely Cloudflare)")
            # Still try to get name from Wayback
            html, _ = try_wayback(url)
            if html:
                soup = BeautifulSoup(html, 'html.parser')
                if soup.title:
                    name = soup.title.string.strip()
        else:
            soup = BeautifulSoup(r.text, 'html.parser')
            if soup.title:
                name = soup.title.string.strip()
            emails_raw = re.findall(r'[\w.+-]+@[\w-]+\.[\w.-]+', r.text)
            emails = [e for e in emails_raw if 'example' not in e and 'your@' not in e]
            phones_raw = re.findall(r'(?:\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4}))', r.text)
            phones = list(set(f"({a}) {b}-{c}" for a, b, c in phones_raw if a not in ['177', '176', '175']))
            if phones:
                print(f"  Found {len(phones)} phone numbers")
    except Exception as e:
        print(f"  [!] Error: {e}")
        cloudflare = True
    
    print(f"  Clinic: {name}")
    
    # Step 2: JS Bundle extraction
    print(f"\n  --- Step 2: JS Bundle Analysis ---")
    bundles, status, structured = find_js_bundles(url)
    
    if bundles:
        print(f"  Found {len(bundles)} JS bundles")
        for b_url in bundles[:5]:
            print(f"    Bundle: {os.path.basename(b_url)}")
            results, error = extract_pricing_from_bundle(b_url)
            
            if error:
                print(f"    [ERROR] {error}")
                continue
            
            if results:
                # Filter prices
                real_prices = [p for p in results['prices'] if p['low'] >= MIN_REAL_PRICE]
                
                print(f"    Prices found: {len(real_prices)} (total found: {len(results['prices'])})")
                if real_prices:
                    for p in real_prices[:10]:
                        h = f" - ${p['high']:.0f}" if p['high'] else ""
                        print(f"      ${p['low']:.0f}{h} - {p['service'][:60]}")
                
                if results['emails']:
                    print(f"    Emails: {results['emails'][:3]}")
                    emails = results['emails']
                if results['phones']:
                    print(f"    Phones: {results['phones'][:3]}")
                    phones = results['phones'][:3]
                if results['whatsapp']:
                    wa = results['whatsapp'][0]
                    print(f"    WhatsApp: {wa}")
                    c.execute("UPDATE clinics SET whatsapp = ? WHERE id = ?", (wa, clinic_id))
                
                if results['faq']:
                    q_count = sum(1 for f in results['faq'] if f['type'] == 'q')
                    a_count = sum(1 for f in results['faq'] if f['type'] == 'a')
                    print(f"    FAQ: {q_count} questions, {a_count} answers")
                
                # Store bundle
                c.execute("""INSERT OR IGNORE INTO js_bundles 
                    (clinic_id, bundle_url, size_bytes, hash, scraped_at, pricing_count, emails_found, phones_found)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                    (clinic_id, b_url, results['size'], results['hash'],
                     datetime.now().isoformat(), len(real_prices),
                     ','.join(results['emails'][:3]), ','.join(results['phones'][:3])))
                
                # Store pricing
                for p in real_prices:
                    c.execute("""INSERT INTO pricing 
                        (clinic_id, procedure_name, price_low, price_high, currency, source, confidence, discovered_at, raw_context)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (clinic_id, p['service'], p['low'], p['high'], 'USD',
                         b_url, 'medium', datetime.now().isoformat(), p.get('context', '')[:300]))
                
                conn.commit()
    else:
        print(f"  No JS bundles found")
    
    # Step 3: Wayback Machine extraction for blocked sites
    print(f"\n  --- Step 3: Wayback Archive ---")
    wb_prices = extract_from_wayback(url)
    if wb_prices:
        print(f"  Found {len(wb_prices)} price points via Wayback")
        for p in wb_prices[:10]:
            h = f" - ${p['high']:.0f}" if p['high'] else ""
            print(f"    ${p['low']:.0f}{h} - {p['service']}")
        for p in wb_prices:
            c.execute("""INSERT INTO pricing 
                (clinic_id, procedure_name, price_low, price_high, currency, source, confidence, discovered_at, raw_context)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (clinic_id, p['service'], p['low'], p['high'], 'USD',
                 p.get('source', 'wayback'), 'medium', datetime.now().isoformat(), p.get('context', '')[:300]))
        conn.commit()
    else:
        print(f"  No pricing found via Wayback")
    
    # Step 4: Find forms
    print(f"\n  --- Step 4: Contact Forms ---")
    forms = find_contact_forms(url)
    if forms:
        print(f"  Found {len(forms)} potential form endpoints")
        for f in forms[:3]:
            print(f"    {f['method'].upper()} {f['action'][:80]}")
            if f['inputs']:
                print(f"    Fields: {', '.join(i['name'] for i in f['inputs'][:8])}")
    else:
        print(f"  No forms found")
    
    # Update clinic record
    c.execute("""UPDATE clinics SET name = ?, email = ?, phone = ?, cloudflare_blocked = ?,
              last_scanned = ?, scan_status = 'done', services = ? WHERE id = ?""",
              (name[:200], ','.join(emails[:5]) if emails else '',
               ','.join(phones[:5]) if phones else '', 1 if cloudflare else 0,
               datetime.now().isoformat(),
               'scanned_v2', clinic_id))
    conn.commit()
    
    print(f"\n  [DONE] Clinic ID {clinic_id}: {name[:60]}")
    return clinic_id

# ============================================================
# BATCH SCAN
# ============================================================

def get_default_clinics():
    """Return list of clinics to scan, organized by tier."""
    return [
        # Tier 1: Known clinics with pricing data
        ('https://vetcancun.com', 'VetCancun - Cancun MX'),
        ('https://capcancun.com', 'CAP Veterinaria Cancun'),
        ('https://www.drkellysvet.com', 'Dr Kellys Surgical Unit'),
        
        # Tier 2: Pinellas County low-cost clinics
        ('https://www.spotusa.org', 'SPOT Spay Neuter Clinic'),
        ('https://operationsnip.com', 'Operation SNIP Largo'),
        ('https://www.petpalvetclinic.com', 'Pet Pal Veterinary Clinic'),
        
        # Tier 3: Tampa Bay area clinics
        ('https://www.spcapets.com', 'SPCA Tampa Bay'),
        ('https://www.humanesocietyofpinellas.org', 'Humane Society of Pinellas'),
        ('https://www.humanesocietyoftampabay.org', 'Humane Society of Tampa Bay'),
        ('https://www.animalcoalitionoftampa.org', 'Animal Coalition of Tampa'),
        
        # Tier 4: Other local low-cost
        ('https://www.paws2help.org', 'Paws 2 Help West Palm Beach'),
        ('https://www.justinbartlettanimalhospital.com', 'Justin Bartlett Animal Hospital'),
        ('https://www.aspca.org/miami-initiative/community-veterinary-clinic', 'ASPCA CVC Miami'),
    ]

# ============================================================
# REPORTING
# ============================================================

def generate_report(conn):
    """Generate comprehensive report from database."""
    c = conn.cursor()
    
    print(f"\n{'='*70}")
    print(f" VETERINARY PRICING INTELLIGENCE REPORT")
    print(f" Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*70}")
    
    c.execute("SELECT COUNT(*) FROM clinics")
    total = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM pricing")
    prices = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM clinics WHERE scan_status='done'")
    scanned = c.fetchone()[0]
    
    print(f"\n  Clinics in DB:   {total}")
    print(f"  Scanned:        {scanned}")
    print(f"  Pricing points: {prices}")
    
    # Per-clinic summary
    print(f"\n{'='*70}")
    print(f" CLINIC SUMMARIES")
    print(f"{'='*70}")
    
    c.execute("""SELECT c.id, c.name, c.domain, c.email, c.phone, c.whatsapp, c.cloudflare_blocked,
                (SELECT COUNT(*) FROM pricing WHERE clinic_id = c.id) as price_count,
                (SELECT MIN(price_low) FROM pricing WHERE clinic_id = c.id AND price_low > 5) as min_price
                FROM clinics c ORDER BY c.name""")
    
    for row in c.fetchall():
        cid, name, domain, email, phone, whatsapp, blocked, pc, min_p = row
        
        print(f"\n  [{cid}] {name or domain[:60]}")
        if blocked: print(f"        Cloudflare blocked (via Wayback)")
        if email: print(f"        Email: {email[:100]}")
        if phone: print(f"        Phone: {phone[:60]}")
        if whatsapp: print(f"        WhatsApp: {whatsapp[:60]}")
        print(f"        Pricing data points: {pc}")
        
        if pc > 0:
            # Show top prices
            c.execute("""SELECT procedure_name, price_low, price_high, confidence 
                       FROM pricing WHERE clinic_id = ? AND price_low >= 5
                       ORDER BY price_low ASC LIMIT 15""", (cid,))
            for pn, pl, ph, conf in c.fetchall():
                hs = f" - ${ph:.0f}" if ph else ""
                print(f"          ${pl:.0f}{hs}  {pn[:70]} ({conf})")
    
    # Best deals
    print(f"\n{'='*70}")
    print(f" TOP DEALS (Verified Pricing)")
    print(f"{'='*70}")
    
    c.execute("""SELECT c.name, p.procedure_name, p.price_low, p.price_high, p.confidence, p.raw_context
               FROM pricing p JOIN clinics c ON p.clinic_id = c.id
               WHERE p.price_low >= 5 AND p.confidence != 'low'
               ORDER BY p.price_low ASC LIMIT 25""")
    
    for row in c.fetchall():
        name, proc, low, high, conf, ctx = row
        hs = f" - ${high:.0f}" if high else ""
        print(f"  ${low:.0f}{hs}  {proc[:60]} @ {name[:40]}")

def export_json(conn):
    """Export all data to JSON."""
    c = conn.cursor()
    
    c.execute("""SELECT c.id, c.name, c.url, c.email, c.phone, c.whatsapp, c.cloudflare_blocked,
                (SELECT COUNT(*) FROM pricing WHERE clinic_id = c.id AND price_low >= 5) as prices_count
                FROM clinics c ORDER BY c.name""")
    
    output = {}
    for row in c.fetchall():
        cid, name, url, email, phone, whatsapp, blocked, pc = row
        clinic_data = {
            'url': url,
            'email': email,
            'phone': phone,
            'whatsapp': whatsapp,
            'blocked': bool(blocked),
            'pricing': []
        }
        
        if pc > 0:
            c2 = conn.cursor()
            c2.execute("""SELECT procedure_name, price_low, price_high, currency, confidence, raw_context
                       FROM pricing WHERE clinic_id = ? AND price_low >= 5
                       ORDER BY price_low""", (cid,))
            for pn, pl, ph, cur, conf, ctx in c2.fetchall():
                clinic_data['pricing'].append({
                    'service': pn[:100],
                    'price_low': pl,
                    'price_high': ph,
                    'currency': cur or 'USD',
                    'confidence': conf,
                    'context': (ctx or '')[:200]
                })
        
        output[name or url] = clinic_data
    
    path = os.path.join(os.path.dirname(__file__), 'pricing_intel_export.json')
    with open(path, 'w') as f:
        json.dump(output, f, indent=2, default=str)
    print(f"\n  Exported to {path}")
    print(f"  {len(output)} clinics, {sum(len(v['pricing']) for v in output.values())} pricing points")

# ============================================================
# MAIN
# ============================================================

def main():
    conn = init_db()
    
    if len(sys.argv) < 2:
        print(__doc__)
        return
    
    cmd = sys.argv[1]
    
    if cmd == 'scan':
        if len(sys.argv) >= 3 and sys.argv[2] == '--file':
            with open(sys.argv[3]) as f:
                urls = [l.strip() for l in f if l.strip() and not l.startswith('#')]
            for url in urls:
                scan_clinic(url if url.startswith('http') else 'https://' + url, conn)
                time.sleep(1)
        elif len(sys.argv) >= 3 and sys.argv[2] == '--all':
            for name, url in get_default_clinics():
                print(f"\n{'='*70}")
                print(f"NEXT UP: {name}")
                scan_clinic(url, conn)
                time.sleep(1)
        elif len(sys.argv) >= 3:
            url = sys.argv[2]
            if not url.startswith('http'):
                url = 'https://' + url
            scan_clinic(url, conn)
        else:
            print("Usage: scan <url> | scan --all | scan --file <file>")
    
    elif cmd == 'database':
        if len(sys.argv) >= 3 and sys.argv[2] == '--report':
            generate_report(conn)
        elif len(sys.argv) >= 3 and sys.argv[2] == '--export-json':
            export_json(conn)
        elif len(sys.argv) >= 3 and sys.argv[2] == '--clear':
            c = conn.cursor()
            for t in ['pricing', 'js_bundles', 'form_submissions', 'clinics']:
                c.execute(f"DELETE FROM {t}")
            conn.commit()
            print("Database cleared.")
        else:
            print("Usage: database --report | --export-json | --clear")
    
    elif cmd == 'batch':
        """Scan all default clinics with delays."""
        for url, name in get_default_clinics():
            print(f"\n{'='*70}")
            print(f"NEXT UP: {name}")
            print(f"URL: {url}")
            print(f"{'='*70}")
            scan_clinic(url, conn)
            print(f"\n  Waiting 2 seconds before next scan...")
            time.sleep(2)
    
    else:
        print(f"Unknown: {cmd}")
        print(__doc__)

if __name__ == '__main__':
    main()
