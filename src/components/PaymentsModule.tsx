import React, { useState } from 'react';
import { 
  Student, 
  PaymentRecord, 
  SedeId, 
  PaymentStatus, 
  Sede, 
  AdditionalIncomeRecord, 
  ExpenseRecord 
} from '../types';
import { formatSoles, generateWhatsAppUrl } from '../utils/dateUtils';
import { DoorBanner } from './DoorBanner';
import { NavTab } from './Navigation';
import { 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
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
  Building2,
  Trash2,
  ShoppingBag,
  Receipt
} from 'lucide-react';

interface PaymentsModuleProps {
  students: Student[];
  payments: PaymentRecord[];
  additionalIncomes?: AdditionalIncomeRecord[];
  expenses?: ExpenseRecord[];
  selectedSede: SedeId | 'todas';
  sedes: Sede[];
  onOpenPaymentModal: (student?: Student) => void;
  onOpenAdditionalModal?: (defaultType?: 'income' | 'expense') => void;
  onOpenReceipt: (payment: PaymentRecord, student?: Student) => void;
  onOpenIncomeReceipt?: (income: AdditionalIncomeRecord) => void;
  onDeletePayment?: (paymentId: string) => void;
  onDeleteAdditionalIncome?: (incomeId: string) => void;
  onDeleteExpense?: (expenseId: string) => void;
  onSelectStudent: (student: Student) => void;
  onBackToHall?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const PaymentsModule: React.FC<PaymentsModuleProps> = ({
  students,
  payments,
  additionalIncomes = [],
  expenses = [],
  selectedSede,
  sedes,
  onOpenPaymentModal,
  onOpenAdditionalModal,
  onOpenReceipt,
  onOpenIncomeReceipt,
  onDeletePayment,
  onDeleteAdditionalIncome,
  onDeleteExpense,
  onSelectStudent,
  onBackToHall,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'semaforo' | 'ingresos_adicionales' | 'gastos_caja' | 'historial' | 'acuerdos' | 'matriculas'>('semaforo');
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

  const filteredAdditionalIncomes = selectedSede === 'todas'
    ? additionalIncomes
    : additionalIncomes.filter((inc) => inc.sede === selectedSede);

  const filteredExpenses = selectedSede === 'todas'
    ? expenses
    : expenses.filter((e) => e.sede === 'ambas' || e.sede === selectedSede);

  // Calculate Metrics
  const totalStudentCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalAdditionalIncome = filteredAdditionalIncomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalGrossIncome = totalStudentCollected + totalAdditionalIncome;
  const totalExpensesAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netCashBalance = totalGrossIncome - totalExpensesAmount;

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

  // Filtered Additional Incomes
  const displayedAdditionalIncomes = filteredAdditionalIncomes.filter((inc) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      inc.concept.toLowerCase().includes(q) ||
      inc.payerName.toLowerCase().includes(q) ||
      (inc.referenceNumber && inc.referenceNumber.toLowerCase().includes(q))
    );
  });

  // Filtered Expenses
  const displayedExpenses = filteredExpenses.filter((exp) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      exp.description.toLowerCase().includes(q) ||
      exp.beneficiaryName.toLowerCase().includes(q) ||
      (exp.receiptNumber && exp.receiptNumber.toLowerCase().includes(q))
    );
  });

  // Active agreements
  const activeAgreements = filteredStudents.filter((s) => !!s.activeAgreement);

  const getIncomeCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'uniformes': return '👕 Uniformes / Polos';
      case 'materiales': return '📚 Materiales / Cuadernos';
      case 'talleres': return '🎨 Talleres Vacacionales';
      case 'alquiler_espacio': return '🏢 Alquiler de Sala';
      case 'eventos': return '🎪 Eventos / Actividades';
      case 'certificados': return '📜 Certificados / Constancias';
      default: return '✨ Otro Ingreso';
    }
  };

  return (
    <div className="space-y-6 pb-12" id="payments-module">
      {/* Banner de Puerta 4 */}
      {onBackToHall && onNavigateTab && (
        <DoorBanner
          doorNumber={4}
          title="Tesorería, Caja y Recaudación"
          subtitle="Cobro de cuotas, ingresos adicionales de uniformes y talleres, registro de gastos de caja y emisión de recibos oficiales."
          onBackToHall={onBackToHall}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* Header and Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2A251E] flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-700" />
            Módulo de Caja, Ingresos y Egresos
          </h1>
          <p className="text-xs sm:text-sm text-[#736A5E] mt-0.5">
            Control de cuotas mensuales, venta de uniformes, talleres, gastos de caja chica y balance neto en tiempo real.
          </p>
        </div>

        {/* Action Buttons: Cobro Alumno, Ingreso Adicional, Gasto de Caja */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-register-payment-payments"
            onClick={() => onOpenPaymentModal()}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
            title="Registrar cobro de mensualidad o matrícula de un alumno"
          >
            <DollarSign className="w-4 h-4" />
            <span>+ Cobro Alumno</span>
          </button>

          {onOpenAdditionalModal && (
            <>
              <button
                id="btn-register-additional-income"
                onClick={() => onOpenAdditionalModal('income')}
                className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
                title="Venta de uniformes, libros, materiales didácticos, talleres vacacionales o alquiler de salas"
              >
                <TrendingUp className="w-4 h-4" />
                <span>+ Ingreso Adicional</span>
              </button>

              <button
                id="btn-register-additional-expense"
                onClick={() => onOpenAdditionalModal('expense')}
                className="flex items-center gap-1.5 bg-rose-700 hover:bg-rose-800 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
                title="Registrar salida de dinero de caja: fotocopias, movilidad, útiles de limpieza, etc."
              >
                <TrendingDown className="w-4 h-4" />
                <span>- Gasto de Caja</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Financial Summary Cards (Bento Neto de Caja) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recaudado Alumnos */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ECE5DA] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#7A7266]">
            <span className="text-xs font-semibold uppercase tracking-wider">Cobranzas Alumnos</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-800 font-sans">{formatSoles(totalStudentCollected)}</p>
          <span className="text-[11px] text-[#857D71] block">
            {filteredPayments.length} recibos de cuotas emitidos
          </span>
        </div>

        {/* Ingresos Adicionales */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ECE5DA] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#7A7266]">
            <span className="text-xs font-semibold uppercase tracking-wider">Ingresos Adicionales</span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-teal-800 font-sans">{formatSoles(totalAdditionalIncome)}</p>
          <span className="text-[11px] text-teal-700 font-semibold block">
            {filteredAdditionalIncomes.length} ventas / talleres registrados
          </span>
        </div>

        {/* Gastos / Salidas de Caja */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ECE5DA] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#7A7266]">
            <span className="text-xs font-semibold uppercase tracking-wider">Salidas / Gastos</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-800 font-sans">{formatSoles(totalExpensesAmount)}</p>
          <span className="text-[11px] text-rose-700 font-medium block">
            {filteredExpenses.length} comprobantes de egreso
          </span>
        </div>

        {/* Saldo / Balance Neto de Caja */}
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-2xs space-y-2 ${
          netCashBalance >= 0 
            ? 'bg-emerald-950 text-white border-emerald-900' 
            : 'bg-rose-950 text-white border-rose-900'
        }`}>
          <div className="flex items-center justify-between text-emerald-200">
            <span className="text-xs font-semibold uppercase tracking-wider">Saldo Neto en Caja</span>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-white">
              S/
            </div>
          </div>
          <p className="text-2xl font-black font-sans">{formatSoles(netCashBalance)}</p>
          <span className="text-[11px] text-emerald-200 block">
            Ingresos Totales: {formatSoles(totalGrossIncome)}
          </span>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-[#ECE5DA] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('semaforo')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'semaforo'
              ? 'bg-[#2E2820] text-white shadow-2xs'
              : 'text-[#6A6256] hover:bg-[#F2ECE3]'
          }`}
        >
          🟢 Semáforo Cuotas ({filteredStudents.length})
        </button>

        <button
          onClick={() => setActiveTab('ingresos_adicionales')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'ingresos_adicionales'
              ? 'bg-teal-800 text-white shadow-2xs'
              : 'text-[#6A6256] hover:bg-[#F2ECE3]'
          }`}
        >
          💰 Ingresos Adicionales ({filteredAdditionalIncomes.length})
        </button>

        <button
          onClick={() => setActiveTab('gastos_caja')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'gastos_caja'
              ? 'bg-rose-800 text-white shadow-2xs'
              : 'text-[#6A6256] hover:bg-[#F2ECE3]'
          }`}
        >
          📤 Gastos de Caja ({filteredExpenses.length})
        </button>

        <button
          onClick={() => setActiveTab('historial')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'historial'
              ? 'bg-[#2E2820] text-white shadow-2xs'
              : 'text-[#6A6256] hover:bg-[#F2ECE3]'
          }`}
        >
          📜 Recibos de Alumnos ({filteredPayments.length})
        </button>

        <button
          onClick={() => setActiveTab('acuerdos')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'acuerdos'
              ? 'bg-[#2E2820] text-white shadow-2xs'
              : 'text-[#6A6256] hover:bg-[#F2ECE3]'
          }`}
        >
          🤝 Facilidades ({activeAgreements.length})
        </button>

        <button
          onClick={() => setActiveTab('matriculas')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'matriculas'
              ? 'bg-[#2E2820] text-white shadow-2xs'
              : 'text-[#6A6256] hover:bg-[#F2ECE3]'
          }`}
        >
          🏷️ Tarifas Matrícula
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

            <div className="flex items-center gap-1 overflow-x-auto">
              {(['todos', 'al_dia', 'proximo', 'pendiente'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    filterStatus === st
                      ? 'bg-[#2E2820] text-white'
                      : 'text-[#6A6256] hover:bg-[#F2ECE3]'
                  }`}
                >
                  {st === 'todos' ? 'Todos' : st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Students list with status indicator */}
          <div className="bg-white rounded-2xl border border-[#ECE5DA] shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#696155] border-b border-[#ECE5DA] font-semibold">
                <tr>
                  <th className="py-3 px-4">Alumno / DNI</th>
                  <th className="py-3 px-3">Sede / Programa</th>
                  <th className="py-3 px-3">Mensualidad</th>
                  <th className="py-3 px-3">Vencimiento</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE0]">
                {displayedStudents.map((student) => {
                  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  let statusText = 'Al Día';

                  if (student.paymentStatus === 'pendiente') {
                    badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
                    statusText = 'Pendiente';
                  } else if (student.paymentStatus === 'proximo') {
                    badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
                    statusText = 'Próximo';
                  }

                  const waUrl = generateWhatsAppUrl(
                    student.guardianPhone,
                    `Hola estimado(a) ${student.guardianName}, le saludamos del Centro Semillas del Reino. Le recordamos cordialmente la mensualidad de ${student.fullName}. ¡Muchas gracias!`
                  );

                  return (
                    <tr key={student.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onSelectStudent(student)}
                          className="font-bold text-[#2A251E] hover:text-rose-700 text-left block"
                        >
                          {student.fullName}
                        </button>
                        <span className="text-[11px] text-[#7A7165]">
                          DNI: {student.dni} | Apod: {student.guardianName}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-[#2E2820] block">
                          {student.sede === 'mi_peru' ? 'Mi Perú' : 'Ventanilla'}
                        </span>
                        <span className="text-[11px] text-[#7A7165]">{student.program}</span>
                      </td>

                      <td className="py-3 px-3 font-bold text-sm text-[#2A251E]">
                        {formatSoles(student.monthlyFee)}
                      </td>

                      <td className="py-3 px-3 text-[#7A7165]">
                        {student.nextDueDate || 'Por definir'}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${badgeColor}`}>
                          {statusText}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Recordatorio por WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => onOpenPaymentModal(student)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer shadow-2xs"
                          >
                            Cobrar
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

      {/* TAB 2: Ingresos Adicionales (Ventas, Talleres, Alquileres, Otros) */}
      {activeTab === 'ingresos_adicionales' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#ECE5DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar por concepto, cliente o recibo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-9 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-xs outline-none"
              />
              <Search className="w-4 h-4 text-[#8C8477] absolute left-3 top-2.5" />
            </div>

            {onOpenAdditionalModal && (
              <button
                onClick={() => onOpenAdditionalModal('income')}
                className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Nuevo Ingreso Adicional</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#ECE5DA] shadow-xs overflow-hidden">
            {displayedAdditionalIncomes.length === 0 ? (
              <div className="p-8 text-center text-[#7C7365]">
                <ShoppingBag className="w-10 h-10 mx-auto text-[#B8AE9F] mb-2 opacity-60" />
                <p className="font-bold text-sm text-[#2A251E]">No hay ingresos adicionales registrados</p>
                <p className="text-xs text-[#8C8375] mt-1">
                  Usa el botón "+ Nuevo Ingreso Adicional" para registrar ventas de uniformes, materiales, talleres o servicios.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#696155] border-b border-[#ECE5DA] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Fecha / N° Comprobante</th>
                    <th className="py-3 px-3">Concepto</th>
                    <th className="py-3 px-3">Categoría</th>
                    <th className="py-3 px-3">Pagado por</th>
                    <th className="py-3 px-3">Método / Sede</th>
                    <th className="py-3 px-3">Importe</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAE0]">
                  {displayedAdditionalIncomes.map((inc) => (
                    <tr key={inc.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#2A251E] block">
                          {inc.referenceNumber || inc.id}
                        </span>
                        <span className="text-[11px] text-[#7A7165]">{inc.date}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-[#2A251E] block">{inc.concept}</span>
                        {inc.notes && (
                          <span className="text-[10px] text-[#8C8477] italic">{inc.notes}</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-semibold text-[11px]">
                          {getIncomeCategoryLabel(inc.category)}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-[#2A251E]">{inc.payerName}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="bg-[#FAF5ED] text-[#4A4237] border border-[#E0D8CB] px-2 py-0.5 rounded font-semibold text-[10px] block w-fit">
                          {inc.paymentMethod}
                        </span>
                        <span className="text-[10px] text-[#7A7165] mt-0.5 block">
                          {inc.sede === 'mi_peru' ? 'Mi Perú' : 'Ventanilla'}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-bold text-sm text-teal-800">
                        {formatSoles(inc.amount)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onOpenIncomeReceipt && (
                            <button
                              onClick={() => onOpenIncomeReceipt(inc)}
                              className="flex items-center gap-1 text-xs font-semibold bg-white hover:bg-teal-50 text-teal-900 border border-teal-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                              title="Ver e imprimir recibo oficial"
                            >
                              <Printer className="w-3.5 h-3.5 text-teal-700" />
                              <span className="hidden sm:inline">Recibo</span>
                            </button>
                          )}

                          {onDeleteAdditionalIncome && (
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Seguro que deseas eliminar el ingreso "${inc.concept}" de ${formatSoles(inc.amount)}?`)) {
                                  onDeleteAdditionalIncome(inc.id);
                                }
                              }}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar ingreso"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Gastos y Salidas de Caja */}
      {activeTab === 'gastos_caja' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#ECE5DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar gasto por concepto o beneficiario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-9 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-xs outline-none"
              />
              <Search className="w-4 h-4 text-[#8C8477] absolute left-3 top-2.5" />
            </div>

            {onOpenAdditionalModal && (
              <button
                onClick={() => onOpenAdditionalModal('expense')}
                className="flex items-center gap-1.5 bg-rose-700 hover:bg-rose-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Nuevo Gasto de Caja</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#ECE5DA] shadow-xs overflow-hidden">
            {displayedExpenses.length === 0 ? (
              <div className="p-8 text-center text-[#7C7365]">
                <Receipt className="w-10 h-10 mx-auto text-[#B8AE9F] mb-2 opacity-60" />
                <p className="font-bold text-sm text-[#2A251E]">No hay salidas de caja registradas</p>
                <p className="text-xs text-[#8C8375] mt-1">
                  Usa el botón "+ Nuevo Gasto de Caja" para registrar compras menores, fotocopias, movilidad o insumos.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#696155] border-b border-[#ECE5DA] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Fecha / N° Boleta</th>
                    <th className="py-3 px-3">Descripción del Gasto</th>
                    <th className="py-3 px-3">Categoría</th>
                    <th className="py-3 px-3">Beneficiario / Proveedor</th>
                    <th className="py-3 px-3">Método / Sede</th>
                    <th className="py-3 px-3">Importe</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAE0]">
                  {displayedExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#2A251E] block">
                          {exp.receiptNumber || exp.id}
                        </span>
                        <span className="text-[11px] text-[#7A7165]">{exp.date}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-[#2A251E] block">{exp.description}</span>
                        {exp.notes && (
                          <span className="text-[10px] text-[#8C8477] italic">{exp.notes}</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-semibold text-[11px] uppercase">
                          {exp.category}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-[#2A251E]">{exp.beneficiaryName}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="bg-[#FAF5ED] text-[#4A4237] border border-[#E0D8CB] px-2 py-0.5 rounded font-semibold text-[10px] block w-fit">
                          {exp.paymentMethod}
                        </span>
                        <span className="text-[10px] text-[#7A7165] mt-0.5 block">
                          {exp.sede === 'ambas' ? 'Ambas Sedes' : exp.sede === 'mi_peru' ? 'Mi Perú' : 'Ventanilla'}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-bold text-sm text-rose-800">
                        {formatSoles(exp.amount)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {onDeleteExpense && (
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Seguro que deseas eliminar el gasto "${exp.description}" de ${formatSoles(exp.amount)}?`)) {
                                onDeleteExpense(exp.id);
                              }
                            }}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar gasto de caja"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Historial de Cobranzas a Alumnos */}
      {activeTab === 'historial' && (
        <div className="bg-white rounded-2xl border border-[#ECE5DA] shadow-xs overflow-hidden">
          <div className="p-4 bg-[#FAF7F2] border-b border-[#ECE5DA] flex justify-between items-center">
            <span className="text-xs font-bold text-[#3E382E] uppercase tracking-wider">
              Recibos de Cuotas Emitidos ({filteredPayments.length})
            </span>
            <span className="text-xs text-[#7A7266]">Comprobantes institucionales de mensualidades y matrículas</span>
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
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenReceipt(p, st)}
                          className="flex items-center gap-1 text-xs font-semibold bg-white hover:bg-[#F2ECE3] text-[#3A342B] border border-[#DDD5C9] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-rose-600" />
                          <span>Ver Recibo</span>
                        </button>

                        {onDeletePayment && (
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Deseas anular y eliminar este recibo de ${formatSoles(p.amount)} de ${p.studentName}?`)) {
                                onDeletePayment(p.id);
                              }
                            }}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar pago"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: Facilidades y Acuerdos */}
      {activeTab === 'acuerdos' && (
        <div className="bg-white rounded-2xl border border-[#ECE5DA] p-6 shadow-xs space-y-4">
          <div className="border-b border-[#ECE5DA] pb-3">
            <h3 className="text-base font-bold text-[#2A251E]">
              Acuerdos y Facilidades de Pago Activas ({activeAgreements.length})
            </h3>
            <p className="text-xs text-[#7A7266] mt-0.5">
              Alumnos con compromisos de pago fraccionado o convenios especiales.
            </p>
          </div>

          {activeAgreements.length === 0 ? (
            <p className="text-xs text-[#8C8375] py-4 text-center">
              No hay acuerdos de pago fraccionado activos en este momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAgreements.map((st) => {
                const agr = st.activeAgreement;
                if (!agr) return null;
                return (
                  <div key={st.id} className="p-4 rounded-xl border border-[#E0D7C9] bg-[#FAF8F5] space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-[#2A251E]">{st.fullName}</h4>
                        <p className="text-xs text-[#787063]">Apoderado: {st.guardianName} ({st.guardianPhone})</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        {agr.status}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[#4A4237]">
                      Compromiso: {agr.description} ({formatSoles(agr.agreedAmount)})
                    </p>

                    <div className="space-y-1 pt-1">
                      {agr.installments.map((inst, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white border border-[#E8E1D5]"
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

      {/* TAB 6: Control de Matrículas */}
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
