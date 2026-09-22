import React, { useState } from 'react';
import {
  Student,
  FreeEvaluationAppointment,
  ScheduleClass,
  PaymentRecord,
  ExpenseRecord,
  AdditionalIncomeRecord,
  StaffMember,
  SedeId,
  Sede,
} from '../types';
import { NavTab } from './Navigation';
import {
  Calendar,
  Users,
  BookOpen,
  Wallet,
  Settings,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Cake,
  Clock,
  MapPin,
  DollarSign,
  UserPlus,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  Phone,
  Receipt,
  GraduationCap,
} from 'lucide-react';
import { formatSoles, generateWhatsAppUrl, getUpcomingBirthdays } from '../utils/dateUtils';

interface DashboardProps {
  students: Student[];
  evaluations: FreeEvaluationAppointment[];
  classes: ScheduleClass[];
  payments: PaymentRecord[];
  additionalIncomes?: AdditionalIncomeRecord[];
  expenses?: ExpenseRecord[];
  staff?: StaffMember[];
  selectedSede: SedeId | 'todas';
  sedes: Sede[];
  onOpenNewStudent: () => void;
  onOpenPayment: (student?: Student | null) => void;
  onOpenEvaluation: () => void;
  onOpenScheduleModal?: (schedule?: ScheduleClass | null) => void;
  onNavigateTab: (tab: NavTab) => void;
  onSelectStudent: (student: Student) => void;
  onOpenSearch: () => void;
  onOpenStaffModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  evaluations,
  classes,
  payments,
  additionalIncomes = [],
  expenses = [],
  staff = [],
  selectedSede,
  sedes,
  onOpenNewStudent,
  onOpenPayment,
  onOpenEvaluation,
  onOpenScheduleModal,
  onNavigateTab,
  onSelectStudent,
  onOpenSearch,
  onOpenStaffModal,
}) => {
  const [sideAgendaView, setSideAgendaView] = useState<'hoy' | 'semana'>('hoy');

  // Detect current day name in Spanish
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const todayIndex = new Date().getDay();
  const currentDayName = dayNames[todayIndex];

  // Filter items according to selected sede
  const filteredStudents = students.filter((s) => {
    if (selectedSede === 'todas') return true;
    return s.sede === selectedSede;
  });

  const filteredClasses = classes.filter((cls) => {
    if (selectedSede === 'todas') return true;
    return cls.sede === selectedSede;
  });

  const filteredEvaluations = evaluations.filter((e) => {
    if (selectedSede === 'todas') return true;
    return e.sede === selectedSede;
  });

  const filteredPayments = payments.filter((p) => {
    if (selectedSede === 'todas') return true;
    const student = students.find((s) => s.id === p.studentId);
    return student?.sede === selectedSede;
  });

  const filteredAdditional = (additionalIncomes || []).filter((inc) => {
    if (selectedSede === 'todas') return true;
    return inc.sede === selectedSede;
  });

  // Calculate stats
  const monthlyCollected = filteredPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const additionalCollected = filteredAdditional.reduce((acc, inc) => acc + (Number(inc.amount) || 0), 0);
  const totalRevenue = monthlyCollected + additionalCollected;
  const totalExpenses = (expenses || []).reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const netBalance = totalRevenue - totalExpenses;
  const teacherPayroll = (expenses || [])
    .filter((e) => e.category === 'profesores')
    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const rentExpenses = (expenses || [])
    .filter((e) => e.category === 'alquiler')
    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  const debtAlerts = filteredStudents.filter(
    (s) => s.paymentStatus === 'pendiente' || s.paymentStatus === 'vencido'
  );
  const pendingEvals = filteredEvaluations.filter((e) => e.status === 'programada');
  const birthdays = getUpcomingBirthdays(filteredStudents);

  // Filter classes for the side widget
  const todayClasses = filteredClasses.filter(
    (cls) => cls.dayOfWeek === currentDayName || (currentDayName === 'Domingo' && cls.dayOfWeek === 'Lunes')
  );

  const displayedSideClasses = sideAgendaView === 'hoy' ? todayClasses : filteredClasses.slice(0, 7);

  const currentSedeName =
    selectedSede === 'todas'
      ? 'Todas las Sedes (Mi Perú & Ventanilla)'
      : selectedSede === 'mi_peru'
      ? 'Sede Principal: Mi Perú'
      : 'Sede Ventanilla: Deporte';

  // Active teachers count
  const activeTeachers = (staff || []).filter(
    (s) =>
      s.role.toLowerCase().includes('profesor') ||
      s.role.toLowerCase().includes('docente') ||
      s.role.toLowerCase().includes('estimula') ||
      s.role.toLowerCase().includes('refuerzo')
  );
  const teacherCount = activeTeachers.length > 0 ? activeTeachers.length : (staff.length > 0 ? staff.length : 2);

  return (
    <div className="space-y-6 pb-16" id="dashboard-view">
      {/* Top Welcome Header - Mucho más grande, amplio, imponente y completo */}
      <section
        id="dashboard-header"
        className="bg-white rounded-3xl border-2 border-[#E6E0D5] p-6 sm:p-8 lg:p-9 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6"
      >
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="bg-rose-600 text-white text-[11px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-xl shadow-2xs">
              Panel Principal & Control General
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#52493D] bg-[#F7F3EC] px-3 py-1 rounded-xl border border-[#E7E0D3] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {currentSedeName}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#221B13] tracking-tight">
              Semillas del Reino
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6254] font-medium mt-1">
              Centro de Desarrollo Infantil, Estimulación Temprana y Refuerzo Escolar
            </p>
          </div>

          {/* Quick interactive badges in header */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap pt-1 text-xs">
            <button
              onClick={() => onNavigateTab('students')}
              className="flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#E2DAD0] px-3 py-1.5 rounded-xl font-bold text-[#3B342A] transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-rose-600" />
              <span>{filteredStudents.length} Alumnos</span>
            </button>

            {onOpenStaffModal && (
              <button
                onClick={onOpenStaffModal}
                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl font-bold text-rose-900 transition-colors cursor-pointer shadow-2xs"
                title="Administrar docentes: agregar o quitar profesoras"
              >
                <GraduationCap className="w-3.5 h-3.5 text-rose-700" />
                <span>{teacherCount} Profesoras Activas</span>
                <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded-md font-extrabold ml-0.5">
                  Gestionar
                </span>
              </button>
            )}

            <button
              onClick={() => onNavigateTab('expenses')}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl font-bold text-amber-900 transition-colors cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-700" />
              <span>Balance: {formatSoles(netBalance)}</span>
            </button>
          </div>
        </div>

        {/* Search shortcut & quick actions */}
        <div className="flex items-stretch sm:items-center gap-2.5 flex-wrap xl:justify-end shrink-0">
          <button
            onClick={onOpenSearch}
            id="btn-quick-search"
            className="flex items-center gap-2.5 bg-[#FAF7F2] hover:bg-[#F0EAE0] text-[#4A4235] text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl border border-[#DDD5CA] transition-all cursor-pointer shadow-2xs"
            title="Buscar alumno por nombre o DNI (Ctrl + K)"
          >
            <Search className="w-4 h-4 text-[#7C7365]" />
            <span>Buscar alumno...</span>
            <kbd className="hidden sm:inline bg-white px-2 py-0.5 rounded-md text-[11px] font-mono border border-[#D5CCC0] text-[#7A7163]">
              Ctrl+K
            </kbd>
          </button>

          {onOpenStaffModal && (
            <button
              onClick={onOpenStaffModal}
              id="btn-quick-staff-manage"
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#3B3327] bg-[#FAF7F2] hover:bg-[#F0EAE0] border border-[#DDD5CA] px-4 py-3 rounded-2xl shadow-2xs transition-all cursor-pointer hover:border-amber-400"
              title="Agregar o quitar profesoras y trabajadores del centro"
            >
              <GraduationCap className="w-4 h-4 text-rose-600" />
              <span>Profesoras & Personal</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('expenses')}
            id="btn-quick-expenses"
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#3B3327] bg-[#FAF7F2] hover:bg-[#F0EAE0] border border-[#DDD5CA] px-4 py-3 rounded-2xl shadow-2xs transition-all cursor-pointer hover:border-amber-400"
          >
            <Receipt className="w-4 h-4 text-amber-700" />
            <span>Gastos & Planilla</span>
          </button>

          <button
            onClick={onOpenNewStudent}
            id="btn-quick-new-student"
            className="flex items-center gap-2 text-xs sm:text-sm font-black text-white bg-rose-600 hover:bg-rose-700 px-5 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Matricular Alumno</span>
          </button>
        </div>
      </section>

      {/* Main Layout: Amplio y espacioso ocupando la pantalla (Main Area 8/9 cols + Side Agenda 4/3 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* =========================================================================
            COLUMNA PRINCIPAL AMPLIA (8/9 columnas): Métricas, Módulos Operativos y Accesos
           ========================================================================= */}
        <div className="xl:col-span-8 2xl:col-span-9 space-y-6">
          {/* Fila de Métricas Rápidas y Balance Financiero */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5" id="dashboard-stats-row">
            {/* Métrica 1: Alumnos */}
            <div
              onClick={() => onNavigateTab('students')}
              className="bg-white rounded-2xl border border-[#E8E1D5] p-4 shadow-2xs hover:border-rose-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-[#7A7164]">
                <span>Alumnos</span>
                <Users className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-black text-[#26211B] mt-1.5">
                {filteredStudents.length}
              </div>
              <p className="text-[11px] text-[#8C8477] mt-0.5">
                {filteredStudents.length === 0 ? 'Sin alumnos aún' : 'Matriculados'}
              </p>
            </div>

            {/* Métrica 2: Ingresos Cobrados */}
            <div
              onClick={() => onNavigateTab('payments')}
              className="bg-white rounded-2xl border border-[#E8E1D5] p-4 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-[#7A7164]">
                <span>Ingresos Caja</span>
                <TrendingUp className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-1.5 truncate">
                {formatSoles(monthlyCollected)}
              </div>
              <p className="text-[11px] text-[#8C8477] mt-0.5">
                {filteredPayments.length} cobro(s)
              </p>
            </div>

            {/* Métrica 3: Gastos Totales */}
            <div
              onClick={() => onNavigateTab('expenses')}
              className="bg-white rounded-2xl border border-[#E8E1D5] p-4 shadow-2xs hover:border-rose-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-[#7A7164]">
                <span>Gastos / Egresos</span>
                <TrendingDown className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-900 mt-1.5 truncate">
                {formatSoles(totalExpenses)}
              </div>
              <p className="text-[11px] text-[#8C8477] mt-0.5">
                Alquiler + 2 profesoras
              </p>
            </div>

            {/* Métrica 4: Saldo en Caja */}
            <div
              onClick={() => onNavigateTab('expenses')}
              className="bg-white rounded-2xl border border-[#E8E1D5] p-4 shadow-2xs hover:border-amber-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-[#7A7164]">
                <span>Utilidad Neta</span>
                <Wallet className="w-4 h-4 text-amber-700 group-hover:scale-110 transition-transform" />
              </div>
              <div className={`text-xl sm:text-2xl font-black mt-1.5 truncate ${netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatSoles(netBalance)}
              </div>
              <p className="text-[11px] text-[#8C8477] mt-0.5">
                {netBalance >= 0 ? 'Saldo a favor' : 'Déficit actual'}
              </p>
            </div>

            {/* Métrica 5: Talleres */}
            <div
              onClick={() => onNavigateTab('academic')}
              className="bg-white rounded-2xl border border-[#E8E1D5] p-4 shadow-2xs hover:border-cyan-300 transition-all cursor-pointer group col-span-2 sm:col-span-1"
            >
              <div className="flex items-center justify-between text-xs text-[#7A7164]">
                <span>Talleres</span>
                <BookOpen className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-black text-[#26211B] mt-1.5">
                {filteredClasses.length}
              </div>
              <p className="text-[11px] text-[#8C8477] mt-0.5">
                Salones y horarios
              </p>
            </div>
          </div>

          {/* MÓDULOS DE GESTIÓN (Cuadrícula limpia de 4 módulos principales) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#2A241C]">
                Módulos de Gestión Institucional
              </h2>
              <span className="text-xs text-[#807769]">
                Semillas del Reino • Acceso directo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="modules-grid">
              {/* MÓDULO 1: ALUMNOS Y MATRÍCULAS */}
              <div
                id="module-card-students"
                className="bg-white rounded-2xl border-2 border-[#E8E1D5] hover:border-rose-400 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
                      Alumnos y Matrículas
                    </span>
                    <span className="text-xs font-semibold text-[#82796B]">
                      {filteredStudents.length} matriculados
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#2A251E] group-hover:text-rose-900 transition-colors">
                      Directorio y Fichas de Alumnos
                    </h3>
                    <p className="text-xs text-[#71685B] mt-1 leading-relaxed">
                      Expedientes completos, datos de apoderados, condición médica o neurodivergencia, tiempo de permanencia y control de mensualidades.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F2ECE3] flex items-center justify-between">
                  <button
                    onClick={onOpenNewStudent}
                    className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
                  >
                    + Matricular
                  </button>

                  <button
                    onClick={() => onNavigateTab('students')}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <span>Ingresar a Alumnos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* MÓDULO 2: AULAS Y HORARIOS */}
              <div
                id="module-card-academic"
                className="bg-white rounded-2xl border-2 border-[#E8E1D5] hover:border-cyan-400 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
                      Aulas y Horarios
                    </span>
                    <span className="text-xs font-semibold text-[#82796B]">
                      {filteredClasses.length} talleres
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#2A251E] group-hover:text-cyan-900 transition-colors">
                      Talleres, Salones y Horarios
                    </h3>
                    <p className="text-xs text-[#71685B] mt-1 leading-relaxed">
                      Control de salones por programa: Estimulación Temprana, Prekínder, Refuerzo y Guardería. Aforo de salones y profesores asignados.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F2ECE3] flex items-center justify-between">
                  {onOpenScheduleModal && (
                    <button
                      onClick={() => onOpenScheduleModal(null)}
                      className="text-xs font-bold text-cyan-700 hover:underline cursor-pointer"
                    >
                      + Horario
                    </button>
                  )}

                  <button
                    onClick={() => onNavigateTab('academic')}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-cyan-700 hover:bg-cyan-800 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs ml-auto"
                  >
                    <span>Ingresar a Aulas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* MÓDULO 3: CAJA Y COBRANZAS */}
              <div
                id="module-card-payments"
                className="bg-white rounded-2xl border-2 border-[#E8E1D5] hover:border-emerald-400 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
                      Caja y Cobranzas
                    </span>
                    <span className="text-xs font-semibold text-[#82796B]">
                      {debtAlerts.length} pendientes
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Wallet className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#2A251E] group-hover:text-emerald-900 transition-colors">
                      Tesorería y Recibos Oficiales
                    </h3>
                    <p className="text-xs text-[#71685B] mt-1 leading-relaxed">
                      Cobro de mensualidades y matrículas, emisión de <strong>recibos con sello oficial de caja</strong>, descarga de imagen PNG, impresión y WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F2ECE3] flex items-center justify-between">
                  <button
                    onClick={() => onOpenPayment()}
                    className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    + Registrar Pago
                  </button>

                  <button
                    onClick={() => onNavigateTab('payments')}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <span>Ingresar a Caja</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* MÓDULO 4: GASTOS Y PLANILLA DOCENTE (NUEVO) */}
              <div
                id="module-card-expenses"
                className="bg-white rounded-2xl border-2 border-[#E8E1D5] hover:border-amber-400 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
                      Gastos y Planilla
                    </span>
                    <span className="text-xs font-semibold text-rose-800">
                      {formatSoles(totalExpenses)}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Receipt className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#2A251E] group-hover:text-amber-900 transition-colors">
                      Alquiler y Pago a Profesoras
                    </h3>
                    <p className="text-xs text-[#71685B] mt-1 leading-relaxed">
                      Control de alquiler de locales (Mi Perú / Ventanilla), honorarios de las <strong>{teacherCount} profesoras y personal</strong>, vales de caja y reporte contable.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F2ECE3] flex items-center justify-between gap-2">
                  {onOpenStaffModal ? (
                    <button
                      onClick={onOpenStaffModal}
                      className="text-xs font-bold text-amber-900 hover:text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
                      title="Agregar o quitar profesoras"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-rose-600" />
                      <span>{teacherCount} Profesoras (Gestionar)</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-amber-800">
                      {teacherCount} Profesoras
                    </span>
                  )}

                  <button
                    onClick={() => onNavigateTab('expenses')}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <span>Ingresar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* MÓDULO 5: DIRECCIÓN Y SEDES */}
              <div
                id="module-card-settings"
                className="bg-white rounded-2xl border-2 border-[#E8E1D5] hover:border-purple-400 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
                      Dirección y Sedes
                    </span>
                    <span className="text-xs font-semibold text-[#82796B]">
                      2 sedes activas
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Settings className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#2A251E] group-hover:text-purple-900 transition-colors">
                      Administración General
                    </h3>
                    <p className="text-xs text-[#71685B] mt-1 leading-relaxed">
                      Sedes Mi Perú y Ventanilla, directorio del equipo docente y configuración de plantillas institucionales para mensajes de WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F2ECE3] flex items-center justify-between">
                  <span className="text-xs text-[#80786C]">Semillas del Reino</span>

                  <button
                    onClick={() => onNavigateTab('settings')}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <span>Ingresar a Dirección</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Banner de inicio limpio para el usuario */}
          {filteredStudents.length === 0 && (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-sm text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Sistema listo para cargar los datos reales
                </span>
                <p className="text-amber-800 text-xs">
                  La base de datos está completamente limpia. Puedes comenzar matriculando a los alumnos de las sedes Mi Perú y Ventanilla y registrar los gastos de alquiler y pagos a las dos profesoras.
                </p>
              </div>
              <button
                onClick={onOpenNewStudent}
                className="self-start sm:self-auto font-bold bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-xl transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                + Matricular Primer Alumno
              </button>
            </div>
          )}
        </div>

        {/* =========================================================================
            COLUMNA LATERAL (4/3 columnas): "LO QUE HAY PARA HOY O SEMANA AL COSTADO"
           ========================================================================= */}
        <div className="xl:col-span-4 2xl:col-span-3 space-y-5" id="dashboard-side-agenda">
          <div className="bg-white rounded-3xl border border-[#E8E1D5] p-5 shadow-2xs space-y-4">
            {/* Header del widget lateral */}
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#26211A] leading-tight">
                    Para Hoy y la Semana
                  </h3>
                  <p className="text-[11px] text-[#7E7567]">
                    Agenda de clases y citas
                  </p>
                </div>
              </div>

              {/* Selector de vista: Hoy vs Semana */}
              <div className="bg-[#FAF7F2] p-0.5 rounded-xl border border-[#EBE4DA] flex text-[11px] font-bold">
                <button
                  onClick={() => setSideAgendaView('hoy')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    sideAgendaView === 'hoy'
                      ? 'bg-purple-700 text-white shadow-2xs'
                      : 'text-[#696154] hover:text-[#201D18]'
                  }`}
                >
                  Hoy
                </button>
                <button
                  onClick={() => setSideAgendaView('semana')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    sideAgendaView === 'semana'
                      ? 'bg-purple-700 text-white shadow-2xs'
                      : 'text-[#696154] hover:text-[#201D18]'
                  }`}
                >
                  Semana
                </button>
              </div>
            </div>

            {/* SECCIÓN 1: Clases y Talleres programados */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#352F26] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-700" />
                  {sideAgendaView === 'hoy' ? `Talleres de Hoy (${currentDayName})` : 'Talleres de la Semana'}
                </span>
                <span className="text-[10px] bg-purple-50 text-purple-800 font-bold px-2 py-0.5 rounded-full border border-purple-100">
                  {displayedSideClasses.length} grupo(s)
                </span>
              </div>

              {displayedSideClasses.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFE8DE] text-center text-xs text-[#857C6F]">
                  <p>No hay talleres programados para hoy {currentDayName}.</p>
                  <button
                    onClick={() => onNavigateTab('agenda')}
                    className="text-purple-700 font-bold hover:underline mt-1 block mx-auto text-[11px]"
                  >
                    Ver calendario completo →
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {displayedSideClasses.map((cls) => {
                    const enrolledCount = cls.enrolledStudentIds?.length || 0;
                    return (
                      <div
                        key={cls.id}
                        className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EBE4DA] hover:border-purple-300 transition-colors text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#2A241C] truncate max-w-[170px]">
                            {cls.subProgramName || cls.program}
                          </span>
                          <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                            {cls.startTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#71685B]">
                          <span>{cls.teacherName}</span>
                          <span className="capitalize">{cls.sede === 'mi_peru' ? 'Mi Perú' : 'Ventanilla'}</span>
                        </div>
                        <div className="text-[10px] text-[#8C8375] flex items-center justify-between pt-1 border-t border-[#F0E9DF]">
                          <span>{cls.room}</span>
                          <span>
                            {enrolledCount}/{cls.maxCapacity} cupos
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECCIÓN 2: Citas de Evaluación Gratuita */}
            <div className="space-y-2 pt-2 border-t border-[#F0EAE1]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#352F26] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  Citas y Clases Modelo
                </span>
                <button
                  onClick={onOpenEvaluation}
                  className="text-[10px] font-bold text-rose-700 hover:underline cursor-pointer"
                >
                  + Agendar Cita
                </button>
              </div>

              {pendingEvals.length === 0 ? (
                <div className="p-3 rounded-xl bg-rose-50/40 border border-rose-100 text-xs text-[#7A7165]">
                  <p className="text-[11px]">No hay citas de evaluación pendientes.</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {pendingEvals.slice(0, 3).map((ev) => {
                    const waUrl = generateWhatsAppUrl(
                      ev.guardianPhone,
                      `Hola ${ev.guardianName}, le saludamos de Semillas del Reino para confirmar la cita de ${ev.childName}.`
                    );
                    return (
                      <div
                        key={ev.id}
                        className="p-2 rounded-xl bg-white border border-[#E8E1D5] text-xs flex items-center justify-between gap-2"
                      >
                        <div className="truncate">
                          <span className="font-bold text-[#2A241C] block truncate">
                            {ev.childName} ({ev.ageText})
                          </span>
                          <span className="text-[10px] text-[#7A7165]">
                            {ev.date} • {ev.time}
                          </span>
                        </div>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors shrink-0"
                          title="Contactar apoderado por WhatsApp"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECCIÓN 3: Cumpleaños del Mes */}
            {birthdays.length > 0 && (
              <div className="p-3 rounded-2xl bg-pink-50/70 border border-pink-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-pink-900">
                  <Cake className="w-3.5 h-3.5 text-pink-700" />
                  <span>Próximos Cumpleaños</span>
                </div>
                <div className="space-y-1 pt-1">
                  {birthdays.slice(0, 2).map(({ student, daysRemaining }) => (
                    <div key={student.id} className="flex items-center justify-between text-[11px] text-pink-950">
                      <span className="font-medium truncate max-w-[160px]">{student.fullName}</span>
                      <span className="text-[10px] font-bold text-pink-800">
                        {daysRemaining === 0 ? '¡HOY!' : `en ${daysRemaining} d`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acceso a la agenda completa */}
            <div className="pt-2 border-t border-[#F0EAE1]">
              <button
                onClick={() => onNavigateTab('agenda')}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Ver Agenda y Calendario Completo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
