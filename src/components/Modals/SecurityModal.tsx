import React, { useState } from 'react';
import { AuthUser } from '../../types';
import {
  getStoredUsers,
  createSecondAccount,
  removeUserAccount,
  updatePassword,
  MAX_ALLOWED_ACCOUNTS,
} from '../../utils/authUtils';
import {
  ShieldCheck,
  X,
  UserPlus,
  Trash2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  Lock,
  UserCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  onLogout: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
}) => {
  const [users, setUsers] = useState<AuthUser[]>(() => getStoredUsers());
  const [isAddingSecond, setIsAddingSecond] = useState(false);
  const [secondName, setSecondName] = useState('');
  const [secondUsername, setSecondUsername] = useState('');
  const [secondPassword, setSecondPassword] = useState('');

  // Password change state
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const refreshUsers = () => {
    setUsers(getStoredUsers());
  };

  const handleCreateSecondUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!secondUsername.trim() || !secondPassword.trim()) {
      setNotification({ type: 'error', text: 'Completa todos los campos para el segundo usuario.' });
      return;
    }

    const res = await createSecondAccount(secondUsername, secondName, secondPassword);
    if (!res.success) {
      setNotification({ type: 'error', text: res.error || 'Error al crear la cuenta.' });
      return;
    }

    setNotification({ type: 'success', text: `Segunda cuenta (${res.user?.username}) creada con éxito.` });
    setIsAddingSecond(false);
    setSecondName('');
    setSecondUsername('');
    setSecondPassword('');
    refreshUsers();
  };

  const handleRemoveSecondUser = (userId: string, userName: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar el acceso a "${userName}"? Solo el propietario podrá acceder al sistema.`)) {
      const ok = removeUserAccount(userId);
      if (ok) {
        setNotification({ type: 'success', text: 'Cuenta eliminada. Ahora solo tú tienes acceso.' });
        refreshUsers();
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (newPassword.length < 6) {
      setNotification({ type: 'error', text: 'La nueva contraseña debe tener mínimo 6 caracteres.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setNotification({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
      return;
    }

    const ok = await updatePassword(currentUser.id, newPassword);
    if (ok) {
      setNotification({ type: 'success', text: 'Contraseña actualizada correctamente.' });
      setIsChangingPass(false);
      setNewPassword('');
      setConfirmNewPassword('');
      refreshUsers();
    } else {
      setNotification({ type: 'error', text: 'Error al cambiar la contraseña.' });
    }
  };

  // Backup feature: export entire system state to JSON
  const handleExportBackup = () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        students: localStorage.getItem('semillas_students_data_prod_v4') || '[]',
        payments: localStorage.getItem('semillas_payments_data_prod_v4') || '[]',
        expenses: localStorage.getItem('semillas_expenses') || '[]',
        classes: localStorage.getItem('semillas_classes') || '[]',
        staff: localStorage.getItem('semillas_staff') || '[]',
        evaluations: localStorage.getItem('semillas_evaluations') || '[]',
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_semillas_del_reino_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setNotification({ type: 'success', text: 'Copia de respaldo descargada en tu computadora.' });
    } catch {
      setNotification({ type: 'error', text: 'Error al generar la copia de seguridad.' });
    }
  };

  // Restore backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        if (window.confirm('¿Deseas restaurar esta copia de seguridad? Se actualizarán los alumnos, pagos y gastos con los datos del archivo.')) {
          if (data.students) localStorage.setItem('semillas_students_data_prod_v4', data.students);
          if (data.payments) localStorage.setItem('semillas_payments_data_prod_v4', data.payments);
          if (data.expenses) localStorage.setItem('semillas_expenses', data.expenses);
          if (data.classes) localStorage.setItem('semillas_classes', data.classes);
          if (data.staff) localStorage.setItem('semillas_staff', data.staff);
          if (data.evaluations) localStorage.setItem('semillas_evaluations', data.evaluations);

          alert('Copia de respaldo restaurada exitosamente. La página se recargará para aplicar los datos.');
          window.location.reload();
        }
      } catch {
        setNotification({ type: 'error', text: 'El archivo no es una copia de seguridad válida.' });
      }
    };
    reader.readAsText(file);
  };

  const isOwner = currentUser.role === 'owner';
  const canAddMore = users.length < MAX_ALLOWED_ACCOUNTS;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      id="security-management-modal"
    >
      <div className="bg-white rounded-3xl border border-[#E6E0D5] shadow-2xl w-full max-w-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF7F2] border-b border-[#ECE5DA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#262017]">
                  Seguridad & Cuentas Privadas
                </h2>
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                  Máx. 2 Cuentas
                </span>
              </div>
              <p className="text-xs text-[#7A7163]">
                Control de acceso exclusivo al sistema para el Propietario y Dirección
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#786F62] hover:text-[#221B13] hover:bg-[#EFE9DF] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {notification && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 ${
                notification.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.text}</span>
            </div>
          )}

          {/* Section 1: Active Accounts list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#262017] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-rose-600" />
                  Cuentas con Acceso Autorizado ({users.length} de {MAX_ALLOWED_ACCOUNTS})
                </h3>
                <p className="text-xs text-[#7A7163]">
                  Nadie más en internet puede acceder a tu información sin una de estas cuentas.
                </p>
              </div>

              {isOwner && canAddMore && !isAddingSecond && (
                <button
                  onClick={() => setIsAddingSecond(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Agregar 2da Cuenta</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {users.map((u, idx) => (
                <div
                  key={u.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    u.id === currentUser.id
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-[#FAF8F5] border-[#E8E1D5]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-[#E0D8CC] text-[#4A4134]">
                        Cuenta #{idx + 1}
                      </span>
                      {u.role === 'owner' ? (
                        <span className="text-[11px] font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                          👑 Propietario / Director
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                          🔑 Acceso Autorizado
                        </span>
                      )}
                      {u.id === currentUser.id && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Tu Sesión Actual
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-black text-[#262017]">{u.name}</p>
                    <p className="text-xs text-[#6F6659]">
                      Usuario / Correo: <strong className="text-[#322A1E] font-mono">{u.username}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {u.id === currentUser.id ? (
                      <button
                        onClick={() => setIsChangingPass(!isChangingPass)}
                        className="text-xs font-bold text-[#4B4337] bg-white hover:bg-[#F2ECE1] border border-[#DDD5CA] px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        Cambiar Mi Contraseña
                      </button>
                    ) : (
                      isOwner && (
                        <button
                          onClick={() => handleRemoveSecondUser(u.id, u.name)}
                          className="flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 border border-rose-300 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                          title="Eliminar este segundo acceso"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revocar Acceso</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Form to add second authorized account */}
            {isAddingSecond && (
              <form
                onSubmit={handleCreateSecondUser}
                className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 animate-fade-in"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-amber-700" />
                    Registrar Segundo Usuario Autorizado (Máx. 2)
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingSecond(false)}
                    className="text-xs font-bold text-amber-900 hover:underline cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#4B4236] mb-1">
                      Nombre o Cargo
                    </label>
                    <input
                      type="text"
                      required
                      value={secondName}
                      onChange={(e) => setSecondName(e.target.value)}
                      placeholder="Ej. Coordinadora Sede Ventanilla"
                      className="w-full px-3 py-2 bg-white border border-[#DDD5CA] rounded-xl text-xs font-medium focus:border-rose-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#4B4236] mb-1">
                      Usuario o Correo de Acceso
                    </label>
                    <input
                      type="text"
                      required
                      value={secondUsername}
                      onChange={(e) => setSecondUsername(e.target.value)}
                      placeholder="ej. coordinadora o correo@gmail.com"
                      className="w-full px-3 py-2 bg-white border border-[#DDD5CA] rounded-xl text-xs font-medium focus:border-rose-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4B4236] mb-1">
                    Contraseña para este usuario (mínimo 6 caracteres)
                  </label>
                  <input
                    type="password"
                    required
                    value={secondPassword}
                    onChange={(e) => setSecondPassword(e.target.value)}
                    placeholder="Escribe la contraseña que usará"
                    className="w-full px-3 py-2 bg-white border border-[#DDD5CA] rounded-xl text-xs font-medium focus:border-rose-600 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-black rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  Guardar y Habilitar Segundo Acceso
                </button>
              </form>
            )}

            {/* Change password sub-form */}
            {isChangingPass && (
              <form
                onSubmit={handleChangePassword}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD5CA] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-[#262017] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-rose-600" />
                    Cambiar Mi Contraseña Actual
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsChangingPass(false)}
                    className="text-xs font-bold text-[#6D6456] hover:underline cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#4B4236] mb-1">
                      Nueva Contraseña
                    </label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-3 py-2 bg-white border border-[#DDD5CA] rounded-xl text-xs font-medium focus:border-rose-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#4B4236] mb-1">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="w-full px-3 py-2 bg-white border border-[#DDD5CA] rounded-xl text-xs font-medium focus:border-rose-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="text-[11px] font-semibold text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPass ? 'Ocultar texto' : 'Ver contraseñas'}</span>
                  </button>

                  <button
                    type="submit"
                    className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    Guardar Nueva Contraseña
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Section 2: Backup & Portability */}
          <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#E4DCD0] space-y-3">
            <div>
              <h3 className="text-xs font-black text-[#262017] flex items-center gap-1.5 uppercase tracking-wider">
                <Download className="w-4 h-4 text-[#7A7061]" />
                Copias de Respaldo & Migración de Datos
              </h3>
              <p className="text-xs text-[#71685A] mt-0.5">
                Para tu máxima tranquilidad al publicar la web, descarga una copia de todos tus alumnos, pagos y gastos. Puedes restaurarla en cualquier momento o abrirla en otro dispositivo.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap pt-1">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center gap-2 bg-white hover:bg-[#F2ECE1] border border-[#DDD5CA] text-xs font-bold text-[#3B3326] px-4 py-2 rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Descargar Copia de Seguridad (.json)</span>
              </button>

              <label className="flex items-center gap-2 bg-white hover:bg-[#F2ECE1] border border-[#DDD5CA] text-xs font-bold text-[#3B3326] px-4 py-2 rounded-xl shadow-2xs transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-blue-700" />
                <span>Restaurar Copia desde Archivo</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-t border-[#ECE5DA] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Seguro que deseas cerrar la sesión? El sistema se bloqueará de inmediato.')) {
                onLogout();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-800 hover:text-rose-950 hover:underline cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Cerrar Sesión en este Equipo</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#262017] hover:bg-[#3D3528] text-white text-xs font-black rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            Entendido, Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  );
};
