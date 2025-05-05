import { Input, Button, Image } from '@heroui/react'
import { useState, useEffect, useRef } from 'react'
import { useSearch } from '@context/SearchContext'
import './hero.scss'
import SearchIcon from '@components/SearchIcon.jsx'
import SearchAutocomplete from '@components/SearchAutocomplete.jsx'
import image from '@assets/Backgrounds/topography.svg'
import pinIcon from '@assets/Icons/pin.png'

import DateRangePicker from './DateRangePicker.jsx'

const Hero = () => {
  const { searchTerm, updateSearchTerm, loading, suggestions } = useSearch()
  const [inputValue, setInputValue] = useState(searchTerm)
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)
  const searchContainerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setInputValue(searchTerm)
  }, [searchTerm])

  const handleInputChange = e => {
    const newValue = e.target.value
    setInputValue(newValue)
    setIsAutocompleteOpen(true)
    updateSearchTerm(newValue)
  }

  const handleClear = () => {
    setInputValue('')
    setIsAutocompleteOpen(false)
    updateSearchTerm('')
  }

  const handleReset = () => {
    setInputValue('')
    setIsAutocompleteOpen(false)
    updateSearchTerm('')

    // Reset date range in context (handled by SearchContext)
    const event = new CustomEvent('reset-date-range')
    window.dispatchEvent(event)
  }

  const handleSuggestionSelect = suggestion => {
    setInputValue(suggestion)
    setIsAutocompleteOpen(false)
    updateSearchTerm(suggestion)
  }

  // Cerrar el autocompletado cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = event => {
      if (!searchContainerRef.current?.contains(event.target)) {
        setIsAutocompleteOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <div
      className="flex flex-col justify-center items-center h-auto py-12 text-center mb-6 hero_container relative"
      style={{ backgroundImage: `url("${image}")` }}>
      <div className="pattern_overlay"></div>
      <h1 className={`text-4xl md:text-6xl font-bold tracking-tight p-6 relative`}>
        <span className="inline-block">
          <span className="inline-block absolute top-7 -left-9 w-full h-full opacity-75">
            <Image src={pinIcon} alt="pin" width={53} className="-rotate-12 " />
          </span>
          La búsqueda perfecta,
        </span>
        <br />
        <span className="bg-gradient-to-r from-[#E86C6E] to-primary/70 text-transparent bg-clip-text">del tour perfecto</span>
      </h1>
      {/* <p className="text-center max-w-xl mb-6 text-slate-700"> */}
      {/*   Encuentra experiencias únicas seleccionando destino y fechas para descubrir{' '} */}
      {/*   <span className="text-[#E86C6E] font-medium">los mejores tours disponibles.</span> */}
      {/* </p> */}

      {/* <div className="w-full max-w-7xl px-[50px] md:px-[150px] rounded-2xl"> */}
      <div className="w-full max-w-4xl rounded-2xl">
        <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Destino input */}
            <div ref={searchContainerRef} className="md:col-span-5 search-container relative">
              <label className="block text-sm font-medium text-gray-700 text-left mb-1">¿Dónde quieres ir?</label>
              <Input
                ref={inputRef}
                isClearable
                value={inputValue}
                onChange={handleInputChange}
                onClear={handleClear}
                isDisabled={loading}
                onFocus={() => setIsAutocompleteOpen(true)}
                classNames={{
                  input: ['bg-transparent', 'text-black/90', 'placeholder:text-default-900/50'],
                  innerWrapper: 'bg-transparent',
                  inputWrapper: [
                    'bg-default-100',
                    'hover:bg-default-200',
                    'group-data-[focus=true]:bg-default-100',
                    '!cursor-text',
                    'group-data-[focus=true]:border-1',
                    'group-data-[focus=true]:border-[#E86C6E]',
                    'h-12'
                  ]
                }}
                placeholder="Buscar destinos..."
                radius="lg"
                startContent={<SearchIcon className="text-black/50 mb-0.5 text-slate-500 pointer-events-none flex-shrink-0" />}
              />
              <SearchAutocomplete
                suggestions={suggestions}
                onSelect={handleSuggestionSelect}
                isOpen={isAutocompleteOpen}
                inputRef={inputRef}
              />
            </div>

            <div className="md:col-span-5">
              <label className="block text-sm font-medium text-gray-700 text-left mb-1">¿Cuándo viajas?</label>
              <DateRangePicker />
            </div>

            <div className="md:col-span-2 flex items-end">
              <Button variant="flat" color="default" className="w-full h-12" onPress={handleReset}>
                <span className="text-md">Limpiar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
