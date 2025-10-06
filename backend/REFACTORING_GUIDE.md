# Guía de Refactorización - Proyecto Feeling

## Objetivo
Refactorizar el proyecto siguiendo las mejores prácticas establecidas en `User.java` y `UserService.java` como referencias de calidad.

## Principios Generales

### 1. Documentación
- **Clases**: JavaDoc completo con propósito, autor (J. Alexander Gavilán M.) y versión
- **Métodos**: JavaDoc conciso y profesional
  - Descripción clara del propósito
  - @param con descripciones breves
  - @return explicando qué retorna
  - Sin información innecesaria o redundante

### 2. Eliminación de Código
- ❌ **Dead code**: Eliminar métodos sin uso
- ❌ **Duplicados**: Consolidar métodos que hacen lo mismo
- ❌ **Deprecated**: Eliminar si no tienen uso activo
- ❌ **Hardcoded**: Evitar valores hardcodeados en queries

### 3. Optimización de Queries
- ✅ **FETCH JOIN**: Agregar en queries que retornan entidades con relaciones
- ✅ **Paginación**: Preferir `Page<T>` sobre `List<T>` para grandes volúmenes
- ✅ **Índices**: Queries optimizadas que usan índices de BD

### 4. Naming Conventions
- ✅ **Spring Data JPA**: Seguir convención para métodos automáticos
- ✅ **Nombres claros**: Sin sufijos redundantes como "Optimized"
- ✅ **Consistencia**: Mantener mismo patrón en toda la clase

### 5. Organización
- ✅ **Secciones claras**: Agrupar métodos por responsabilidad
- ✅ **Orden lógico**: De lo general a lo específico
- ✅ **Separación**: Búsquedas / Validaciones / Estadísticas / Admin

## Proceso Método por Método

### Para cada método verificar:

1. **¿Tiene usos activos?**
   - Usar `Grep` para buscar llamadas al método
   - Si **NO tiene usos** → **EVALUAR CONTEXTO**:
     - ¿Es útil para funcionalidades futuras? (panel admin, reportes, métricas)
     - ¿Es un método básico del dominio? (búsquedas por campos principales)
     - ¿Está relacionado con features planeadas?
     - **SI es útil** → Documentar y mantener
     - **SI NO es útil** → Eliminar (dead code)

2. **¿Está duplicado?**
   - Buscar métodos similares en la clase
   - Consolidar al más completo/eficiente
   - Actualizar referencias en servicios

3. **¿Tiene optimizaciones?**
   - Verificar FETCH JOIN en relaciones
   - Verificar paginación si retorna colecciones
   - Agregar `@Query` optimizada si es necesario

4. **¿El nombre es correcto?**
   - Verificar convenciones Spring Data
   - Eliminar sufijos innecesarios
   - Renombrar si no es claro

5. **¿Está documentado?**
   - Agregar JavaDoc conciso
   - Incluir información de parámetros
   - Explicar qué retorna

## Ejemplo de Refactorización

### ❌ Antes
```java
// Sin documentación
@Query("SELECT ua FROM UserAttribute ua WHERE ua.attributeType = :type")
List<UserAttribute> findByAttributeTypeOrderedByDisplay(@Param("type") String type);

// Método duplicado sin uso
List<UserAttribute> findByAttributeTypeAndActiveTrue(String type);

// Método "optimizado" redundante
@Query("SELECT ua FROM UserAttribute ua LEFT JOIN FETCH ua.user WHERE...")
List<UserAttribute> findByTypeOptimized(@Param("type") String type);
```

### ✅ Después
```java
/**
 * Busca todos los atributos activos de un tipo específico ordenados por displayOrder.
 *
 * @param attributeType Tipo de atributo
 * @return Lista de atributos activos ordenados
 */
@Query("SELECT ua FROM UserAttribute ua WHERE ua.attributeType = :attributeType AND ua.active = true ORDER BY ua.displayOrder ASC")
List<UserAttribute> findByAttributeTypeAndActiveTrueOrderByDisplayOrderAsc(@Param("attributeType") String attributeType);
```

## Checklist por Archivo

### Repositorios
- [ ] Eliminar métodos sin uso
- [ ] Consolidar duplicados
- [ ] Agregar FETCH JOIN donde corresponda
- [ ] Documentar todos los métodos
- [ ] Documentar la clase
- [ ] Organizar por secciones lógicas
- [ ] Verificar naming conventions

### Servicios
- [ ] Actualizar llamadas a métodos renombrados
- [ ] Verificar lógica de negocio
- [ ] Documentar métodos públicos
- [ ] Eliminar código comentado

### Controladores
- [ ] Verificar endpoints RESTful
- [ ] Documentar con @Operation (Swagger)
- [ ] Validar permisos (@PreAuthorize)

### Entidades
- [ ] Verificar relaciones JPA
- [ ] Documentar campos importantes
- [ ] Optimizar lazy/eager loading

## Orden de Refactorización

1. **Repositorios** (actual)
2. Servicios
3. DTOs y Mappers
4. Controladores
5. Entidades (si es necesario)

## Notas Importantes

- **No romper código existente**: Actualizar todos los usos antes de eliminar
- **Compilar frecuentemente**: Verificar que no haya errores
- **Mantener estilo consistente**: Seguir patrones establecidos
- **Documentación concisa**: Evitar explicaciones obvias o redundantes
