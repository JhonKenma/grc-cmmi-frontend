import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    else if (formData.password.length < 4) newErrors.password = 'Mínimo 4 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await login(formData);
    } catch (error) {
      console.error('Error en login:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #eef2f7 0%, #ffffff 45%, #e8f0fe 100%);
          font-family: 'Outfit', sans-serif;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .login-root::before {
          content: '';
          position: absolute;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%);
          top: -200px; left: -150px;
          pointer-events: none;
        }

        .login-root::after {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%);
          bottom: -150px; right: -100px;
          pointer-events: none;
        }

        .login-wrapper {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          position: relative;
          z-index: 1;
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .security-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.85);
          border: 1px solid rgba(59,130,246,0.18);
          border-radius: 100px;
          padding: 6px 16px;
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .badge-dot {
          width: 7px; height: 7px;
          background: #14b8a6;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(20,184,166,0.6);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(0.75); }
        }

        .login-card {
          width: 100%;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 22px;
          padding: 40px 36px 32px;
          box-shadow:
            0 1px 2px rgba(0,0,0,0.04),
            0 8px 24px rgba(0,0,0,0.07),
            0 32px 56px rgba(0,0,0,0.05);
          position: relative;
          overflow: hidden;
        }

        .login-card::before {
          content: '';
          position: absolute;
          top: 0; left: 8%; right: 8%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #3b82f6, #14b8a6, transparent);
          border-radius: 0 0 4px 4px;
        }

        .logo-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          margin-bottom: 28px;
        }

        .logo-box {
          width: 80px; height: 80px;
          border-radius: 18px;
          background: linear-gradient(145deg, #f8fafc, #f1f5f9);
          border: 1px solid rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 0 0 4px rgba(59,130,246,0.05);
        }

        .logo-box img {
          width: 56px; height: 56px;
          object-fit: contain;
        }

        .title-area { text-align: center; }
        .title-area h1 {
          font-size: 21px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
          letter-spacing: -0.02em;
        }
        .title-area p {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          font-weight: 400;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        .form-group label {
          font-size: 11.5px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .input-wrap { position: relative; }

        .input-icon {
          position: absolute;
          left: 13px; top: 50%;
          transform: translateY(-50%);
          width: 16px; height: 16px;
          color: #94a3b8;
          pointer-events: none;
          transition: color 0.2s;
        }

        .input-wrap:focus-within .input-icon { color: #3b82f6; }

        .field {
          width: 100%;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 11px 13px 11px 40px;
          font-size: 14px;
          font-family: 'Outfit', sans-serif;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .field::placeholder {
          color: #cbd5e1;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
        }

        .field:focus {
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }

        .field.has-error {
          border-color: #f87171;
          background: #fff5f5;
        }
        .field.has-error:focus {
          box-shadow: 0 0 0 3px rgba(248,113,113,0.12);
        }

        .field-pr { padding-right: 42px; }

        .toggle-pw {
          position: absolute;
          right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .toggle-pw:hover { color: #475569; }

        .error-msg {
          font-size: 12px;
          color: #ef4444;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .btn-submit {
          width: 100%;
          margin-top: 6px;
          padding: 13px;
          border: none;
          border-radius: 11px;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          color: #ffffff;
          background: linear-gradient(135deg, #2563eb 0%, #0d9488 100%);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.15) inset,
            0 4px 16px rgba(37,99,235,0.28),
            0 1px 3px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }

        .btn-submit:hover:not(:disabled) {
          opacity: 0.93;
          transform: translateY(-1px);
          box-shadow: 0 1px 0 rgba(255,255,255,0.15) inset, 0 8px 24px rgba(37,99,235,0.32);
        }

        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner {
          width: 17px; height: 17px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0 14px;
        }
        .div-line { flex: 1; height: 1px; background: #f1f5f9; }
        .divider span { font-size: 11px; color: #cbd5e1; letter-spacing: 0.06em; text-transform: uppercase; }

        .card-footer { text-align: center; font-size: 13px; color: #94a3b8; }
        .card-footer a { color: #3b82f6; text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .card-footer a:hover { color: #0d9488; }

        .bottom-info {
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.8;
        }
      `}</style>

      <div className="login-root">
        <div className="login-wrapper">

          <div className="security-badge">
            <span className="badge-dot" />
            Acceso seguro · GRC
          </div>

          <div className="login-card">

            <div className="logo-area">
              <div className="logo-box">
                <img
                  src="/logo_min.png"
                  alt="Logo GRC"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="title-area">
                <h1>Bienvenido</h1>
                <p>Ingresa tus credenciales para continuar</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrap">
                  <Mail className="input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className={`field ${errors.email ? 'has-error' : ''}`}
                  />
                </div>
                {errors.email && <span className="error-msg">· {errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <div className="input-wrap">
                  <Lock className="input-icon" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`field field-pr ${errors.password ? 'has-error' : ''}`}
                  />
                  <button
                    type="button"
                    className="toggle-pw"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span className="error-msg">· {errors.password}</span>}
              </div>

              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? (
                  <><div className="spinner" /> Iniciando sesión...</>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            <div className="divider">
              <div className="div-line" />
              <span>o</span>
              <div className="div-line" />
            </div>

            <div className="card-footer">
              ¿Olvidaste tu contraseña?{' '}
              <a href="#">Recuperar acceso</a>
            </div>
          </div>

          <div className="bottom-info">
            <p>Sistema de Gestión de Riesgos y Cumplimiento</p>
            <p>© 2025 · Todos los derechos reservados</p>
          </div>

        </div>
      </div>
    </>
  );
};