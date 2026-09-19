import React, { useState } from 'react';
import { StaffMember, StaffRole, SedeId } from '../../types';
import { formatSoles } from '../../utils/dateUtils';
import { 
  X, 
  UserPlus, 
  Trash2, 
  GraduationCap, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  Briefcase,
  DollarSign,
  UserCheck,
  Building2,
  Users
} from 'lucide-react';

interface StaffManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember[];
  onAddStaff: (member: StaffMember) => void;
  onDeleteStaff: (staffId: string) => void;
  onOpenPaymentToTeacher?: (teacherName: string) => void;
}

export const StaffManagementModal: React.FC<StaffManagementModalProps> = ({
  isOpen,
  onClose,
  staff = [],
  onAddStaff,
  onDeleteStaff,
  onOpenPaymentToTeacher,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'todos' | 'docentes' | 'otros'>('todos');

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffRole>('Profesora Estimulación');
  const [sede, setSede] = useState<SedeId | 'todas'>('mi_peru');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [salaryReference, setSalaryReference] = useState<string>('600');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Por favor ingresa el nombre de la profesora o trabajadora.');
      return;
    }

    const newMember: StaffMember = {
      id: `stf-${Date.now()}`,
      name: name.trim(),
      role: role,
      sede: sede,
      phone: phone.trim() || 'No registrado',
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@semillasdelreino.pe`,
      salaryReference: salaryReference ? Number(salaryReference) : undefined,
      active: true,
      notes: notes.trim() || undefined,
    };

    onAddStaff(newMember);

    // Reset form
    setName('');
    setRole('Profesora Estimulación');
    setSede('mi_peru');
    setPhone('');
    setEmail('');
    setSalaryReference('600');
    setNotes('');
    setShowAddForm(false);
  };

  const handleDelete = (member: StaffMember) => {
    const isConfirmed = window.confirm(
      `¿Estás seguro de eliminar a "${member.name}"?\n\nAl eliminarla, ya no figurará en la lista de pago de honorarios ni en el directorio institucional.`
    );
    if (isConfirmed) {
      onDeleteStaff(member.id);
    }
  };

  const filteredStaff = staff.filter((member) => {
    // Role filter
    if (filterRole === 'docentes') {
      const isTeacher = member.role.toLowerCase().includes('profesor') || member.role.toLowerCase().includes('docente') || member.role.toLowerCase().includes('estimula') || member.role.toLowerCase().includes('refuerzo');
      if (!isTeacher) return false;
    } else if (filterRole === 'otros') {
      const isTeacher = member.role.toLowerCase().includes('profesor') || member.role.toLowerCase().includes('docente') || member.role.toLowerCase().includes('estimula') || member.role.toLowerCase().includes('refuerzo');
      if (isTeacher) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = member.name.toLowerCase().includes(q);
      const matchRole = member.role.toLowerCase().includes(q);
      const matchPhone = member.phone.toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchPhone) return false;
    }

    return true;
  });

  const teacherCount = staff.filter(
    (s) => s.role.toLowerCase().includes('profesor') || s.role.toLowerCase().includes('docente') || s.role.toLowerCase().includes('estimula') || s.role.toLowerCase().includes('refuerzo')
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-[#E8E1D5] shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-[#FAF7F2] p-5 sm:p-6 border-b border-[#E8E2D8] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-rose-100 text-rose-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-lg border border-rose-200">
                Personal y Planilla
              </span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {staff.length} Registrados ({teacherCount} Docentes)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#26211A] tracking-tight">
              Gestión de Profesoras y Trabajadores
            </h2>
            <p className="text-xs text-[#71685C]">
              Agrega a nuevas docentes o trabajadores cuando contrates personal, o elimínalos en 1 clic si ya no laboran en el centro.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7E7467] hover:text-[#201C17] hover:bg-[#EFE9DF] transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Action Bar: Botón Agregar + Buscador */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs ${
                showAddForm
                  ? 'bg-neutral-800 text-white hover:bg-neutral-900'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{showAddForm ? 'Cerrar Formulario' : '+ Agregar Nueva Profesora / Trabajador'}</span>
            </button>

            {/* Filtros rápidos */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#908678]" />
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-2 text-xs rounded-xl border border-[#DED6C9] bg-white text-[#2F2922] focus:outline-none focus:ring-2 focus:ring-rose-500 w-44 sm:w-56"
                />
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="text-xs py-2 px-2.5 rounded-xl border border-[#DED6C9] bg-white text-[#383127] focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                <option value="todos">Todos</option>
                <option value="docentes">Solo Docentes</option>
                <option value="otros">Otras Áreas</option>
              </select>
            </div>
          </div>

          {/* Formulario desplegable para agregar nuevo personal */}
          {showAddForm && (
            <form
              onSubmit={handleCreateStaff}
              className="bg-amber-50/70 border-2 border-amber-300/80 rounded-2xl p-5 space-y-4 animate-fadeIn"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-700" />
                  Registrar Nueva Profesora o Trabajador
                </h3>
                <span className="text-[11px] font-semibold text-amber-800">
                  Aparecerá de inmediato en los pagos de planilla y horarios
                </span>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-100 border border-rose-200 text-rose-900 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#3E372E] mb-1">
                    Nombre Completo / Título *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Lic. Andrea Salas, Prof. Carmen Vega"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#D9D1C3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#2C261F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3E372E] mb-1">
                    Cargo o Función *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StaffRole)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#D9D1C3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#2C261F] cursor-pointer"
                  >
                    <option value="Profesora Estimulación">👩‍🏫 Profesora de Estimulación Temprana</option>
                    <option value="Profesor/a Refuerzo">📚 Profesora de Refuerzo / Primaria</option>
                    <option value="Auxiliar de Aula">🧸 Auxiliar de Aula / Guardería</option>
                    <option value="Terapista de Lenguaje">🗣️ Terapista de Lenguaje</option>
                    <option value="Psicóloga">🧠 Psicóloga Educativa</option>
                    <option value="Secretaría / Recepción">📋 Secretaría / Recepción</option>
                    <option value="Mantenimiento y Limpieza">🧹 Personal de Limpieza / Mantenimiento</option>
                    <option value="Administrador">💼 Administración / Dirección</option>
                    <option value="Otro">Otro Cargo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3E372E] mb-1">
                    Sede de Trabajo Asignada *
                  </label>
                  <select
                    value={sede}
                    onChange={(e) => setSede(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#D9D1C3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#2C261F] cursor-pointer"
                  >
                    <option value="mi_peru">📍 Sede Principal: Mi Perú</option>
                    <option value="ventanilla">📍 Sede Ventanilla: Deporte</option>
                    <option value="todas">🏢 Ambas Sedes (Rotativo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3E372E] mb-1">
                    Teléfono Celular / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej: 991 223 344"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#D9D1C3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#2C261F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3E372E] mb-1">
                    Sueldo / Honorario Referencial (S/.)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#867B6E]">S/</span>
                    <input
                      type="number"
                      placeholder="600"
                      value={salaryReference}
                      onChange={(e) => setSalaryReference(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#D9D1C3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#2C261F]"
                    />
                  </div>
                  <span className="text-[10px] text-[#7A7163] mt-0.5 block">
                    Monto sugerido para agilizar el registro en el módulo de Gastos
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3E372E] mb-1">
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="docente@semillasdelreino.pe"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#D9D1C3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#2C261F]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#5B5245] hover:bg-amber-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Guardar Profesora / Trabajador
                </button>
              </div>
            </form>
          )}

          {/* Listado de Trabajadores */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#6D6355]">
              <span>Personal Actualmente Registrado ({filteredStaff.length})</span>
              <span className="text-[11px] text-[#867B6E]">
                Usa el botón rojo para quitar o dar de baja a una docente
              </span>
            </div>

            {filteredStaff.length === 0 ? (
              <div className="text-center py-10 bg-[#FAF7F2] rounded-2xl border border-dashed border-[#DDD4C7] space-y-2">
                <Users className="w-8 h-8 text-[#988E80] mx-auto" />
                <p className="text-xs font-semibold text-[#665D50]">
                  No se encontraron trabajadoras con los filtros actuales.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredStaff.map((member) => {
                  const isTeacher =
                    member.role.toLowerCase().includes('profesor') ||
                    member.role.toLowerCase().includes('docente') ||
                    member.role.toLowerCase().includes('estimula') ||
                    member.role.toLowerCase().includes('refuerzo');

                  return (
                    <div
                      key={member.id}
                      className="bg-white rounded-2xl border border-[#E7E0D3] p-4 hover:border-amber-400/80 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      {/* Info principal */}
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-bold text-sm ${
                            isTeacher
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {isTeacher ? (
                            <GraduationCap className="w-5 h-5 text-rose-700" />
                          ) : (
                            <Briefcase className="w-5 h-5 text-amber-800" />
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-[#27221A]">
                              {member.name}
                            </h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                isTeacher
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : 'bg-neutral-100 text-neutral-800 border-neutral-200'
                              }`}
                            >
                              {member.role}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-[#756C5F] flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#9E9486]" />
                              {member.sede === 'todas'
                                ? 'Ambas Sedes'
                                : member.sede === 'mi_peru'
                                ? 'Sede Mi Perú'
                                : 'Sede Ventanilla'}
                            </span>

                            {member.phone && member.phone !== 'No registrado' && (
                              <span className="flex items-center gap-1 text-[#5E5649]">
                                <Phone className="w-3 h-3 text-[#9E9486]" />
                                {member.phone}
                              </span>
                            )}

                            {member.salaryReference && (
                              <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] border border-emerald-200">
                                Ref: {formatSoles(member.salaryReference)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Acciones: Pagar sueldo & Eliminar */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {onOpenPaymentToTeacher && isTeacher && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenPaymentToTeacher(member.name);
                            }}
                            className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                            title="Registrar pago de honorarios o sueldo para esta profesora"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Pagar Sueldo</span>
                          </button>
                        )}

                        {/* Botón de eliminar con confirmación */}
                        <button
                          type="button"
                          onClick={() => handleDelete(member)}
                          className="flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                          title="Eliminar o dar de baja a esta trabajadora"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#FAF7F2] p-4 px-6 border-t border-[#E8E2D8] flex items-center justify-between text-xs text-[#736A5E]">
          <span>
            💡 Los cambios se guardan permanentemente y se reflejan en el cálculo de gastos y vales.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 font-bold text-white bg-[#302A22] hover:bg-[#1A1611] rounded-xl transition-colors cursor-pointer"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
