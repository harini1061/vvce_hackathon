import random

COUNTRIES = ["IN", "AE", "SG", "IR", "RU", "GB"]
CHANNELS = ["NEFT", "RTGS", "SWIFT", "UPI"]
RISK = ["low", "medium", "high"]

def generate_fake_transaction():
    return {
        "sender_account": f"ACC{random.randint(1000,9999)}",
        "receiver_account": f"ACC{random.randint(1000,9999)}",
        "amount": round(random.uniform(1000, 150000), 2),
        "currency": "INR",
        "country": random.choice(COUNTRIES),
        "kyc_verified": random.choice([True, True, False]),
        "beneficiary_risk": random.choice(RISK),
        "channel": random.choice(CHANNELS)
    }
