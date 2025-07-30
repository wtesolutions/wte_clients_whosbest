# WhosBest.org – Directory of Excellence

Welcome to the WhosBest.org front-end codebase.  
This repository contains a fully static, SEO-optimized website built with modern 2025 design patterns. The project’s purpose is to provide authoritative, data-driven “best of” rankings across a wide range of categories – from healthcare and technology to local businesses and education – and make them freely available to the public.

---

## 1. Project Description & Purpose
WhosBest.org curates vetted lists that help consumers, professionals, and researchers quickly identify the top performers in any domain.  
Key goals:

* Publish transparent, regularly updated rankings.
* Offer an intuitive browsing experience on any device.
* Remain 100 % static so the site can be hosted freely on GitHub Pages/CDN.
* Provide a solid foundation that partners and contributors can extend.

---

## 2. Directory Structure

```
/
│  index.html                – Home page (category directory)
│  README.md                 – You are here
│
├─ css/
│   └─ main.css              – Unified design-system stylesheet
│
├─ js/
│   └─ main.js               – Re-usable JS utilities, filtering, UI behaviours
│
├─ assets/
│   ├─ logo.svg              – SVG word-art logo
│   ├─ hero-bg.jpg           – Landing hero image
│   ├─ categories/           – Category thumbnails
│   └─ lists/                – List thumbnails & OG images
│
├─ categories/
│   └─ *.html                – One page per category (e.g. healthcare.html)
│
├─ lists/
│   └─ *.html                – One page per individual ranking list
│
└─ .github/                  – (optional) issue templates, workflows
```

---

## 3. File Organisation
* **HTML** – All pages are flat `.html` files; no server-side rendering is required.  
* **CSS** – A single `main.css` drives the entire design. Utility classes follow a tailwind-inspired naming scheme for rapid prototyping.  
* **JavaScript** – `main.js` handles scroll animations, filters, export/share menus, search, debounced resize events, etc.  
* **Assets** – Optimised images & SVG kept under `assets/`; large media is lazy-loaded.  
* **SVG Logo** – `assets/logo.svg` scales infinitely and is inlined on every page for accessibility and quick paint.

---

## 4. SEO Optimisation Features
* Each page ships with:
  * Unique `<title>` and meta **description/keywords**.
  * Open-Graph and Twitter card tags for social sharing.
  * Semantic heading hierarchy (`h1`…`h6`).
  * Descriptive `alt` text on all images.
* Lightweight, valid HTML5 markup with correct landmark roles improves crawlability.
* Clean, human-readable URLs (`/categories/healthcare.html`, `/lists/top-hospitals.html`).
* Performance optimisations: critical CSS delivered first, images lazy-loaded, and no blocking JS in `<head>`.

---

## 5. Technology Stack
* **HTML5** + **CSS3** (custom properties, grid, flex)
* **ES6 JavaScript** (vanilla) + **jQuery 3.7** for DOM helpers
* **Font Awesome 6** icons (CDN)
* **SVG** for crisp graphics
* Hosted on **GitHub Pages** (or any static host)

_No build tools are required – what you see is what you deploy._

---

## 6. Installation & Deployment

1. **Clone**
   ```
   git clone https://github.com/your-org/whosbest.org.git
   ```
2. **Preview locally**
   ```
   cd whosbest.org
   npx serve .
   # then browse http://localhost:5000
   ```
3. **Deploy to GitHub Pages**
   * Push to your `main` branch.
   * In repository settings ➜ **Pages**, choose `main / root`.
   * Your site appears at `https://<username>.github.io/whosbest.org/`.

To deploy elsewhere, upload the entire folder to any static file host or S3-style bucket.

---

## 7. Feature Overview
* **Responsive Design** – Fluid grid & utility classes adapt from mobile to 4K.
* **Category & List Filtering** – Instant client-side search, dropdown filters, sorting.
* **Export / Share** – CSV/PDF/print stubs and social share pop-ups.
* **Newsletter CTA** – AJAX-ready form (non-blocking).
* **Accessibility** – Focus states, sufficient contrast, skip-links ready.
* **Performance** – Lazy-load images, minified CSS/JS, very low JS footprint (~30 KB gzip).

---

## 8. Customisation Guide
* **Branding colours / typography** – Edit CSS variables at the top of `css/main.css`.
* **Add a category**
  1. Create `assets/categories/<your>.jpg`.
  2. Duplicate an existing HTML file in `categories/`, update meta tags and list links.
  3. Add a card reference on `index.html`.
* **Add a ranking list**
  1. Duplicate a list template in `lists/`, populate data & SEO tags.
  2. Link it from the parent category page.
* **Modify navigation** – Update the `<nav>` block in the partial of each file (or run a global replace).

---

## 9. Contributing Guidelines
* Open an issue describing the bug/feature before submitting PRs.
* Fork ➜ create feature branch (`git checkout -b feature/my-change`).
* Follow existing code style: 2-space indent, semantic HTML, kebab-case filenames.
* Validate HTML via W3C and run `npm run lint:css` if you add a CSS linter.
* Ensure your PR does not bloat bundle size unnecessarily.
* All contributions require one approving review before merge.

---

## 10. Contact
Questions, feedback, or partnership inquiries?

* **Email:** team@whosbest.org  
* **Twitter:** [@WhosBestOrg](https://twitter.com/WhosBestOrg)  
* **LinkedIn:** [/company/whosbest](https://linkedin.com/company/whosbest)  

Feel free to reach out – we’d love to hear from you!

---

_© 2025 WhosBest.org – built with care and curiosity._  
