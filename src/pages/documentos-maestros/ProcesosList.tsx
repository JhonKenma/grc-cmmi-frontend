import React, { useEffect, useState } from 'react';
import { Building2, Edit2, Plus, Search, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { documentosApi } from '@/api/endpoints/documentos.api';
import { Button, Card, Input } from '@/components/common';
import { Proceso } from '@/types/documentos.types';
import { CatalogPageHeader } from './components/CatalogPageHeader';

export default function ProcesosList() {
  const navigate = useNavigate();
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    sigla: '',
    descripcion: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchProcesos = async () => {
    setLoading(true);
    try {
      const data = await documentosApi.getProcesos();
      setProcesos(data);
    } catch (error) {
      console.error('Error al cargar procesos', error);
      toast.error('Error al cargar procesos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesos();
  }, []);

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ nombre: '', sigla: '', descripcion: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proceso: Proceso) => {
    setEditingId(proceso.id);
    setFormData({
      nombre: proceso.nombre,
      sigla: proceso.sigla || '',
      descripcion: proceso.descripcion || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      toast.error('El nombre del proceso es obligatorio');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        nombre: formData.nombre.trim(),
        sigla: formData.sigla.trim().toUpperCase(),
        descripcion: formData.descripcion.trim(),
      };

      if (editingId) {
        await documentosApi.updateProceso(editingId, payload);
        toast.success('Proceso actualizado correctamente');
      } else {
        await documentosApi.createProceso(payload);
        toast.success('Proceso creado correctamente');
      }

      setIsModalOpen(false);
      fetchProcesos();
    } catch (error) {
      console.error('Error al guardar el proceso', error);
      toast.error('Error al guardar el proceso');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este proceso?')) {
      try {
        await documentosApi.deleteProceso(id);
        toast.success('Proceso eliminado correctamente');
        fetchProcesos();
      } catch (error) {
        console.error('Error al eliminar', error);
        toast.error('No se pudo eliminar. Puede que este en uso.');
      }
    }
  };

  const filtrados = procesos.filter((proceso) => {
    const term = searchTerm.toLowerCase();
    return (
      proceso.nombre?.toLowerCase().includes(term) ||
      proceso.sigla?.toLowerCase().includes(term) ||
      proceso.descripcion?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <CatalogPageHeader
        title="Catálogo: Procesos"
        description="Gestiona las áreas o procesos de tu empresa"
        icon={<Building2 className="text-blue-600" />}
        onBack={() => navigate('/documentos-maestros')}
        backTitle="Volver al Maestro de Documentos"
        action={
          <Button onClick={handleOpenNew} className="flex items-center gap-2">
            <Plus size={18} /> Nuevo Proceso
          </Button>
        }
      />

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
          <div className="w-full max-w-md">
            <Input
              type="text"
              placeholder="Buscar por nombre, sigla o descripción..."
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
                <th className="p-4 font-semibold">Nombre del Proceso</th>
                <th className="p-4 font-semibold">Sigla</th>
                <th className="p-4 font-semibold">Descripción</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-gray-500">
                    No hay procesos registrados.
                  </td>
                </tr>
              ) : (
                filtrados.map((proceso) => (
                  <tr key={proceso.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-semibold text-gray-800">{proceso.nombre}</p>
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                        {proceso.sigla || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 max-w-lg truncate">
                      {proceso.descripcion || '-'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(proceso)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(proceso.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Eliminar"
                        >
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-xl p-0 overflow-hidden shadow-2xl">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold">{editingId ? 'Editar' : 'Nuevo'} Proceso</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-blue-700 p-1 rounded">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Input
                  label="Nombre del Proceso"
                  type="text"
                  required
                  placeholder="Ej: Recursos Humanos"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              <div>
                <Input
                  label="Sigla / Abreviatura"
                  type="text"
                  placeholder="Ej: RH"
                  value={formData.sigla}
                  maxLength={10}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sigla: e.target.value.toUpperCase(),
                    })
                  }
                  helperText="Se usará para generar el código de los documentos (Ej: POL-RH-001)."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  className="w-full p-2 border rounded focus:border-blue-500 outline-none"
                  placeholder="Breve descripción de las responsabilidades del área..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-2 border-t">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="secondary"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  isLoading={saving}
                >
                  Guardar Proceso
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}