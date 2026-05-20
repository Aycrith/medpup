"""
market_expander.py — Auto-discovery pipeline for Pinellas-market clinics

Discovers new clinics to scan by:
  1. Reading the current DB for clinics already indexed
  2. Running a DuckDuckGo search for 'veterinary Pinellas Tampa Bay + keywords'
     and extracting candidate URLs that match the DB exclude
  3. Optionally: scraping Yelp/Google Places category pages for low-cost vet lists
  4. Passing new URLs through price_intel_v3 scan
  5. Writing any new clinics/ pricing to the DB

Usage:
  python market_expander.py              # full discovery run
  python market_expander.py --dry-run    # list candidates only, no scan
  python market_expander.py --limit 10   # cap new candidates to 10 scans
"""
import re, time, sys, json, argparse, subprocess, sqlite3
from pathlib import Path
import urllib.request, urllib.parse

BASE    = Path(r"C:\Users\camer\DEVNEW\animalaid")
DB      = BASE / "pricing_intel_v3.db"
SCRIPT  = BASE / "price_intel_v3.py"
OUT     = BASE / "02_PHASES"
KNOWN   = BASE / "market_expander_known.txt"

# ── Priorities — which terms are most likely to surface low-cost clinics ──
SEARCH_TERMS = [
    "low cost veterinarian Pinellas County",
    "spay neuter clinic Tampa Bay",
    "affordable vet Largo FL",
    "animal shelter veterinary services Pinellas",
    "community veterinary clinic Hillsborough",
    "free/low cost vet clinic St Petersburg",
    "veterinary discount clinic Clearwater",
    "ASPCA clinic Tampa Bay",
    "Humane Society veterinary Pinellas",
    "mobile vet Pinellas County",
]

# Patterns that indicate a real clinic website (not a portal, listing, or news page)
CLINIC_URL_PATTERNS = re.compile(
    r"(?:veterinary|vet|animal|pet)[a-z0-9\-]*\.(?:com|org|net|us|co)",
    re.IGNORECASE
)
# Domains we know are NOT clinics
BLACKLIST = {
    "google.com","facebook.com","yelp.com","barkly.com","petfinder.com",
    "carolinavet.net","carolinavet.com","carolinavet.org","carolinavet.io",
    "americanexpress.com","carecredit.com","carecredit.org","wellsfargo.com",
    "bankofamerica.com","usbank.com","chase.com","citi.com","synchrony.com",
    "youtube.com","tiktok.com","instagram.com","twitter.com","linkedin.com",
    "wikipedia.org","wix.com","wordpress.com","squarespace.com","weebly.com",
    "petful.com","petplate.com","thehonestkitchen.com","orijen.com","acana.com",
    "wikipedia.org","petsmart.com","petco.com","amazon.com","chewy.com",
    "dogsbynina.com","barkly.com","barklypets.com","axios.com",
    "nationalgeographic.com","dogtime.com","akc.org",
    "suncoastnews.com","tampabay.com","reference.com","investopedia.com",
    "fool.com","kiplinger.com","turtletalk.com","turtletalk.org",
    "cagepotato.com","animalwellnessmag.com","whole-dog-journal.com",
    "britannica.com","webmd.com","vetstreet.com","petmd.com","petful.com",
    "miamidade.gov","pinellascounty.org","hillsboroughcounty.org",
    "imdb.com","rottentomatoes.com","rottentomatoes.org",
    "reddit.com","quora.com","yahoo.com","outlook.com","gmail.com",
    "angieslist.com","homeadvisor.com","thumbtack.com","taskrabbit.com",
    "yumbox.com","barkbox.com","petflow.com","petfirst.com","embracepetinsurance.com",
    "akcpetinsurance.com","figopetinsurance.com","lowe.com","lmcarga.com",
    "imdb.com","rottentomatoes.com","rottentomatoes.org",
}

def load_known_urls():
    if KNOWN.exists():
        return set(KNOWN.read_text().splitlines())
    return set()

def save_known(urls):
    KNOWN.write_text("\n".join(sorted(urls)))

def db_has_url(url):
    conn = sqlite3.connect(str(DB))
    cur = conn.cursor()
    cur.execute("SELECT id FROM clinics WHERE url = ?", (url,))
    found = cur.fetchone()
    conn.close()
    return found is not None

def ddg_search(query, max_results=10):
    """DuckDuckGo HTML search — returns candidate URLs."""
    url = "https://duckduckgo.com/html/?" + urllib.parse.urlencode({"q": query, "ia": "web"})
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; medpup-bot/1.0)"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"  [!] DDG error for '{query}': {e}")
        return []

    # Extract result links from DDG HTML
    # DDG uses <a rel="nofollow" class="result__a" href="...">
    links = re.findall(r'href="(https?://[^"]+)"[^>]*class="[^"]*result__a[^"]*"', html)
    # Fallback: grab all http(s) URLs in result area
    if not links:
        links = re.findall(r'https?://[a-z0-9\-\.]+/[a-z0-9\-_/\.]*', html)

    return links[:max_results]

def extract_domain(url):
    m = re.match(r'https?://([^/]+)', url)
    return m.group(1) if m else ""

def looks_like_clinic(url):
    domain = extract_domain(url)
    # Auto-deny known portals/aggregators
    if any(domain.endswith(b) for b in BLACKLIST):
        return False
    # Must have a plausible domain length
    if len(domain) < 8 or '.' not in domain:
        return False
    # Must not be a social/news portal top-level domain
    if domain.split('.')[-1] in ('news','org','gov','io','co','me','ly','to','cc'):
        if not any(kw in domain for kw in ['vet','animal','pet','clinic','care','hospital']):
            return False
    return CLINIC_URL_PATTERNS.search(domain) or re.search(r'(vet|animal|pet|clinic|care|hospital)', domain, re.I)

def add_clinic(name, url, conn):
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO clinics (name, url, domain, services, scan_status)
            VALUES (?,?,?,?,?)
        """, (name, url, extract_domain(url), 'discovered_by_expander', 'pending'))
        conn.commit()
        return cur.lastrowid
    except sqlite3.IntegrityError:
        return None  # already exists

def run_scan(url, cid, dry=False):
    if dry:
        print(f"    [dry] would scan: {url}")
        return True
    r = subprocess.run(
        ["python", str(SCRIPT), "scan", url],
        capture_output=True, text=True, timeout=90, cwd=str(BASE)
    )
    if r.returncode == 0:
        print(f"    ✅ scan OK [{cid}] {url[:55]}")
        return True
    else:
        print(f"    ❌ scan FAILED [{cid}] {url[:55]}  stderr: {r.stderr[-120:]}")
        return False

def main():
    known = load_known_urls()
    conn = sqlite3.connect(str(DB))
    cur = conn.cursor()

    # Load existing DB URLs
    cur.execute("SELECT url FROM clinics WHERE url IS NOT NULL")
    db_urls = {r[0] for r in cur.fetchall()}
    all_known = known | db_urls

    print(f"=== MARKET EXPANDER — {len(all_known)} known URLs in DB ===\n")

    new_candidates = []
    for term in SEARCH_TERMS:
        print(f"DDG: '{term}'")
        urls = ddg_search(term, max_results=8)
        for u in urls:
            # Normalize
            u = u.split('#')[0].split('?')[0]
            u = u.rstrip('/')
            if not u.startswith('http'):
                u = 'https://' + u
            if u in all_known:
                continue
            if not looks_like_clinic(u):
                continue
            new_candidates.append(u)
            all_known.add(u)
        time.sleep(0.6)  # polite crawl delay

    # Deduplicate
    new_candidates = list(dict.fromkeys(new_candidates))
    print(f"\nNew clinic candidates: {len(new_candidates)}")

    dry = "--dry-run" in sys.argv
    limit = int(sys.argv[sys.argv.index("--limit")+1]) if "--limit" in sys.argv else 999

    scanned = 0
    for url in new_candidates[:limit]:
        print(f"\n  Candidate: {url}")
        # Add to DB first
        cid = add_clinic(f"[expander] {url}", url, conn)
        if cid is None:
            cid_row = cur.execute("SELECT id FROM clinics WHERE url=?", (url,)).fetchone()
            cid = cid_row[0] if cid_row else None
        if cid:
            success = run_scan(url, cid, dry=dry)
            if success:
                scanned += 1
        time.sleep(0.4)

    conn.close()

    # Update known list
    save_known(all_known)

    # Report
    conn2 = sqlite3.connect(str(DB))
    cur2 = conn2.cursor()
    cur2.execute("SELECT COUNT(*) FROM clinics WHERE services='discovered_by_expander'")
    n_new = cur2.fetchone()[0]
    cur2.execute("SELECT COUNT(*) FROM clinics")
    total = cur2.fetchone()[0]
    conn2.close()

    print(f"\n┌─── Market Expander Summary ────────────────────────────────────")
    print(f"│  New candidates tested  {len(new_candidates)}")
    print(f"│  Successfully scanned   {scanned}")
    print(f"│  Total clinics in DB    {total} ({n_new} from expander)")
    print(f"└─────────────────────────────────────────────────────────────────")

if __name__ == "__main__":
    main()
