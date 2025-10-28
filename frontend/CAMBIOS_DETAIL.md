# Cambios para Detail.jsx

El archivo `src/pages/user/detail/Detail.jsx` necesita los siguientes cambios para soportar los estados de match correctamente:

## 1. Agregar import de ArrowRight (línea ~45)

**Buscar:**
```javascript
  Ban
} from 'lucide-react'
```

**Reemplazar con:**
```javascript
  Ban,
  ArrowRight
} from 'lucide-react'
```

## 2. Mover y actualizar handlers (después de línea ~169)

**Buscar:**
```javascript
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleBack = () => {
    navigate(-1)
  }

  // Handlers para acciones de match
  const handleLike = useCallback(async () => {
    await sendMatch(userId)
    handleBack()
  }, [userId, sendMatch, handleBack])

  const handlePass = useCallback(async () => {
    await dismissSuggestion(userId)
    handleBack()
  }, [userId, dismissSuggestion, handleBack])
```

**Reemplazar con:**
```javascript
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Extraer estados de match antes de los handlers
  const compatibility = userData?.compatibility
  const hasPendingMatch = userData?.hasPendingMatch
  const hasAcceptedMatch = userData?.hasAcceptedMatch

  const handleBack = () => {
    navigate(-1)
  }

  // Handlers para acciones de match
  const handleLike = useCallback(async () => {
    // No permitir enviar match si ya hay uno pendiente o aceptado
    if (hasPendingMatch || hasAcceptedMatch) {
      return
    }
    await sendMatch(userId)
    handleBack()
  }, [userId, sendMatch, handleBack, hasPendingMatch, hasAcceptedMatch])

  const handlePass = useCallback(async () => {
    await dismissSuggestion(userId)
    handleBack()
  }, [userId, dismissSuggestion, handleBack])

  const handleContinue = useCallback(() => {
    // Solo regresar sin rechazar al usuario
    handleBack()
  }, [handleBack])
```

## 3. Actualizar dependencies del handleReportUser (línea ~225)

**Buscar:**
```javascript
  }, [userId, reportReason, reportDescription, onReportModalOpenChange])
```

**Reemplazar con:**
```javascript
  }, [userId, reportReason, reportDescription, onReportModalOpenChange, handleError, handleSuccess])
```

## 4. Eliminar duplicación de variables (líneas ~249-252)

**ELIMINAR estas líneas:**
```javascript
  // Extraer datos usando accessors centralizados
  const compatibility = userData?.compatibility
  const hasPendingMatch = userData?.hasPendingMatch
  const hasAcceptedMatch = userData?.hasAcceptedMatch
```

Ya las movimos arriba cerca de los handlers.

## 5. Agregar badge de Favorito (después del badge de "Match pendiente", línea ~528)

**Buscar:**
```javascript
                    {hasPendingMatch && !hasAcceptedMatch && (
                      <Chip
                        className='bg-gradient-to-r from-yellow-500 to-orange-500 text-white backdrop-blur-md'
                        size='sm'
                        startContent={<Mail className='w-3 h-3' />}>
                        Match pendiente
                      </Chip>
                    )}
                  </div>
```

**Reemplazar con:**
```javascript
                    {hasPendingMatch && !hasAcceptedMatch && (
                      <Chip
                        className='bg-gradient-to-r from-yellow-500 to-orange-500 text-white backdrop-blur-md'
                        size='sm'
                        startContent={<Mail className='w-3 h-3' />}>
                        Match pendiente
                      </Chip>
                    )}
                    {isFavorite && (
                      <Chip
                        className='bg-gradient-to-br from-blue-500 to-cyan-500 text-white backdrop-blur-md shadow-lg'
                        size='sm'
                        startContent={<Bookmark className='w-3 h-3 fill-current' />}>
                        Favorito
                      </Chip>
                    )}
                  </div>
```

## 6. Actualizar sección de Botones de acción (líneas ~610-656)

**Buscar TODA esta sección:**
```javascript
            {/* Botones de acción */}
            <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
              <CardBody className='p-4'>
                <div className='flex items-center justify-center gap-3'>
                  {/* Botón Pasar */}
                  <Button
                    isIconOnly
                    className='bg-white/10 hover:bg-red-500/20 border-2 border-white/20 hover:border-red-500/60 text-red-400'
                    isDisabled={matchLoading}
                    radius='full'
                    size='lg'
                    variant='flat'
                    onPress={handlePass}>
                    <X className='w-6 h-6' strokeWidth={2.5} />
                  </Button>

                  {/* Botón Match - Centro (más grande) */}
                  <Button
                    isIconOnly
                    className='bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 shadow-xl shadow-pink-500/40'
                    isLoading={matchLoading}
                    radius='full'
                    size='lg'
                    style={{ width: '64px', height: '64px' }}
                    variant='solid'
                    onPress={handleLike}>
                    {!matchLoading && <Heart className='w-7 h-7 text-white fill-current' />}
                  </Button>

                  {/* Botón Favorito */}
                  <Button
                    isIconOnly
                    className={`${
                      isFavorite
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/40'
                        : 'bg-white/10 border-2 border-white/20 hover:border-blue-500/60 hover:bg-blue-500/20'
                    } text-blue-300`}
                    isDisabled={favoriteLoading}
                    radius='full'
                    size='lg'
                    variant='flat'
                    onPress={handleToggleFavorite}>
                    <Bookmark className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} strokeWidth={2.5} />
                  </Button>
                </div>
              </CardBody>
            </Card>
```

**Reemplazar con:**
```javascript
            {/* Botones de acción */}
            <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
              <CardBody className='p-4'>
                <div className='flex items-center justify-center gap-3'>
                  {/* Botón Pasar/Continuar - Cambia según el estado de match */}
                  {hasPendingMatch || hasAcceptedMatch ? (
                    <Button
                      isIconOnly
                      className='bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-2 border-blue-300/40 shadow-lg shadow-blue-500/30 text-white transition-all duration-200'
                      radius='full'
                      size='lg'
                      variant='solid'
                      onPress={handleContinue}>
                      <ArrowRight className='w-6 h-6' strokeWidth={2.5} />
                    </Button>
                  ) : (
                    <Button
                      isIconOnly
                      className='bg-white/10 hover:bg-red-500/20 active:bg-red-500/30 border-2 border-white/20 hover:border-red-500/60 text-red-400 hover:text-red-300 transition-all duration-200'
                      isDisabled={matchLoading}
                      radius='full'
                      size='lg'
                      variant='flat'
                      onPress={handlePass}>
                      <X className='w-6 h-6' strokeWidth={2.5} />
                    </Button>
                  )}

                  {/* Botón Match - Centro (más grande) */}
                  <Button
                    isIconOnly
                    className={`${
                      hasPendingMatch || hasAcceptedMatch
                        ? 'bg-gray-700 border-2 border-gray-600/50 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 active:scale-95 shadow-xl shadow-pink-500/40 border-2 border-white/20'
                    } transition-all duration-200`}
                    isDisabled={hasPendingMatch || hasAcceptedMatch}
                    isLoading={matchLoading}
                    radius='full'
                    size='lg'
                    style={{ width: '64px', height: '64px' }}
                    variant='solid'
                    onPress={handleLike}>
                    {!matchLoading && <Heart className='w-7 h-7 text-white fill-current' />}
                  </Button>

                  {/* Botón Favorito */}
                  <Button
                    isIconOnly
                    className={`${
                      isFavorite
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/40 border-2 border-blue-300/40'
                        : 'bg-white/10 border-2 border-white/20 hover:border-blue-500/60 hover:bg-blue-500/20'
                    } text-blue-300 hover:text-blue-200 active:scale-95 transition-all duration-200`}
                    isDisabled={favoriteLoading}
                    radius='full'
                    size='lg'
                    variant='flat'
                    onPress={handleToggleFavorite}>
                    <Bookmark className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} strokeWidth={2.5} />
                  </Button>
                </div>
              </CardBody>
            </Card>
```

---

## Resumen de cambios:

✅ **Import ArrowRight** - Para el botón de continuar
✅ **Estados de match movidos** - Antes de los handlers para usarlos en las dependencias
✅ **Handler handleContinue** - Nuevo handler para cuando ya hay match
✅ **Badge de Favorito** - Muestra cuando el usuario está en favoritos
✅ **Botones adaptativos** - Cambian según el estado del match
✅ **Estilos mejorados** - Transiciones y estados visuales consistentes

Aplica estos cambios manualmente en el archivo `Detail.jsx`. El archivo de backup está en `Detail.jsx.backup` por si lo necesitas.
