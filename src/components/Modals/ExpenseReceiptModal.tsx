import React, { useState } from 'react';
import { ExpenseRecord, Sede } from '../../types';
import { formatSoles } from '../../utils/dateUtils';
import { LogoSemillas } from '../LogoSemillas';
import { X, Printer, Download, Image as ImageIcon, Loader2, Check, FileSpreadsheet } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ExpenseReceiptModalProps {
  expense: ExpenseRecord | null;
  sede: Sede | null;
  onClose: () => void;
}

export const ExpenseReceiptModal: React.FC<ExpenseReceiptModalProps> = ({
  expense,
  sede,
  onClose,
}) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!expense) return null;

  const expenseAmount = Number(expense.amount) || 0;
  const expenseIdStr = String(expense.id || '');
  const voucherNum = expense.receiptNumber || `EGR-${expenseIdStr.slice(-6).toUpperCase()}`;
  const sedeName = sede?.name || (expense.sede === 'ventanilla' ? 'Sede Ventanilla (Deporte)' : 'Sede Principal (Mi Perú)');
  const sedeAddress = sede?.address || 'Av. Trujillo Mz. B Lt. 14, Distrito de Mi Perú, Callao';

  const categoryLabels: Record<string, string> = {
    profesores: 'Pago a Profesoras / Docencia',
    alquiler: 'Alquiler de Local Institucional',
    servicios: 'Servicios Básicos (Luz / Agua / Internet)',
    materiales: 'Material Didáctico y Psicomotricidad',
    mantenimiento: 'Aseo, Limpieza y Mantenimiento',
    otros: 'Gasto Operativo General',
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      alert('La vista previa no permite impresión directa. Te recomendamos usar el botón "Descargar Comprobante (PNG)".');
    }
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('printable-expense-voucher-area');
    if (!element) {
      alert('No se pudo encontrar el comprobante para generar la imagen.');
      return;
    }

    try {
      setIsGeneratingImage(true);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `comprobante_egreso_${voucherNum}_${expense.beneficiaryName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Error al generar imagen de egreso:', err);
      alert('Ocurrió un inconveniente al generar la imagen. Puedes usar la opción de imprimir.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div 
        className="bg-white rounded-3xl border border-[#E5DFD4] w-full max-w-lg shadow-2xl overflow-hidden my-4"
        role="dialog"
        aria-modal="true"
      >
        {/* Actions Bar (No se imprime) */}
        <div className="bg-[#FAF7F2] p-4 border-b border-[#E8E1D5] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md">
              Vale de Egreso Oficial
            </span>
            <span className="text-xs text-[#71685B] font-mono">{voucherNum}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isGeneratingImage}
              className="flex items-center gap-1.5 text-xs font-bold text-[#3B342A] bg-white hover:bg-[#F3EFE9] border border-[#DDD5CA] px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              title="Descargar imagen PNG para archivar"
            >
              {isGeneratingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
              ) : downloadSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
              )}
              <span>{downloadSuccess ? '¡Descargado!' : 'Descargar PNG'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
              title="Imprimir vale de caja"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white border border-[#E0D8CD] text-[#71685B] hover:text-[#26211B] flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-expense-voucher-area" className="p-6 sm:p-7 bg-white text-[#26211B] space-y-4">
          {/* Header del Voucher */}
          <div className="border-b-2 border-dashed border-[#DDD5CA] pb-4 text-center">
            <div className="flex justify-center mb-1">
              <LogoSemillas size="sm" />
            </div>
            <h1 className="text-sm font-black tracking-tight text-[#26211B] uppercase">
              Semillas del Reino
            </h1>
            <p className="text-[11px] text-[#6B6255] font-medium">
              Centro de Desarrollo Infantil, Estimulación y Refuerzo
            </p>
            <p className="text-[10px] text-[#8C8377] mt-0.5">
              {sedeName} • {sedeAddress}
            </p>
            <div className="mt-2 inline-block bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-black uppercase px-3 py-0.5 rounded-md">
              COMPROBANTE DE EGRESO / VALE DE CAJA
            </div>
            <p className="text-[11px] text-[#7A7165] font-mono mt-1">N° {voucherNum}</p>
          </div>

          {/* Details Table */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#F0EBE3]">
              <span className="text-[#756C5F]">Fecha de Pago:</span>
              <span className="font-bold text-[#26211B]">{expense.date}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#F0EBE3]">
              <span className="text-[#756C5F]">Categoría:</span>
              <span className="font-bold text-[#26211B]">{categoryLabels[expense.category] || expense.category}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#F0EBE3]">
              <span className="text-[#756C5F]">Beneficiario / Docente:</span>
              <span className="font-black text-[#26211B]">{expense.beneficiaryName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#F0EBE3]">
              <span className="text-[#756C5F]">Concepto:</span>
              <span className="font-medium text-[#26211B] text-right max-w-[240px]">{expense.description}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#F0EBE3]">
              <span className="text-[#756C5F]">Medio de Pago:</span>
              <span className="font-bold text-[#26211B]">{expense.paymentMethod}</span>
            </div>

            {expense.receiptNumber && (
              <div className="flex justify-between py-1 border-b border-[#F0EBE3]">
                <span className="text-[#756C5F]">N° Comprobante / Recibo:</span>
                <span className="font-mono text-[#26211B]">{expense.receiptNumber}</span>
              </div>
            )}

            {expense.notes && (
              <div className="py-1 text-[11px] text-[#71685A] italic">
                Nota: {expense.notes}
              </div>
            )}
          </div>

          {/* Monto Destacado */}
          <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8E1D5] flex items-center justify-between">
            <span className="text-xs font-bold text-[#554E43] uppercase">Monto Total Pagado:</span>
            <span className="text-xl font-black text-amber-900">{formatSoles(expenseAmount)}</span>
          </div>

          {/* Firmas de Conformidad */}
          <div className="pt-6 grid grid-cols-2 gap-6 text-center text-[10px] text-[#696155]">
            <div>
              <div className="border-t border-[#A89F93] pt-1">
                <span className="font-bold block text-[#26211B]">Entregado Por (Caja)</span>
                <span>Semillas del Reino</span>
              </div>
            </div>
            <div>
              <div className="border-t border-[#A89F93] pt-1">
                <span className="font-bold block text-[#26211B]">Recibido Por (Conforme)</span>
                <span className="truncate block">{expense.beneficiaryName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
