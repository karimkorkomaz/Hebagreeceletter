import { useEffect, useRef, useState } from 'react'
import './Letter.css'

/**
 * Reveals .reveal children as they scroll into view.
 * Plain scroll maths rather than IntersectionObserver: the first pass runs
 * synchronously the moment the plane lands, so the opening screen is solid
 * immediately and nothing waits on a callback.
 */
function useReveal(containerRef, active) {
  useEffect(() => {
    const root = containerRef.current
    if (!active || !root) return undefined

    const items = Array.from(root.querySelectorAll('.reveal'))

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach((el) => el.classList.add('is-in'))
      return undefined
    }

    let pending = items
    let firstPass = true
    let ticking = false

    const check = () => {
      const limit = window.innerHeight * 0.92

      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top > limit) return true
        // The first pass runs the moment the plane lands, so whatever is
        // already on screen appears solid — no stagger, no fade. Only what
        // she scrolls to later gets the fade-up.
        if (firstPass) el.style.transition = 'none'
        el.classList.add('is-in')
        return false
      })

      firstPass = false
      if (!pending.length) stop()
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        check()
      })
    }

    function stop() {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    check()

    return stop
  }, [containerRef, active])
}

/** A photo that shows a labelled slot instead of a broken image. */
function Photo({ src, caption, align }) {
  const [missing, setMissing] = useState(false)
  const file = src.split('/').pop()

  return (
    <figure
      className={`photo photo--${align}${missing ? ' is-empty' : ''}`}
      data-slot={`add ${file}`}
    >
      <img src={src} alt="" onError={() => setMissing(true)} />
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

export default function Letter({ visible }) {
  const ref = useRef(null)
  useReveal(ref, visible)

  return (
    <main className={`letter${visible ? ' is-visible' : ''}`} ref={ref}>
      <header className="letter__head reveal">
        <p className="eyebrow">Athens &nbsp;·&nbsp; one way</p>
        <h1 className="letter__title">My Princess,</h1>
        <div className="rule" />
      </header>

      {/* ============================================================
          ✏️  YOUR LETTER STARTS HERE
          Replace the text in each <p>. Add or delete paragraphs
          freely — each one fades in as she scrolls.
          ============================================================ */}

      <p className="reveal">
        I keep starting this letter and deleting it, because there isn&apos;t a
        version of it that&apos;s the right size. Everything I want to say is
        either too small to bother writing down or too big to fit on a screen.
      </p>

      <p className="reveal">
        So I&apos;ll just say the true thing: I&apos;m so proud of you.
        You&apos;re doing the brave version of your life, the one most people
        only talk about at 2am and never actually book a flight for. You booked
        the flight.
      </p>

      <Photo src="/images/photo-1.jpg"  align="left" />

      <p className="reveal">
        I&apos;m going to miss the ordinary stuff the most. Not the big days,
        the ordinary ones. The gym. the  volleyball games. How everytime i'd try to play with your cheeks, but it always pisses you off (although you used to love it from me).Our sob7iyet ma3 da2et tawle (btw kes ekht zahrek). nja2e2 3al staff w hamoudie b sheghel.
        nfaker shu badna nekol. how we'd always leave our pm shift and end it with us screaming I love you at each other from opposite ends of the street. The way you always knew when I needed a hug, even when I didn&apos;t.
      </p>

        <p className="reveal"> 
          I still remember the night you texted me. when you were heart broken from that bitch. I was confused back then, and did Not
          expect this to happen. but you know what? I'm glad she did it. I'm glad she broke you. if she didn't, then we wouldn't have been best friends.
          Our bond and friendship wouldn't have been as strong as it is now. I love you so much, and I will always be here for you. I will always be your best friend, and I will always be your shoulder to cry on. I will always be your rock, and I will always be your support system. I will always be your cheerleader, and I will always be your biggest fan. I will always be your best friend, and I will always be your family. I will always be your home, and I will always be your safe place. Last but not least, You will always and I mean it from my bottom of my heart, be my princess.
        </p>

      <blockquote className="pull reveal">
        Go be happy there. I&apos;ll still be here, just in a different time zone.
      </blockquote>

      <p className="reveal">
        Greece is going to be so good to you. Eat everything. Swim even when the
        water&apos;s too cold. Say yes to the thing you&apos;d normally
        overthink. Take the long way home, every time.
      </p>

      <Photo src="/images/photo-2.jpg"  align="right" />

      <p className="reveal">
        And when it gets hard,because some days it will, in a new country where
        nothing is where you left it — remember that you are extremely loved,
        from extremely far away, by someone who has never once doubted you.
      </p>

      <p className="reveal">Call me. Constantly. I mean it.</p>

      {/* ============================================================
          ✏️  YOUR LETTER ENDS HERE
          ============================================================ */}

      <footer className="letter__foot reveal">
        <p className="signoff">All my love,</p>
        {/* EDIT: your name */}
        <p className="signature">Karim</p>
      </footer>

      <div className="endmark reveal" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M2 12.5 21.5 3.5 15.5 21 12 14 2 12.5Z" />
        </svg>
        <span>kalo taxidi — safe travels</span>
      </div>
    </main>
  )
}
