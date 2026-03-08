import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileType, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '@/components/common';
import { documentosApi } from '@/api/endpoints/documentos.api';
import toast from 'react-hot-toast';
import { CatalogPageHeader } from './components/CatalogPageHeader';

export const TiposDocumentoPage: React.FC = () => {
  const navigate = useNavigate();
  const [tipos, setTipos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Estado del Formulario basado en los requerimientos del documento
  const [form, setForm] = useState({
    id: '',
    nombre: '',
    abreviatura: '', // Será el Código
    categoria: '',
    descripcion: '',
    nivel_jerarquico: 1,
    requiere_revision: false,
    retencion_anios: 1,
    requiere_word_y_pdf: false,
  });

  const cargarTipos = async () => {
    try {
      setLoading(true);
      const data = await documentosApi.getTipos();
      setTipos(data);
    } catch (error) {
      toast.error('Error al cargar los tipos de documento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTipos();
  }, []);

  const handleOpenModal = (tipo?: any) => {
    if (tipo) {
      setModoEdicion(true);
      setForm({
        id: tipo.id,
        nombre: tipo.nombre || '',
        abreviatura: tipo.abreviatura || tipo.codigo || '',
        categoria: tipo.categoria || '',
        descripcion: tipo.descripcion || '',
        nivel_jerarquico: tipo.nivel_jerarquico || 1,
        requiere_revision: tipo.requiere_revision || false,
        retencion_anios: tipo.retencion_anios || 1,
        requiere_word_y_pdf: tipo.requiere_word_y_pdf || false,
      });
    } else {
      setModoEdicion(false);
      setForm({
        id: '',
        nombre: '',
        abreviatura: '',
        categoria: '',
        descripcion: '',
        nivel_jerarquico: 1,
        requiere_revision: false,
        retencion_anios: 1,
        requiere_word_y_pdf: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.abreviatura) {
      return toast.error('El nombre y la abreviatura son obligatorios');
    }

    try {
      setSaving(true);
      if (modoEdicion) {
        await documentosApi.updateTipo(form.id, form);
        toast.success('Tipo actualizado correctamente');
      } else {
        await documentosApi.createTipo(form);
        toast.success('Tipo creado correctamente');
      }
      setIsModalOpen(false);
      cargarTipos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este Tipo de Documento? No podrás si ya está en uso.')) return;
    
    try {
      await documentosApi.deleteTipo(id);
      toast.success('Eliminado correctamente');
      cargarTipos();
    } catch (error: any) {
      toast.error('Error al eliminar. Es posible que esté en uso por un documento.');
    }
  };

  const filtrados = tipos.filter(t => 
    t.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.abreviatura?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <CatalogPageHeader
        title="Catálogo: Tipos de Documento"
        description="Gestiona los tipos (Políticas, Manuales, etc.) y sus reglas."
        icon={<FileType className="text-blue-600" />}
        onBack={() => navigate(-1)}
        backTitle="Volver"
        action={
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus size={18} /> Nuevo Tipo
          </Button>
        }
      />

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Buscar por nombre o abreviatura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">Tipo de Documento</th>
                <th className="p-4 font-semibold">Abrev / Código</th>
                <th className="p-4 font-semibold text-center">Nivel Jerárquico</th>
                <th className="p-4 font-semibold text-center">Retención</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center p-8 text-gray-500">Cargando...</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-8 text-gray-500">No hay registros.</td></tr>
              ) : (
                filtrados.map((tipo) => (
                  <tr key={tipo.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-semibold text-gray-800">{tipo.nombre}</p>
                      <p className="text-xs text-gray-500">{tipo.categoria}</p>
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                        {tipo.abreviatura || tipo.codigo || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold text-sm">
                        {tipo.nivel_jerarquico}
                      </span>
                    </td>
                    <td className="p-4 text-center text-sm text-gray-600">
                      {tipo.retencion_anios} años
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(tipo)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(tipo.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-0 overflow-hidden shadow-2xl">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold">{modoEdicion ? 'Editar' : 'Nuevo'} Tipo de Documento</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-blue-700 p-1 rounded"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <Input
                    label="Nombre"
                    type="text"
                    required
                    value={form.nombre}
                    onChange={e => setForm({...form, nombre: e.target.value})}
                    placeholder="Ej: Política, Manual..."
                  />
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <Input
                    label="Abreviatura / Código"
                    type="text"
                    required
                    maxLength={10}
                    value={form.abreviatura}
                    onChange={e => setForm({...form, abreviatura: e.target.value.toUpperCase()})}
                    className="uppercase"
                    placeholder="Ej: POL"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                  <select
                    value={form.categoria}
                    onChange={e => setForm({...form, categoria: e.target.value})}
                    className="w-full p-2 border rounded focus:border-blue-500 outline-none"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Documentos Estratégicos">Documentos Estratégicos</option>
                    <option value="Sistema de Gestión">Sistema de Gestión</option>
                    <option value="Procesos y Procedimientos">Procesos y Procedimientos</option>
                    <option value="Registro y Evidencia">Registro y Evidencia</option>
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <Input
                    label="Nivel Jerárquico"
                    type="number" min="1" max="5" value={form.nivel_jerarquico}
                    onChange={e => setForm({...form, nivel_jerarquico: Number(e.target.value)})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                  <textarea
                    rows={2} value={form.descripcion}
                    onChange={e => setForm({...form, descripcion: e.target.value})}
                    className="w-full p-2 border rounded focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <Input
                    label="Retención (Años)"
                    type="number" min="1" value={form.retencion_anios}
                    onChange={e => setForm({...form, retencion_anios: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-4 p-4 bg-gray-50 border rounded">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox" checked={form.requiere_revision}
                    onChange={e => setForm({...form, requiere_revision: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-sm font-bold text-gray-700">Requiere Revisión Periódica</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox" checked={form.requiere_word_y_pdf}
                    onChange={e => setForm({...form, requiere_word_y_pdf: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-sm font-bold text-gray-700">Obligar Word y PDF</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-2 border-t">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">Cancelar</Button>
                <Button variant="primary" type="submit" isLoading={saving}>Guardar Tipo</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};