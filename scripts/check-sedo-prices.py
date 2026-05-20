import urllib.request, re

domains = ['furway.com', 'vetroute.com', 'vetline.com', 'tailgo.com']
for d in domains:
    try:
        url = f'https://sedo.com/search/details/?domain={d}&language=us'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        data = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='replace')
        
        price_match = re.search(r'price[^<]*\$([0-9,]+)', data, re.IGNORECASE)
        buy_match = re.search(r'buy it now', data, re.IGNORECASE)
        make_offer = re.search(r'make offer', data, re.IGNORECASE)
        
        if price_match:
            print(f'{d} -> Buy it now: ${price_match.group(1)}')
        elif buy_match:
            print(f'{d} -> Listed for sale (buy it now)')
        elif make_offer:
            print(f'{d} -> Make offer')
        else:
            # Search for any numbers near price/currency
            alt = re.search(r'\$[0-9,]+', data)
            if alt:
                print(f'{d} -> Price found: {alt.group()}')
            else:
                print(f'{d} -> Listed on Sedo (price unclear)')
    except Exception as e:
        print(f'{d} -> Error: {str(e)[:60]}')
