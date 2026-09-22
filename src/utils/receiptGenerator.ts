import { jsPDF } from 'jspdf';
import { formatSoles } from './dateUtils';

export interface ReceiptData {
  receiptNum: string;
  paymentDate: string;
  studentName: string;
  studentDni?: string;
  guardianName?: string;
  guardianRelation?: string;
  studentProgram?: string;
  paymentConcept: string;
  paymentAmount: number;
  paymentMethod: string;
  receivedBy: string;
  paymentNotes?: string;
  sedeName: string;
  sedeAddress: string;
  sedePhone: string;
}

/**
 * Generates an ultra-crisp HTML5 canvas representation of the official receipt.
 * Bypasses all DOM / CSS / oklch / iframe restrictions with 100% guarantee.
 */
export async function generateReceiptCanvas(data: ReceiptData): Promise<HTMLCanvasElement> {
  const width = 800;
  const height = 1060;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo inicializar el contexto 2D de canvas');
  }

  // 1. Background Paper
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Outer subtle border
  ctx.strokeStyle = '#E2DCD2';
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Top color bar
  ctx.fillStyle = '#BE123C'; // Rose-700
  ctx.fillRect(16, 16, width - 32, 8);

  let currentY = 56;

  // 2. Header & Branding
  // Rainbow decorative arc
  const arcCenterX = width / 2;
  const arcCenterY = currentY + 38;
  const drawArc = (radius: number, color: string, strokeWidth: number) => {
    ctx.beginPath();
    ctx.arc(arcCenterX, arcCenterY, radius, Math.PI, 0, false);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  };
  drawArc(36, '#E11D48', 4); // Rose
  drawArc(31, '#F97316', 3.5); // Orange
  drawArc(26, '#FBBF24', 3); // Yellow
  drawArc(22, '#10B981', 2.5); // Emerald
  drawArc(18, '#06B6D4', 2.5); // Cyan

  currentY += 46;

  // Institution Name
  ctx.fillStyle = '#BE123C';
  ctx.font = 'bold 26px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SEMILLAS DEL REINO', width / 2, currentY);

  currentY += 22;
  ctx.fillStyle = '#4B5563';
  ctx.font = 'bold 12px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText('CENTRO DE DESARROLLO INFANTIL Y REFUERZO', width / 2, currentY);

  currentY += 20;
  ctx.fillStyle = '#6B7280';
  ctx.font = 'normal 12px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${data.sedeName} • ${data.sedeAddress}`, width / 2, currentY);

  currentY += 18;
  ctx.fillStyle = '#9CA3AF';
  ctx.font = 'normal 11px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Teléfono: ${data.sedePhone} • RUC: 20608945123`, width / 2, currentY);

  currentY += 24;

  // Dashed Separator
  ctx.beginPath();
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 1.5;
  ctx.moveTo(40, currentY);
  ctx.lineTo(width - 40, currentY);
  ctx.stroke();
  ctx.setLineDash([]); // Reset dash

  currentY += 26;

  // 3. Receipt Title & Number
  ctx.textAlign = 'left';
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 16px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText('COMPROBANTE DE PAGO INSTITUCIONAL', 40, currentY);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#6B7280';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('FECHA DE PAGO', width - 40, currentY - 6);
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
  ctx.fillText(data.paymentDate, width - 40, currentY + 12);

  currentY += 16;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#6B7280';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(`N° ${data.receiptNum}`, 40, currentY);

  currentY += 22;

  // Solid separator
  ctx.beginPath();
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1;
  ctx.moveTo(40, currentY);
  ctx.lineTo(width - 40, currentY);
  ctx.stroke();

  currentY += 24;

  // 4. Student & Guardian Info Box
  ctx.fillStyle = '#F9FAFB';
  ctx.fillRect(40, currentY - 14, width - 80, 110);
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1;
  ctx.strokeRect(40, currentY - 14, width - 80, 110);

  // Line 1: Student Name
  ctx.textAlign = 'left';
  ctx.fillStyle = '#6B7280';
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('ALUMNO / CLIENTE:', 56, currentY + 8);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText(data.studentName, 185, currentY + 8);

  if (data.studentDni) {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#6B7280';
    ctx.font = 'normal 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(`DNI: ${data.studentDni}`, width - 56, currentY + 8);
    ctx.textAlign = 'left';
  }

  // Line 2: Guardian
  currentY += 32;
  if (data.guardianName) {
    ctx.fillStyle = '#6B7280';
    ctx.font = 'normal 12px system-ui, -apple-system, sans-serif';
    ctx.fillText('Apoderado:', 56, currentY + 8);

    ctx.fillStyle = '#1F2937';
    ctx.font = '500 13px system-ui, -apple-system, sans-serif';
    const guardianInfo = data.guardianRelation
      ? `${data.guardianName} (${data.guardianRelation})`
      : data.guardianName;
    ctx.fillText(guardianInfo, 185, currentY + 8);
  } else {
    ctx.fillStyle = '#6B7280';
    ctx.font = 'normal 12px system-ui, -apple-system, sans-serif';
    ctx.fillText('Atención:', 56, currentY + 8);
    ctx.fillStyle = '#1F2937';
    ctx.font = '500 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('Recepción de Pagos', 185, currentY + 8);
  }

  // Line 3: Program / Sede
  currentY += 30;
  ctx.fillStyle = '#6B7280';
  ctx.font = 'normal 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('Programa / Servicio:', 56, currentY + 8);

  ctx.fillStyle = '#1F2937';
  ctx.font = '500 13px system-ui, -apple-system, sans-serif';
  ctx.fillText(data.studentProgram || 'Mensualidad Escolar Regular', 185, currentY + 8);

  currentY += 40;

  // 5. Concept & Total Amount Section
  ctx.fillStyle = '#F3F4F6';
  ctx.fillRect(40, currentY, width - 80, 32);

  ctx.fillStyle = '#4B5563';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('CONCEPTO / DETALLE DEL PAGO', 56, currentY + 20);

  ctx.textAlign = 'right';
  ctx.fillText('MONTO CANCELADO', width - 56, currentY + 20);
  ctx.textAlign = 'left';

  currentY += 44;

  // Payment Concept text
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 15px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText(data.paymentConcept, 56, currentY);

  // Big Amount in Crimson
  ctx.textAlign = 'right';
  ctx.fillStyle = '#BE123C';
  ctx.font = 'bold 24px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText(formatSoles(data.paymentAmount), width - 56, currentY + 6);
  ctx.textAlign = 'left';

  if (data.paymentNotes) {
    currentY += 20;
    ctx.fillStyle = '#6B7280';
    ctx.font = 'italic 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Nota: ${data.paymentNotes}`, 56, currentY);
  }

  currentY += 28;

  // Solid separator
  ctx.beginPath();
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1;
  ctx.moveTo(40, currentY);
  ctx.lineTo(width - 40, currentY);
  ctx.stroke();

  currentY += 26;

  // 6. Payment Method & Cashier
  ctx.fillStyle = '#6B7280';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('MÉTODO DE PAGO:', 56, currentY);

  // Pill for Payment Method
  ctx.fillStyle = '#ECFDF5'; // Emerald 50
  ctx.strokeStyle = '#A7F3D0'; // Emerald 200
  ctx.lineWidth = 1;
  const methodText = data.paymentMethod.toUpperCase();
  ctx.strokeRect(170, currentY - 14, 130, 24);
  ctx.fillRect(170, currentY - 14, 130, 24);

  ctx.fillStyle = '#065F46'; // Emerald 800
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(methodText, 170 + 65, currentY + 2);
  ctx.textAlign = 'left';

  // Cashier on right
  ctx.textAlign = 'right';
  ctx.fillStyle = '#6B7280';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('RECIBIDO POR:', width - 190, currentY);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  ctx.fillText(data.receivedBy, width - 56, currentY);
  ctx.textAlign = 'left';

  currentY += 50;

  // 7. Signature Line & Cancellation Rubber Stamp
  // Signature on Left
  const sigY = currentY + 70;
  ctx.beginPath();
  ctx.strokeStyle = '#9CA3AF';
  ctx.lineWidth = 1.2;
  ctx.moveTo(60, sigY);
  ctx.lineTo(260, sigY);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#6B7280';
  ctx.font = 'normal 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('Firma / Sello de Caja y Recepción', 160, sigY + 18);
  ctx.fillStyle = '#9CA3AF';
  ctx.font = 'normal 10px system-ui, -apple-system, sans-serif';
  ctx.fillText(data.receivedBy, 160, sigY + 32);

  // Official Circular Rubber Stamp on Right
  const stampCenterX = width - 170;
  const stampCenterY = currentY + 50;

  ctx.save();
  ctx.translate(stampCenterX, stampCenterY);
  ctx.rotate((-6 * Math.PI) / 180); // Slight tilt for authentic stamp look

  // Stamp Outer Circle (Dashed)
  ctx.beginPath();
  ctx.arc(0, 0, 78, 0, 2 * Math.PI);
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 3.5;
  ctx.setLineDash([7, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Stamp Inner Circle (Double line effect)
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, 2 * Math.PI);
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Faint reddish tint inside stamp
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(254, 242, 242, 0.5)';
  ctx.fill();

  // Stamp Texts
  ctx.fillStyle = '#B91C1C';
  ctx.textAlign = 'center';
  ctx.font = 'bold 9px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText('SEMILLAS DEL REINO', 0, -50);

  ctx.font = 'bold 7px system-ui, -apple-system, sans-serif';
  ctx.fillText('CENTRO DE DESARROLLO', 0, -38);

  // Middle CANCELADO Box
  ctx.strokeStyle = '#B91C1C';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-60, -26);
  ctx.lineTo(60, -26);
  ctx.moveTo(-60, 16);
  ctx.lineTo(60, 16);
  ctx.stroke();

  ctx.fillStyle = '#991B1B';
  ctx.font = 'bold 15px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText('★ CANCELADO ★', 0, -6);

  ctx.font = 'bold 10px monospace';
  ctx.fillText(data.paymentDate, 0, 9);

  // Bottom stamp text
  ctx.fillStyle = '#B91C1C';
  ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
  ctx.fillText('TESORERÍA Y CAJA', 0, 32);

  ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
  const stampSede = data.sedeName.toLowerCase().includes('ventanilla')
    ? 'SEDE VENTANILLA'
    : 'SEDE MI PERÚ';
  ctx.fillText(stampSede, 0, 46);

  ctx.restore();

  // 8. Biblical Verse & Official Footer
  currentY = height - 85;

  ctx.beginPath();
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1;
  ctx.moveTo(40, currentY);
  ctx.lineTo(width - 40, currentY);
  ctx.stroke();

  currentY += 24;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#4B5563';
  ctx.font = 'italic 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('"Instruye al niño en su camino, y aun cuando fuere viejo no se apartará de él."', width / 2, currentY);

  currentY += 20;
  ctx.fillStyle = '#9CA3AF';
  ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
  ctx.fillText('COMPROBANTE OFICIAL VÁLIDO PARA CONTROL ADMINISTRATIVO INTERNO • SEMILLAS DEL REINO', width / 2, currentY);

  return canvas;
}

/**
 * Downloads the receipt as high-resolution PNG
 */
export async function downloadReceiptImage(data: ReceiptData): Promise<boolean> {
  try {
    const canvas = await generateReceiptCanvas(data);
    const dataUrl = canvas.toDataURL('image/png', 1.0);

    const safeStudentName = (data.studentName || 'alumno')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    const safeNum = (data.receiptNum || 'REC-0001').replace(/[^\w-]/g, '');
    const filename = `Recibo-Semillas-${safeNum}-${safeStudentName}.png`;

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (err) {
    console.error('Error generating receipt PNG:', err);
    throw err;
  }
}

/**
 * Generates and downloads a genuine PDF file directly using jsPDF
 */
export async function downloadReceiptPdf(data: ReceiptData): Promise<boolean> {
  try {
    const canvas = await generateReceiptCanvas(data);
    const imgData = canvas.toDataURL('image/png', 1.0);

    // Standard A4: 210 x 297 mm, or Letter format
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297

    // Scale canvas to fit nicely with elegant margins
    const margin = 15;
    const imgWidth = pageWidth - margin * 2; // 180mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', margin, 12, imgWidth, imgHeight, undefined, 'FAST');

    const safeStudentName = (data.studentName || 'alumno')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    const safeNum = (data.receiptNum || 'REC-0001').replace(/[^\w-]/g, '');
    const filename = `Recibo-Semillas-${safeNum}-${safeStudentName}.pdf`;

    pdf.save(filename);
    return true;
  } catch (err) {
    console.error('Error generating receipt PDF:', err);
    throw err;
  }
}

/**
 * Opens a print-friendly preview window with clean HTML/CSS that always prints properly
 */
export async function printReceipt(data: ReceiptData): Promise<void> {
  try {
    const canvas = await generateReceiptCanvas(data);
    const imgData = canvas.toDataURL('image/png', 1.0);

    // Create an invisible iframe for reliable printing
    let iframe = document.getElementById('receipt-print-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'receipt-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Recibo - ${data.receiptNum}</title>
            <style>
              @page { size: auto; margin: 10mm; }
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: #fff; }
              img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
            </style>
          </head>
          <body>
            <img src="${imgData}" onload="window.focus(); window.print();" />
          </body>
        </html>
      `);
      doc.close();
      return;
    }

    // Fallback: direct window.print()
    window.print();
  } catch (err) {
    console.warn('Iframe print failed, falling back to PDF download:', err);
    // If printing fails (e.g. strict iframe policy), download PDF automatically
    await downloadReceiptPdf(data);
  }
}

export interface ExpenseVoucherData {
  voucherNum: string;
  date: string;
  categoryLabel: string;
  beneficiaryName: string;
  description: string;
  paymentMethod: string;
  receiptNumber?: string;
  notes?: string;
  amount: number;
  sedeName: string;
  sedeAddress: string;
}

/**
 * Generates an ultra-crisp HTML5 canvas for Expense Vouchers (Vales de Egreso)
 */
export async function generateExpenseVoucherCanvas(data: ExpenseVoucherData): Promise<HTMLCanvasElement> {
  const width = 800;
  const height = 980;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo inicializar el contexto 2D');
  }

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Border
  ctx.strokeStyle = '#E2DCD2';
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Top Amber Header
  ctx.fillStyle = '#D97706'; // Amber-600
  ctx.fillRect(16, 16, width - 32, 8);

  let currentY = 56;

  // Header
  ctx.fillStyle = '#92400E';
  ctx.font = 'bold 24px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SEMILLAS DEL REINO', width / 2, currentY);

  currentY += 22;
  ctx.fillStyle = '#4B5563';
  ctx.font = 'bold 12px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText('CENTRO DE DESARROLLO INFANTIL Y REFUERZO', width / 2, currentY);

  currentY += 20;
  ctx.fillStyle = '#6B7280';
  ctx.font = 'normal 12px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${data.sedeName} • ${data.sedeAddress}`, width / 2, currentY);

  currentY += 28;

  // Title Pill
  ctx.fillStyle = '#FEF3C7';
  ctx.strokeStyle = '#FCD34D';
  ctx.lineWidth = 1;
  ctx.strokeRect(width / 2 - 170, currentY - 16, 340, 32);
  ctx.fillRect(width / 2 - 170, currentY - 16, 340, 32);

  ctx.fillStyle = '#92400E';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('COMPROBANTE DE EGRESO / VALE DE CAJA', width / 2, currentY + 6);

  currentY += 34;
  ctx.fillStyle = '#6B7280';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`N° ${data.voucherNum}`, width / 2, currentY);

  currentY += 24;

  // Dashed Separator
  ctx.beginPath();
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 1.5;
  ctx.moveTo(40, currentY);
  ctx.lineTo(width - 40, currentY);
  ctx.stroke();
  ctx.setLineDash([]);

  currentY += 30;

  // Key Value rows
  const drawRow = (label: string, value: string, isBold = false) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6B7280';
    ctx.font = 'normal 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(label, 56, currentY);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#111827';
    ctx.font = isBold ? 'bold 14px system-ui, -apple-system, sans-serif' : '500 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(value, width - 56, currentY);

    currentY += 20;
    ctx.beginPath();
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 1;
    ctx.moveTo(56, currentY);
    ctx.lineTo(width - 56, currentY);
    ctx.stroke();

    currentY += 22;
  };

  drawRow('Fecha del Pago / Salida:', data.date, true);
  drawRow('Categoría de Gasto:', data.categoryLabel);
  drawRow('Beneficiario / Docente:', data.beneficiaryName, true);
  drawRow('Concepto / Detalle:', data.description);
  drawRow('Medio de Pago:', data.paymentMethod);
  if (data.receiptNumber) {
    drawRow('N° Recibo / Comprobante Externo:', data.receiptNumber);
  }
  if (data.notes) {
    drawRow('Observaciones:', data.notes);
  }

  currentY += 10;

  // Total Amount Box
  ctx.fillStyle = '#FFFBEB';
  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 1.5;
  ctx.fillRect(40, currentY, width - 80, 56);
  ctx.strokeRect(40, currentY, width - 80, 56);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#92400E';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('MONTO TOTAL PAGADO / EGRESO:', 60, currentY + 34);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 24px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText(formatSoles(data.amount), width - 60, currentY + 38);

  currentY += 110;

  // Signatures
  // Left: Entregado por (Caja)
  ctx.beginPath();
  ctx.strokeStyle = '#9CA3AF';
  ctx.lineWidth = 1.2;
  ctx.moveTo(70, currentY);
  ctx.lineTo(270, currentY);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#374151';
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('Entregado Por (Caja)', 170, currentY + 20);
  ctx.fillStyle = '#9CA3AF';
  ctx.font = 'normal 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('Semillas del Reino', 170, currentY + 36);

  // Right: Recibido por
  ctx.beginPath();
  ctx.strokeStyle = '#9CA3AF';
  ctx.lineWidth = 1.2;
  ctx.moveTo(width - 270, currentY);
  ctx.lineTo(width - 70, currentY);
  ctx.stroke();

  ctx.fillStyle = '#374151';
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('Recibido Por (Conforme)', width - 170, currentY + 20);
  ctx.fillStyle = '#9CA3AF';
  ctx.font = 'normal 11px system-ui, -apple-system, sans-serif';
  ctx.fillText(data.beneficiaryName, width - 170, currentY + 36);

  currentY = height - 50;
  ctx.fillStyle = '#9CA3AF';
  ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
  ctx.fillText('VALE INTERNO DE CONTROL DE EGRESOS • SEMILLAS DEL REINO', width / 2, currentY);

  return canvas;
}

export async function downloadExpenseVoucherImage(data: ExpenseVoucherData): Promise<boolean> {
  const canvas = await generateExpenseVoucherCanvas(data);
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const safeBeneficiary = (data.beneficiaryName || 'beneficiario')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const safeNum = (data.voucherNum || 'EGR-0001').replace(/[^\w-]/g, '');

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `Vale-Egreso-Semillas-${safeNum}-${safeBeneficiary}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

export async function downloadExpenseVoucherPdf(data: ExpenseVoucherData): Promise<boolean> {
  const canvas = await generateExpenseVoucherCanvas(data);
  const imgData = canvas.toDataURL('image/png', 1.0);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', margin, 12, imgWidth, imgHeight, undefined, 'FAST');

  const safeBeneficiary = (data.beneficiaryName || 'beneficiario')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const safeNum = (data.voucherNum || 'EGR-0001').replace(/[^\w-]/g, '');

  pdf.save(`Vale-Egreso-Semillas-${safeNum}-${safeBeneficiary}.pdf`);
  return true;
}

