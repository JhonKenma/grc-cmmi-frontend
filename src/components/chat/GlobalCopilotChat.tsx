import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, SendHorizontal, Sparkles, X } from 'lucide-react';

import { empresaService } from '@/api/empresa.service';
import { useAuth } from '@/context/AuthContext';
import { copilotChatApi } from '@/api/endpoints/copilot-chat.api';
import { Empresa } from '@/types';

type ChatRole = 'assistant' | 'user';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

function resolvePageLabel(pathname: string): string {
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/empresas')) return 'Empresas';
  if (pathname.startsWith('/usuarios')) return 'Usuarios';
  if (pathname.startsWith('/encuestas')) return 'Encuestas';
  if (pathname.startsWith('/asignaciones')) return 'Asignaciones';
  if (pathname.startsWith('/reportes')) return 'Reportes';
  if (pathname.startsWith('/documentos-maestros')) return 'Documentos Maestros';
  if (pathname.startsWith('/evaluaciones-inteligentes')) return 'Evaluaciones Inteligentes';
  if (pathname.startsWith('/evaluaciones-iq')) return 'Evaluaciones IQ';
  if (pathname.startsWith('/proyectos-remediacion')) return 'Proyectos de Remediacion';
  if (pathname.startsWith('/notificaciones')) return 'Notificaciones';
  if (pathname.startsWith('/perfil')) return 'Perfil';
  if (pathname.startsWith('/login')) return 'Login';
  return 'Modulo General';
}

function getEmpresaIdFromSession(): number | null {
  const rawUser = localStorage.getItem('user');
  if (!rawUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(rawUser) as { empresa?: number | null; empresa_id?: number | null };
    if (typeof parsedUser.empresa === 'number' && parsedUser.empresa > 0) {
      return parsedUser.empresa;
    }
    if (typeof parsedUser.empresa_id === 'number' && parsedUser.empresa_id > 0) {
      return parsedUser.empresa_id;
    }
  } catch {
    return null;
  }

  return null;
}

function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
  };
}

export const GlobalCopilotChat: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [targetEmpresaInput, setTargetEmpresaInput] = useState<string>(() => {
    return localStorage.getItem('chat_target_empresa_id') ?? '';
  });
  const [empresaSearchInput, setEmpresaSearchInput] = useState('');
  const [isEmpresaDropdownOpen, setIsEmpresaDropdownOpen] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoadingEmpresas, setIsLoadingEmpresas] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage(
      'assistant',
      'Hola, soy tu Copilot GRC. Preguntame por riesgos, brechas o recomendaciones segun la vista actual.'
    ),
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const pageContext = useMemo(() => {
    const label = resolvePageLabel(location.pathname);
    return `Seccion: ${label}. Ruta: ${location.pathname}${location.search}${location.hash}`;
  }, [location.pathname, location.search, location.hash]);

  const selectedEmpresa = useMemo(() => {
    const selectedId = Number.parseInt(targetEmpresaInput, 10);
    if (!Number.isInteger(selectedId) || selectedId <= 0) {
      return null;
    }
    return empresas.find((empresa) => empresa.id === selectedId) ?? null;
  }, [empresas, targetEmpresaInput]);

  const filteredEmpresas = useMemo(() => {
    const query = empresaSearchInput.trim().toLowerCase();
    if (!query) {
      return empresas.slice(0, 8);
    }

    return empresas
      .filter((empresa) => {
        const nombre = empresa.nombre.toLowerCase();
        const razonSocial = empresa.razon_social?.toLowerCase?.() ?? '';
        const ruc = empresa.ruc?.toLowerCase?.() ?? '';
        return (
          nombre.includes(query) ||
          razonSocial.includes(query) ||
          ruc.includes(query)
        );
      })
      .slice(0, 8);
  }, [empresaSearchInput, empresas]);

  const sessionEmpresaId = getEmpresaIdFromSession();
  const showEmpresaSelector = user?.rol === 'superadmin' && !sessionEmpresaId;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen || !showEmpresaSelector) {
      return;
    }

    let isDisposed = false;

    const loadEmpresas = async () => {
      setIsLoadingEmpresas(true);
      try {
        const response = await empresaService.getAll();
        if (!isDisposed) {
          setEmpresas(response.filter((empresa) => empresa.activo));
        }
      } catch {
        if (!isDisposed) {
          setEmpresas([]);
        }
      } finally {
        if (!isDisposed) {
          setIsLoadingEmpresas(false);
        }
      }
    };

    void loadEmpresas();

    return () => {
      isDisposed = true;
    };
  }, [isOpen, showEmpresaSelector]);

  useEffect(() => {
    if (!showEmpresaSelector || !selectedEmpresa) {
      return;
    }
    setEmpresaSearchInput(selectedEmpresa.nombre);
  }, [selectedEmpresa, showEmpresaSelector]);

  const handleSendMessage = async () => {
    const cleanMessage = inputValue.trim();
    if (!cleanMessage || isSending) {
      return;
    }

    setMessages((prev) => [...prev, createMessage('user', cleanMessage)]);
    setInputValue('');

    if (!isAuthenticated) {
      setMessages((prev) => [
        ...prev,
        createMessage('assistant', 'Inicia sesion para que pueda consultar el contexto de tu empresa.'),
      ]);
      return;
    }

    setIsSending(true);

    try {
      const empresaIdFromSession = getEmpresaIdFromSession();
      const empresaIdFromInput = Number.parseInt(targetEmpresaInput, 10);
      const targetEmpresaId =
        empresaIdFromSession ??
        (Number.isInteger(empresaIdFromInput) && empresaIdFromInput > 0
          ? empresaIdFromInput
          : null);

      if (targetEmpresaId) {
        const response = await copilotChatApi.ask({
          empresaId: targetEmpresaId,
          message: cleanMessage,
          pageContext,
        });

        const usage = response.context_used;
        const assistantText = [
          response.suggestion,
          '',
          `Contexto recuperado: activos=${usage.activos_previos_count}, hallazgos=${usage.hallazgos_historicos_count}, normativa=${usage.normativa_count}.`,
        ].join('\n');

        setMessages((prev) => [...prev, createMessage('assistant', assistantText)]);
      } else {
        const fallbackResponse = await copilotChatApi.askGeneric({
          message: cleanMessage,
          pageContext,
        });

        const assistantText = [
          fallbackResponse.content,
          '',
          'Nota: respuesta general sin contexto de empresa. Para respuestas RAG, asigna una empresa al usuario o selecciona una empresa objetivo.',
        ].join('\n');

        setMessages((prev) => [...prev, createMessage('assistant', assistantText)]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido al consultar el asistente.';
      setMessages((prev) => [
        ...prev,
        createMessage('assistant', `No pude responder en este momento: ${message}`),
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleTargetEmpresaBlur = () => {
    const value = targetEmpresaInput.trim();
    if (!value) {
      localStorage.removeItem('chat_target_empresa_id');
      return;
    }
    localStorage.setItem('chat_target_empresa_id', value);
  };

  const handleTargetEmpresaChange = (
    empresa: Empresa
  ) => {
    const value = String(empresa.id);
    setTargetEmpresaInput(value);
    setEmpresaSearchInput(empresa.nombre);
    setIsEmpresaDropdownOpen(false);
    localStorage.setItem('chat_target_empresa_id', value);
  };

  const handleEmpresaSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setEmpresaSearchInput(value);
    setIsEmpresaDropdownOpen(true);

    if (selectedEmpresa && value.trim() !== selectedEmpresa.nombre) {
      setTargetEmpresaInput('');
      localStorage.removeItem('chat_target_empresa_id');
    }
  };

  const handleEmpresaSearchBlur = () => {
    window.setTimeout(() => {
      setIsEmpresaDropdownOpen(false);
      handleTargetEmpresaBlur();
    }, 120);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-3 left-3 right-3 z-[1000] sm:bottom-5 sm:left-auto sm:right-5">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-emerald-700"
          aria-label="Abrir chat de asistente"
        >
          <MessageCircle size={18} />
          Chat con Copilot
        </button>
      )}

      {isOpen && (
        <section className="flex h-[min(82vh,620px)] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-2xl sm:w-[380px]">
          <header className="bg-emerald-600 px-4 py-3 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm opacity-90">
                  <Sparkles size={14} />
                  Asistente IA
                </p>
                <h3 className="text-xl font-semibold leading-tight">Chat de cumplimiento</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-1 transition hover:bg-emerald-700"
                aria-label="Cerrar chat"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-2 rounded-full bg-emerald-700/70 px-3 py-1 text-xs">
              Contexto activo: {resolvePageLabel(location.pathname)}
            </p>
            {showEmpresaSelector && (
              <div className="relative mt-2 rounded-lg bg-emerald-700/70 p-2">
                <label htmlFor="chat-target-empresa" className="mb-1 block text-xs opacity-90">
                  Empresa objetivo (por nombre) para respuestas RAG
                </label>
                <input
                  id="chat-target-empresa"
                  value={empresaSearchInput}
                  onChange={handleEmpresaSearchChange}
                  onFocus={() => setIsEmpresaDropdownOpen(true)}
                  onBlur={handleEmpresaSearchBlur}
                  placeholder="Buscar empresa por nombre o RUC"
                  className="h-8 w-full rounded border border-emerald-300 bg-white px-2 text-xs text-slate-700 outline-none"
                />

                {isEmpresaDropdownOpen && filteredEmpresas.length > 0 && (
                  <div className="absolute left-2 right-2 top-[72px] z-20 max-h-36 overflow-y-auto rounded-md border border-emerald-300 bg-white shadow-lg">
                    {filteredEmpresas.map((empresa) => (
                      <button
                        key={empresa.id}
                        type="button"
                        onMouseDown={() => handleTargetEmpresaChange(empresa)}
                        className="block w-full border-b border-slate-100 px-2 py-2 text-left text-xs text-slate-700 hover:bg-emerald-50"
                      >
                        <div className="font-medium">{empresa.nombre}</div>
                        <div className="text-[11px] text-slate-500">
                          ID {empresa.id}
                          {empresa.ruc ? ` · RUC ${empresa.ruc}` : ''}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {isEmpresaDropdownOpen &&
                  !isLoadingEmpresas &&
                  empresaSearchInput.trim() &&
                  filteredEmpresas.length === 0 && (
                    <div className="absolute left-2 right-2 top-[72px] z-20 rounded-md border border-emerald-300 bg-white px-2 py-2 text-xs text-slate-600 shadow-lg">
                      No se encontraron empresas con ese criterio.
                    </div>
                  )}

                <p className="mt-1 text-[11px] opacity-90">
                  {isLoadingEmpresas
                    ? 'Cargando empresas...'
                    : targetEmpresaInput
                      ? `Empresa seleccionada ID: ${targetEmpresaInput}`
                      : 'Selecciona una empresa para activar respuestas con contexto RAG.'}
                </p>
              </div>
            )}
          </header>

          <div className="flex min-h-0 flex-1 flex-col bg-slate-50">
            <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    message.role === 'assistant'
                      ? 'mr-auto bg-white text-slate-700 shadow-sm'
                      : 'ml-auto bg-emerald-500 text-white'
                  }`}
                >
                  {message.content}
                </article>
              ))}

              {isSending && (
                <article className="max-w-[88%] rounded-2xl bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
                  Pensando respuesta...
                </article>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1">
                <input
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Escribe tu mensaje"
                  className="h-9 flex-1 border-none bg-transparent px-2 text-sm text-slate-700 outline-none"
                  disabled={isSending}
                />
                <button
                  type="button"
                  onClick={() => void handleSendMessage()}
                  disabled={isSending || !inputValue.trim()}
                  className="rounded-lg bg-emerald-600 p-2 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  aria-label="Enviar mensaje"
                >
                  <SendHorizontal size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
