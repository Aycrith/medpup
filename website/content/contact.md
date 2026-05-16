---
title: "Get Started"
description: "Book a free consultation with MedPup. We'll review your pet's needs and provide a transparent cost estimate."
menu:
    main:
        name: Get Started
        weight: 7
---

<style>
.form-container {
    max-width: 600px;
    margin: 0 auto;
}
.form-group {
    margin-bottom: 1.2rem;
}
.form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.3rem;
    font-size: 0.95rem;
}
.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--card-separator-color);
    border-radius: 6px;
    background: var(--card-background);
    color: var(--card-text-color-main);
    font-size: 1rem;
    box-sizing: border-box;
}
.form-group textarea {
    min-height: 100px;
    resize: vertical;
}
.form-group select {
    cursor: pointer;
}
.submit-btn {
    background: #319795;
    color: white;
    border: none;
    padding: 14px 36px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    width: 100%;
    transition: background 0.2s;
}
.submit-btn:hover {
    background: #2C7A7B;
}
.disclaimer {
    font-size: 0.8rem;
    color: var(--card-text-color-secondary);
    text-align: center;
    margin-top: 1.5rem;
    font-style: italic;
}
</style>

# Start with a Free Consultation

<span class="price-highlight">Save 50-80%</span> on your dog's surgery. Get a transparent all-in cost estimate within 24 hours.

<div class="savings-box">
<strong>Fill out the form below.</strong> We'll review your pet's needs and call you within 24 hours to discuss options. No obligation, no pressure — just answers.
</div>

<div class="form-container">

<form name="medpup-intake" method="POST" netlify-honeypot="bot-field" data-netlify="true">
    <input type="hidden" name="form-name" value="medpup-intake" />
    <p style="display:none"><input name="bot-field" /></p>

    <div class="form-group">
        <label for="owner_name">Your Full Name *</label>
        <input type="text" id="owner_name" name="owner_name" required />
    </div>

    <div class="form-group">
        <label for="email">Email Address *</label>
        <input type="email" id="email" name="email" required />
    </div>

    <div class="form-group">
        <label for="phone">Phone Number</label>
        <input type="tel" id="phone" name="phone" />
    </div>

    <div class="form-group">
        <label for="pet_name">Pet's Name *</label>
        <input type="text" id="pet_name" name="pet_name" required />
    </div>

    <div class="form-group">
        <label for="species">Species</label>
        <select id="species" name="species">
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="other">Other</option>
        </select>
    </div>

    <div class="form-group">
        <label for="breed">Breed</label>
        <input type="text" id="breed" name="breed" placeholder="e.g., Labrador Retriever" />
    </div>

    <div class="form-group">
        <label for="age">Age</label>
        <input type="text" id="age" name="age" placeholder="e.g., 5 years" />
    </div>

    <div class="form-group">
        <label for="weight">Weight (lbs)</label>
        <input type="text" id="weight" name="weight" placeholder="e.g., 65" />
    </div>

    <div class="form-group">
        <label for="procedure">Procedure Needed *</label>
        <select id="procedure" name="procedure" required>
            <option value="">Select a procedure...</option>
            <option value="tplo">TPLO / ACL Surgery</option>
            <option value="dental">Dental Cleaning / Extractions</option>
            <option value="mass-removal">Mass Removal</option>
            <option value="spay-neuter">Spay / Neuter</option>
            <option value="ivdd">IVDD / Spinal Surgery</option>
            <option value="oncology">Oncology / Cancer Surgery</option>
            <option value="boas">BOAS / Airway Surgery</option>
            <option value="diagnostic">MRI / CT Scan / Diagnostics</option>
            <option value="medication">Chronic Medication Refill</option>
            <option value="other">Other</option>
        </select>
    </div>

    <div class="form-group">
        <label for="us_quote">What was your U.S. vet quote? ($)</label>
        <input type="text" id="us_quote" name="us_quote" placeholder="e.g., 5000" />
    </div>

    <div class="form-group">
        <label for="comments">Additional Details</label>
        <textarea id="comments" name="comments" placeholder="Any medical history, previous diagnoses, or questions you'd like us to address..."></textarea>
    </div>

    <div class="form-group">
        <label for="destination">Preferred Destination</label>
        <select id="destination" name="destination">
            <option value="">Not sure yet</option>
            <option value="freeport">Freeport, Bahamas (Day-Trip)</option>
            <option value="cancun">Cancun, Mexico (Surgical Trip)</option>
        </select>
    </div>

    <button type="submit" class="submit-btn">Get My Free Estimate</button>
</form>

<div class="disclaimer">
By submitting this form, you agree to be contacted by MedPup regarding your inquiry. Your information will not be shared with third parties.
</div>

</div>

---

### Prefer to Call or Email?

**Phone:** [Your Florida number]  
**Email:** hello@medpup.com

We respond to all inquiries within 2 hours during business hours.
