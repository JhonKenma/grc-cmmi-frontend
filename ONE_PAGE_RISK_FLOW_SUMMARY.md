# ⚡ ONE-PAGE SUMMARY: Risk State Flow Analysis

**Date**: April 14, 2026 | **Status**: Complete Analysis | **Severity**: 3 Critical Issues Found

---

## 📊 THE 8 ACTIONS & STATE TRANSITIONS

| Action | Current → New | Required Role | Prerequisites | ⚠️ Issues |
|--------|:-------------:|:-------------:|:-------------:|----------|
| **1. Create Risk** | — → `borrador` | Admin/Analyst | Valid category | — |
| **2. Send for Review** | `borrador` → `en_revision` | Anyone | Estado==borrador | Can edit in review |
| **3. Approve Risk** | `en_revision` → `aprobado` | Admin | State==en_revision | — |
| **4. Reject Risk** | `en_revision` → `borrador` | Admin | Motivo required | — |
| **5. Create Plan** | `aprobado` → `en_tratamiento` | Admin/Analyst | Auto transition ⚡ | — |
| **6. Approve Plan** | `no_iniciada` → `en_curso` | Admin | — | No risk validation |
| **7. Update Progress** | — → % increment | Responsible/Admin | Avance only ↗️ | — |
| **8. Close Risk** | ANY → `cerrado` | Admin | No validation | Can close unfiled |

---

## 🔴 The 7 States

| State | CREATED | EDITABLE | Notes |
|-------|:-------:|:--------:|-------|
| `borrador` | Step 1 | ✅ | Initial |
| `en_revision` | Step 2 | ✅¹ | Should block edit |
| `aprobado` | Step 3 | ✅ | Ready for plan |
| `en_tratamiento` | Step 5 | ✅ | Plan active |
| `mitigado` | ❌ Never | ✗ | **Missing implementation** |
| `aceptado` | ❌ Never | ✗ | **Missing implementation** |
| `cerrado` | Step 8 | ✗ | Terminal, no edit |

¹ **Problem**: Should not be editable

---

## 🚨 CRITICAL ISSUES (3 Found)

### Issue #1: Unreachable "mitigado" State
- **Model has it**, but **zero code** transitions to it
- **When should occur**: Plan completes (100% progress)
- **Current behavior**: Never happens
- **Impact**: Risks stuck in "en_tratamiento" forever
- **Fix**: Either create endpoint `/mitigar/` or auto-transition on plan completion

### Issue #2: Unimplemented "aceptado" State  
- **Model has it**, but **no endpoint** for ISO 31000 risk acceptance
- **When should occur**: Admin registers conscious risk acceptance
- **Current behavior**: Impossible to reach
- **Impact**: ISO 31000 compliance gap
- **Fix**: Create endpoint `POST /api/riesgos/{id}/aceptar/` with justification

### Issue #3: Close Risk Without Validation
- **Can close in ANY state** including `borrador` or `en_revision`
- **Risks closed without ever being approved**
- **Audit trail broken**
- **Fix**: Validate `estado in ['aprobado', 'en_tratamiento']` before close

---

## ✅ Happy Path (What Works)

```
Create → borrador
  ↓
Send → en_revision
  ↓
Approve → aprobado
  ↓
Create Plan → en_tratamiento (AUTO 🔄)
  ↓
Approve Plan → plan en_curso
  ↓
Update Progress → % goes 0→100
  ↓
Close → cerrado (DONE)
```

---

## ⚠️ Key Validations Found

| Validation | Status | Critical |
|-----------|:------:|:--------:|
| Code unique per company | ✅ | — |
| Reject requires motive | ✅ | Yes |
| Plan avance never decreases | ✅ | Yes |
| Cannot edit closed/mitigated/accepted | ✅ | Yes |
| Auto-transition on plan create | ✅ | — |
| **Cannot edit in en_revision** | ❌ | Yes |
| **Cannot close unfiled risk** | ❌ | Yes |
| **Plan approval validates risk state** | ❌ | Yes |

---

## 🔐 Role Permissions

| Action | Superadmin | Admin | Analyst | Auditor | User |
|--------|:----------:|:-----:|:-------:|:-------:|:----:|
| Create | ✓ | ✓ | ✓ | ✗ | ✗ |
| Send Review | ✓ | ✓ | ✓ | ✓ | ✓ |
| Approve | ✓ | ✓ | ✗ | ✗ | ✗ |
| Reject | ✓ | ✓ | ✗ | ✗ | ✗ |
| Close | ✓ | ✓ | ✗ | ✗ | ✗ |
| Create Plan | ✓ | ✓ | ✓ | ✗ | ✗ |
| Progress | ✓ | ✓ | If resp | ✗ | If resp |

---

## 🧪 Test Cases

### ✅ Works (Positive Cases)
1. Analyst creates → sends → Admin approves → creates plan → updates progress ✓
2. Plan reaches 100% progress ✓
3. Can edit in borrador and aprobado ✓
4. Cannot edit in cerrado ✓
5. Reject with motive recorded ✓

### ❌ Broken (Bugs)
1. Edit in en_revision allowed (should block) ✗
2. Close borrador risk works (shouldn't) ✗
3. Plan reaches 100% but risk stays en_tratamiento ✗
4. No way to reach mitigado ✗
5. No way to reach aceptado ✗

---

## 📋 Quick Checklist: Frontend Must Know

- [ ] Block editing when risk in `en_revision`
- [ ] Show "cannot close" if not in approved/en_tratamiento states
- [ ] Alert if plan 100% but risk still "en_tratamiento"
- [ ] Don't show "aceptar" option (not implemented)
- [ ] Show warning for risks stuck in "en_tratamiento"
- [ ] Require motive when rejecting

---

## 🔧 Backend Fixes Required (Priority)

| Priority | Fix | Effort | Lines |
|----------|-----|:------:|:-----:|
| 🔴 P1 | Create `/mitigar/` endpoint | 30min | ~50 |
| 🔴 P1 | Create `/aceptar/` endpoint | 30min | ~60 |
| 🔴 P1 | Add state validation in close | 10min | ~5 |
| 🟡 P2 | Block edit in en_revision | 10min | ~3 |
| 🟡 P2 | Validate risk state in plan approve | 10min | ~3 |

---

## 📁 Files Generated

- **Backend**:
  - `ANALISIS_FLUJO_RIESGOS.md` (Complete analysis)
  - `VALIDACIONES_ESTADOS_RIESGOS.md` (Code-level validations)
  - `DIAGRAMA_FLUJO_DETALLADO.md` (Step-by-step visual)

- **Frontend**:
  - `ANALISIS_FLUJO_RIESGOS.md` (Summary for reference)
  - `RESUMEN_FLUJO_RIESGOS.md` (Executive summary)

---

## 🎯 Standards Coverage

- ✅ **COSO ERM**: Risk appetite & tolerance included
- ✅ **ISO 31000**: Context, criteria, scenarios, review frequency
- ⚠️ **NIST**: Materializaton speed present but unused

**Compliance**: 2/3 frameworks properly integrated

