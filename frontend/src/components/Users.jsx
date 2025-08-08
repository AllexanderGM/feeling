import { useEffect, useState } from 'react'
import axios from 'axios'

const Users = () => {
  const [users, setUsers] = useState(null)
  const URL = import.meta.env.VITE_URL_BACK || 'http://localhost:8080'

  useEffect(() => {
    axios.get(URL).then(res => {
      setUsers(res.data)
    })
  }, [])

  if (!users) return null

  return (
    <>
      <ul className='ml-20 mt-20'>
        {users.map(user => (
          <ol key={user.id}>{user.nombre}</ol>
        ))}
      </ul>
    </>
  )
}

export default Users
