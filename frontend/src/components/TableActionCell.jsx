import { Tooltip } from '@heroui/react'
import { Link } from 'react-router-dom'

import { EyeIcon, EditIcon, DeleteIcon } from '../utils/icons.jsx'

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
            <EyeIcon />
          </Link>
        ) : (
          <span onClick={() => onView?.(item)} className="text-lg text-default-400 cursor-pointer active:opacity-50">
            <EyeIcon />
          </span>
        )}
      </Tooltip>
      <Tooltip content={editTooltip}>
        <span onClick={() => onEdit?.(item)} className="text-lg text-default-400 cursor-pointer active:opacity-50">
          <EditIcon />
        </span>
      </Tooltip>
      <Tooltip color="danger" content={deleteTooltip}>
        <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => onDelete?.(item)}>
          <DeleteIcon />
        </span>
      </Tooltip>
    </div>
  )
}

export default TableActionCell
