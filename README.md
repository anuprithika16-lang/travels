# Aarthi Travels Website

Static website (HTML5, CSS3, vanilla JavaScript) for Aarthi Travels, Sankarankovil, Tamil Nadu. No build step.

## Structure
```
index.html, about.html, vehicles.html, tour-packages.html, contact.html   (all five pages in the root folder)
css/                  style.css, responsive.css, animations.css
js/                   main, navigation, vehicle-booking, contact-form, animations
images/               logo/ hero/ vehicles/ destinations/ icons/
assets/fonts/         (optional) self-hosted fonts
robots.txt, sitemap.xml
```

## Open locally
Double-click `index.html`, or run `python3 -m http.server 8000` in this folder and visit http://localhost:8000.
(Google Fonts load online; the site falls back to Georgia / Segoe UI offline.)

## IMPORTANT: placeholder images
All files in `images/hero`, `images/vehicles` and `images/destinations` are **generated placeholders** (each shows a "Placeholder image" label). Replace them with real photographs before launch. Keep the same file names, or update the `src` in the HTML.
Only the logo is the client's real artwork (whitespace around the original screenshot was trimmed; the artwork itself is unchanged).

## Home hero slider
The hero is a full-width 5-image slider (Kodaikanal, Munnar, Rameswaram, Ooty, Alleppey). Each change cross-fades to the next photo while a gentle Ken Burns zoom settles in. It auto-advances every 5.5 seconds, pauses on keyboard focus and touch, supports swipe, arrows and keyboard arrow keys, and preloads the next image. Visitors who prefer reduced motion get a simple cross-fade (no zoom).

Per-device settings (set in CSS on `.hero`, the slider script reads `--fade-ms` so the two never disagree):

| Device | Cross-fade `--fade-ms` | Ken Burns `--kb-scale` |
|---|---|---|
| Desktop 1024px+ | 1100ms | 1.05 |
| Tablet 641-1023px | 900ms | 1.04 |
| Mobile up to 640px | 750ms | 1.03 |

**Arrows.** Desktop (1024px+): a stacked pair of circular gold-on-burgundy buttons sits in the gutter to the LEFT of the burgundy text panel, centred on the panel (`--panel-x`, `--arrow`, `--arrow-gap` in `css/style.css`). Tablet and mobile: 44px round buttons on the left and right edges of the photo.

Images: `images/hero/hero-*.jpg` (placeholders: replace with real photos, same names). Slides are listed in `index.html` (`data-hero-slider`); the autoplay interval (`SLIDE_MS`) is at the top of the slider code in `js/animations.js`.

## Typography
Headings use Playfair Display, everything else Poppins. All sizes are fluid tokens (`--fs-hero`, `--fs-h2`, `--fs-sub`, `--fs-card`, `--fs-body`, `--fs-nav`, `--fs-btn`, `--fs-small`) at the top of `css/style.css`: use these instead of fixed sizes.

## Header, welcome strip and contact bar
Every page stacks, top to bottom: (1) the sticky white header (logo, navigation, Enquire Now; hamburger menu at 1100px and below), (2) the burgundy **WELCOME TO AARTHI TRAVELS** strip (gold `#D4AF37`, 50px desktop / 45px tablet / 40px mobile), (3) the **contact bar** with the phone and email (`tel:` / `mailto:`), then (4) the hero slider (home) or breadcrumb and page banner (other pages). The strip and contact bar scroll away with the page; only the white header stays fixed.
If a contact detail changes, update the `.header-contact` block (inside `.contact-bar`) on each page, and `js/main.js` for WhatsApp messages. The welcome strip text is the `.welcome-strip` element on each page.

## Experience highlights (30+ years)
Confirmed by the business: **30+ years** in the travel industry. It appears in the About page ("Who We Are" copy plus the gold **30+ YEARS OF EXPERIENCE** badge on the first image) and in the footer of all five pages (`.footer-experience`, "30+ Years of Trusted Travel Service").

## Motion and animation
All motion uses transform / opacity only, runs once, and is skipped for visitors who prefer reduced motion. Content stays visible without JavaScript. Tokens are at the top of `css/animations.css`:

| | Desktop 1024px+ | Tablet 641-1023px | Mobile up to 640px |
|---|---|---|---|
| Reveal distance / duration | 26px / .8s | 20px / .7s | 14px / .55s |
| About, Contact side reveals | image from left, text from right | vertical fade-up, sequential | vertical fade-up |
| Card stagger | 110ms | 100ms | 90ms |
| Booking steps stagger | 180ms | 100ms | 100ms |
| 3D card tilt | yes (mouse only) | off | off |

Elements that scroll into view together (a row of cards, the three booking steps) arrive one after another using an IntersectionObserver. Once revealed, nothing is hidden again. The FAQ accordions animate their height (`initFaq` in `js/animations.js`); with reduced motion they open natively.

## Page copy and keywords
Each page has 1,000+ words of copy built around its focus keyword and secondary keywords (see the `<title>`, description and `keywords` meta in each page). Edit the text freely, but keep claims you can stand behind: no prices or ratings unless confirmed. The 30+ years claim is confirmed by the business.

## Replace the logo
Overwrite `images/logo/aarthi-travels-logo.png` (keep it a black logo on white/transparent). If the aspect ratio changes, update the `width`/`height` attributes on the logo `<img>` tags in every page.

## Replace vehicle images
Replace the six files in `images/vehicles/` (4:3 landscape, about 900x675 px, JPG under 150 KB). The hero vehicle is `images/hero/hero-urbania.jpg`.

## Replace destination images
Replace files in `images/destinations/` (4:3, about 900x675 px). Hero backgrounds are the five `images/hero/hero-*.jpg` files, about 1920x1080.
`athirappilly.jpg` and `hero-urbania.jpg` are spares.

## Update contact information
Search all `.html` files for: `917845501000`, `+91 78455 01000`, `aarthicarsandvans@gmail.com`, `AarthiTravelsSnkl1000`, and the address text. In JavaScript, update `phone` and `email` at the top of `js/main.js`. The LocalBusiness JSON-LD is in the `<head>` of every page.

## Vehicles
Vehicle names are in the HTML cards and in `js/main.js` (`vehicles` list, also used for seat-capacity checks). Keep names identical in both places.

## Enquiry form (no backend)
The site has no server. "Send Enquiry on WhatsApp" opens WhatsApp with a prepared message, and "Send by Email" opens the customer's email app. Nothing is sent until the customer presses Send, and the site never shows a booking confirmation.

## SEO before launch
Replace `YOUR-DOMAIN` in `sitemap.xml`, `robots.txt` and the breadcrumb JSON-LD. Add `<link rel="canonical">`, `og:url` and `og:image` (absolute URLs) to each page once the domain is known.

## Deploy to GitHub Pages
1. Create a GitHub repository and upload the contents of this folder (so `index.html` is in the repo root).
2. Repository **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
4. After a minute the site is live at `https://<username>.github.io/<repository>/`. All paths are relative, so it works in a sub-folder.


## Destination images (16 destinations)
Existing 8 keep their filenames. The 8 added destinations use these files in `images/destinations/`:
`thanjavur-temple.jpg`, `trichy-rockfort-temple.jpg`, `palani-hill-temple.jpg`, `courtallam-waterfalls.jpg`, `valparai-tea-estates.jpg`, `yercaud-lake.jpg`, `pondicherry-french-quarter.jpg`, `tirupati-tirumala-temple.jpg`.
These are currently branded placeholder tiles (1448x1086, 4:3). Replace each with a real, licensed photograph of the same name and size ratio; no code changes needed.

## 16 Seater Urbania slider
One vehicle card with a crossfading two-photo slider on index.html and vehicles.html (identical markup on both; styles at the end of css/style.css; logic in js/urbania-slider.js). Autoplay 4.5s, arrows, two dots, mouse-hover pause, touch swipe, no autoplay under reduced-motion.
Photos: `images/vehicles/urbania-black.png` and `images/vehicles/urbania-white.png` (shown uncropped on the card's ivory background).

## Animation system (css/animations.css + js/animations.js)
Motion breakpoints: desktop 1200px+ (26px rise, .8s, 120ms stagger, 30px About side reveals, hover zoom 1.05, subtle tilt), tablet 768-1199px (20px, .7s, 100ms, vertical only, no tilt or zoom), mobile below 768px (14px, .55s, 80ms, vertical only, no hover effects).
JS tags section content automatically; everything stays visible without JS or with reduced motion.
