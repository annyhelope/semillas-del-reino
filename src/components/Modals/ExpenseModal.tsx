import React, { useState, useEffect } from 'react';
import { ExpenseRecord, ExpenseCategory, SedeId, PaymentMethod, StaffMember } from '../../types';
import { DEFAULT_ACTIVE_TEACHERS } from '../../data/initialData';
import { 
  X, 
  Receipt, 
  GraduationCap, 
  Building2, 
  Zap, 
  Palette, 
  Wrench, 
  HelpCircle,
  Calendar,
  CreditCard,
  User,
  FileText,
  UserPlus
} from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: ExpenseRecord) => void;
  expenseToEdit?: ExpenseRecord | null;
  defaultSede?: SedeId | 'todas';
  staff?: StaffMember[];
  onOpenStaffModal?: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  expenseToEdit,
  defaultSede = 'mi_peru',
  staff = [],
  onOpenStaffModal,
}) => {
  const teacherList = staff && staff.length > 0 
    ? staff.filter(s => 
        s.role.toLowerCase().includes('profesor') || 
        s.role.toLowerCase().includes('docente') || 
        s.role.toLowerCase().includes('estimula') || 
        s.role.toLowerCase().includes('refuerzo') ||
        s.role.toLowerCase().includes('auxiliar')
      )
    : DEFAULT_ACTIVE_TEACHERS;

  const displayTeachers = teacherList.length > 0 ? teacherList : staff;

  const [category, setCategory] = useState<ExpenseCategory>('profesores');
  const [amount, setAmount] = useState<number>(500);
  const [description, setDescription] = useState('Pago quincenal / mensual de docencia');
  const [beneficiaryName, setBeneficiaryName] = useState(
    displayTeachers[0]?.name || 'Lic. Andrea Salas'
  );
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sede, setSede] = useState<SedeId | 'ambas'>(defaultSede === 'todas' ? 'mi_peru' : defaultSede);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transferencia BCP');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Quick preset options for categories
  useEffect(() => {
    if (expenseToEdit) {
      setCategory(expenseToEdit.category);
      setAmount(expenseToEdit.amount);
      setDescription(expenseToEdit.description);
      setBeneficiaryName(expenseToEdit.beneficiaryName);
      setDate(expenseToEdit.date);
      setSede(expenseToEdit.sede);
      setPaymentMethod(expenseToEdit.paymentMethod);
      setReceiptNumber(expenseToEdit.receiptNumber || '');
      setNotes(expenseToEdit.notes || '');
    } else {
      // Default reset
      setCategory('profesores');
      setAmount(500);
      setDescription('Pago de docencia - Septiembre 2026');
      setBeneficiaryName(DEFAULT_ACTIVE_TEACHERS[0].name);
      setDate(new Date().toISOString().split('T')[0]);
      setSede(defaultSede === 'todas' ? 'mi_peru' : defaultSede);
      setPaymentMethod('Transferencia BCP');
      setReceiptNumber('');
      setNotes('');
    }
  }, [expenseToEdit, isOpen, defaultSede]);

  if (!isOpen) return null;

  const handleSelectCategory = (cat: ExpenseCategory) => {
    setCategory(cat);
    if (cat === 'profesores') {
      setDescription('Pago de docencia - Quincena / Mes');
      setBeneficiaryName(DEFAULT_ACTIVE_TEACHERS[0].name);
      setAmount(600);
    } else if (cat === 'alquiler') {
      const sedeText = sede === 'mi_peru' ? 'Sede Mi Perú' : 'Sede Ventanilla';
      setDescription(`Alquiler del local institucional (${sedeText})`);
      setBeneficiaryName('Propietario del Inmueble');
      setAmount(1200);
    } else if (cat === 'servicios') {
      setDescription('Pago de Luz / Agua / Internet');
      setBeneficiaryName('Enel / Sedapal / Internet');
      setAmount(180);
    } else if (cat === 'materiales') {
      setDescription('Compra de material didáctico y psicomotricidad');
      setBeneficiaryName('Distribuidora Pedagógica / Librería');
      setAmount(150);
    } else if (cat === 'mantenimiento') {
      setDescription('Artículos de limpieza, aseo y desinfección');
      setBeneficiaryName('Servicios de Limpieza y Mantenimiento');
      setAmount(90);
    } else {
      setDescription('Gasto operativo institucional');
      setBeneficiaryName('Proveedor');
      setAmount(50);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
      alert('Por favor ingresa un monto válido mayor a S/ 0.00');
      return;
    }
    if (!description.trim()) {
      alert('Por favor describe el concepto del gasto.');
      return;
    }
    if (!beneficiaryName.trim()) {
      alert('Por favor indica el beneficiario (ej. Nombre de la profesora, propietario o entidad).');
      return;
    }

    const newExpense: ExpenseRecord = {
      id: expenseToEdit ? expenseToEdit.id : `exp-${Date.now()}`,
      category,
      description: description.trim(),
      amount: Number(amount),
      date,
      sede,
      paymentMethod,
      beneficiaryName: beneficiaryName.trim(),
      receiptNumber: receiptNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: expenseToEdit ? expenseToEdit.createdAt : new Date().toISOString(),
    };

    onSaveExpense(newExpense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl border border-[#E8E1D5] w-full max-w-2xl shadow-xl overflow-hidden my-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-expense-title"
      >
        {/* Header */}
        <div className="bg-[#FAF7F2] p-5 sm:p-6 border-b border-[#E8E1D5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-expense-title" className="text-lg font-black text-[#26211B]">
                {expenseToEdit ? 'Editar Registro de Gasto' : 'Registrar Nuevo Egreso / Gasto'}
              </h2>
              <p className="text-xs text-[#7A7165]">
                Alquiler de locales, pagos a docentes, servicios y materiales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white border border-[#E2DAD0] text-[#71685B] hover:text-[#26211B] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Selector de Categoría Principal con Botones Visuales */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#383228]">
              Tipo de Egreso / Categoría:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* Opción 1: Pago a Profesoras */}
              <button
                type="button"
                onClick={() => handleSelectCategory('profesores')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  category === 'profesores'
                    ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold ring-2 ring-rose-200'
                    : 'bg-white border-[#E8E1D5] text-[#554E43] hover:bg-[#FAF7F2]'
                }`}
              >
                <GraduationCap className={`w-4 h-4 shrink-0 ${category === 'profesores' ? 'text-rose-600' : 'text-[#877D70]'}`} />
                <div className="truncate">
                  <div className="text-xs font-bold truncate">Pago a Profesoras</div>
                  <div className="text-[10px] text-[#82796D] truncate">Sueldo / Honorarios</div>
                </div>
              </button>

              {/* Opción 2: Alquiler de Local */}
              <button
                type="button"
                onClick={() => handleSelectCategory('alquiler')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  category === 'alquiler'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold ring-2 ring-amber-200'
                    : 'bg-white border-[#E8E1D5] text-[#554E43] hover:bg-[#FAF7F2]'
                }`}
              >
                <Building2 className={`w-4 h-4 shrink-0 ${category === 'alquiler' ? 'text-amber-600' : 'text-[#877D70]'}`} />
                <div className="truncate">
                  <div className="text-xs font-bold truncate">Alquiler de Local</div>
                  <div className="text-[10px] text-[#82796D] truncate">Mi Perú / Ventanilla</div>
                </div>
              </button>

              {/* Opción 3: Servicios Básicos */}
              <button
                type="button"
                onClick={() => handleSelectCategory('servicios')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  category === 'servicios'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold ring-2 ring-blue-200'
                    : 'bg-white border-[#E8E1D5] text-[#554E43] hover:bg-[#FAF7F2]'
                }`}
              >
                <Zap className={`w-4 h-4 shrink-0 ${category === 'servicios' ? 'text-blue-600' : 'text-[#877D70]'}`} />
                <div className="truncate">
                  <div className="text-xs font-bold truncate">Servicios Básicos</div>
                  <div className="text-[10px] text-[#82796D] truncate">Luz, Agua, Net</div>
                </div>
              </button>

              {/* Opción 4: Materiales Didácticos */}
              <button
                type="button"
                onClick={() => handleSelectCategory('materiales')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  category === 'materiales'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold ring-2 ring-emerald-200'
                    : 'bg-white border-[#E8E1D5] text-[#554E43] hover:bg-[#FAF7F2]'
                }`}
              >
                <Palette className={`w-4 h-4 shrink-0 ${category === 'materiales' ? 'text-emerald-600' : 'text-[#877D70]'}`} />
                <div className="truncate">
                  <div className="text-xs font-bold truncate">Materiales</div>
                  <div className="text-[10px] text-[#82796D] truncate">Juegos, Útiles</div>
                </div>
              </button>

              {/* Opción 5: Mantenimiento y Aseo */}
              <button
                type="button"
                onClick={() => handleSelectCategory('mantenimiento')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  category === 'mantenimiento'
                    ? 'bg-cyan-50 border-cyan-300 text-cyan-900 font-bold ring-2 ring-cyan-200'
                    : 'bg-white border-[#E8E1D5] text-[#554E43] hover:bg-[#FAF7F2]'
                }`}
              >
                <Wrench className={`w-4 h-4 shrink-0 ${category === 'mantenimiento' ? 'text-cyan-600' : 'text-[#877D70]'}`} />
                <div className="truncate">
                  <div className="text-xs font-bold truncate">Mantenimiento</div>
                  <div className="text-[10px] text-[#82796D] truncate">Limpieza, Aseo</div>
                </div>
              </button>

              {/* Opción 6: Otros */}
              <button
                type="button"
                onClick={() => handleSelectCategory('otros')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  category === 'otros'
                    ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold ring-2 ring-purple-200'
                    : 'bg-white border-[#E8E1D5] text-[#554E43] hover:bg-[#FAF7F2]'
                }`}
              >
                <HelpCircle className={`w-4 h-4 shrink-0 ${category === 'otros' ? 'text-purple-600' : 'text-[#877D70]'}`} />
                <div className="truncate">
                  <div className="text-xs font-bold truncate">Otros Egresos</div>
                  <div className="text-[10px] text-[#82796D] truncate">Trámites, Varios</div>
                </div>
              </button>
            </div>
          </div>

          {/* Atajos si es categoría PROFESORAS */}
          {category === 'profesores' && (
            <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900 block">
                  Selección rápida de docente o trabajadora ({displayTeachers.length} registradas):
                </span>
                {onOpenStaffModal && (
                  <button
                    type="button"
                    onClick={onOpenStaffModal}
                    className="text-[11px] font-bold text-rose-700 hover:text-rose-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>+ Agregar / Quitar Personal</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {displayTeachers.map((teacher) => (
                  <button
                    key={teacher.id}
                    type="button"
                    onClick={() => {
                      setBeneficiaryName(teacher.name);
                      setDescription(`Pago de honorarios - ${teacher.role || 'Docencia'} - Mes actual`);
                      if (teacher.salaryReference) {
                        setAmount(teacher.salaryReference);
                      }
                      if (teacher.sede && teacher.sede !== 'todas') {
                        setSede(teacher.sede);
                      }
                    }}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                      beneficiaryName.toLowerCase().includes(teacher.name.toLowerCase().split(' ')[0]) ||
                      beneficiaryName === teacher.name
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                        : 'bg-white text-rose-950 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    👩‍🏫 {teacher.name.split('(')[0]}
                    {teacher.salaryReference && (
                      <span className="ml-1 opacity-80 text-[10px]">
                        (S/ {teacher.salaryReference})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Atajos si es categoría ALQUILER */}
          {category === 'alquiler' && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-900 block">
                Selección de sede de alquiler:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSede('mi_peru');
                    setDescription('Alquiler local institucional - Sede Principal Mi Perú');
                    setBeneficiaryName('Propietario Local Mi Perú');
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                    sede === 'mi_peru'
                      ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                      : 'bg-white text-amber-950 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  📍 Local Sede Mi Perú
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSede('ventanilla');
                    setDescription('Alquiler local deportivo - Sede Ventanilla');
                    setBeneficiaryName('Administración Local Ventanilla');
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                    sede === 'ventanilla'
                      ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                      : 'bg-white text-amber-950 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  📍 Local Sede Ventanilla
                </button>
              </div>
            </div>
          )}

          {/* Fila: Monto, Fecha y Sede */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#383228] mb-1">
                Monto del Gasto (S/.): *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-[#71685B]">S/</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-[#DDD5CA] rounded-xl text-base font-black text-[#26211B] focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#383228] mb-1">
                Fecha del Pago: *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD5CA] rounded-xl text-xs font-semibold text-[#26211B] focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#383228] mb-1">
                Sede Correspondiente:
              </label>
              <select
                value={sede}
                onChange={(e) => setSede(e.target.value as SedeId | 'ambas')}
                className="w-full px-3 py-2 bg-white border border-[#DDD5CA] rounded-xl text-xs font-semibold text-[#26211B] focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="mi_peru">Sede Mi Perú</option>
                <option value="ventanilla">Sede Ventanilla</option>
                <option value="ambas">Ambas Sedes / General</option>
              </select>
            </div>
          </div>

          {/* Concepto / Descripción */}
          <div>
            <label className="block text-xs font-bold text-[#383228] mb-1">
              Concepto / Detalle del Gasto: *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Pago de sueldo Profesora Andrea Salas - Mes Septiembre"
              className="w-full px-3 py-2 bg-white border border-[#DDD5CA] rounded-xl text-xs font-medium text-[#26211B] focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Fila: Beneficiario y Método de Pago */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#383228] mb-1">
                Beneficiario / Receptor del Pago: *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C8377] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="Nombre de la profesora o proveedor"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#DDD5CA] rounded-xl text-xs font-medium text-[#26211B] focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#383228] mb-1">
                Método de Pago Utilizado:
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-[#8C8377] absolute left-3 top-2.5" />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#DDD5CA] rounded-xl text-xs font-semibold text-[#26211B] focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="Transferencia BCP">Transferencia BCP</option>
                  <option value="Yape">Yape</option>
                  <option value="Plin">Plin</option>
                  <option value="Efectivo">Efectivo en Caja</option>
                  <option value="Transferencia BBVA">Transferencia BBVA</option>
                  <option value="Interbank">Interbank</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fila: Nro Comprobante / Recibo por Honorarios y Observaciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#383228] mb-1">
                N° de Recibo / Comprobante / Operación (Opcional):
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-[#8C8377] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="Ej: RHE-0012, Boleta B01-44, Op. 98210"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#DDD5CA] rounded-xl text-xs font-medium text-[#26211B] focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#383228] mb-1">
                Notas / Observaciones (Opcional):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones de caja, quincena, etc."
                className="w-full px-3 py-2 bg-white border border-[#DDD5CA] rounded-xl text-xs font-medium text-[#26211B] focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#F0EBE3] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-[#6D6457] hover:text-[#26211B] px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>{expenseToEdit ? 'Guardar Cambios de Gasto' : 'Registrar Egreso'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
