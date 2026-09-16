/**
 * TACTICAL HUD ARCHITECTURE & INTERACTIVE ENGINE
 * Portfolio of Amaan Bhatti | Bayes Business School
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initActiveSectionObserver();
  initExperienceFilter();
  initValuationCalculator();
  initTelemetryDaemon();
  initKeyboardTacticalShortcuts();
});

/* --------------------------------------------------------------------------
   1. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const navItems = document.querySelectorAll('.mobile-nav-item');

  if (!toggleBtn || !mobileMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* --------------------------------------------------------------------------
   2. Active Section Observer for HUD Nav Links
   -------------------------------------------------------------------------- */
function initActiveSectionObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => observer.observe(sec));
}

/* --------------------------------------------------------------------------
   3. Unified Experience Filter
   -------------------------------------------------------------------------- */
function initExperienceFilter() {
  const filterBtns = document.querySelectorAll('#exp-filters .filter-btn');
  const entries = document.querySelectorAll('.timeline-entry');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      entries.forEach(entry => {
        const categories = entry.getAttribute('data-category') || '';
        if (filterValue === 'all' || categories.includes(filterValue)) {
          entry.classList.remove('hidden');
        } else {
          entry.classList.add('hidden');
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   4. Interactive Valuation Calculator Component
   -------------------------------------------------------------------------- */
function initValuationCalculator() {
  // Input elements
  const revSlider = document.getElementById('rev-slider');
  const marginSlider = document.getElementById('margin-slider');
  const waccSlider = document.getElementById('wacc-slider');
  const growthSlider = document.getElementById('growth-slider');
  const multipleSlider = document.getElementById('multiple-slider');
  const resetBtn = document.getElementById('calc-reset-btn');

  // Value displays
  const revVal = document.getElementById('rev-val');
  const marginVal = document.getElementById('margin-val');
  const waccVal = document.getElementById('wacc-val');
  const growthVal = document.getElementById('growth-val');
  const multipleVal = document.getElementById('multiple-val');

  // Output elements
  const impliedEv = document.getElementById('implied-ev');
  const evSubText = document.getElementById('ev-sub-text');
  const outEbitda = document.getElementById('out-ebitda');
  const outEvRev = document.getElementById('out-ev-rev');
  const outDcfVal = document.getElementById('out-dcf-val');
  const outSpread = document.getElementById('out-spread');

  // Sensitivity Table Elements
  const thM1 = document.getElementById('th-m1');
  const thM2 = document.getElementById('th-m2');
  const thM3 = document.getElementById('th-m3');
  const sensitivityBody = document.getElementById('sensitivity-body');

  if (!revSlider || !impliedEv) return;

  const defaultValues = {
    rev: 250,
    margin: 22,
    wacc: 9.5,
    growth: 2.5,
    multiple: 12
  };

  function updateCalculator() {
    const rev = parseFloat(revSlider.value);
    const margin = parseFloat(marginSlider.value);
    const wacc = parseFloat(waccSlider.value);
    const growth = parseFloat(growthSlider.value);
    const multiple = parseFloat(multipleSlider.value);

    // Update Slider Display Badges
    revVal.textContent = `£${rev.toFixed(0)}M`;
    marginVal.textContent = `${margin.toFixed(1)}%`;
    waccVal.textContent = `${wacc.toFixed(2)}%`;
    growthVal.textContent = `${growth.toFixed(2)}%`;
    multipleVal.textContent = `${multiple.toFixed(1)}x`;

    // Core Computations
    const ebitda = rev * (margin / 100);
    const evFromMultiple = ebitda * multiple;
    const evToRev = evFromMultiple / rev;

    // Gordon Growth Perpetual DCF Terminal Value
    // FCF Proxy ~ 75% of EBITDA after maintenance capex & tax
    const fcfProxy = ebitda * 0.75;
    const discountSpread = (wacc - growth) / 100;
    let dcfTerminalValue = 0;
    if (discountSpread > 0.005) {
      dcfTerminalValue = (fcfProxy * (1 + growth / 100)) / discountSpread;
    } else {
      dcfTerminalValue = evFromMultiple;
    }

    const spreadPct = ((dcfTerminalValue - evFromMultiple) / evFromMultiple) * 100;

    // Populate Primary Displays
    impliedEv.textContent = `£${evFromMultiple.toFixed(1)}M`;
    evSubText.textContent = `Based on ${multiple.toFixed(1)}x EV/EBITDA on £${ebitda.toFixed(1)}M LTM EBITDA`;
    outEbitda.textContent = `£${ebitda.toFixed(1)}M`;
    outEvRev.textContent = `${evToRev.toFixed(2)}x`;
    outDcfVal.textContent = `£${dcfTerminalValue.toFixed(1)}M`;

    if (spreadPct >= 0) {
      outSpread.textContent = `+${spreadPct.toFixed(1)}%`;
      outSpread.style.color = 'var(--accent-green)';
    } else {
      outSpread.textContent = `${spreadPct.toFixed(1)}%`;
      outSpread.style.color = '#f85149';
    }

    // Update Sensitivity Matrix Table
    const mLow = Math.max(2, multiple - 2);
    const mMid = multiple;
    const mHigh = multiple + 2;

    thM1.textContent = `${mLow.toFixed(1)}x`;
    thM2.textContent = `${mMid.toFixed(1)}x`;
    thM3.textContent = `${mHigh.toFixed(1)}x`;

    const waccSteps = [wacc - 1.0, wacc, wacc + 1.0];
    const multSteps = [mLow, mMid, mHigh];

    let rowsHtml = '';
    waccSteps.forEach((wStep, wIdx) => {
      const isBaseWacc = (wIdx === 1);
      rowsHtml += `<tr>`;
      rowsHtml += `<td class="${isBaseWacc ? 'cell-active' : ''}">WACC ${wStep.toFixed(1)}%</td>`;

      multSteps.forEach((mStep, mIdx) => {
        const isBaseCell = (wIdx === 1 && mIdx === 1);
        const cellEv = ebitda * mStep;
        rowsHtml += `<td class="${isBaseCell ? 'cell-active' : ''}">£${cellEv.toFixed(1)}M</td>`;
      });

      rowsHtml += `</tr>`;
    });

    sensitivityBody.innerHTML = rowsHtml;
  }

  // Attach event listeners
  [revSlider, marginSlider, waccSlider, growthSlider, multipleSlider].forEach(slider => {
    slider.addEventListener('input', updateCalculator);
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      revSlider.value = defaultValues.rev;
      marginSlider.value = defaultValues.margin;
      waccSlider.value = defaultValues.wacc;
      growthSlider.value = defaultValues.growth;
      multipleSlider.value = defaultValues.multiple;
      updateCalculator();
    });
  }

  // Initial calculation run
  updateCalculator();
}

/* --------------------------------------------------------------------------
   5. JARVIS AIOS Live Telemetry Simulation
   -------------------------------------------------------------------------- */
function initTelemetryDaemon() {
  const terminalFeed = document.getElementById('jarvis-telemetry-feed');
  if (!terminalFeed) return;

  const mockTelemetryEvents = [
    { text: "TELEMETRY 60s: FTSE 100: 8,249.40 (+0.47%) | S&P 500: 5,622.10 (+0.71%) | GBP/USD: 1.3148", type: "t-cyan" },
    { text: "TRIAGE: Inbound email parsed from advisory partner -> High-relevance term 'Restructuring Plan'", type: "t-green" },
    { text: "CALENDAR: Synced upcoming City Innovation Hub weekly editorial review [18:00 BST]", type: "t-dim" },
    { text: "TELEMETRY 60s: UK 10Y Gilt Yield: 3.82% (-4bps) | US 10Y Treasury: 3.65% (-3bps)", type: "t-cyan" },
    { text: "RADAR DISCLOSURE: Form 8-K scanned (Ticker: NVDA) -> Section 1.01 Entry Material Agreement flagged", type: "t-green" },
    { text: "TELEMETRY 60s: Brent Crude: $73.40/bbl | Gold Spot: $2,580/oz | USD/EUR: 0.8980", type: "t-cyan" }
  ];

  let eventIndex = 0;

  setInterval(() => {
    const now = new Date();
    const timeStr = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
    const event = mockTelemetryEvents[eventIndex % mockTelemetryEvents.length];
    eventIndex++;

    const newLine = document.createElement('div');
    newLine.className = 'term-line';
    newLine.innerHTML = `<span class="t-dim">${timeStr}</span> <span class="${event.type}">${event.text}</span>`;

    terminalFeed.appendChild(newLine);

    // Keep only last 6 lines
    while (terminalFeed.children.length > 6) {
      terminalFeed.removeChild(terminalFeed.firstElementChild);
    }
  }, 7000);
}

/* --------------------------------------------------------------------------
   6. Tactical Keyboard Shortcuts
   -------------------------------------------------------------------------- */
function initKeyboardTacticalShortcuts() {
  window.addEventListener('keydown', (e) => {
    // Avoid triggering when user is in input/textarea
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.key === 'c' || e.key === 'C') {
      const calcSec = document.getElementById('calculator');
      if (calcSec) calcSec.scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === 'p' || e.key === 'P') {
      const projSec = document.getElementById('projects');
      if (projSec) projSec.scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === 't' || e.key === 'T') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}
