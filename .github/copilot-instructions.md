# ShieldGrid365 Frontend - Instrucciones para GitHub Copilot

Frontend del sistema GRC construido con **React 19 + TypeScript + Vite**.

---

## Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19.1 | UI Framework |
| TypeScript | 5.9 | Tipado estático |
| Vite | 7.1 | Build tool |
| TailwindCSS | 3.4 | Estilos |
| TanStack Query | 5.90 | Server state |
| React Router | 7.9 | Navegación |
| React Hook Form | 7.65 | Formularios |
| Zod | 4.1 | Validación |
| Axios | 1.13 | HTTP client |

---

## Reglas de Código - OBLIGATORIAS

### 1. Componentes

**SIEMPRE usar componentes funcionales con TypeScript:**

```tsx
// ✅ CORRECTO
interface UserCardProps {
  user: User;
  onEdit: (id: number) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h3 className="text-lg font-semibold">{user.nombre}</h3>
      <button onClick={() => onEdit(user.id)}>Editar</button>
    </div>
  );
}

// ❌ INCORRECTO - No usar class components
class UserCard extends React.Component { ... }

// ❌ INCORRECTO - No usar React.FC (inferencia implícita es mejor)
const UserCard: React.FC<Props> = ({ user }) => { ... }
```

### 2. Tipado Estricto

**NUNCA usar `any`. Siempre tipar:**

```tsx
// ✅ CORRECTO
interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

const fetchUsers = async (): Promise<ApiResponse<User[]>> => {
  const response = await api.get<ApiResponse<User[]>>('/usuarios/');
  return response.data;
};

// ❌ INCORRECTO
const fetchUsers = async (): Promise<any> => { ... }
const data: any = response.data;
```

**Tipar siempre las props de componentes:**

```tsx
// ✅ CORRECTO
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  onClick: () => void;
}

// ❌ INCORRECTO
function Button(props) { ... }
function Button({ label, ...rest }: any) { ... }
```

### 3. Estilos - Solo Tailwind CSS

**SIEMPRE usar Tailwind. NUNCA CSS puro ni styled-components:**

```tsx
// ✅ CORRECTO - Tailwind CSS
<div className="flex items-center justify-between rounded-lg bg-gray-100 p-4">
  <span className="text-sm font-medium text-gray-700">Nombre</span>
</div>

// ✅ CORRECTO - Clases condicionales con template literals
<button
  className={`rounded px-4 py-2 font-medium ${
    isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
  }`}
>
  Acción
</button>

// ❌ INCORRECTO - CSS puro
<div style={{ display: 'flex', padding: '16px' }}>

// ❌ INCORRECTO - Archivos CSS separados
import './UserCard.css';
```

### 4. Imports - Usar Alias @/

**SIEMPRE usar el alias `@/` para imports:**

```tsx
// ✅ CORRECTO
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/api/endpoints/usuarios.api';
import type { User } from '@/types';

// ❌ INCORRECTO - Rutas relativas largas
import { Button } from '../../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
```

### 5. Estado del Servidor - TanStack Query

**SIEMPRE usar TanStack Query para datos del servidor:**

```tsx
// ✅ CORRECTO
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function UserList() {
  const queryClient = useQueryClient();

  // Query para obtener datos
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getAll(),
  });

  // Mutation para modificar datos
  const deleteMutation = useMutation({
    mutationFn: (id: number) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario eliminado');
    },
    onError: (error) => {
      toast.error('Error al eliminar usuario');
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (/* ... */);
}

// ❌ INCORRECTO - useState para datos del servidor
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  fetchUsers().then(setUsers).finally(() => setLoading(false));
}, []);
```

### 6. Formularios - React Hook Form + Zod

**SIEMPRE validar con Zod:**

```tsx
// ✅ CORRECTO
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Definir schema de validación
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await authService.login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span className="text-red-500">{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span className="text-red-500">{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Cargando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}
```

### 7. Estructura de Archivos API

```tsx
// src/api/endpoints/usuarios.api.ts

import { axiosInstance } from '../axios';
import type { User, CreateUserDTO, UpdateUserDTO } from '@/types';

export const userApi = {
  getAll: () =>
    axiosInstance.get<User[]>('/usuarios/'),

  getById: (id: number) =>
    axiosInstance.get<User>(`/usuarios/${id}/`),

  create: (data: CreateUserDTO) =>
    axiosInstance.post<User>('/usuarios/', data),

  update: (id: number, data: UpdateUserDTO) =>
    axiosInstance.patch<User>(`/usuarios/${id}/`, data),

  delete: (id: number) =>
    axiosInstance.delete(`/usuarios/${id}/`),
} as const;
```

### 8. Manejo de Errores

```tsx
// ✅ CORRECTO - Boundary de error y mensajes amigables
import { toast } from 'react-hot-toast';

const mutation = useMutation({
  mutationFn: createUser,
  onError: (error: AxiosError<ApiError>) => {
    const message = error.response?.data?.message || 'Error inesperado';
    toast.error(message);
  },
});

// ✅ CORRECTO - Early returns para estados
if (isLoading) return <Skeleton />;
if (error) return <ErrorBoundary error={error} />;
if (!data || data.length === 0) return <EmptyState />;

return <DataList data={data} />;
```

---

## Estructura de Componentes Recomendada

```tsx
// 1. Imports (agrupados y ordenados)
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/common/Button';
import { userApi } from '@/api/endpoints/usuarios.api';
import type { User } from '@/types';

// 2. Interfaces/Types
interface UserListProps {
  empresaId: number;
  onSelect: (user: User) => void;
}

// 3. Componente
export function UserList({ empresaId, onSelect }: UserListProps) {
  // 3.1 State y hooks
  const [filter, setFilter] = useState('');

  // 3.2 Queries
  const { data: users, isLoading } = useQuery({
    queryKey: ['users', empresaId],
    queryFn: () => userApi.getByEmpresa(empresaId),
  });

  // 3.3 Handlers (con useCallback si se pasan como props)
  const handleFilter = useCallback((value: string) => {
    setFilter(value.toLowerCase());
  }, []);

  // 3.4 Derived state
  const filteredUsers = users?.filter(u =>
    u.nombre.toLowerCase().includes(filter)
  );

  // 3.5 Early returns
  if (isLoading) return <LoadingSpinner />;

  // 3.6 Render
  return (
    <div className="space-y-4">
      {/* JSX */}
    </div>
  );
}
```

---

## Patrones Prohibidos

```tsx
// ❌ NUNCA usar console.log en producción
console.log(data);

// ❌ NUNCA ignorar errores
try { await fetch() } catch { }

// ❌ NUNCA mutar estado directamente
users.push(newUser); // mal
setUsers([...users, newUser]); // bien

// ❌ NUNCA usar index como key en listas dinámicas
{items.map((item, index) => <Item key={index} />)} // mal
{items.map((item) => <Item key={item.id} />)} // bien

// ❌ NUNCA hardcodear URLs
fetch('http://localhost:8000/api/users'); // mal
fetch(`${import.meta.env.VITE_API_URL}/users`); // bien
```
