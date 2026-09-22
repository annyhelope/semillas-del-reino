import React, { useState } from 'react';
import { AuthUser } from '../../types';
import { LogoSemillas } from '../LogoSemillas';
import {
  getStoredUsers,
  authenticate,
  createOwnerAccount,
  MAX_ALLOWED_ACCOUNTS,
  DEFAULT_OWNER_USER,
  saveCurrentSession
} from '../../utils/authUtils';
import {
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  AlertCircle,
  KeyRound,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const existingUsers = getStoredUsers();
  const isFirstSetup = existingUsers.length === 0;

  // Form states
  const [username, setUsername] = useState(isFirstSetup ? 'propietario' : '');
  const [fullName, setFullName] = useState(isFirstSetup ? 'Dirección General - Semillas del Reino' : '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDirectAccess = () => {
    const userToUse = existingUsers.length > 0 ? existingUsers[0] : DEFAULT_OWNER_USER;
    saveCurrentSession(userToUse);
    onLoginSuccess(userToUse);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Por favor ingresa tu usuario o correo electrónico.');
      return;
    }

    if (!password) {
      setErrorMsg('Por favor ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      if (isFirstSetup) {
        // Setup initial owner
        if (password !== confirmPassword) {
          setErrorMsg('Las contraseñas no coinciden. Verifica e intenta nuevamente.');
          setIsLoading(false);
          return;
        }

        const res = await createOwnerAccount(username, fullName, password);
        if (!res.success || !res.user) {
          setErrorMsg(res.error || 'Error al configurar la cuenta de propietario.');
          setIsLoading(false);
          return;
        }

        onLoginSuccess(res.user);
      } else {
        // Normal authentication
        const res = await authenticate(username, password);
        if (!res.success || !res.user) {
          setErrorMsg(res.error || 'Credenciales no autorizadas.');
          setIsLoading(false);
          return;
        }

        onLoginSuccess(res.user);
      }
    } catch {
      setErrorMsg('Ocurrió un error inesperado al autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-[#FAF7F2] flex flex-col justify-center items-center p-4 sm:p-6"
      id="auth-login-screen"
    >
      {/* Background soft ambient accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Top Logo & Title */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center p-2.5 bg-white rounded-2xl shadow-xs border border-[#E8E1D5] mb-2">
            <LogoSemillas size="lg" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#262017] tracking-tight">
            Semillas del Reino
          </h1>
          <p className="text-xs sm:text-sm text-[#736A5D] font-medium max-w-sm mx-auto">
            Centro de Desarrollo Infantil, Estimulación Temprana y Refuerzo Escolar
          </p>
        </div>

        {/* Main Security Card */}
        <div className="bg-white rounded-3xl border-2 border-[#E7E0D3] p-6 sm:p-8 shadow-md">
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#F0EBE2]">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-100/70 px-2 py-0.5 rounded-md">
                  {isFirstSetup ? 'Configuración de Seguridad' : 'Acceso Privado'}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Máx. {MAX_ALLOWED_ACCOUNTS} Cuentas
                </span>
              </div>
              <h2 className="text-base font-black text-[#262017] mt-1">
                {isFirstSetup
                  ? 'Activar Cuenta de Propietario'
                  : 'Ingreso al Sistema de Gestión'}
              </h2>
            </div>
          </div>

          {/* Explanation notice for privacy */}
          <div className="bg-[#FAF7F2] border border-[#E8E1D5] rounded-2xl p-3.5 mb-5 text-xs text-[#5D5547] leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#2D261C]">
                {isFirstSetup
                  ? 'Protección para Publicación en la Web'
                  : 'Plataforma con Acceso Restringido'}
              </p>
              <p className="mt-0.5 text-[11px] text-[#736A5E]">
                {isFirstSetup
                  ? 'Al publicar tu web, cualquier persona ajena que ingrese al enlace será detenida aquí y no podrá ver ni modificar alumnos, pagos ni balances sin tu contraseña.'
                  : 'Solo el propietario y el personal autorizado (máximo 2 cuentas en total) tienen autorización para consultar y modificar la información.'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-semibold text-rose-900 flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isFirstSetup && (
              <div>
                <label className="block text-xs font-bold text-[#3B3327] mb-1">
                  Nombre del Titular o Propietario
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-[#8C8377] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Dirección General - Semillas del Reino"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl text-xs sm:text-sm font-medium text-[#221B13] focus:bg-white focus:border-rose-600 focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#3B3327] mb-1">
                Usuario o Correo Autorizado
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#8C8377] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus={!isFirstSetup}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. annyhelo.pe@gmail.com o directora"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl text-xs sm:text-sm font-medium text-[#221B13] focus:bg-white focus:border-rose-600 focus:outline-none transition-all"
                />
              </div>
              {isFirstSetup && (
                <p className="text-[11px] text-[#7A7163] mt-1">
                  Puedes usar tu correo o un nombre corto (ej: <code>directora</code>).
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#3B3327]">
                  Contraseña {isFirstSetup && '(Mínimo 6 caracteres)'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3 h-3" /> Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" /> Ver
                    </>
                  )}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña de acceso"
                className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl text-xs sm:text-sm font-medium text-[#221B13] focus:bg-white focus:border-rose-600 focus:outline-none transition-all"
              />
            </div>

            {isFirstSetup && (
              <div>
                <label className="block text-xs font-bold text-[#3B3327] mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña para confirmar"
                  className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl text-xs sm:text-sm font-medium text-[#221B13] focus:bg-white focus:border-rose-600 focus:outline-none transition-all"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Validando acceso...</span>
              ) : isFirstSetup ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Crear Cuenta de Propietario & Activar Sistema</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Iniciar Sesión en el Sistema</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDirectAccess}
              className="w-full py-2.5 px-4 bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DDD4C7] text-[#4A4135] font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Acceso Rápido / Continuar sin Contraseña</span>
              <ArrowRight className="w-3.5 h-3.5 text-rose-700" />
            </button>
          </form>

          {/* Footer note inside card */}
          {!isFirstSetup && (
            <div className="mt-5 pt-4 border-t border-[#F0EBE2] text-center">
              <p className="text-[11px] text-[#857B6E]">
                Cuentas registradas: <strong className="text-[#362E23]">{existingUsers.length} de {MAX_ALLOWED_ACCOUNTS} autorizadas</strong>.
              </p>
              <p className="text-[10px] text-[#9E9486] mt-0.5">
                El registro público está cerrado. Solo el propietario puede autorizar el segundo acceso.
              </p>
            </div>
          )}
        </div>

        {/* Security disclaimer footer */}
        <p className="text-center text-[11px] text-[#8F8678] mt-4">
          Semillas del Reino • Plataforma Segura para Sedes Mi Perú & Ventanilla
        </p>
      </div>
    </div>
  );
};
