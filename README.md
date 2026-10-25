# SolNet Solutions Inc. Website
Open `index.html` in VS Code with Live Server (or any browser). No build step.
## Add your assets (filenames expected)
- `images/logo.png`
- `images/company/company-01.jpg` … `company-04.jpg`
- `images/solar/solar-01.jpg` … `solar-04.jpg`
- `images/telco/telco-pubmat.jpg`
- `images/campus/bipsu-3d-map.jpg`
- `images/substations/substation-01.jpg` … `03.jpg`, `schedule-01.jpg` … `03.jpg`
Missing images show a "[IMAGE TO BE PROVIDED]" placeholder; the logo falls back to text.
## Fill in placeholders
Search for `[` in the HTML: address, phone, email, social links, names, substation data, map iframe (`#mapContainer`).
Colors are CSS variables at the top of `css/style.css`. `pages/schedule-of-loads.html` redirects to the Schedule of Loads section of `energy-monitor.html`.
