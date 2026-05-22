import json
with open('email-config.json') as f:
    config = json.load(f)
print(repr(config['smtp_password']))
print(len(config['smtp_password']))