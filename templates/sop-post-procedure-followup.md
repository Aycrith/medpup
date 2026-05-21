# SOP: Post-Procedure Follow-Up

**Version:** 1.0
**Last Updated:** 2026-05-20
**Department:** Client Coordination
**Owner:** MedPup Operations

---

## Purpose

The post-procedure follow-up ensures continuity of care, captures clinical outcomes, builds client loyalty, and keeps the MedPup pricing database fresh. This SOP must be triggered automatically by the 24-hour post-op calendar reminder set during booking.

---

## 1. Pre-Follow-Up Checklist

1. Pull the VOC record from `02_PHASES/voc/{VOC-ID}/voc-{VOC-ID}.json`.
2. Confirm the procedure date and time. If the appointment was today or yesterday, proceed. If more than 48 hours have passed, expedite — the client may already be waiting.
3. Gather the following before contacting the client:
   - Client contact info (phone + email)
   - Pet name and procedure performed
   - Clinic name and contact
   - Copy of the route card sent during intake
4. Open the **Follow-Up Log** at `02_PHASES/voc/{VOC-ID}/followup-{VOC-ID}.json` (create if it does not exist).

---

## 2. 24-Hour Post-Op Check-In

1. Contact the client **24 ± 4 hours** after the scheduled procedure end time.
2. **Preferred channel:** phone call. If unanswered, leave a voicemail and send a text/SMS. If no response within 4 hours, send an email.
3. **Script for the check-in:**

   > "Hi [Client Name], this is [Coordinator Name] from MedPup. We're checking in on [Pet Name] after their [Procedure] at [Clinic]. How is [Pet Name] doing? Any concerns about recovery, pain, eating, or incision site?"

4. Document the response in the follow-up log:
   ```
   {
     "checkin_24h": {
       "status": "ok" | "concern" | "unreachable",
       "notes": "Client reports pet is eating well, incision looks clean.",
       "contacted_at": "2026-05-21T14:30:00Z",
       "channel": "phone"
     }
   }
   ```
5. **If the client reports a concern:**
   - Assess urgency: bleeding, labored breathing, or severe lethargy → instruct client to go to an emergency vet immediately. Provide the MedPup emergency hotline.
   - Minor issues (mild swelling, reduced appetite) → advise to follow clinic's post-op discharge instructions and call the clinic directly.
   - Log the concern in the follow-up log and set a **+24h re-check** reminder.
6. **If the client is unreachable:** attempt contact again at 48h and 72h. If still no response after 72h, note in VOC as `followup_unreachable` and proceed to step 4 (records forwarding).

---

## 3. Collect Surgical Report from Partner Clinic

1. Within **48 hours** of the procedure, request the surgical report and discharge summary from the partner clinic:
   - **Email template:**
     > **Subject:** Request: Surgical Report — {VOC-ID} — {Pet Name}
     > **Body:** "Dear [Clinic Contact], please send the surgical report and discharge summary for [Pet Name] ([VOC-ID]), procedure date [Date]. Thank you."

2. Follow up with a phone call if no response within 24 hours.
3. When received, save the report to `02_PHASES/voc/{VOC-ID}/medical-records/surgical-report-{VOC-ID}.pdf`.
4. Log the receipt in the follow-up log:
   ```
   "surgical_report": {
     "received": true,
     "received_at": "2026-05-22T10:00:00Z",
     "file": "surgical-report-VOC-20260520-001.pdf"
   }
   ```

---

## 4. Forward Records to US Primary Vet

1. Send an email to the client's US primary veterinarian (listed in the intake form) with:
   - **Subject:** `Medical Records — {Pet Name} — MedPup Referral — {VOC-ID}`
   - **Body:** Brief note that the patient was seen at [Partner Clinic] on [Date] for [Procedure]. Attach the surgical report and discharge summary.
   - **CC:** the client.
2. Log the forwarding in the follow-up log:
   ```
   "records_forwarded": {
     "us_vet": "Dr. Smith, Happy Paws Vet Clinic",
     "sent_at": "2026-05-22T11:00:00Z",
     "status": "sent"
   }
   ```

---

## 5. Request Review / Testimonial

1. **3 to 5 days** after the check-in, send a testimonial request to the client:
   - **Email Subject:** `Help us improve — share your MedPup experience`
   - **Body:** Short, warm request for a Google Review or a direct testimonial. Include a link to the review page.
2. If the client agrees, follow up with the link and thank them.
3. Log the request:
   ```
   "testimonial": {
     "requested": true,
     "requested_at": "2026-05-24T09:00:00Z",
     "result": "pending" | "submitted" | "declined"
   }
   ```
4. Forward submitted testimonials to `marketing@medpup.com` for use on the website/social media.

---

## 6. Log Outcome in VOC

1. Update the VOC master record with the final outcome:
   ```
   "outcome": "completed" | "canceled" | "no_show"
   ```
   - **completed:** procedure happened, follow-up done.
   - **canceled:** client or clinic canceled before the procedure.
   - **no_show:** client did not arrive. Attempt contact; if no response, close after 72h.
2. Move the VOC folder to `02_PHASES/voc/completed/`, `canceled/`, or `no_show/` accordingly.
3. Close out any open calendar reminders for this VOC.

---

## 7. Update Pricing Freshness

1. If the **actual procedure cost** differed from the estimate on the route card, update the pricing database:
   - Open `config/clinic-pricing.json`.
   - For the relevant clinic and procedure, update the `last_actual_cost` field.
   - Reset `pricing_freshness_ttl` to **90 days** from today.
2. If the actual cost was **significantly higher** (≥10% above the upper bound), flag the pricing as `needs_reverification` and create a pricing alert (see SOP: Price Guarantee Claim Handling).
3. Log the freshness update:
   ```
   "pricing_freshness": {
     "updated": true,
     "updated_at": "2026-05-22T12:00:00Z",
     "new_ttl_days": 90,
     "actual_cost": 450.00
   }
   ```

---

## 8. Final Check

Before closing the VOC, confirm:

- [ ] 24h check-in completed (or max attempts exhausted)
- [ ] Surgical report received and filed
- [ ] Records forwarded to US primary vet
- [ ] Testimonial requested
- [ ] Outcome logged and folder moved
- [ ] Pricing freshness updated if applicable

---

## Related Documents

- SOP: Client Intake → Route Card → Booking
- SOP: Price Guarantee Claim Handling
- `config/clinic-pricing.json`
- `02_PHASES/voc/` directory structure
