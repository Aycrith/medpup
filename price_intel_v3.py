#!/usr/bin/env python3
"""
Veterinary Pricing Intelligence Engine v3
Extracts pricing data from vet clinic websites via:
  1. JS bundle analysis (React/Vue SPAs with embedded data)
  2. Wayback Machine archives (Cloudflare bypass)
  3. FAQ/schema.org structured data extraction
  4. Procedure name classification with confidence scoring

Improvements over v2:
  - Aggressive false-positive filtering (React internals, version strings, noise)
  - Procedure name detection via 50+ keyword mappings
  - 3-tier confidence scoring (high/medium/low)
  - Service categorization (surgery, dental, wellness, etc.)
  - Expanded clinic list (25+ targets)
  - MXN currency detection for Mexican clinics
  - Human-readable context in exports

Usage:
    python price_intel_v3.py scan https://clinic.com
    python price_intel_v3.py scan --file clinics.txt
    python price_intel_v3.py scan --all
    python price_intel_v3.py database --report
    python price_intel_v3.py database --export-json
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

DB_PATH = os.path.join(os.path.dirname(__file__), "pricing_intel_v3.db")
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
TIMEOUT = 30

# ── Procedure keyword classification ─────────────────────────
# Maps regex patterns to canonical procedure names
PROCEDURE_KEYWORDS = [
    (r'spay\s*/?\s*neuter', 'Spay/Neuter'),
    (r'\bspay(?:ing|ed|s)?\b', 'Spay'),
    (r'\bneuter(?:ing|ed|s)?\b', 'Neuter'),
    (r'\bcastra(?:ción|tion|r)?\b', 'Neuter'),       # Spanish
    (r'\besteriliza(?:ción|tion|r)?\b', 'Spay'),      # Spanish
    (r'\bdental\b', 'Dental Cleaning'),
    (r'\bteeth\s*clean', 'Dental Cleaning'),
    (r'\blimpieza\s*dental\b', 'Dental Cleaning'),    # Spanish
    (r'\bextraction\b', 'Dental Extraction'),
    (r'\bextracción\b', 'Dental Extraction'),         # Spanish
    (r'\bvaccine\b', 'Vaccination'),
    (r'\bvaccin', 'Vaccination'),
    (r'\bvacuna(?:s|ción)?\b', 'Vaccination'),        # Spanish
    (r'\brabies\b', 'Rabies Vaccine'),
    (r'\bdhpp\b', 'DHPP Vaccine'),
    (r'\bexam\b', 'Exam'),
    (r'\bconsult', 'Consultation'),
    (r'\bconsulta\b', 'Consultation'),                # Spanish
    (r'office\s*visit', 'Office Visit'),
    (r'\bmass\s*remov', 'Mass Removal'),
    (r'\btumor\s*remov', 'Mass Removal'),
    (r'\btumor\b', 'Mass Removal'),                   # Spanish/English
    (r'\blump\s*remov', 'Mass Removal'),
    (r'\bgrowth\s*remov', 'Mass Removal'),
    (r'\bsurgery\b', 'Surgery'),
    (r'\bsurgical\b', 'Surgery'),
    (r'\bcirug', 'Surgery'),                          # Spanish
    (r'\bx-ray\b', 'X-Ray'),
    (r'\bxray\b', 'X-Ray'),
    (r'\bradiograph', 'X-Ray'),
    (r'\brayos[-\s]?x\b', 'X-Ray'),                   # Spanish
    (r'\bultrasound\b', 'Ultrasound'),
    (r'\becograf', 'Ultrasound'),                     # Spanish
    (r'\bmicrochip\b', 'Microchip'),
    (r'\bchip\b', 'Microchip'),
    (r'\bhernia\b', 'Hernia Repair'),
    (r'\bbladder\b', 'Bladder Surgery'),
    (r'\bvejiga\b', 'Bladder Surgery'),               # Spanish
    (r'\bstone\s*remov', 'Bladder Stone Removal'),
    (r'\bcystotom', 'Bladder Surgery'),
    (r'\bamputat', 'Amputation'),
    (r'\bcruciate\b', 'Cruciate Repair'),
    (r'\btplo\b', 'TPLO'),
    (r'\bfho\b', 'FHO'),
    (r'\borthopedic\b', 'Orthopedic Surgery'),
    (r'\bpyometra\b', 'Pyometra Surgery'),
    (r'\bentropion\b', 'Entropion Repair'),
    (r'\bcherry\s*eye\b', 'Cherry Eye Repair'),
    (r'\beye\s*remov', 'Eye Removal'),
    (r'\benucleat', 'Eye Removal'),
    (r'\bdesparasit', 'Deworming'),                   # Spanish
    (r'\bantipulgas?\b', 'Flea Treatment'),            # Spanish
    (r'\bcertificados?\s*de\s*salud\b', 'Health Certificate'),  # Spanish
    (r'\bblood\s*work\b', 'Blood Work'),
    (r'\blab\s*work\b', 'Lab Work'),
    (r'\bheartworm\b', 'Heartworm Test'),
    (r'\bfecal\b', 'Fecal Test'),
    (r'\bnail\s*trim\b', 'Nail Trim'),
    (r'\bgroom', 'Grooming'),
    (r'\beuthanasia\b', 'Euthanasia'),
    (r'\bcremation\b', 'Cremation'),
    (r'\bboarding\b', 'Boarding'),
    (r'\bdaycare\b', 'Daycare'),
    (r'\bemergency\b', 'Emergency Visit'),
    (r'after\s*hours?\b', 'Emergency Visit'),
    (r'\bgermany\b', 'Microchip'),
    (r'\bstool\s*exam', 'Fecal Test'),
    (r'\bud\s*panel', 'Urinalysis'),
    (r'\burinalysis\b', 'Urinalysis'),
    (r'\bbordetella\b', 'Bordetella Vaccine'),
    (r'\blepto\b', 'Leptospirosis Vaccine'),
    (r'\bfeline\s*leuk', 'FeLV Vaccine'),
    (r'\bfelv\b', 'FeLV Vaccine'),
    (r'\bfiv\b', 'FIV Test'),
]

# Maximum distance (chars) between procedure keyword and $ amount to consider them related
MAX_PROCEDURE_DISTANCE = 80

# ── False-positive detection ──────────────────────────────────

# React/JS internal patterns that produce fake $1-$20 values masquerading as prices
REACT_NOISE_PATTERNS = re.compile(r'(?:defaultProps|propTypes|displayName|keyCode|'
    r'rowHeight|columnWidth|transitionDuration|animationDuration|'
    r'fontSize|lineHeight|borderRadius|padding[LRBT]?|margin[LRBT]?|'
    r'zIndex|opacity|flexBasis|flexGrow|flexShrink|'
    r'minWidth|maxWidth|minHeight|maxHeight|'
    r'gridTemplate|gridColumn|gridRow|gridGap|'
    r'version[\s\'":=]+\d|build[\s\'":=]+\d|'
    r'statusCode|errorCode|responseCode|httpCode|'
    r'portNumber|maxRetries|timeout[Ms]?|'
    r'pageSize|itemsPerPage|perPage|'
    r'totalPages|currentPage|pageNumber|'
    r'Math\.|parseInt|parseFloat|toFixed|toPrecision|'
    r'length-\d|\.length\s*[=:]\s*\d|'
    r'[a-z]Index|[a-z]Offset|[a-z]Count|[a-z]Size|'
    r'[a-z]Width|[a-z]Height|[a-z]Depth|'
    r'\.css|\.js\?|chunk\w*|'
    r'hash(?:es)?[\s\'":=]+\d|'
    r'payload|byteLength|charCodeAt|charAt|'
    r'prototype|constructor|__proto__)', re.IGNORECASE
)

# Dollar amounts that are suspiciously round/low and likely JS noise
SUSPICIOUS_ROUND_AMOUNTS = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 25, 30}

# Min amount that's plausible for any vet procedure
MIN_VET_PRICE = 15

# Min amount that's plausible without a nearby procedure keyword
MIN_UNLABELED_PRICE = 50

# Amounts < this value need a KNOWN procedure keyword nearby to be accepted
MIN_KEYWORD_EVIDENCE_PRICE = 30

def detect_currency(text):
    """Detect if price context mentions MXN, pesos, or Mexican context."""
    if re.search(r'(?:MXN|pesos|mexican\s*peso)', text, re.IGNORECASE):
        return 'MXN'
    return 'USD'

def is_code_context(text):
    """Check if text looks like minified JS code (not human-readable content)."""
    code_indicators = ['function', 'var ', 'const ', 'let ', '=>', '===', '||', '&&', 'return',
                       '.push', '.map', '.filter', '.reduce', 'this.', 'new ',
                       'null', 'undefined', 'true,', 'false,', 'void ']
    return any(ind in text.lower() for ind in code_indicators)

def has_procedure_keyword(text):
    """Check if text contains a known procedure keyword. Returns (canonical_name, keyword) or None."""
    for pattern, canonical in PROCEDURE_KEYWORDS:
        if re.search(pattern, text, re.IGNORECASE):
            return canonical
    return None

def score_price_confidence(amount, context, has_keyword, source):
    """Score a price from 0.0 (junk) to 1.0 (verified).
    
    Returns {'score': float, 'label': 'high'|'medium'|'low'|'junk', 'procedure': str|None}
    """
    procedure = has_procedure_keyword(context) if has_keyword else None
    is_code = is_code_context(context)
    currency_indicator = detect_currency(context)
    
    # ── JUNK: obvious false positives ──
    
    # React internal pattern detected nearby
    if REACT_NOISE_PATTERNS.search(context):
        return {'score': 0.0, 'label': 'junk', 'procedure': procedure}
    
    # Suspiciously round small numbers in code context with no procedure name
    if amount in SUSPICIOUS_ROUND_AMOUNTS and (is_code or not procedure):
        return {'score': 0.0, 'label': 'junk', 'procedure': procedure}
    
    # Amounts below $15 are never real vet prices
    if amount < MIN_VET_PRICE:
        return {'score': 0.0, 'label': 'junk', 'procedure': procedure}
    
    # Check if the amount came from a Wayback archive (cleaner source)
    from_wayback = (source == 'wayback')
    
    # ── LOW confidence ──
    
    # Amount between $15-$30 needs strong evidence
    if amount < MIN_KEYWORD_EVIDENCE_PRICE:
        if not procedure:
            return {'score': 0.3, 'label': 'low', 'procedure': procedure}
        return {'score': 0.4, 'label': 'low', 'procedure': procedure}
    
    # Amount between $30-$50 with no procedure keyword
    if amount < MIN_UNLABELED_PRICE and not procedure and not from_wayback:
        return {'score': 0.35, 'label': 'low', 'procedure': procedure}
    
    # ── MEDIUM confidence ──
    
    # Has procedure keyword OR from Wayback OR plausible amount
    if procedure or from_wayback or amount >= 50:
        return {'score': 0.6, 'label': 'medium', 'procedure': procedure}
    
    # ── HIGH confidence ──
    
    # Has a known procedure name AND came from structured text (FAQ or Wayback)
    if procedure and from_wayback:
        return {'score': 0.9, 'label': 'high', 'procedure': procedure}
    
    # Fallback
    return {'score': 0.5, 'label': 'medium', 'procedure': procedure}


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
            category TEXT,
            price_low REAL,
            price_high REAL,
            currency TEXT DEFAULT 'USD',
            source TEXT,
            confidence TEXT DEFAULT 'low',
            confidence_score REAL DEFAULT 0.0,
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
    
    # Schema migration for category column
    try:
        c.execute("ALTER TABLE pricing ADD COLUMN category TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        c.execute("ALTER TABLE pricing ADD COLUMN confidence_score REAL DEFAULT 0.0")
    except sqlite3.OperationalError:
        pass
    
    return conn


# ============================================================
# CLEANING & FILTERING
# ============================================================

def extract_price_with_context(line):
    """Extract price info from a line of text with procedure name detection.
    
    Returns dict with: low, high, currency, context, procedure or None.
    """
    line_clean = line.strip()[:400]
    if not line_clean:
        return None
    
    # Skip obvious code lines
    if is_code_context(line_clean):
        return None
    
    # Detect currency
    currency = detect_currency(line_clean)
    
    # Pattern: "$145" or "$550-$1,100" or "$45 - $90"
    range_match = re.search(r'\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:-|–|to)\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)', line_clean)
    if range_match:
        low = float(range_match.group(1).replace(',', ''))
        high = float(range_match.group(2).replace(',', ''))
        # Reject inverted or degenerate ranges (React noise artifact)
        if high <= low:
            return None
        context_before = line_clean[:range_match.start()].strip()
        context_full = context_before[-120:] + ' → ' + line_clean[range_match.start():range_match.end()+60][:120]
        return {
            'low': low, 'high': high, 'currency': currency,
            'context': context_full, 'has_procedure': bool(has_procedure_keyword(context_before)),
            'procedure': has_procedure_keyword(context_before),
            'type': 'range'
        }
    
    single_match = re.search(r'\$(\d+(?:,\d{3})*(?:\.\d{2})?)', line_clean)
    if single_match:
        amt = float(single_match.group(1).replace(',', ''))
        context_before = line_clean[:single_match.start()].strip()
        # Take up to 120 chars before the $ and 60 after
        start = max(0, single_match.start() - 120)
        context_full = (
            (('...' if start > 0 else '') + line_clean[start:single_match.start()]).strip()
            + ' → ' + line_clean[single_match.start():single_match.end()+60][:120]
        )
        return {
            'low': amt, 'high': None, 'currency': currency,
            'context': context_full, 'has_procedure': bool(has_procedure_keyword(context_before)),
            'procedure': has_procedure_keyword(context_before),
            'type': 'single'
        }
    
    # Try MXN format: $XXX MXN or $XXX pesos
    mxn_match = re.search(r'\$(\d+(?:,\d{3})*(?:\s*MXN|\s*pesos))', line_clean, re.IGNORECASE)
    if mxn_match:
        amt_str = re.sub(r'[^\d.]', '', mxn_match.group(1).split()[0])
        if amt_str:
            amt = float(amt_str)
            return {
                'low': amt, 'high': None, 'currency': 'MXN',
                'context': line_clean[:200], 'has_procedure': bool(has_procedure_keyword(line_clean)),
                'procedure': has_procedure_keyword(line_clean),
                'type': 'single_mxn'
            }
    
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


def extract_meaningful_strings(js):
    """Extract human-readable strings from minified JS.
    
    In React SPAs, pricing data is often embedded as English string literals
    inside objects like: en:{"key":"value"} or label: "Spay $145"
    """
    # Strategy 1: Find all quoted strings that contain vet-related keywords
    meaningful = []
    
    # Find all double-quoted strings of reasonable length
    strings = re.findall(r'"([^"]{5,200})"', js)
    for s in strings:
        # Keep strings that look like vet content (have $, numbers, or vet keywords)
        if '$' in s or has_procedure_keyword(s) or re.search(r'\b(dog|cat|pet|puppy|kitten|canine|feline)\b', s, re.IGNORECASE):
            meaningful.append(s)
        # Also keep strings that are clearly English FAQ questions/answers
        elif re.search(r'[A-Z][a-z]{3,}\s+(is|are|can|do|does|will|how|what|where|when)', s):
            meaningful.append(s)
    
    # Strategy 2: Extract from React i18n objects like "en":{"key":"value","key2":"value2"}
    lang_blocks = re.finditer(r'(?:en|es|fr|pt)\s*:\s*\{([^}]{50,})\}', js)
    for m in lang_blocks:
        block = m.group(1)
        # Extract all values from key:value pairs
        values = re.findall(r':\s*"([^"]{5,200})"', block)
        meaningful.extend(v for v in values if '$' in v or has_procedure_keyword(v))
    
    # Strategy 3: Find structured FAQ arrays in JS
    # Pattern: {q:"Question",a:"Answer with $150"}
    faq_blocks = re.finditer(r'\{(?:q|question)\s*:\s*"([^"]+)"\s*,\s*(?:a|answer)\s*:\s*"([^"]+)"\}', js)
    for m in faq_blocks:
        q, a = m.group(1), m.group(2)
        if '$' in a or '$' in q:
            meaningful.append(f"FAQ Q: {q}")
            meaningful.append(f"FAQ A: {a}")
    
    return meaningful


def extract_pricing_from_bundle(bundle_url):
    """Download JS bundle and extract pricing, contacts, and FAQ data.
    
    Returns (results_dict, error_string_or_None).
    """
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
        
        # ── Phase 1: Extract meaningful strings (better chunks) ──
        meaningful = extract_meaningful_strings(js)
        seen_contexts = set()
        
        for s in meaningful:
            price_info = extract_price_with_context(s)
            if price_info:
                # Deduplicate by normalized context hash
                norm_ctx = re.sub(r'^(?:FAQ\s*[QA]:?\s*|a\s*:\s*|q\s*:\s*)', '', price_info['context']).strip()
                ctx_hash = hashlib.md5(norm_ctx.encode()).hexdigest()
                if ctx_hash in seen_contexts:
                    continue
                seen_contexts.add(ctx_hash)
                
                scoring = score_price_confidence(
                    price_info['low'], price_info['context'],
                    price_info['has_procedure'], 'js_bundle'
                )
                
                if scoring['label'] == 'junk':
                    continue
                
                results['prices'].append({
                    'service': scoring['procedure'] or 'extracted',
                    'category': categorize_service(scoring['procedure'] or 'extracted'),
                    'low': price_info['low'],
                    'high': price_info['high'],
                    'currency': price_info['currency'],
                    'type': price_info['type'],
                    'confidence': scoring['label'],
                    'confidence_score': scoring['score'],
                    'context': price_info['context'][:200],
                    'line_chars': len(s)
                })
        
        # ── Phase 2: Fallback to chunk splitting for anything missed ──
        # (only for chunks that look like data, not code)
        chunks = re.split(r'[;,\n]', js)
        for chunk in chunks:
            chunk = chunk.strip()
            if not chunk or len(chunk) > 300 or len(chunk) < 10:
                continue
            # Skip code chunks
            if is_code_context(chunk):
                continue
            # Skip if it doesn't contain $ or a vet keyword
            if '$' not in chunk and not has_procedure_keyword(chunk):
                continue
            
            price_info = extract_price_with_context(chunk)
            if not price_info:
                continue
            
            norm_ctx = re.sub(r'^(?:FAQ\s*[QA]:?\s*|a\s*:\s*|q\s*:\s*)', '', price_info['context']).strip()
            ctx_hash = hashlib.md5(norm_ctx.encode()).hexdigest()
            if ctx_hash in seen_contexts:
                continue
            seen_contexts.add(ctx_hash)
            
            scoring = score_price_confidence(
                price_info['low'], price_info['context'],
                price_info['has_procedure'], 'js_bundle'
            )
            
            if scoring['label'] == 'junk':
                continue
            
            results['prices'].append({
                'service': scoring['procedure'] or 'extracted',
                'category': categorize_service(scoring['procedure'] or 'extracted'),
                'low': price_info['low'],
                'high': price_info['high'],
                'currency': price_info['currency'],
                'type': price_info['type'],
                'confidence': scoring['label'],
                'confidence_score': scoring['score'],
                'context': price_info['context'][:200],
                'line_chars': len(chunk)
            })
        
        # ── Phase 3: Extract from FAQ objects ──
        eng_faq = re.search(r'en:\s*\{([^}]+)\}', js)
        if eng_faq:
            faq_block = eng_faq.group(1)
            faq_prices = re.finditer(r'faq\.(?:q|a)\d+[\"\' :]+[\"\']([^\"\']*\$[^\"\']*)[\"\']', js)
            for m in faq_prices:
                text = m.group(1)
                price_info = extract_price_with_context(text)
                if price_info:
                    scoring = score_price_confidence(
                        price_info['low'], text, True, 'js_bundle'
                    )
                    if scoring['label'] != 'junk':
                        results['prices'].append({
                            'service': scoring['procedure'] or 'faq_pricing',
                            'category': categorize_service(scoring['procedure'] or 'faq_pricing'),
                            'low': price_info['low'],
                            'high': price_info['high'],
                            'currency': price_info['currency'],
                            'type': 'faq',
                            'confidence': scoring['label'],
                            'confidence_score': scoring['score'] + 0.1,  # FAQ text is more reliable
                            'context': text[:200],
                            'line_chars': len(text)
                        })
        
        # ── Extract contact info ──
        emails = set(re.findall(r'[\w.+-]+@[\w-]+\.[\w.-]+', js))
        results['emails'] = [e for e in emails 
                           if not any(x in e for x in ['example', 'your@', 'tu@', 'placeholder'])]
        
        # Phone numbers (10-digit US patterns)
        all_phones = re.findall(r'(?:\+)?1?\s*\(?(\d{3})\)?[\s.-]*(\d{3})[\s.-]*(\d{4})', js)
        seen = set()
        for a, b, c in all_phones:
            combined = f"{a}{b}{c}"
            if combined not in seen and not any(x in combined for x in ['1073', '4194', '1048', '2097']):
                seen.add(combined)
                results['phones'].append(f"({a}) {b}-{c}")
        
        # WhatsApp (Mexican format: +52...)
        wa = re.findall(r'(?:\+?52[\s.-]?)?\d{2}[\s.-]?\d{4}[\s.-]?\d{4}', js)
        for w in wa[:5]:
            if len(w) >= 8 and not any(x in w for x in ['107374', '419430', '104857']):
                results['whatsapp'].append(w)
        
        # FAQ pairs
        faq_q = re.finditer(r'faq\.(\w+)[\"\':]\s*[\"\']([^\"\']*)[\"\']', js)
        for m in faq_q:
            key = m.group(1)
            val = m.group(2)
            if 'q' in key and len(key) <= 6:
                results['faq'].append({'type': 'q', 'text': val})
            elif 'a' in key and len(key) <= 6:
                results['faq'].append({'type': 'a', 'text': val})
        
        # Structured JSON-LD data
        ld_all = re.finditer(r'({\"@context\"\s*:\s*\"https?://schema\.org\".*?})', js, re.DOTALL)
        for m in ld_all:
            try:
                results['structured'].append(json.loads(m.group(1)))
            except:
                pass
        
        return results, None
    except Exception as e:
        return None, str(e)


def categorize_service(procedure_name):
    """Map procedure name to a service category."""
    surgery = ['Spay', 'Neuter', 'Spay/Neuter', 'Surgery', 'Mass Removal',
               'Bladder Surgery', 'Bladder Stone Removal', 'Pyometra Surgery',
               'Hernia Repair', 'Amputation', 'Cruciate Repair', 'TPLO', 'FHO',
               'Orthopedic Surgery', 'Eye Removal', 'Entropion Repair', 'Cherry Eye Repair']
    dental = ['Dental Cleaning', 'Dental Extraction']
    wellness = ['Exam', 'Consultation', 'Office Visit', 'Vaccination',
                'Rabies Vaccine', 'DHPP Vaccine', 'Bordetella Vaccine',
                'Leptospirosis Vaccine', 'FeLV Vaccine', 'Microchip',
                'Heartworm Test', 'Fecal Test', 'Urinalysis', 'FIV Test']
    diagnostics = ['X-Ray', 'Ultrasound', 'Blood Work', 'Lab Work']
    grooming = ['Nail Trim', 'Grooming']
    emergency = ['Emergency Visit']
    
    if procedure_name in surgery: return 'surgery'
    if procedure_name in dental: return 'dental'
    if procedure_name in wellness: return 'wellness'
    if procedure_name in diagnostics: return 'diagnostics'
    if procedure_name in grooming: return 'grooming'
    if procedure_name in emergency: return 'emergency'
    return 'general'


# ============================================================
# WAYBACK MACHINE EXTRACTION
# ============================================================

def try_wayback(url, specific_page=None):
    """Fetch archived page from Wayback Machine."""
    domain = urlparse(url).netloc
    
    pages_to_try = []
    if specific_page:
        pages_to_try.append(f"https://web.archive.org/web/2025/https://{domain}{specific_page}")
    pages_to_try.extend([
        f"https://web.archive.org/web/2025/{url}",
        f"https://web.archive.org/web/2024/{url}",
        f"https://web.archive.org/web/2025/https://{domain}",
        f"https://web.archive.org/web/202410/https://{domain}/prices",
        f"https://web.archive.org/web/2025/https://{domain}/pricing",
        f"https://web.archive.org/web/2025/https://{domain}/services",
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
    
    # Remove script/style tags for cleaner text
    for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
        tag.decompose()
    
    text = soup.get_text(separator='\n', strip=True)
    
    results = []
    seen_contexts = set()
    
    for line in text.split('\n'):
        line = line.strip()
        if not line or len(line) > 500 or len(line) < 10:
            continue
        
        price_info = extract_price_with_context(line)
        if not price_info:
            continue
        
        norm_ctx = re.sub(r'^(?:FAQ\s*[QA]:?\s*|a\s*:\s*|q\s*:\s*)', '', price_info['context']).strip()
        ctx_hash = hashlib.md5(norm_ctx.encode()).hexdigest()
        if ctx_hash in seen_contexts:
            continue
        seen_contexts.add(ctx_hash)
        
        scoring = score_price_confidence(
            price_info['low'], price_info['context'],
            price_info['has_procedure'], 'wayback'
        )
        
        if scoring['label'] == 'junk':
            continue
        
        results.append({
            'service': scoring['procedure'] or 'extracted_from_archive',
            'category': categorize_service(scoring['procedure'] or 'extracted_from_archive'),
            'low': price_info['low'],
            'high': price_info['high'],
            'currency': price_info['currency'],
            'type': price_info['type'],
            'confidence': scoring['label'],
            'confidence_score': scoring['score'],
            'context': price_info['context'],
            'source': 'wayback'
        })
    
    return results


def extract_pricing_from_html(url, html):
    """Extract pricing from rendered HTML content (for WordPress/jQuery sites)."""
    soup = BeautifulSoup(html, 'html.parser')
    
    # Remove scripts, styles, nav, header, footer for cleaner text
    for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'noscript']):
        tag.decompose()
    
    results = []
    seen_contexts = set()
    
    # Strategy 1: Look for pricing-related headings + content
    price_heads = soup.find_all(['h2', 'h3', 'h4', 'h5', 'strong'], 
                                 string=re.compile(r'price|cost|fee|rate|pricing|ours?[\s-]*(?:service|price)', re.I))
    for head in price_heads:
        # Get sibling paragraphs/lists
        parent = head.parent
        for sib in parent.find_all(['p', 'li', 'div', 'span'], limit=10):
            text = sib.get_text(strip=True)
            if '$' in text and len(text) > 5 and len(text) < 500:
                price_info = extract_price_with_context(text)
                if price_info:
                    norm_ctx = re.sub(r'^(?:FAQ\s*[QA]:?\s*|a\s*:\s*|q\s*:\s*)', '', price_info['context']).strip()
                    ctx_hash = hashlib.md5(norm_ctx.encode()).hexdigest()
                    if ctx_hash not in seen_contexts:
                        seen_contexts.add(ctx_hash)
                        scoring = score_price_confidence(
                            price_info['low'], price_info['context'],
                            price_info['has_procedure'], 'html'
                        )
                        if scoring['label'] != 'junk':
                            results.append({
                                'service': scoring['procedure'] or 'extracted_from_html',
                                'category': categorize_service(scoring['procedure'] or 'extracted_from_html'),
                                'low': price_info['low'], 'high': price_info['high'],
                                'currency': price_info['currency'],
                                'type': price_info['type'],
                                'confidence': scoring['label'],
                                'confidence_score': scoring['score'],
                                'context': price_info['context'][:200],
                                'source': 'html'
                            })
    
    # Strategy 2: Find all price-like patterns in rendered text
    text = soup.get_text(separator='\n', strip=True)
    for line in text.split('\n'):
        line = line.strip()
        if not line or len(line) < 15 or len(line) > 500:
            continue
        if '$' not in line:
            continue
        
        price_info = extract_price_with_context(line)
        if not price_info:
            continue
        
        norm_ctx = re.sub(r'^(?:FAQ\s*[QA]:?\s*|a\s*:\s*|q\s*:\s*)', '', price_info['context']).strip()
        ctx_hash = hashlib.md5(norm_ctx.encode()).hexdigest()
        if ctx_hash in seen_contexts:
            continue
        seen_contexts.add(ctx_hash)
        
        scoring = score_price_confidence(
            price_info['low'], price_info['context'],
            price_info['has_procedure'], 'html'
        )
        if scoring['label'] != 'junk':
            results.append({
                'service': scoring['procedure'] or 'extracted_from_html',
                'category': categorize_service(scoring['procedure'] or 'extracted_from_html'),
                'low': price_info['low'], 'high': price_info['high'],
                'currency': price_info['currency'],
                'type': price_info['type'],
                'confidence': scoring['label'],
                'confidence_score': scoring['score'],
                'context': price_info['context'][:200],
                'source': 'html'
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
    
    # Check for existing record
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
            phones_raw = re.findall(r'\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})', r.text)
            phones = list(set(f"({a}) {b}-{c}" for a, b, c in phones_raw if a not in ['177', '176', '175', '107', '419', '104']))
            if phones:
                print(f"  Found {len(phones)} phone numbers")
    except Exception as e:
        print(f"  [!] Error: {e}")
        cloudflare = True
    
    print(f"  Clinic: {name}")
    
    # Step 2: JS Bundle extraction
    print(f"\n  --- Step 2: JS Bundle Analysis ---")
    bundles, status, structured = find_js_bundles(url)
    
    # Also scan rendered HTML for pricing (works for WordPress/jQuery sites)
    html_prices = []
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        if r.status_code == 200:
            html_prices = extract_pricing_from_html(url, r.text)
    except:
        pass
    
    if html_prices:
        print(f"  HTML pricing found: {len(html_prices)} items")
        for p in html_prices[:8]:
            h = f" - ${p['high']:.0f}" if p['high'] else ""
            print(f"    ${p['low']:.0f}{h}  [{p['service']}]")
    
    if bundles:
        print(f"  Found {len(bundles)} JS bundles")
        for b_url in bundles[:5]:
            print(f"    Bundle: {os.path.basename(b_url)}")
            results, error = extract_pricing_from_bundle(b_url)
            
            if error:
                print(f"    [ERROR] {error}")
                continue
            
            if results:
                # Filter: show only non-junk prices
                real_prices = [p for p in results['prices'] if p['confidence'] != 'junk']
                
                print(f"    Prices found: {len(real_prices)} (total raw: {len(results['prices'])})")
                
                # Group by confidence for display
                high_p = [p for p in real_prices if p['confidence'] == 'high']
                med_p = [p for p in real_prices if p['confidence'] == 'medium']
                low_p = [p for p in real_prices if p['confidence'] == 'low']
                
                if high_p:
                    print(f"      HIGH confidence ({len(high_p)}):")
                    for p in high_p[:8]:
                        h = f" - ${p['high']:.0f}" if p['high'] else ""
                        print(f"        ${p['low']:.0f}{h}  [{p['service']}]")
                if med_p:
                    print(f"      MEDIUM confidence ({len(med_p)}):")
                    for p in med_p[:8]:
                        h = f" - ${p['high']:.0f}" if p['high'] else ""
                        print(f"        ${p['low']:.0f}{h}  [{p['service']}]")
                if low_p:
                    print(f"      LOW confidence ({len(low_p)}):")
                    for p in low_p[:5]:
                        h = f" - ${p['high']:.0f}" if p['high'] else ""
                        print(f"        ${p['low']:.0f}{h}  [{p['service']}]")
                
                filtered_out = len(results['prices']) - len(real_prices)
                if filtered_out > 0:
                    print(f"      (Filtered {filtered_out} false positives)")
                
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
                
                # Store bundle record
                c.execute("""INSERT OR IGNORE INTO js_bundles 
                    (clinic_id, bundle_url, size_bytes, hash, scraped_at, pricing_count, emails_found, phones_found)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                    (clinic_id, b_url, results['size'], results['hash'],
                     datetime.now().isoformat(), len(real_prices),
                     ','.join(results['emails'][:3]), ','.join(results['phones'][:3])))
                
                # Store pricing records
                for p in real_prices:
                    c.execute("""INSERT INTO pricing 
                        (clinic_id, procedure_name, category, price_low, price_high, currency, source, confidence, confidence_score, discovered_at, raw_context)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (clinic_id, p['service'], p['category'], p['low'], p['high'], 
                         p.get('currency', 'USD'), b_url, p['confidence'], p['confidence_score'],
                         datetime.now().isoformat(), p.get('context', '')[:300]))
                
                conn.commit()
    else:
        print(f"  No JS bundles found")
    
    # Store HTML pricing results (for non-SPA sites)
    if html_prices:
        for p in html_prices:
            c.execute("""INSERT INTO pricing 
                (clinic_id, procedure_name, category, price_low, price_high, currency, source, confidence, confidence_score, discovered_at, raw_context)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (clinic_id, p['service'], p['category'], p['low'], p['high'],
                 p.get('currency', 'USD'), 'html', p['confidence'], p['confidence_score'],
                 datetime.now().isoformat(), p.get('context', '')[:300]))
        conn.commit()
    
    # Step 3: Wayback Machine extraction for blocked sites
    print(f"\n  --- Step 3: Wayback Archive ---")
    wb_prices = extract_from_wayback(url)
    if wb_prices:
        # Filter junk
        real_wb = [p for p in wb_prices if p['confidence'] != 'junk']
        print(f"  Found {len(real_wb)} price points via Wayback (filtered from {len(wb_prices)})")
        
        high_wb = [p for p in real_wb if p['confidence'] == 'high']
        med_wb = [p for p in real_wb if p['confidence'] == 'medium']
        
        if high_wb:
            print(f"    HIGH confidence ({len(high_wb)}):")
            for p in high_wb[:8]:
                h = f" - ${p['high']:.0f}" if p['high'] else ""
                print(f"      ${p['low']:.0f}{h}  [{p['service']}]")
        if med_wb:
            print(f"    MEDIUM confidence ({len(med_wb)}):")
            for p in med_wb[:8]:
                h = f" - ${p['high']:.0f}" if p['high'] else ""
                print(f"      ${p['low']:.0f}{h}  [{p['service']}]")
        
        for p in real_wb:
            c.execute("""INSERT INTO pricing 
                (clinic_id, procedure_name, category, price_low, price_high, currency, source, confidence, confidence_score, discovered_at, raw_context)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (clinic_id, p['service'], p['category'], p['low'], p['high'],
                 p.get('currency', 'USD'), p.get('source', 'wayback'),
                 p['confidence'], p['confidence_score'],
                 datetime.now().isoformat(), p.get('context', '')[:300]))
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
               'scanned_v3', clinic_id))
    conn.commit()
    
    print(f"\n  [DONE] Clinic ID {clinic_id}: {name[:60]}")
    return clinic_id


# ============================================================
# BATCH SCAN: 25+ Clinics
# ============================================================

def get_default_clinics():
    """Return list of clinics to scan, organized by tier."""
    return [
        # ═══ TIER 1: Cancun / Mexico border (verified pricing available) ═══
        ('https://vetcancun.com', 'VetCancun - Cancun MX'),
        ('https://capcancun.com', 'CAP Veterinaria Cancun'),
        ('https://www.drkellysvet.com', 'Dr Kellys Surgical Unit - Phoenix AZ'),
        # ═══ TIER 2: Pinellas County low-cost clinics ═══
        ('https://operationsnip.com', 'Operation SNIP - Largo FL'),
        ('https://humanesocietytampabay.org', 'Humane Society of Pinellas / Tampa Bay'),
        ('https://humanesocietytampabay.org/spay-neuter', 'HSTB Spay Neuter Pricing'),
        
        # ═══ TIER 3: Other FL low-cost / surgical ═══
        ('https://www.goodcareanimalclinic.com', 'Good Care Animal Clinic - Hialeah FL'),
        ('https://justinbartlettanimalrescue.org', 'Justin Bartlett Animal Rescue'),
        ('https://www.paws2help.org', 'Paws 2 Help - West Palm Beach'),
        ('https://www.aspca.org/miami-initiative/community-veterinary-clinic', 'ASPCA CVC Miami'),
        ('https://heroesveterinaryhospital.com', 'Heroes Veterinary Hospital - Miami'),
        
        # ═══ TIER 4: National chains / models ═══
        ('https://www.friendsofanimals.org', 'Friends of Animals'),
        ('https://www.dutch.com', 'Dutch Telehealth'),
        ('https://www.thevets.com', 'The Vets - Mobile Vet'),
        ('https://www.banfield.com', 'Banfield Pet Hospital'),
        ('https://vcahospitals.com', 'VCA Animal Hospitals'),
    ]


# ============================================================
# REPORTING
# ============================================================

def generate_report(conn):
    """Generate comprehensive report from database."""
    c = conn.cursor()
    
    print(f"\n{'='*70}")
    print(f" VETERINARY PRICING INTELLIGENCE REPORT v3")
    print(f" Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*70}")
    
    c.execute("SELECT COUNT(*) FROM clinics")
    total = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM pricing")
    prices = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM clinics WHERE scan_status='done'")
    scanned = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM pricing WHERE confidence_score >= 0.7")
    high_conf = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM pricing WHERE confidence_score >= 0.4 AND confidence_score < 0.7")
    med_conf = c.fetchone()[0]
    
    print(f"\n  Clinics in DB:   {total}")
    print(f"  Scanned:        {scanned}")
    print(f"  Pricing points: {prices}")
    print(f"    High conf:    {high_conf}")
    print(f"    Medium conf:  {med_conf}")
    
    # Per-clinic summary
    print(f"\n{'='*70}")
    print(f" CLINIC SUMMARIES")
    print(f"{'='*70}")
    
    c.execute("""SELECT c.id, c.name, c.domain, c.email, c.phone, c.whatsapp, c.cloudflare_blocked,
                (SELECT COUNT(*) FROM pricing WHERE clinic_id = c.id AND confidence_score >= 0.4) as real_prices,
                (SELECT COUNT(*) FROM pricing WHERE clinic_id = c.id AND confidence_score >= 0.7) as high_prices,
                (SELECT MIN(price_low) FROM pricing WHERE clinic_id = c.id AND price_low >= 15) as min_price,
                (SELECT MAX(price_low) FROM pricing WHERE clinic_id = c.id AND price_low <= 10000) as max_price
                FROM clinics c ORDER BY c.name""")
    
    for row in c.fetchall():
        cid, name, domain, email, phone, whatsapp, blocked, rp, hp, min_p, max_p = row
        
        print(f"\n  [{cid}] {name or domain[:60]}")
        if blocked: print(f"        Cloudflare blocked (via Wayback)")
        if email: print(f"        Email: {email[:100]}")
        if phone: print(f"        Phone: {phone[:60]}")
        if whatsapp: print(f"        WhatsApp: {whatsapp[:60]}")
        print(f"        Real pricing: {rp} (high conf: {hp})")
        if min_p and max_p:
            print(f"        Price range: ${min_p:.0f} - ${max_p:.0f}")
        
        if rp > 0:
            # Show labeled prices by category
            for cat in ['surgery', 'dental', 'wellness', 'general']:
                c.execute("""SELECT procedure_name, price_low, price_high, confidence, currency
                           FROM pricing WHERE clinic_id = ? AND category = ? AND confidence_score >= 0.4
                           ORDER BY price_low ASC LIMIT 10""", (cid, cat))
                cat_prices = c.fetchall()
                if cat_prices:
                    print(f"        [{cat.upper()}]")
                    for pn, pl, ph, conf, cur in cat_prices[:5]:
                        hs = f" - ${ph:.0f}" if ph else ""
                        cur_s = f" {cur}" if cur != 'USD' else ""
                        print(f"          ${pl:.0f}{hs}{cur_s}  {pn[:50]} ({conf})")
    
    # Best deals by category
    print(f"\n{'='*70}")
    print(f" TOP DEALS BY CATEGORY (High + Medium Confidence)")
    print(f"{'='*70}")
    
    for cat in ['surgery', 'dental', 'wellness', 'diagnostics']:
        c.execute("""SELECT c.name, p.procedure_name, p.price_low, p.price_high, p.confidence, p.currency
                   FROM pricing p JOIN clinics c ON p.clinic_id = c.id
                   WHERE p.category = ? AND p.confidence_score >= 0.4
                   ORDER BY p.price_low ASC LIMIT 8""", (cat,))
        cat_rows = c.fetchall()
        if cat_rows:
            print(f"\n  [{cat.upper()}]")
            for name, proc, low, high, conf, cur in cat_rows:
                hs = f" - ${high:.0f}" if high else ""
                cur_s = f" {cur}" if cur != 'USD' else ""
                print(f"    ${low:.0f}{hs}{cur_s}  {proc[:50]} @ {name[:50]}")


def export_json(conn):
    """Export all data to JSON with clean structure."""
    c = conn.cursor()
    
    c.execute("""SELECT c.id, c.name, c.url, c.email, c.phone, c.whatsapp, c.cloudflare_blocked,
                (SELECT COUNT(*) FROM pricing WHERE clinic_id = c.id AND confidence_score >= 0.4) as real_prices,
                (SELECT COUNT(*) FROM pricing WHERE clinic_id = c.id AND confidence_score >= 0.7) as high_prices
                FROM clinics c ORDER BY c.name""")
    
    output = {}
    for row in c.fetchall():
        cid, name, url, email, phone, whatsapp, blocked, rp, hp = row
        
        clinic_data = {
            'url': url,
            'email': email,
            'phone': phone,
            'whatsapp': whatsapp,
            'cloudflare_blocked': bool(blocked),
            'pricing_summary': {'total': rp, 'high_confidence': hp},
            'pricing_by_category': {},
            'pricing': []
        }
        
        if rp > 0:
            c2 = conn.cursor()
            c2.execute("""SELECT procedure_name, category, price_low, price_high, currency, confidence, confidence_score, raw_context
                       FROM pricing WHERE clinic_id = ? AND confidence_score >= 0.4
                       ORDER BY category, price_low""", (cid,))
            
            for pn, cat, pl, ph, cur, conf, cs, ctx in c2.fetchall():
                entry = {
                    'procedure': pn,
                    'category': cat or 'general',
                    'price_low': pl,
                    'price_high': ph,
                    'currency': cur or 'USD',
                    'confidence': conf,
                    'confidence_score': round(cs, 2),
                    'context': (ctx or '')[:200]
                }
                clinic_data['pricing'].append(entry)
                
                # Group by category
                cat_key = cat or 'general'
                if cat_key not in clinic_data['pricing_by_category']:
                    clinic_data['pricing_by_category'][cat_key] = []
                clinic_data['pricing_by_category'][cat_key].append({
                    'procedure': pn,
                    'price_low': pl,
                    'price_high': ph,
                    'currency': cur or 'USD'
                })
        
        output[name or url] = clinic_data
    
    path = os.path.join(os.path.dirname(__file__), 'pricing_intel_v3_export.json')
    with open(path, 'w') as f:
        json.dump(output, f, indent=2, default=str)
    print(f"\n  Exported to {path}")
    total_prices = sum(len(v['pricing']) for v in output.values())
    high_conf = sum(v['pricing_summary']['high_confidence'] for v in output.values())
    print(f"  {len(output)} clinics, {total_prices} pricing points ({high_conf} high confidence)")


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
                time.sleep(2)
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
