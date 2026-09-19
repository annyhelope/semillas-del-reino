import React, { useState } from 'react';
import { Student, PaymentRecord, SedeId, PaymentStatus, Sede } from '../types';
import { formatSoles, generateWhatsAppUrl } from '../utils/dateUtils';
import { DoorBanner } from './DoorBanner';
import { NavTab } from './Navigation';
import { 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Search, 
  MessageCircle, 
  PlusCircle, 
  Calendar,
  FileCheck,
  CreditCard,
  Building2
} from 'lucide-react';

interface PaymentsModuleProps {
  students: Student[];
  payments: PaymentRecord[];
  selectedSede: SedeId | 'todas';
  sedes: Sede[];
  onOpenPaymentModal: (student?: Student) => void;
  onOpenReceipt: (payment: PaymentRecord, student?: Student) => void;
  onSelectStudent: (student: Student) => void;
  onBackToHall?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const PaymentsModule: React.FC<PaymentsModuleProps> = ({
  students,
  payments,
  selectedSede,
  sedes,
  onOpenPaymentModal,
  onOpenReceipt,
  onSelectStudent,
  onBackToHall,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'semaforo' | 'historial' | 'acuerdos' | 'matriculas'>('semaforo');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | PaymentStatus>('todos');

  // Filter students & payments by selected Sede
  const filteredStudents = selectedSede === 'todas'
    ? students
    : students.filter((s) => s.sede === selectedSede);

  const filteredPayments = selectedSede === 'todas'
    ? payments
    : payments.filter((p) => {
        const st = students.find((s) => s.id === p.studentId);
        return st ? st.sede === selectedSede : true;
      });

  // Calculate Metrics
  const totalCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  const pendingStudents = filteredStudents.filter((s) => s.paymentStatus === 'pendiente');
  const proximoStudents = filteredStudents.filter((s) => s.paymentStatus === 'proximo');
  const alDiaStudents = filteredStudents.filter((s) => s.paymentStatus === 'al_dia');

  const totalPendingAmount = pendingStudents.reduce((sum, s) => sum + s.monthlyFee, 0);
  const totalProximoAmount = proximoStudents.reduce((sum, s) => sum + s.monthlyFee, 0);

  // Filtered by user search
  const displayedStudents = filteredStudents.filter((s) => {
    if (filterStatus !== 'todos' && s.paymentStatus !== filterStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.dni.includes(q) ||
        s.guardianName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Active agreements
  const activeAgreements = filteredStudents.filter((s) => !!s.activeAgreement);

  return (
    <div className="space-y-6 pb-12" id="payments-module">
      {/* Banner de Puerta 4 */}
      {onBackToHall && onNavigateTab && (
        <DoorBanner
          doorNumber={4}
          title="Tesorería, Caja y Recaudación"
          subtitle="Cobro de cuotas, recaudación del mes, emisión de recibos oficiales con sello de caja y semáforo financiero."
          onBackToHall={onBackToHall}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2A251E] flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-700" />
            Módulo de Caja y Control de Cuotas
          </h1>
          <p className="text-xs sm:text-sm text-[#736A5E] mt-0.5">
            Semáforo de mensualidades, tarifas de matrícula, emisión de comprobantes y facilidades de pago.
          </p>
        </div>

        <button
          id="btn-register-payment-payments"
          onClick={() => onOpenPaymentModal()}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <DollarSign className="w-4 h-4" />
          <span>+ Registrar Cobro / Emitir Recibo</span>
        </button>
      </div>

      {/* Financial Summary Cards (Clean Bento) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recaudado */}
        <div className="bg-white p-5 rounded-2xl border border-[#ECE5DA] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#7A7266]">
            <span className="text-xs font-semibold uppercase tracking-wider">Recaudado Este Mes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-800 font-sans">{formatSoles(totalCollected)}</p>
          <span className="text-[11px] text-[#857D71] block">
            {filteredPayments.length} comprobantes emitidos
          </span>
        </div>

        {/* Al Día */}
        <div className="bg-white p-5 rounded-2xl border border-[#ECE5DA] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#7A7266]">
            <span className="text-xs font-semibold uppercase tracking-wider">🟢 Al Día</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ✓
            </div>
          </div>
          <p className="text-2xl font-black text-[#2A251E] font-sans">
            {alDiaStudents.length} <span className="text-xs font-normal text-[#8A8174]">alumnos</span>
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold block">
            {Math.round((alDiaStudents.length / (filteredStudents.length || 1)) * 100)}% de cumplimiento
          </span>
        </div>

        {/* Próximo a Vencer */}
        <div className="bg-white p-5 rounded-2xl border border-[#ECE5DA] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#7A7266]">
            <span className="text-xs font-semibold uppercase tracking-wider">🟡 Próximo a Vencer</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-800 font-sans">
            {proximoStudents.length} <span className="text-xs font-normal text-[#8A8174]">alumnos</span>
          </p>
          <span className="text-[11px] text-amber-700 font-medium block">
            Por vencer: {formatSoles(totalProximoAmount)}
          </span>
        </div>

        {/* Pendientes / Atrasados */}
        <div className="bg-white p-5 rounded-2xl border border-[#ECE5DA] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#7A7266]">
            <span className="text-xs font-semibold uppercase tracking-wider">🔴 Pendientes</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-800 font-sans">
            {pendingStudents.length} <span className="text-xs font-normal text-[#8A8174]">alumnos</span>
          </p>
          <span className="text-[11px] text-rose-700 font-bold block">
            Saldo por cobrar: {formatSoles(totalPendingAmount)}
          </span>
        </div>
      </div>

      {/* Tabs Selector: Semáforo / Historial de Pagos / Facilidades / Matrículas */}
      <div className="flex items-center gap-2 border-b border-[#ECE5DA] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('semaforo')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'semaforo'
              ? 'bg-[#2E2820] text-white shadow-2xs'
              : 'text-[#6A6256] hover:bg-[#F2ECE3]'
          }`}
        >
          🟢 Semáforo de Mensualidades ({filteredStudents.length})
        </button>

        <button
          onClick={() => setActiveTab('historial')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'historial'
              ? 'bg-[#2E2820] text-white shadow-2xs'
              : 'text-[#6A6256] hover:bg-[#F2ECE3]'
          }`}
        >
          📜 Historial de Pagos ({filteredPayments.length})
        </button>

        <button
          onClick={() => setActiveTab('acuerdos')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'acuerdos'
              ? 'bg-[#2E2820] text-white shadow-2xs'
              : 'text-[#6A6256] hover:bg-[#F2ECE3]'
          }`}
        >
          🤝 Facilidades y Acuerdos ({activeAgreements.length})
        </button>

        <button
          onClick={() => setActiveTab('matriculas')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'matriculas'
              ? 'bg-[#2E2820] text-white shadow-2xs'
              : 'text-[#6A6256] hover:bg-[#F2ECE3]'
          }`}
        >
          🏷️ Control de Matrículas
        </button>
      </div>

      {/* TAB 1: Semáforo de Mensualidades */}
      {activeTab === 'semaforo' && (
        <div className="space-y-4">
          {/* Filter sub-bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#ECE5DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Filtrar por alumno o apoderado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-9 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-xs outline-none"
              />
              <Search className="w-4 h-4 text-[#8C8477] absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['todos', 'pendiente', 'proximo', 'al_dia'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    filterStatus === st
                      ? 'bg-rose-600 text-white'
                      : 'bg-[#F2ECE3] text-[#554D41] hover:bg-[#EAE2D5]'
                  }`}
                >
                  {st === 'todos'
                    ? 'Todos los estados'
                    : st === 'al_dia'
                    ? '🟢 Al día'
                    : st === 'proximo'
                    ? '🟡 Próximo'
                    : '🔴 Pendiente'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-[#ECE5DA] shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#696155] border-b border-[#ECE5DA] font-semibold">
                <tr>
                  <th className="py-3 px-4">Alumno y DNI</th>
                  <th className="py-3 px-3">Programa / Sede</th>
                  <th className="py-3 px-3">Cuota Mensual</th>
                  <th className="py-3 px-3">Próximo Vencimiento</th>
                  <th className="py-3 px-3">Semáforo</th>
                  <th className="py-3 px-4 text-right">Cobranza y WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE0]">
                {displayedStudents.map((student) => {
                  const isPendiente = student.paymentStatus === 'pendiente';
                  const isProximo = student.paymentStatus === 'proximo';

                  const badgeClass = isPendiente
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : isProximo
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                  const badgeText = isPendiente
                    ? '🔴 Pendiente'
                    : isProximo
                    ? '🟡 Próximo'
                    : '🟢 Al día';

                  const waMsg = `Estimada ${student.guardianName}, le saludamos de Semillas del Reino. Nos comunicamos sobre la cuota de ${student.fullName} (${formatSoles(student.monthlyFee)}).`;
                  const waUrl = generateWhatsAppUrl(student.guardianPhone, waMsg);

                  return (
                    <tr key={student.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onSelectStudent(student)}
                          className="font-bold text-[#2A251E] hover:text-rose-700 text-left transition-colors cursor-pointer block"
                        >
                          {student.fullName}
                        </button>
                        <span className="text-[11px] text-[#7A7165]">
                          Apoderado: {student.guardianName} ({student.guardianPhone})
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-medium text-[#2A251E] capitalize block">
                          {student.program}
                        </span>
                        <span className="text-[11px] text-[#7A7165]">
                          {student.sede === 'mi_peru' ? '📍 Mi Perú' : '📍 Ventanilla'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-base text-[#2A251E]">
                        {formatSoles(student.monthlyFee)}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-medium text-[#2A251E] block">{student.nextDueDate}</span>
                        <span className="text-[10px] text-[#8C8477]">
                          Último pago: {student.lastPaymentDate || 'No registra'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded border text-[11px] font-bold ${badgeClass}`}>
                          {badgeText}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Enviar recordatorio por WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => onOpenPaymentModal(student)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer shadow-2xs"
                          >
                            Registrar Pago
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Historial de Pagos y Comprobantes */}
      {activeTab === 'historial' && (
        <div className="bg-white rounded-2xl border border-[#ECE5DA] shadow-xs overflow-hidden">
          <div className="p-4 bg-[#FAF7F2] border-b border-[#ECE5DA] flex justify-between items-center">
            <span className="text-xs font-bold text-[#3E382E] uppercase tracking-wider">
              Comprobantes Emitidos ({filteredPayments.length})
            </span>
            <span className="text-xs text-[#7A7266]">Clic en "Imprimir Recibo" para ver el ticket institucional</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#696155] border-b border-[#ECE5DA] font-semibold">
              <tr>
                <th className="py-3 px-4">N° Comprobante / Fecha</th>
                <th className="py-3 px-3">Alumno</th>
                <th className="py-3 px-3">Concepto</th>
                <th className="py-3 px-3">Método de Pago</th>
                <th className="py-3 px-3">Importe</th>
                <th className="py-3 px-3">Atendido Por</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE0]">
              {filteredPayments.map((p) => {
                const st = students.find((s) => s.id === p.studentId);
                const sedeObj = sedes.find((sd) => sd.id === (st?.sede || 'mi_peru'));

                return (
                  <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[#2A251E] block">
                        {p.referenceNumber || p.id}
                      </span>
                      <span className="text-[11px] text-[#7A7165]">{p.date}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-[#2A251E] block">{p.studentName}</span>
                      <span className="text-[11px] text-[#7A7165]">
                        {st?.sede === 'mi_peru' ? 'Mi Perú' : 'Ventanilla'}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-medium text-[#2E2820]">{p.concept}</td>

                    <td className="py-3 px-3">
                      <span className="bg-[#FAF5ED] text-[#4A4237] border border-[#E0D8CB] px-2 py-0.5 rounded font-semibold text-[11px]">
                        {p.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-bold text-sm text-emerald-800">
                      {formatSoles(p.amount)}
                    </td>

                    <td className="py-3 px-3 text-[#70685D]">{p.receivedBy}</td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenReceipt(p, st)}
                        className="flex items-center gap-1 text-xs font-semibold bg-white hover:bg-[#F2ECE3] text-[#3A342B] border border-[#DDD5C9] px-2.5 py-1 rounded-lg transition-colors cursor-pointer ml-auto"
                      >
                        <Printer className="w-3.5 h-3.5 text-rose-600" />
                        <span>Ver Recibo</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Facilidades y Acuerdos de Pago */}
      {activeTab === 'acuerdos' && (
        <div className="space-y-4">
          <div className="bg-[#FFFBF5] border border-amber-200/80 p-4 rounded-2xl">
            <h3 className="text-sm font-bold text-amber-900">
              Registro Institucional de Acuerdos y Fraccionamientos
            </h3>
            <p className="text-xs text-amber-800/90 mt-0.5">
              Permite a los padres que lo soliciten pagar en 2, 3 o 4 partes durante el mes sin perder la vacante del niño.
            </p>
          </div>

          {activeAgreements.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-[#ECE5DA] text-center text-[#8C8477]">
              <p className="text-sm font-medium">No hay acuerdos fraccionados activos actualmente.</p>
              <p className="text-xs mt-1">
                Puedes registrar un fraccionamiento al hacer clic en "Registrar Pago" marcando la casilla de acuerdo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAgreements.map((st) => {
                const agr = st.activeAgreement!;
                return (
                  <div
                    key={agr.id}
                    className="bg-white p-5 rounded-2xl border border-[#ECE5DA] shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#27231D]">{st.fullName}</h4>
                        <span className="text-xs text-[#7A7265]">
                          Apoderado: {st.guardianName} ({st.guardianPhone})
                        </span>
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {agr.status}
                      </span>
                    </div>

                    <p className="text-xs text-amber-900 font-medium bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      {agr.description}
                    </p>

                    <div className="space-y-1.5">
                      {(agr.installments || []).map((inst) => (
                        <div
                          key={inst.week}
                          className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#FAF8F5] border border-[#ECE5DA]"
                        >
                          <span className="font-medium text-[#2E2820]">
                            Cuota #{inst.week}: {formatSoles(inst.amount)} (Vence: {inst.dueDate})
                          </span>
                          <span
                            className={`font-bold ${
                              inst.paid ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {inst.paid ? '✓ Pagada' : 'Pendiente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Control de Matrículas */}
      {activeTab === 'matriculas' && (
        <div className="bg-white rounded-2xl border border-[#ECE5DA] p-6 shadow-xs space-y-4">
          <div className="border-b border-[#ECE5DA] pb-3">
            <h3 className="text-base font-bold text-[#2A251E]">
              Esquema de Tarifas de Matrícula Semillas del Reino
            </h3>
            <p className="text-xs text-[#7A7266] mt-0.5">
              Control de tarifas vigentes aplicadas a cada alumno según su sede y promociones activas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-[#E0D8CB] bg-[#FAF8F5]">
              <span className="text-xs font-bold text-[#6D6559] uppercase block">Tarifa General</span>
              <p className="text-xl font-black text-[#2A251E] mt-1">S/ 100.00</p>
              <p className="text-xs text-[#787063] mt-1">
                Aplica para alumnos fuera de convenio o sedes regulares.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
              <span className="text-xs font-bold text-rose-700 uppercase block">Promo Mi Perú</span>
              <p className="text-xl font-black text-rose-900 mt-1">S/ 30.00</p>
              <p className="text-xs text-[#787063] mt-1">
                Tarifa preferencial para familias del distrito de Mi Perú.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50">
              <span className="text-xs font-bold text-teal-700 uppercase block">Promo Especial</span>
              <p className="text-xl font-black text-teal-900 mt-1">S/ 20.00</p>
              <p className="text-xs text-[#787063] mt-1">
                Campaña solidaria / Hermanitos o casos sociales evaluados.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
