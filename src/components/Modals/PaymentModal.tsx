import React, { useState, useEffect } from 'react';
import { Student, PaymentRecord, PaymentMethod, PaymentAgreement } from '../../types';
import { formatSoles } from '../../utils/dateUtils';
import { DollarSign, X, Check, Search, Calendar, CreditCard, User, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  preselectedStudent?: Student | null;
  onRegisterPayment: (payment: PaymentRecord, updatedStudentStatus?: 'al_dia', agreement?: PaymentAgreement) => void;
  onSuccessOpenReceipt: (payment: PaymentRecord) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  students = [],
  preselectedStudent,
  onRegisterPayment,
  onSuccessOpenReceipt,
}) => {
  const safeStudents = Array.isArray(students) ? students : [];
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [amount, setAmount] = useState<number>(160);
  const [concept, setConcept] = useState('Mensualidad Septiembre 2026');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Yape');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receivedBy, setReceivedBy] = useState('Marina Castillo (Recepción)');
  const [notes, setNotes] = useState('');

  // Agreement (Facilidad de pago)
  const [isAgreement, setIsAgreement] = useState(false);
  const [agreementWeeks, setAgreementWeeks] = useState(2);
  const [agreementNote, setAgreementNote] = useState('Pago fraccionado');

  useEffect(() => {
    if (preselectedStudent) {
      setSelectedStudentId(preselectedStudent.id);
      setAmount(preselectedStudent.monthlyFee);
      setStudentSearch(preselectedStudent.fullName);
    } else if (safeStudents.length > 0) {
      setSelectedStudentId(safeStudents[0].id);
      setAmount(safeStudents[0].monthlyFee);
      setStudentSearch(safeStudents[0].fullName);
    }
  }, [preselectedStudent, safeStudents, isOpen]);

  const selectedStudent = safeStudents.find((s) => s.id === selectedStudentId);

  const handleStudentChange = (st: Student) => {
    setSelectedStudentId(st.id);
    setStudentSearch(st.fullName);
    setAmount(st.monthlyFee);
  };

  const filteredStudents = safeStudents.filter(
    (s) =>
      s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.dni.includes(studentSearch)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('Por favor selecciona un alumno para registrar el pago.');
      return;
    }

    const parsedAmount = Math.max(0, Number(amount) || 0);

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.fullName || 'Alumno',
      amount: parsedAmount,
      concept: concept || 'Mensualidad Institucional',
      date: date || new Date().toISOString().split('T')[0],
      paymentMethod,
      referenceNumber: referenceNumber.trim() || `OP-${Math.floor(100000 + Math.random() * 900000)}`,
      receivedBy: receivedBy || 'Recepción y Caja',
      notes: notes.trim(),
    };

    let agreement: PaymentAgreement | undefined = undefined;
    if (isAgreement) {
      const installmentAmount = Math.round(parsedAmount / (agreementWeeks || 2));
      agreement = {
        id: `agr-${Date.now()}`,
        studentId: selectedStudent.id,
        description: `Acuerdo: Fraccionado a ${agreementWeeks} cuotas. ${agreementNote}`,
        agreedAmount: parsedAmount,
        installments: Array.from({ length: agreementWeeks }).map((_, i) => ({
          week: i + 1,
          amount: installmentAmount,
          dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          paid: i === 0, // First installment considered paid now
        })),
        status: 'en_curso',
        createdAt: date,
      };
    }

    onRegisterPayment(newPayment, 'al_dia', agreement);
    onSuccessOpenReceipt(newPayment);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs overflow-y-auto" id="payment-modal">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#ECE5DA] w-full max-w-xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#FAF7F2] p-5 border-b border-[#EFE8DF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2A2620]">Registrar Pago / Cuota</h2>
              <p className="text-xs text-[#787064]">
                Control de Caja y Emisión de Recibo • Semillas del Reino
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {safeStudents.length === 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Aún no hay alumnos matriculados</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Para poder registrar un pago y emitir un recibo con el nombre del alumno, primero matricula a un estudiante.
                </p>
              </div>
            </div>
          )}

          {/* Student Picker */}
          <div>
            <label className="text-xs font-semibold text-[#3D372E] block mb-1">
              Seleccionar Alumno *
            </label>
            <div className="relative">
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Escribe el nombre o DNI del alumno..."
                className="w-full px-3 py-2 pl-9 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] focus:bg-white text-sm text-[#2C2721] outline-none font-medium"
              />
              <Search className="w-4 h-4 text-[#8C8477] absolute left-3 top-2.5" />
            </div>

            {/* Quick dropdown options if filtering */}
            {studentSearch && !selectedStudent?.fullName.toLowerCase().includes(studentSearch.toLowerCase()) && (
              <div className="mt-1 max-h-36 overflow-y-auto border border-[#E0D8CB] rounded-xl bg-white shadow-md p-1 space-y-1">
                {filteredStudents.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleStudentChange(st)}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-[#FAF7F2] flex items-center justify-between"
                  >
                    <span className="font-semibold text-[#2F2922]">{st.fullName}</span>
                    <span className="text-[#7A7266] font-mono">DNI: {st.dni}</span>
                  </button>
                ))}
              </div>
            )}

            {selectedStudent && (
              <div className="mt-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE5DA] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#2A251F] block">{selectedStudent.fullName}</span>
                  <span className="text-[#7C7468]">
                    DNI: {selectedStudent.dni} • Sede {selectedStudent.sede === 'mi_peru' ? 'Mi Perú' : 'Ventanilla'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#7C7468] block">Mensualidad habitual:</span>
                  <span className="font-bold text-emerald-700">{formatSoles(selectedStudent.monthlyFee)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Concept & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                Concepto del Pago *
              </label>
              <select
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-sm text-[#2C2721] outline-none font-medium"
              >
                <option value="Mensualidad Septiembre 2026">Mensualidad Septiembre 2026</option>
                <option value="Mensualidad Octubre 2026">Mensualidad Octubre 2026</option>
                <option value="Matrícula General S/100">Matrícula General</option>
                <option value="Matrícula Promo Mi Perú S/30">Matrícula Promo Mi Perú S/30</option>
                <option value="Matrícula Promo Especial S/20">Matrícula Promo Especial S/20</option>
                <option value="Materiales Didácticos / Talleres">Materiales Didácticos</option>
                <option value="Clase Modelo / Cuota Única">Clase Modelo / Taller Extra</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                Importe a Cobrar (S/.) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-bold text-emerald-700">S/</span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] focus:bg-white text-base font-bold text-[#2C2721] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Method and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                Método de Pago *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-sm text-[#2C2721] outline-none font-medium"
              >
                <option value="Yape">🟣 Yape</option>
                <option value="Plin">🔵 Plin</option>
                <option value="Efectivo">💵 Efectivo en Caja</option>
                <option value="Transferencia BCP">🏦 Transferencia BCP</option>
                <option value="Transferencia BBVA">🏦 Transferencia BBVA</option>
                <option value="Interbank">🏦 Interbank</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                Fecha de Pago *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-sm text-[#2C2721] outline-none"
              />
            </div>
          </div>

          {/* Reference Number & Receiver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                N° de Operación / Voucher (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. OP-482910 o N° Recibo"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-sm text-[#2C2721] outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                Atendido / Recibido por
              </label>
              <input
                type="text"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-sm text-[#2C2721] outline-none"
              />
            </div>
          </div>

          {/* Facilidad de pago / Fraccionamiento */}
          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#ECE5DA] space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-agreement"
                checked={isAgreement}
                onChange={(e) => setIsAgreement(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded cursor-pointer"
              />
              <label htmlFor="is-agreement" className="text-xs font-bold text-[#3B342A] cursor-pointer">
                Registrar Acuerdo / Facilidad de Pago Fraccionado
              </label>
            </div>

            {isAgreement && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div>
                  <label className="text-[11px] text-[#7A7266] block mb-1">Fraccionar en:</label>
                  <select
                    value={agreementWeeks}
                    onChange={(e) => setAgreementWeeks(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCD5C9] bg-white"
                  >
                    <option value={2}>2 semanas (2 partes de {formatSoles(amount / 2)})</option>
                    <option value={3}>3 semanas (3 partes de {formatSoles(amount / 3)})</option>
                    <option value={4}>4 semanas (4 partes de {formatSoles(amount / 4)})</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#7A7266] block mb-1">Nota del acuerdo:</label>
                  <input
                    type="text"
                    value={agreementNote}
                    onChange={(e) => setAgreementNote(e.target.value)}
                    placeholder="Ej. Pago primera parte hoy, saldo fin de mes"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCD5C9] bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-[#3D372E] block mb-1">
              Notas Adicionales (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Apoderado abonó por Yape al número de recepción"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-xs text-[#2C2721] outline-none"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-[#EFE8DF] flex items-center justify-between">
            <span className="text-xs text-[#7A7266]">
              Se actualizará el semáforo a 🟢 Al día y se emitirá el recibo.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold bg-[#EBE5DB] hover:bg-[#DDD6CB] text-[#3D372E] rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar y Emitir Recibo</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
