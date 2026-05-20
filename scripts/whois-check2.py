import socket

def whois_check(domain, server):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(5)
        s.connect((server, 43))
        s.sendall((domain + "\r\n").encode())
        response = b""
        while True:
            try:
                data = s.recv(4096)
                if not data:
                    break
                response += data
            except:
                break
        s.close()
        text = response.decode("utf-8", errors="replace")
        if "No match for" in text or "NOT FOUND" in text or "No Data Found" in text:
            return "AVAILABLE"
        elif "Domain Name:" in text:
            return "TAKEN"
        elif "available for registration" in text.lower():
            return "AVAILABLE"
        else:
            return f"CHECK: {text[:80]}"
    except Exception as e:
        return f"ERROR"

# Abstract positive vibe names — check on cheap TLDs
checks = {
    "xyz": ["glova", "solva", "velo", "rena", "valo", "calma", "luma", "nola", 
            "zola", "brio", "vero", "mova", "rova", "kova", "lova", "nova",
            "tova", "viva", "vita", "alta", "bona", "sola", "cora", "dora"],
    "icu": ["glova", "solva", "velo", "rena", "valo", "calma", "luma", "nola",
            "zola", "brio", "mova", "rova", "kova", "lova", "nova", "tova",
            "viva", "vita", "alta", "cora", "sola"],
    "lol": ["glova", "solva", "velo", "rena", "valo", "calma", "luma", "nola",
            "brio", "mova", "nova", "alta", "viva", "vita", "cora", "sola"],
    "fun": ["glova", "solva", "velo", "rena", "calma", "luma", "brio", "nova"],
}

tld_servers = {
    "xyz": "whois.nic.xyz",
    "icu": "whois.nic.icu",
    "lol": "whois.nic.lol",
    "fun": "whois.nic.fun",
}

print("AVAILABLE DOMAINS ($1-3 TLDs):")
print("=" * 50)

for tld, names in checks.items():
    server = tld_servers.get(tld, "whois.verisign-grs.com")
    for name in names:
        domain = f"{name}.{tld}"
        status = whois_check(domain, server)
        if "AVAILABLE" in status:
            # Suggest meaning
            meanings = {
                "glova": "glow + va = warm, radiant",
                "solva": "sol (sun) + solve = sunny solution",
                "velo": "velocity = speed, progress, forward",
                "rena": "renaissance = rebirth, renewal, healing",
                "valo": "valor = courage, strength, trust",
                "calma": "calm + a = peaceful, serene",
                "luma": "lumen = light, bright, illuminating",
                "nola": "New Orleans vibes = warm, musical",
                "zola": "writer/name = artistic, memorable",
                "brio": "Italian = vigor, energy, life",
                "mova": "move + a = motion, progress",
                "rova": "rover + a = wanderer, explorer",
                "nova": "new star = bright, fresh, explosive",
                "tova": "beautiful name = warm, friendly",
                "viva": "Spanish = life, alive, vibrant",
                "vita": "Latin = life, vitality",
                "alta": "Spanish/Italian = high, elevated",
                "cora": "Greek = maiden, heart; warm",
                "sola": "Spanish = sun; bright, warm",
                "kova": "sounds strong, dependable",
                "lova": "love + a = loving, caring",
                "dora": "explorer = discovery, journey",
                "bona": "Latin = good; bona fide",
            }
            meaning = meanings.get(name, "")
            print(f'{domain:15s} ✅  {meaning}')
