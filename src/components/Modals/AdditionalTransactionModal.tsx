import React, { useState } from 'react';
import { 
  AdditionalIncomeRecord, 
  ExpenseRecord, 
  SedeId, 
  PaymentMethod, 
  AdditionalIncomeCategory,
  ExpenseCategory,
  Sede 
} from '../../types';
import { X, TrendingUp, TrendingDown, DollarSign, Check, Tag, Calendar, User, FileText } from 'lucide-react';
import { INITIAL_SEDES } from '../../data/initialData';

interface AdditionalTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'income' | 'expense';
  selectedSede?: SedeId | 'todas';
  sedes?: Sede[];
  onSaveIncome: (income: AdditionalIncomeRecord) => void;
  onSaveExpense: (expense: ExpenseRecord) => void;
  onOpenReceipt?: (income: AdditionalIncomeRecord) => void;
}

export const AdditionalTransactionModal: React.FC<AdditionalTransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'income',
  selectedSede = 'todas',
  sedes = INITIAL_SEDES,
  onSaveIncome,
  onSaveExpense,
  onOpenReceipt,
}) => {
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(defaultType);

  // Common Fields
  const [amount, setAmount] = useState<number | ''>('');
  const [concept, setConcept] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sede, setSede] = useState<SedeId>(selectedSede !== 'todas' ? selectedSede : 'mi_peru');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [notes, setNotes] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');

  // Income Specific
  const [incomeCategory, setIncomeCategory] = useState<AdditionalIncomeCategory>('uniformes');
  const [payerName, setPayerName] = useState('');
  const [receivedBy, setReceivedBy] = useState('Marina Castillo (Recepción)');

  // Expense Specific
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('materiales');
  const [beneficiaryName, setBeneficiaryName] = useState('');

  if (!isOpen) return null;

  const quickIncomeSuggestions = [
    { label: '👕 Venta de Polo / Uniforme', concept: 'Venta de Polo Institucional Semillas', cat: 'uniformes' as AdditionalIncomeCategory, amount: 35 },
    { label: '📚 Cuaderno de Estimulación', concept: 'Cuadernillo de Trabajo y Estimulación', cat: 'materiales' as AdditionalIncomeCategory, amount: 40 },
    { label: '🎨 Taller Vacacional / Especial', concept: 'Inscripción Taller de Pintura y Arte', cat: 'talleres' as AdditionalIncomeCategory, amount: 80 },
    { label: '🏢 Alquiler de Sala / Espacio', concept: 'Alquiler de Espacio para Terapia / Evento', cat: 'alquiler_espacio' as AdditionalIncomeCategory, amount: 100 },
    { label: '📜 Constancia / Certificado', concept: 'Emisión de Constancia de Estudios', cat: 'certificados' as AdditionalIncomeCategory, amount: 20 },
  ];

  const quickExpenseSuggestions = [
    { label: '📄 Fotocopias / Impresiones', concept: 'Fotocopias de fichas y material didáctico', cat: 'materiales' as ExpenseCategory, amount: 15 },
    { label: '🧹 Artículos de Limpieza', concept: 'Compra de lejía, papel toalla y desinfectante', cat: 'materiales' as ExpenseCategory, amount: 30 },
    { label: '🚌 Movilidad / Pasajes', concept: 'Pasajes para trámite y compras institucionales', cat: 'otros' as ExpenseCategory, amount: 12 },
    { label: '🥪 Refrigerio Docente / Taller', concept: 'Refrigerio para reunión de padres / docentes', cat: 'otros' as ExpenseCategory, amount: 25 },
    { label: '🔧 Reparación / Cerrajería', concept: 'Arreglo menor de cerradura y tomacorriente', cat: 'mantenimiento' as ExpenseCategory, amount: 40 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      alert('Por favor ingresa un monto válido mayor a cero.');
      return;
    }

    if (!concept.trim()) {
      alert('Por favor ingresa la descripción o concepto.');
      return;
    }

    const timestamp = Date.now().toString();

    if (transactionType === 'income') {
      const newIncome: AdditionalIncomeRecord = {
        id: `inc_${timestamp}`,
        concept: concept.trim(),
        category: incomeCategory,
        amount: numericAmount,
        date,
        sede,
        paymentMethod,
        payerName: payerName.trim() || 'Cliente / Apoderado',
        referenceNumber: referenceNumber.trim() || `ING-${timestamp.slice(-5)}`,
        receivedBy: receivedBy.trim() || 'Caja Semillas',
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
      };

      onSaveIncome(newIncome);
      if (onOpenReceipt && window.confirm('¿Deseas emitir y ver el recibo oficial para este ingreso adicional?')) {
        onOpenReceipt(newIncome);
      }
    } else {
      const newExpense: ExpenseRecord = {
        id: `exp_${timestamp}`,
        category: expenseCategory,
        description: concept.trim(),
        amount: numericAmount,
        date,
        sede,
        paymentMethod,
        beneficiaryName: beneficiaryName.trim() || 'Caja Chica',
        receiptNumber: referenceNumber.trim() || `GAS-${timestamp.slice(-5)}`,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
      };

      onSaveExpense(newExpense);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#EAE3D6] overflow-hidden my-auto"
        id="additional-transaction-modal"
      >
        {/* Header with Type Selector */}
        <div className="bg-[#FAF7F2] p-5 border-b border-[#ECE5DA]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#2A251E] flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-700" />
              Movimiento de Caja
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border border-[#E0D7C9] text-[#786E60] hover:text-[#2A251E] hover:bg-[#F2ECE3] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Switch Tab: Ingreso Adicional vs Gasto de Caja */}
          <div className="grid grid-cols-2 p-1 bg-[#ECE5DA] rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setTransactionType('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                transactionType === 'income'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-[#655D50] hover:text-[#2A251E]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>+ Ingreso Adicional</span>
            </button>

            <button
              type="button"
              onClick={() => setTransactionType('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                transactionType === 'expense'
                  ? 'bg-rose-700 text-white shadow-sm'
                  : 'text-[#655D50] hover:text-[#2A251E]'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>- Gasto de Caja</span>
            </button>
          </div>
        </div>

        {/* Quick presets pills */}
        <div className="px-5 pt-3 pb-1 bg-white border-b border-[#F0EAE1]">
          <p className="text-[11px] font-semibold text-[#8C8273] uppercase tracking-wider mb-2">
            Sugerencias Rápidas:
          </p>
          <div className="flex flex-wrap gap-1.5 pb-2">
            {transactionType === 'income'
              ? quickIncomeSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setConcept(item.concept);
                      setIncomeCategory(item.cat);
                      setAmount(item.amount);
                    }}
                    className="text-[11px] bg-[#FAF7F2] hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-[#E6DFD3] text-[#554E43] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {item.label} (S/ {item.amount})
                  </button>
                ))
              : quickExpenseSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setConcept(item.concept);
                      setExpenseCategory(item.cat);
                      setAmount(item.amount);
                    }}
                    className="text-[11px] bg-[#FAF7F2] hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 border border-[#E6DFD3] text-[#554E43] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {item.label} (S/ {item.amount})
                  </button>
                ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Monto & Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#453E33] mb-1">
                Monto (S/.) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-[#6D6456]">
                  S/.
                </span>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-base font-bold rounded-xl border border-[#D8CFC2] focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-[#FAF8F5] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#453E33] mb-1">
                Fecha de Operación *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-[#D8CFC2] bg-[#FAF8F5] outline-none"
              />
            </div>
          </div>

          {/* Concepto */}
          <div>
            <label className="block text-xs font-bold text-[#453E33] mb-1">
              {transactionType === 'income' ? 'Concepto del Ingreso *' : 'Concepto del Gasto *'}
            </label>
            <input
              type="text"
              required
              placeholder={
                transactionType === 'income'
                  ? 'Ej: Venta de polo semillitas talla 8 / Taller vacacional'
                  : 'Ej: Fotocopias para clase de estimulación temprana'
              }
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D8CFC2] bg-[#FAF8F5] outline-none focus:border-emerald-600"
            />
          </div>

          {/* Categoría & Sede */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#453E33] mb-1">
                Categoría *
              </label>
              {transactionType === 'income' ? (
                <select
                  value={incomeCategory}
                  onChange={(e) => setIncomeCategory(e.target.value as AdditionalIncomeCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8CFC2] bg-[#FAF8F5] outline-none"
                >
                  <option value="uniformes">👕 Venta de Uniformes / Polos</option>
                  <option value="materiales">📚 Materiales y Cuadernillos</option>
                  <option value="talleres">🎨 Talleres y Cursos Libres</option>
                  <option value="alquiler_espacio">🏢 Alquiler de Sala / Espacio</option>
                  <option value="eventos">🎪 Eventos / Kermesse / Actividades</option>
                  <option value="certificados">📜 Certificados y Constancias</option>
                  <option value="otros">✨ Otros Ingresos Adicionales</option>
                </select>
              ) : (
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8CFC2] bg-[#FAF8F5] outline-none"
                >
                  <option value="materiales">📚 Materiales e Impresiones</option>
                  <option value="mantenimiento">🔧 Mantenimiento y Arreglos</option>
                  <option value="servicios">💡 Servicios Básicos</option>
                  <option value="profesores">👩‍🏫 Honorarios Docentes</option>
                  <option value="alquiler">🏢 Alquiler</option>
                  <option value="otros">📦 Otros Gastos Menores</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#453E33] mb-1">
                Sede *
              </label>
              <select
                value={sede}
                onChange={(e) => setSede(e.target.value as SedeId)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8CFC2] bg-[#FAF8F5] outline-none"
              >
                {sedes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Método de Pago & N° Comprobante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#453E33] mb-1">
                Método de Pago *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8CFC2] bg-[#FAF8F5] outline-none"
              >
                <option value="Efectivo">💵 Efectivo (Caja)</option>
                <option value="Yape">🟣 Yape</option>
                <option value="Plin">🔵 Plin</option>
                <option value="Transferencia BCP">🏦 Transferencia BCP</option>
                <option value="Transferencia BBVA">🏦 Transferencia BBVA</option>
                <option value="Otro">💳 Tarjeta / Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#453E33] mb-1">
                N° de Referencia / Boleta
              </label>
              <input
                type="text"
                placeholder="Ej: B001-492 / Ope: 981245"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8CFC2] bg-[#FAF8F5] outline-none"
              />
            </div>
          </div>

          {/* Persona involucrada */}
          {transactionType === 'income' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#453E33] mb-1">
                  Pagado por (Cliente / Apoderado)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sra. Vanessa Torres / Público"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8CFC2] bg-[#FAF8F5] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#453E33] mb-1">
                  Cobrado / Recibido por
                </label>
                <input
                  type="text"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8CFC2] bg-[#FAF8F5] outline-none"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-[#453E33] mb-1">
                Beneficiario / Proveedor / Encargado del Gasto
              </label>
              <input
                type="text"
                placeholder="Ej: Librería San Jerónimo / Chofer Movilidad / Personal de Limpieza"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8CFC2] bg-[#FAF8F5] outline-none"
              />
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-bold text-[#453E33] mb-1">
              Notas u Observaciones (Opcional)
            </label>
            <input
              type="text"
              placeholder="Detalles adicionales sobre el movimiento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8CFC2] bg-[#FAF8F5] outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#ECE5DA] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#665E52] hover:bg-[#F2ECE3] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all cursor-pointer ${
                transactionType === 'income'
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : 'bg-rose-700 hover:bg-rose-800'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {transactionType === 'income'
                  ? 'Guardar Ingreso Adicional'
                  : 'Registrar Gasto de Caja'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
