import React, { useState } from 'react';
import { Student, SedeId, ProgramId, PaymentStatus } from '../types';
import { calculateAge, calculateTimeInCenter, formatSoles, generateWhatsAppUrl } from '../utils/dateUtils';
import { DoorBanner } from './DoorBanner';
import { NavTab } from './Navigation';
import { 
  UserPlus, 
  Search, 
  Filter, 
  MessageCircle, 
  DollarSign, 
  MapPin, 
  User, 
  Calendar, 
  Clock, 
  ArrowUpDown,
  FileText,
  Edit2,
  Trash2,
  Sparkles
} from 'lucide-react';

interface StudentsModuleProps {
  students: Student[];
  selectedSede: SedeId | 'todas';
  onOpenNewStudent: () => void;
  onOpenEditStudent: (student: Student) => void;
  onSelectStudent: (student: Student) => void;
  onOpenPayment: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onBackToHall?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const StudentsModule: React.FC<StudentsModuleProps> = ({
  students,
  selectedSede,
  onOpenNewStudent,
  onOpenEditStudent,
  onSelectStudent,
  onOpenPayment,
  onDeleteStudent,
  onBackToHall,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<'todos' | ProgramId>('todos');
  const [selectedStatus, setSelectedStatus] = useState<'todos' | PaymentStatus>('todos');
  const [localSede, setLocalSede] = useState<SedeId | 'todas'>(selectedSede);

  // Sync if parent changes sede
  React.useEffect(() => {
    setLocalSede(selectedSede);
  }, [selectedSede]);

  // Filtering
  const filtered = students.filter((s) => {
    if (localSede !== 'todas' && s.sede !== localSede) return false;
    if (selectedProgram !== 'todos' && s.program !== selectedProgram) return false;
    if (selectedStatus !== 'todos' && s.paymentStatus !== selectedStatus) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchDni = s.dni.includes(q);
      const matchGuardian = s.guardianName.toLowerCase().includes(q);
      const matchPhone = s.guardianPhone.includes(q);
      if (!matchName && !matchDni && !matchGuardian && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12" id="students-module">
      {/* Banner de Puerta 2 */}
      {onBackToHall && onNavigateTab && (
        <DoorBanner
          doorNumber={2}
          title="Secretaría y Directorio de Alumnos"
          subtitle="Fichas institucionales, cálculo de edad en meses y años, necesidades especiales y registro de matrículas."
          onBackToHall={onBackToHall}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#2A251E]">
              Módulo de Alumnos y Expedientes
            </h1>
            <span className="text-xs font-semibold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
              {filtered.length} registrados
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#736A5E] mt-0.5">
            Registro detallado de menores, cálculo automático de edad, apoderados y asignación de sede.
          </p>
        </div>

        <button
          onClick={onOpenNewStudent}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Registrar Nuevo Alumno</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#ECE5DA] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search by Name / DNI */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por DNI o Nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-9 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] focus:bg-white text-xs text-[#2C2721] outline-none"
            />
            <Search className="w-4 h-4 text-[#8A8275] absolute left-3 top-2.5" />
          </div>

          {/* Sede Filter */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#8A8275] shrink-0" />
            <select
              value={localSede}
              onChange={(e) => setLocalSede(e.target.value as SedeId | 'todas')}
              className="w-full px-2.5 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-xs font-medium text-[#2C2721] outline-none"
            >
              <option value="todas">📍 Todas las Sedes</option>
              <option value="mi_peru">Sede Mi Perú</option>
              <option value="ventanilla">Sede Ventanilla (Deporte)</option>
            </select>
          </div>

          {/* Program Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-[#8A8275] shrink-0" />
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value as 'todos' | ProgramId)}
              className="w-full px-2.5 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-xs font-medium text-[#2C2721] outline-none"
            >
              <option value="todos">Todos los Programas</option>
              <option value="estimulacion">Estimulación Temprana</option>
              <option value="prekinder">Prekínder</option>
              <option value="refuerzo">Refuerzo Académico</option>
              <option value="guarderia">Guardería</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'todos' | PaymentStatus)}
              className="w-full px-2.5 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-xs font-medium text-[#2C2721] outline-none"
            >
              <option value="todos">Semáforo de Pagos (Todos)</option>
              <option value="al_dia">🟢 Al día</option>
              <option value="proximo">🟡 Próximo a vencer</option>
              <option value="pendiente">🔴 Pendiente / Atrasado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students List Table */}
      <div className="bg-white rounded-2xl border border-[#ECE5DA] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#696155] border-b border-[#ECE5DA] font-semibold">
              <tr>
                <th className="py-3.5 px-4">Alumno y DNI</th>
                <th className="py-3.5 px-3">Edad y Grupo</th>
                <th className="py-3.5 px-3">Sede y Turno</th>
                <th className="py-3.5 px-3">Apoderado (Contacto)</th>
                <th className="py-3.5 px-3">Tiempo en Centro</th>
                <th className="py-3.5 px-3">Estado Cuota</th>
                <th className="py-3.5 px-4 text-right">Acciones Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE0]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C8477]">
                    <p className="text-sm font-medium">No se encontraron alumnos con los filtros seleccionados.</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedProgram('todos');
                        setSelectedStatus('todos');
                        setLocalSede('todas');
                      }}
                      className="mt-2 text-xs text-rose-700 font-semibold hover:underline"
                    >
                      Limpiar todos los filtros
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((student) => {
                  const age = calculateAge(student.birthDate);
                  const timeInCenter = calculateTimeInCenter(student.registrationDate);

                  const statusBadge =
                    student.paymentStatus === 'al_dia'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : student.paymentStatus === 'proximo'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200';

                  const statusText =
                    student.paymentStatus === 'al_dia'
                      ? '🟢 Al día'
                      : student.paymentStatus === 'proximo'
                      ? '🟡 Por vencer'
                      : '🔴 Pendiente';

                  const waMsg = `Estimada ${student.guardianName}, le saludamos de Semillas del Reino para coordinar sobre ${student.fullName}.`;
                  const waUrl = generateWhatsAppUrl(student.guardianPhone, waMsg);

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-[#FFFDFB] transition-colors"
                      id={`student-row-${student.id}`}
                    >
                      {/* Alumno y DNI */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              student.avatarColor || 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <button
                              onClick={() => onSelectStudent(student)}
                              className="font-bold text-[#2A251E] hover:text-rose-700 text-left transition-colors cursor-pointer text-xs sm:text-sm"
                            >
                              {student.fullName}
                            </button>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-mono text-[#787063]">
                                DNI: {student.dni}
                              </span>
                              {(student.specialConditions || []).some((c) => c !== 'Ninguna') && (
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                  {(student.specialConditions || []).filter((c) => c !== 'Ninguna').join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Edad y Grupo */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-rose-700 block">{age.text}</span>
                        <span className="text-[11px] text-[#7A7165] capitalize">
                          {student.program} ({student.subProgram})
                        </span>
                      </td>

                      {/* Sede y Turno */}
                      <td className="py-3.5 px-3">
                        <span className="font-medium text-[#2A251E] block">
                          {student.sede === 'mi_peru' ? '📍 Mi Perú' : '📍 Ventanilla'}
                        </span>
                        <span className="text-[11px] text-[#7A7165]">
                          Turno {student.turno} • {student.assignedDays}
                        </span>
                      </td>

                      {/* Apoderado */}
                      <td className="py-3.5 px-3">
                        <span className="font-medium text-[#2A251E] block">
                          {student.guardianName} ({student.guardianRelation})
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[11px] text-emerald-800 font-semibold">
                            {student.guardianPhone}
                          </span>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-800"
                            title="Abrir WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Permanencia */}
                      <td className="py-3.5 px-3">
                        <span className="text-[#3F3930] font-medium block">{timeInCenter}</span>
                        <span className="text-[10px] text-[#8C8477]">Desde: {student.registrationDate}</span>
                      </td>

                      {/* Semáforo */}
                      <td className="py-3.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded border text-[11px] font-bold ${statusBadge}`}>
                          {statusText}
                        </span>
                        <span className="text-[10px] text-[#7C7467] block mt-0.5">
                          {formatSoles(student.monthlyFee)}/mes
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectStudent(student)}
                            className="p-1.5 text-[#5F574C] hover:text-[#231F19] hover:bg-[#F2ECE3] rounded-lg transition-colors cursor-pointer"
                            title="Ver Ficha Institucional Completa"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onOpenPayment(student)}
                            className="p-1.5 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                            title="Registrar Pago"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onOpenEditStudent(student)}
                            className="p-1.5 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                            title="Editar Datos"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`¿Estás seguro de eliminar el registro de ${student.fullName}?`)) {
                                onDeleteStudent(student.id);
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar Alumno"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
