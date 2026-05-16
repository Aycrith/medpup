Now that the full Phase 1 foundational assets are compiled, the logical next step is to transition from *planning* to *operational execution*. Based on the data and strategy we’ve aggregated, I recommend we proceed immediately into **Phase 2: Pre‑Launch & Pilot Trip Preparation**. This phase bridges the gap between having all the assets and generating the first dollar of revenue.

---

## Phase 2: Pre‑Launch & Pilot Trip Preparation

### Priority 1: Secure the Freeport Partner Clinic (Day‑Trip Pilot)

The Freeport “Dental & Wellness” Day‑Trip is the lowest‑risk, highest‑margin entry point (49% margin). To operationalize it, we need a signed partner agreement.

**Agent Tasks:**

1.  **Draft & Send Formal Partnership Proposal**
    - Use the Partner Clinic Outreach Email Template already created.
    - Customize it for **Freeport Veterinary Hospital** specifically.
    - Attach the Partner Clinic Inspection Checklist (to demonstrate your vetting standards) and the MOU template.
    - Send via email. If no response within 5 business days, follow up by phone.

2.  **Prepare for On‑Site Audit**
    - Schedule a scouting trip to Freeport (ferry day‑trip).
    - Bring the printed Inspection Checklist.
    - Verify: surgical suite, imaging equipment, surgeon credentials (confirm they are licensed), CareCredit terminal functionality, English proficiency.
    - Take photos (with permission) for website and social proof.

3.  **Negotiate Volume Pricing**
    - Request a discounted rate for MedPup‑referred patients, even if modest (e.g., 10% off published rates for the first 20 referrals).
    - Confirm exact procedure pricing for the most common services: dental with extractions, mass removal, spay/neuter (large dog), and basic fracture repair.

**Expected Outcome:** A signed MOU with Freeport Veterinary Hospital, confirmed pricing, and photographic assets for marketing.

---

### Priority 2: Activate the Digital Marketing & Booking Engine

With the clinic secured, we need to generate leads. The website and CRM must be live and functional.

**Agent Tasks:**

1.  **Website Deployment**
    - Take all the Hugo Markdown content already written (Home, Freeport, Cancun, TPLO, Dental, FAQ, Pricing) and push it to the GitHub repository.
    - Configure the Hugo theme and deploy via GitHub Pages (or Netlify) to a live URL.
    - Embed the Client Intake Form on the /get‑started page.
    - Add the Chatwoot live chat widget for real‑time inquiries.

2.  **CRM & Automation Setup**
    - Install and configure EspoCRM with the intake form as the lead source.
    - Import the n8n workflows (Booking Confirmation, Document Reminders) into your self‑hosted n8n instance. Connect the webhooks.
    - Test the entire flow: form submission → CRM contact created → confirmation email sent → document reminder scheduled.

3.  **Google Business Profile Activation**
    - Claim and fully optimize the MedPup GBP using the checklist provided.
    - Post the first update: “Introducing MedPup – Affordable pet surgery, day‑trip from Florida.”

4.  **Seed Content for SEO**
    - Publish the first three blog posts from the content calendar.
    - Submit the sitemap to Google Search Console.
    - Begin building local citations on relevant directories.

**Expected Outcome:** A live, conversion‑ready website. A fully automated lead capture → CRM → email sequence pipeline.

---

### Priority 3: Launch the Geo‑Fencing Ad Campaign (Google Ads)

This is the only paid component, but we can start with the **$500 Google Ads promotional credit** to minimize out‑of‑pocket cost.

**Agent Tasks:**

1.  **Create a Google Ads Account**
    - Sign up. Ensure the promotional credit offer is applied (spend $500, get $500).

2.  **Build the First Campaign**
    - Use the ad copy variants provided (problem‑aware headlines like “Quoted $5,000+ for TPLO? Save 60%”).
    - Configure geo‑fencing: target mobile devices within a 1‑mile radius of high‑cost specialty and emergency vet hospitals in Florida (BluePearl, VCA, UF Vet Hospital, etc.).
    - Set a low daily budget (e.g., $20/day) to test performance.
    - Direct all clicks to the /get‑started intake form page.

3.  **Monitor & Optimize Weekly**
    - Track click‑through rate, cost per click, and conversion rate (form submissions).
    - Pause underperforming headlines; scale those with high conversion rates.

**Expected Outcome:** A steady trickle of high‑intent leads from pet owners actively at the point of being quoted an unaffordable surgery.

---

### Priority 4: Recruit the First 5 Pilot Clients

The pilot trip needs 3‑5 paying clients to validate the model.

**Agent Tasks:**

1.  **Email Existing Waitlist (if any)**
    - If you have any early inquiries, send them the official “We’re now booking our first trip” email with a link to schedule a consultation.

2.  **Social Media Push**
    - Use the Social Media Calendar already created. Prioritize the Facebook and Instagram posts targeting breed‑specific groups (French Bulldog, Pug, large breed dogs prone to ACL tears).
    - Post in local Florida pet owner groups (Nextdoor, Facebook) – focus on the cost comparison angle.

3.  **Direct Vet Outreach**
    - Send the Referral Partner Agreement and a short introduction email to 10‑20 general practice vets in the Miami‑Fort Lauderdale area.
    - The pitch: “You have clients who can’t afford the TPLO you recommend. We’re their option.”

4.  **Client Consultation & Qualification**
    - Use the Jitsi Meet video conferencing tool (free) for free 15‑minute consultations.
    - Qualify candidates using the intake form data.
    - Once qualified, send the Client Service Agreement via OpenSign for e‑signature.
    - Collect the concierge fee via Invoice Ninja (card payment or bank transfer).

**Expected Outcome:** 5 signed clients with completed paperwork and paid fees, ready for the first Freeport day‑trip.

---

### Priority 5: Finalize Operational Logistics for the Pilot Trip

With clients booked, execute the trip logistics flawlessly.

**Agent Tasks:**

1.  **Import Permits**
    - Submit the Click2Clear ePermit applications for all 5 pets. Pay the $11.20 per pet.

2.  **Ferry Booking**
    - Book group ferry passage (Balearia Caribbean) for the trip date.

3.  **Clinic Scheduling**
    - Confirm surgical time slots with Freeport Veterinary Hospital for each pet, based on procedure length.

4.  **Client Packet**
    - Send each client a detailed itinerary (ferry times, what to bring, when to fast their dog, clinic address, concierge contact info).

5.  **Concierge Assignment**
    - Assign yourself (or a trained assistant) as the on‑site concierge. Ensure you have all pet medical records, permits, and the clinic’s emergency contact.

**Expected Outcome:** A fully planned, zero‑surprise execution of the very first MedPup trip, ready for documentation and testimonial capture.

---

## Why This Phase Matters

The Freeport pilot is not just about revenue. It will generate:

- **Authentic photos and video** of the process (for social proof and the website).
- **A real case study** with quantified savings (e.g., “Bella’s dental extractions: $2,200 saved”).
- **The first Google reviews** (critical for local SEO).
- **Operational learnings** that will refine the Cancun surgical trip playbook.

Every subsequent trip becomes easier because the infrastructure, the reputation, and the reusable assets are all built from this first successful execution.

---

**Shall I proceed to prepare the specific 5‑client Freeport Day‑Trip Itinerary, the pre‑trip email sequence for this group, and the post‑trip review collection workflow, or would you prefer to tackle the digital infrastructure setup (website + CRM + automation) first?**