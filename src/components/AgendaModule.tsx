import React, { useState } from 'react';
import {
  ScheduleClass,
  Student,
  FreeEvaluationAppointment,
  PaymentRecord,
  SedeId,
} from '../types';
import { NavTab } from './Navigation';
import { DoorBanner } from './DoorBanner';
import {
  Calendar,
  Clock,
  User,
  Users,
  MapPin,
  Sparkles,
  DollarSign,
  Cake,
  Plus,
  Edit2,
  ChevronRight,
  Phone,
  Filter,
} from 'lucide-react';
import { generateWhatsAppUrl, getUpcomingBirthdays } from '../utils/dateUtils';

interface AgendaModuleProps {
  classes: ScheduleClass[];
  students: Student[];
  evaluations: FreeEvaluationAppointment[];
  payments: PaymentRecord[];
  selectedSede: SedeId | 'todas';
  onOpenScheduleModal: (schedule?: ScheduleClass | null) => void;
  onOpenEvaluation: () => void;
  onOpenPayment: (student?: Student | null) => void;
  onSelectStudent: (student: Student) => void;
  onBackToHall: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

const DAYS_OF_WEEK = [
  'Todos',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export const AgendaModule: React.FC<AgendaModuleProps> = ({
  classes,
  students,
  evaluations,
  selectedSede,
  onOpenScheduleModal,
  onOpenEvaluation,
  onOpenPayment,
  onBackToHall,
  onNavigateTab,
}) => {
  const [calendarView, setCalendarView] = useState<'hoy' | 'semana'>('hoy');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('Todos');

  // Spanish day detection
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const currentDayIndex = new Date().getDay();
  const currentDayName = dayNames[currentDayIndex];

  // Filter classes by sede
  const filteredClasses = classes.filter((cls) => {
    if (selectedSede === 'todas') return true;
    return cls.sede === selectedSede;
  });

  // Filter by calendar view & day
  const displayedClasses = filteredClasses.filter((cls) => {
    if (calendarView === 'hoy') {
      return cls.dayOfWeek === currentDayName || cls.dayOfWeek === 'Lunes';
    }
    if (selectedDayFilter === 'Todos') return true;
    return cls.dayOfWeek === selectedDayFilter;
  });

  // Filter pending appointments & debt alerts
  const pendingEvals = evaluations.filter((e) => e.status === 'programada');
  const debtAlerts = students.filter(
    (s) => s.paymentStatus === 'pendiente' || s.paymentStatus === 'vencido'
  );
  const birthdays = getUpcomingBirthdays(students);

  const currentSedeName =
    selectedSede === 'todas'
      ? 'Todas las Sedes (Mi Perú & Ventanilla)'
      : selectedSede === 'mi_peru'
      ? 'Sede Principal: Mi Perú'
      : 'Sede Ventanilla: Deporte';

  return (
    <div className="space-y-6 pb-20" id="agenda-module">
      {/* Banner de Puerta 1 */}
      <DoorBanner
        doorNumber={1}
        title="Recepción, Calendario y Agenda del Día"
        subtitle="Consulta y gestiona los horarios de clases, grupos activos, citas de evaluación y recordatorios diarios."
        onBackToHall={onBackToHall}
        onNavigateTab={onNavigateTab}
      />

      {/* Cabecera de Agenda y Filtros */}
      <div className="bg-white rounded-2xl border border-[#ECE5DB] p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F2ECE3] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {currentDayName}, {new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#26211B] mt-1">
              Programación de Clases y Talleres
            </h2>
            <p className="text-xs text-[#7A7164] mt-0.5">
              📍 {currentSedeName} • {displayedClasses.length} grupo(s) en lista
            </p>
          </div>

          {/* Botones de alternar Hoy vs Toda la Semana y + Horario */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-[#F7F3EC] p-1 rounded-xl border border-[#E8E1D5]">
              <button
                id="calendar-toggle-today"
                onClick={() => setCalendarView('hoy')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  calendarView === 'hoy'
                    ? 'bg-white text-rose-700 shadow-2xs'
                    : 'text-[#6D6558] hover:text-[#2E2820]'
                }`}
              >
                📅 Hoy ({currentDayName})
              </button>
              <button
                id="calendar-toggle-week"
                onClick={() => setCalendarView('semana')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  calendarView === 'semana'
                    ? 'bg-white text-rose-700 shadow-2xs'
                    : 'text-[#6D6558] hover:text-[#2E2820]'
                }`}
              >
                🗓️ Toda la Semana
              </button>
            </div>

            <button
              onClick={() => onOpenScheduleModal(null)}
              id="btn-agenda-add-schedule"
              className="flex items-center gap-1 text-xs font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="Crear un nuevo horario institucional"
            >
              <Plus className="w-4 h-4 text-teal-700" />
              <span>+ Nuevo Horario</span>
            </button>
          </div>
        </div>

        {/* Filtro por día si está en vista semanal */}
        {calendarView === 'semana' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-[#7D7569] flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Día:
            </span>
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDayFilter(day)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedDayFilter === day
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-[#FAF7F2] text-[#696155] hover:bg-[#F2EDE4]'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        )}

        {/* Lista de Clases y Horarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedClasses.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E3DCCF]">
              <Calendar className="w-10 h-10 text-[#B3A99B] mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-[#4B443A]">
                No hay clases registradas para este filtro
              </p>
              <p className="text-xs text-[#82786A] mt-1">
                Haz clic en "+ Nuevo Horario" para programar una clase.
              </p>
              <button
                onClick={() => onOpenScheduleModal(null)}
                className="mt-3 text-xs font-bold text-teal-800 bg-white border border-teal-200 px-3 py-1.5 rounded-xl hover:bg-teal-50 cursor-pointer"
              >
                + Registrar primer horario
              </button>
            </div>
          ) : (
            displayedClasses.map((cls) => {
              const enrolledIds = cls.enrolledStudentIds || [];
              const enrolledStudents = students.filter((s) =>
                enrolledIds.includes(s.id)
              );
              const maxCap = cls.maxCapacity || 8;
              const isFull = enrolledStudents.length >= maxCap;

              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl border border-[#ECE5DB] p-4.5 hover:border-rose-300 transition-all shadow-2xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold bg-[#FAF6F0] text-[#71685B] border border-[#EAE3D7] px-2.5 py-0.5 rounded-md">
                        {cls.dayOfWeek}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isFull
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {enrolledStudents.length}/{maxCap} cupos
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#2A251E] leading-snug">
                        {cls.subProgramName}
                      </h3>
                      <p className="text-xs text-[#7A7164] mt-0.5 font-medium capitalize">
                        Programa: {cls.program}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-[#F4EFE7] text-xs text-[#635B4E]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="font-semibold text-[#28231C]">
                          {cls.startTime} - {cls.endTime}
                        </span>
                        <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded font-medium">
                          {cls.startTime < '12:00' ? 'Mañana' : 'Tarde'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Prof. {cls.teacherName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                        <span>{cls.room || 'Aula Principal'}</span>
                      </div>
                    </div>

                    {/* Alumnos inscritos */}
                    {enrolledStudents.length > 0 && (
                      <div className="pt-2">
                        <p className="text-[11px] font-bold text-[#82786B] uppercase tracking-wider mb-1">
                          Alumnos inscritos:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {enrolledStudents.slice(0, 3).map((st) => (
                            <span
                              key={st.id}
                              className="text-[10px] font-medium bg-[#F7F3EC] text-[#554E44] px-1.5 py-0.5 rounded"
                            >
                              {st.fullName.split(' ')[0]}
                            </span>
                          ))}
                          {enrolledStudents.length > 3 && (
                            <span className="text-[10px] font-bold text-rose-700 px-1">
                              +{enrolledStudents.length - 3} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Acciones de la clase */}
                  <div className="pt-3 border-t border-[#F2ECE3] flex items-center justify-between">
                    <button
                      onClick={() => onOpenScheduleModal(cls)}
                      className="text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      title="Editar este horario"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => onNavigateTab('academic')}
                      className="text-xs font-bold text-rose-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Ver salón</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Compromisos y Alertas del Día (Citas, Cobranzas, Cumpleaños) */}
      <div className="bg-white rounded-2xl border border-[#ECE5DB] p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="border-b border-[#F2ECE3] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-[#26211B] flex items-center gap-2">
              <span>📌 Novedades y Compromisos de Recepción</span>
            </h3>
            <p className="text-xs text-[#7A7164]">
              {pendingEvals.length} citas programadas • {debtAlerts.length} cuotas por cobrar • {birthdays.length} cumpleaños
            </p>
          </div>
          <button
            onClick={onOpenEvaluation}
            className="text-xs font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
          >
            + Agendar Cita
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Clases modelo */}
          <div className="bg-[#FCFBF9] rounded-xl border border-[#EFE9DF] p-4 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#EDE6DC] pb-2 font-bold text-purple-800">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Clases Modelo ({pendingEvals.length})
              </span>
              <button
                onClick={onOpenEvaluation}
                className="text-[11px] font-semibold hover:underline cursor-pointer"
              >
                + Agendar
              </button>
            </div>
            {pendingEvals.length === 0 ? (
              <p className="text-[#8C8375] italic py-2">No hay citas pendientes.</p>
            ) : (
              pendingEvals.map((ev) => {
                const waMsg = `Hola ${ev.guardianName}, confirmamos la cita para ${ev.childName} en Semillas del Reino hoy a las ${ev.time}.`;
                return (
                  <div key={ev.id} className="p-2.5 rounded-lg bg-white border border-purple-100 space-y-1">
                    <div className="flex justify-between font-semibold text-[#29231D]">
                      <span>{ev.childName} ({ev.ageText})</span>
                      <span className="text-purple-700">{ev.time}</span>
                    </div>
                    <p className="text-[#786F62] text-[11px]">Interés: {ev.programInterest}</p>
                    <a
                      href={generateWhatsAppUrl(ev.guardianPhone, waMsg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 pt-1"
                    >
                      <Phone className="w-3 h-3" /> Recordar por WhatsApp
                    </a>
                  </div>
                );
              })
            )}
          </div>

          {/* 2. Cuotas por cobrar */}
          <div className="bg-[#FCFBF9] rounded-xl border border-[#EFE9DF] p-4 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#EDE6DC] pb-2 font-bold text-rose-700">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Cuotas Pendientes ({debtAlerts.length})
              </span>
              <button
                onClick={() => onNavigateTab('payments')}
                className="text-[11px] font-semibold hover:underline cursor-pointer"
              >
                Ver Caja →
              </button>
            </div>
            {debtAlerts.length === 0 ? (
              <p className="text-emerald-700 font-medium py-2">¡Todas las cuotas están al día!</p>
            ) : (
              debtAlerts.slice(0, 3).map((st) => (
                <div key={st.id} className="p-2.5 rounded-lg bg-white border border-rose-100 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#29231D] block">{st.fullName}</span>
                    <span className="text-[11px] text-rose-800">S/ {st.monthlyFee} • Vence: {st.nextDueDate}</span>
                  </div>
                  <button
                    onClick={() => onOpenPayment(st)}
                    className="text-[10px] font-bold bg-rose-600 text-white px-2.5 py-1 rounded-lg hover:bg-rose-700 cursor-pointer"
                  >
                    Cobrar
                  </button>
                </div>
              ))
            )}
          </div>

          {/* 3. Cumpleaños del mes */}
          <div className="bg-[#FCFBF9] rounded-xl border border-[#EFE9DF] p-4 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#EDE6DC] pb-2 font-bold text-pink-700">
              <span className="flex items-center gap-1.5">
                <Cake className="w-3.5 h-3.5" /> Cumpleaños del Mes ({birthdays.length})
              </span>
            </div>
            {birthdays.length === 0 ? (
              <p className="text-[#8C8375] italic py-2">No hay cumpleaños próximos este mes.</p>
            ) : (
              birthdays.slice(0, 3).map(({ student, daysRemaining }) => (
                <div key={student.id} className="p-2.5 rounded-lg bg-white border border-pink-100 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#29231D] block">{student.fullName}</span>
                    <span className="text-[11px] text-[#7A7165]">
                      {daysRemaining === 0 ? '¡Hoy cumple años! 🎉' : `En ${daysRemaining} días`}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-pink-700">{student.birthDate.slice(5)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
