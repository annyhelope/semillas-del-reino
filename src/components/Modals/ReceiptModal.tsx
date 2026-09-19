import React, { useState } from 'react';
import { PaymentRecord, Student, Sede } from '../../types';
import { formatSoles, getCleanPhone } from '../../utils/dateUtils';
import { LogoSemillas } from '../LogoSemillas';
import { X, Printer, Download, Share2, CheckCircle, Image as ImageIcon, Loader2, Copy, Check } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ReceiptModalProps {
  payment: PaymentRecord | null;
  student: Student | null;
  sede: Sede | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  student,
  sede,
  onClose,
}) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!payment) return null;

  // Safe data extraction with robust fallbacks to prevent any possible crash
  const paymentAmount = Number(payment.amount) || 0;
  const studentName = payment.studentName || student?.fullName || 'Alumno Matriculado';
  const paymentConcept = payment.concept || 'Mensualidad Institucional';
  const paymentDate = payment.date || new Date().toISOString().split('T')[0];
  const paymentMethod = payment.paymentMethod || 'Efectivo';
  const receivedBy = payment.receivedBy || 'Recepción y Caja';
  const paymentNotes = payment.notes || '';
  
  const receiptIdStr = String(payment.id || '');
  const receiptNum = payment.referenceNumber || (receiptIdStr ? `REC-${receiptIdStr.slice(-6).toUpperCase()}` : 'REC-0001');

  const sedeName = sede?.name || (paymentNotes.toLowerCase().includes('ventanilla') ? 'Sede Ventanilla (Deporte)' : 'Sede Principal (Mi Perú)');
  const sedeAddress = sede?.address || 'Av. Trujillo Mz. B Lt. 14, Distrito de Mi Perú, Callao';
  const sedePhone = sede?.phone || '987 654 321';

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Impresión directa no disponible en este entorno:', err);
      alert('La vista previa no permite impresión directa. Te recomendamos usar el botón "Descargar Imagen (PNG)".');
    }
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('printable-receipt-area');
    if (!element) {
      alert('No se pudo encontrar el comprobante para generar la imagen.');
      return;
    }

    try {
      setIsGeneratingImage(true);
      setDownloadSuccess(false);

      const canvas = await html2canvas(element, {
        scale: 2.2, // Crisp retina resolution
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeStudentName = studentName.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') || 'alumno';
      const safeNum = receiptNum.replace(/[^\w-]/g, '');
      link.href = image;
      link.download = `Recibo-Semillas-${safeNum}-${safeStudentName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Error al generar la imagen del recibo:', err);
      alert('Hubo un inconveniente al generar la imagen. Puedes usar la opción de Copiar Texto o Imprimir / PDF.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const receiptSummaryText = 
    `🧾 *COMPROBANTE OFICIAL DE PAGO - SEMILLAS DEL REINO*\n` +
    `N°: *${receiptNum}*\n` +
    `Fecha: ${paymentDate}\n` +
    `Alumno/a: *${studentName}*\n` +
    `Concepto: ${paymentConcept}\n` +
    `Total Pagado: *${formatSoles(paymentAmount)}*\n` +
    `Método: ${paymentMethod}\n` +
    `Atendido por: ${receivedBy}\n` +
    `Sede: ${sedeName}\n` +
    `¡Muchas gracias por su puntualidad y confianza! ✨`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(receiptSummaryText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const phoneToUse = student?.guardianPhone ? getCleanPhone(student.guardianPhone) : '';
    const phoneWithCountry = phoneToUse ? (phoneToUse.startsWith('51') ? phoneToUse : `51${phoneToUse}`) : '';
    const encodedText = encodeURIComponent(receiptSummaryText);
    
    if (phoneWithCountry) {
      window.open(`https://wa.me/${phoneWithCountry}?text=${encodedText}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      id="receipt-modal"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-[#E5DFD4] w-full max-w-lg overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Top actions bar (non-printable) */}
        <div className="bg-[#FAF7F2] px-5 py-3 border-b border-[#EFE8DF] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Pago Registrado • Recibo Oficial</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isGeneratingImage}
              className="flex items-center gap-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              title="Descargar este recibo con el sello oficial en formato de imagen PNG"
            >
              {isGeneratingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingImage ? 'Generando...' : 'Descargar PNG'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-[#F2EDE4] text-[#332E27] border border-[#DDD5CA] px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-[#999184] hover:text-[#332E27] p-1.5 rounded-xl hover:bg-[#EFE9DE] transition-colors cursor-pointer"
              title="Cerrar recibo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="bg-emerald-50 text-emerald-800 text-xs px-4 py-2 border-b border-emerald-200 flex items-center justify-between">
            <span>✓ Imagen descargada con el Sello Oficial de Semillas del Reino.</span>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="font-bold underline text-emerald-900 cursor-pointer ml-2"
            >
              Enviar por WhatsApp
            </button>
          </div>
        )}

        {copiedText && (
          <div className="bg-amber-50 text-amber-900 text-xs px-4 py-2 border-b border-amber-200 flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-amber-700" />
            <span>Texto del comprobante copiado al portapapeles para pegar en WhatsApp.</span>
          </div>
        )}

        {/* Printable Receipt Paper */}
        <div
          className="p-6 sm:p-8 bg-white text-[#2B2721] font-sans relative select-none"
          id="printable-receipt-area"
          style={{ minHeight: '500px' }}
        >
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-dashed border-[#DCD4C8]">
            <div className="flex justify-center mb-1">
              <LogoSemillas size="md" />
            </div>
            <p className="text-xs font-black text-rose-700 uppercase tracking-widest mt-1">
              Centro de Desarrollo Infantil y Refuerzo
            </p>
            <p className="text-[11px] text-[#696155] mt-0.5">
              {sedeName} • {sedeAddress}
            </p>
            <p className="text-[10px] text-[#82796B]">
              Teléfono: {sedePhone} • RUC: 20608945123
            </p>
          </div>

          {/* Receipt Title & Meta */}
          <div className="py-3 flex justify-between items-center text-xs border-b border-[#ECE5DA]">
            <div>
              <span className="font-extrabold text-[#2A251E] block text-xs sm:text-sm tracking-tight">
                COMPROBANTE DE PAGO INSTITUCIONAL
              </span>
              <span className="text-[#7A7266] font-mono text-[11px]">N° {receiptNum}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#7A7266] block uppercase font-bold">Fecha de Pago</span>
              <span className="font-bold text-[#2A251E]">{paymentDate}</span>
            </div>
          </div>

          {/* Student & Guardian Info */}
          <div className="py-3 space-y-1 text-xs border-b border-[#ECE5DA]">
            <div className="flex justify-between">
              <span className="text-[#7A7266]">Alumno/a:</span>
              <span className="font-bold text-[#201D18]">{studentName}</span>
            </div>
            {student && (
              <>
                {student.dni && (
                  <div className="flex justify-between">
                    <span className="text-[#7A7266]">DNI Alumno:</span>
                    <span className="font-mono text-[#201D18]">{student.dni}</span>
                  </div>
                )}
                {student.guardianName && (
                  <div className="flex justify-between">
                    <span className="text-[#7A7266]">Apoderado:</span>
                    <span className="text-[#201D18]">
                      {student.guardianName} {student.guardianRelation ? `(${student.guardianRelation})` : ''}
                    </span>
                  </div>
                )}
                {student.program && (
                  <div className="flex justify-between">
                    <span className="text-[#7A7266]">Programa:</span>
                    <span className="capitalize text-[#201D18]">
                      {student.program} {student.subProgram ? `- ${student.subProgram}` : ''}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Concept and Amount Table */}
          <div className="py-3.5 border-b-2 border-dashed border-[#DCD4C8]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#ECE5DA] text-left text-[#7A7266]">
                  <th className="py-1 font-semibold">Concepto / Detalle</th>
                  <th className="py-1 text-right font-semibold">Total Pagado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 font-medium text-[#201D18]">
                    <span className="font-bold block text-sm">{paymentConcept}</span>
                    {paymentNotes && (
                      <span className="block text-[11px] text-[#7A7266] font-normal mt-0.5">
                        Obs: {paymentNotes}
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-right font-black text-lg sm:text-xl text-rose-700 font-sans">
                    {formatSoles(paymentAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Method & Received By */}
          <div className="py-3 text-xs flex justify-between items-center text-[#554E44]">
            <div>
              <span className="text-[10px] text-[#888073] block uppercase font-bold">Medio de Pago:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {paymentMethod}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#888073] block uppercase font-bold">Caja / Recepción:</span>
              <span className="font-semibold text-[#201D18]">{receivedBy}</span>
            </div>
          </div>

          {/* Sello Oficial de Semillas del Reino */}
          <div className="relative py-4 flex justify-between items-center">
            {/* Signature line on left */}
            <div className="w-36 sm:w-40 border-t border-[#A8A093] pt-1 text-center text-[10px] text-[#726A5E] mt-8">
              Firma del Responsable de Caja
            </div>

            {/* Realistic Rubber Stamp on right */}
            <div
              className="inline-block transform -rotate-6 transition-transform hover:rotate-0"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(185, 28, 28, 0.15))' }}
            >
              <div
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-dashed border-[#B91C1C] flex flex-col items-center justify-center p-2 text-center text-[#B91C1C] bg-rose-50/40 relative"
                style={{
                  boxShadow: 'inset 0 0 0 2px #B91C1C, 0 0 0 2px #B91C1C',
                }}
              >
                <div className="text-[8px] font-black uppercase tracking-wider leading-none">
                  SEMILLAS DEL REINO
                </div>
                <div className="text-[7px] tracking-tight text-[#991B1B] font-semibold mt-0.5">
                  CENTRO DE DESARROLLO
                </div>

                <div className="my-1 py-0.5 px-2 border-y-2 border-[#B91C1C] w-full text-center">
                  <span className="text-xs font-black tracking-widest block leading-tight">
                    ★ CANCELADO ★
                  </span>
                  <span className="text-[8px] font-bold block uppercase tracking-tighter">
                    {paymentDate}
                  </span>
                </div>

                <div className="text-[7px] font-extrabold uppercase tracking-tight leading-tight">
                  TESORERÍA Y CAJA
                </div>
                <div className="text-[6.5px] font-semibold text-[#991B1B]">
                  {sedeName.toLowerCase().includes('ventanilla') ? 'SEDE VENTANILLA' : 'SEDE MI PERÚ'}
                </div>
              </div>
            </div>
          </div>

          {/* Blessing Footer */}
          <div className="pt-2 text-center space-y-1 border-t border-[#EDE6DC]">
            <p className="text-[11px] text-[#807769] italic">
              "Instruye al niño en su camino, y aun cuando fuere viejo no se apartará de él."
            </p>
            <p className="text-[9px] text-[#A39B8F] uppercase tracking-wider">
              Comprobante oficial válido para control administrativo interno
            </p>
          </div>
        </div>

        {/* Modal bottom actions (non-printable) */}
        <div className="bg-[#FAF7F2] px-5 sm:px-6 py-3 border-t border-[#EFE8DF] flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              title="Abrir WhatsApp para compartir comprobante"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#554D40] bg-white hover:bg-[#F2ECE2] border border-[#DDD5C8] px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              title="Copiar texto resumen del pago"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Texto</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isGeneratingImage}
              className="flex items-center gap-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{isGeneratingImage ? 'Descargando...' : 'Descargar Imagen'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#E8E2D6] hover:bg-[#DDD5C7] text-[#3D372E] rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
