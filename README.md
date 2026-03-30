# 🌿 EcoTrack — Carbon Footprint Calculator

A multi-page, interactive carbon footprint calculator built with vanilla HTML, CSS, and JavaScript. Users can estimate their annual CO₂ emissions across energy, travel, flights, and diet — and receive personalised reduction tips.

---

## 📁 Project Structure

```
carbon-calculator/
├── index.html    # App structure & all page markup
├── styles.css    # All visual styling & animations
├── app.js        # Navigation logic, calculations & tips engine
└── README.md     # This file
```

---

## 🚀 Getting Started

No build tools or dependencies required. Just open `index.html` in any modern browser:

```bash
# Option 1 — open directly
open index.html

# Option 2 — serve locally (recommended for live reload)
npx serve .
# or
python3 -m http.server 8080
```

---

## 📋 Features

### Pages & Flow
| Step | Page | Description |
|------|------|-------------|
| — | Welcome | Introduction & start screen |
| 1 | Energy | Electricity, gas, heating oil, renewable % |
| 2 | Travel | Car, EV, bus, train, bike, motorbike (weekly km) |
| 3 | Flights | Short / medium / long haul + business class % |
| 4 | Diet | Diet type selector + food waste & local sourcing |
| — | Results | Breakdown, comparison, and reduction tips |

### Calculations
All values are converted to **kg CO₂e per year**.

| Input | Factor Used |
|-------|-------------|
| Electricity | 0.82 kg CO₂/kWh (reduced by renewable %) |
| Natural Gas | 2.04 kg CO₂/unit |
| Heating Oil | 2.68 kg CO₂/litre |
| Car (petrol) | 0.192 kg CO₂/km |
| Electric Vehicle | 0.053 kg CO₂/km |
| Bus | 0.089 kg CO₂/km |
| Train | 0.041 kg CO₂/km |
| Motorbike | 0.113 kg CO₂/km |
| Short-haul flight | 255 kg CO₂ per return trip |
| Medium-haul flight | 640 kg CO₂ per return trip |
| Long-haul flight | 1,260 kg CO₂ per return trip |
| Business/First class | 2.5× economy multiplier |

Diet annual baselines:
- 🥩 Heavy Meat: 3,300 kg — 🍗 Average Omnivore: 2,500 kg
- 🥘 Low Meat: 1,900 kg — 🐟 Pescatarian: 1,500 kg
- 🥦 Vegetarian: 1,200 kg — 🌱 Vegan: 900 kg

Food waste and local sourcing apply a small scaling factor on top of the diet baseline.

### Results & Tips
- Animated per-category bar chart (Energy, Travel, Flights, Diet)
- Total compared against global average (~7,500 kg) and UK average (~10,000 kg)
- Up to 5 personalised tips generated based on the user's highest-emission categories

---

## 🎨 Design & Tech

- **Fonts:** [Syne](https://fonts.google.com/specimen/Syne) (headings) + [DM Sans](https://fonts.google.com/specimen/DM+Sans) (body) via Google Fonts
- **No frameworks** — pure HTML5, CSS3, and vanilla JS (ES6+)
- **Animations:** CSS keyframes for page transitions, orbit animation, and bar chart fills
- **Responsive:** Sidebar collapses to icon-only on screens < 768px

---

## 🛠️ Customisation

### Update emission factors
All factors are defined at the top of `app.js` in the `FACTORS` object:
```js
const FACTORS = {
  electricity: 0.82,  // kg CO₂ per kWh — update for your grid
  car: 0.192,         // kg CO₂ per km
  // ...
};
```

### Add a new input page
1. Add a new `<section class="page hidden" id="mypage">` in `index.html`
2. Insert `'mypage'` in the `PAGE_ORDER` array in `app.js`
3. Add a `<button class="nav-item" data-page="mypage">` in the sidebar
4. Include your values in the `calculate()` function

### Change the colour theme
All colours are CSS variables at the top of `styles.css`:
```css
:root {
  --green-main: #2d8a50;
  --green-dark: #0d3b1e;
  /* ... */
}
```

---

## 📊 Emission Factor Sources

- UK Government GHG Conversion Factors (DESNZ, 2023)
- IPCC AR6 dietary emission estimates
- ICAO Carbon Emissions Calculator methodology
- European Environment Agency transport emission factors

> **Note:** Emission factors vary by country and grid mix. For production use, consider sourcing country-specific electricity factors from [Our World in Data](https://ourworldindata.org/grapher/carbon-intensity-electricity) or the IEA.

---

## 📄 License

MIT — free to use, modify, and distribute.
