#!/usr/bin/env python3
"""
Veterinary Pricing Intelligence Engine
Extracts pricing data from vet clinic websites via JS bundle analysis,
Wayback Machine archives, and automated form submissions.

Usage:
    python price_intel_engine.py scan https://vetcancun.com
    python price_intel_engine.py scan --file clinics.txt
    python price_intel_engine.py extract-js https://example.com/assets/index-abc123.js
    python price_intel_engine.py submit-form --url https://vetcancun.com --name "Test"
    python price_intel_engine.py database --report
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

# ============================================================
# CONFIGURATION
# ============================================================

DB_PATH = os.path.join(os.path.dirname(__file__), "pricing_intel.db")
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
TIMEOUT = 30
WAYBACK_BASE = "https://web.archive.org/web/2025/https://"

# ============================================================
# DATABASE SETUP
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
            last_scanned TIMESTAMP,
            cloudflare_blocked INTEGER DEFAULT 0,
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
        
        CREATE TABLE IF NOT EXISTS js_bundles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clinic_id INTEGER,
            bundle_url TEXT UNIQUE,
            size_bytes INTEGER,
            hash TEXT,
            scraped_at TIMESTAMP,
            pricing_found INTEGER DEFAULT 0,
            emails_found TEXT,
            phones_found TEXT,
            FOREIGN KEY (clinic_id) REFERENCES clinics(id)
        );
    ''')
    conn.commit()
    return conn

# ============================================================
# JS BUNDLE EXTRACTOR
# ============================================================

def find_js_bundles(url):
    """Find all JavaScript bundle URLs on a page."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        if r.status_code != 200:
            print(f"  [WARN] {url} returned {r.status_code}")
            return [], r.status_code, r.text[:500]
        
        # Find script tags with src
        soup = BeautifulSoup(r.text, 'html.parser')
        scripts = soup.find_all('script', src=True)
        
        bundles = []
        for script in scripts:
            src = script['src']
            if src.endswith('.js'):
                full_url = urljoin(url, src)
                bundles.append(full_url)
        
        # Also find inline scripts with JSON data
        inline_scripts = soup.find_all('script', type='application/ld+json')
        structured_data = []
        for s in inline_scripts:
            if s.string:
                structured_data.append(s.string)
        
        return bundles, r.status_code, structured_data
    except Exception as e:
        print(f"  [ERROR] Failed to fetch {url}: {e}")
        return [], 0, []

def extract_pricing_from_bundle(bundle_url):
    """Download and analyze a JS bundle for pricing data."""
    try:
        r = requests.get(bundle_url, headers=HEADERS, timeout=TIMEOUT)
        if r.status_code != 200:
            return None, f"HTTP {r.status_code}"
        
        js_content = r.text
        bundle_hash = hashlib.md5(js_content.encode()).hexdigest()
        
        results = {
            'size': len(js_content),
            'hash': bundle_hash,
            'prices': [],
            'emails': [],
            'phones': [],
            'whatsapp': [],
            'faq': [],
            'structured_data': [],
            'translations': []
        }
        
        # Extract USD prices
        usd_prices = re.findall(r'\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|usd)?', js_content)
        for p in usd_prices[:50]:
            clean = float(p.replace(',', ''))
            results['prices'].append({'amount': clean, 'currency': 'USD'})
        
        # Extract MXN prices with context
        mxn_prices = re.findall(r'\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:MXN|mxn|pesos?)', js_content)
        for p in mxn_prices[:30]:
            clean = float(p.replace(',', ''))
            results['prices'].append({'amount': clean, 'currency': 'MXN'})
        
        # Extract any $X-$Y ranges with context
        ranges = re.findall(r'\$(\d+(?:,\d{3})*)\s*(?:-|–|to)\s*\$?(\d+(?:,\d{3})*)\s*(?:USD|MXN)?', js_content)
        for low, high in ranges[:20]:
            results['prices'].append({
                'amount_low': float(low.replace(',', '')),
                'amount_high': float(high.replace(',', '')),
                'type': 'range'
            })
        
        # Extract emails
        emails = set(re.findall(r'[\w.+-]+@[\w-]+\.[\w.-]+', js_content))
        results['emails'] = [e for e in emails if not any(x in e for x in ['example', 'your@', 'tu@', 'placeholder'])]
        
        # Extract phone numbers
        phones = re.findall(r'\+?1?\d{1,3}[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,4}', js_content)
        valid_phones = []
        for p in phones:
            digits = re.sub(r'\D', '', p)
            if 8 <= len(digits) <= 15 and digits not in ['1073741823', '4194304', '1048576', '2097152']:
                valid_phones.append(p)
        results['phones'] = list(set(valid_phones))[:20]
        
        # Extract WhatsApp numbers
        whatsapp = re.findall(r'(?:wa\.me|whatsapp|\+52)[^"\'\\,]*\d{7,}', js_content)
        results['whatsapp'] = list(set(whatsapp))[:10]
        
        # Extract FAQ content (Q&A pairs)
        faq_patterns = re.findall(r'faq\.q\d+["\':]\s*["\']([^"\']*)["\']\s*,\s*["\']faq\.a\d+["\':]\s*["\']([^"\']*)["\']', js_content)
        results['faq'] = [{'q': q, 'a': a} for q, a in faq_patterns[:30]]
        
        # Extract translation strings containing pricing keywords
        price_keywords = ['price', 'cost', 'fee', 'precio', 'costo', 'tarifa', '$', 'dollar', 'peso', 'mxn', 'usd']
        translation_patterns = re.findall(r'["\']([^"\']*)["\']\s*:\s*["\']([^"\']*\$[^"\']*)["\']', js_content)
        results['translations'] = [{'key': k, 'value': v} for k, v in translation_patterns[:20] if any(p in v.lower() or p in k.lower() for p in price_keywords)]
        
        # Extract JSON-LD structured data
        ld_json = re.findall(r'({"@context"\s*:\s*"https?://schema\.org".*?}}})', js_content, re.DOTALL)
        results['structured_data'] = [json.loads(j) for j in ld_json[:5] if len(j) < 50000]
        
        return results, None
    except Exception as e:
        return None, str(e)

# ============================================================
# WAYBACK MACHINE EXTRACTOR
# ============================================================

def try_wayback(url):
    """Try to fetch a page from the Wayback Machine archive."""
    domain = urlparse(url).netloc
    path = urlparse(url).path
    
    # Try different archive patterns
    patterns = [
        f"https://web.archive.org/web/2025/{url}",
        f"https://web.archive.org/web/2024/{url}",
        f"https://web.archive.org/web/2025/https://{domain}{path}",
        f"https://web.archive.org/web/2024/https://{domain}{path}",
    ]
    
    for wb_url in patterns:
        try:
            r = requests.get(wb_url, headers=HEADERS, timeout=TIMEOUT)
            if r.status_code == 200 and len(r.text) > 1000:
                # Check if it's actual content (not a redirect page)
                if 'Redirecting to' not in r.text[:200]:
                    return r.text, wb_url
        except:
            continue
    return None, None

def extract_pricing_from_html(html, source_url):
    """Extract pricing from scraped HTML."""
    soup = BeautifulSoup(html, 'html.parser')
    text = soup.get_text(separator='\n', strip=True)
    
    results = {
        'prices': [],
        'contact': {},
        'services': []
    }
    
    # Find all lines with dollar amounts
    for line in text.split('\n'):
        price_matches = re.findall(r'\$(\d+(?:,\d{3})*(?:\.\d{2})?)', line)
        for p in price_matches:
            results['prices'].append({
                'amount': float(p.replace(',', '')),
                'context': line[:200],
                'source': source_url
            })
    
    # Find service keywords
    service_keywords = ['spay', 'neuter', 'dental', 'surgery', 'mass removal', 'tumor', 'vaccine', 
                        'exam', 'consultation', 'x-ray', 'ultrasound', 'microchip', 'orthopedic']
    for line in text.split('\n'):
        line_lower = line.lower()
        for kw in service_keywords:
            if kw in line_lower and any(c.isdigit() for c in line):
                results['services'].append({
                    'keyword': kw,
                    'context': line[:300]
                })
                break
    
    return results

# ============================================================
# CONTACT FORM SUBMITTER
# ============================================================

def find_contact_forms(url):
    """Find contact form endpoints on a page."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        if r.status_code != 200:
            return []
        
        forms = []
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Find all forms
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
                input_type = input_tag.get('type', 'text')
                if name and input_type not in ['hidden', 'submit']:
                    form_data['inputs'].append({
                        'name': name,
                        'type': input_type
                    })
            
            if form_data['inputs']:  # Only add forms with visible inputs
                forms.append(form_data)
        
        # Also look for API endpoints in the page
        api_patterns = re.findall(r'(/api/[^"\'\\s]+|/contact[^"\'\\s]+|/send[^"\'\\s]+)', r.text)
        for api in list(set(api_patterns))[:10]:
            forms.append({
                'action': urljoin(url, api),
                'method': 'post',
                'inputs': [],
                'api_found': True
            })
        
        return forms
    except Exception as e:
        return []

def submit_pricing_inquiry(form_info, clinic_name, clinic_url):
    """Submit a standardized pricing inquiry via a contact form."""
    payload = {}
    for inp in form_info['inputs']:
        name = inp['name'].lower()
        if 'name' in name:
            payload[inp['name']] = 'Cameron'
        elif 'email' in name:
            payload[inp['name']] = '11thefool11@gmail.com'
        elif 'phone' in name:
            payload[inp['name']] = '(727) 555-0199'
        elif 'pet' in name or 'animal' in name or 'mascota' in name:
            payload[inp['name']] = 'Dog'
        elif 'message' in name or 'mensaje' in name:
            payload[inp['name']] = f"""Hello, I'm researching veterinary pricing for a potential partnership. I'd like to refer US clients to your clinic for procedures such as dental cleaning, spay/neuter, and mass removal. Could you please share your current price list in USD for these services? Also, do you treat international patients and provide travel health certificates for return to the US? Thank you."""
        elif 'subject' in name:
            payload[inp['name']] = 'Pricing inquiry - potential referral partnership'
        elif 'submit' not in name:
            payload[inp['name']] = 'Test'
    
    try:
        if form_info['method'] == 'post':
            r = requests.post(form_info['action'], data=payload, headers=HEADERS, timeout=15)
        else:
            r = requests.get(form_info['action'], params=payload, headers=HEADERS, timeout=15)
        
        return {
            'status': r.status_code,
            'preview': r.text[:500],
            'payload': str(payload)[:500]
        }
    except Exception as e:
        return {'status': 0, 'error': str(e)}

# ============================================================
# CLINIC SCANNER
# ============================================================

def scan_clinic(url, conn):
    """Full scan of a veterinary clinic website."""
    c = conn.cursor()
    domain = urlparse(url).netloc
    print(f"\n{'='*60}")
    print(f"SCANNING: {url}")
    print(f"{'='*60}")
    
    # Check if already scanned
    c.execute("SELECT id, name FROM clinics WHERE url = ?", (url,))
    existing = c.fetchone()
    
    if existing:
        clinic_id = existing[0]
        print(f"  [INFO] Already in database as '{existing[1]}' (ID: {clinic_id})")
    else:
        c.execute("INSERT INTO clinics (url, domain, last_scanned) VALUES (?, ?, ?)",
                  (url, domain, datetime.now()))
        conn.commit()
        clinic_id = c.lastrowid
        print(f"  [NEW] Added to database as ID {clinic_id}")
    
    # Step 1: Scan main page for metadata
    print(f"\n  [STEP 1] Scanning main page...")
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        print(f"    Status: {r.status_code}, Size: {len(r.text)} bytes")
        
        if r.status_code != 200:
            # Try Wayback Machine
            print(f"    [FALLBACK] Trying Wayback Machine...")
            wb_html, wb_url = try_wayback(url)
            if wb_html:
                print(f"    [OK] Found archived version at {wb_url}")
                html_content = wb_html
                c.execute("UPDATE clinics SET cloudflare_blocked = 1, notes = 'Retrieved from Wayback Machine' WHERE id = ?", (clinic_id,))
                conn.commit()
            else:
                print(f"    [FAIL] Could not access site via Wayback either")
                c.execute("UPDATE clinics SET cloudflare_blocked = 1, notes = 'Blocked - no archive found' WHERE id = ?", (clinic_id,))
                conn.commit()
                return clinic_id
        else:
            html_content = r.text
        
        # Extract page metadata
        soup = BeautifulSoup(html_content, 'html.parser')
        title = soup.title.string if soup.title else ''
        
        # Find contact info
        emails = set(re.findall(r'[\w.+-]+@[\w-]+\.[\w.-]+', html_content))
        valid_emails = [e for e in emails if 'example' not in e and 'your@' not in e and 'tu@' not in e]
        
        phones = set(re.findall(r'(?:\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})', html_content))
        
        # Update clinic info
        name = title.split('|')[0].strip() if '|' in title else title[:100]
        c.execute("""UPDATE clinics SET name = ?, email = ?, last_scanned = ? WHERE id = ?""",
                  (name, ','.join(valid_emails[:5]), datetime.now(), clinic_id))
        conn.commit()
        
        print(f"    Name: {name}")
        print(f"    Emails: {valid_emails[:3]}")
        print(f"    Phones: {list(phones)[:3]}")
        
    except Exception as e:
        print(f"    [ERROR] {e}")
    
    # Step 2: Find and scan JS bundles
    print(f"\n  [STEP 2] Searching for JS bundles...")
    bundles, status, structured = find_js_bundles(url)
    
    if bundles:
        print(f"    Found {len(bundles)} JS files")
        for i, bundle_url in enumerate(bundles[:10]):
            print(f"\n    [{i+1}] {os.path.basename(bundle_url)} ({bundle_url[:80]}...)")
            results, error = extract_pricing_from_bundle(bundle_url)
            
            if error:
                print(f"      [ERROR] {error}")
                continue
            
            if results:
                # Store bundle info
                c.execute("""INSERT OR IGNORE INTO js_bundles 
                          (clinic_id, bundle_url, size_bytes, hash, scraped_at, pricing_found, emails_found, phones_found)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                          (clinic_id, bundle_url, results['size'], results['hash'], datetime.now(),
                           1 if results['prices'] else 0,
                           ','.join(results['emails'][:5]),
                           ','.join(results['phones'][:5])))
                conn.commit()
                
                # Store pricing data
                for price in results['prices'][:30]:
                    if 'amount' in price:
                        c.execute("""INSERT INTO pricing (clinic_id, procedure_name, price_low, currency, source, confidence, discovered_at)
                                  VALUES (?, ?, ?, ?, ?, ?, ?)""",
                                  (clinic_id, 'extracted_from_bundle', price['amount'], price.get('currency', 'USD'),
                                   bundle_url, 'medium', datetime.now()))
                    elif 'amount_low' in price and 'amount_high' in price:
                        c.execute("""INSERT INTO pricing (clinic_id, procedure_name, price_low, price_high, currency, source, confidence, discovered_at)
                                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                                  (clinic_id, 'range_from_bundle', price['amount_low'], price['amount_high'],
                                   'USD', bundle_url, 'medium', datetime.now()))
                
                # Store FAQ data
                if results['faq']:
                    for faq in results['faq'][:20]:
                        print(f"      [FAQ] Q: {faq['q'][:60]}...")
                        print(f"            A: {faq['a'][:80]}...")
                        
                        # If FAQ contains price info, store it
                        if any(p in faq['a'].lower() for p in ['$', 'price', 'cost', 'fee']):
                            price_match = re.search(r'\$(\d+(?:,\d{3})*(?:\.\d{2})?)', faq['a'])
                            if price_match:
                                amt = float(price_match.group(1).replace(',', ''))
                                c.execute("""INSERT INTO pricing (clinic_id, procedure_name, price_low, currency, source, confidence, discovered_at, raw_context)
                                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                                          (clinic_id, faq['q'][:100], amt, 'USD', f"faq_from_bundle", 'high', datetime.now(), faq['a'][:500]))
                
                # Store structured data
                if results['structured_data']:
                    for sd in results['structured_data']:
                        if isinstance(sd, dict) and 'priceRange' in sd:
                            print(f"      [PRICE RANGE] {sd.get('priceRange', 'N/A')}")
                
                # Store WhatsApp
                if results['whatsapp']:
                    wa = results['whatsapp'][0]
                    print(f"      [WHATSAPP] {wa[:80]}")
                    c.execute("UPDATE clinics SET whatsapp = ? WHERE id = ?", (wa, clinic_id))
                    conn.commit()
                
                print(f"      Found: {len(results['prices'])} price points, {len(results['emails'])} emails, {len(results['faq'])} FAQ items")
    else:
        print(f"    No JS bundles found")
    
    # Step 3: If Cloudflare blocked, try Wayback Machine for HTML
    print(f"\n  [STEP 3] Checking for HTML-based pricing...")
    wb_html, wb_url = try_wayback(url)
    if wb_html and len(wb_html) > 5000:
        print(f"    [OK] Wayback archive found at {wb_url}")
        pricing_data = extract_pricing_from_html(wb_html, wb_url)
        
        for p in pricing_data['prices'][:30]:
            c.execute("""INSERT INTO pricing (clinic_id, procedure_name, price_low, source, confidence, discovered_at)
                      VALUES (?, ?, ?, ?, ?, ?)""",
                      (clinic_id, 'extracted_from_wayback', p['amount'], p['source'], 'medium', datetime.now()))
        
        for s in pricing_data['services'][:20]:
            print(f"    [SERVICE] {s['keyword']}: {s['context'][:100]}")
        
        print(f"    Found: {len(pricing_data['prices'])} price points, {len(pricing_data['services'])} service mentions")
    
    # Step 4: Find contact forms
    print(f"\n  [STEP 4] Looking for contact forms...")
    forms = find_contact_forms(url)
    if forms:
        print(f"    Found {len(forms)} potential form endpoints")
        for f in forms[:3]:
            print(f"      Action: {f['action'][:80]}")
            print(f"      Method: {f['method']}")
            print(f"      Inputs: {[i['name'] for i in f['inputs']]}")
            
            if f['inputs']:
                # Submit inquiry (dry run - don't actually submit unless confirmed)
                print(f"      [DRY RUN] Would submit pricing inquiry here")
    else:
        print(f"    No forms found")
    
    conn.commit()
    print(f"\n  [DONE] Scan complete. Clinic ID: {clinic_id}")
    return clinic_id

# ============================================================
# DATABASE REPORTS
# ============================================================

def generate_report(conn):
    """Generate a comprehensive pricing report from the database."""
    c = conn.cursor()
    
    print(f"\n{'='*60}")
    print(f"PRICING INTELLIGENCE REPORT")
    print(f"{'='*60}")
    
    # Summary
    c.execute("SELECT COUNT(*) FROM clinics")
    clinic_count = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM pricing")
    pricing_count = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM js_bundles")
    bundle_count = c.fetchone()[0]
    
    print(f"\nClinics scanned: {clinic_count}")
    print(f"Pricing data points: {pricing_count}")
    print(f"JS bundles analyzed: {bundle_count}")
    
    # Top discounts found
    print(f"\n--- TOP DISCOUNTS FOUND ---")
    c.execute("""
        SELECT c.name, p.procedure_name, p.price_low, p.price_high, p.currency, p.confidence, p.source
        FROM pricing p
        JOIN clinics c ON p.clinic_id = c.id
        WHERE p.price_low > 0
        ORDER BY p.price_low ASC
        LIMIT 20
    """)
    
    for row in c.fetchall():
        name, proc, low, high, currency, conf, source = row
        high_str = f" - ${high:.0f}" if high else ""
        print(f"  ${low:.0f}{high_str} {currency} - {proc[:60]} @ {name} ({conf})")
    
    # Contact info
    print(f"\n--- CLINIC CONTACTS ---")
    c.execute("SELECT name, email, phone, whatsapp, url FROM clinics WHERE email != '' OR phone != ''")
    for row in c.fetchall():
        name, email, phone, whatsapp, url = row
        print(f"  {name}")
        if email: print(f"    Email: {email}")
        if phone: print(f"    Phone: {phone}")
        if whatsapp: print(f"    WhatsApp: {whatsapp[:60]}")
        print(f"    URL: {url}")
    
    # Export to JSON
    c.execute("""
        SELECT c.name, c.url, c.email, c.phone, c.whatsapp, 
               p.procedure_name, p.price_low, p.price_high, p.currency, p.confidence, p.raw_context
        FROM clinics c
        LEFT JOIN pricing p ON c.id = p.clinic_id
        ORDER BY c.name, p.price_low
    """)
    
    rows = c.fetchall()
    clinics_data = {}
    for row in rows:
        name, url, email, phone, whatsapp, proc, low, high, currency, conf, ctx = row
        if name not in clinics_data:
            clinics_data[name] = {
                'url': url,
                'email': email,
                'phone': phone,
                'whatsapp': whatsapp,
                'pricing': []
            }
        if proc:
            clinics_data[name]['pricing'].append({
                'procedure': proc,
                'price_low': low,
                'price_high': high,
                'currency': currency,
                'confidence': conf,
                'context': ctx[:200] if ctx else None
            })
    
    output_path = os.path.join(os.path.dirname(__file__), 'pricing_intel_export.json')
    with open(output_path, 'w') as f:
        json.dump(clinics_data, f, indent=2, default=str)
    print(f"\n  [EXPORT] Full data exported to {output_path}")

# ============================================================
# CLI
# ============================================================

def main():
    conn = init_db()
    
    if len(sys.argv) < 2:
        print(__doc__)
        return
    
    command = sys.argv[1]
    
    if command == 'scan':
        if len(sys.argv) >= 3 and sys.argv[2] == '--file':
            filepath = sys.argv[3]
            with open(filepath) as f:
                urls = [line.strip() for line in f if line.strip() and not line.startswith('#')]
            print(f"Scanning {len(urls)} clinics from file...")
            for url in urls:
                scan_clinic(url, conn)
                time.sleep(2)
        elif len(sys.argv) >= 3:
            url = sys.argv[2]
            if not url.startswith('http'):
                url = 'https://' + url
            scan_clinic(url, conn)
        else:
            print("Usage: python price_intel_engine.py scan <url>")
            print("       python price_intel_engine.py scan --file clinics.txt")
    
    elif command == 'extract-js':
        if len(sys.argv) >= 3:
            results, error = extract_pricing_from_bundle(sys.argv[2])
            if error:
                print(f"Error: {error}")
            else:
                print(json.dumps(results, indent=2, default=str))
        else:
            print("Usage: python price_intel_engine.py extract-js <bundle_url>")
    
    elif command == 'submit-form':
        if len(sys.argv) >= 3:
            url = sys.argv[3] if len(sys.argv) >= 4 else sys.argv[2]
            name = sys.argv[2] if len(sys.argv) >= 4 else "Test Clinic"
            forms = find_contact_forms(url)
            print(f"Found {len(forms)} forms. Submitting first...")
            if forms:
                result = submit_pricing_inquiry(forms[0], name, url)
                print(json.dumps(result, indent=2))
        else:
            print("Usage: python price_intel_engine.py submit-form <url>")
    
    elif command == 'database':
        if len(sys.argv) >= 3 and sys.argv[2] == '--report':
            generate_report(conn)
        elif len(sys.argv) >= 3 and sys.argv[2] == '--clear':
            confirm = input("Clear all data? (yes/no): ")
            if confirm == 'yes':
                c = conn.cursor()
                c.execute("DELETE FROM pricing")
                c.execute("DELETE FROM js_bundles")
                c.execute("DELETE FROM form_submissions")
                c.execute("DELETE FROM clinics")
                conn.commit()
                print("Database cleared.")
        else:
            print("Usage: python price_intel_engine.py database --report")
            print("       python price_intel_engine.py database --clear")
    
    else:
        print(f"Unknown command: {command}")
        print(__doc__)

if __name__ == '__main__':
    main()
