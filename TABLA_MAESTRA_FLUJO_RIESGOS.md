# Tabla Maestra: Flujo de Estados de Riesgos - RESPUESTA A SOLICITUD

## TABLA PRINCIPAL (SOLICITUD ORIGINAL)

**Especificación**: Para CADA acción, mostrar:
- ¿Cuál es el estado ACTUAL requerido para ejecutar la acción?
- ¿A qué estado NUEVO transiciona después de la acción?
- ¿Hay restricciones o validaciones específicas?

---

## ✅ TABLA COMPLETA

```
╔════╦════════════════════════════════════════════════════════════════════════════════════════╗
║ # ║ ACCIÓN / ENDPOINT                                                                      ║
╠════╬════════════════════════════════════════════════════════════════════════════════════════╣
║ 1  ║ CREATE RISK / POST /api/riesgos/                                                       ║
╠════╬════════════════════════════════════════════════════════════════════════════════════════╣
║    ║ ROL REQUERIDO:     Admin, Analista Riesgos, Superadmin                                 ║
║    ║ ESTADO ACTUAL:     N/A (nuevo riesgo)                                                   ║
║    ║ ESTADO NUEVO:      borrador                                                             ║
║    ║ RESTRICCIONES:     • Código único por empresa                                           ║
║    ║                    • Categoría debe ser global o de la empresa                          ║
║    ║                    • Nombre y descripción requeridos                                     ║
║    ║                    • Probabilidad (1-5) e Impacto (1-5) requeridos                      ║
║    ║                    • Dueño debe pertenecer a la empresa                                  ║
║    ║ REGISTRA:          identificado_por, estado='borrador'                                  ║
╚════╩════════════════════════════════════════════════════════════════════════════════════════╝

╔════╦════════════════════════════════════════════════════════════════════════════════════════╗
║ 2  ║ SEND FOR REVIEW / POST /api/riesgos/{id}/enviar_revision/                              ║
╠════╬════════════════════════════════════════════════════════════════════════════════════════╣
║    ║ ROL REQUERIDO:     Cualquiera (sin restricción aparente)                               ║
║    ║ ESTADO ACTUAL:     borrador ⚠️ (OBLIGATORIO)                                           ║
║    ║ ESTADO NUEVO:      en_revision                                                         ║
║    ║ RESTRICCIONES:     • Solo si estado == 'borrador'                                       ║
║    ║                    • Sin otras validaciones                                              ║
║    ║ REGISTRA:          ninguno (solo estado)                                                ║
║    ║ ⚠️ PROBLEMA:       Riesgo sigue siendo editable en en_revision (debería bloquearse)    ║
╚════╩════════════════════════════════════════════════════════════════════════════════════════╝

╔════╦════════════════════════════════════════════════════════════════════════════════════════╗
║ 3  ║ APPROVE RISK / POST /api/riesgos/{id}/aprobar/                                        ║
╠════╬════════════════════════════════════════════════════════════════════════════════════════╣
║    ║ ROL REQUERIDO:     Admin, Superadmin (OBLIGATORIO)                                     ║
║    ║ ESTADO ACTUAL:     en_revision ⚠️ (OBLIGATORIO)                                        ║
║    ║ ESTADO NUEVO:      aprobado                                                            ║
║    ║ RESTRICCIONES:     • Por AprobarRiesgoSerializer.validate()                            ║
║    ║                    • Si estado != 'en_revision' → ValidationError                       ║
║    ║ REGISTRA:          aprobado_por = usuario actual                                       ║
║    ║                    fecha_aprobacion = timezone.now()                                    ║
║    ║                    notas (si se proporciona notas_aprobacion)                           ║
║    ║ VALIDACIONES:      • Estado DEBE ser exactamente 'en_revision'                          ║
║    ║                    • Notas de aprobación son opcionales                                  ║
╚════╩════════════════════════════════════════════════════════════════════════════════════════╝

╔════╦════════════════════════════════════════════════════════════════════════════════════════╗
║ 4  ║ REJECT RISK / POST /api/riesgos/{id}/rechazar/                                        ║
╠════╬════════════════════════════════════════════════════════════════════════════════════════╣
║    ║ ROL REQUERIDO:     Admin, Superadmin (OBLIGATORIO)                                     ║
║    ║ ESTADO ACTUAL:     en_revision ⚠️ (OBLIGATORIO)                                        ║
║    ║ ESTADO NUEVO:      borrador (vuelve atrás)                                             ║
║    ║ RESTRICCIONES:     • Solo si estado == 'en_revision'                                    ║
║    ║                    • ⚠️⚠️ MOTIVO OBLIGATORIO Y NO VACÍO                                 ║
║    ║                    • If motivo not provided → ValidationError                           ║
║    ║ REGISTRA:          En campo notas con prefijo:                                          ║
║    ║                    "[Rechazado por {usuario}] {motivo}"                                 ║
║    ║ VALIDACIONES:      • Estado DEBE ser 'en_revision'                                      ║
║    ║                    • request.data.get('motivo') NO puede estar vacío                    ║
║    ║                    • Razón SIEMPRE se persiste en historial                             ║
╚════╩════════════════════════════════════════════════════════════════════════════════════════╝

╔════╦════════════════════════════════════════════════════════════════════════════════════════╗
║ 5  ║ CREATE TREATMENT PLAN / POST /api/riesgos/planes/                                      ║
╠════╬════════════════════════════════════════════════════════════════════════════════════════╣
║    ║ ROL REQUERIDO:     Admin, Analista Riesgos, Superadmin                                 ║
║    ║ ESTADO ACTUAL:     'aprobado' O 'en_tratamiento'                                       ║
║    ║ ESTADO NUEVO:      'en_tratamiento' (automático si era 'aprobado')                      ║
║    ║ RESTRICCIONES:     Por PlanTratamientoCreateSerializer.validate_riesgo():              ║
║    ║                    • Riesgo.estado IN ['aprobado', 'en_tratamiento']                    ║
║    ║                    • Si NO está en estos: ValidationError                                ║
║    ║                    • Responsable debe pertenecer a la empresa                            ║
║    ║                    • fecha_fin > fecha_inicio                                            ║
║    ║ REGISTRA:          Plan creado con estado = 'no_iniciada'                               ║
║    ║ ⚡ AUTOMÁTICO:     Si riesgo.estado == 'aprobado':                                      ║
║    ║                    riesgo.estado = 'en_tratamiento'                                      ║
║    ║                    (Transición automática en serializer.create())                        ║
║    ║ VALIDACIONES:      • Estado riesgo validado en serializer                               ║
║    ║                    • Descripción acción obligatoria                                      ║
║    ║                    • Fechas validadas                                                    ║
║    ║                    • Responsable en la empresa                                           ║
╚════╩════════════════════════════════════════════════════════════════════════════════════════╝

╔════╦════════════════════════════════════════════════════════════════════════════════════════╗
║ 6  ║ APPROVE TREATMENT PLAN / POST /api/riesgos/planes/{id}/aprobar/                        ║
╠════╬════════════════════════════════════════════════════════════════════════════════════════╣
║    ║ ROL REQUERIDO:     Admin, Superadmin (OBLIGATORIO)                                     ║
║    ║ ESTADO ACTUAL:     Plan: 'no_iniciada'                                                 ║
║    ║ ESTADO NUEVO:      Plan: 'en_curso'                                                    ║
║    ║                    Riesgo: SIGUE EN 'en_tratamiento' (NO cambia)                        ║
║    ║ RESTRICCIONES:     • plan.aprobado_por DEBE estar NULL                                 ║
║    ║                    • Si plan ya fue aprobado → ValidationError                          ║
║    ║                    • ⚠️ NO VALIDA que riesgo.estado == 'en_tratamiento'                ║
║    ║ REGISTRA:          aprobado_por = usuario actual                                       ║
║    ║                    fecha_aprobacion = timezone.now()                                    ║
║    ║ VALIDACIONES:      • Solo un administrador puede aprobar                                ║
║    ║                    • Plan no puede estar previamente aprobado                            ║
║    ║                    • ⚠️ PROBLEMA: No valida coherencia riesgo.estado                    ║
╚════╩════════════════════════════════════════════════════════════════════════════════════════╝

╔════╦════════════════════════════════════════════════════════════════════════════════════════╗
║ 7  ║ UPDATE PLAN PROGRESS / PATCH /api/riesgos/planes/{id}/actualizar_avance/              ║
╠════╬════════════════════════════════════════════════════════════════════════════════════════╣
║    ║ ROL REQUERIDO:     Responsable del plan, Admin, Superadmin                             ║
║    ║ ESTADO ACTUAL:     Plan: NO debe ser 'completada'                                      ║
║    ║ ESTADO NUEVO:      Sin cambio en riesgo (solo actualiza plan)                          ║
║    ║ CAMBIOS EN PLAN:   • porcentaje_avance: 0-100 (SOLO SUBE, NUNCA BAJA)                 ║
║    ║                    • estado: puede cambiar a (no_iniciada, en_curso, completada,       ║
║    ║                              atrasada, cancelada)                                        ║
║    ║                    • costo_real, notas_avance (opcionales)                              ║
║    ║ RESTRICCIONES:     • Por ActualizarAvancePlanSerializer.validate():                    ║
║    ║                    • Si plan.estado == 'completada' → ValidationError                   ║
║    ║                    • Si nuevo_avance < plan.porcentaje_avance → ValidationError         ║
║    ║                    • porcentaje_avance OBLIGATORIO (0-100)                              ║
║    ║ REGISTRA:          Cambios en plan (NOT en riesgo)                                      ║
║    ║ ⚠️ PROBLEMA:       Si avance llega a 100%, NO cambia riesgo a 'mitigado'                ║
║    ║                    (No hay implementación para ello)                                      ║
╚════╩════════════════════════════════════════════════════════════════════════════════════════╝

╔════╦════════════════════════════════════════════════════════════════════════════════════════╗
║ 8  ║ CLOSE RISK / POST /api/riesgos/{id}/cerrar/                                           ║
╠════╬════════════════════════════════════════════════════════════════════════════════════════╣
║    ║ ROL REQUERIDO:     Admin, Superadmin (OBLIGATORIO)                                     ║
║    ║ ESTADO ACTUAL:     CUALQUIERA (SIN RESTRICCIÓN) ⚠️⚠️ PROBLEMA                         ║
║    ║                    Puede ser: borrador, en_revision, aprobado, en_tratamiento, etc.    ║
║    ║ ESTADO NUEVO:      cerrado (TERMINAL)                                                  ║
║    ║ RESTRICCIONES:     • NINGUNA VALIDACIÓN DE ESTADO                                       ║
║    ║                    • ⚠️⚠️ CRÍTICO: Puede cerrar riesgo nunca aprobado                   ║
║    ║                    • Motivo es OPCIONAL                                                  ║
║    ║ REGISTRA:          Si motivo proporcionado:                                             ║
║    ║                    notes += f'\\n[Cerrado] {motivo}'                                     ║
║    ║ VALIDACIONES:      • Solo rol admin/superadmin                                          ║
║    ║                    • ⚠️ FALTA: Validar estado actual                                     ║
║    ║ RECOMENDACIÓN:     Debería validar:                                                     ║
║    ║                    if estado not in ['aprobado', 'en_tratamiento']:                     ║
║    ║                        raise ValidationError(...)                                        ║
╚════╩════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 📊 RESUMEN EN TABLA CSV

| # | Acción | Endpoint | Estado Requerido | → Estado Nuevo | Validaciones | Problemas |
|---|--------|----------|:-:|:-:|---|---|
| 1 | CREATE | POST /riesgos/ | — | borrador | Código único, cat., nombre, prob., impacto | — |
| 2 | SEND_REVIEW | POST .../enviar_revision/ | borrador | en_revision | Solo si borrador | Sigue editable |
| 3 | APPROVE | POST .../aprobar/ | en_revision | aprobado | Estado=en_review | — |
| 4 | REJECT | POST .../rechazar/ | en_revision | borrador | ⚠️ Motivo obligatorio | — |
| 5 | CREATE_PLAN | POST /planes/ | aprobado\|en_trata | en_tratamiento | Validez fechas | Auto-transition ✓ |
| 6 | APPROVE_PLAN | POST plans/{}/aprobar/ | no_iniciada | en_curso | Plan no approved | No val. riesgo |
| 7 | UPDATE_PROGRESS | PATCH .../actualizar/ | en_tratamiento | — | % no baja | No transita mitigado |
| 8 | CLOSE | POST .../cerrar/ | ANY ⚠️ | cerrado | Motivo opt. | Sin validación |

---

## 🔴 CRÍTICO: Los 5 Problemas Encontrados

### Problema 1: Estado "mitigado" NO IMPLEMENTADO
```
UBICACIÓN: Modelo define ESTADO_CHOICES, pero no llegable
CUANDO DEBE: Plan completada (100%) → Riesgo mitigado
AHORA OCURRE: NUNCA
IMPACTO: Riesgos quedan "atrapados" en en_tratamiento
SOLUCIÓN: Crear endpoint mitigar/ O hacer automático
```

### Problema 2: Estado "aceptado" NO IMPLEMENTADO
```
UBICACIÓN: Modelo define, pero no hay endpoint
CUANDO DEBE: ISO 31000 - Riesgo aceptado conscientemente
AHORA OCURRE: NUNCA (inalcanzable)
IMPACTO: Brecha ISO 31000
SOLUCIÓN: Crear endpoint aceptar/ con justificación
```

### Problema 3: Cerrar SIN VALIDACIÓN DE ESTADO
```
UBICACIÓN: RiesgoViewSet.cerrar() SIN "if riesgo.estado"
CUANDO OCURRE: SIEMPRE - puede cerrar en cualquier estado
EJEMPLO: Cerrar riesgo en "borrador" (nunca fue aprobado)
IMPACTO: Riesgos sin auditoría completa
SOLUCIÓN: Validar estado in ['aprobado', 'en_tratamiento']
```

### Problema 4: Edición permitida en "en_revision"
```
UBICACIÓN: RiesgoViewSet.update() - lista de bloques incompleta
ESTADO: En revisión PERO sigue editable
ESPERADO: No editable (en revisión del admin)
IMPACTO: Inconsistencia - cambia mientras admin la revisa
SOLUCIÓN: Añadir 'en_revision' a lista de bloques
```

### Problema 5: Plan aprobación NO valida riesgo.estado
```
UBICACIÓN: PlanTratamientoViewSet.aprobar()
FALTA: if plan.riesgo.estado != 'en_tratamiento': error
PUEDE OCURRIR: Plan aprobado pero riesgo en estado inconsistente
IMPACTO: Incoherencia entre plan y riesgo
SOLUCIÓN: Validar sí o sí que riesgo.estado == 'en_tratamiento'
```

---

## ✅ Resumen de lo que SÍ funciona

| Validación | Status |
|-----------|:------:|
| Código único por empresa | ✅ BIEN |
| Motive requerido en rechazar | ✅ BIEN |
| Avance no baja en plan | ✅ BIEN |
| No editar cerrado/mitigado/aceptado | ✅ BIEN |
| Transición automática crear plan | ✅ BIEN |
| Permisos por rol | ✅ BIEN |
| Registro de aprobadores | ✅ BIEN |

