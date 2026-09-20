# For Heba

A one-page farewell site. She opens it, a plane carries her photo across a
sunset toward Greece, the sky fades, and the letter is underneath.

React + Vite.

```
src/App.jsx                    decides flight vs. letter
src/components/Flight.jsx      the sunset, the plane, the animation
src/components/Flight.css
src/components/Letter.jsx      ← your letter lives here
src/components/Letter.css
src/components/FlightBoundary.jsx
src/index.css                  colour + type tokens
public/images/                 her photos go here
```

## Running it

```bash
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
npm run preview  # check the production build
npm run lint
```

## The two things you need to do

**1. Write the letter.** Open `src/components/Letter.jsx` and find:

```jsx
{/* ✏️  YOUR LETTER STARTS HERE */}
```

Replace the text in each `<p>`. Add or delete paragraphs freely — anything
with `className="reveal"` fades in as she scrolls. The text in there now is
placeholder and is all meant to be replaced.

Note it's JSX, so apostrophes inside text should be written `&apos;`
(`don&apos;t`), which is what the existing paragraphs do.

Also worth editing:

| Where | What |
|---|---|
| `Letter.jsx` → `Athens · one way` | small blue line above her name |
| `Letter.jsx` → `Heba,` | the big heading |
| `Letter.jsx` → `Karim` | the signature |
| `Flight.jsx` → `for heba` | the line over the sunset |
| `Flight.jsx` → `Home` | your city, left of the sunset |

**2. Add her photos** to `public/images/` — see `public/images/README.txt`
for filenames. They're referenced as `/images/heba.jpg`, so they're served
straight from `public/` and you never touch an import.

The plane-window one should be a tight square crop of her face; it renders
about 25px wide. Any photo you haven't added shows a dashed
"add photo-1.jpg" box rather than a broken image.

## Deploying

**Vercel:** import the repo and accept the defaults. It detects Vite on its
own — framework preset *Vite*, build `npm run build`, output `dist`. No
`vercel.json` needed; there's no client-side routing to rewrite.

**Netlify:** `npm run build`, then drag the **`dist/` folder** onto
[netlify.com/drop](https://app.netlify.com/drop).

`node_modules/` and `dist/` are already gitignored. `public/images/` is not —
her photos are meant to be committed (about 300 KB total).

## Timing

Top of `src/components/Flight.jsx`:

```js
const TAKEOFF_DELAY = 500   // beat before the plane enters
const FLIGHT_TIME   = 5200  // how long she's in the air
```

The plane lands at 5.7s. The letter is already fully painted at that instant —
no pause and no fade — and the sky lifting off it is what reveals it. That
lift is 700ms, set in two places that must agree:

- `.flight { transition: opacity 700ms }` in `Flight.css`
- `const SKY_LIFT = 700` in `App.jsx`

Only what she scrolls to *after* the landing fades up; the opening screen is
solid the moment it appears. There's a "skip" button in the corner throughout.

## How it holds up

- Mobile-first and fluid; verified at phone widths.
- "Reduce motion" on her phone skips the flight and opens on the letter.
- `FlightBoundary` catches any error thrown by the flight scene and hands
  straight over to the letter — a broken plane can't cost her the letter.
- A watchdog hands over anyway if the animation stalls.
- One caveat worth knowing: because this is a client-rendered React app,
  the page needs its JavaScript bundle to load at all. If you'd rather the
  letter survive even that, it needs prerendering to static HTML — say the
  word and I'll add it.
