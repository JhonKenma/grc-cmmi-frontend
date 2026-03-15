import React, { useEffect, useState } from 'react';
import { BookOpenCheck, Edit2, Plus, Search, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { documentosApi } from '@/api/endpoints/documentos.api';
import { Button, Card, Input } from '@/components/common';
import { Norma } from '@/types/documentos.types';
import { CatalogPageHeader } from './components/CatalogPageHeader';

const getApiErrorMessage = (error: any, fallback: string): string => {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data.detail === 'string' && data.detail.trim()) return data.detail;
  if (typeof data.message === 'string' && data.message.trim()) return data.message;
  if (typeof data.error === 'string' && data.error.trim()) return data.error;
  if (data.errors && typeof data.errors === 'object') {
    const firstError = Object.values(data.errors).find((value) => Array.isArray(value) && value.length > 0) as any[] | undefined;
    if (firstError?.length) return String(firstError[0]);
  }
  const firstArray = Object.values(data).find((value) => Array.isArray(value) && value.length > 0) as any[] | undefined;
  if (firstArray?.length) return String(firstArray[0]);
  return fallback;
};

export default function NormasList() {
  const navigate = useNavigate();

  const [normas, setNormas] = useState<Norma[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });

  const fetchNormas = async () => {
    setLoading(true);
    try {
      const data = await documentosApi.getNormas();
      setNormas(data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Error al cargar normas'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNormas();
  }, []);

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ nombre: '', descripcion: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (norma: Norma) => {
    setEditingId(norma.id);
    setFormData({
      nombre: norma.nombre || '',
      descripcion: norma.descripcion || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast.error('El nombre de la norma es obligatorio');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
      };

      if (editingId) {
        await documentosApi.updateNorma(editingId, payload);
        toast.success('Norma actualizada correctamente');
      } else {
        await documentosApi.createNorma(payload);
        toast.success('Norma creada correctamente');
      }

      setIsModalOpen(false);
      fetchNormas();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Error al guardar la norma'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta norma?')) return;

    try {
      await documentosApi.deleteNorma(id);
      toast.success('Norma eliminada correctamente');
      fetchNormas();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo eliminar la norma'));
    }
  };

  const filtered = normas.filter((norma) => {
    const term = searchTerm.toLowerCase();
    return (
      norma.nombre?.toLowerCase().includes(term) ||
      norma.descripcion?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <CatalogPageHeader
        title="Catálogo: Normas"
        description="Gestiona las normas de referencia para Documentos Maestros"
        icon={<BookOpenCheck className="text-blue-600" />}
        onBack={() => navigate('/documentos-maestros')}
        backTitle="Volver al Maestro de Documentos"
        action={
          <Button onClick={handleOpenNew} className="flex items-center gap-2">
            <Plus size={18} /> Nueva Norma
          </Button>
        }
      />

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
          <div className="w-full max-w-md">
            <Input
              type="text"
              placeholder="Buscar por nombre o descripción..."
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
                <th className="p-4 font-semibold">Nombre de Norma</th>
                <th className="p-4 font-semibold">Descripción</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-gray-500">
                    Cargando normas...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-gray-500">
                    {normas.length === 0 ? 'No hay normas registradas.' : 'No se encontraron normas con ese filtro.'}
                  </td>
                </tr>
              ) : (
                filtered.map((norma) => (
                  <tr key={norma.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-semibold text-gray-800">{norma.nombre}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600 max-w-2xl truncate" title={norma.descripcion || '-'}>
                      {norma.descripcion || '-'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(norma)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(norma.id)}
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
              <h3 className="font-bold">{editingId ? 'Editar' : 'Nueva'} Norma</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-blue-700 p-1 rounded">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Input
                  label="Nombre de la Norma"
                  type="text"
                  required
                  placeholder="Ej: ISO 27001:2022"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  className="w-full p-2 border rounded focus:border-blue-500 outline-none"
                  placeholder="Descripción breve de la norma..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-2 border-t">
                <Button type="button" onClick={() => setIsModalOpen(false)} variant="secondary">
                  Cancelar
                </Button>
                <Button type="submit" isLoading={saving}>
                  Guardar Norma
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
