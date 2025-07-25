import { useMemo } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Button,
  Skeleton
} from '@heroui/react'
import { Edit2, Trash2, Package, DollarSign } from 'lucide-react'
import { MATCH_PLAN_COLUMNS } from '@constants/tableConstants.js'

const UnifiedPlanTable = ({
  plans,
  loading,
  sortDescriptor,
  onSortChange,
  selectedKeys,
  onSelectionChange,
  visibleColumns,
  onEdit,
  onDelete
}) => {
  const renderCell = (plan, columnKey) => {
    const cellValue = plan[columnKey]

    switch (columnKey) {
      case 'name':
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-gray-100">{plan.name}</p>
              <p className="text-xs text-gray-400 line-clamp-1">{plan.description}</p>
            </div>
          </div>
        )

      case 'attempts':
        return (
          <Chip
            size="sm"
            variant="flat"
            color="primary"
            className="font-medium"
          >
            {cellValue} {cellValue === 1 ? 'intento' : 'intentos'}
          </Chip>
        )

      case 'price':
        return (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="font-medium text-green-400">
              ${cellValue.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )

      case 'totalPurchases':
        return (
          <div className="text-center">
            <p className="font-medium text-gray-100">{cellValue}</p>
            <p className="text-xs text-gray-400">compras</p>
          </div>
        )

      case 'revenue':
        return (
          <div className="text-center">
            <p className="font-medium text-yellow-400">
              ${cellValue.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-400">ingresos</p>
          </div>
        )

      case 'isActive':
        return (
          <Chip
            size="sm"
            variant="flat"
            color={cellValue ? 'success' : 'default'}
          >
            {cellValue ? 'Activo' : 'Inactivo'}
          </Chip>
        )

      case 'createdAt':
        return (
          <div className="text-sm text-gray-400">
            {new Date(cellValue).toLocaleDateString('es-CO', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        )

      case 'actions':
        return (
          <div className="flex items-center gap-2">
            <Tooltip content="Editar plan">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-blue-400 hover:bg-blue-500/20"
                onPress={() => onEdit(plan)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Eliminar plan" color="danger">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-red-400 hover:bg-red-500/20"
                onPress={() => onDelete(plan)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        )

      default:
        return cellValue
    }
  }

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return MATCH_PLAN_COLUMNS
    return MATCH_PLAN_COLUMNS.filter(column => Array.from(visibleColumns).includes(column.uid))
  }, [visibleColumns])

  const loadingState = loading || plans.length === 0

  return (
    <Table
      aria-label="Tabla de planes de match"
      isHeaderSticky
      color="primary"
      selectionMode="multiple"
      selectedKeys={selectedKeys}
      onSelectionChange={onSelectionChange}
      sortDescriptor={sortDescriptor}
      onSortChange={onSortChange}
      classNames={{
        wrapper: "max-h-[382px] bg-gray-800/40 backdrop-blur-sm border border-gray-700/50",
        th: "bg-gray-700/50 text-gray-300 border-b border-gray-600/50",
        td: "border-b border-gray-700/30",
        tbody: "[&>tr:hover]:bg-gray-700/20"
      }}
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === 'actions' ? 'center' : 'start'}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        items={plans}
        loadingContent={<Skeleton className="w-full h-8 rounded-lg bg-gray-700/50" />}
        loadingState={loadingState ? "loading" : "idle"}
        emptyContent={
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              No hay planes de match
            </h3>
            <p className="text-sm text-gray-500">
              Crea tu primer plan de match para empezar
            </p>
          </div>
        }
      >
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export default UnifiedPlanTable