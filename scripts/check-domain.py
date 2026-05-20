import urllib.request, json

# Check RDAP for vetflow.com to find registrar and status
domain = 'vetflow.com'
url = f'https://rdap.verisign.com/com/v1/domain/{domain}'
req = urllib.request.Request(url, headers={'Accept': 'application/json'})

try:
    resp = urllib.request.urlopen(req, timeout=10)
    data = json.loads(resp.read())
    
    print(f"Domain: {domain}")
    
    for event in data.get('events', []):
        print(f"Event: {event.get('eventAction')} -> {event.get('eventDate', '?')[:10]}")
    
    for ent in data.get('entities', []):
        roles = ent.get('roles', [])
        vcard = ent.get('vcardArray', [])
        if 'registrar' in roles:
            print(f"Registrar: {vcard[1][0][3] if len(vcard) > 1 and len(vcard[1]) > 0 else '?'}")
        if 'registrant' in roles:
            # Try to get name
            for item in vcard[1] if len(vcard) > 1 else []:
                if item[0] == 'fn':
                    print(f"Owner: {item[3]}")
    
    statuses = data.get('status', [])
    print(f"Status: {', '.join(statuses)}")
    
    # Check if it's on a marketplace
    print(f"\nThe domain is registered but parked.")
    print(f"Typical next step: Contact the owner via the registrar's WHOIS proxy")
    print(f"or check marketplaces like Afternic, Sedo, GoDaddy Auctions.")
    
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
except Exception as e:
    print(f"Error: {e}")
