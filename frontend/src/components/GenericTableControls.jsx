import { Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'

import { SearchIcon, ChevronDownIcon, PlusIcon } from '../utils/icons.jsx'
import { ROWS_PER_PAGE_OPTIONS } from '../constants/tableConstants'

export const capitalize = s => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '')

const GenericTableControls = ({
  filterValue,
  onClear,
  onSearchChange,
  filterPlaceholder = 'Buscar...',
  // Props para filtros adicionales (opcional)
  showFilters = false,
  filterOptions = [],
  selectedFilter,
  onFilterChange,
  filterLabel = 'Filtrar',
  // Props para columnas
  columns,
  visibleColumns,
  setVisibleColumns,
  // Props para el botón de crear
  onCreateItem,
  createButtonLabel = 'Crear',
  // Props de estado
  loading,
  error,
  totalItems,
  itemsLabel = 'items',
  // Props de paginación
  rowsPerPage,
  onRowsPerPageChange
}) => {
  const handleRowsPerPageChange = e => {
    const newValue = Number(e.target.value)
    onRowsPerPageChange(newValue)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder={filterPlaceholder}
          startContent={<SearchIcon />}
          value={filterValue}
          onClear={onClear}
          onValueChange={onSearchChange}
          variant="underlined"
          classNames={{
            inputWrapper: [
              'data-[focus=true]:after:bg-[#E86C6E]',
              'after:transition-all after:duration-200 after:ease-in-out',
              'after:bg-[#E86C6E]'
            ]
          }}
        />
        <div className="flex gap-3">
          {showFilters && (
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                  {filterLabel}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Filters"
                closeOnSelect={false}
                selectedKeys={selectedFilter}
                selectionMode="multiple"
                shouldCloseOnItemClick={false}
                onSelectionChange={onFilterChange}>
                {filterOptions.map(option => (
                  <DropdownItem key={option.uid} className="capitalize">
                    {capitalize(option.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                Columnas
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={false}
              selectedKeys={visibleColumns}
              selectionMode="multiple"
              shouldCloseOnItemClick={false}
              onSelectionChange={setVisibleColumns}>
              {columns.map(column => (
                <DropdownItem key={column.uid} className="capitalize">
                  {capitalize(column.name)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Button color="primary" endContent={<PlusIcon />} onPress={onCreateItem}>
            {createButtonLabel}
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-default-400 text-small">
          {loading ? 'Cargando...' : error ? `Error: ${error}` : `${totalItems} ${itemsLabel} en total`}
        </span>
        <label className="flex items-center text-default-400 text-small">
          Filas por página:
          <select
            className="bg-transparent outline-none text-default-400 text-small ml-2"
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

export default GenericTableControls
