import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { SalaryInputs, SalaryResults } from './salaryMath';

const formatCurrency = (val: number) => {
  if (isNaN(val)) return "$0";
  const roundedVal = Math.round((val + Number.EPSILON) * 100) / 100;
  return "$" + new Intl.NumberFormat("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(roundedVal);
};

export const exportSalaryToPDF = (inputs: SalaryInputs, results: SalaryResults, indicators: { uf: number; utm: number; dolar: number }) => {
  const doc = new jsPDF();

  // Colores corporativos Sabia Contable
  const colorMagenta = [216, 0, 115]; // #d80073
  const colorDark = [3, 32, 48]; // #032030

  // Encabezado
  doc.setFontSize(22);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text('Liquidación de Sueldo Simulada', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Generado por Sabia Contable | www.sabiacontable.cl', 14, 30);

  // Línea separadora
  doc.setDrawColor(colorMagenta[0], colorMagenta[1], colorMagenta[2]);
  doc.setLineWidth(0.5);
  doc.line(14, 35, 196, 35);

  // Información del contrato y variables base
  doc.setFontSize(12);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text('Condiciones del Contrato', 14, 45);

  autoTable(doc, {
    startY: 50,
    head: [['Dato', 'Valor']],
    body: [
      ['Tipo de Contrato', inputs.isContratoIndefinido ? 'Indefinido' : 'Plazo Fijo'],
      ['Sueldo Base', formatCurrency(inputs.sueldoBase)],
      ['Valor UF Utilizado', formatCurrency(indicators.uf)],
      ['Valor UTM Utilizado', formatCurrency(indicators.utm)],
      ['Gratificación Legal', inputs.isGratificacionLegal ? 'Sí (25% Tope)' : 'Manual'],
      ['AFP Seleccionada', inputs.afpId.toUpperCase()],
      ['Previsión Salud', inputs.saludType === 'isapre' ? `Isapre (${inputs.isapreUF} UF)` : 'Fonasa (7%)']
    ],
    theme: 'grid',
    headStyles: { fillColor: colorDark as [number, number, number], textColor: 255 },
    styles: { fontSize: 9 },
    margin: { bottom: 10 }
  });

  const currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  // Tablas divididas: Haberes y Descuentos
  doc.setFontSize(12);
  doc.text('Detalle de Liquidación', 14, currentY);

  const haberesData = [
    ['Sueldo Base', formatCurrency(inputs.sueldoBase)],
    ['Gratificación', formatCurrency(results.gratificacion)],
    ['Horas Extras', formatCurrency(results.valorHorasExtras)],
    ['Bonos', formatCurrency(inputs.bonos || 0)],
    ['Semana Corrida', formatCurrency(inputs.semanaCorrida || 0)],
    ['Comisiones', formatCurrency(inputs.comisiones || 0)],
    ['Colación (No Imp.)', formatCurrency(inputs.colacion || 0)],
    ['Movilización (No Imp.)', formatCurrency(inputs.movilizacion || 0)]
  ];

  const descuentosData = [
    ['AFP', formatCurrency(results.afpMonto)],
    [inputs.saludType === 'isapre' ? 'Salud (Isapre)' : 'Salud (7%)', formatCurrency(results.saludMonto)],
    ['Seguro de Cesantía', formatCurrency(results.cesantiaMonto)],
    ['Impuesto Único', formatCurrency(results.impuestoUnico)],
    ['APV', formatCurrency(inputs.apv || 0)]
  ];

  // Haberes
  autoTable(doc, {
    startY: currentY + 5,
    margin: { left: 14, right: 110 },
    head: [['Haberes', 'Monto']],
    body: haberesData,
    foot: [['Total Haberes', formatCurrency(results.totalHaberes)]],
    theme: 'grid',
    headStyles: { fillColor: [46, 204, 113], textColor: 255 }, // Emerald
    footStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: 'bold' },
    styles: { fontSize: 9 }
  });

  // Descuentos
  autoTable(doc, {
    startY: currentY + 5,
    margin: { left: 110, right: 14 },
    head: [['Descuentos', 'Monto']],
    body: descuentosData,
    foot: [['Total Descuentos', formatCurrency(results.totalDescuentos)]],
    theme: 'grid',
    headStyles: { fillColor: [231, 76, 60], textColor: 255 }, // Red
    footStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: 'bold' },
    styles: { fontSize: 9 }
  });

  const pdfDoc = doc as jsPDF & { lastAutoTable: { finalY: number } };
  const endY = Math.max(pdfDoc.lastAutoTable.finalY, pdfDoc.lastAutoTable.finalY);

  // Líquido a Pago
  doc.setDrawColor(colorMagenta[0], colorMagenta[1], colorMagenta[2]);
  doc.setFillColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.rect(14, endY + 15, 182, 20, 'F');

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('LÍQUIDO A PAGO:', 20, endY + 28);

  doc.setFontSize(16);
  doc.setTextColor(colorMagenta[0], colorMagenta[1], colorMagenta[2]);
  doc.text(formatCurrency(results.sueldoLiquido), 120, endY + 28, { align: 'left' });

  // Pie de página
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Este documento es una simulación referencial y no constituye un documento legal.', 14, 280);

  doc.save('Simulacion_Liquidacion_SabiaContable.pdf');
};

export const exportSalaryToExcel = async (inputs: SalaryInputs, results: SalaryResults, indicators: { uf: number; utm: number; dolar: number }) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Liquidación');

  // Configuración de columnas
  sheet.columns = [
    { header: '', key: 'col1', width: 3 },
    { header: 'Concepto', key: 'concepto', width: 35 },
    { header: 'Monto', key: 'monto', width: 20 },
  ];

  // Estilos base
  const titleFont = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  const headerFont = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  const currencyFormat = '"$"#,##0;[Red]\-"$"#,##0';

  // --- Encabezado Corporativo ---
  sheet.mergeCells('B2:C3');
  const titleCell = sheet.getCell('B2');
  titleCell.value = 'LIQUIDACIÓN DE SUELDO SIMULADA';
  titleCell.font = titleFont;
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF032030' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.mergeCells('B4:C4');
  const subTitleCell = sheet.getCell('B4');
  subTitleCell.value = 'Generado por Sabia Contable - www.sabiacontable.cl';
  subTitleCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FFD80073' } };
  subTitleCell.alignment = { horizontal: 'center' };

  let currentRow = 6;

  // --- Condiciones de Contrato ---
  sheet.getCell(`B${currentRow}`).value = 'CONDICIONES';
  sheet.getCell(`B${currentRow}`).font = headerFont;
  sheet.getCell(`B${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4169E1' } };
  sheet.getCell(`C${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4169E1' } };
  currentRow++;

  const addRow = (concepto: string, monto: number | string, isCurrency = true) => {
    const row = sheet.getRow(currentRow);
    row.getCell('B').value = concepto;
    row.getCell('C').value = monto;
    if (isCurrency && typeof monto === 'number') {
      row.getCell('C').numFmt = currencyFormat;
    }

    // Bordes ligeros
    ['B', 'C'].forEach(col => {
      row.getCell(col).border = {
        top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
        bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
        left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
        right: { style: 'thin', color: { argb: 'FFEEEEEE' } }
      };
    });
    currentRow++;
  };

  addRow('Tipo de Contrato', inputs.isContratoIndefinido ? 'Indefinido' : 'Plazo Fijo', false);
  addRow('AFP', inputs.afpId.toUpperCase(), false);
  addRow('Previsión de Salud', inputs.saludType === 'isapre' ? `Isapre (${inputs.isapreUF} UF)` : 'Fonasa (7%)', false);
  addRow('Valor UF', indicators.uf);
  addRow('Valor UTM', indicators.utm);

  currentRow++;

  // --- Haberes ---
  sheet.getCell(`B${currentRow}`).value = 'HABERES';
  sheet.getCell(`B${currentRow}`).font = headerFont;
  sheet.getCell(`B${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2ECC71' } };
  sheet.getCell(`C${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2ECC71' } };
  currentRow++;

  addRow('Sueldo Base', inputs.sueldoBase);
  addRow('Gratificación', results.gratificacion);
  addRow('Horas Extras', results.valorHorasExtras);
  addRow('Bonos', inputs.bonos || 0);
  addRow('Semana Corrida', inputs.semanaCorrida || 0);
  addRow('Comisiones', inputs.comisiones || 0);
  addRow('Colación (No Imp.)', inputs.colacion || 0);
  addRow('Movilización (No Imp.)', inputs.movilizacion || 0);

  sheet.getCell(`B${currentRow}`).value = 'TOTAL HABERES';
  sheet.getCell(`B${currentRow}`).font = { bold: true };
  sheet.getCell(`C${currentRow}`).value = results.totalHaberes;
  sheet.getCell(`C${currentRow}`).numFmt = currencyFormat;
  sheet.getCell(`C${currentRow}`).font = { bold: true };
  currentRow += 2;

  // --- Descuentos ---
  sheet.getCell(`B${currentRow}`).value = 'DESCUENTOS';
  sheet.getCell(`B${currentRow}`).font = headerFont;
  sheet.getCell(`B${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE74C3C' } };
  sheet.getCell(`C${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE74C3C' } };
  currentRow++;

  addRow('AFP', results.afpMonto);
  addRow(inputs.saludType === 'isapre' ? 'Salud (Isapre)' : 'Salud (7%)', results.saludMonto);
  addRow('Seguro de Cesantía', results.cesantiaMonto);
  addRow('Impuesto Único', results.impuestoUnico);
  addRow('APV', inputs.apv || 0);

  sheet.getCell(`B${currentRow}`).value = 'TOTAL DESCUENTOS';
  sheet.getCell(`B${currentRow}`).font = { bold: true };
  sheet.getCell(`C${currentRow}`).value = results.totalDescuentos;
  sheet.getCell(`C${currentRow}`).numFmt = currencyFormat;
  sheet.getCell(`C${currentRow}`).font = { bold: true };
  currentRow += 2;

  // --- LÍQUIDO A PAGO ---
  sheet.mergeCells(`B${currentRow}:C${currentRow}`);
  const footerTitle = sheet.getCell(`B${currentRow}`);
  footerTitle.value = 'LÍQUIDO A PAGO';
  footerTitle.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  footerTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF032030' } };
  footerTitle.alignment = { horizontal: 'center' };
  currentRow++;

  sheet.mergeCells(`B${currentRow}:C${currentRow}`);
  const footerValue = sheet.getCell(`B${currentRow}`);
  footerValue.value = results.sueldoLiquido;
  footerValue.numFmt = currencyFormat;
  footerValue.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFD80073' } };
  footerValue.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF032030' } };
  footerValue.alignment = { horizontal: 'center' };

  // Escribir y descargar
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'Simulacion_Liquidacion_SabiaContable.xlsx');
};
