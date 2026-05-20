#!/usr/bin/env python3
"""Comprehensive Cancun veterinary clinic search using Google + DuckDuckGo"""

import sys
import json
import time
import urllib.parse

# Try multiple search providers
try:
    from googlesearch import search as google_search
except ImportError:
    google_search = None

try:
    from duckduckgo_search import DDGS
except ImportError:
    DDGS = None

SEARCH_QUERIES = {
    "vets_spanish": [
        "veterinarias en Cancún Quintana Roo",
        "mejores veterinarios en Cancún 2025",
        "hospital veterinario 24 horas Cancún",
        "veterinaria especialista en cirugía Cancún",
        "clinica veterinaria ortopedia Cancún",
        "veterinario cancún qroo",
        "veterinaria zona hotelera cancún",
        "veterinario turismo cancún",
        "veterinaria dental perros cancún",
        "precios veterinaria Cancún 2025",
        "costo cirugía perro México",
        "limpieza dental perro precio México",
    ],
    "vets_english": [
        "vet cancun zona hotelera",
        "cancun pet clinic english speaking",
        "best vet in cancun for tourists",
        "cancun veterinary clinic orthopedic surgery",
        "pet dental cleaning cancun mexico",
        "veterinary tourism cancun mexico",
    ],
    "import_export": [
        "SENASICA dog import Mexico requirements 2025",
        "Mexico pet import health certificate APHIS",
        "screwworm certificate Mexico dogs",
        "bring dog to mexico from us requirements",
        "formato salud animal SENASICA perros",
    ],
    "airlines": [
        "fly dog in cabin to cancun from florida",
        "spirit airlines pet in cabin fee cancun",
        "american airlines pet cargo cancun",
        "delta pet policy cancun mexico",
        "united airlines pet in cabin mexico",
        "frontier airlines pet fee cancun",
    ],
    "pricing": [
        "cost of dog dental cleaning Mexico",
        "price spay neuter Mexico Cancun",
        "veterinary pricing Cancun Mexico USD",
        "low cost vet Mexico prices",
    ],
}

def search_provider(query, num=10):
    """Try multiple search backends"""
    results = []
    
    # Try Google
    if google_search:
        try:
            for i, r in enumerate(google_search(query, num_results=num, lang="es")):
                if i < num:
                    results.append(r)
                else:
                    break
            if results:
                return results
        except Exception as e:
            pass
    
    # Try DuckDuckGo
    if DDGS:
        try:
            ddgs = DDGS()
            for i, r in enumerate(ddgs.text(query, max_results=num)):
                if isinstance(r, dict) and 'href' in r:
                    results.append(r['href'])
                elif isinstance(r, str):
                    results.append(r)
                if i >= num - 1:
                    break
            if results:
                return results
        except Exception as e:
            pass
    
    return results

all_results = {}

for category, queries in SEARCH_QUERIES.items():
    print(f"\n{'='*60}")
    print(f"CATEGORY: {category}")
    print(f"{'='*60}")
    cat_results = []
    for query in queries:
        print(f"  Searching: {query}")
        try:
            urls = search_provider(query, num=8)
            if urls:
                print(f"    Found {len(urls)} results")
                cat_results.extend(urls)
            else:
                print(f"    No results")
        except Exception as e:
            print(f"    Error: {e}")
        time.sleep(0.5)  # Rate limiting
    
    # Deduplicate
    seen = set()
    unique = []
    for u in cat_results:
        if u not in seen:
            seen.add(u)
            unique.append(u)
    all_results[category] = unique
    print(f"  Total unique URLs: {len(unique)}")

# Print all results
print("\n\n")
print("="*70)
print("COMPREHENSIVE RESULTS")
print("="*70)

for category, urls in all_results.items():
    print(f"\n--- {category.upper()} ---")
    for u in urls:
        print(f"  {u}")

# Save to file
output = {"searches": SEARCH_QUERIES, "results": {k: list(v) for k, v in all_results.items()}}
with open("C:\\Users\\camer\\DEVNEW\\AnimalAid\\research_results.json", "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print("\n\nResults saved to research_results.json")
