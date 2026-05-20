---
title: "Contact"
description: "Book a free consultation with MedPup. Tell us about your pet and we'll find the lowest-cost clinic within driving distance."
---

## Contact MedPup

Prefer to email? Reach us at **hello@medpup.com**.

---

### Free Consultation Form

We'll get back to you within 24 hours. No obligation, no payment required.

<form name="contact" method="POST" netlify netlify-honeypot="bot-field">

<div class="form-group">
<label>Your Name *</label><br>
<input type="text" name="name" required />
</div>

<div class="form-group">
<label>Email *</label><br>
<input type="email" name="email" required />
</div>

<div class="form-group">
<label>Phone</label><br>
<input type="tel" name="phone" />
</div>

<div class="form-group">
<label>Pet's Name *</label><br>
<input type="text" name="pet_name" required />
</div>

<div class="form-group">
<label>Pet's Species *</label><br>
<select name="pet_species" required>
    <option value="">Select…</option>
    <option>Dog</option>
    <option>Cat</option>
</select>
</div>

<div class="form-group">
<label>Pet's Breed</label><br>
<input type="text" name="pet_breed" />
</div>

<div class="form-group">
<label>Estimated Weight (lbs)</label><br>
<input type="number" name="pet_weight" min="1" placeholder="e.g. 45" />
</div>

<div class="form-group">
<label>Your City / County *</label><br>
<input type="text" name="location" placeholder="e.g. Largo, FL (Pinellas)" required />
</div>

<div class="form-group">
<label>Diagnosis / Procedure Needed *</label><br>
<textarea name="diagnosis" rows="3" placeholder="e.g. Grade 2 periodontal disease, needs dental cleaning + 3 extractions" required></textarea>
</div>

<div class="form-group">
<label>Has your vet confirmed the diagnosis and procedure? *</label><br>
<select name="confirmed" required>
    <option value="">Select…</option>
    <option>Yes — vet confirmed</option>
    <option>Pending vet confirmation</option>
</select>
</div>

<div class="form-group">
<label>Procedure Category *</label><br>
<select name="procedure" required>
    <option value="">Select…</option>
    <option>Spay / Neuter</option>
    <option>Dental Cleaning (+/- extractions)</option>
    <option>Mass Removal (skin lump, tumor)</option>
    <option>Soft Tissue Surgery</option>
    <option>Orthopedic Surgery (TPLO, ACL)</option>
    <option>Other — explain in notes</option>
</select>
</div>

<div class="form-group">
<label>Estimated U.S. Clinic Quote</label><br>
<input type="text" name="us_quote" placeholder="e.g. $1,800 for dental with extractions" />
</div>

<div class="form-group">
<label>Do you currently have veterinary financing (CareCredit, Scratch Pay, etc.)?</label><br>
<select name="financing">
    <option value="">Prefer not to say</option>
    <option>Yes — CareCredit</option>
    <option>Yes — Scratch Pay</option>
    <option>Yes — other</option>
    <option>No</option>
</select>
</div>

<div class="form-group">
<label>Additional Notes</label><br>
<textarea name="notes" rows="3" placeholder="Anything else we should know — urgency, travel preferences (Phase 3 international), payment questions…"></textarea>
</div>

<div class="form-group">
<button type="submit">Book My Free Consultation →</button>
</div>

</form>

<style>
.form-group {
    margin-bottom: 1.25rem;
}
.form-group label {
    font-weight: 600;
    display: block;
    margin-bottom: 0.35rem;
}
.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="tel"],
.form-group input[type="number"],
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 0.65rem 0.85rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 0.95rem;
    box-sizing: border-box;
}
.form-group button[type="submit"] {
    background: #319795;
    color: white;
    padding: 12px 36px;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}
.form-group button[type="submit"]:hover {
    background: #2C7A7B;
}
</style>

<div class="disclaimer">
<strong>Note:</strong> MedPup is a coordination service, not a veterinary practice. All medical decisions are made by your licensed veterinarian. The consultation is free and does not commit you to any appointment.
</div>
