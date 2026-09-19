import React, { useState } from 'react';
import { StaffMember, Sede, NotificationTemplate, Student } from '../types';
import { DoorBanner } from './DoorBanner';
import { NavTab } from './Navigation';
import { 
  Settings, 
  Users, 
  DollarSign, 
  Bell, 
  MapPin, 
  Database, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  MessageCircle, 
  Save, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface SettingsModuleProps {
  staff: StaffMember[];
  sedes: Sede[];
  templates: NotificationTemplate[];
  students: Student[];
  onAddStaff: (staff: StaffMember) => void;
  onDeleteStaff: (id: string) => void;
  onUpdateTemplate: (template: NotificationTemplate) => void;
  onResetData: () => void;
  onExportData: () => void;
  onBackToHall?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  staff,
  sedes,
  templates,
  students,
  onAddStaff,
  onDeleteStaff,
  onUpdateTemplate,
  onResetData,
  onExportData,
  onBackToHall,
  onNavigateTab,
}) => {
  const [activeSection, setActiveSection] = useState<'staff' | 'notificaciones' | 'sedes' | 'precios' | 'data'>('notificaciones');
  
  // New Staff form state
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<StaffMember['role']>('Profesora Estimulación');
  const [newStaffSede, setNewStaffSede] = useState<StaffMember['sede']>('mi_peru');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');

  // Template editor
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || 'tpl-001');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const [templateText, setTemplateText] = useState(selectedTemplate?.text || '');

  React.useEffect(() => {
    if (selectedTemplate) {
      setTemplateText(selectedTemplate.text);
    }
  }, [selectedTemplateId]);

  const handleSaveTemplate = () => {
    if (selectedTemplate) {
      onUpdateTemplate({
        ...selectedTemplate,
        text: templateText,
      });
      alert('¡Plantilla de WhatsApp guardada exitosamente!');
    }
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffPhone.trim()) return;

    const member: StaffMember = {
      id: `stf-${Date.now()}`,
      name: newStaffName.trim(),
      role: newStaffRole,
      sede: newStaffSede,
      phone: newStaffPhone.trim(),
      email: newStaffEmail.trim() || `${newStaffName.toLowerCase().replace(/\s+/g, '.')}@semillasdelreino.pe`,
      active: true,
    };

    onAddStaff(member);
    setNewStaffName('');
    setNewStaffPhone('');
    setNewStaffEmail('');
    setShowAddStaff(false);
  };

  // Sample student for live template preview
  const sampleStudent = students[0] || {
    fullName: 'Liam Gómez',
    guardianName: 'Carla Castro',
    monthlyFee: 160,
    nextDueDate: '2026-10-05',
  };

  const previewText = templateText
    .replace(/{apoderado}/g, sampleStudent.guardianName || 'Carla Castro')
    .replace(/{nombre_alumno}/g, sampleStudent.fullName || 'Liam')
    .replace(/{monto}/g, String(sampleStudent.monthlyFee || 160))
    .replace(/{fecha_vencimiento}/g, sampleStudent.nextDueDate || '5 de Octubre')
    .replace(/{fecha}/g, '15 de Septiembre')
    .replace(/{hora}/g, '11:00 AM')
    .replace(/{sede}/g, 'Sede Mi Perú')
    .replace(/{concepto}/g, 'Mensualidad Septiembre');

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(previewText);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12" id="settings-module">
      {/* Banner de Puerta 5 */}
      {onBackToHall && onNavigateTab && (
        <DoorBanner
          doorNumber={5}
          title="Dirección, Sedes y Configuración"
          subtitle="Directorio de personal docente, sedes activas, plantillas de WhatsApp institucionales y copias de seguridad."
          onBackToHall={onBackToHall}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#2A251E] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#6B6356]" />
          Módulo de Configuración y Administración
        </h1>
        <p className="text-xs sm:text-sm text-[#736A5E] mt-0.5">
          Gestión de personal docente, plantillas automáticas para padres, tarifas institucionales y copias de seguridad.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#ECE5DA] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSection('notificaciones')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeSection === 'notificaciones'
              ? 'bg-[#2E2820] text-white shadow-2xs'
              : 'text-[#6A6256] hover:bg-[#F2ECE3]'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-500" />
          <span>Plantillas de Notificaciones ({templates.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('staff')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeSection === 'staff'
              ? 'bg-[#2E2820] text-white shadow-2xs'
              : 'text-[#6A6256] hover:bg-[#F2ECE3]'
          }`}
        >
          <Users className="w-4 h-4 text-rose-500" />
          <span>Gestión de Personal ({staff.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('sedes')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeSection === 'sedes'
              ? 'bg-[#2E2820] text-white shadow-2xs'
              : 'text-[#6A6256] hover:bg-[#F2ECE3]'
          }`}
        >
          <MapPin className="w-4 h-4 text-teal-600" />
          <span>Sedes Semillas del Reino</span>
        </button>

        <button
          onClick={() => setActiveSection('precios')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeSection === 'precios'
              ? 'bg-[#2E2820] text-white shadow-2xs'
              : 'text-[#6A6256] hover:bg-[#F2ECE3]'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Tarifas y Precios</span>
        </button>

        <button
          onClick={() => setActiveSection('data')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeSection === 'data'
              ? 'bg-[#2E2820] text-white shadow-2xs'
              : 'text-[#6A6256] hover:bg-[#F2ECE3]'
          }`}
        >
          <Database className="w-4 h-4 text-purple-600" />
          <span>Respaldo y Datos</span>
        </button>
      </div>

      {/* SECTION 1: Notificaciones y WhatsApp */}
      {activeSection === 'notificaciones' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List of templates (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-sm font-bold text-[#2A251E]">Plantillas Preconfiguradas</h3>
            <div className="space-y-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedTemplateId === tpl.id
                      ? 'bg-[#FFF8FA] border-rose-400 shadow-2xs'
                      : 'bg-white border-[#ECE5DA] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#2A251E]">{tpl.name}</span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#FAF5ED] text-[#635B50]">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#7A7265] mt-1 line-clamp-2">{tpl.text}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Template Editor and Live Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-[#ECE5DA] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#2A251E]">
                    Editar Plantilla: {selectedTemplate?.name}
                  </h3>
                  <span className="text-xs text-[#7A7265]">
                    Variables disponibles: {selectedTemplate?.variables.join(' ')}
                  </span>
                </div>
                <button
                  onClick={handleSaveTemplate}
                  className="flex items-center gap-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
              </div>

              <textarea
                rows={5}
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-xs text-[#28241F] outline-none font-sans"
              />

              {/* Live Preview Box */}
              <div className="pt-3 border-t border-[#F0EAE0]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Vista Previa en WhatsApp (Con datos reales de ejemplo):
                  </span>
                  <button
                    onClick={handleCopyPreview}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#554D41] hover:text-[#201C17] bg-[#F2ECE3] hover:bg-[#EAE2D5] px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSuccess ? '¡Copiado!' : 'Copiar Texto'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-[#E7F7ED] border border-[#BDEBD0] text-xs text-[#1E3A2B] whitespace-pre-wrap leading-relaxed font-sans shadow-2xs">
                  {previewText}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Gestión de Personal */}
      {activeSection === 'staff' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#2A251E]">
              Equipo de Trabajo y Permisos ({staff.length} colaboradores)
            </h3>
            <button
              onClick={() => setShowAddStaff(!showAddStaff)}
              className="flex items-center gap-1.5 text-xs font-bold bg-[#2E2820] hover:bg-[#1A1612] text-white px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Agregar Colaborador</span>
            </button>
          </div>

          {showAddStaff && (
            <form
              onSubmit={handleCreateStaff}
              className="bg-white p-5 rounded-2xl border border-[#ECE5DA] shadow-xs space-y-3"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">
                Nuevo Colaborador / Docente
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[#4A4237] font-semibold mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Lic. Nicole Cabrera"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCD5C9]"
                  />
                </div>
                <div>
                  <label className="block text-[#4A4237] font-semibold mb-1">Rol / Cargo *</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as StaffMember['role'])}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCD5C9]"
                  >
                    <option value="Profesora Estimulación">Profesora Estimulación</option>
                    <option value="Profesor/a Refuerzo">Profesor/a Refuerzo</option>
                    <option value="Secretaría / Recepción">Secretaría / Recepción</option>
                    <option value="Administrador">Administrador / Dirección</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#4A4237] font-semibold mb-1">Sede Asignada *</label>
                  <select
                    value={newStaffSede}
                    onChange={(e) => setNewStaffSede(e.target.value as StaffMember['sede'])}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCD5C9]"
                  >
                    <option value="todas">Todas las Sedes</option>
                    <option value="mi_peru">Sede Mi Perú</option>
                    <option value="ventanilla">Sede Ventanilla (Deporte)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#4A4237] font-semibold mb-1">Teléfono Móvil *</label>
                  <input
                    type="tel"
                    required
                    placeholder="999 888 777"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCD5C9]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[#4A4237] font-semibold mb-1">Correo Institucional</label>
                  <input
                    type="email"
                    placeholder="colaborador@semillasdelreino.pe"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCD5C9]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaff(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#EFE9DF] text-xs font-semibold text-[#4A4237]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold"
                >
                  Guardar
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((member) => (
              <div
                key={member.id}
                className="bg-white p-4 rounded-2xl border border-[#ECE5DA] shadow-2xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                      {member.role}
                    </span>
                    {member.role !== 'Administrador' && (
                      <button
                        onClick={() => onDeleteStaff(member.id)}
                        className="text-stone-400 hover:text-red-700 p-1"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-[#27231D] mt-2">{member.name}</h4>
                  <p className="text-xs text-[#7A7265] mt-0.5">
                    Sede:{' '}
                    {member.sede === 'todas'
                      ? 'Todas las Sedes'
                      : member.sede === 'mi_peru'
                      ? 'Mi Perú'
                      : 'Ventanilla'}
                  </p>
                  <p className="text-xs text-emerald-800 font-mono mt-0.5">📱 {member.phone}</p>
                </div>
                <div className="pt-2 border-t border-[#F2EDE5] text-[11px] text-[#8C8477]">
                  {member.email}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Sedes */}
      {activeSection === 'sedes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sedes.map((s) => (
            <div key={s.id} className="bg-white p-5 rounded-2xl border border-[#ECE5DA] shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: s.color }}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#2A251E]">{s.name}</h3>
                  <span className="text-xs text-emerald-800 font-medium">Sede Activa Operativa</span>
                </div>
              </div>

              <div className="text-xs space-y-1.5 text-[#635B4F] pt-2 border-t border-[#F0E9DF]">
                <div>
                  <span className="font-semibold text-[#302A22] block">Dirección:</span>
                  <span>{s.address}</span>
                </div>
                <div>
                  <span className="font-semibold text-[#302A22] block">Teléfono / WhatsApp:</span>
                  <span className="font-mono text-emerald-700">{s.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 4: Tarifas y Precios */}
      {activeSection === 'precios' && (
        <div className="bg-white p-6 rounded-2xl border border-[#ECE5DA] shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-[#2A251E]">
              Tarifas Vigentes y Precios de Programas
            </h3>
            <p className="text-xs text-[#7A7265] mt-0.5">
              Valores estandarizados de matrícula y mensualidad para el ciclo 2026.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[#ECE5DA] bg-[#FAF8F5]">
              <span className="text-xs font-semibold text-[#665D4F]">Estimulación Temprana</span>
              <p className="text-xl font-bold text-rose-700 mt-1">S/ 160 - S/ 180</p>
              <p className="text-[11px] text-[#7A7265] mt-1">
                Gateadores y Caminantes (2 veces por semana)
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#ECE5DA] bg-[#FAF8F5]">
              <span className="text-xs font-semibold text-[#665D4F]">Prekínder Regular</span>
              <p className="text-xl font-bold text-amber-700 mt-1">S/ 220.00</p>
              <p className="text-[11px] text-[#7A7265] mt-1">Lunes a Viernes (Turno Mañana)</p>
            </div>

            <div className="p-4 rounded-xl border border-[#ECE5DA] bg-[#FAF8F5]">
              <span className="text-xs font-semibold text-[#665D4F]">Refuerzo Académico</span>
              <p className="text-xl font-bold text-blue-700 mt-1">S/ 140 - S/ 150</p>
              <p className="text-[11px] text-[#7A7265] mt-1">
                Inicial, Primaria, Secundaria (Atención TEA/TDA)
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#ECE5DA] bg-[#FAF8F5]">
              <span className="text-xs font-semibold text-[#665D4F]">Guardería Infantil</span>
              <p className="text-xl font-bold text-teal-700 mt-1">S/ 240 - S/ 350</p>
              <p className="text-[11px] text-[#7A7265] mt-1">Medio tiempo o Tiempo completo</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: Respaldo y Datos */}
      {activeSection === 'data' && (
        <div className="bg-white p-6 rounded-2xl border border-[#ECE5DA] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#2A251E]">Seguridad y Datos del Sistema</h3>
          <p className="text-xs text-[#7A7265]">
            Los datos se guardan de forma segura en este navegador (Almacenamiento Local). Puedes descargar una copia de seguridad o restablecer los datos de demostración en cualquier momento.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              onClick={onExportData}
              className="flex items-center justify-center gap-2 bg-[#2E2820] hover:bg-[#1A1612] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Exportar Copia de Seguridad (JSON)</span>
            </button>

            <button
              onClick={onResetData}
              className="flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restablecer Datos de Ejemplo Iniciales</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
