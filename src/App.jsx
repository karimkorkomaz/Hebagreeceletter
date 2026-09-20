import { useCallback, useEffect, useState } from 'react'
import Flight from './components/Flight.jsx'
import FlightBoundary from './components/FlightBoundary.jsx'
import Letter from './components/Letter.jsx'

// how long the sky takes to lift off the letter.
// keep in sync with the .flight transition in Flight.css.
const SKY_LIFT = 700

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function App() {
  // if her phone has "reduce motion" on, skip the flight entirely
  const [landed, setLanded] = useState(prefersReducedMotion)
  const [flightMounted, setFlightMounted] = useState(() => !prefersReducedMotion())

  const handleLanded = useCallback(() => setLanded(true), [])

  // keep the sky mounted just long enough to lift off the letter.
  // must stay >= the .flight opacity transition in Flight.css.
  useEffect(() => {
    if (!landed || !flightMounted) return undefined
    const t = setTimeout(() => setFlightMounted(false), SKY_LIFT + 100)
    return () => clearTimeout(t)
  }, [landed, flightMounted])

  return (
    <>
      {flightMounted && (
        <FlightBoundary onError={handleLanded}>
          <Flight landed={landed} onLanded={handleLanded} />
        </FlightBoundary>
      )}
      <Letter visible={landed} />
    </>
  )
}
