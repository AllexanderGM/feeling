import { Tooltip } from '@heroui/react'
import { Link } from 'react-router-dom'
import { Eye, Edit, Trash2 } from 'lucide-react'

const TableActionCell = ({
  item,
  onView,
  onEdit,
  onDelete,
  viewPath,
  viewTooltip = 'Detalles',
  editTooltip = 'Editar',
  deleteTooltip = 'Eliminar'
}) => {
  return (
    <div className="relative flex items-center justify-center gap-2">
      <Tooltip content={viewTooltip}>
        {viewPath ? (
          <Link to={viewPath} className="text-lg text-default-400 cursor-pointer active:opacity-50">
            <Eye />
          </Link>
        ) : (
          <span onClick={() => onView?.(item)} className="text-lg text-default-400 cursor-pointer active:opacity-50">
            <Eye />
          </span>
        )}
      </Tooltip>
      <Tooltip content={editTooltip}>
        <span onClick={() => onEdit?.(item)} className="text-lg text-default-400 cursor-pointer active:opacity-50">
          <Edit />
        </span>
      </Tooltip>
      <Tooltip color="danger" content={deleteTooltip}>
        <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => onDelete?.(item)}>
          <Trash2 />
        </span>
      </Tooltip>
    </div>
  )
}

export default TableActionCell
