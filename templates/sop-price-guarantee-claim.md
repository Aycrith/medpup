# SOP: Price Guarantee Claim Handling

**Version:** 1.0
**Last Updated:** 2026-05-20
**Department:** Client Coordination / Operations
**Owner:** MedPup Operations

---

## Purpose

MedPup offers a Price Guarantee: if the client's actual bill exceeds the upper bound of the All-In Cost Estimate provided on their route card, MedPup will make it right — either by switching to a backup clinic or refunding the coordination fee. This SOP defines exactly how to handle a claim from first notification through resolution and database update.

---

## 1. Receive the Claim Notification

1. The client must notify MedPup **within 5 business days** of the procedure date. If notification comes after 5 business days, the guarantee is void. Politely inform the client and document the late claim in the VOC.
2. Claims can arrive via email, phone, or the website contact form. All channels funnel to the coordination team.
3. **Upon receiving a claim:**
   - Reply within **4 business hours** acknowledging receipt.
   - Assign a **Claim ID** using the pattern `CLAIM-YYYYMMDD-XXX`.
   - Open a new record in `02_PHASES/price_guarantee/{CLAIM-ID}.json`.
   - Link the claim to the original VOC ID.
4. Initial acknowledgment email template:
   > **Subject:** Price Guarantee Claim Received — {CLAIM-ID}
   > **Body:** "Thank you for contacting us about your MedPup Price Guarantee. We have received your claim and will review it within 2 business days. To proceed, please provide the itemized receipt from the clinic."

---

## 2. Request the Itemized Receipt

1. The client must provide an **itemized receipt** from the partner clinic showing each charge line item.
2. If the client does not already have it:
   - Contact the partner clinic directly to request the itemized receipt.
   - **Email template:**
     > **Subject:** Request: Itemized Receipt — {VOC-ID} — {Pet Name}
     > **Body:** "We are processing a Price Guarantee claim for this patient. Please provide the fully itemized receipt showing all charges. Thank you."
3. **Deadline:** the receipt must be received within **3 business days** of the claim being opened. If not received, send one reminder. If still not received after 5 business days, close the claim as `insufficient_documentation` and notify the client.
4. Save the receipt to `02_PHASES/price_guarantee/{CLAIM-ID}/receipt-{CLAIM-ID}.pdf`.

---

## 3. Compare Against the All-In Cost Estimate

1. Open the original route card for the VOC from `02_PHASES/voc/{VOC-ID}/route-card-{VOC-ID}.json`.
2. Identify the **All-In Cost Estimate** and specifically the **upper bound** (listed as "Total Payable — Upper Bound" on the route card).
3. Sum the actual charges from the itemized receipt.
4. **Determine if the guarantee applies:**
   - If the actual total **≤ upper bound**: the guarantee does not apply. Notify the client that their bill was within the estimate range. Close the claim as `no_remedy_needed`.
   - If the actual total **> upper bound**: the guarantee applies. Proceed to step 4.
5. Log the comparison:
   ```
   "comparison": {
     "estimate_upper_bound": 750.00,
     "actual_total": 920.50,
     "variance": 170.50,
     "variance_pct": 22.7,
     "guarantee_triggers": true
   }
   ```

---

## 4. First Remedy — Offer Backup Clinic

1. **If a backup clinic is available** (check `config/backup-clinics.json` for the same procedure type):
   - Contact the backup clinic and confirm they can perform the procedure at the original estimated price (or lower).
   - Present the offer to the client:
     > "We can arrange for [Pet Name] to be seen at [Backup Clinic] for the same procedure at the original estimated cost. Would you like to proceed?"
   - If the client accepts:
     - Cancel the original clinic booking (if not already done).
     - Open a new VOC intake for the backup clinic (refer to SOP: Client Intake → Route Card → Booking, starting at step 5 — Clinic Confirmation).
     - Update the claim status to `resolved_backup_clinic`.
2. **If no backup clinic is available** (or the client declines), proceed to step 5.

---

## 5. Second Remedy — Refund Coordination Fee

1. Process a full refund of the **Coordination Fee** paid by the client.
   - Initiate the refund in the payment processor (Stripe / PayPal / bank transfer).
   - **Amount:** exactly the coordination fee amount from the original invoice.
   - **Memo:** "Price Guarantee Refund — {CLAIM-ID} — {VOC-ID}"
2. Notify the client via email:
   > **Subject:** Price Guarantee Refund Processed — {CLAIM-ID}
   > **Body:** "We were unable to find a backup clinic for the original estimated price. As per our Price Guarantee, we have refunded your coordination fee of ${amount}. You should see the refund within 5–10 business days. We apologize for the inconvenience."
3. Update the claim status to `resolved_refund`.

---

## 6. Document the Claim

1. Save the complete claim record to `02_PHASES/price_guarantee/{CLAIM-ID}.json` with all fields populated:
   ```
   {
     "claim_id": "CLAIM-20260520-001",
     "voc_id": "VOC-20260520-001",
     "client_name": "...",
     "pet_name": "...",
     "procedure": "...",
     "origin_clinic": "...",
     "backup_clinic_offered": true|false,
     "resolution": "backup_clinic"|"refund"|"no_remedy_needed"|"insufficient_documentation",
     "refund_amount": null|number,
     "resolved_at": "2026-05-23T...Z"
   }
   ```
2. Update the linked VOC record status to `price_claim_resolved`.

---

## 7. Flag Clinic Pricing for Re-Verification

1. Add the origin clinic to the **pricing alert list** at `config/pricing_alerts.json`:
   ```json
   {
     "clinic_name": "Clinica Ejemplo Tijuana",
     "procedure": "canine_spay",
     "alert_type": "price_guarantee_claim",
     "claim_id": "CLAIM-20260520-001",
     "flagged_at": "2026-05-23T12:00:00Z",
     "status": "needs_reverification"
   }
   ```
2. Set the **TTL to 7 days** — this means the clinic's pricing for this procedure must be re-verified within 7 days, or the pricing data will be considered stale and excluded from auto-quote results.
3. Send an internal alert to `operations@medpup.com`:
   > **Subject:** PRICING ALERT — {Clinic Name} — {Procedure} — Needs Re-Verification
4. If the re-verification is completed within 7 days and pricing is confirmed accurate, update `pricing_alerts.json` status to `verified` and reset TTL to 90 days.
5. If TTL expires without re-verification, the clinic-procedure pair is automatically excluded from `auto_quote.py` results until manually re-verified.

---

## 8. Finalize and Archive

1. Close the claim record.
2. Archive all documents to `02_PHASES/price_guarantee/archive/{CLAIM-ID}/`.
3. Send a brief summary to the weekly operations report.

---

## Troubleshooting

| Problem | Action |
|---|---|
| Client claims guarantee but is beyond 5 business days | Politely explain the policy; document as `late_claim` |
| Clinic refuses to provide itemized receipt | Escalate to clinic manager; if still refused, close as `insufficient_documentation` |
| Client disputes the refund amount | Confirm refund = coordination fee only (not full procedure cost); share invoice for reference |
| Same clinic generates multiple claims | Flag clinic for immediate re-verification of ALL procedures, not just the one claimed |

---

## Related Documents

- SOP: Client Intake → Route Card → Booking
- SOP: Post-Procedure Follow-Up
- `config/pricing_alerts.json`
- `config/backup-clinics.json`
- `scripts/auto_quote.py`
