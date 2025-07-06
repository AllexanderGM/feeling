import { Button, Pagination } from '@heroui/react'

const TablePagination = ({ selectedKeys, filteredItemsLength, page, pages, onPreviousPage, onNextPage, onPageChange }) => {
  return (
    <div className="py-2 px-2 flex justify-between items-center">
      <span className="w-[30%] text-small text-default-400">
        {selectedKeys === 'all' ? 'All items selected' : `${selectedKeys.size} de ${filteredItemsLength} seleccionados`}
      </span>
      <Pagination
        initialPage={1}
        isCompact
        showControls
        showShadow
        color="primary"
        page={page}
        total={pages}
        onChange={onPageChange}
        classNames={{
          item: 'bg-white hover:bg-white',
          prev: 'bg-white hover:bg-purple-600',
          next: 'bg-white hover:bg-purple-600'
        }}
      />
      <div className="hidden sm:flex w-[30%] justify-end gap-2">
        <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
          Anterior
        </Button>
        <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
          Siguiente
        </Button>
      </div>
    </div>
  )
}

export default TablePagination
