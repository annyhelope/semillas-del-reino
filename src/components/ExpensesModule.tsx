import React, { useState, useMemo } from 'react';
import { ExpenseRecord, ExpenseCategory, SedeId, Sede, PaymentRecord, StaffMember } from '../types';
import { formatSoles } from '../utils/dateUtils';
import { DEFAULT_ACTIVE_TEACHERS } from '../data/initialData';
import { ExpenseModal } from './Modals/ExpenseModal';
import { ExpenseReceiptModal } from './Modals/ExpenseReceiptModal';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  GraduationCap, 
  Building2, 
  Zap, 
  Palette, 
  Wrench, 
  HelpCircle,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  Trash2,
  Edit2,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ExternalLink,
  UserPlus,
} from 'lucide-react';

interface ExpensesModuleProps {
  expenses: ExpenseRecord[];
  payments: PaymentRecord[];
  staff?: StaffMember[];
  sedes?: Sede[];
  selectedSede: SedeId | 'todas';
  onAddExpense: (expense: ExpenseRecord) => void;
  onUpdateExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense: (expenseId: string) => void;
  onDeleteStaff?: (staffId: string) => void;
  onOpenStaffModal?: () => void;
  onBackToHall?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const ExpensesModule: React.FC<ExpensesModuleProps> = ({
  expenses = [],
  payments = [],
  staff = [],
  sedes = [],
  selectedSede = 'todas',
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onDeleteStaff,
  onOpenStaffModal,
  onBackToHall,
  onNavigateTab,
}) => {
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safePayments = Array.isArray(payments) ? payments : [];

  // Local state for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [receiptExpense, setReceiptExpense] = useState<ExpenseRecord | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('todas');
  const [filterSede, setFilterSede] = useState<string>(selectedSede);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('todos');

  // Update filterSede when header selectedSede changes
  React.useEffect(() => {
    setFilterSede(selectedSede);
  }, [selectedSede]);

  // Current month string (e.g. "2026-09")
  const currentYearMonth = new Date().toISOString().slice(0, 7);

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return safeExpenses.filter((exp) => {
      // Sede filter
      if (filterSede !== 'todas' && exp.sede !== 'ambas' && exp.sede !== filterSede) {
        return false;
      }
      // Category filter
      if (filterCategory !== 'todas' && exp.category !== filterCategory) {
        return false;
      }
      // Month filter
      if (selectedMonth !== 'todos' && !exp.date.startsWith(selectedMonth)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = exp.description.toLowerCase().includes(q);
        const matchBeneficiary = exp.beneficiaryName.toLowerCase().includes(q);
        const matchReceipt = exp.receiptNumber ? exp.receiptNumber.toLowerCase().includes(q) : false;
        if (!matchDesc && !matchBeneficiary && !matchReceipt) return false;
      }
      return true;
    });
  }, [safeExpenses, filterSede, filterCategory, selectedMonth, searchQuery]);

  // Financial calculations
  const totalIncome = useMemo(() => {
    return safePayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [safePayments]);

  const totalExpense = useMemo(() => {
    return safeExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [safeExpenses]);

  const netBalance = totalIncome - totalExpense;

  const teacherExpenses = useMemo(() => {
    return safeExpenses
      .filter((e) => e.category === 'profesores')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [safeExpenses]);

  const rentExpenses = useMemo(() => {
    return safeExpenses
      .filter((e) => e.category === 'alquiler')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [safeExpenses]);

  const servicesAndOtherExpenses = useMemo(() => {
    return safeExpenses
      .filter((e) => e.category !== 'profesores' && e.category !== 'alquiler')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [safeExpenses]);

  // Active teachers list from staff or fallback to default
  const activeTeachersList = useMemo(() => {
    if (!staff || staff.length === 0) return DEFAULT_ACTIVE_TEACHERS;
    const filtered = staff.filter((s) =>
      s.role.toLowerCase().includes('profesor') ||
      s.role.toLowerCase().includes('docente') ||
      s.role.toLowerCase().includes('estimula') ||
      s.role.toLowerCase().includes('refuerzo') ||
      s.role.toLowerCase().includes('auxiliar')
    );
    return filtered.length > 0 ? filtered : staff;
  }, [staff]);

  // Status for active teachers/workers
  const teachersStatus = useMemo(() => {
    return activeTeachersList.map((teacher, idx) => {
      // Find payments to this teacher in current month
      const nameParts = teacher.name.toLowerCase().split(' ').filter((p) => p.length > 2);
      const paymentsToTeacher = safeExpenses.filter((e) => {
        if (e.category !== 'profesores') return false;
        const ben = e.beneficiaryName.toLowerCase();
        const matches = nameParts.some((part) => ben.includes(part));
        return matches && e.date.startsWith(currentYearMonth);
      });

      const totalPaidMonth = paymentsToTeacher.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const isPaid = totalPaidMonth > 0;

      return {
        id: teacher.id || `teacher-${idx}`,
        name: teacher.name,
        role: teacher.role,
        sede: teacher.sede,
        phone: teacher.phone,
        salaryReference: (teacher as any).salaryReference || 0,
        isPaid,
        totalPaidMonth,
        lastPaymentDate: paymentsToTeacher[0]?.date || null,
      };
    });
  }, [activeTeachersList, safeExpenses, currentYearMonth]);

  const handleOpenNewExpense = (presetCategory?: ExpenseCategory, defaultBeneficiary?: string) => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleOpenEditExpense = (expense: ExpenseRecord) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDeleteExpense = (id: string, description: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el registro de gasto: "${description}"?`)) {
      onDeleteExpense(id);
    }
  };

  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      alert('No hay registros de gastos para exportar con los filtros actuales.');
      return;
    }

    const headers = ['ID', 'Fecha', 'Categoría', 'Descripción', 'Beneficiario', 'Sede', 'Método de Pago', 'N° Comprobante', 'Monto S/.', 'Notas'];
    const rows = filteredExpenses.map((e) => [
      e.id,
      e.date,
      e.category,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${e.beneficiaryName.replace(/"/g, '""')}"`,
      e.sede,
      e.paymentMethod,
      e.receiptNumber || '',
      e.amount.toFixed(2),
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_gastos_semillas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadge = (category: ExpenseCategory) => {
    switch (category) {
      case 'profesores':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
            <GraduationCap className="w-3.5 h-3.5 text-rose-600" />
            Pago a Docente
          </span>
        );
      case 'alquiler':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
            <Building2 className="w-3.5 h-3.5 text-amber-700" />
            Alquiler de Local
          </span>
        );
      case 'servicios':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            Servicios Básicos
          </span>
        );
      case 'materiales':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
            <Palette className="w-3.5 h-3.5 text-emerald-600" />
            Material Didáctico
          </span>
        );
      case 'mantenimiento':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-lg">
            <Wrench className="w-3.5 h-3.5 text-cyan-600" />
            Mantenimiento & Aseo
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg">
            <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
            Otro Egreso
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12" id="expenses-module-view">
      {/* 1. Header principal */}
      <div className="bg-white rounded-3xl border border-[#E8E1D5] p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#26211B] flex items-center gap-2">
                Control de Gastos y Planilla Docente
              </h1>
              <p className="text-xs text-[#7A7165]">
                Gestión de pagos de alquiler, sueldos de profesoras, servicios y balance institucional
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 text-xs font-bold text-[#4B4337] bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DDD5CA] px-3.5 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer"
              title="Exportar archivo CSV para contabilidad"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Exportar Excel / CSV</span>
            </button>

            <button
              id="btn-new-expense"
              onClick={() => handleOpenNewExpense()}
              className="flex items-center gap-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Gasto / Egreso</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Tarjetas de Resumen Financiero y Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Ingresos Cobranzas */}
        <div className="bg-white rounded-2xl border border-[#E8E1D5] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#71685B]">Ingresos Cobrados</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-emerald-900">{formatSoles(totalIncome)}</span>
            <p className="text-[11px] text-[#8C8377] mt-0.5">{safePayments.length} abonos de alumnos</p>
          </div>
        </div>

        {/* Gastos Totales */}
        <div className="bg-white rounded-2xl border border-[#E8E1D5] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#71685B]">Total Egresos</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-rose-900">{formatSoles(totalExpense)}</span>
            <p className="text-[11px] text-[#8C8377] mt-0.5">{safeExpenses.length} egresos registrados</p>
          </div>
        </div>

        {/* Saldo / Ganancia Neta */}
        <div className="bg-white rounded-2xl border border-[#E8E1D5] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#71685B]">Utilidad Neta en Caja</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-lg font-black ${netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatSoles(netBalance)}
            </span>
            <p className="text-[11px] text-[#8C8377] mt-0.5">
              {netBalance >= 0 ? 'Superávit / Caja positiva' : 'Atención: Saldo negativo'}
            </p>
          </div>
        </div>

        {/* Desglose: Pago a Profesoras */}
        <div className="bg-white rounded-2xl border border-[#E8E1D5] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#71685B]">Pago a Docentes</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-[#26211B]">{formatSoles(teacherExpenses)}</span>
            <p className="text-[11px] text-rose-700 font-medium mt-0.5">{teachersStatus.length} docentes / trabajadoras</p>
          </div>
        </div>

        {/* Desglose: Alquiler de Locales */}
        <div className="bg-white rounded-2xl border border-[#E8E1D5] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#71685B]">Alquiler de Sedes</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-[#26211B]">{formatSoles(rentExpenses)}</span>
            <p className="text-[11px] text-amber-800 font-medium mt-0.5">Mi Perú y Ventanilla</p>
          </div>
        </div>

        {/* Desglose: Servicios y Operativo */}
        <div className="bg-white rounded-2xl border border-[#E8E1D5] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#71685B]">Servicios & Otros</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-[#26211B]">{formatSoles(servicesAndOtherExpenses)}</span>
            <p className="text-[11px] text-[#8C8377] mt-0.5">Luz, agua, materiales</p>
          </div>
        </div>
      </div>

      {/* 3. Panel Especial de Planilla y Docentes Activas */}
      <div className="bg-white rounded-3xl border border-[#E8E1D5] p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EBE3] pb-3">
          <div>
            <h2 className="text-sm font-black text-[#26211B] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-rose-600" />
              Planilla de Docentes y Trabajadoras ({teachersStatus.length} Registradas)
            </h2>
            <p className="text-xs text-[#7A7165]">
              Control de remuneraciones mensuales. Puedes agregar o retirar docentes y trabajadoras en cualquier momento.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenStaffModal && (
              <button
                type="button"
                onClick={onOpenStaffModal}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-900 bg-rose-100 hover:bg-rose-200 border border-rose-300 px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
                title="Abrir panel para registrar nuevas contrataciones o retirar personal"
              >
                <UserPlus className="w-3.5 h-3.5 text-rose-700" />
                <span>+ Agregar / Quitar Personal</span>
              </button>
            )}

            <span className="text-xs bg-[#FAF7F2] text-[#595043] font-bold px-3 py-1 rounded-xl border border-[#E2DBD0]">
              {new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(new Date())}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachersStatus.map((t, idx) => (
            <div 
              key={t.id}
              className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5] flex flex-col justify-between gap-3 hover:border-rose-300 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md truncate max-w-[170px]">
                    {t.role || `Docente ${idx + 1}`}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] bg-neutral-200 text-neutral-800 font-bold px-1.5 py-0.5 rounded">
                      {t.sede === 'mi_peru' ? 'Mi Perú' : t.sede === 'ventanilla' ? 'Ventanilla' : 'Ambas'}
                    </span>
                    {onDeleteStaff && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`¿Seguro que deseas retirar a "${t.name}" del personal? Podrás volver a agregarla cuando desees.`)) {
                            onDeleteStaff(t.id);
                          }
                        }}
                        className="p-1 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Eliminar o dar de baja a esta trabajadora"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-black text-[#26211B]">{t.name}</h3>

                {t.salaryReference > 0 && (
                  <p className="text-xs text-[#52493D]">
                    Sueldo referencia: <strong className="text-[#201C17]">{formatSoles(t.salaryReference)}</strong>
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1 text-xs">
                  {t.isPaid ? (
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Pagado: {formatSoles(t.totalPaidMonth)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Pendiente este mes
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingExpense(null);
                  setIsModalOpen(true);
                }}
                className="w-full text-center text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 px-3.5 py-2 rounded-xl shadow-2xs transition-all shrink-0 cursor-pointer"
              >
                + Registrar Pago de Sueldo
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Filtros y Búsqueda */}
      <div className="bg-white rounded-3xl border border-[#E8E1D5] p-5 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C8377] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar gasto o beneficiario..."
              className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl text-xs font-medium text-[#26211B] focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Filtro Categoría */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl text-xs font-semibold text-[#26211B] focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
            >
              <option value="todas">Todas las Categorías</option>
              <option value="profesores">👩‍🏫 Pago a Docentes / Profesoras</option>
              <option value="alquiler">🏢 Alquiler de Local</option>
              <option value="servicios">⚡ Servicios Básicos (Luz/Agua/Net)</option>
              <option value="materiales">🎨 Materiales Didácticos</option>
              <option value="mantenimiento">🧹 Mantenimiento y Aseo</option>
              <option value="otros">📌 Otros Egresos</option>
            </select>
          </div>

          {/* Filtro Sede */}
          <div>
            <select
              value={filterSede}
              onChange={(e) => setFilterSede(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl text-xs font-semibold text-[#26211B] focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
            >
              <option value="todas">📍 Todas las Sedes</option>
              <option value="mi_peru">Sede Principal Mi Perú</option>
              <option value="ventanilla">Sede Ventanilla (Deporte)</option>
            </select>
          </div>

          {/* Filtro Mes */}
          <div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl text-xs font-semibold text-[#26211B] focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
            >
              <option value="todos">📅 Todos los Periodos</option>
              <option value={currentYearMonth}>Mes en curso ({currentYearMonth})</option>
              <option value="2026-08">Agosto 2026</option>
              <option value="2026-07">Julio 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Tabla de Gastos */}
      <div className="bg-white rounded-3xl border border-[#E8E1D5] overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-[#F0EBE3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-[#26211B]">
              Historial Detallado de Egresos
            </span>
            <span className="text-xs bg-[#FAF7F2] text-[#6E6457] font-bold px-2 py-0.5 rounded-full border border-[#E2DAD0]">
              {filteredExpenses.length} registro(s)
            </span>
          </div>

          <span className="text-xs font-bold text-[#71685B]">
            Subtotal Filtrado: <strong className="text-rose-900">{formatSoles(filteredExpenses.reduce((s, e) => s + e.amount, 0))}</strong>
          </span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto">
              <Receipt className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-[#26211B]">
              No hay egresos registrados
            </h3>
            <p className="text-xs text-[#7A7165] max-w-md mx-auto">
              Lleva el control exacto de los alquileres de local, los pagos mensuales a las dos profesoras, compras de materiales y servicios.
            </p>
            <button
              onClick={() => handleOpenNewExpense()}
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 px-4 py-2.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Primer Gasto</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#696052] uppercase font-bold border-b border-[#EDE6DC]">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Concepto / Detalle</th>
                  <th className="px-4 py-3">Beneficiario</th>
                  <th className="px-4 py-3">Sede</th>
                  <th className="px-4 py-3">Medio</th>
                  <th className="px-4 py-3">N° Doc</th>
                  <th className="px-4 py-3 text-right">Monto</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE3]">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-4 py-3.5 font-medium text-[#26211B] whitespace-nowrap">
                      {exp.date}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getCategoryBadge(exp.category)}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[#26211B] max-w-xs">
                      <div className="truncate">{exp.description}</div>
                      {exp.notes && (
                        <div className="text-[10px] text-[#8A8173] truncate italic">{exp.notes}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#352F26] whitespace-nowrap">
                      {exp.beneficiaryName}
                    </td>
                    <td className="px-4 py-3.5 text-[#5F5649] whitespace-nowrap capitalize">
                      {exp.sede === 'mi_peru' ? 'Mi Perú' : exp.sede === 'ventanilla' ? 'Ventanilla' : 'Ambas'}
                    </td>
                    <td className="px-4 py-3.5 text-[#5F5649] whitespace-nowrap">
                      {exp.paymentMethod}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-[#71685B] whitespace-nowrap">
                      {exp.receiptNumber || '-'}
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-rose-900 whitespace-nowrap text-sm">
                      {formatSoles(exp.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Ver Vale de Egreso */}
                        <button
                          type="button"
                          onClick={() => setReceiptExpense(exp)}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                          title="Ver e Imprimir Comprobante de Egreso / Vale de Caja"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Editar */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditExpense(exp)}
                          className="p-1.5 rounded-lg bg-white text-[#6E6457] hover:text-[#26211B] border border-[#DDD5CA] hover:bg-[#F5EFE6] transition-colors cursor-pointer"
                          title="Editar gasto"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Eliminar */}
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(exp.id, exp.description)}
                          className="p-1.5 rounded-lg bg-white text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Registro / Edición de Gasto */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        onSaveExpense={(saved) => {
          if (editingExpense) {
            onUpdateExpense(saved);
          } else {
            onAddExpense(saved);
          }
        }}
        expenseToEdit={editingExpense}
        defaultSede={selectedSede}
        staff={staff}
        onOpenStaffModal={onOpenStaffModal}
      />

      {/* Modal de Vale de Egreso Oficial */}
      {receiptExpense && (
        <ExpenseReceiptModal
          expense={receiptExpense}
          sede={sedes.find((s) => s.id === receiptExpense.sede) || sedes[0] || null}
          onClose={() => setReceiptExpense(null)}
        />
      )}
    </div>
  );
};
