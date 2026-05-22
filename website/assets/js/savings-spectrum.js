/**
 * MedPup Savings Spectrum (Phase4D - Cost Spectrum Gauge)
 * Horizontal bar showing Typical US Cost vs MedPup Cost
 * Gold-highlighted gap = the savings
 */
(function () {
    'use strict';

    // Procedure data (from KNOWLEDGE_BASE.json / research)
    const procedures = {
        'spay-neuter': { us: 450, medpup: 40, label: 'Spay/Neuter' },
        'dental-cleaning': { us: 1200, medpup: 285, label: 'Dental Cleaning' },
        'soft-tissue-surgery': { us: 2500, medpup: 450, label: 'Soft Tissue Surgery' },
        'mass-removal': { us: 1800, medpup: 350, label: 'Mass Removal' },
    };

    // Current procedure
    let currentProc = 'spay-neuter';

    function createSpectrumHTML() {
        return `
        <div class="spectrum-container" data-animate="fade-up">
            <div class="spectrum-selector">
                <button class="spectrum-btn active" data-proc="spay-neuter">Spay/Neuter</button>
                <button class="spectrum-btn" data-proc="dental-cleaning">Dental</button>
                <button class="spectrum-btn" data-proc="soft-tissue-surgery">Surgery</button>
                <button class="spectrum-btn" data-proc="mass-removal">Mass Removal</button>
            </div>
            <div class="spectrum-bar-wrapper">
                <div class="spectrum-labels">
                    <span class="spectrum-label-left">$0</span>
                    <span class="spectrum-label-right">$4,000</span>
                </div>
                <div class="spectrum-bar">
                    <!-- US Cost marker (red) -->
                    <div class="spectrum-marker spectrum-marker-us" id="marker-us">
                        <div class="marker-label">Typical US Cost</div>
                        <div class="marker-value">$450</div>
                        <div class="marker-pointer"></div>
                    </div>
                    <!-- MedPup Cost marker (green) -->
                    <div class="spectrum-marker spectrum-marker-medpup" id="marker-medpup">
                        <div class="marker-label">MedPup Cost</div>
                        <div class="marker-value">$40</div>
                        <div class="marker-pointer"></div>
                    </div>
                    <!-- Savings gap (gold highlight) -->
                    <div class="spectrum-savings-gap" id="savings-gap"></div>
                </div>
                <div class="spectrum-legend">
                    <span class="legend-item"><span class="legend-dot legend-us"></span> Typical US Cost</span>
                    <span class="legend-item"><span class="legend-dot legend-medpup"></span> MedPup Cost</span>
                    <span class="legend-item"><span class="legend-dot legend-savings"></span> Your Savings</span>
                </div>
            </div>
            <div class="spectrum-summary" id="spectrum-summary">
                <div class="spectrum-savings-badge">
                    <span class="savings-percent">91%</span>
                    <span class="savings-text">Average Savings</span>
                </div>
            </div>
        </div>`;
    }

    function initSpectrum() {
        const placeholder = document.querySelector('.cost-calculator-placeholder');
        if (!placeholder) return;

        // Replace placeholder with spectrum HTML
        placeholder.outerHTML = createSpectrumHTML();

        const spectrumBar = document.querySelector('.spectrum-bar');
        const markerUs = document.getElementById('marker-us');
        const markerMedPup = document.getElementById('marker-medpup');
        const savingsGap = document.getElementById('savings-gap');
        const summary = document.getElementById('spectrum-summary');
        const buttons = document.querySelectorAll('.spectrum-btn');

        function updateSpectrum(procKey) {
            const proc = procedures[procKey];
            if (!proc) return;

            // Calculate positions (max $4,000)
            const maxCost = 4000;
            const usPos = (proc.us / maxCost) * 100;
            const medpupPos = (proc.medpup / maxCost) * 100;
            const savingsPercent = Math.round((1 - proc.medpup / proc.us) * 100);

            // Animate markers
            setTimeout(() => {
                markerUs.style.left = usPos + '%';
                markerUs.querySelector('.marker-value').textContent = '$' + proc.us.toLocaleString();
            }, 100);

            setTimeout(() => {
                markerMedPup.style.left = medpupPos + '%';
                markerMedPup.querySelector('.marker-value').textContent = '$' + proc.medpup.toLocaleString();
            }, 300);

            // Animate savings gap
            setTimeout(() => {
                savingsGap.style.left = medpupPos + '%';
                savingsGap.style.width = (usPos - medpupPos) + '%';
                savingsGap.style.opacity = '1';
            }, 500);

            // Update summary
            setTimeout(() => {
                summary.querySelector('.savings-percent').textContent = savingsPercent + '%';
                summary.classList.add('visible');
            }, 800);

            // Update active button
            buttons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.proc === procKey);
            });

            currentProc = procKey;
        }

        // Button click handlers
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                updateSpectrum(btn.dataset.proc);
            });
        });

        // IntersectionObserver to trigger on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !spectrumBar.classList.contains('animated')) {
                    spectrumBar.classList.add('animated');
                    updateSpectrum(currentProc);
                }
            });
        }, { threshold: 0.3 });

        const container = document.querySelector('.spectrum-container');
        if (container) observer.observe(container);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSpectrum);
    } else {
        initSpectrum();
    }
})();
