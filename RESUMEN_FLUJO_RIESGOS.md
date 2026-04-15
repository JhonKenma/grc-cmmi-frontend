# 📊 RESUMEN EJECUTIVO: Flujo de Estados de Riesgos

**Versión**: 1.0  
**Fecha**: 14 de Abril de 2026  
**Backend**: Django (apps/riesgos)  

---

## 🎯 Tabla Resumen Rápida

### Todas las Acciones y Transiciones

| Acción | State Requerido | → State Nuevo | Rol | Key Validations |
|--------|:---------------:|:-------------:|:---:|-----------------|
| **1. CREAR** | — | `borrador` | Admin/Analista | Código único, categoría válida |
| **2. ENVIAR_REVISION** | `borrador` | `en_revision` | Cualquiera | Solo si `borrador` |
| **3. APROBAR** | `en_revision` | `aprobado` | Admin | Según `AprobarRiesgoSerializer` |
| **4. RECHAZAR** | `en_revision` | `borrador` | Admin | ⚠️ Motivo obligatorio |
| **5. CREAR_PLAN** | `aprobado` | `en_tratamiento` | Admin/Analista | 🔄 Automático, fecha válida |
| **6. APROBAR_PLAN** | `en_tratamiento` | Plan `en_curso` | Admin | Plan no previamente aprobado |
| **7. ACTUALIZAR_AVANCE** | `en_tratamiento` | — | Responsable/Admin | ⬆️ No baja avance |
| **8. CERRAR** | Cualquiera | `cerrado` | Admin | 🚨 Sin validación de estado |

**Leyenda**: 
- ⚠️ = Recerda que es obligatorio
- 🔄 = Transición automática del modelo
- 🚨 = Problema encontrado (no valida)
- ⬆️ = Solo incrementa, nunca disminuye

---

## 🔴 Los 7 Estados del Riesgo

```
┌─────────────────────────────────────────────────────────────────┐
│ ESTADO: borrador      │ EDITABLE: ✓ YES    │ CREADO EN: Step 1 │
├─────────────────────────────────────────────────────────────────┤
│ ESTADO: en_revision   │ EDITABLE: ✓ YES¹   │ CREADO EN: Step 2 │
├─────────────────────────────────────────────────────────────────┤
│ ESTADO: aprobado      │ EDITABLE: ✓ YES    │ CREADO EN: Step 3 │
├─────────────────────────────────────────────────────────────────┤
│ ESTADO: en_tratamiento│ EDITABLE: ✓ YES    │ CREADO EN: Step 5 │
├─────────────────────────────────────────────────────────────────┤
│ ESTADO: mitigado      │ EDITABLE: ✗ NO     │ ❌ NUNCA OCURRE    │
├─────────────────────────────────────────────────────────────────┤
│ ESTADO: aceptado      │ EDITABLE: ✗ NO     │ ⚠️ NO IMPLEMENTADO │
├─────────────────────────────────────────────────────────────────┤
│ ESTADO: cerrado       │ EDITABLE: ✗ NO     │ CREADO EN: Step 8 │
└─────────────────────────────────────────────────────────────────┘

¹ Problema: en_revision debería ser NO editable
```

---

## ✅ Flujo Correcto (Happy Path)

```
        Step 1                    Step 2                    Step 3
      ANALISTA                  ANALISTA                    ADMIN
      CREATE                   SUBMIT                     DECIDE
        │                         │                         │
        ▼                         ▼                         ▼
    borrador  ─────────→  en_revision  ────┬──────→  aprobado
       ✓ Edit             ⚠️ Should ↓      │            ✓ Edit
                         NOT EDIT          │
                                           │
                                    REJECT │
                                           │
                                           └──→  borrador (repeat)

        Step 4                    Step 5                    Step 6
      ADMIN/ANALYST              ADMIN                      ADMIN
      CREATE PLAN              APPROVE PLAN               UPDATE PROGRESS
        │                         │                         │
        ▼                         ▼                         ▼
    en_tratamiento       Plan en_curso           avance% += (0-100%)
    🔄 AUTOMATIC         registra aprobacion         porcentaje sube
    from aprobado                                    nunca baja

        Step 7 (Option A)        Step 7 (Option B)
         COMPLETE PLAN            CLOSE RISK EARLY
           │                           │
           ▼                           ▼
      completada%=100%            cerrado
      (No automatiza)              Terminal


```

---

## 🚨 Critical Issues Found

| Issue | Risk | Severity | Where |
|-------|------|----------|-------|
| **No endpoint para "mitigado"** | Riesgo nunca puede pasar a mitigado | 🔴 HIGH | Model+Views |
| **No endpoint para "aceptado"** | ISO 31000 compliance broken | 🔴 HIGH | Views |
| **Cerrar sin validar estado** | Puede cerrar riesgos sin aprobar | 🔴 HIGH | `RiesgoViewSet.cerrar()` |
| **En_revision editable** | User puede editar en revisión | 🟡 MEDIUM | `RiesgoViewSet.update()` |
| **Plan aprobación no valida riesgo** | Incoherencia de estados | 🟡 MEDIUM | `PlanViewSet.aprobar()` |

---

## 📝 Validaciones por Serializer

### CREATE RISK
```
✓ código (unique per empresa)
✓ categoría (global o de la empresa)
✓ nombre (obligatorio)
✓ Defaults: causa_raiz, consecuencia, fecha_identificacion
```

### APROBAR
```
✓ estado MUST BE "en_revision"
✓ registra: aprobado_por + timestamp
✓ notas_aprobacion (optional)
```

### RECHAZAR
```
✓ estado MUST BE "en_revision"
✓ motivo (OBLIGATORIO - no puede estar vacío) ⚠️
✓ Registra con prefijo "[Rechazado por {user}]"
```

### CREAR PLAN
```
✓ riesgo estado IN ['aprobado', 'en_tratamiento']
✓ fecha_fin > fecha_inicio
✓ responsable en la misma empresa
⚠️ TRANSICIÓN AUTOMÁTICA: aprobado → en_tratamiento
```

### ACTUALIZAR AVANCE PLAN
```
✓ porcentaje_avance (0-100) - SOLO SUBE, NUNCA BAJA
✓ estado (no_iniciada, en_curso, completada, atrasada, cancelada)
✗ NO permite editar si plan.estado = "completada"
```

---

## 🎯 Estados NO Editables

```python
# En endpoint PATCH /api/riesgos/{id}/

if riesgo.estado in ['cerrado', 'mitigado', 'aceptado']:
    return error(f'No se puede editar: {estado}')
    
# ⚠️ FALTA: 'en_revision' debería estar aquí
```

---

## 🔐 Permisos por Rol

```
Admin/Superadmin:  Puede TODO
Analista Riesgos:  Crear, Enviar, Crear Plan, Actualizar Avance
Auditor:           Ver solamente
Usuario Normal:    Solo riesgos donde es dueño + Actualizar Avance si responsable
```

---

## 🧪 Casos de Uso Clave

### ✅ Caso 1: Flujo Normal
1. Analista crea riesgo (`borrador`)
2. Analista envía a revisión (`en_revision`)
3. Admin aprueba (`aprobado`)
4. Admin/Analista crea plan → (`en_tratamiento` auto)
5. Admin aprueba plan (plan `en_curso`)
6. Responsable actualiza avance
7. Admin cierra riesgo (`cerrado`)

### ❌ Caso 2: Flujo Roto (Issue)
1. Analista crea riesgo (`borrador`)
2. Analista envía a revisión (`en_revision`)
3. **❌ Analista todavía puede EDITAR** (should be blocked) ⚠️
4. Admin aprueba (`aprobado`)
5. Plan creado → (`en_tratamiento`)
6. **❌ Riesgo nunca llega a "mitigado"** (no hay código)
7. Admin cierra ('cerrado')

### 🚲 Caso 3: Cerrar Temprano (Bug)
1. Riesgo creado (`borrador`)
2. **❌ Admin puede CERRAR sin aprobar** (no valida estado)
3. Riesgo en `cerrado` sin nunca pasar por `aprobado`

---

## 📊 Estado del Desarrollo

| Feature | Implemented | Issues |
|---------|:------------:|--------|
| Create Risk | ✅ | — |
| Send to Review | ✅ | Debería bloquear edición en en_revision |
| Approve | ✅ | — |
| Reject | ✅ | Motivo obligatorio (✓ correcto) |
| Create Plan (transition) | ✅ | Automático funciona bien |
| Approve Plan | ✅ | No valida riesgo.estado |
| Update Progress | ✅ | No permite bajar avance (✓ correcto) |
| Close Risk | ✅ | No valida estado actual |
| **Transit to Mitigated** | ❌ | Completamente falta |
| **Transit to Accepted** | ❌ | Completamente falta |

---

## 🎓 Estándares Soportados

- ✅ **COSO ERM**: Apetito y tolerancia de riesgo
- ✅ **ISO 31000**: Contexto, frecuencia de revisión, escenarios
- ⚠️ **NIST**: Velocidad de materialización presente pero no integrado en decisiones

---

## 📞 Quick Reference

### Para FRONTEND:
- No poder enviar riesgo en edición si está en `en_revision`
- No mostrar opción de aprobar plan si riesgo NO está `en_tratamiento`
- Alertar si riesgo llega a 100% avance pero nunca pasa a `mitigado`
- No permitir cerrar sin al menos estar en `aprobado`

### Para BACKEND (Fixes Needed):
1. Crear endpoint `POST /api/riesgos/{id}/mitigar/`
2. Crear endpoint `POST /api/riesgos/{id}/aceptar/` 
3. Bloquear PATCH en estado `en_revision`
4. Validar `riesgo.estado in ['aprobado', 'en_tratamiento']` antes de cerrar
5. Validar `plan.riesgo.estado == 'en_tratamiento'` en aprobar plan

