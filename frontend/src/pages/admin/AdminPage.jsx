import { useCallback, useEffect, useState } from 'react'
import { Button, Switch, Tabs, Tab, Card, CardBody } from '@heroui/react'
import TableTours from '@components/TableTours'
import TableUsers from '@components/TableUsers'

export default function AdminPage() {
  return (
    <div className="flex flex-col items-center 9-full min-h-screen bg-gray-100 p-6 mb-6 mt-12">
      <div className="flex w-full max-w-6xl  flex-col">
        <Tabs aria-label="Options">
          <Tab key="tours" title="Tours">
            <TableTours />
          </Tab>
          <Tab key="usuarios" title="Usuarios">
            <TableUsers />
          </Tab>
        </Tabs>
      </div>
    </div>
  )
}
