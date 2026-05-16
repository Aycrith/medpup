import urllib.request, re, sys

targets = [
    ('https://www.ericislasveterinario.com/', 'Eric Islas - Playa del Carmen ortho vet'),
    ('https://clinicvetpdc.com/vet-clinic-playa-del-carmen/', 'Clinic VET PDC - English speaking vet'),
]

for url, label in targets:
    print(f'=== {label} ===')
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        data = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='replace')[:5000]
        
        m = re.search(r'<title>(.*?)</title>', data, re.DOTALL)
        print(f'Title: {m.group(1).strip() if m else "N/A"}')
        
        # Find contact info
        phones = re.findall(r'[\+]?\d{1,3}[\s.-]?\d{2,4}[\s.-]?\d{3,4}[\s.-]?\d{3,4}', data)
        if phones: print(f'Phone candidates: {phones[:3]}')
        
        emails = re.findall(r'[\w.+-]+@[\w-]+\.[\w.-]+', data)
        if emails: print(f'Email candidates: {emails[:3]}')
        
        # Check for key services
        keywords = ['TPLO', 'orthopedic', 'surgery', 'cirugía', 'English', 'ortopedia']
        found = [kw for kw in keywords if kw.lower() in data.lower()]
        print(f'Keywords found: {found}')
        
    except Exception as e:
        print(f'Error: {e}')
    print()
