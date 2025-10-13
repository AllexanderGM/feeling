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
    <div className='relative flex items-center justify-center gap-2'>
      <Tooltip content={viewTooltip}>
        {viewPath ? (
          <Link className='text-lg text-default-400 cursor-pointer active:opacity-50' to={viewPath}>
            <Eye />
          </Link>
        ) : (
          <button
            aria-label={viewTooltip}
            className='text-lg text-default-400 cursor-pointer active:opacity-50 bg-transparent border-none p-0'
            type='button'
            onClick={() => onView?.(item)}>
            <Eye />
          </button>
        )}
      </Tooltip>
      <Tooltip content={editTooltip}>
        <button
          aria-label={editTooltip}
          className={`text-lg ${onEdit ? 'text-default-400 cursor-pointer active:opacity-50 bg-transparent border-none p-0' : 'text-default-200 cursor-not-allowed opacity-50 line-through bg-transparent border-none p-0'}`}
          disabled={!onEdit}
          type='button'
          onClick={() => onEdit?.(item)}>
          <Edit />
        </button>
      </Tooltip>
      <Tooltip color='danger' content={deleteTooltip}>
        <button
          aria-label={deleteTooltip}
          className={`text-lg ${onDelete ? 'text-danger cursor-pointer active:opacity-50 bg-transparent border-none p-0' : 'text-default-200 cursor-not-allowed opacity-50 line-through bg-transparent border-none p-0'}`}
          disabled={!onDelete}
          type='button'
          onClick={() => onDelete?.(item)}>
          <Trash2 />
        </button>
      </Tooltip>
    </div>
  )
}

export default TableActionCell
