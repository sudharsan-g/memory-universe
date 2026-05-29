import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function Confetti() {
  useEffect(() => {
    const duration = 3000
    const animationEnd = Date.now() + duration

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const animate = () => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return
      }

      confetti({
        particleCount: randomInRange(20, 40),
        angle: randomInRange(85, 95),
        spread: randomInRange(30, 50),
        origin: { x: randomInRange(0.1, 0.9), y: 0 },
        gravity: randomInRange(0.5, 1),
        scalar: randomInRange(0.5, 1.5),
        decay: randomInRange(0.85, 0.95),
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return null
}
