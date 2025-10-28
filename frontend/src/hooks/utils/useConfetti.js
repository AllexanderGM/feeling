import { useCallback, useMemo } from 'react'
import confetti from 'canvas-confetti'

/**
 * Hook para manejar efectos de confeti
 * Usa canvas-confetti optimizado para mejor rendimiento
 */
export const useConfetti = () => {
  // Crear custom shapes de corazón usando SVG path
  const heartShape = useMemo(() => {
    // Path SVG de un corazón (simplificado para mejor rendimiento)
    return confetti.shapeFromPath({
      path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
    })
  }, [])

  // Crear shape de estrella
  const starShape = useMemo(() => {
    return confetti.shapeFromPath({
      path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
    })
  }, [])
  /**
   * Efecto de confeti básico - Explosión desde el centro
   */
  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }, [])

  /**
   * Efecto premium - Explosión de múltiples colores
   * Optimizado para mejor rendimiento
   */
  const firePremiumConfetti = useCallback(() => {
    const count = 100 // Reducido de 200 a 100
    const defaults = {
      origin: { y: 0.7 }
    }

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      })
    }

    // Reducido de 5 explosiones a 3
    fire(0.35, {
      spread: 26,
      startVelocity: 55
    })

    fire(0.35, {
      spread: 60
    })

    fire(0.3, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    })
  }, [])

  /**
   * Efecto de match - Confeti con colores de la app (primary, purple, pink)
   * Optimizado para mejor rendimiento
   */
  const fireMatchConfetti = useCallback(() => {
    const duration = 1.5 * 1000 // Reducido de 3s a 1.5s
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 50, zIndex: 9999 }

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 25 * (timeLeft / duration) // Reducido de 50 a 25

      // Colores de la app
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#8b5cf6', '#ec4899', '#6366f1']
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#8b5cf6', '#ec4899', '#6366f1']
      })
    }, 300) // Aumentado de 250ms a 300ms para menos frecuencia
  }, [])

  /**
   * Efecto de corazones - Para matches (enviar/aceptar)
   * Usa canvas-confetti con custom shape de corazón
   * Alto rendimiento y animación fluida
   */
  const fireHeartsConfetti = useCallback(() => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 1,
      decay: 0.94,
      startVelocity: 30,
      shapes: [heartShape],
      scalar: 1.2,
      colors: ['#ec4899', '#f43f5e', '#fb7185', '#ff69b4', '#ff1493'], // pink shades
      zIndex: 9999
    }

    function shoot() {
      confetti({
        ...defaults,
        particleCount: 25,
        origin: { y: 0.6 }
      })
    }

    // Disparo inmediato
    shoot()

    // Segundo disparo con delay para efecto más rico
    setTimeout(shoot, 100)
  }, [heartShape])

  /**
   * Efecto de lluvia - Desde arriba
   */
  const fireRainConfetti = useCallback(() => {
    const duration = 2 * 1000
    const animationEnd = Date.now() + duration

    ;(function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0 },
        colors: ['#8b5cf6', '#ec4899', '#6366f1'],
        zIndex: 9999
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0 },
        colors: ['#8b5cf6', '#ec4899', '#6366f1'],
        zIndex: 9999
      })

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame)
      }
    })()
  }, [])

  /**
   * Efecto de celebración con estrellas - Para compras exitosas
   * Usa canvas-confetti con custom shape de estrella
   * Alto rendimiento y animación fluida
   */
  const firePurchaseConfetti = useCallback(() => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 1,
      decay: 0.94,
      startVelocity: 35,
      shapes: [starShape],
      scalar: 1.5,
      colors: ['#fbbf24', '#f59e0b', '#fcd34d', '#facc15', '#eab308'], // golden shades
      zIndex: 9999
    }

    function shoot() {
      confetti({
        ...defaults,
        particleCount: 30,
        origin: { y: 0.6 }
      })
    }

    // Disparo inmediato
    shoot()

    // Segundo disparo con delay
    setTimeout(shoot, 150)
  }, [starShape])

  /**
   * Efecto de estrellas doradas - Para compras exitosas
   * Lluvia continua de estrellas con custom shape
   * Optimizado para mejor rendimiento
   */
  const fireStarsConfetti = useCallback(() => {
    const duration = 1.5 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 50, zIndex: 9999, shapes: [starShape] }

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 20 * (timeLeft / duration)

      // Estrellas doradas desde ambos lados
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#fbbf24', '#f59e0b', '#fcd34d'],
        scalar: 1.3
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#fbbf24', '#f59e0b', '#fcd34d'],
        scalar: 1.3
      })
    }, 350)
  }, [starShape])

  /**
   * Efecto de fireworks - Fuegos artificiales para compras premium
   * Optimizado para mejor rendimiento
   */
  const fireFireworksConfetti = useCallback(() => {
    const duration = 2 * 1000 // Reducido de 3s a 2s
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 50, zIndex: 9999, origin: { y: 0.7 } }

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 20 * (timeLeft / duration) // Reducido de 50 a 20

      // Fuegos artificiales desde diferentes posiciones
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.2, 0.4), y: randomInRange(0.5, 0.7) },
        colors: ['#fbbf24', '#f59e0b', '#eab308']
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.6, 0.8), y: randomInRange(0.5, 0.7) },
        colors: ['#8b5cf6', '#a78bfa', '#c084fc']
      })
    }, 400) // Aumentado de 350ms a 400ms
  }, [])

  return {
    // Básicos
    fireConfetti, // Explosión básica

    // Matches - Corazones personalizados 💕
    fireHeartsConfetti, // Custom shape de corazón (PRINCIPAL para matches)

    // Compras - Estrellas personalizadas 🎉
    firePurchaseConfetti, // Custom shape de estrella (PRINCIPAL para compras)
    firePremiumConfetti, // Premium con múltiples explosiones
    fireStarsConfetti, // Lluvia de estrellas doradas
    fireFireworksConfetti, // Fuegos artificiales (para paquetes grandes)

    // Efectos generales
    fireMatchConfetti, // Confeti continuo
    fireRainConfetti // Lluvia de confeti
  }
}

export default useConfetti
