# InvoiceFlow - Invoice Generator 🧾

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://rajatsharma0087.github.io/invoice-generator/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Rajatsharma0087/invoice-generator)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**A free, professional invoice generator for freelancers.**
**No login. No subscription. No nonsense.**

[View Live Demo](https://rajatsharma0087.github.io/invoice-generator/)

</div>

---

## ✨ Features

### Core
- 👁️ **Live Preview** — Invoice updates as you type
- ➕ **Dynamic Line Items** — Add/remove services instantly
- 🧮 **Auto Calculations** — Subtotal, tax, discount, total
- 📄 **PDF Download** — One click, professional PDF
- 🖨️ **Print Ready** — Clean print layout

### Extra
- 🌙 **Dark/Light Mode** — Persists in localStorage
- 💱 **Multi-Currency** — USD, INR, EUR, GBP
- 🔢 **Auto Invoice Number** — Generated on load
- 📅 **Smart Dates** — Today + 30 days due date
- 📱 **Fully Responsive** — Works on all devices
- ✅ **Input Validation** — Checks before PDF generation

---

## 🏗️ Built In 3 Days

| Day | What Was Built |
|-----|---------------|
| Day 1 | Layout, form, live preview, theme |
| Day 2 | Line items, calculations, tax/discount |
| Day 3 | PDF download, print, polish, launch |

---

## 🛠️ Tech Stack

| Tech | Purpose |
|------|---------|
| HTML5 | Structure |
| CSS3 + Variables | Styling + Dark mode |
| Vanilla JavaScript | All logic |
| jsPDF | PDF generation |
| html2canvas | Invoice rendering to PDF |

**Zero frameworks. Zero npm. Open index.html and it works.**

---

## 🚀 Quick Start

```bash
git clone https://github.com/Rajatsharma0087/invoice-generator.git
cd invoice-generator
# Open index.html in browser
```

---

## 📁 Structure

```
invoice-generator/
├── index.html    ← Complete structure
├── style.css     ← All styles + dark mode + print
├── script.js     ← Complete logic + PDF
└── README.md     ← You are here
```

---

## 💡 Key Learnings

```javascript
// The calculation logic — simpler than it looks:
const subtotal    = items.reduce((sum, i) =>
    sum + (i.quantity * i.rate), 0);
const discount    = subtotal * (discountRate / 100);
const tax         = (subtotal - discount) * (taxRate / 100);
const grandTotal  = subtotal - discount + tax;
```

- html2canvas captures DOM → jsPDF converts to PDF
- CSS @media print hides UI, shows only invoice
- One updateAll() function keeps everything in sync
- Data attributes pattern for dynamic item updates

---

## 🤝 Connect

| | |
|--|--|
| Twitter | [@Rajatsharma_87](https://twitter.com/Rajatsharma_87) |
| Portfolio | [rajatsharma0087.github.io](https://rajatsharma0087.github.io/-personal-portfolio/) |
| GitHub | [Rajatsharma0087](https://github.com/Rajatsharma0087) |

**Open for freelance work → DM on Twitter 📩**

---

<div align="center">
Made with ❤️ by Rajat Sharma
<br>
Day 21 of #100DaysOfCode
</div>
