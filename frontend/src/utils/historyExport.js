const LOW_PERCENT = 75;
const NOTE =
  'Attendance % = (Present + Leave) / Total days recorded. Leave days are counted as present.';
const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const pad = (n) => String(n).padStart(2, '0');

const stamp = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const generatedText = (iso) =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const stats = (s) => {
  const total = s.present + s.absent + s.leave;
  const percent = total > 0 ? Math.round(((s.present + s.leave) / total) * 1000) / 10 : null;
  return { total, percent };
};

const classAverage = (cls) => {
  const values = cls.students.map((s) => stats(s).percent).filter((p) => p !== null);
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, p) => sum + p, 0) / values.length) * 10) / 10;
};

const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/* ------------------------------ Excel ------------------------------ */

export async function downloadHistoryExcel(data) {
  const ExcelJS = (await import('exceljs/dist/exceljs.min.js')).default;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Smart Attendance';
  workbook.created = new Date(data.generatedAt);

  const thin = { style: 'thin', color: { argb: 'FFE2E8F0' } };
  const border = { top: thin, left: thin, bottom: thin, right: thin };

  const headerStyle = (cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = border;
  };

  const zebra = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

  // ---- Summary sheet ----
  const summary = workbook.addWorksheet('Summary', { views: [{ showGridLines: false }] });
  summary.columns = [{ width: 28 }, { width: 28 }, { width: 12 }, { width: 16 }, { width: 22 }];

  summary.mergeCells('A1:E1');
  summary.getCell('A1').value = 'Attendance History Report';
  summary.getCell('A1').font = { size: 18, bold: true, color: { argb: 'FF1D4ED8' } };

  summary.mergeCells('A2:E2');
  summary.getCell('A2').value = `Generated on ${generatedText(data.generatedAt)}`;
  summary.getCell('A2').font = { color: { argb: 'FF64748B' } };

  const summaryHead = summary.getRow(4);
  summaryHead.values = ['Class', 'Form Master', 'Students', 'Days Recorded', 'Average Attendance'];
  summaryHead.height = 22;
  summaryHead.eachCell(headerStyle);

  data.classes.forEach((cls, index) => {
    const average = classAverage(cls);
    const row = summary.addRow([
      cls.className,
      cls.teacherName,
      cls.students.length,
      cls.totalDays,
      average === null ? '' : average / 100,
    ]);
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      cell.border = border;
      cell.alignment = { vertical: 'middle', horizontal: col > 2 ? 'center' : 'left' };
      if (index % 2 === 1) cell.fill = zebra;
    });
    row.getCell(5).numFmt = '0.0%';
  });

  // ---- Har class ki sheet ----
  const used = new Set(['summary']);
  const sheetName = (raw) => {
    const base = (raw.replace(/[\\/?*[\]:]/g, ' ').trim() || 'Class').slice(0, 31);
    let name = base;
    let n = 2;
    while (used.has(name.toLowerCase())) {
      const suffix = ` (${n})`;
      name = base.slice(0, 31 - suffix.length) + suffix;
      n += 1;
    }
    used.add(name.toLowerCase());
    return name;
  };

  data.classes.forEach((cls) => {
    const sheet = workbook.addWorksheet(sheetName(cls.className), {
      views: [{ state: 'frozen', ySplit: 5, showGridLines: false }],
      pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });
    sheet.columns = [
      { width: 10 },
      { width: 28 },
      { width: 28 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 12 },
      { width: 14 },
    ];

    sheet.mergeCells('A1:H1');
    sheet.getCell('A1').value = cls.className;
    sheet.getCell('A1').font = { size: 18, bold: true, color: { argb: 'FF1D4ED8' } };

    sheet.mergeCells('A2:H2');
    sheet.getCell('A2').value = `Form Master: ${cls.teacherName}   |   Days recorded: ${cls.totalDays}`;
    sheet.getCell('A2').font = { size: 11, color: { argb: 'FF334155' } };

    sheet.mergeCells('A3:H3');
    sheet.getCell('A3').value = `Generated on ${generatedText(data.generatedAt)}`;
    sheet.getCell('A3').font = { color: { argb: 'FF64748B' } };

    const head = sheet.getRow(5);
    head.values = [
      'Roll No',
      'Student Name',
      'Father Name',
      'Present',
      'Absent',
      'Leave',
      'Total Days',
      'Attendance %',
    ];
    head.height = 22;
    head.eachCell(headerStyle);

    cls.students.forEach((s, i) => {
      const { total, percent } = stats(s);
      const row = sheet.addRow([
        s.rollNo,
        s.name,
        s.fatherName,
        s.present,
        s.absent,
        s.leave,
        total,
        percent === null ? '' : percent / 100,
      ]);
      row.eachCell({ includeEmpty: true }, (cell, col) => {
        cell.border = border;
        cell.alignment = {
          vertical: 'middle',
          horizontal: col === 2 || col === 3 ? 'left' : 'center',
        };
        if (i % 2 === 1) cell.fill = zebra;
      });
      row.getCell(8).numFmt = '0.0%';
      if (percent !== null && percent < LOW_PERCENT) {
        row.getCell(8).font = { bold: true, color: { argb: 'FFB91C1C' } };
        row.getCell(8).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
      }
    });

    const noteRow = sheet.rowCount + 2;
    sheet.mergeCells(`A${noteRow}:H${noteRow}`);
    sheet.getCell(`A${noteRow}`).value =
      cls.students.length === 0 ? 'No students in this class.' : NOTE;
    sheet.getCell(`A${noteRow}`).font = { italic: true, color: { argb: 'FF64748B' } };

    if (cls.students.length > 0) sheet.autoFilter = { from: 'A5', to: 'H5' };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveBlob(new Blob([buffer], { type: XLSX_TYPE }), `Attendance-History-${stamp(data.generatedAt)}.xlsx`);
}

/* ------------------------------- PDF ------------------------------- */

export async function downloadHistoryPdf(data) {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  const blue = [29, 78, 216];
  const slate = [100, 116, 139];

  // ---- Pehla page: Summary ----
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...blue);
  doc.text('Attendance History Report', margin, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...slate);
  doc.text(`Generated on ${generatedText(data.generatedAt)}`, margin, 80);

  autoTable(doc, {
    startY: 100,
    margin: { left: margin, right: margin, bottom: 40 },
    head: [['Class', 'Form Master', 'Students', 'Days Recorded', 'Avg Attendance']],
    body: data.classes.map((cls) => {
      const average = classAverage(cls);
      return [
        cls.className,
        cls.teacherName,
        String(cls.students.length),
        String(cls.totalDays),
        average === null ? '-' : `${average.toFixed(1)}%`,
      ];
    }),
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 6, lineColor: [226, 232, 240], lineWidth: 0.5 },
    headStyles: { fillColor: blue, textColor: 255, halign: 'center' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
    },
  });

  // ---- Har class ka alag page ----
  data.classes.forEach((cls) => {
    doc.addPage();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...blue);
    doc.text(cls.className, margin, 56);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text(`Form Master: ${cls.teacherName}   |   Days recorded: ${cls.totalDays}`, margin, 76);

    doc.setFontSize(9);
    doc.setTextColor(...slate);
    doc.text(NOTE, margin, 94);

    if (cls.students.length === 0) {
      doc.setFontSize(11);
      doc.text('No students in this class.', margin, 124);
      return;
    }

    const percents = cls.students.map((s) => stats(s).percent);

    autoTable(doc, {
      startY: 108,
      margin: { left: margin, right: margin, bottom: 40 },
      head: [
        ['Roll No', 'Student Name', 'Father Name', 'Present', 'Absent', 'Leave', 'Total', 'Attendance %'],
      ],
      body: cls.students.map((s) => {
        const { total, percent } = stats(s);
        return [
          String(s.rollNo),
          s.name,
          s.fatherName,
          String(s.present),
          String(s.absent),
          String(s.leave),
          String(total),
          percent === null ? '-' : `${percent.toFixed(1)}%`,
        ];
      }),
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 5, lineColor: [226, 232, 240], lineWidth: 0.5 },
      headStyles: { fillColor: blue, textColor: 255, halign: 'center' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 45 },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'center' },
      },
      didParseCell: (hook) => {
        if (hook.section === 'body' && hook.column.index === 7) {
          const value = percents[hook.row.index];
          if (value !== null && value !== undefined && value < LOW_PERCENT) {
            hook.cell.styles.textColor = [185, 28, 28];
            hook.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });
  });

  // ---- Har page par number ----
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...slate);
    doc.text('Smart Attendance', margin, pageHeight - 20);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 20, { align: 'right' });
  }

  doc.save(`Attendance-History-${stamp(data.generatedAt)}.pdf`);
}