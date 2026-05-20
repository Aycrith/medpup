import urllib.request, json, sys, re

# Names to check across cheap TLDs
names = [
    # User's list
    'furway.org', 'furway.co', 'furway.io', 'furway.net',
    'vetroute.org', 'vetroute.co', 'vetroute.net',
    'vetline.org', 'vetline.co', 'vetline.net',
    'tailgo.org', 'tailgo.co', 'tailgo.net',
    'vetgo.org', 'vetgo.co', 'vetgo.net',
    # Fresh recommendations (trying .org .co .net .io)
    'pawway.org', 'pawway.co', 'pawway.net',
    'vetway.org', 'vetway.co', 'vetway.net',
    'pawgo.org', 'pawgo.co',
    'vetco.org', 'vetco.co', 'vetco.net',
    'petway.org', 'petway.co', 'petway.net',
    'petgo.org', 'petgo.co',
    'wellpet.org', 'wellpet.co',
    'goodpaw.org', 'goodpaw.co',
    'pawgood.org', 'pawgood.co',
    # Try different name combos
    'furgood.org', 'furgood.co',
    'pawwell.org', 'pawwell.co',
    'vetwell.org', 'vetwell.co',
    'carepaw.org', 'carepaw.co',
    'pawcare.org', 'pawcare.co',
]

# Use RDAP to check availability efficiently
def check_rdap(domain):
    ext = domain.split('.')[-1]
    rdap_servers = {
        'org': 'https://rdap.publicinterestregistry.org/domain/',
        'co': 'https://rdap.nic.co/domain/',
        'io': 'https://rdap.nic.io/domain/',
        'net': 'https://rdap.verisign.com/NET/v1/domain/',
    }
    
    if ext not in rdap_servers:
        return 'UNKNOWN'
    
    url = rdap_servers[ext] + domain
    try:
        req = urllib.request.Request(url, headers={'Accept': 'application/json'})
        resp = urllib.request.urlopen(req, timeout=5)
        data = json.loads(resp.read())
        for e in data.get('events', []):
            if e.get('eventAction') == 'expiration':
                return f"TAKEN (exp {e.get('eventDate','?')[:10]})"
        return 'TAKEN'
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return 'AVAILABLE'
        return f'ERROR {e.code}'
    except Exception as e:
        return f'ERROR'

results = []
for name in names:
    status = check_rdap(name)
    if 'AVAILABLE' in status:
        results.append((name, status))
    sys.stdout.write(f'{name:25s} -> {status}\n')

print('\n=== AVAILABLE DOMAINS ===')
if results:
    for r in sorted(results):
        print(f'{r[0]:25s} -> {r[1]}')
else:
    print('None found via RDAP.')
    print('Try checking registrars directly for .org .co .net pricing.')
