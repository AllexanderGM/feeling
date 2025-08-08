import { User, Chip, Tooltip } from '@heroui/react'
import { Link } from 'react-router-dom'
import { normalizeWords } from '@utils/normalizeWords.js'

import { Eye, Edit, Trash2 } from 'lucide-react'
import { STATUS_COLOR_MAP } from '../constants/tableConstants.jsx'
import { capitalize } from './TableControls'

const TableCellRenderer = ({ columnKey, lugar, onEdit, onDelete }) => {
  const cellValue = lugar[columnKey]

  switch (columnKey) {
    case 'nombre':
      return (
        <User
          avatarProps={{
            radius: 'lg',
            src: lugar.imagenes && lugar.imagenes.length > 0 ? lugar.imagenes[0] : 'https://via.placeholder.com/150'
          }}
          name={cellValue || 'Sin nombre'}
          description={
            lugar.description ? (lugar.description.length > 30 ? `${lugar.description.substring(0, 30)}...` : lugar.description) : ''
          }
        />
      )

    case 'categoria':
      return (
        <Chip className='capitalize' color={STATUS_COLOR_MAP[lugar.categoria] || 'default'} size='sm' variant='flat'>
          {normalizeWords(cellValue) || 'No definida'}
        </Chip>
      )

    case 'precio':
      return `${(cellValue || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`

    case 'destino':
      if (lugar.destination) {
        const fullDestination = [lugar.destination.city?.name, lugar.destination.country].filter(Boolean).join(', ')
        return fullDestination || cellValue || 'Sin destino'
      }
      return cellValue || 'Sin destino'

    case 'actions':
      return (
        <div className='relative flex items-center justify-center gap-2'>
          <Tooltip content='Detalles'>
            <Link to={`/tour/${lugar.idPaquete}`} className='text-lg text-default-400 cursor-pointer active:opacity-50'>
              <Eye />
            </Link>
          </Tooltip>
          <Tooltip content='Editar'>
            <span onClick={() => onEdit(lugar)} className='text-lg text-default-400 cursor-pointer active:opacity-50'>
              <Edit />
            </span>
          </Tooltip>
          <Tooltip color='danger' content='Eliminar'>
            <span className='text-lg text-danger cursor-pointer active:opacity-50' onClick={() => onDelete(lugar)}>
              <Trash2 />
            </span>
          </Tooltip>
        </div>
      )

    default:
      return cellValue || '-'
  }
}

export default TableCellRenderer
