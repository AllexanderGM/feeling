import { useState, useEffect, useRef } from 'react'

import Portal from './Portal.jsx'

const SearchAutocomplete = ({ suggestions, onSelect, isOpen, inputRef }) => {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef(null)

  const updatePosition = () => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }

  // Actualizar posición cuando cambia isOpen o suggestions
  useEffect(() => {
    updatePosition()
  }, [isOpen, suggestions])

  // Actualizar posición en resize y scroll
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition)

      return () => {
        window.removeEventListener('resize', updatePosition)
        window.removeEventListener('scroll', updatePosition)
      }
    }
  }, [isOpen])

  // Reset selectedIndex cuando cambian las sugerencias o se cierra el dropdown
  useEffect(() => {
    setSelectedIndex(-1)
  }, [suggestions, isOpen])

  // Manejar eventos de teclado desde el input
  useEffect(() => {
    const handleInputKeyDown = e => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            onSelect(suggestions[selectedIndex].text)
          }
          break
        case 'Escape':
          e.preventDefault()
          onSelect('')
          break
        default:
          break
      }
    }

    if (inputRef?.current) {
      inputRef.current.addEventListener('keydown', handleInputKeyDown)
      return () => {
        inputRef.current?.removeEventListener('keydown', handleInputKeyDown)
      }
    }
  }, [isOpen, selectedIndex, suggestions, onSelect, inputRef])

  if (!isOpen || suggestions.length === 0) return null

  const dropdownContent = (
    <div
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`
      }}
      role="listbox"
      aria-label="Sugerencias de búsqueda">
      <div className="bg-white/90 backdrop-blur rounded-lg shadow-lg overflow-hidden">
        {suggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.text}-${index}`}
            role="option"
            aria-selected={index === selectedIndex}
            className={`px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer text-left flex items-center gap-2 ${
              index === selectedIndex ? 'bg-gray-100' : ''
            }`}
            onClick={() => onSelect(suggestion.text)}
            onMouseEnter={() => setSelectedIndex(index)}>
            <span className="material-symbols-outlined icon text-gray-500">{suggestion.icon}</span>
            <span>{suggestion.text}</span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <div ref={containerRef} className="w-full" />
      <Portal>{dropdownContent}</Portal>
    </>
  )
}

export default SearchAutocomplete
