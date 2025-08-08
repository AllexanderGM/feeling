import { Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import { normalizeWords } from '@utils/normalizeWords.js'

import { Search, ChevronDown } from 'lucide-react'

const TourPageControls = ({
  filterValue,
  onClear,
  onSearchChange,
  statusFilter,
  setStatusFilter,
  statusOptions,
  loading,
  error,
  totalItems
}) => {
  return (
    <div className='filter-controls w-full flex flex-col items-center mb-6 mt-8'>
      {/* Contenedor con ancho máximo para mantener el centrado */}
      <div className='max-w-6xl w-full px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col sm:flex-row justify-between gap-4 items-end'>
          <Input
            isClearable
            className='w-full sm:max-w-[44%]'
            placeholder='Buscar tours...'
            startContent={<Search />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
            variant='underlined'
            classNames={{
              inputWrapper: [
                'data-[focus=true]:after:bg-[#E86C6E]',
                'after:transition-all after:duration-200 after:ease-in-out',
                'after:bg-[#E86C6E]'
              ]
            }}
          />
          <div className='flex gap-3'>
            <Dropdown>
              <DropdownTrigger className='hidden sm:flex'>
                <Button endContent={<ChevronDown className='text-small' />} variant='flat'>
                  Categoría
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label='Tour Categories'
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode='multiple'
                shouldCloseOnItemClick={false}
                onSelectionChange={setStatusFilter}>
                {statusOptions.map(status => (
                  <DropdownItem key={status.uid} className='capitalize'>
                    {normalizeWords(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className='flex justify-between items-center mt-2'>
          <span className='text-default-400 text-small'>
            {loading ? 'Cargando tours...' : error ? `Error: ${error}` : `${totalItems} tours disponibles`}
          </span>
          {Array.from(statusFilter).length > 0 && statusFilter !== 'all' && (
            <span className='text-xs text-primary'>
              <Button size='sm' variant='light' onPress={() => setStatusFilter('all')}>
                Limpiar filtros
              </Button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default TourPageControls
