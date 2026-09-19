import React, { useState, useEffect } from 'react';
import { ScheduleClass, ProgramId, SedeId, Student } from '../../types';
import { X, Clock, Calendar, Users, MapPin, Sparkles, Trash2, Check } from 'lucide-react';

interface ScheduleClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: ScheduleClass) => void;
  onDelete?: (scheduleId: string) => void;
  initialSchedule?: ScheduleClass | null;
  students: Student[];
  defaultSede?: SedeId | 'todas';
}

const DAYS_OF_WEEK: ('Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado')[] = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

const PROGRAM_OPTIONS: { id: ProgramId; label: string; defaultSubs: string[] }[] = [
  {
    id: 'estimulacion',
    label: 'Estimulación Temprana',
    defaultSubs: ['Gateadores (6 a 12 meses)', 'Caminantes (1 a 2 años)', 'Estimulación Sensorial Mixta'],
  },
  {
    id: 'prekinder',
    label: 'Prekínder',
    defaultSubs: ['Iniciación 2 a 3 años', 'Prekínder 3 a 4 años', 'Kínder 4 a 5 años'],
  },
  {
    id: 'refuerzo',
    label: 'Refuerzo Académico',
    defaultSubs: ['Refuerzo Inicial (4-5a)', 'Refuerzo Primaria Lectoescritura', 'Refuerzo Matemáticas Primaria', 'Atención Especial TEA / TDAH'],
  },
  {
    id: 'guarderia',
    label: 'Guardería Infantil',
    defaultSubs: ['Guardería Medio Tiempo (Mañana)', 'Guardería Medio Tiempo (Tarde)', 'Guardería Tiempo Completo'],
  },
];

export const ScheduleClassModal: React.FC<ScheduleClassModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialSchedule,
  students,
  defaultSede = 'todas',
}) => {
  const [program, setProgram] = useState<ProgramId>('estimulacion');
  const [subProgramName, setSubProgramName] = useState('Gateadores (6 a 12 meses)');
  const [sede, setSede] = useState<SedeId>(
    defaultSede && defaultSede !== 'todas' ? defaultSede : 'mi_peru'
  );
  const [dayOfWeek, setDayOfWeek] = useState<
    'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado'
  >('Lunes');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [teacherName, setTeacherName] = useState('Lic. María Elena Gómez');
  const [room, setRoom] = useState('Salón Sensorial A');
  const [maxCapacity, setMaxCapacity] = useState<number>(8);
  const [enrolledStudentIds, setEnrolledStudentIds] = useState<string[]>([]);
  const [studentFilter, setStudentFilter] = useState('');

  useEffect(() => {
    if (initialSchedule) {
      setProgram(initialSchedule.program);
      setSubProgramName(initialSchedule.subProgramName);
      setSede(initialSchedule.sede);
      setDayOfWeek(initialSchedule.dayOfWeek);
      setStartTime(initialSchedule.startTime);
      setEndTime(initialSchedule.endTime);
      setTeacherName(initialSchedule.teacherName);
      setRoom(initialSchedule.room);
      setMaxCapacity(initialSchedule.maxCapacity);
      setEnrolledStudentIds(initialSchedule.enrolledStudentIds || []);
    } else {
      // Reset defaults
      setProgram('estimulacion');
      setSubProgramName('Gateadores (6 a 12 meses)');
      setSede(defaultSede && defaultSede !== 'todas' ? defaultSede : 'mi_peru');
      setDayOfWeek('Lunes');
      setStartTime('09:00');
      setEndTime('10:30');
      setTeacherName('Lic. Rosario Paredes');
      setRoom('Salón Sensorial A');
      setMaxCapacity(8);
      setEnrolledStudentIds([]);
    }
  }, [initialSchedule, isOpen, defaultSede]);

  if (!isOpen) return null;

  const currentProgramConfig = PROGRAM_OPTIONS.find((p) => p.id === program);

  // Available students who match sede
  const eligibleStudents = students.filter((s) => {
    if (sede && s.sede !== sede) return false;
    if (studentFilter.trim()) {
      const q = studentFilter.toLowerCase();
      return s.fullName.toLowerCase().includes(q) || s.dni.includes(q);
    }
    return true;
  });

  const toggleStudentEnrollment = (id: string) => {
    setEnrolledStudentIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((stId) => stId !== id);
      } else {
        if (prev.length >= maxCapacity) {
          alert(`El aforo máximo configurado para este horario es de ${maxCapacity} alumnos.`);
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subProgramName.trim()) {
      alert('Por favor indica el nombre o nivel del grupo.');
      return;
    }

    if (!teacherName.trim()) {
      alert('Por favor indica el nombre del docente a cargo.');
      return;
    }

    const savedSchedule: ScheduleClass = {
      id: initialSchedule?.id || `cls-${Date.now()}`,
      program,
      subProgramName: subProgramName.trim(),
      sede,
      dayOfWeek,
      startTime,
      endTime,
      teacherName: teacherName.trim(),
      room: room.trim() || 'Aula General',
      maxCapacity: Number(maxCapacity) || 8,
      enrolledStudentIds,
    };

    onSave(savedSchedule);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
      id="schedule-class-modal"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-[#ECE5DA] w-full max-w-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#FAF7F2] p-5 border-b border-[#EFE8DF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2A2620]">
                {initialSchedule ? 'Editar Horario y Aula' : 'Crear Nuevo Horario'}
              </h2>
              <p className="text-xs text-[#787064]">
                Programación pedagógica, docentes a cargo y asignación de cupos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#999184] hover:text-[#332E27] p-1.5 rounded-lg hover:bg-[#EFE9DE] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Sede y Programa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#3B342A] mb-1.5">Sede Institucional</label>
              <select
                value={sede}
                onChange={(e) => setSede(e.target.value as SedeId)}
                className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-rose-500 focus:bg-white"
              >
                <option value="mi_peru">📍 Sede Mi Perú (Calle Túpac Amaru / Principal)</option>
                <option value="ventanilla">📍 Sede Ventanilla (Av. Pedro Beltrán / Deporte)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#3B342A] mb-1.5">Programa</label>
              <select
                value={program}
                onChange={(e) => {
                  const newProg = e.target.value as ProgramId;
                  setProgram(newProg);
                  const conf = PROGRAM_OPTIONS.find((p) => p.id === newProg);
                  if (conf && conf.defaultSubs[0]) {
                    setSubProgramName(conf.defaultSubs[0]);
                  }
                }}
                className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-rose-500 focus:bg-white"
              >
                {PROGRAM_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nombre del Grupo / Subprograma */}
          <div>
            <label className="block font-bold text-[#3B342A] mb-1.5">
              Nivel / Nombre del Taller o Salón
            </label>
            <input
              type="text"
              value={subProgramName}
              onChange={(e) => setSubProgramName(e.target.value)}
              placeholder="Ej: Gateadores (6 a 12 meses) - Grupo Mañana"
              className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-rose-500 focus:bg-white"
              required
            />
            {currentProgramConfig && (
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-[10px] text-[#8C8375]">Sugerencias:</span>
                {currentProgramConfig.defaultSubs.map((sub) => (
                  <button
                    type="button"
                    key={sub}
                    onClick={() => setSubProgramName(sub)}
                    className="text-[10px] bg-[#FAF3EA] text-[#635747] hover:bg-rose-100 hover:text-rose-800 px-2 py-0.5 rounded-md border border-[#E8DFC9] transition-colors cursor-pointer"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Día de la Semana y Horas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#3B342A] mb-1.5">Día</label>
              <select
                value={dayOfWeek}
                onChange={(e) =>
                  setDayOfWeek(
                    e.target.value as
                      | 'Lunes'
                      | 'Martes'
                      | 'Miércoles'
                      | 'Jueves'
                      | 'Viernes'
                      | 'Sábado'
                  )
                }
                className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-rose-500 focus:bg-white"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#3B342A] mb-1.5">Hora Inicio</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-rose-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-[#3B342A] mb-1.5">Hora Fin</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-rose-500 focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Docente, Aula y Aforo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#3B342A] mb-1.5">Docente a Cargo</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="Ej: Lic. Rosario Paredes"
                className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-rose-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-[#3B342A] mb-1.5">Aula / Espacio</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Ej: Salón Sensorial A"
                className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-rose-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-[#3B342A] mb-1.5">Aforo Máximo (Cupos)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-rose-500 focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Alumnos Asignados al Horario */}
          <div className="pt-2 border-t border-[#EFE8DE] space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#3B342A]">
                Alumnos Inscritos en este Horario ({enrolledStudentIds.length} / {maxCapacity})
              </label>
              <span className="text-[11px] text-[#877E71]">
                {maxCapacity - enrolledStudentIds.length} cupos disponibles
              </span>
            </div>

            <input
              type="text"
              placeholder="Filtrar por nombre o DNI..."
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3 py-1.5 text-xs focus:bg-white"
            />

            <div className="max-h-40 overflow-y-auto border border-[#E9E2D6] rounded-xl p-2 bg-[#FCFBF8] space-y-1">
              {eligibleStudents.length === 0 ? (
                <p className="text-center text-[#999083] py-3 text-[11px] italic">
                  No hay alumnos disponibles para la sede seleccionada.
                </p>
              ) : (
                eligibleStudents.map((st) => {
                  const isEnrolled = enrolledStudentIds.includes(st.id);
                  return (
                    <div
                      key={st.id}
                      onClick={() => toggleStudentEnrollment(st.id)}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isEnrolled
                          ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold'
                          : 'bg-white border-[#EAE3D8] text-[#3D372E] hover:bg-[#F8F5EE]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isEnrolled
                              ? 'bg-teal-700 border-teal-700 text-white'
                              : 'border-[#CCC3B5] bg-white'
                          }`}
                        >
                          {isEnrolled && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <span>{st.fullName}</span>
                          <span className="text-[10px] text-[#7E7568] ml-2">
                            ({st.program} • DNI {st.dni})
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#8A8275]">
                        {st.sede === 'mi_peru' ? 'Mi Perú' : 'Ventanilla'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-[#EFE8DF] flex items-center justify-between">
            {initialSchedule && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`¿Estás seguro de eliminar el horario de ${initialSchedule.subProgramName}?`)) {
                    onDelete(initialSchedule.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Horario</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#5A5247] hover:bg-[#EFE8DE] rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{initialSchedule ? 'Guardar Cambios' : 'Crear Horario'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
