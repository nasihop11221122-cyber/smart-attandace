const LOW_PERCENT = 75;
const TITLE = 'Complete Attendance History';
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

// Leave ko present ginte hain
const stats = (s) => {
  const present = s.present + s.leave;
  const absent = s.absent;
  const total = present + absent;
  const percent = total > 0 ? Math.round((present / total) * 1000) / 10 : null;
  return { present, absent, percent };
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

  const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
  const thin = { style: 'thin', color: { argb: 'FFE2E8F0' } };
  const border = { top: thin, left: thin, bottom: thin, right: thin };

  const sheet = workbook.addWorksheet('Complete History', {
    views: [{ state: 'frozen', ySplit: 2, showGridLines: false }],
    pageSetup: {
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      printTitlesRow: '1:2',
    },
  });
  sheet.columns = [{ width: 38 }, { width: 14 }, { width: 14 }, { width: 18 }];

  // ---- Sab se upar ka title ----
  sheet.mergeCells('A1:D1');
  const title = sheet.getCell('A1');
  title.value = TITLE;
  title.font = { size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
  title.fill = fill('FF1D4ED8');
  title.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheet.getRow(1).height = 38;

  sheet.mergeCells('A2:D2');
  const subtitle = sheet.getCell('A2');
  subtitle.value = `All classes  |  Generated on ${generatedText(data.generatedAt)}`;
  subtitle.font = { size: 11, color: { argb: 'FF1E3A8A' } };
  subtitle.fill = fill('FFDBEAFE');
  subtitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheet.getRow(2).height = 22;

  sheet.addRow([]);

  // ---- Har class ka hissa ----
  data.classes.forEach((cls) => {
    // Class ka naam
    const banner = sheet.addRow([cls.className]);
    sheet.mergeCells(`A${banner.number}:D${banner.number}`);
    const bannerCell = banner.getCell(1);
    bannerCell.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    bannerCell.fill = fill('FF2563EB');
    bannerCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    banner.height = 26;

    // Form master aur tadad
    const info = sheet.addRow([
      `Form Master: ${cls.teacherName}   |   Students: ${cls.students.length}   |   Days recorded: ${cls.totalDays}`,
    ]);
    sheet.mergeCells(`A${info.number}:D${info.number}`);
    const infoCell = info.getCell(1);
    infoCell.font = { size: 10, color: { argb: 'FF334155' } };
    infoCell.fill = fill('FFEFF6FF');
    infoCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    info.height = 20;

    if (cls.students.length === 0) {
      const empty = sheet.addRow(['No students in this class.']);
      sheet.mergeCells(`A${empty.number}:D${empty.number}`);
      empty.getCell(1).font = { italic: true, color: { argb: 'FF64748B' } };
      empty.getCell(1).alignment = { horizontal: 'left', indent: 1 };
      sheet.addRow([]);
      return;
    }

    // Table ka header
    const head = sheet.addRow(['Student Name', 'Present', 'Absent', 'Attendance %']);
    head.height = 22;
    head.eachCell((cell, col) => {
      cell.font = { bold: true, color: { argb: 'FF0F172A' } };
      cell.fill = fill('FFE2E8F0');
      cell.border = border;
      cell.alignment = {
        vertical: 'middle',
        horizontal: col === 1 ? 'left' : 'center',
        indent: col === 1 ? 1 : 0,
      };
    });

    // Bachon ki rows
    cls.students.forEach((s, i) => {
      const { present, absent, percent } = stats(s);
      const row = sheet.addRow([s.name, present, absent, percent === null ? '' : percent / 100]);
      row.eachCell({ includeEmpty: true }, (cell, col) => {
        cell.border = border;
        cell.alignment = {
          vertical: 'middle',
          horizontal: col === 1 ? 'left' : 'center',
          indent: col === 1 ? 1 : 0,
        };
        if (i % 2 === 1) cell.fill = fill('FFF8FAFC');
      });
      row.getCell(4).numFmt = '0.0%';
      if (percent !== null && percent < LOW_PERCENT) {
        row.getCell(4).font = { bold: true, color: { argb: 'FFB91C1C' } };
        row.getCell(4).fill = fill('FFFEE2E2');
      }
    });

    sheet.addRow([]);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveBlob(
    new Blob([buffer], { type: XLSX_TYPE }),
    `Complete-Attendance-History-${stamp(data.generatedAt)}.xlsx`
  );
}

/* ------------------------------- PDF ------------------------------- */

export async function downloadHistoryPdf(data) {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const topMargin = 50;
  const bottomMargin = 50;

  const blue = [29, 78, 216];
  const slate = [100, 116, 139];

  // ---- Sab se upar ka title ----
  doc.setFillColor(...blue);
  doc.rect(0, 0, pageWidth, 96, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text(TITLE, margin, 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(219, 234, 254);
  doc.text(`All classes  |  Generated on ${generatedText(data.generatedAt)}`, margin, 74);

  let y = 126;

  // ---- Har class ka hissa ----
  data.classes.forEach((cls) => {
    // Class ka naam aur kam az kam kuch rows ek hi page par rahein
    if (y + 100 > pageHeight - bottomMargin) {
      doc.addPage();
      y = topMargin;
    }

    doc.setFillColor(...blue);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 4, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(cls.className, margin + 12, y + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(219, 234, 254);
    doc.text(
      `Form Master: ${cls.teacherName}   |   ${cls.students.length} students`,
      pageWidth - margin - 12,
      y + 18,
      { align: 'right' }
    );

    y += 34;

    if (cls.students.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(...slate);
      doc.text('No students in this class.', margin + 4, y + 14);
      y += 44;
      return;
    }

    const rows = cls.students.map(stats);

    autoTable(doc, {
      startY: y,
      margin: { top: topMargin, left: margin, right: margin, bottom: bottomMargin },
      head: [['Student Name', 'Present', 'Absent', 'Attendance %']],
      body: rows.map((r, i) => [
        cls.students[i].name,
        String(r.present),
        String(r.absent),
        r.percent === null ? '-' : `${r.percent.toFixed(1)}%`,
      ]),
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 6, lineColor: [226, 232, 240], lineWidth: 0.5 },
      headStyles: {
        fillColor: [226, 232, 240],
        textColor: [15, 23, 42],
        halign: 'center',
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center', cellWidth: 80 },
        2: { halign: 'center', cellWidth: 80 },
        3: { halign: 'center', cellWidth: 110 },
      },
      didParseCell: (hook) => {
        if (hook.section === 'head' && hook.column.index === 0) {
          hook.cell.styles.halign = 'left';
        }
        if (hook.section === 'body' && hook.column.index === 3) {
          const value = rows[hook.row.index]?.percent;
          if (value !== null && value !== undefined && value < LOW_PERCENT) {
            hook.cell.styles.textColor = [185, 28, 28];
            hook.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });

    y = (doc.lastAutoTable?.finalY ?? y) + 26;
  });

  // ---- Har page par neeche ka patti aur page number ----
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 32, pageWidth - margin, pageHeight - 32);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...slate);
    doc.text('Smart Attendance', margin, pageHeight - 18);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 18, { align: 'right' });
  }

  doc.save(`Complete-Attendance-History-${stamp(data.generatedAt)}.pdf`);
}