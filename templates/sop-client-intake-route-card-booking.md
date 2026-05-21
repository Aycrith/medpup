# SOP: Client Intake → Route Card → Booking

**Version:** 1.0
**Last Updated:** 2026-05-20
**Department:** Client Coordination
**Owner:** MedPup Operations

---

## Purpose

This procedure ensures every client inquiry is consistently captured, priced, communicated, and booked. Follow each step in order. Skipping steps causes downstream errors in invoicing, clinic scheduling, and VOC tracking.

---

## 1. Receive & Validate the Intake Form

1. When a new intake form arrives (web, email, or phone), open the **Client Intake Spreadsheet** (or check the CRM intake queue).
2. Verify all required fields are present:
   - Client name, phone, email
   - Pet name, species, breed, age, weight
   - Procedure needed (e.g., spay, neuter, dental, ortho surgery)
   - US vet name and practice
   - Diagnosis / clinical notes from US vet
   - US cost quote (itemized)
3. **If any field is missing:** reply to the client within 2 business hours requesting the missing information. Do not proceed until complete.
4. Assign a **VOC ID** using the pattern `VOC-YYYYMMDD-XXX` where XXX is a zero-padded sequential number (e.g., VOC-20260520-001).
5. Save the raw intake record to `02_PHASES/voc/incoming/` as `{VOC-ID}-intake.json`.

---

## 2. Run Auto-Quote

1. Open a terminal in the MedPup project root.
2. Run the auto-quote engine:
   ```
   python scripts/auto_quote.py --voc-id {VOC-ID}
   ```
3. The script will:
   - Match the procedure and pet profile to partner clinic price tiers
   - Apply current exchange rate buffer (default: 15%)
   - Generate a **Route Card** PDF and JSON in `02_PHASES/voc/{VOC-ID}/`
4. Review the output for obvious errors (e.g., zero-cost line items, missing clinic assignment).
5. **If auto_quote.py fails:** manually build the cost estimate using the fallback spreadsheet at `templates/route-card-fallback.xlsx`. Log the failure in `logs/quote-errors.log`.

---

## 3. Generate & Send the Route Card

1. The route card must show these components as one **All-In Cost Estimate**:
   - **Professional Fee** (clinic surgical fee)
   - **Ancillary Fees** (labs, meds, hospitalization)
   - **Coordination Fee** (MedPup service fee)
   - **Buffer** (currency / contingency, if applicable)
   - **Total Payable** (sum of all above)
2. Open the generated route card, confirm the layout is clean, then:
   - **Email** the PDF to the client
   - **CC** `coordinator@medpup.com`
   - **Subject line:** `Your MedPup All-In Cost Estimate — {VOC-ID}`
   - **Body:** Brief 2–3 sentence summary. Include "To proceed, please reply to this email with the word **BOOK IT**."
3. Attach a **MedPup Service Agreement** PDF to the same email.
4. Move the VOC record from `incoming/` to `02_PHASES/voc/{VOC-ID}/` and update its status to `estimate_sent`.

---

## 4. Wait for Client Confirmation

1. The client must reply **"BOOK IT"** (case-insensitive) to the estimate email.
2. If the client asks questions or negotiates:
   - Answer within 4 business hours.
   - If pricing changes are needed, re-run `auto_quote.py` with `--adjust` flag, issue a revised route card, and restart step 3.
3. If **5 business days** pass without a reply, send one follow-up email. If no response after another 5 days, move the VOC to `02_PHASES/voc/abandoned/` and close the record.

---

## 5. Confirm with Partner Clinic

1. Once "BOOK IT" is received, immediately check clinic availability for the requested procedure window:
   - Open the **Partner Clinic Calendar** (shared spreadsheet or CRM).
   - Find an open slot matching the procedure type and pet size.
   - Reserve the slot (mark as `HOLD — {VOC-ID}`).
2. Send a confirmation email to the clinic:
   - **To:** clinic's booking contact
   - **Subject:** `Booking Confirmation — {VOC-ID} — {Pet Name}`
   - **Body:** Procedure, pet profile, requested date, VOC ID, client name.
3. Update the VOC record: set status to `clinic_confirmed`.

---

## 6. Invoice the Coordination Fee

1. Generate an invoice for the **Coordination Fee** only (not the full procedure cost).
2. Use the invoicing template at `templates/invoice-coordination-fee.odt` (or the CRM invoice module):
   - **Amount:** as shown on the route card
   - **Due:** immediately — "Paid in Full before Appointment"
   - **VOC ID:** reference in the memo
3. Send the invoice to the client with **Subject:** `Invoice — Coordination Fee — {VOC-ID}`.
4. Update the VOC status to `invoice_sent`.

---

## 7. Confirm Appointment (Fee Paid)

1. The appointment is **not** confirmed until the coordination fee payment clears.
2. When payment arrives:
   - Mark the invoice as **Paid** in the CRM/accounting system.
   - Send the client a **Booking Confirmation** email with:
     - Clinic name and address
     - Appointment date and time
     - Pre-op instructions (fasting, drop-off time, etc.)
     - MedPup 24h hotline number
3. Update the VOC record:
   - Status: `booked`
   - Add `paid_at` timestamp and `invoice_ref`
   - Save to `02_PHASES/voc/{VOC-ID}/voc-{VOC-ID}.json`
4. Add a calendar reminder for yourself to follow up 24 hours post-procedure (see SOP: Post-Procedure Follow-Up).

---

## 8. Record Keeping

1. Every email sent/received must be saved as a `.eml` or PDF in `02_PHASES/voc/{VOC-ID}/correspondence/`.
2. The final VOC JSON must contain these keys at minimum:
   ```
   voc_id, client_name, pet_name, procedure, clinic, 
   route_card_total, coordination_fee, status, 
   created_at, booked_at, paid_at
   ```

---

## Troubleshooting

| Problem | Action |
|---|---|
| `auto_quote.py` throws an error | Log to `logs/quote-errors.log`, build manual quote via fallback spreadsheet |
| Client disputes the estimate | Offer a revised route card via `--adjust` flag; if unresolved, escalate to operations manager |
| Clinic declines the booking | Move to backup clinic (list in `config/backup-clinics.json`), re-confirm with client |
| Payment not received within 48h | Send one payment reminder; if unpaid after 72h, release clinic hold and move VOC to `pending_payment/` |

---

## Related Documents

- SOP: Post-Procedure Follow-Up
- SOP: Price Guarantee Claim Handling
- `config/clinic-pricing.json`
- `scripts/auto_quote.py`
