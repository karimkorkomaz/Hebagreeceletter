import { useEffect, useRef, useState } from 'react'
import './Flight.css'

const SVG_NS = 'http://www.w3.org/2000/svg'

/* ---- timing (ms) ---- */
const TAKEOFF_DELAY = 500 // beat before the plane enters
const FLIGHT_TIME = 5200 // how long she's in the air
// no pause after landing: the letter is already there, the sky just lifts.
// the lift duration lives in Flight.css (.flight transition) and App.jsx.

const STAR_COUNT = 46
const DOT_COUNT = 64

const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2

function makeStars() {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    left: `${(Math.random() * 100).toFixed(2)}%`,
    top: `${(Math.random() * 100).toFixed(2)}%`,
    delay: `${(Math.random() * 4).toFixed(2)}s`,
    dur: `${(2.5 + Math.random() * 3).toFixed(2)}s`,
    peak: (0.45 + Math.random() * 0.5).toFixed(2),
    big: Math.random() > 0.82,
  }))
}

export default function Flight({ landed, onLanded }) {
  const rootRef = useRef(null)
  const planeRef = useRef(null)
  const trailRef = useRef(null)
  const pathRef = useRef(null)
  const captionRef = useRef(null)
  const windowRef = useRef(null)

  const onLandedRef = useRef(onLanded)
  const finishRef = useRef(null)

  const [stars] = useState(makeStars)
  const [noPhoto, setNoPhoto] = useState(false)

  useEffect(() => {
    onLandedRef.current = onLanded
  }, [onLanded])

  useEffect(() => {
    const root = rootRef.current
    const plane = planeRef.current
    const trail = trailRef.current
    const path = pathRef.current
    if (!root || !plane || !trail || !path) return undefined

    document.body.classList.add('is-flying')

    const W = root.clientWidth || window.innerWidth
    const H = root.clientHeight || window.innerHeight

    // one long cubic: enters low-left, arcs over the sea, descends past Greece
    trail.setAttribute('viewBox', `0 0 ${W} ${H}`)
    path.setAttribute(
      'd',
      `M ${-0.2 * W} ${0.82 * H} C ${0.22 * W} ${0.3 * H}, ${0.72 * W} ${0.24 * H}, ${1.22 * W} ${0.62 * H}`,
    )

    const pathLength = path.getTotalLength()

    // the dotted trail: real dots, revealed as she passes them
    const dots = []
    const frag = document.createDocumentFragment()
    for (let i = 1; i <= DOT_COUNT; i++) {
      const at = (i / DOT_COUNT) * pathLength
      const pt = path.getPointAtLength(at)
      const c = document.createElementNS(SVG_NS, 'circle')
      c.setAttribute('cx', pt.x)
      c.setAttribute('cy', pt.y)
      c.setAttribute('r', 2)
      c.setAttribute('fill', 'rgba(255,248,240,.62)')
      c.setAttribute('opacity', '0')
      c.style.transition = 'opacity 700ms ease'
      frag.appendChild(c)
      dots.push({ el: c, at, on: false })
    }
    trail.appendChild(frag)

    const planeW = plane.offsetWidth
    const planeH = plane.offsetHeight

    const timers = []
    let rafId = 0
    let startedAt = 0
    let settled = false

    // hand over to the letter, once, from wherever we are
    const finish = () => {
      if (settled) return
      settled = true
      cancelAnimationFrame(rafId)
      document.body.classList.remove('is-flying')
      window.scrollTo(0, 0)
      onLandedRef.current?.()
    }
    finishRef.current = finish

    const frame = (now) => {
      if (!startedAt) startedAt = now
      const t = Math.min((now - startedAt) / FLIGHT_TIME, 1)
      const e = easeInOutSine(t)

      const travelled = e * pathLength
      const pt = path.getPointAtLength(travelled)
      const next = path.getPointAtLength(Math.min(travelled + 2, pathLength))
      const angle = (Math.atan2(next.y - pt.y, next.x - pt.x) * 180) / Math.PI
      const bob = Math.sin(t * Math.PI * 6) * 2.2 // a little air turbulence

      plane.style.transform =
        `translate(${pt.x - planeW / 2}px, ${pt.y - planeH / 2 + bob}px) rotate(${angle}deg)`

      // keep her face near-upright while the plane banks. a full counter-rotation
      // looks pasted on; leaving it at 0 makes her look like she's lying down.
      if (windowRef.current) {
        windowRef.current.style.rotate = `${-angle * 0.72}deg`
      }

      for (const dot of dots) {
        if (!dot.on && dot.at <= travelled) {
          dot.on = true
          dot.el.setAttribute('opacity', '1')
        }
      }

      // the caption bows out once she's properly airborne. the keyframe
      // animation has to go first — animations outrank inline styles.
      const caption = captionRef.current
      if (t > 0.45 && caption && !caption.dataset.gone) {
        caption.dataset.gone = '1'
        caption.style.animation = 'none'
        caption.style.opacity = '1'
        caption.style.letterSpacing = '.34em'
        void caption.offsetWidth
        caption.style.transition = 'opacity 1200ms ease, filter 1200ms ease'
        caption.style.filter = 'blur(4px)'
        caption.style.opacity = '0'
      }

      if (t < 1) {
        rafId = requestAnimationFrame(frame)
      } else {
        finish()
      }
    }

    timers.push(
      setTimeout(() => {
        plane.classList.add('is-airborne')
        rafId = requestAnimationFrame(frame)
      }, TAKEOFF_DELAY),
    )

    // if the flight stalls for any reason, hand over anyway
    timers.push(setTimeout(finish, TAKEOFF_DELAY + FLIGHT_TIME + 3000))

    // a script error must not leave her stranded on a frozen sunset.
    // not capture-phase on purpose: missing photos must not trip this.
    window.addEventListener('error', finish)

    return () => {
      cancelAnimationFrame(rafId)
      timers.forEach(clearTimeout)
      window.removeEventListener('error', finish)
      document.body.classList.remove('is-flying')
      dots.forEach((d) => d.el.remove())
      finishRef.current = null
    }
  }, [])

  return (
    <div className={`flight${landed ? ' is-done' : ''}`} ref={rootRef}>
      <div className="sky" aria-hidden="true">
        <div className="stars">
          {stars.map((s) => (
            <span
              key={s.id}
              className="star"
              style={{
                left: s.left,
                top: s.top,
                width: s.big ? '3px' : undefined,
                height: s.big ? '3px' : undefined,
                '--delay': s.delay,
                '--dur': s.dur,
                '--peak': s.peak,
              }}
            />
          ))}
        </div>
        <div className="glow" />
        <div className="cloud cloud--1" />
        <div className="cloud cloud--2" />
        <div className="cloud cloud--3" />
      </div>

      <div className="sea" aria-hidden="true" />

      <svg className="trail" ref={trailRef} aria-hidden="true" xmlns={SVG_NS}>
        <path ref={pathRef} fill="none" stroke="none" />
      </svg>

      {/* departure */}
      <div className="marker marker--home" aria-hidden="true">
        <svg viewBox="0 0 160 60" className="marker__art">
          <path d="M0 60 L0 44 L10 44 L10 34 L20 34 L20 44 L30 44 L30 26 L42 26 L42 18 L52 18 L52 26 L64 26 L64 40 L76 40 L76 30 L88 30 L88 44 L100 44 L100 22 L110 22 L110 12 L118 12 L118 22 L128 22 L128 44 L140 44 L140 36 L150 36 L150 60 Z" />
        </svg>
        {/* EDIT: your city */}
        <p className="marker__label">Home</p>
      </div>

      {/* arrival */}
      <div className="marker marker--greece" aria-hidden="true">
        <svg viewBox="0 0 170 74" className="marker__art marker__art--greece">
          <path className="rock" d="M0 74 L6 58 L26 52 L52 56 L86 46 L120 52 L148 48 L170 60 L170 74 Z" />
          <g className="houses">
            <rect x="18" y="40" width="22" height="16" rx="2" />
            <rect x="44" y="34" width="18" height="22" rx="2" />
            <rect x="88" y="32" width="26" height="18" rx="2" />
            <rect x="120" y="38" width="20" height="14" rx="2" />
            <rect x="66" y="42" width="14" height="14" rx="2" />
          </g>
          <g className="domes">
            <path d="M44 34 a9 9 0 0 1 18 0 Z" />
            <path d="M88 32 a13 9 0 0 1 26 0 Z" />
            <path d="M18 40 a11 7 0 0 1 22 0 Z" />
          </g>
        </svg>
        <p className="marker__label">Greece</p>
      </div>

      {/* the plane, with her in the window */}
      <div className="plane" ref={planeRef} aria-hidden="true">
        <svg className="plane__svg" viewBox="0 0 240 120" xmlns={SVG_NS}>
          <g className="plane__shadowy">
            <path d="M34 62 L6 54 L6 86 L34 78 Z" />
            <path d="M48 52 L34 14 C32 7 41 6 46 11 L88 50 Z" />
          </g>
          <path className="plane__wing" d="M92 76 L64 110 C59 116 68 119 75 114 L134 84 Z" />
          <ellipse className="plane__engine" cx="112" cy="95" rx="17" ry="8.5" />
          <path
            className="plane__body"
            d="M30 70 C30 54 46 48 70 47 L176 44 C208 43 226 54 230 70 C226 86 208 97 176 96 L70 93 C46 92 30 86 30 70 Z"
          />
          <g className="plane__windows">
            <rect x="74" y="62" width="7" height="7" rx="3.5" />
            <rect x="88" y="61" width="7" height="7" rx="3.5" />
            <rect x="102" y="61" width="7" height="7" rx="3.5" />
            <rect x="186" y="58" width="7" height="7" rx="3.5" />
            <rect x="198" y="58" width="7" height="7" rx="3.5" />
          </g>
          <path className="plane__cockpit" d="M212 57 C222 58 228 62 228 66 L212 66 Z" />
          <circle className="plane__porthole" cx="150" cy="66" r="16" />
        </svg>

        {/* HER PHOTO: a square close-up at public/images/heba.jpg */}
        <div className={`plane__window${noPhoto ? ' no-photo' : ''}`} ref={windowRef}>
          <img src="/images/heba.jpg" alt="" onError={() => setNoPhoto(true)} />
          <svg className="plane__silhouette" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="9" r="4" />
            <path d="M3.5 22 a8.5 8 0 0 1 17 0 Z" />
          </svg>
        </div>
      </div>

      <p className="scene-caption" ref={captionRef}>
        for heba
      </p>

      <button className="skip" type="button" onClick={() => finishRef.current?.()}>
        skip
      </button>
    </div>
  )
}
