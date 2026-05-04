// src/pages/Empresas/hooks/empresaConstants.ts

export const EMPRESA_FORM_INITIAL: EmpresaFormData = {
  nombre: '', razon_social: '', ruc: '',
  pais: 'PE', pais_otro: '',
  tamanio: '', tamanio_otro: '',
  sector: '', sector_otro: '',
  direccion: '', telefono: '', email: '',
  timezone: 'America/Lima',
};

export interface EmpresaFormData {
  nombre: string;
  razon_social: string;
  ruc: string;
  pais: string;
  pais_otro: string;
  tamanio: string;
  tamanio_otro: string;
  sector: string;
  sector_otro: string;
  direccion: string;
  telefono: string;
  email: string;
  timezone: string;
}

export const PAISES_OPTIONS = [
  { value: 'PE', label: 'Perú' },
  { value: 'CO', label: 'Colombia' },
  { value: 'CL', label: 'Chile' },
  { value: 'AR', label: 'Argentina' },
  { value: 'MX', label: 'México' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'BO', label: 'Bolivia' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'BR', label: 'Brasil' },
  { value: 'PY', label: 'Paraguay' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'ES', label: 'España' },
  { value: 'OT', label: 'Otro' },
];

export const TAMANIO_OPTIONS = [
  { value: 'micro',   label: 'Microempresa' },
  { value: 'pequena', label: 'Pequeña Empresa' },
  { value: 'mediana', label: 'Mediana Empresa' },
  { value: 'grande',  label: 'Gran Empresa' },
  { value: 'otro',    label: 'Otro' },
];

export const SECTOR_OPTIONS = [
  { value: 'tecnologia',        label: 'Tecnología' },
  { value: 'financiero',        label: 'Financiero y Seguros' },
  { value: 'manufactura',       label: 'Manufactura' },
  { value: 'retail',            label: 'Retail y Comercio' },
  { value: 'servicios',         label: 'Servicios Profesionales' },
  { value: 'salud',             label: 'Salud y Farmacéutico' },
  { value: 'educacion',         label: 'Educación' },
  { value: 'construccion',      label: 'Construcción' },
  { value: 'energia',           label: 'Energía y Utilities' },
  { value: 'telecomunicaciones',label: 'Telecomunicaciones' },
  { value: 'agricultura',       label: 'Agricultura y Ganadería' },
  { value: 'mineria',           label: 'Minería' },
  { value: 'transporte',        label: 'Transporte y Logística' },
  { value: 'turismo',           label: 'Turismo y Hospitalidad' },
  { value: 'inmobiliario',      label: 'Inmobiliario' },
  { value: 'medios',            label: 'Medios y Entretenimiento' },
  { value: 'gobierno',          label: 'Gobierno y Sector Público' },
  { value: 'ong',               label: 'ONG y Sin Fines de Lucro' },
  { value: 'otro',              label: 'Otro' },
];