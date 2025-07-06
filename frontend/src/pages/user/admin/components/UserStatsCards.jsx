import { memo } from 'react'
import { Card, CardBody } from '@heroui/react'

const UserStatsCards = memo(({ userStats }) => {
  if (!userStats) return null

  const statsConfig = [
    {
      value: userStats.total,
      label: 'Total Usuarios',
      color: 'text-blue-600'
    },
    {
      value: userStats.users,
      label: 'Usuarios Regulares',
      color: 'text-green-600'
    },
    {
      value: userStats.admins,
      label: 'Administradores',
      color: 'text-purple-600'
    },
    {
      value: userStats.verified,
      label: 'Verificados',
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statsConfig.map((stat, index) => (
        <Card key={index}>
          <CardBody className="flex flex-row items-center gap-3 p-4">
            <div className="flex flex-col">
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-sm text-gray-600">{stat.label}</span>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  )
})

UserStatsCards.displayName = 'UserStatsCards'

export default UserStatsCards