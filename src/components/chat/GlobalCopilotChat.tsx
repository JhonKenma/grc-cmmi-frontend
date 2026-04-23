import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LoaderCircle, MessageCircle, Paperclip, SendHorizontal, Sparkles, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { empresaService } from '@/api/empresa.service';
import { useAuth } from '@/context/AuthContext';
import { copilotChatApi } from '@/api/endpoints/copilot-chat.api';
import { Empresa } from '@/types';

type ChatRole = 'assistant' | 'user';
type ChatResponseMode = 'auto' | 'evaluation_plan' | 'context_summary' | 'risk_recommendations';

const ALLOWED_UPLOAD_EXTENSIONS_HINT = 'pdf, txt, md, csv, json, log, yaml, yml, xml';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

interface ParsedAssistantContent {
  reasoning: string | null;
  answer: string;
}

function parseAssistantContent(content: string): ParsedAssistantContent {
  const rawContent = content.trim();
  if (!rawContent) {
    return { reasoning: null, answer: '' };
  }

  const thinkRegex = /<think>([\s\S]*?)<\/think>/gi;
  const matches = Array.from(rawContent.matchAll(thinkRegex));

  if (!matches.length) {
    return { reasoning: null, answer: rawContent };
  }

  const reasoning = matches
    .map((match) => match[1]?.trim() ?? '')
    .filter(Boolean)
    .join('\n\n');

  const answer = rawContent.replace(thinkRegex, '').trim();

  return {
    reasoning: reasoning || null,
    answer: answer || 'No se genero una respuesta final visible.',
  };
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

function isCompanyContextPayload(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  const markers = [
    'contexto de mi empresa',
    'contexto grc actual',
    'a que se dedican',
    'a qué se dedican',
    'objetivo inmediato',
    'razon social',
    'razón social',
    'ruc',
    'sector',
    'tamaño',
    'tamano',
    'pais',
    'país',
    'usuarios activos',
    'frameworks activos',
  ];

  const markerHits = markers.reduce((count, marker) => {
    return normalized.includes(marker) ? count + 1 : count;
  }, 0);

  const structuredLines = message
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('-') || line.includes(':')).length;

  return markerHits >= 2 || (normalized.length >= 350 && structuredLines >= 5);
}

function inferResponseMode(message: string): ChatResponseMode {
  if (isCompanyContextPayload(message)) {
    return 'context_summary';
  }

  const normalized = message.trim().toLowerCase();

  const contextSummaryPatterns = [
    'que sabes',
    'qué sabes',
    'acerca de mi empresa',
    'sobre mi empresa',
    'resumen de mi empresa',
    'mi empresa',
  ];
  if (contextSummaryPatterns.some((pattern) => normalized.includes(pattern))) {
    return 'context_summary';
  }

  const riskPatterns = [
    'riesgo',
    'brecha',
    'gap',
    'remediacion',
    'remediación',
    'plan de accion',
    'plan de acción',
  ];
  if (riskPatterns.some((pattern) => normalized.includes(pattern))) {
    return 'risk_recommendations';
  }

  return 'auto';
}

export const GlobalCopilotChat: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
      'Hola, soy tu asistente, Shielly. Preguntame por riesgos, brechas o recomendaciones segun la vista actual.'
    ),
  ]);
  const [pendingCompanyContext, setPendingCompanyContext] = useState<{
    empresaId: number;
    framework: string;
    originalQuestion: string;
    responseMode: ChatResponseMode;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const resolveTargetEmpresaId = (): number | null => {
    const empresaIdFromSession = getEmpresaIdFromSession();
    const empresaIdFromInput = Number.parseInt(targetEmpresaInput, 10);
    return (
      empresaIdFromSession ??
      (Number.isInteger(empresaIdFromInput) && empresaIdFromInput > 0
        ? empresaIdFromInput
        : null)
    );
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const pickedFiles = Array.from(files);
    setSelectedFiles((prev) => {
      const merged = [...prev];
      pickedFiles.forEach((file) => {
        const alreadyExists = merged.some(
          (item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified
        );
        if (!alreadyExists) {
          merged.push(file);
        }
      });
      return merged;
    });

    event.target.value = '';
  };

  const handleRemoveFile = (targetFile: File) => {
    setSelectedFiles((prev) =>
      prev.filter(
        (file) =>
          !(file.name === targetFile.name && file.size === targetFile.size && file.lastModified === targetFile.lastModified)
      )
    );
  };

  const handleSendMessage = async () => {
    const cleanMessage = inputValue.trim();
    const hasSelectedFiles = selectedFiles.length > 0;

    if ((!cleanMessage && !hasSelectedFiles) || isSending || isUploadingFiles) {
      return;
    }

    const userMessage = cleanMessage
      ? cleanMessage
      : `Adjunto ${selectedFiles.length} archivo(s) para actualizar el contexto empresarial.`;

    setMessages((prev) => [...prev, createMessage('user', userMessage)]);
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
      const targetEmpresaId = resolveTargetEmpresaId();

      if (hasSelectedFiles) {
        if (!targetEmpresaId) {
          setMessages((prev) => [
            ...prev,
            createMessage('assistant', 'Selecciona una empresa objetivo para cargar documentos en la base RAG.'),
          ]);
          return;
        }

        setIsUploadingFiles(true);

        const uploadResult = await copilotChatApi.uploadCompanyDocuments({
          empresaId: targetEmpresaId,
          files: selectedFiles,
          framework: 'MULTI-FRAMEWORK',
          sourceType: 'activo_informacion',
          contextNote: cleanMessage || undefined,
        });

        const uploadSummary = [
          `Documentos cargados: ${uploadResult.processed_files}.`,
          `Chunks vectorizados: ${uploadResult.upserted}.`,
        ];

        if (uploadResult.skipped_files.length > 0) {
          uploadSummary.push('', 'Archivos omitidos:');
          uploadSummary.push(...uploadResult.skipped_files.map((file) => `- ${file}`));
        }

        setMessages((prev) => [...prev, createMessage('assistant', uploadSummary.join('\n'))]);
        setSelectedFiles([]);

        if (!cleanMessage && !pendingCompanyContext) {
          return;
        }
      }

      if (!pendingCompanyContext && targetEmpresaId && isCompanyContextPayload(cleanMessage)) {
        const framework = 'MULTI-FRAMEWORK';

        await copilotChatApi.saveCompanyContext({
          empresaId: targetEmpresaId,
          message: cleanMessage,
          pageContext,
          framework,
        });

        const summaryResponse = await copilotChatApi.ask({
          empresaId: targetEmpresaId,
          message: 'Con base en el contexto que acabo de compartir, resume que sabes de mi empresa de forma natural y accionable.',
          pageContext,
          framework,
          responseMode: 'context_summary',
        });

        const usage = summaryResponse.context_used;
        const assistantText = [
          'Perfecto, ya guarde el contexto de tu empresa en la base de conocimiento.',
          '',
          summaryResponse.suggestion,
          '',
          `Contexto recuperado: activos=${usage.activos_previos_count}, hallazgos=${usage.hallazgos_historicos_count}, normativa=${usage.normativa_count}.`,
        ].join('\n');

        setPendingCompanyContext(null);
        setMessages((prev) => [...prev, createMessage('assistant', assistantText)]);
        return;
      }

      if (pendingCompanyContext) {
        if (!targetEmpresaId) {
          setMessages((prev) => [
            ...prev,
            createMessage('assistant', 'Necesito una empresa objetivo para guardar este contexto y continuar.'),
          ]);
          return;
        }

        const framework = pendingCompanyContext.framework;
        if (cleanMessage) {
          await copilotChatApi.saveCompanyContext({
            empresaId: targetEmpresaId,
            message: cleanMessage,
            pageContext,
            framework,
          });
        }

        const response = await copilotChatApi.ask({
          empresaId: targetEmpresaId,
          message: pendingCompanyContext.originalQuestion,
          pageContext,
          framework,
          responseMode: pendingCompanyContext.responseMode,
        });

        const usage = response.context_used;
        const assistantText = [
          cleanMessage
            ? 'Gracias, ya guarde el contexto de tu empresa en la base de conocimiento.'
            : 'Gracias, ya procese los documentos y actualice el contexto de tu empresa.',
          '',
          response.suggestion,
          '',
          `Contexto recuperado: activos=${usage.activos_previos_count}, hallazgos=${usage.hallazgos_historicos_count}, normativa=${usage.normativa_count}.`,
        ].join('\n');

        setPendingCompanyContext(null);
        setMessages((prev) => [...prev, createMessage('assistant', assistantText)]);
        return;
      }

      if (targetEmpresaId) {
        const framework = 'MULTI-FRAMEWORK';
        const responseMode = cleanMessage ? inferResponseMode(cleanMessage) : 'context_summary';
        const response = await copilotChatApi.ask({
          empresaId: targetEmpresaId,
          message:
            cleanMessage ||
            'Acabo de cargar documentos en el chat. Resume de forma natural y accionable que contexto nuevo tienes de mi empresa.',
          pageContext,
          framework,
          responseMode,
        });

        const usage = response.context_used;
        const assistantChunks = [
          response.suggestion,
          '',
          `Contexto recuperado: activos=${usage.activos_previos_count}, hallazgos=${usage.hallazgos_historicos_count}, normativa=${usage.normativa_count}.`,
        ];

        if (response.context_gap_detected && response.context_gap_message) {
          assistantChunks.push(
            '',
            response.context_gap_message,
            'Responde con esos datos en tu siguiente mensaje y los guardare para mejorar las respuestas de tu empresa.'
          );
          setPendingCompanyContext({
            empresaId: targetEmpresaId,
            framework,
            originalQuestion: cleanMessage,
            responseMode,
          });
        } else {
          setPendingCompanyContext(null);
        }

        const assistantText = assistantChunks.join('\n');

        setMessages((prev) => [...prev, createMessage('assistant', assistantText)]);
      } else {
        setPendingCompanyContext(null);
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
      setIsUploadingFiles(false);
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
                  className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    message.role === 'assistant'
                      ? 'mr-auto bg-white text-slate-700 shadow-sm'
                      : 'ml-auto bg-emerald-500 text-white'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    (() => {
                      const parsed = parseAssistantContent(message.content);

                      return (
                        <>
                          {parsed.reasoning && (
                            <details className="mb-3 rounded-lg border border-slate-200 bg-slate-50/70 p-2">
                              <summary className="cursor-pointer text-xs font-semibold text-slate-700">
                                Ver razonamiento
                              </summary>
                              <div className="mt-2 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-slate-600">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                                    ul: ({ children }) => (
                                      <ul className="mb-1.5 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>
                                    ),
                                    ol: ({ children }) => (
                                      <ol className="mb-1.5 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>
                                    ),
                                    li: ({ children }) => <li>{children}</li>,
                                    code: ({ children }) => (
                                      <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-800">
                                        {children}
                                      </code>
                                    ),
                                  }}
                                >
                                  {parsed.reasoning}
                                </ReactMarkdown>
                              </div>
                            </details>
                          )}

                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
                              ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
                              li: ({ children }) => <li>{children}</li>,
                              code: ({ children }) => (
                                <code className="rounded bg-slate-100 px-1 py-0.5 text-[12px] text-slate-800">{children}</code>
                              ),
                              h1: ({ children }) => <h4 className="mb-2 text-base font-semibold">{children}</h4>,
                              h2: ({ children }) => <h4 className="mb-2 text-base font-semibold">{children}</h4>,
                              h3: ({ children }) => <h4 className="mb-2 text-sm font-semibold">{children}</h4>,
                              blockquote: ({ children }) => (
                                <blockquote className="mb-2 border-l-2 border-emerald-300 pl-3 italic text-slate-600">
                                  {children}
                                </blockquote>
                              ),
                            }}
                          >
                            {parsed.answer}
                          </ReactMarkdown>
                        </>
                      );
                    })()
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </article>
              ))}

              {isUploadingFiles && (
                <article className="mr-auto flex max-w-[88%] items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
                  <LoaderCircle size={14} className="animate-spin" />
                  Procesando archivos y vectorizando chunks...
                </article>
              )}

              {isSending && (
                <article className="max-w-[88%] rounded-2xl bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
                  Pensando respuesta...
                </article>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-200 bg-white p-3">
              {pendingCompanyContext && (
                <p className="mb-2 rounded-lg bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
                  Pendiente: comparte datos de la empresa (giro, procesos criticos, activos de informacion, riesgos y objetivos de cumplimiento). Guardare ese contexto y continuare la respuesta.
                </p>
              )}
              {selectedFiles.length > 0 && (
                <div className="mb-2 rounded-lg border border-emerald-200 bg-emerald-50/60 p-2">
                  <p className="mb-1 text-[11px] text-emerald-800">
                    Archivos listos para ingesta ({selectedFiles.length})
                  </p>
                  <div className="max-h-20 space-y-1 overflow-y-auto">
                    {selectedFiles.map((file) => (
                      <div
                        key={`${file.name}-${file.lastModified}-${file.size}`}
                        className="flex items-center justify-between rounded bg-white px-2 py-1 text-[11px] text-slate-700"
                      >
                        <span className="truncate pr-2">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file)}
                          className="rounded px-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                          aria-label={`Quitar archivo ${file.name}`}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.txt,.md,.csv,.json,.log,.yaml,.yml,.xml"
                  className="hidden"
                  onChange={handleFileSelection}
                />
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={isSending || isUploadingFiles}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
                  aria-label="Adjuntar archivos"
                >
                  <Paperclip size={16} />
                </button>
                <input
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={
                    pendingCompanyContext
                      ? 'Escribe el contexto de tu empresa o adjunta documentos...'
                      : 'Escribe tu mensaje o adjunta documentos'
                  }
                  className="h-9 flex-1 border-none bg-transparent px-2 text-sm text-slate-700 outline-none"
                  disabled={isSending || isUploadingFiles}
                />
                <button
                  type="button"
                  onClick={() => void handleSendMessage()}
                  disabled={isSending || isUploadingFiles || (!inputValue.trim() && selectedFiles.length === 0)}
                  className="rounded-lg bg-emerald-600 p-2 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  aria-label="Enviar mensaje"
                >
                  <SendHorizontal size={16} />
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Formatos permitidos: {ALLOWED_UPLOAD_EXTENSIONS_HINT}.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};