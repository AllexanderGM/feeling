// src/context/NotificationContext.jsx
import { createContext, useContext, useState } from 'react'

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const addNotification = notification => {
    const id = Date.now()
    const newNotification = {
      id,
      type: notification.type || 'info',
      message: notification.message,
      autoClose: notification.autoClose !== false,
      duration: notification.duration || 5000
    }

    setNotifications(prev => [...prev, newNotification])

    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }

  const removeNotification = id => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const value = {
    notifications,
    addNotification,
    removeNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

const NotificationContainer = () => {
  const { notifications, removeNotification } = useContext(NotificationContext)

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`
            p-4 rounded-lg shadow-lg max-w-xs animate-fade-in
            ${
              notification.type === 'success'
                ? 'bg-green-800 text-white'
                : notification.type === 'error'
                  ? 'bg-red-800 text-white'
                  : notification.type === 'warning'
                    ? 'bg-yellow-800 text-white'
                    : 'bg-gray-800 text-white'
            }
          `}>
          <div className="flex items-start">
            {notification.type === 'success' && <span className="material-symbols-outlined mr-2">check_circle</span>}
            {notification.type === 'error' && <span className="material-symbols-outlined mr-2">error</span>}
            {notification.type === 'warning' && <span className="material-symbols-outlined mr-2">warning</span>}
            {notification.type === 'info' && <span className="material-symbols-outlined mr-2">info</span>}
            <p className="text-sm flex-1">{notification.message}</p>
            <button className="ml-2 text-white opacity-70 hover:opacity-100" onClick={() => removeNotification(notification.id)}>
              <span className="material-symbols-outlined text-xs">close</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de NotificationProvider')
  }
  return context
}
