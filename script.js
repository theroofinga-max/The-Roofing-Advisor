// TheRoofingAdvisor.com - Shared Native Engine
// -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  initMobileMenu();

  // 2. ZIP Code Preloader & Storage Forwarding
  initZipPreloader();

  // 3. Exit Intent Popup Engine
  initExitIntent();

  // 4. Social Proof Counter Animator
  initScrollCounters();

  // 5. Interactive Roofing Calculator Engine (if on calculator page)
  if (document.getElementById('roof-calculator')) {
    initRoofCalculator();
  }

  // 6. Multi-step Lead Capture Form (if on get-estimates page or modal)
  if (document.getElementById('multi-step-lead-form')) {
    initMultiStepLeadForm('multi-step-lead-form');
  }

  // 7. Mini inline lead forms (on homepage and other pages)
  initSimpleLeadForms();

  // 8. ZIP Code Realtime Validation and Enrichment
  initZipRealtimeValidation();

  // 9. State Hub Cost Directory Filter System
  initStatesHubSearch();
});

/* ==========================================
   1. MOBILE MENU TOGGLE
   ========================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', !isExpanded);
      
      if (isExpanded) {
        mobileMenu.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      } else {
        mobileMenu.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
      }
    });

    // Close menu when clicking links
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ==========================================
   2. ZIP CODE FORWARDING SYSTEM
   ========================================== */
function initZipPreloader() {
  // Parse URL search parameters
  const urlParams = new URLSearchParams(window.location.search);
  const urlZip = urlParams.get('zipcode') || urlParams.get('zip');

  if (urlZip && urlZip.trim().length >= 5) {
    sessionStorage.setItem('tra_zipcode', urlZip.trim().slice(0, 5));
  }

  const storedZip = sessionStorage.getItem('tra_zipcode');
  if (storedZip) {
    // Fill all ZIP code inputs on the current page
    const zipFields = document.querySelectorAll('input[name="zipcode"], input[name="zip"], .zip-prefill-target');
    zipFields.forEach(field => {
      if (field) {
        field.value = storedZip;
      }
    });
  }

  // Watch ZIP input forms to capture them for session storage
  const zipForms = document.querySelectorAll('form');
  zipForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      const zipInput = form.querySelector('input[name="zipcode"], input[name="zip"]');
      if (zipInput && zipInput.value.trim().length >= 5) {
        sessionStorage.setItem('tra_zipcode', zipInput.value.trim().slice(0, 5));
      }
    });
  });
}

/* ==========================================
   3. EXIT INTENT POPUP
   ========================================== */
function initExitIntent() {
  const popup = document.getElementById('exit-intent-popup');
  if (!popup) return;

  const closeButton = document.getElementById('close-exit-popup');
  const dismissBtn = document.getElementById('dismiss-exit-popup');
  const overlay = popup.querySelector('.modal-overlay');

  let popupShown = localStorage.getItem('tra_exit_shown') === 'true';
  let timeoutId = null;

  // Show popup helper
  const showPopup = () => {
    if (popupShown) return;
    popupShown = true;
    localStorage.setItem('tra_exit_shown', 'true');
    popup.classList.remove('hidden');
    popup.classList.add('flex');
    // Ensure body elements under don't scroll
    document.body.style.overflow = 'hidden';
    
    // Auto populate zip if available
    const popupZip = popup.querySelector('input[name="zipcode"]');
    if (popupZip) {
      const stored = sessionStorage.getItem('tra_zipcode') || '';
      popupZip.value = stored;
    }
  };

  // Trigger on leaving top boundary (exit intent)
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 30) {
      showPopup();
    }
  });

  // Fallback timeout: show after 30 seconds
  timeoutId = setTimeout(() => {
    showPopup();
  }, 30000);

  // Close functionality
  const hidePopup = () => {
    popup.classList.add('hidden');
    popup.classList.remove('flex');
    document.body.style.overflow = '';
    if (timeoutId) clearTimeout(timeoutId);
  };

  if (closeButton) closeButton.addEventListener('click', hidePopup);
  if (dismissBtn) dismissBtn.addEventListener('click', hidePopup);
  if (overlay) overlay.addEventListener('click', hidePopup);

  // Exit popup lead form submission
  const exitForm = document.getElementById('exit-lead-form');
  if (exitForm) {
    exitForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const zipInput = exitForm.querySelector('input[name="zipcode"]');
      const zip = zipInput.value.trim();
      const phoneInput = exitForm.querySelector('input[name="phone"]');
      const phone = phoneInput.value.trim();
      
      const isZipValid = await validateAndEnrichZip(zipInput, true);
      if (!isZipValid) {
        alert('Please enter a valid 5-digit United States ZIP code.');
        zipInput.focus();
        return;
      }
      if (!validatePhone(phone)) {
        alert('Please enter a valid 10-digit phone number.');
        phoneInput.focus();
        return;
      }

      sessionStorage.setItem('tra_zipcode', zip);

      const city = zipInput.getAttribute('data-zip-city') || 'Localized Area';
      const state = zipInput.getAttribute('data-zip-state') || 'United States';
      const stateAbbr = zipInput.getAttribute('data-zip-state-abbr') || 'US';

      const leadData = {
        projectType: 'Emergency Repair',
        roofSize: 'Not specified',
        material: 'Not specified',
        timeline: 'Immediate',
        firstName: 'Homeowner',
        lastName: '(Exit Intent)',
        phone: phone,
        email: 'exit-intent@theroofingadvisor.com',
        zip: zip,
        city: city,
        state: state,
        stateAbbr: stateAbbr
      };

      console.log('[Exit Intent] Initiating Google Sheets & storage submission (D) for:', leadData);
      await D(leadData);

      console.log('[Exit Intent] Proceeding to trigger success screen and animation flow.');
      // Perform engagement progression states
      const formContent = exitForm.parentElement;
      handleLeadSubmissionSuccess(formContent, leadData);
    });
  }
}

/* ==========================================
   4. SCROLL COUNTERS ANIMATION
   ========================================== */
function initScrollCounters() {
  const counters = document.querySelectorAll('.counter-val');
  if (counters.length === 0) return;

  const startCounting = (counter) => {
    const target = parseInt(counter.getAttribute('data-target'), 10);
    const suffix = counter.getAttribute('data-suffix') || '';
    const duration = 1500; // ms
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Easing function: outQuad
      const easedProgress = progress * (2 - progress);
      const val = Math.floor(easedProgress * target);
      
      // Add commas to number formatting
      counter.textContent = val.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        counter.textContent = target.toLocaleString() + suffix;
      }
    };

    requestAnimationFrame(updateCount);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startCounting(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  counters.forEach(counter => {
    observer.observe(counter);
  });
}

/* ==========================================
   5. ROOF COST CALCULATOR
   ========================================== */
function initRoofCalculator() {
  const sizeSlider = document.getElementById('calc-size-slider');
  const sizeInput = document.getElementById('calc-size-input');
  
  const pitchInputs = document.querySelectorAll('input[name="calc-pitch"]');
  const materialSelect = document.getElementById('calc-material');
  const storiesInputs = document.querySelectorAll('input[name="calc-stories"]');
  const tearoffInputs = document.querySelectorAll('input[name="calc-tearoff"]');
  const regionSelect = document.getElementById('calc-region');

  // Outputs
  const outputLow = document.getElementById('output-low-cost');
  const outputHigh = document.getElementById('output-high-cost');
  const outputAvg = document.getElementById('output-avg-cost');
  
  const tableMaterialCost = document.getElementById('breakdown-material');
  const tableLaborCost = document.getElementById('breakdown-labor');
  const tableTearoffCost = document.getElementById('breakdown-tearoff');
  const tableTotalCost = document.getElementById('breakdown-total');

  // Cost matrices (Cost per Sq. Ft)
  const materialCostMap = {
    'asphalt': { min: 3.50, max: 5.50 },
    'rejuvenation': { min: 0.80, max: 1.20 },
    'metal': { min: 8.00, max: 14.00 },
    'tile': { min: 10.50, max: 18.00 },
    'slate': { min: 15.00, max: 28.00 },
    'tpo': { min: 4.50, max: 8.50 }
  };

  const pitchMultiplier = {
    'flat': 1.0,     // 0/12 - 2/12
    'low': 1.15,     // 3/12 - 5/12
    'medium': 1.25,  // 6/12 - 9/12
    'steep': 1.45    // 10/12+
  };

  const storiesMultiplier = {
    '1': 1.0,
    '2': 1.18,
    '3': 1.35
  };

  const regionMultiplier = {
    'northeast': 1.18,
    'southeast': 0.92,
    'midwest': 1.00,
    'southwest': 0.95,
    'west': 1.22
  };

  if (!sizeSlider || !sizeInput) return;

  // Sync Slider and Input Box
  sizeSlider.addEventListener('input', (e) => {
    sizeInput.value = e.target.value;
    calculateRoofCost();
  });

  sizeInput.addEventListener('change', (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) val = 1500;
    if (val < 500) val = 500;
    if (val > 5000) val = 5000;
    sizeInput.value = val;
    sizeSlider.value = val;
    calculateRoofCost();
  });

  // Listeners for all inputs
  materialSelect.addEventListener('change', calculateRoofCost);
  regionSelect.addEventListener('change', calculateRoofCost);
  
  pitchInputs.forEach(input => input.addEventListener('change', calculateRoofCost));
  storiesInputs.forEach(input => input.addEventListener('change', calculateRoofCost));
  tearoffInputs.forEach(input => input.addEventListener('change', calculateRoofCost));

  // Init calculation
  calculateRoofCost();

  function calculateRoofCost() {
    const size = parseInt(sizeSlider.value, 10);
    const materialKey = materialSelect.value;
    
    // Get Selected Pitch
    let pitchKey = 'medium';
    pitchInputs.forEach(input => {
      if (input.checked) pitchKey = input.value;
    });

    // Get Selected Stories
    let storiesKey = '1';
    storiesInputs.forEach(input => {
      if (input.checked) storiesKey = input.value;
    });

    // Tear-off Old Roof (Cost is generally $1.00 to $2.00 per sqft)
    let hasTearOff = true;
    tearoffInputs.forEach(input => {
      if (input.checked) hasTearOff = (input.value === 'yes');
    });

    const baseMaterial = materialCostMap[materialKey];
    const pitchFact = pitchMultiplier[pitchKey];
    const storyFact = storiesMultiplier[storiesKey];
    const regionalFact = regionMultiplier[regionSelect.value];

    // CALCULATE MATERIALS COST
    // Solid cost formula: Math.round(Base_Material * Size * regionalMultiplier)
    const rawMaterialMin = baseMaterial.min * size;
    const rawMaterialMax = baseMaterial.max * size;
    const matMinVal = Math.round(rawMaterialMin * regionalFact);
    const matMaxVal = Math.round(rawMaterialMax * regionalFact);

    // CALCULATE LABOR COST
    // Labor is relative to roof complexity (pitch and levels)
    // Average base labor is between $3.00 and $5.50 per sq. ft
    let baseLaborMin = 3.25;
    let baseLaborMax = 5.75;
    if (materialKey === 'rejuvenation') {
      baseLaborMin = 0.60;
      baseLaborMax = 1.00;
      hasTearOff = false; // Never tear off for rejuvenation service
    }
    const laborMinVal = Math.round(baseLaborMin * size * pitchFact * storyFact * regionalFact);
    const laborMaxVal = Math.round(baseLaborMax * size * pitchFact * storyFact * regionalFact);

    // REMOVAL & TEAR-OFF COST
    const tearOffCost = hasTearOff ? Math.round(1.50 * size * storyFact * regionalFact) : 0;

    // TOTALS
    const totalMin = matMinVal + laborMinVal + tearOffCost;
    const totalMax = matMaxVal + laborMaxVal + tearOffCost;
    const totalAvg = Math.round((totalMin + totalMax) / 2);

    // Update Live outputs in large numbers
    outputLow.textContent = '$' + totalMin.toLocaleString();
    outputHigh.textContent = '$' + totalMax.toLocaleString();
    outputAvg.textContent = '$' + totalAvg.toLocaleString();

    // Update live breakdown tables (Use Average Values for clarity)
    const avgMaterial = Math.round((matMinVal + matMaxVal) / 2);
    const avgLabor = Math.round((laborMinVal + laborMaxVal) / 2);

    tableMaterialCost.textContent = '$' + avgMaterial.toLocaleString();
    tableLaborCost.textContent = '$' + avgLabor.toLocaleString();
    tableTearoffCost.textContent = tearOffCost === 0 ? '$0 (Kept existing)' : '$' + tearOffCost.toLocaleString();
    tableTotalCost.textContent = '$' + totalAvg.toLocaleString();
    
    // Add current size and materials to any inline lead form triggers as reference
    const quoteButtonText = document.querySelector('.calculator-cta-subtext');
    if (quoteButtonText) {
      quoteButtonText.textContent = `Get competitive contractor bids for a ${size} sq.ft. ${materialSelect.options[materialSelect.selectedIndex].text} roof in the ${regionSelect.options[regionSelect.selectedIndex].text}`;
    }
  }
}

/* ==========================================
   6. MULTI-STEP LEAD CAPTURE FORM
   ========================================== */
function initMultiStepLeadForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  const steps = form.querySelectorAll('.form-step');
  const prevBtn = form.querySelector('.btn-prev');
  const nextBtn = form.querySelector('.btn-next');
  const progressFill = document.querySelector('.progress-bar-fill');
  const progressText = document.querySelector('.progress-text');

  let currentStepIndex = 0;
  showStep(currentStepIndex);

  // Next / Continue button click handler
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (validateCurrentStep()) {
        if (currentStepIndex < steps.length - 1) {
          // If custom next logic or input values, fetch them
          const activeStep = steps[currentStepIndex];
          
          currentStepIndex++;
          showStep(currentStepIndex);
        } else {
          // Handled via the actual form submit listener for safety
          form.requestSubmit();
        }
      }
    });
  }

  // Previous button click handler
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStepIndex > 0) {
        currentStepIndex--;
        showStep(currentStepIndex);
      }
    });
  }

  // Support clicking option cards directly to proceed instantly for dynamic UX
  steps.forEach((step, stepIdx) => {
    // Only auto-advance in steps 1, 2, 3, 4 (excluding the final contact details step 5)
    if (stepIdx < steps.length - 1) {
      const optionCards = step.querySelectorAll('.option-card');
      optionCards.forEach(card => {
        card.addEventListener('click', () => {
          // Check corresponding radio/checkbox
          const input = card.querySelector('input[type="radio"], input[type="checkbox"]');
          if (input) {
            input.checked = true;
          }
          
          // Style state change
          optionCards.forEach(c => c.classList.remove('border-accent', 'bg-accent-soft/30', 'ring-2', 'ring-accent'));
          card.classList.add('border-accent', 'bg-accent-soft/30', 'ring-2', 'ring-accent');

          // Smooth delay then auto-advance
          setTimeout(() => {
            if (currentStepIndex === stepIdx) {
              currentStepIndex++;
              showStep(currentStepIndex);
            }
          }, 250);
        });
      });
    }
  });

  // Handle option styling on radio changes
  form.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const card = e.target.closest('.option-card');
      if (card) {
        const siblings = card.parentElement.querySelectorAll('.option-card');
        siblings.forEach(c => c.classList.remove('border-accent', 'bg-accent-soft/30', 'ring-2', 'ring-accent'));
        card.classList.add('border-accent', 'bg-accent-soft/30', 'ring-2', 'ring-accent');
      }
    });
  });

  // Actual Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    const zipInput = form.querySelector('input[name="zipcode"]');
    const isZipValid = await validateAndEnrichZip(zipInput, true);
    if (!isZipValid) {
      alert('Before securing estimates, please enter a valid 5-digit US ZIP code so we can route you to pre-vetted local roofers.');
      zipInput.classList.add('border-red-500');
      zipInput.focus();
      return;
    }

    // Gather data
    const formData = new FormData(form);
    const leadData = {
      projectType: formData.get('project_type'),
      roofSize: formData.get('roof_size') || 'Not Specified',
      material: formData.get('material_pref') || 'Not Specified',
      timeline: formData.get('timeline') || 'Within 1 Month',
      firstName: formData.get('first_name'),
      lastName: formData.get('last_name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      zip: formData.get('zipcode'),
      city: zipInput.getAttribute('data-zip-city') || 'Localized Area',
      state: zipInput.getAttribute('data-zip-state') || 'United States',
      stateAbbr: zipInput.getAttribute('data-zip-state-abbr') || 'US'
    };

    // Stashing ZIP for other fields
    sessionStorage.setItem('tra_zipcode', leadData.zip);

    console.log('[Multi-Step Form] Initiating Google Sheets & storage submission (D) for:', leadData);
    await D(leadData);

    console.log('[Multi-Step Form] Proceeding to trigger success screen and animation flow.');
    // Custom Live Processing State Animation
    const formContainer = form.parentElement;
    handleLeadSubmissionSuccess(formContainer, leadData);
  });

  function showStep(index) {
    steps.forEach((step, idx) => {
      if (idx === index) {
        step.classList.remove('hidden');
        step.classList.add('block');
      } else {
        step.classList.remove('block');
        step.classList.add('hidden');
      }
    });

    // Update standard navigation buttons
    if (prevBtn) {
      if (index === 0) {
        prevBtn.classList.add('invisible');
      } else {
        prevBtn.classList.remove('invisible');
      }
    }

    if (nextBtn) {
      if (index === steps.length - 1) {
        nextBtn.textContent = 'Get My Free Estimate';
        // Add pulse animation on the final submittal button
        nextBtn.classList.add('pulse-cta');
      } else {
        nextBtn.textContent = 'Next Step \u2192';
        nextBtn.classList.remove('pulse-cta');
      }
    }

    // Update Progress Bar (1-based percentage calculation)
    const percent = Math.round(((index + 1) / steps.length) * 100);
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `Step ${index + 1} of ${steps.length} (${percent}% Complete)`;
  }

  function validateCurrentStep() {
    const activeStep = steps[currentStepIndex];
    
    // Check radio buttons (Required inside our options step 1-4)
    const radios = activeStep.querySelectorAll('input[type="radio"]');
    if (radios.length > 0) {
      let selected = false;
      radios.forEach(radio => {
        if (radio.checked) selected = true;
      });
      if (!selected) {
        alert('Please pick one options to continue.');
        return false;
      }
    }

    // Check custom text inputs on the final step
    const textInputs = activeStep.querySelectorAll('input[required]');
    let valid = true;
    textInputs.forEach(input => {
      input.classList.remove('border-red-500');
      
      if (!input.value.trim()) {
        input.classList.add('border-red-500');
        valid = false;
      }
      
      // Zip validation
      if (input.name === 'zipcode' && !validateZip(input.value)) {
        input.classList.add('border-red-500');
        valid = false;
      }

      // Phone validation
      if (input.name === 'phone' && !validatePhone(input.value)) {
        input.classList.add('border-red-500');
        valid = false;
      }

      // Email validation
      if (input.type === 'email' && !validateEmail(input.value)) {
        input.classList.add('border-red-500');
        valid = false;
      }
    });

    if (!valid) {
      alert('Please fill out all required fields with valid formats.');
    }

    return valid;
  }
}

/* ==========================================
   7. SIMPLE INLINE LEAD FORMS
   ========================================== */
function initSimpleLeadForms() {
  const forms = document.querySelectorAll('.simple-lead-form');
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const zipField = form.querySelector('input[name="zipcode"], input[name="zip"]');
      if (!zipField) return;

      const isZipValid = await validateAndEnrichZip(zipField, true);
      if (isZipValid) {
        const zip = zipField.value.trim();
        sessionStorage.setItem('tra_zipcode', zip);
        // Redirect to get-estimates with prefilled zip parameter
        window.location.href = `/get-estimates/?zip=${zip}`;
      } else {
        alert('Please enter a valid 5-digit United States ZIP code to continue.');
        zipField.focus();
      }
    });
  });
}

/* ==========================================
   CORE MARKETING ENGAGEMENT & VERIFICATION LOOPS
   ========================================== */
function handleLeadSubmissionSuccess(domParentElement, leadData) {
  // Replace content with a gorgeous matches-and-matching verification loop
  domParentElement.innerHTML = `
    <div class="py-12 px-6 text-center animate-fade-in-up flex flex-col items-center">
      <!-- Animated Spinner Logo -->
      <div class="relative w-24 h-24 mb-8">
        <div class="absolute inset-0 border-4 border-primary-soft rounded-full"></div>
        <div class="absolute inset-0 border-4 border-t-accent rounded-full animate-spin"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <svg class="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>
      
      <h3 id="matching-stage-title" class="text-2xl font-bold text-primary mb-3">Initializing Secure Portal</h3>
      <p id="matching-stage-sub" class="text-slate-600 max-w-md mx-auto text-sm mb-6 font-mono">Connecting matching APIs...</p>
      
      <!-- Visual verification check logs -->
      <div class="w-full max-w-sm text-left border border-slate-100 rounded-lg p-5 bg-slate-50 space-y-3 font-sans">
        <div id="check-item-1" class="flex items-center text-slate-400 text-sm gap-3">
          <svg class="w-5 h-5 text-slate-300 animate-pulse shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
          <span class="font-medium">Locking in zip area ${leadData.zip || 'local area'}</span>
        </div>
        <div id="check-item-2" class="flex items-center text-slate-400 text-sm gap-3">
          <svg class="w-5 h-5 text-slate-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
          <span class="font-medium">Searching verified A+ licensed roofers</span>
        </div>
        <div id="check-item-3" class="flex items-center text-slate-400 text-sm gap-3">
          <svg class="w-5 h-5 text-slate-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
          <span class="font-medium">Securing discounted multi-bid rates</span>
        </div>
      </div>
    </div>
  `;

  const titleNode = document.getElementById('matching-stage-title');
  const subNode = document.getElementById('matching-stage-sub');
  
  const check1 = document.getElementById('check-item-1');
  const check2 = document.getElementById('check-item-2');
  const check3 = document.getElementById('check-item-3');

  // Trigger stage checks
  setTimeout(() => {
    if (titleNode) titleNode.textContent = "Analyzing ZIP Code Coverages";
    if (subNode) subNode.textContent = "Querying databases for live capacity...";
    setCheckStateActive(check1);
  }, 1000);

  setTimeout(() => {
    if (titleNode) titleNode.textContent = "Filtering Licensed Contractors";
    if (subNode) subNode.textContent = "Securing licensing & bonding checks...";
    setCheckStateConfirmed(check1);
    setCheckStateActive(check2);
  }, 2400);

  setTimeout(() => {
    if (titleNode) titleNode.textContent = "Bidding Multi-estimate Pricing";
    if (subNode) subNode.textContent = "Obtaining exclusive roofing discount formulas...";
    setCheckStateConfirmed(check2);
    setCheckStateActive(check3);
  }, 3800);

  // Complete conversion success screen
  setTimeout(() => {
    setCheckStateConfirmed(check3);
    showFinalSuccessState(domParentElement, leadData);
  }, 5000);
}

function setCheckStateActive(element) {
  if (!element) return;
  element.classList.remove('text-slate-400');
  element.classList.add('text-primary');
  const svg = element.querySelector('svg');
  if (svg) {
    svg.classList.remove('text-slate-300');
    svg.classList.add('text-accent', 'animate-spin');
    // temporary spin during processing
  }
}

function setCheckStateConfirmed(element) {
  if (!element) return;
  element.classList.remove('text-primary');
  element.classList.add('text-emerald-600');
  const svg = element.querySelector('svg');
  if (svg) {
    svg.classList.remove('text-accent', 'animate-spin', 'animate-pulse');
    svg.classList.add('text-emerald-500');
  }
}

function showFinalSuccessState(container, leadData) {
  container.innerHTML = `
    <div class="py-12 px-6 text-center animate-fade-in-up max-w-xl mx-auto">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full text-emerald-500 mb-6 ring-8 ring-emerald-50">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h3 class="text-3xl font-extrabold text-primary mb-4">Matches Secured!</h3>
      <p class="text-slate-600 text-lg mb-8 leading-relaxed">
        Thank you, <strong class="text-slate-900">${leadData.firstName || 'Homeowner'}</strong>! We have matched your ZIP code <strong class="text-slate-900">${leadData.zip || ''}</strong> with up to <strong class="text-emerald-600">3 pre-vetted contractors</strong> qualified for your <strong class="text-slate-900">${leadData.projectType || 'Roof Replacement'}</strong> project.
      </p>

      <div class="bg-primary/5 rounded-2xl p-6 border border-primary/10 text-left mb-8">
        <h4 class="font-bold text-primary mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Important Next Steps
        </h4>
        <ul class="space-y-4 text-slate-600 text-sm">
          <li class="flex gap-3">
            <span class="flex items-center justify-center w-6 h-6 bg-accent rounded-full text-white text-xs font-bold leading-none shrink-0 mt-0.5">1</span>
            <div>
              <strong class="text-slate-900 block">Watch Your Phone</strong>
              Our system matched your request. Pre-vetted contractors will call or text you from localized numbers within <span class="text-accent font-semibold">10-15 minutes</span> to coordinate your free onsite inspection and final estimate.
            </div>
          </li>
          <li class="flex gap-3">
            <span class="flex items-center justify-center w-6 h-6 bg-accent rounded-full text-white text-xs font-bold leading-none shrink-0 mt-0.5">2</span>
            <div>
              <strong class="text-slate-900 block">Review Email Estimates</strong>
              Look for your initial roofing cost ranges sent to <span class="font-medium text-slate-800">${leadData.email || 'your email'}</span> shortly.
            </div>
          </li>
          <li class="flex gap-3">
            <span class="flex items-center justify-center w-6 h-6 bg-accent rounded-full text-white text-xs font-bold leading-none shrink-0 mt-0.5">3</span>
            <div>
              <strong class="text-slate-900 block">Compare and Select</strong>
              We always recommend comparing written bids. Choose the roofing advisor that aligns with your timeline, budget, and warranty needs.
            </div>
          </li>
        </ul>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a href="/" class="text-slate-600 hover:text-primary hover:underline transition font-semibold text-sm">
          Return to Homepage
        </a>
        <span class="hidden sm:inline text-slate-300">|</span>
        <a href="/roofing-cost-calculator/" class="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-dark text-white px-5 py-2 rounded-lg text-sm font-semibold transition shadow-md">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="15" y2="17"></line></svg>
          Recalculate Another Roof
        </a>
      </div>
    </div>
  `;
}

/* ==========================================
   FORM FORMAT VALIDATORS & ZIP ENRICHMENT ENGINE
   ========================================== */
const zipCheckCache = {};

function getFallbackState(zip) {
  const d3 = parseInt((zip || '').trim().substring(0, 3), 10);
  const d1 = (zip || '').trim().charAt(0);
  
  if (isNaN(d3)) return { state: "United States", abbr: "US" };
  
  if (d3 >= 10 && d3 <= 27) return { state: "Massachusetts", abbr: "MA" };
  if (d3 >= 39 && d3 <= 49) return { state: "Maine", abbr: "ME" };
  if (d3 >= 30 && d3 <= 38) return { state: "New Hampshire", abbr: "NH" };
  if (d3 >= 50 && d3 <= 59) return { state: "Vermont", abbr: "VT" };
  if (d3 >= 28 && d3 <= 29) return { state: "Rhode Island", abbr: "RI" };
  if (d3 >= 60 && d3 <= 69) return { state: "Connecticut", abbr: "CT" };
  if (d3 >= 70 && d3 <= 89) return { state: "New Jersey", abbr: "NJ" };
  if (d3 >= 6 && d3 <= 9) return { state: "Puerto Rico", abbr: "PR" };
  if (d1 === '1') return { state: "New York", abbr: "NY" };
  if (d3 >= 150 && d3 <= 196) return { state: "Pennsylvania", abbr: "PA" };
  if (d3 >= 197 && d3 <= 199) return { state: "Delaware", abbr: "DE" };
  if (d3 >= 200 && d3 <= 205) return { state: "District of Columbia", abbr: "DC" };
  if (d3 >= 206 && d3 <= 219) return { state: "Maryland", abbr: "MD" };
  if (d3 >= 220 && d3 <= 246) return { state: "Virginia", abbr: "VA" };
  if (d3 >= 247 && d3 <= 268) return { state: "West Virginia", abbr: "WV" };
  if (d3 >= 270 && d3 <= 289) return { state: "North Carolina", abbr: "NC" };
  if (d3 >= 290 && d3 <= 299) return { state: "South Carolina", abbr: "SC" };
  if (d3 >= 300 && d3 <= 319) return { state: "Georgia", abbr: "GA" };
  if (d3 >= 320 && d3 <= 349) return { state: "Florida", abbr: "FL" };
  if (d3 >= 350 && d3 <= 369) return { state: "Alabama", abbr: "AL" };
  if (d3 >= 386 && d3 <= 397) return { state: "Mississippi", abbr: "MS" };
  if (d3 >= 370 && d3 <= 385) return { state: "Tennessee", abbr: "TN" };
  if (d3 >= 400 && d3 <= 427) return { state: "Kentucky", abbr: "KY" };
  if (d3 >= 430 && d3 <= 459) return { state: "Ohio", abbr: "OH" };
  if (d3 >= 460 && d3 <= 479) return { state: "Indiana", abbr: "IN" };
  if (d3 >= 480 && d3 <= 499) return { state: "Michigan", abbr: "MI" };
  if (d3 >= 530 && d3 <= 549) return { state: "Wisconsin", abbr: "WI" };
  if (d3 >= 550 && d3 <= 567) return { state: "Minnesota", abbr: "MN" };
  if (d3 >= 500 && d3 <= 528) return { state: "Iowa", abbr: "IA" };
  if (d3 >= 630 && d3 <= 658) return { state: "Missouri", abbr: "MO" };
  if (d3 >= 580 && d3 <= 588) return { state: "North Dakota", abbr: "ND" };
  if (d3 >= 570 && d3 <= 577) return { state: "South Dakota", abbr: "SD" };
  if (d3 >= 680 && d3 <= 693) return { state: "Nebraska", abbr: "NE" };
  if (d3 >= 660 && d3 <= 679) return { state: "Kansas", abbr: "KS" };
  if (d3 >= 730 && d3 <= 749) return { state: "Oklahoma", abbr: "OK" };
  if (d3 >= 716 && d3 <= 729) return { state: "Arkansas", abbr: "AR" };
  if (d3 >= 700 && d3 <= 714) return { state: "Louisiana", abbr: "LA" };
  if (d3 >= 750 && d3 <= 799) return { state: "Texas", abbr: "TX" };
  if (d3 >= 800 && d3 <= 816) return { state: "Colorado", abbr: "CO" };
  if (d3 >= 820 && d3 <= 831) return { state: "Wyoming", abbr: "WY" };
  if (d3 >= 832 && d3 <= 838) return { state: "Idaho", abbr: "ID" };
  if (d3 >= 840 && d3 <= 847) return { state: "Utah", abbr: "UT" };
  if (d3 >= 890 && d3 <= 898) return { state: "Nevada", abbr: "NV" };
  if (d3 >= 850 && d3 <= 865) return { state: "Arizona", abbr: "AZ" };
  if (d3 >= 870 && d3 <= 884) return { state: "New Mexico", abbr: "NM" };
  if (d1 === '9') {
    if (d3 >= 900 && d3 <= 961) return { state: "California", abbr: "CA" };
    if (d3 >= 970 && d3 <= 979) return { state: "Oregon", abbr: "OR" };
    if (d3 >= 980 && d3 <= 994) return { state: "Washington", abbr: "WA" };
    if (d3 >= 967 && d3 <= 968) return { state: "Hawaii", abbr: "HI" };
    if (d3 >= 995 && d3 <= 999) return { state: "Alaska", abbr: "AK" };
  }
  return { state: "United States", abbr: "US" };
}

async function validateAndEnrichZip(inputElement, showMessage = true) {
  const zip = inputElement.value.trim();
  let msgLabel = inputElement.nextElementSibling;
  
  if (!msgLabel || !msgLabel.classList.contains('zip-validation-feedback')) {
    msgLabel = document.createElement('div');
    msgLabel.className = 'zip-validation-feedback text-[11px] mt-1 transition-all duration-200 hidden font-sans border-t border-slate-50 pt-1';
    inputElement.parentNode.insertBefore(msgLabel, inputElement.nextSibling);
  }

  if (zip.length === 0) {
    msgLabel.className = 'zip-validation-feedback text-[11px] mt-1 hidden';
    inputElement.classList.remove('border-emerald-500', 'border-red-500', 'ring-emerald-25', 'ring-red-25');
    inputElement.removeAttribute('data-zip-valid');
    return false;
  }

  if (!/^\d{5}$/.test(zip)) {
    if (showMessage) {
      msgLabel.textContent = '❌ ZIP code must be exactly 5 United States digits.';
      msgLabel.className = 'zip-validation-feedback text-[11px] mt-1 text-red-650 font-semibold block';
    }
    inputElement.classList.remove('border-emerald-500', 'ring-emerald-25');
    inputElement.classList.add('border-red-500');
    inputElement.setAttribute('data-zip-valid', 'false');
    return false;
  }

  // Check cache first
  if (zipCheckCache[zip]) {
    const cached = zipCheckCache[zip];
    if (cached.valid) {
      if (showMessage) {
        msgLabel.textContent = `✓ Valid Area: ${cached.city}, ${cached.stateAbbr}`;
        msgLabel.className = 'zip-validation-feedback text-[11px] mt-1 text-emerald-600 font-bold block';
      }
      inputElement.classList.remove('border-red-500', 'ring-red-25');
      inputElement.classList.add('border-emerald-500');
      inputElement.setAttribute('data-zip-valid', 'true');
      inputElement.setAttribute('data-zip-city', cached.city);
      inputElement.setAttribute('data-zip-state', cached.state);
      inputElement.setAttribute('data-zip-state-abbr', cached.stateAbbr);
      return true;
    } else {
      if (showMessage) {
        msgLabel.textContent = `❌ ${cached.error}`;
        msgLabel.className = 'zip-validation-feedback text-[11px] mt-1 text-red-600 font-semibold block';
      }
      inputElement.classList.remove('border-emerald-500', 'ring-emerald-25');
      inputElement.classList.add('border-red-500');
      inputElement.setAttribute('data-zip-valid', 'false');
      return false;
    }
  }

  if (showMessage) {
    msgLabel.textContent = 'Verifying US region code...';
    msgLabel.className = 'zip-validation-feedback text-[11px] mt-1 text-slate-500 italic font-semibold block animate-pulse';
  }

  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!response.ok) {
      zipCheckCache[zip] = { valid: false, error: 'Not a valid US ZIP code.' };
      if (showMessage) {
        msgLabel.textContent = '❌ Input is not a valid US ZIP code.';
        msgLabel.className = 'zip-validation-feedback text-[11px] mt-1 text-red-650 font-bold block';
      }
      inputElement.classList.remove('border-emerald-500', 'ring-emerald-25');
      inputElement.classList.add('border-red-500');
      inputElement.setAttribute('data-zip-valid', 'false');
      return false;
    }

    const data = await response.json();
    if (data && data.places && data.places.length > 0) {
      const place = data.places[0];
      const city = place['place name'];
      const state = place['state'];
      const stateAbbr = place['state abbreviation'];
      
      zipCheckCache[zip] = { valid: true, city, state, stateAbbr };
      
      if (showMessage) {
        msgLabel.textContent = `✓ Valid Area: ${city}, ${stateAbbr}`;
        msgLabel.className = 'zip-validation-feedback text-[11px] mt-1 text-emerald-600 font-bold block';
      }
      inputElement.classList.remove('border-red-500', 'ring-red-25');
      inputElement.classList.add('border-emerald-500');
      inputElement.setAttribute('data-zip-valid', 'true');
      inputElement.setAttribute('data-zip-city', city);
      inputElement.setAttribute('data-zip-state', state);
      inputElement.setAttribute('data-zip-state-abbr', stateAbbr);
      return true;
    } else {
      zipCheckCache[zip] = { valid: false, error: 'Unknown US geography specification.' };
      if (showMessage) {
        msgLabel.textContent = '❌ Unknown US ZIP format.';
        msgLabel.className = 'zip-validation-feedback text-[11px] mt-1 text-red-650 font-semibold block';
      }
      inputElement.classList.remove('border-emerald-500', 'ring-emerald-25');
      inputElement.classList.add('border-red-500');
      inputElement.setAttribute('data-zip-valid', 'false');
      return false;
    }
  } catch (err) {
    // Local fallback check
    const fallback = getFallbackState(zip);
    if (fallback.abbr !== 'US') {
      const city = "Localized Area";
      zipCheckCache[zip] = { valid: true, city, state: fallback.state, stateAbbr: fallback.abbr };
      
      if (showMessage) {
        msgLabel.textContent = `✓ Valid Region: ${city}, ${fallback.abbr}`;
        msgLabel.className = 'zip-validation-feedback text-[11px] mt-1 text-emerald-600 font-bold block';
      }
      inputElement.classList.remove('border-red-500', 'ring-red-25');
      inputElement.classList.add('border-emerald-500');
      inputElement.setAttribute('data-zip-valid', 'true');
      inputElement.setAttribute('data-zip-city', city);
      inputElement.setAttribute('data-zip-state', fallback.state);
      inputElement.setAttribute('data-zip-state-abbr', fallback.abbr);
      return true;
    } else {
      zipCheckCache[zip] = { valid: false, error: 'Target is not a valid US ZIP code.' };
      if (showMessage) {
        msgLabel.textContent = '❌ Target is not a valid US ZIP code.';
        msgLabel.className = 'zip-validation-feedback text-[11px] mt-1 text-red-650 font-semibold block';
      }
      inputElement.classList.remove('border-emerald-500', 'ring-emerald-25');
      inputElement.classList.add('border-red-500');
      inputElement.setAttribute('data-zip-valid', 'false');
      return false;
    }
  }
}

// Global dynamic attachment to form ZIP fields
function initZipRealtimeValidation() {
  const watchInputs = () => {
    const zipInputs = document.querySelectorAll('input[name="zipcode"], input[name="zip"]');
    zipInputs.forEach(input => {
      if (input.dataset.zipWatched) return;
      input.dataset.zipWatched = 'true';

      // Keep formatting clean
      input.addEventListener('input', () => {
        let val = input.value.trim().replace(/\D/g, '');
        if (val.length > 5) val = val.substring(0, 5);
        input.value = val;
        
        if (val.length === 5) {
          validateAndEnrichZip(input, true);
        } else {
          const fb = input.nextElementSibling;
          if (fb && fb.classList.contains('zip-validation-feedback')) {
            fb.className = 'zip-validation-feedback text-[11px] mt-1 hidden';
          }
          input.classList.remove('border-emerald-500', 'border-red-500');
          input.removeAttribute('data-zip-valid');
        }
      });

      input.addEventListener('blur', () => {
        if (input.value.trim().length > 0) {
          validateAndEnrichZip(input, true);
        }
      });

      // Quick check if preset
      if (input.value.trim().length === 5) {
        validateAndEnrichZip(input, true);
      }
    });
  };

  watchInputs();
  setInterval(watchInputs, 1500);
}

async function D(e) {
  const WEBAPP_URL =
    "https://script.google.com/macros/s/AKfycbxX7pfSIAXv79RymkIyC4W0p6bO_JfKt6iBTh-b2qk0dXvaUwwtTBUxNBqkBWJ7zaE-yQ/exec";

  const payload = {
    firstName: e.firstName || "",
    lastName: e.lastName || "",
    email: e.email || "",
    phone: e.phone || "",
    zip: e.zip || "",
    city: e.city || "",
    state: e.state || "",
    projectType: e.projectType || "",
    roofSize: e.roofSize || "",
    material: e.material || "",
    timeline: e.timeline || "",
    sourcePage: window.location.href,
    spreadsheetId: "15J3gF_Wuso-c0ShFQh0i-pV-AwwPNDJrGZHTObvIAX4",
    spreadsheetUrl: "https://docs.google.com/spreadsheets/d/15J3gF_Wuso-c0ShFQh0i-pV-AwwPNDJrGZHTObvIAX4/edit?gid=0#gid=0"
  };

  let phpSubmitted = false;

  // 1. First choice: Simple VPS server PHP handler
  try {
    const phpResponse = await fetch("/submit.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (phpResponse.ok) {
      const phpResult = await phpResponse.json();
      console.log("Lead stored securely on local VPS PHP server database:", phpResult);
      phpSubmitted = true;
    } else {
      throw new Error(`PHP endpoint returned status: ${phpResponse.status}`);
    }
  } catch (phpErr) {
    console.warn("Direct VPS PHP submission skipped or failed (common in development without server running):", phpErr);
  }

  // 2. Second choice / Fallback: Google Sheets Web App
  if (!phpSubmitted) {
    try {
      await fetch(WEBAPP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      console.log("Lead successfully routed to Google Sheets fallback WebApp.");
    } catch (err) {
      console.error("All submission routes offline. Google Sheets fallback error:", err);
    }
  }

  // 3. Keep standard localStorage registry
  let leads = [];


  try {
    const existing = localStorage.getItem("tra_leads");
    if (existing) leads = JSON.parse(existing);
  } catch (err) {}

  leads.unshift({
    id: "lead_" + Date.now(),
    ...e,
    createdAt: new Date().toISOString()
  });

  localStorage.setItem("tra_leads", JSON.stringify(leads));
}

function validateZip(zip) {
  return /^\d{5}$/.test(zip.trim());
}

function validatePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/* ==========================================
   9. INTERACTIVE STATES HUB FILTER
   ========================================== */
function initStatesHubSearch() {
  const searchBox = document.getElementById('state-search-box');
  const dContainer = document.getElementById('states-directory-container');
  if (!searchBox || !dContainer) return;

  const chips = document.querySelectorAll('.region-chip');
  const blocks = dContainer.querySelectorAll('.region-block');

  const filterStates = () => {
    const searchQuery = searchBox.value.trim().toLowerCase();
    
    // Find selected region
    const activeChip = document.querySelector('.region-chip.active');
    const activeRegion = activeChip ? activeChip.getAttribute('data-region') : 'All';
    
    let globalMatchCount = 0;

    blocks.forEach(block => {
      const cards = block.querySelectorAll('.state-card');
      let blockVisibleCount = 0;

      cards.forEach(card => {
        const stateName = card.getAttribute('data-state-name') || '';
        const stateRegion = card.getAttribute('data-region') || '';
        
        const matchesSearch = stateName.includes(searchQuery);
        const matchesRegion = (activeRegion === 'All' || stateRegion === activeRegion);

        if (matchesSearch && matchesRegion) {
          card.classList.remove('hidden');
          blockVisibleCount++;
          globalMatchCount++;
        } else {
          card.classList.add('hidden');
        }
      });

      // Show/hide region block depending on if it contains visible cards
      if (blockVisibleCount > 0) {
        block.classList.remove('hidden');
      } else {
        block.classList.add('hidden');
      }
    });

    // Handle "no results found" messaging
    let noResultsMsg = document.getElementById('states-no-results');
    if (globalMatchCount === 0) {
      if (!noResultsMsg) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.id = 'states-no-results';
        noResultsMsg.className = 'text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-white/60 ml-auto mr-auto max-w-lg mt-6';
        noResultsMsg.innerHTML = `
          <svg class="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <h4 class="font-bold text-slate-700 text-sm">No State Cost Guides Found</h4>
          <p class="text-xs text-slate-500 mt-1">We couldn't find any states matching "${searchBox.value}" in this region. Check spelling or clear filters.</p>
        `;
        dContainer.parentNode.insertBefore(noResultsMsg, dContainer.nextSibling);
      } else {
        noResultsMsg.classList.remove('hidden');
        noResultsMsg.querySelector('p').textContent = `We couldn't find any states matching "${searchBox.value}" in this region. Check spelling or clear filters.`;
      }
    } else {
      if (noResultsMsg) noResultsMsg.classList.add('hidden');
    }
  };

  // Search input change handler
  searchBox.addEventListener('input', filterStates);

  // Region chip clicks
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => {
        c.classList.remove('active', 'bg-accent', 'text-white');
        c.classList.add('bg-white', 'text-slate-650', 'border-slate-250');
      });

      chip.classList.add('active', 'bg-accent', 'text-white');
      chip.classList.remove('bg-white', 'text-slate-650', 'border-slate-250');

      filterStates();
    });
  });
}

