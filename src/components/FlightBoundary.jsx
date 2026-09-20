import { Component } from 'react'

/**
 * The letter is the point of this site; the plane is decoration.
 * If anything in the flight scene throws, drop it and hand straight
 * over to the letter rather than blanking the page.
 */
export default class FlightBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { crashed: false }
  }

  static getDerivedStateFromError() {
    return { crashed: true }
  }

  componentDidCatch(error) {
    document.body.classList.remove('is-flying')
    if (import.meta.env.DEV) console.error('flight scene failed:', error)
    this.props.onError?.()
  }

  render() {
    return this.state.crashed ? null : this.props.children
  }
}
