#!/usr/bin/env python3
"""
Cancun Margin Calculator — MedPup Surgical Concierge Profitability Tool

Calculates per-client and annual profitability for the Cancun surgical concierge tier.
All costs are user-adjustable; sensible defaults are provided.

Usage:
    python scripts/cancun_margin_calculator.py
"""

# ─── Procedure catalogue ───────────────────────────────────────────────────────
# (procedure_name, us_benchmark_lo, us_benchmark_hi, cancun_cost_lo, cancun_cost_hi)
PROCEDURES = {
    "TPLO":           (4000, 7000,  800, 1500),
    "Dental cleaning":(600,  1200,  150,  300),
    "Spay/neuter":    (300,   600,  150,  300),
    "Tumor removal":  (2000, 5000,  200, 1500),
    "Spinal surgery": (12000,18000, 3000, 6000),
}

# ─── Travel cost defaults (per client) ────────────────────────────────────────
DEFAULT_AIRFARE_LO   = 220    # FLL-CUN round-trip with pet (low)
DEFAULT_AIRFARE_HI   = 500    # FLL-CUN round-trip with pet (high)
DEFAULT_HOTEL_LO      = 50     # per night (low)
DEFAULT_HOTEL_HI      = 150    # per night (high)
DEFAULT_TRANSFER_LO   = 40     # private transfer (low)
DEFAULT_TRANSFER_HI   = 80     # private transfer (high)
DEFAULT_SCRWORM_LO    = 30     # screwworm certificate (low)
DEFAULT_SCRWORM_HI    = 80     # screwworm certificate (high)
DEFAULT_HEALTH_CERT_LO = 50    # health certificate (low)
DEFAULT_HEALTH_CERT_HI = 150   # health certificate (high)

DEFAULT_HOTEL_NIGHTS  = 3
DEFAULT_CLIENTS_PER_MONTH = 4


def get_float(prompt, default):
    """Get a float from the user; return *default* on blank input."""
    raw = input(f"{prompt} [{default}]: ").strip()
    if raw == "":
        return default
    try:
        return float(raw)
    except ValueError:
        print(f"  Invalid number, using default ({default}).")
        return default


def main():
    print("=" * 60)
    print("  MedPup — Cancun Surgical Concierge Margin Calculator")
    print("=" * 60)

    # ── 1. Procedure selection ──────────────────────────────────────────────
    print("\n── Procedure ──")
    proc_names = list(PROCEDURES.keys())
    for i, name in enumerate(proc_names, 1):
        us_lo, us_hi, _, _ = PROCEDURES[name]
        print(f"  {i}. {name} (US benchmark: ${us_lo:,}–${us_hi:,})")
    try:
        choice = int(input("Select procedure (1–5): "))
        proc_name = proc_names[choice - 1]
    except (ValueError, IndexError):
        proc_name = proc_names[0]
        print(f"  Defaulting to '{proc_name}'.")

    us_lo, us_hi, cun_lo, cun_hi = PROCEDURES[proc_name]

    print(f"\n── {proc_name} — Cost inputs (blank = use default) ──")

    # ── 2. Concierge fee (what MedPup charges the client total) ────────────
    us_mid = (us_lo + us_hi) / 2
    suggested_fee = us_mid - cun_hi
    if suggested_fee < 0:
        suggested_fee = us_mid - cun_lo
    client_fee = get_float(
        f"  Client concierge fee (total to client)  $", round(suggested_fee, -1)
    )

    # ── 3. Travel costs ─────────────────────────────────────────────────────
    airfare = get_float("  Airfare (RT with pet)  $", DEFAULT_AIRFARE_HI)
    hotel_nights = get_float("  Hotel nights  ", DEFAULT_HOTEL_NIGHTS)
    hotel_rate = get_float("  Hotel cost per night  $", DEFAULT_HOTEL_HI)
    transfer = get_float("  Private transfer (RT)  $", DEFAULT_TRANSFER_HI)
    scrworm = get_float("  Screwworm certificate  $", DEFAULT_SCRWORM_HI)
    health_cert = get_float("  Health certificate  $", DEFAULT_HEALTH_CERT_HI)

    # ── 4. Procedure cost (what MedPup pays the Cancun vet) ────────────────
    proc_cost = get_float(
        f"  Procedure cost (paid to Cancun vet)  $", cun_hi
    )

    # ── 5. Volume ───────────────────────────────────────────────────────────
    clients_per_month = get_float(
        "  Clients per month  ", DEFAULT_CLIENTS_PER_MONTH
    )

    # ── Calculations ──────────────────────────────────────────────────────────
    total_cost_to_medpup = (
        proc_cost + airfare + (hotel_rate * hotel_nights)
        + transfer + scrworm + health_cert
    )

    # Revenue (client pays concierge fee; MedPup pays costs out of that)
    revenue_per_client = client_fee - total_cost_to_medpup
    us_equivalent = (us_lo + us_hi) / 2

    client_savings_lo = us_lo - client_fee
    client_savings_hi = us_hi - client_fee

    annual_revenue = revenue_per_client * clients_per_month * 12

    # ── Output ────────────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("  PROFITABILITY ANALYSIS")
    print("=" * 60)

    print(f"\n  Procedure:                    {proc_name}")
    print(f"  Clients per month:            {clients_per_month:.0f}")
    print(f"  ───────────────────────────────────────────")
    print(f"  REVENUE (client fee):         ${client_fee:>8,.2f}")
    print(f"  ─── Costs (per client) ───")
    print(f"    Procedure (Cancun vet):     ${proc_cost:>8,.2f}")
    print(f"    Airfare (RT w/ pet):        ${airfare:>8,.2f}")
    print(f"    Hotel ({hotel_nights:.0f} nights × ${hotel_rate:.0f}):         "
          f"${hotel_rate * hotel_nights:>8,.2f}")
    print(f"    Private transfer:           ${transfer:>8,.2f}")
    print(f"    Screwworm certificate:      ${scrworm:>8,.2f}")
    print(f"    Health certificate:         ${health_cert:>8,.2f}")
    print(f"    ───────────────────────────────────────")
    print(f"  TOTAL COST (per client):      ${total_cost_to_medpup:>8,.2f}")
    print(f"  ───────────────────────────────────────────")
    print(f"  MARGIN (per client):          ${revenue_per_client:>8,.2f}")

    if revenue_per_client > 0:
        margin_pct = (revenue_per_client / client_fee) * 100
        print(f"  MARGIN %%:                      {margin_pct:>7.1f}%")
    else:
        print(f"  MARGIN %%:                      LOSS")

    print(f"  ───────────────────────────────────────────")
    print(f"  ANNUAL REVENUE PROJECTION:    ${annual_revenue:>8,.2f}")

    print(f"\n  ─── Client perspective ───")
    print(f"  US benchmark (avg):           ${us_equivalent:>8,.2f}")
    print(f"  Client pays MedPup:           ${client_fee:>8,.2f}")
    print(f"  Client savings vs US (low):   ${client_savings_lo:>8,.2f}")
    print(f"  Client savings vs US (high):  ${client_savings_hi:>8,.2f}")
    print(f"  Savings range:                "
          f"  {client_savings_lo / us_lo * 100:>5.0f}% – "
          f"{client_savings_hi / us_hi * 100:>5.0f}% below US")
    print("=" * 60)

    # ── Sensitivity hint ──────────────────────────────────────────────────────
    if revenue_per_client <= 0:
        print(
            "\n  ⚠  This configuration is NOT profitable.\n"
            "     Try increasing the concierge fee or lowering travel costs."
        )
    elif revenue_per_client < 200:
        print(
            "\n  ⚠  Thin margin (< $200/client). Consider volume > 6/month\n"
            "     or negotiate lower vet/procedure costs."
        )


if __name__ == "__main__":
    main()
