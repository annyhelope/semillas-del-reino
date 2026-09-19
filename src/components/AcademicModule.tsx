import React, { useState } from 'react';
import { Student, ScheduleClass, SedeId, ProgramId } from '../types';
import { calculateAge, generateWhatsAppUrl } from '../utils/dateUtils';
import { DoorBanner } from './DoorBanner';
import { NavTab } from './Navigation';
import { 
  Baby, 
  BookOpen, 
  GraduationCap, 
  Home, 
  Clock, 
  Calendar, 
  MapPin, 
  Users, 
  UserCheck, 
  Sparkles,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';

interface AcademicModuleProps {
  students: Student[];
  classes: ScheduleClass[];
  selectedSede: SedeId | 'todas';
  onSelectStudent: (student: Student) => void;
  onOpenNewSchedule?: () => void;
  onEditSchedule?: (schedule: ScheduleClass) => void;
  onDeleteSchedule?: (scheduleId: string) => void;
  onBackToHall?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const AcademicModule: React.FC<AcademicModuleProps> = ({
  students,
  classes,
  selectedSede,
  onSelectStudent,
  onOpenNewSchedule,
  onEditSchedule,
  onDeleteSchedule,
  onBackToHall,
  onNavigateTab,
}) => {
  const [activeService, setActiveService] = useState<ProgramId>('estimulacion');
  const [activeTurnoFilter, setActiveTurnoFilter] = useState<'todos' | 'Mañana' | 'Tarde'>('todos');
  const [attendanceState, setAttendanceState] = useState<Record<string, 'presente' | 'falta' | 'tardanza'>>({});

  // Filter students by program & sede & turno
  const filteredStudents = students.filter((s) => {
    if (s.program !== activeService) return false;
    if (selectedSede !== 'todas' && s.sede !== selectedSede) return false;
    if (activeTurnoFilter !== 'todos' && s.turno !== activeTurnoFilter) return false;
    return true;
  });

  const filteredClasses = classes.filter((c) => {
    if (c.program !== activeService) return false;
    if (selectedSede !== 'todas' && c.sede !== selectedSede) return false;
    return true;
  });

  const services = [
    {
      id: 'estimulacion' as ProgramId,
      name: 'Estimulación Temprana',
      subtext: 'Gateadores (6-12m) y Caminantes (1-2a)',
      icon: Baby,
      color: 'bg-rose-50 border-rose-200 text-rose-800',
      activeColor: 'bg-rose-600 text-white shadow-sm',
    },
    {
      id: 'prekinder' as ProgramId,
      name: 'Prekínder',
      subtext: 'Desarrollo integral (3 a 5 años)',
      icon: BookOpen,
      color: 'bg-amber-50 border-amber-200 text-amber-800',
      activeColor: 'bg-amber-600 text-white shadow-sm',
    },
    {
      id: 'refuerzo' as ProgramId,
      name: 'Refuerzo Académico',
      subtext: 'Inicial, Primaria y Secundaria (TEA / TDA / TDAH)',
      icon: GraduationCap,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      activeColor: 'bg-blue-700 text-white shadow-sm',
    },
    {
      id: 'guarderia' as ProgramId,
      name: 'Guardería Infantil',
      subtext: 'Medio tiempo y Tiempo completo',
      icon: Home,
      color: 'bg-teal-50 border-teal-200 text-teal-800',
      activeColor: 'bg-teal-700 text-white shadow-sm',
    },
  ];

  const handleToggleAttendance = (studentId: string, status: 'presente' | 'falta' | 'tardanza') => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? 'presente' : status,
    }));
  };

  return (
    <div className="space-y-6 pb-12" id="academic-module">
      {/* Banner de Puerta 3 */}
      {onBackToHall && onNavigateTab && (
        <DoorBanner
          doorNumber={3}
          title="Aulas, Talleres y Horarios Académicos"
          subtitle="Organización por programas (Estimulación, Prekínder, Refuerzo y Guardería), turnos, docentes y aforos."
          onBackToHall={onBackToHall}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2A251E]">
            Módulo Académico, Programas y Horarios
          </h1>
          <p className="text-xs sm:text-sm text-[#736A5E] mt-0.5">
            Organización por talleres, turnos (Mañana/Tarde), cupos y atención especializada en aula.
          </p>
        </div>

        {onOpenNewSchedule && (
          <button
            onClick={onOpenNewSchedule}
            id="btn-add-schedule-academic"
            className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Horario / Aula</span>
          </button>
        )}
      </div>

      {/* Botonera de Servicios (4 Interactive Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {services.map((srv) => {
          const Icon = srv.icon;
          const isActive = activeService === srv.id;
          const enrolledCount = students.filter((s) => s.program === srv.id).length;

          return (
            <button
              key={srv.id}
              id={`service-btn-${srv.id}`}
              onClick={() => setActiveService(srv.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? `${srv.activeColor} border-transparent scale-[1.01]`
                  : 'bg-white hover:bg-[#FAF7F2] border-[#ECE5DA] text-[#332D24]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#FAF5ED] text-[#40382D]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/25 text-white' : 'bg-[#EAE4D9] text-[#4A4237]'
                    }`}
                  >
                    {enrolledCount} {enrolledCount === 1 ? 'alumno' : 'alumnos'}
                  </span>
                </div>
                <h3 className="font-bold text-sm sm:text-base leading-snug">{srv.name}</h3>
                <p
                  className={`text-xs mt-1 line-clamp-2 ${
                    isActive ? 'text-white/90' : 'text-[#7A7266]'
                  }`}
                >
                  {srv.subtext}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sub-Filters: Turno Mañana / Tarde & Sede notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#ECE5DA] shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#453D32]">Filtrar Turno:</span>
          <div className="flex items-center gap-1">
            {(['todos', 'Mañana', 'Tarde'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTurnoFilter(t)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTurnoFilter === t
                    ? 'bg-[#2E2820] text-white'
                    : 'bg-[#F4EFE7] text-[#554D41] hover:bg-[#EAE2D5]'
                }`}
              >
                {t === 'todos' ? 'Todos los turnos' : `Turno ${t}`}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-[#70685D] flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-rose-600" />
          <span>
            Visualizando:{' '}
            <strong>
              {selectedSede === 'todas'
                ? 'Ambas Sedes (Mi Perú y Ventanilla)'
                : selectedSede === 'mi_peru'
                ? 'Sede Principal (Mi Perú)'
                : 'Sede Ventanilla (Deporte)'}
            </strong>
          </span>
        </div>
      </div>

      {/* Main Content Grid: Classes / Timetables & Enrolled Students List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Enrolled Students in this Program (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#2A251E] flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-600" />
              Alumnos Inscritos en {services.find((s) => s.id === activeService)?.name} ({filteredStudents.length})
            </h2>
            <span className="text-xs text-[#7A7266]">Asistencia Rápida hoy</span>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-[#ECE5DA] text-center text-[#8C8477]">
              <p className="text-sm font-medium">No hay alumnos inscritos en este programa para la sede seleccionada.</p>
              <p className="text-xs mt-1">Puedes matricular alumnos nuevos desde el botón "+ Registrar Nuevo Alumno".</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map((student) => {
                const age = calculateAge(student.birthDate);
                const isSpecial = (student.specialConditions || []).some((c) => c !== 'Ninguna');
                const attendance = attendanceState[student.id] || 'presente';

                const waMsg = `Hola ${student.guardianName}, le escribimos desde Semillas del Reino sobre la clase de ${student.fullName}.`;
                const waUrl = generateWhatsAppUrl(student.guardianPhone, waMsg);

                return (
                  <div
                    key={student.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSpecial
                        ? 'bg-blue-50/40 border-blue-200/80 hover:bg-blue-50/60'
                        : 'bg-white border-[#ECE5DA] hover:border-rose-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            student.avatarColor || 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => onSelectStudent(student)}
                              className="font-bold text-sm text-[#27231D] hover:text-rose-700 text-left transition-colors cursor-pointer"
                            >
                              {student.fullName}
                            </button>
                            <span className="text-xs font-semibold text-rose-700">
                              👶 {age.text}
                            </span>
                            <span className="text-[11px] bg-[#EDE7DD] text-[#554E42] px-2 py-0.5 rounded font-mono">
                              DNI: {student.dni}
                            </span>
                          </div>

                          {/* Pedagogical Attention Tag for TEA / TDA / TDAH */}
                          {isSpecial && (
                            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                              {(student.specialConditions || [])
                                .filter((c) => c !== 'Ninguna')
                                .map((cond) => (
                                  <span
                                    key={cond}
                                    className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    Atención {cond}
                                  </span>
                                ))}
                              {student.medicalNotes && (
                                <span className="text-[11px] text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded italic">
                                  {student.medicalNotes}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Specific subgroup details */}
                          <div className="text-xs text-[#70685D] mt-1 flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-[#2E2821]">
                              {student.subProgram.replace('_', ' ').toUpperCase()}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#8A8173]" />
                              {student.assignedDays} ({student.assignedTime})
                            </span>
                            <span>•</span>
                            <span>{student.sede === 'mi_peru' ? '📍 Mi Perú' : '📍 Ventanilla'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: WhatsApp */}
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 p-1.5 hover:bg-emerald-50 rounded-lg transition-colors shrink-0"
                        title="WhatsApp apoderado"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>

                    {/* Attendance Bar for Teachers */}
                    <div className="mt-3 pt-2.5 border-t border-[#EFE9DF] flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#7A7265] font-medium flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Control Asistencia de Hoy:
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleAttendance(student.id, 'presente')}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                            attendance === 'presente'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          ✓ Presente
                        </button>
                        <button
                          onClick={() => handleToggleAttendance(student.id, 'tardanza')}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                            attendance === 'tardanza'
                              ? 'bg-amber-600 text-white'
                              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                          }`}
                        >
                          Tardanza
                        </button>
                        <button
                          onClick={() => handleToggleAttendance(student.id, 'falta')}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                            attendance === 'falta'
                              ? 'bg-rose-600 text-white'
                              : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                          }`}
                        >
                          Falta
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Horarios y Cupos por Aula (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#2A251E] flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-700" />
              Salones, Horarios y Cupos ({filteredClasses.length})
            </h2>

            {onOpenNewSchedule && (
              <button
                onClick={onOpenNewSchedule}
                className="text-xs font-bold text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Agregar Horario</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredClasses.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-[#ECE5DA] text-center text-[#8C8375] space-y-2">
                <Clock className="w-8 h-8 mx-auto text-[#CCC3B5]" />
                <p className="text-xs italic">No hay horarios registrados para este programa o sede.</p>
                {onOpenNewSchedule && (
                  <button
                    onClick={onOpenNewSchedule}
                    className="text-xs font-bold text-teal-800 hover:underline cursor-pointer"
                  >
                    + Crear el primer horario aquí
                  </button>
                )}
              </div>
            ) : (
              filteredClasses.map((cls) => {
                const enrolled = (cls.enrolledStudentIds || []).length;
                const percent = Math.round((enrolled / (cls.maxCapacity || 1)) * 100);

                return (
                  <div
                    key={cls.id}
                    className="bg-white p-4 rounded-2xl border border-[#ECE5DA] shadow-2xs space-y-3 hover:border-teal-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-[#FAF5ED] text-[#4A4237] px-2 py-0.5 rounded border border-[#E2DBD0]">
                            {cls.dayOfWeek}
                          </span>
                          <span className="text-[10px] bg-rose-50 text-rose-800 px-1.5 py-0.5 rounded font-semibold">
                            {cls.sede === 'mi_peru' ? 'Mi Perú' : 'Ventanilla'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#27231D] mt-1">
                          {cls.subProgramName}
                        </h4>
                        <p className="text-xs text-rose-700 font-semibold mt-0.5">
                          {cls.startTime} - {cls.endTime}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {onEditSchedule && (
                          <button
                            onClick={() => onEditSchedule(cls)}
                            className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar Horario y Aula"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteSchedule && (
                          <button
                            onClick={() => {
                              if (confirm(`¿Estás seguro de eliminar el horario ${cls.subProgramName} (${cls.dayOfWeek})?`)) {
                                onDeleteSchedule(cls.id);
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar Horario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-xs font-bold text-[#2E2820]">
                        {enrolled} / {cls.maxCapacity} alumnos
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        {cls.maxCapacity - enrolled} cupos libres
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-[#EFE9DE] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          percent >= 90 ? 'bg-rose-500' : percent >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {/* Enrolled students chips */}
                    {(cls.enrolledStudentIds || []).length > 0 && (
                      <div className="pt-2 border-t border-[#F4EFE7] flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-[#8C8375] font-medium">Inscritos:</span>
                        {cls.enrolledStudentIds.map((stId) => {
                          const st = students.find((s) => s.id === stId);
                          if (!st) return null;
                          return (
                            <button
                              key={st.id}
                              onClick={() => onSelectStudent(st)}
                              className="text-[10px] bg-[#FAF7F2] hover:bg-rose-50 hover:text-rose-800 text-[#40382D] border border-[#E5DFD4] hover:border-rose-300 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                            >
                              {st.fullName.split(' ')[0]}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="text-xs text-[#70685D] pt-1 border-t border-[#F2ECE3] flex justify-between items-center">
                      <span>Docente: <strong>{cls.teacherName}</strong></span>
                      <span>{cls.room}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Info Box */}
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 text-xs text-[#5D4E37] space-y-1.5">
            <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              Política Pedagógica Semillas del Reino
            </h4>
            <p>
              • En Estimulación Temprana los grupos se dividen estrictamente en <strong>Gateadores</strong> (6-12m) y <strong>Caminantes</strong> (1-2 años) con aforo máximo de 8 bebés para estimulación personalizada.
            </p>
            <p>
              • En Refuerzo Académico, las observaciones de <strong>TEA / TDAH</strong> notifican al docente para preparar material sensorial de baja sobrecarga auditiva.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
