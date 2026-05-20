import socket, sys

# Check domain availability via WHOIS server directly
def whois_check(domain, server="whois.verisign-grs.com", port=43):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(5)
        s.connect((server, port))
        s.sendall((domain + "\r\n").encode())
        response = b""
        while True:
            data = s.recv(4096)
            if not data:
                break
            response += data
        s.close()
        text = response.decode("utf-8", errors="replace")
        if "No match for" in text or "NOT FOUND" in text or "No Data Found" in text:
            return "AVAILABLE"
        elif "Domain Name:" in text:
            return "REGISTERED"
        else:
            return f"UNCLEAR: {text[:100]}"
    except Exception as e:
        return f"ERROR: {str(e)[:50]}"

# Map TLDs to their WHOIS servers
tld_servers = {
    "org": "whois.publicinterestregistry.org",
    "xyz": "whois.nic.xyz",
    "icu": "whois.nic.icu",
    "lol": "whois.nic.lol",
    "fun": "whois.nic.fun",
    "online": "whois.nic.online",
    "site": "whois.nic.site",
}

# Check the most promising abstract names
domains = {
    "org": ["furway", "calma", "glova", "velo", "solva", "alta", "nola", "luma", "rena", "valo"],
    "xyz": ["calma", "glova", "velo", "solva", "alta", "nola", "luma", "rena", "valo", "furway"],
    "icu": ["glova", "solva", "luma", "calma", "velo", "rena", "valo"],
    "lol": ["alta", "nola", "calma", "velo", "luma"],
    "fun": ["calma", "velo", "luma", "glova"],
}

for tld, names in domains.items():
    server = tld_servers.get(tld, "whois.verisign-grs.com")
    for name in names:
        domain = f"{name}.{tld}"
        status = whois_check(domain, server)
        if "AVAILABLE" in status:
            print(f"✅ {domain} -> AVAILABLE")
        elif "REGISTERED" in status:
            pass  # skip, don't clutter
        else:
            print(f"❓ {domain} -> {status}")
