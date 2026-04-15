# Análisis Detallado: Flujo de Estados de Riesgos

**Fecha**: 14 Abril 2026  
**Backend**: Django Framework  
**App**: `apps/riesgos`

---

## 📋 Tabla de Transiciones de Estado

| # | Acción | Endpoint | Rol Requerido | Estado Actual | Estado Nuevo | Restricciones y Validaciones |
|---|--------|----------|---------------|---------------|--------------|-------------------------------|
| 1 | **CREAR RIESGO** | `POST /api/riesgos/` | Admin, Analista Riesgos, Superadmin | - | `borrador` | • Código único por empresa • Categoría válida • Probabilidad 1-5 • Impacto 1-5 • nombre y descripción requeridos |
| 2 | **ENVIAR A REVISIÓN** | `POST /api/riesgos/{id}/enviar_revision/` | Cualquiera | `borrador` | `en_revision` | • Solo acepta riesgos en `borrador` • Sin validaciones adicionales |
| 3 | **APROBAR RIESGO** | `POST /api/riesgos/{id}/aprobar/` | Admin, Superadmin | `en_revision` | `aprobado` | • Requiere cumplir con `AprobarRiesgoSerializer` • Registra: `aprobado_por`, `fecha_aprobacion` • Permite notas opcionales |
| 4 | **RECHAZAR RIESGO** | `POST /api/riesgos/{id}/rechazar/` | Admin, Superadmin | `en_revision` | `borrador` | • **REQUIERE**: Campo `motivo` (obligatorio y no vacío) • Registra motivo en notas con prefijo `[Rechazado por {usuario}]` |
| 5 | **CREAR PLAN TRATAMIENTO** | `POST /api/riesgos/planes/` | Admin, Analista Riesgos, Superadmin | `aprobado` O `en_tratamiento` | `en_tratamiento` (si estaba en `aprobado`) | • Transición automática: `aprobado` → `en_tratamiento` • Requiere responsable de la empresa • Fecha fin > fecha inicio • Plan creado en estado `no_iniciada` |
| 6 | **APROBAR PLAN** | `POST /api/riesgos/planes/{id}/aprobar/` | Admin, Superadmin | `en_tratamiento` (del riesgo) | Plan `no_iniciada` → `en_curso` | • Plan no puede estar previo aprobado • Registra: `aprobado_por`, `fecha_aprobacion` |
| 7 | **ACTUALIZAR AVANCE** | `PATCH /api/riesgos/planes/{id}/actualizar_avance/` | Responsable o Admin/Superadmin | `en_tratamiento` | Sin cambio (actualiza campos) | • No puede bajar `porcentaje_avance` • No edita planes en `completada` • Puede cambiar estado del plan |
| 8 | **CERRAR RIESGO** | `POST /api/riesgos/{id}/cerrar/` | Admin, Superadmin | Cualquiera (sin restricción) | `cerrado` | • Motivo opcional • Si hay motivo, se añade a notas • Estado terminal |

---

## 🔴 Estados Disponibles (7 totales)

### Definición en modelo (`ESTADO_CHOICES`):
```python
ESTADO_CHOICES = [
    ('borrador',         'Borrador'),          # Sin aprobar
    ('en_revision',      'En Revisión'),       # Pendiente de admin
    ('aprobado',         'Aprobado'),          # Listo para tratamiento
    ('en_tratamiento',   'En Tratamiento'),    # Con plan activo
    ('mitigado',         'Mitigado'),          # ❌ NO IMPLEMENTADO
    ('aceptado',         'Aceptado'),          # ⚠️ NO IMPLEMENTADO
    ('cerrado',          'Cerrado'),           # Terminal
]
```

---

## 🚫 Restricciones de Edición Global

Un riesgo **NO puede ser editado** (endpoint `PATCH /api/riesgos/{id}/`) si está en estos estados:
- ✗ `cerrado` → *Estado terminal*
- ✗ `mitigado` → *Tratamiento completado*
- ✗ `aceptado` → *Conscientemente aceptado*

**Código de validación**:
```python
if riesgo.estado in ['cerrado', 'mitigado', 'aceptado']:
    return error_response(
        f'No se puede editar un riesgo en estado: {riesgo.get_estado_display()}'
    )
```

---

## 🔄 Flujo Happy Path (Camino Correcto)

```
1. ANALISTA crea riesgo
   Estado: borrador
   └─→ Puede editar

2. ANALISTA envía a revisión
   Estado: en_revision
   └─→ NO puede editar (validación NO está implementada ⚠️)

3. ADMIN aprueba O rechaza
   ├─ Si APRUEBA:
   │  Estado: aprobado
   │  └─→ Puede editar
   │
   └─ Si RECHAZA:
      Estado: borrador (vuelta atrás)
      └─→ Razón registrada en notas
      └─→ Vuelve al paso 1

4. ADMIN/ANALISTA crea Plan de Tratamiento
   Estado: aprobado → en_tratamiento (AUTOMÁTICO)
   └─→ Plan creado en estado: no_iniciada

5. ADMIN aprueba el Plan
   Plan: no_iniciada → en_curso
   └─→ Riesgo sigue en: en_tratamiento

6. RESPONSABLE actualiza avance del Plan
   └─→ Incrementa porcentaje_avance (0-100)
   └─→ Puede cambiar estado del plan a: en_curso, completada, atrasada

7. ADMIN cierra el Riesgo (después de completado el plan)
   Estado: en_tratamiento → cerrado
   └─→ NO puede volver a editar
```

---

## ⚠️ Problemas y Brechas Identificadas

### BRECHA #1: Estado "mitigado" sin implementación
- **Ubicación**: Modelo define estado `mitigado`
- **Problema**: No existe acción/endpoint que cambie un riesgo a `mitigado`
- **¿Cuándo ocurre?**: Nunca en el flujo actual
- **Impacto**: El estado es inaccesible. ¿Debería ser automático al completar un plan?
- **Recomendación**: Implementar transición automática o crear endpoint

### BRECHA #2: Estado "aceptado" sin implementación
- **Ubicación**: Modelo define estado `aceptado`
- **Problema**: No existe endpoint para registrar un riesgo como "aceptado"
- **Importancia**: Es un tratamiento válido en ISO 31000 (Risk Acceptance)
- **Recomendación**: Crear endpoint `POST /api/riesgos/{id}/aceptar/` con justificación

### BRECHA #3: Cerrar sin restricción de estado
- **Ubicación**: Acción `cerrar` en `RiesgoViewSet`
- **Problema**: No valida estado actual, puede cerrar un riesgo en cualquier estado
- **Ejemplo**: Se puede cerrar un riesgo en `borrador` (nunca fue aprobado)
- **Consecuencia**: Registros incompletos en auditoría
- **Recomendación**: Validar que esté en `aprobado` o `en_tratamiento` antes de cerrar

### BRECHA #4: Edición en estado "en_revision"
- **Ubicación**: Endpoint `PATCH /api/riesgos/{id}/`
- **Problema**: NO está bloqueada edición cuando riesgo está en `en_revision`
- **Teoría**: Cuando está en revisión, no debería poder editarse
- **Validación actual**:
  ```python
  # Bloquea: cerrado, mitigado, aceptado
  # ✗ NO bloquea: en_revision
  ```
- **Recomendación**: Añadir `en_revision` a lista de estados no editables

### BRECHA #5: Transición automática del plan sin actualizar riesgo
- **Ubicación**: `PlanTratamientoViewSet.aprobar()`
- **Problema**: Solo cambia plan a `en_curso`, no hay cambio de estado en riesgo
- **Lógica esperada**: 
  - Status riesgos: `en_tratamiento` + plan `en_curso` = tratamiento ejecutándose
  - No hay validación de coherencia entre estados
- **Recomendación**: Validar que riesgo esté en `en_tratamiento` antes de aprobar plan

---

## 📊 Matriz de Permisos por Rol

| Acción | Superadmin | Administrador | Analista Riesgos | Auditor | Usuario Normal |
|--------|:----------:|:-------------:|:----------------:|:-------:|:--------------:|
| Crear Riesgo | ✓ | ✓ | ✓ | ✗ | ✗ |
| Enviar Revisión | ✓ | ✓ | ✓ | ✓ | ✓ |
| Aprobar Riesgo | ✓ | ✓ | ✗ | ✗ | ✗ |
| Rechazar Riesgo | ✓ | ✓ | ✗ | ✗ | ✗ |
| Cerrar Riesgo | ✓ | ✓ | ✗ | ✗ | ✗ |
| Crear Plan | ✓ | ✓ | ✓ | ✗ | ✗ |
| Aprobar Plan | ✓ | ✓ | ✗ | ✗ | ✗ |
| Actualizar Avance | ✓ | ✓ | Si responsable | ✗ | Si responsable |

---

## 🎯 Recomendaciones para Correcciones

### CRÍTICA: Implementar cierre correcto
1. **Implementar transición a "mitigado"**:
   - Cuando plan pase a `completada` Y tenga eficacia >80%
   - O crear endpoint `POST /api/riesgos/{id}/mitigar/`

2. **Implementar transición a "aceptado"**:
   - Crear endpoint `POST /api/riesgos/{id}/aceptar/`
   - Requiere justificación y aprobación de admin

3. **Validar estado en cerrar**:
   - Requiere que riesgo esté en `aprobado` O `en_tratamiento`
   - Bloquear cierre de riesgos en `borrador` o `en_revision`

4. **Bloquear edición en en_revision**:
   - Añadir `en_revision` a lista de estados no editables
   - Coherencia: si está en revisión, no debería cambiar

5. **Validar coherencia plan-riesgo**:
   - Al aprobar plan: validar que riesgo esté en `en_tratamiento`
   - Al actualizar plan: mantener sincronización
