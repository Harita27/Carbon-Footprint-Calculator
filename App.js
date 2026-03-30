/* ================================================
   EcoTrack Carbon Calculator — app.js
   ================================================ */

// Page flow order
const PAGE_ORDER = ['home', 'house', 'travel', 'flights', 'diet', 'results'];

// Emission factors (kg CO2e)
const FACTORS = {
  electricity: 0.82,       // per kWh
  gas: 2.04,               // per unit (therm)
  oil: 2.68,               // per litre
  bike: 0.005,             // per km/week → /year
  bus: 0.089,              // per km/week → /year
  train: 0.041,            // per km/week → /year
  car: 0.192,              // per km/week → /year
  ev: 0.053,               // per km/week → /year
  moto: 0.113,             // per km/week → /year
  shortFlight: 255,        // per flight (return)
  mediumFlight: 640,       // per flight (return)
  longFlight: 1260,        // per flight (return)
  businessMultiplier: 2.5, // premium cabin multiplier
};

const DIET_FACTORS = {
  'heavy-meat':  3300,
  'avg-meat':    2500,
  'low-meat':    1900,
  'pescatarian': 1500,
  'vegetarian':  1200,
  'vegan':        900,
};

// Global diet selection
let selectedDiet = null;

// ---- Navigation ----

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const target = document.getElementById(pageId);
  if (target) target.classList.remove('hidden');

  // Update sidebar active state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });

  // Update progress
  updateProgress(pageId);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navTo(pageId) {
  if (pageId === 'results') {
    calculate();
  } else {
    showPage(pageId);
  }
}

function goNext(currentPage) {
  const idx = PAGE_ORDER.indexOf(currentPage);
  if (idx >= 0 && idx < PAGE_ORDER.length - 1) {
    const next = PAGE_ORDER[idx + 1];
    if (next === 'results') {
      calculate();
    } else {
      showPage(next);
    }
  }
}

function goBack(currentPage) {
  const idx = PAGE_ORDER.indexOf(currentPage);
  if (idx > 0) showPage(PAGE_ORDER[idx - 1]);
}

function updateProgress(pageId) {
  const idx = PAGE_ORDER.indexOf(pageId);
  // Don't count home (0) or results (5) in main progress
  const step = Math.max(0, idx - 1);
  const total = PAGE_ORDER.length - 2; // 4 data steps
  const pct = pageId === 'results' ? 100 : Math.round((step / total) * 100);
  document.getElementById('sidebarProgress').style.width = pct + '%';
  document.getElementById('progressPct').textContent = pct + '%';
}

// ---- Diet Selection ----

function selectDiet(btn) {
  document.querySelectorAll('.diet-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedDiet = btn.dataset.diet;
}

// ---- Calculation ----

function calculate() {
  const get = id => Number(document.getElementById(id)?.value) || 0;

  // Energy (monthly → annual)
  const elec     = get('electricity') * 12;
  const gas      = get('gas') * 12;
  const oil      = get('oil') * 12;
  const renewPct = get('renewable') / 100;

  const elec_em  = elec * FACTORS.electricity * (1 - renewPct);
  const gas_em   = gas  * FACTORS.gas;
  const oil_em   = oil  * FACTORS.oil;
  const energyTotal = elec_em + gas_em + oil_em;

  // Travel (weekly km → annual)
  const WEEKS = 52;
  const bike_em  = get('bike')  * WEEKS * FACTORS.bike;
  const bus_em   = get('bus')   * WEEKS * FACTORS.bus;
  const train_em = get('train') * WEEKS * FACTORS.train;
  const car_em   = get('car')   * WEEKS * FACTORS.car;
  const ev_em    = get('ev')    * WEEKS * FACTORS.ev;
  const moto_em  = get('moto')  * WEEKS * FACTORS.moto;
  const travelTotal = bike_em + bus_em + train_em + car_em + ev_em + moto_em;

  // Flights
  const bizPct   = get('business') / 100;
  const avgMulti = 1 + bizPct * (FACTORS.businessMultiplier - 1);
  const short_em  = get('short')  * FACTORS.shortFlight  * avgMulti;
  const medium_em = get('medium') * FACTORS.mediumFlight * avgMulti;
  const long_em   = get('long')   * FACTORS.longFlight   * avgMulti;
  const flightTotal = short_em + medium_em + long_em;

  // Diet
  const baseDiet  = DIET_FACTORS[selectedDiet] || DIET_FACTORS['avg-meat'];
  const wasteFactor = 1 + (get('waste') / 100) * 0.3;
  const localReduction = 1 - (get('local') / 100) * 0.1;
  const dietTotal = baseDiet * wasteFactor * localReduction;

  // Grand total
  const grandTotal = energyTotal + travelTotal + flightTotal + dietTotal;

  renderResults(grandTotal, energyTotal, travelTotal, flightTotal, dietTotal);
  showPage('results');
}

// ---- Render Results ----

function renderResults(total, energy, travel, flights, diet) {
  // Total banner
  document.getElementById('totalValue').textContent = Math.round(total).toLocaleString();

  // Comparison message
  const globalAvg = 7500; // kg CO2e/year global average
  const ukAvg = 10000;
  let comparison = '';
  if (total < 2500) comparison = '🌟 Excellent! Well below global average.';
  else if (total < globalAvg) comparison = '✅ Below the global average of ~7.5 tonnes.';
  else if (total < ukAvg) comparison = '⚠️ Around the global average. Room to improve!';
  else comparison = '🔴 Above the UK average. Significant reduction potential.';
  document.getElementById('totalComparison').textContent = comparison;

  // Category bars
  const cats = [
    { key: 'energy', val: energy },
    { key: 'travel', val: travel },
    { key: 'flights', val: flights },
    { key: 'diet',   val: diet   },
  ];
  const maxVal = Math.max(...cats.map(c => c.val), 1);

  cats.forEach(cat => {
    const pct = Math.round((cat.val / maxVal) * 100);
    const barEl = document.getElementById(`bar-${cat.key}`);
    const valEl = document.getElementById(`val-${cat.key}`);
    if (barEl) setTimeout(() => { barEl.style.width = pct + '%'; }, 100);
    if (valEl) valEl.textContent = Math.round(cat.val).toLocaleString() + ' kg CO₂e';
  });

  // Tips
  generateTips(energy, travel, flights, diet);
}

// ---- Tips Engine ----

function generateTips(energy, travel, flights, diet) {
  const allTips = [
    { condition: energy > 1500,  icon: '💡', text: 'Switch to a green energy tariff — it can cut your electricity emissions by up to 100% for minimal cost.' },
    { condition: energy > 800,   icon: '🌞', text: 'Consider installing solar panels. They pay for themselves in 6–10 years and could generate most of your home electricity.' },
    { condition: energy > 500,   icon: '🌡️', text: 'Lowering your heating by just 1°C can save around 10% on your heating bill and reduce emissions meaningfully.' },
    { condition: travel > 800,   icon: '🚲', text: 'Replacing even 2 car journeys a week with cycling or walking could save hundreds of kg CO₂ per year.' },
    { condition: travel > 500,   icon: '🚌', text: 'Switching from car to bus for your commute can cut travel emissions by 3× or more.' },
    { condition: travel > 300,   icon: '🔋', text: 'If you need a car, switching to an EV cuts tailpipe emissions to zero and lifecycle emissions by ~50–70%.' },
    { condition: flights > 2000, icon: '✈️', text: 'One less long-haul flight per year is one of the biggest single changes you can make — saving 1–2 tonnes of CO₂.' },
    { condition: flights > 500,  icon: '🚂', text: 'Consider train travel for European destinations — trains emit 80–90% less CO₂ than flying.' },
    { condition: diet > 2500,    icon: '🥩', text: 'Cutting red meat consumption in half could reduce your food emissions by 30% or more.' },
    { condition: diet > 1800,    icon: '🥦', text: 'Going plant-based even 3 days a week significantly reduces your food-related carbon footprint.' },
    { condition: true,           icon: '🛒', text: 'Reducing food waste is one of the easiest wins — plan meals, freeze leftovers, and use what you buy.' },
    { condition: true,           icon: '🌳', text: 'Consider carbon offsetting your remaining footprint through verified programmes like Gold Standard.' },
  ];

  const tips = allTips.filter(t => t.condition).slice(0, 5);
  const container = document.getElementById('tipsList');
  container.innerHTML = tips.map(t => `
    <div class="tip-item">
      <span class="tip-icon">${t.icon}</span>
      <span>${t.text}</span>
    </div>
  `).join('');
}

// ---- Reset ----

function resetCalc() {
  document.querySelectorAll('input').forEach(i => i.value = '');
  document.querySelectorAll('.diet-btn').forEach(b => b.classList.remove('selected'));
  selectedDiet = null;
  showPage('home');
}

// ---- Init ----
updateProgress('home');
