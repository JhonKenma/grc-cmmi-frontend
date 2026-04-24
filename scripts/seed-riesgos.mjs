/*
  Seed de datos de prueba para modulo de Gestion de Riesgos.

  Uso:
  - PowerShell:
    $env:SEED_API_URL="http://localhost:8000/api";
    $env:SEED_TOKEN="<access_token_jwt>";
    npm run seed:riesgos

  Variables opcionales:
  - SEED_PREFIX: prefijo para codigo de riesgo (default: RSG)
*/

const API_URL = process.env.SEED_API_URL || process.env.VITE_API_URL || 'http://localhost:8000/api';
const TOKEN = process.env.SEED_TOKEN;
const PREFIX = process.env.SEED_PREFIX || 'RSG';

if (!TOKEN) {
  console.error('Falta SEED_TOKEN. Define tu access token JWT antes de ejecutar.');
  process.exit(1);
}

const now = new Date();
const today = now.toISOString().slice(0, 10);
const in60 = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 60).toISOString().slice(0, 10);

const categoriesSeed = [
  { nombre: 'Tecnologia / TI', descripcion: 'Riesgos de disponibilidad, ciberseguridad y datos' },
  { nombre: 'Cumplimiento', descripcion: 'Riesgos regulatorios, legales y contractuales' },
  { nombre: 'Operacional', descripcion: 'Riesgos de proceso, personas y continuidad operativa' },
];

const riesgosSeed = [
  {
    codigo: `${PREFIX}-001`,
    titulo: 'Acceso no autorizado a ERP',
    proceso: 'Seguridad TI',
    descripcion: 'Usuarios con privilegios excesivos sin revision trimestral',
    probabilidad: 4,
    impacto: 5,
    categoriaNombre: 'Tecnologia / TI',
  },
  {
    codigo: `${PREFIX}-002`,
    titulo: 'Incumplimiento de respaldo de base de datos',
    proceso: 'Gestion de datos',
    descripcion: 'Backups sin prueba de restauracion mensual',
    probabilidad: 3,
    impacto: 5,
    categoriaNombre: 'Operacional',
  },
  {
    codigo: `${PREFIX}-003`,
    titulo: 'Sancion por incumplimiento normativo',
    proceso: 'Compliance',
    descripcion: 'Evidencias incompletas para auditorias regulatorias',
    probabilidad: 3,
    impacto: 4,
    categoriaNombre: 'Cumplimiento',
  },
];

const plansSeed = [
  {
    riesgoCodigo: `${PREFIX}-001`,
    nombre: 'Recertificacion trimestral de accesos privilegiados',
    avance: 25,
    fecha_inicio: today,
    fecha_fin: in60,
    observaciones: 'Primera ola enfocada en usuarios administradores',
  },
  {
    riesgoCodigo: `${PREFIX}-002`,
    nombre: 'Pruebas de restauracion y checklist de respaldo',
    avance: 15,
    fecha_inicio: today,
    fecha_fin: in60,
    observaciones: 'Se prioriza entorno productivo y DRP',
  },
];

const krisSeed = [
  {
    riesgoCodigo: `${PREFIX}-001`,
    nombre: '% cuentas privilegiadas no recertificadas',
    descripcion: 'Porcentaje de cuentas criticas sin aprobacion vigente',
    unidad_medida: '%',
    umbral_verde: 5,
    umbral_amarillo: 10,
    umbral_rojo: 15,
    frecuencia: 'mensual',
    medicion: 12,
  },
  {
    riesgoCodigo: `${PREFIX}-002`,
    nombre: '% respaldos sin prueba de restauracion',
    descripcion: 'Backups ejecutados sin evidencia de recuperacion',
    unidad_medida: '%',
    umbral_verde: 3,
    umbral_amarillo: 8,
    umbral_rojo: 12,
    frecuencia: 'mensual',
    medicion: 9,
  },
];

const monitoreoSeed = [
  {
    riesgoCodigo: `${PREFIX}-001`,
    estado: 'alerta',
    comentario: 'Se detectaron cuentas con privilegios fuera de matriz de accesos',
    alerta: true,
  },
  {
    riesgoCodigo: `${PREFIX}-002`,
    estado: 'seguimiento',
    comentario: 'Se programaron pruebas de restauracion para cierre de mes',
    alerta: false,
  },
];

function unwrap(data) {
  if (data && typeof data === 'object' && 'data' in data && data.data !== undefined) {
    return data.data;
  }
  return data;
}

function toArray(data) {
  const unwrapped = unwrap(data);
  if (Array.isArray(unwrapped)) return unwrapped;
  if (unwrapped && typeof unwrapped === 'object' && Array.isArray(unwrapped.results)) return unwrapped.results;
  if (unwrapped == null) return [];
  return [unwrapped];
}

async function request(method, path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (!res.ok) {
    const detail = typeof json === 'string' ? json : JSON.stringify(json);
    throw new Error(`${method} ${path} -> ${res.status}: ${detail}`);
  }

  return json;
}

async function main() {
  console.log(`Seed riesgos contra: ${API_URL}`);

  const categories = await request('GET', '/riesgos/categorias/');
  const categoryList = toArray(categories);

  const categoryByName = new Map(categoryList.map((c) => [c.nombre, c]));

  for (const category of categoriesSeed) {
    if (!categoryByName.has(category.nombre)) {
      const created = unwrap(await request('POST', '/riesgos/categorias/', category));
      categoryByName.set(created.nombre, created);
      console.log(`Categoria creada: ${created.nombre}`);
    }
  }

  const riesgos = await request('GET', '/riesgos/riesgos/');
  const riesgoList = toArray(riesgos);
  const riesgoByCodigo = new Map(riesgoList.map((r) => [r.codigo, r]));

  for (const seed of riesgosSeed) {
    if (!riesgoByCodigo.has(seed.codigo)) {
      const category = categoryByName.get(seed.categoriaNombre);
      if (!category) {
        throw new Error(`No se encontro categoria para riesgo: ${seed.categoriaNombre}`);
      }

      const payload = {
        codigo: seed.codigo,
        titulo: seed.titulo,
        proceso: seed.proceso,
        descripcion: seed.descripcion,
        probabilidad: seed.probabilidad,
        impacto: seed.impacto,
        categoria: category.id,
      };

      const created = unwrap(await request('POST', '/riesgos/riesgos/', payload));
      riesgoByCodigo.set(created.codigo, created);
      console.log(`Riesgo creado: ${created.codigo} - ${created.titulo}`);
    }
  }

  const planes = await request('GET', '/riesgos/planes/');
  const planList = toArray(planes);
  const planNameSet = new Set(planList.map((p) => p.nombre));

  for (const plan of plansSeed) {
    if (!planNameSet.has(plan.nombre)) {
      const riesgo = riesgoByCodigo.get(plan.riesgoCodigo);
      if (!riesgo) {
        throw new Error(`No se encontro riesgo para plan: ${plan.riesgoCodigo}`);
      }

      const payload = {
        riesgo: riesgo.id,
        nombre: plan.nombre,
        avance: plan.avance,
        fecha_inicio: plan.fecha_inicio,
        fecha_fin: plan.fecha_fin,
        observaciones: plan.observaciones,
      };

      const created = unwrap(await request('POST', '/riesgos/planes/', payload));
      console.log(`Plan creado: ${created.nombre}`);
    }
  }

  const kris = await request('GET', '/riesgos/kris/');
  const kriList = toArray(kris);
  const kriByName = new Map(kriList.map((k) => [k.nombre, k]));

  for (const kri of krisSeed) {
    let current = kriByName.get(kri.nombre);
    if (!current) {
      const riesgo = riesgoByCodigo.get(kri.riesgoCodigo);
      if (!riesgo) {
        throw new Error(`No se encontro riesgo para KRI: ${kri.riesgoCodigo}`);
      }

      const payload = {
        riesgo: riesgo.id,
        nombre: kri.nombre,
        descripcion: kri.descripcion,
        unidad_medida: kri.unidad_medida,
        umbral_verde: kri.umbral_verde,
        umbral_amarillo: kri.umbral_amarillo,
        umbral_rojo: kri.umbral_rojo,
        frecuencia: kri.frecuencia,
      };

      current = unwrap(await request('POST', '/riesgos/kris/', payload));
      kriByName.set(current.nombre, current);
      console.log(`KRI creado: ${current.nombre}`);
    }

    await request('POST', `/riesgos/kris/${current.id}/registrar_medicion/`, {
      valor: kri.medicion,
      fecha: today,
      comentario: 'Medicion inicial de carga de prueba',
    });

    console.log(`Medicion registrada en KRI: ${current.nombre}`);
  }

  const monitoreo = await request('GET', '/riesgos/monitoreo/');
  const monitoreoList = toArray(monitoreo);
  const monitoreoKeys = new Set(monitoreoList.map((m) => `${m.riesgo}-${m.estado}-${m.comentario}`));

  for (const item of monitoreoSeed) {
    const riesgo = riesgoByCodigo.get(item.riesgoCodigo);
    if (!riesgo) {
      throw new Error(`No se encontro riesgo para monitoreo: ${item.riesgoCodigo}`);
    }

    const key = `${riesgo.id}-${item.estado}-${item.comentario}`;
    if (!monitoreoKeys.has(key)) {
      await request('POST', '/riesgos/monitoreo/', {
        riesgo: riesgo.id,
        fecha: today,
        estado: item.estado,
        comentario: item.comentario,
        alerta: item.alerta,
      });
      console.log(`Monitoreo creado: ${item.estado} - ${item.riesgoCodigo}`);
    }
  }

  console.log('Seed completado correctamente.');
}

main().catch((error) => {
  console.error('Fallo en seed de riesgos:');
  console.error(error.message);
  process.exit(1);
});
