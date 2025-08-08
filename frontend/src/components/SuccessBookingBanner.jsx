import { useState, useEffect, useRef } from 'react'
import { Alert } from '@heroui/react'
import { Link } from 'react-router-dom'

const SuccessBookingBanner = ({ message, onClose }) => {
  const [showAlert, setShowAlert] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const entryTimer = setTimeout(() => {
      setShowAlert(true)
    }, 200)

    return () => clearTimeout(entryTimer)
  }, [])

  useEffect(() => {
    if (showAlert) {
      const startTimer = () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
        timerRef.current = setTimeout(() => {
          setShowAlert(false)
        }, 5000)
      }

      startTimer()

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
      }
    }
  }, [showAlert])

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      setShowAlert(false)
    }, 2000)
  }

  const handleClose = () => {
    setShowAlert(false)
    setTimeout(onClose, 500)
  }

  return (
    <div
      className={`fixed top-[85px] right-4 z-50 pointer-events-none transition-all duration-300 ease-in enter:duration-200 exit:duration-500 exit:ease-out ${
        showAlert ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
      }`}>
      <div className='w-auto max-w-md pointer-events-auto' onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Link to='/mis-reservas' className='block'>
          <Alert color='success' dismissible={false} onClose={handleClose} className='cursor-pointer hover:opacity-90 transition-opacity'>
            {typeof message === 'object' ? (
              <span>
                {message.prefix}
                <span className='font-bold'>{message.highlight}</span>
                {message.suffix}
              </span>
            ) : (
              message
            )}
          </Alert>
        </Link>
      </div>
    </div>
  )
}

export default SuccessBookingBanner
