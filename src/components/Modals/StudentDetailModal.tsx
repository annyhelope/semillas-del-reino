import React from 'react';
import { Student, PaymentRecord } from '../../types';
import { calculateAge, calculateTimeInCenter, formatSoles, generateWhatsAppUrl } from '../../utils/dateUtils';
import { X, MessageCircle, DollarSign, Calendar, MapPin, Phone, User, Clock, AlertCircle, Printer, FileText, CheckCircle2 } from 'lucide-react';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
  onEdit?: (student: Student) => void;
  onOpenEdit?: (student: Student) => void;
  onOpenPayment: (student: Student) => void;
  paymentRecords?: PaymentRecord[];
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onEdit,
  onOpenEdit,
  onOpenPayment,
  paymentRecords = [],
}) => {
  if (!student) return null;

  const handleEditClick = () => {
    if (onEdit) onEdit(student);
    if (onOpenEdit) onOpenEdit(student);
  };

  const age = calculateAge(student.birthDate);
  const timeInCenter = calculateTimeInCenter(student.registrationDate);
  const studentPayments = (paymentRecords || []).filter((p) => p.studentId === student.id);

  const statusBadge =
    student.paymentStatus === 'al_dia'
      ? { label: '🟢 Al día', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      : student.paymentStatus === 'proximo'
      ? { label: '🟡 Próximo a vencer', bg: 'bg-amber-50 text-amber-700 border-amber-200' }
      : { label: '🔴 Cuota pendiente', bg: 'bg-rose-50 text-rose-700 border-rose-200' };

  const waMsg = `Estimada ${student.guardianName}, le saludamos con cariño desde Semillas del Reino para coordinar sobre ${student.fullName}.`;
  const waUrl = generateWhatsAppUrl(student.guardianPhone, waMsg);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs overflow-y-auto" id="student-detail-modal">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#ECE5DA] w-full max-w-3xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-[#FAF7F2] p-6 border-b border-[#EFE8DF] flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold ${student.avatarColor || 'bg-rose-100 text-rose-700'}`}
            >
              {student.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-[#2A2620]">{student.fullName}</h2>
                <span className="text-xs bg-[#EFE9DE] text-[#696155] px-2.5 py-0.5 rounded-md font-mono">
                  DNI: {student.dni}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-md border font-semibold ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#70685D] mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  {student.sede === 'mi_peru' ? 'Sede Principal (Mi Perú)' : 'Sede Ventanilla (Deporte)'}
                </span>
                <span>•</span>
                <span>Inscrito: {student.registrationDate} ({timeInCenter})</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#999184] hover:text-[#332E27] p-1.5 rounded-lg hover:bg-[#EFE9DE] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Top Quick Actions Bar */}
          <div className="flex items-center gap-3 flex-wrap bg-[#FAF7F2] p-3 rounded-xl border border-[#ECE5DA]">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Apoderado</span>
            </a>

            <button
              onClick={() => onOpenPayment(student)}
              className="flex items-center gap-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>Registrar Pago</span>
            </button>

            <button
              onClick={handleEditClick}
              className="flex items-center gap-2 text-xs font-medium bg-white hover:bg-[#F2ECE3] text-[#403A31] border border-[#DDD6CB] px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-rose-600" />
              <span>Editar Datos</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 text-xs font-medium bg-white hover:bg-[#F2ECE3] text-[#403A31] border border-[#DDD6CB] px-3.5 py-2 rounded-lg transition-colors cursor-pointer ml-auto"
            >
              <Printer className="w-4 h-4 text-[#7C7467]" />
              <span>Imprimir Ficha</span>
            </button>
          </div>

          {/* Grid 2 Columns: Datos del Menor & Datos del Apoderado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Menor */}
            <div className="bg-white p-4 rounded-xl border border-[#EBE4D9] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Datos del Menor
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-[#F5EFE6]">
                  <span className="text-[#7C7467]">Fecha de Nacimiento:</span>
                  <span className="font-medium text-[#2E2922]">{student.birthDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F5EFE6]">
                  <span className="text-[#7C7467]">Edad Calculada:</span>
                  <span className="font-semibold text-rose-700">{age.text}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F5EFE6]">
                  <span className="text-[#7C7467]">Permanencia en Centro:</span>
                  <span className="font-medium text-[#2E2922]">{timeInCenter}</span>
                </div>
                <div>
                  <span className="text-xs text-[#7C7467] block mb-1">Condición / Necesidad Especial:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {(student.specialConditions || []).map((cond, idx) => (
                      <span
                        key={idx}
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          cond === 'TEA'
                            ? 'bg-blue-100 text-blue-800'
                            : cond === 'TDA' || cond === 'TDAH'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {cond === 'Ninguna' ? 'Desarrollo Regular' : `Caso: ${cond}`}
                      </span>
                    ))}
                  </div>
                </div>
                {student.medicalNotes && (
                  <div className="bg-[#FFF9F2] p-2.5 rounded-lg border border-[#F5E2C9] text-xs text-[#7A5B30] mt-2">
                    <span className="font-semibold block mb-0.5">Nota Médica / Pedagógica:</span>
                    {student.medicalNotes}
                  </div>
                )}
              </div>
            </div>

            {/* Box 2: Apoderado */}
            <div className="bg-white p-4 rounded-xl border border-[#EBE4D9] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                Datos del Apoderado
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-[#F5EFE6]">
                  <span className="text-[#7C7467]">Nombre Apoderado:</span>
                  <span className="font-semibold text-[#2E2922]">{student.guardianName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F5EFE6]">
                  <span className="text-[#7C7467]">Parentesco:</span>
                  <span className="font-medium text-[#2E2922]">{student.guardianRelation}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F5EFE6]">
                  <span className="text-[#7C7467]">Teléfono de Contacto:</span>
                  <span className="font-mono font-semibold text-emerald-700">{student.guardianPhone}</span>
                </div>
                {student.guardianEmail && (
                  <div className="flex justify-between py-1 border-b border-[#F5EFE6]">
                    <span className="text-[#7C7467]">Correo:</span>
                    <span className="text-xs text-[#2E2922]">{student.guardianEmail}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Box 3: Asignación Académica y Horarios */}
          <div className="bg-white p-4 rounded-xl border border-[#EBE4D9] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Programa y Horario Asignado
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#EDE6DC]">
                <span className="text-xs text-[#80776A] block">Programa</span>
                <span className="font-semibold text-rose-700 uppercase text-xs tracking-wider">
                  {student.program}
                </span>
                <p className="text-xs font-medium text-[#2E2922] mt-0.5">{student.subProgram}</p>
              </div>

              <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#EDE6DC]">
                <span className="text-xs text-[#80776A] block">Días y Turno</span>
                <span className="font-semibold text-[#2E2922]">{student.assignedDays}</span>
                <p className="text-xs text-[#70685D] mt-0.5">Turno {student.turno}</p>
              </div>

              <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#EDE6DC]">
                <span className="text-xs text-[#80776A] block">Horario Diario</span>
                <span className="font-semibold text-[#2E2922]">{student.assignedTime}</span>
                <p className="text-xs text-teal-700 mt-0.5">
                  {student.sede === 'mi_peru' ? 'Mi Perú' : 'Ventanilla'}
                </p>
              </div>
            </div>
          </div>

          {/* Box 4: Estado de Pagos y Cuotas */}
          <div className="bg-white p-4 rounded-xl border border-[#EBE4D9] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                Control de Caja y Pagos
              </h3>
              <span className="text-xs font-semibold text-[#5A5246]">
                Mensualidad: {formatSoles(student.monthlyFee)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded-lg border border-[#EFE9DF] bg-[#FAF7F2]">
                <span className="text-xs text-[#7C7467] block">Tarifa Matrícula</span>
                <span className="font-semibold text-[#2E2922]">{student.matriculaType}</span>
                <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
                  {student.matriculaPaid ? '✓ Matrícula Pagada' : '⚠️ Pendiente Matrícula'}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-[#EFE9DF] bg-[#FAF7F2]">
                <span className="text-xs text-[#7C7467] block">Próximo Vencimiento</span>
                <span className="font-bold text-[#2E2922]">{student.nextDueDate}</span>
                <span className="text-[11px] text-[#7C7467] block mt-0.5">
                  Último pago: {student.lastPaymentDate || 'No registrado'}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-[#EFE9DF] bg-[#FAF7F2]">
                <span className="text-xs text-[#7C7467] block">Semáforo de Cuota</span>
                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded mt-1 ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              </div>
            </div>

            {/* Active Payment Agreement if present */}
            {student.activeAgreement && (
              <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl text-xs space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    Facilidad de Pago Activa: {student.activeAgreement.description}
                  </span>
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px] font-semibold uppercase">
                    {student.activeAgreement.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(student.activeAgreement.installments || []).map((inst) => (
                    <div
                      key={inst.week}
                      className="bg-white p-2 rounded-md border border-amber-200 flex items-center justify-between"
                    >
                      <span>Semana {inst.week}: {formatSoles(inst.amount)} (Vence: {inst.dueDate})</span>
                      <span className={`font-semibold ${inst.paid ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {inst.paid ? '✓ Pagado' : 'Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Payments list for this student */}
            <div className="mt-3">
              <span className="text-xs font-semibold text-[#665E52] block mb-2">
                Historial de Pagos Realizados ({studentPayments.length})
              </span>
              {studentPayments.length === 0 ? (
                <p className="text-xs text-[#8F877B] italic">No hay pagos registrados aún en este período.</p>
              ) : (
                <div className="space-y-1.5">
                  {(studentPayments || []).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#FAF7F2] border border-[#EFE9DF] text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-medium text-[#2E2922]">{p.concept}</span>
                        <span className="text-[#7C7467]">• {p.date}</span>
                        <span className="bg-white border border-[#E0D9CE] px-1.5 py-0.5 rounded text-[10px] text-[#554E44]">
                          {p.paymentMethod} {p.referenceNumber ? `(${p.referenceNumber})` : ''}
                        </span>
                      </div>
                      <span className="font-bold text-emerald-700">{formatSoles(p.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#FAF7F2] px-6 py-3 border-t border-[#EFE8DF] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-[#EAE3D7] hover:bg-[#DDD4C6] text-[#3D372E] rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
