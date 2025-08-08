import { Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'

import { Search, ChevronDown, Plus } from 'lucide-react'
import { INITIAL_VISIBLE_COLUMNS, ROWS_PER_PAGE_OPTIONS } from '../constants/tableConstants.js'
import { Logger } from '@utils/logger.js'

export const capitalize = s => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '')

const TableControls = ({
  filterValue,
  onClear,
  onSearchChange,
  statusFilter,
  setStatusFilter,
  statusOptions,
  visibleColumns,
  setVisibleColumns,
  onCreateTour,
  loading,
  error,
  totalItems,
  rowsPerPage,
  onRowsPerPageChange
}) => {
  // Manejador para el cambio de filas por página
  const handleRowsPerPageChange = e => {
    const newValue = Number(e.target.value)
    Logger.debug('Cambiando filas por página', Logger.CATEGORIES.UI, { newValue })
    onRowsPerPageChange(newValue)
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between gap-3 items-end'>
        <Input
          isClearable
          className='w-full sm:max-w-[44%]'
          placeholder='Buscar por nombre...'
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
              aria-label='Table Columns'
              closeOnSelect={false}
              selectedKeys={statusFilter}
              selectionMode='multiple'
              shouldCloseOnItemClick={false}
              onSelectionChange={setStatusFilter}>
              {statusOptions.map(status => (
                <DropdownItem key={status.uid} className='capitalize'>
                  {capitalize(status.name)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger className='hidden sm:flex'>
              <Button endContent={<ChevronDown className='text-small' />} variant='flat'>
                Columnas
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label='Table Columns'
              closeOnSelect={false}
              selectedKeys={visibleColumns}
              selectionMode='multiple'
              shouldCloseOnItemClick={false}
              onSelectionChange={setVisibleColumns}>
              {INITIAL_VISIBLE_COLUMNS.map(column => (
                <DropdownItem key={column.uid} className='capitalize'>
                  {capitalize(column.name)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Button color='primary' endContent={<Plus />} onPress={onCreateTour}>
            Crear Tour
          </Button>
        </div>
      </div>
      <div className='flex justify-between items-center'>
        <span className='text-default-400 text-small'>
          {loading ? 'Cargando tours...' : error ? `Error: ${error}` : `${totalItems} tours en total`}
        </span>
        <label className='flex items-center text-default-400 text-small'>
          Filas por página:
          <select
            className='bg-transparent outline-none text-default-400 text-small ml-2'
            onChange={handleRowsPerPageChange}
            value={rowsPerPage}>
            {ROWS_PER_PAGE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}

export default TableControls
