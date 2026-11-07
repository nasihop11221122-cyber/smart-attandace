import { jsPDF } from 'jspdf';

/**
 * Generates an official, colorful, high-resolution Landscape Certificate PDF
 * @param {Object} student - { name, rollNo, program, className, attendancePercent, certificateId, graduatedAt }
 * @param {String} instituteName - Name of the institute/college
 */
export async function generateStudentCertificate(student, instituteName = 'Smart Attendance Institute') {
  if (!student || !student.name) {
    throw new Error('Student data is missing or student name is not available');
  }

  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const width = doc.internal.pageSize.getWidth(); // 297
  const height = doc.internal.pageSize.getHeight(); // 210

  // 1. Background Cream Wash
  doc.setFillColor(254, 254, 250); // Warm ivory parchment
  doc.rect(0, 0, width, height, 'F');

  // 2. Multi-Layer Outer Ornate Borders
  // Deep Navy Outer Border
  doc.setDrawColor(15, 23, 42); // #0f172a
  doc.setLineWidth(3);
  doc.rect(10, 10, width - 20, height - 20);

  // Radiant Gold Inner Border
  doc.setDrawColor(217, 119, 6); // #d97706 (Amber / Gold)
  doc.setLineWidth(1.2);
  doc.rect(14, 14, width - 28, height - 28);

  // Subtle Thin Inner Border
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.rect(16, 16, width - 32, height - 32);

  // 3. Four Corner Ornaments (Classic geometric brackets)
  const drawCorner = (x, y, xDir, yDir) => {
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(2);
    doc.line(x, y, x + xDir * 12, y);
    doc.line(x, y, x, y + yDir * 12);

    doc.setFillColor(15, 23, 42);
    doc.circle(x + xDir * 4, y + yDir * 4, 1.2, 'FD');
  };

  drawCorner(18, 18, 1, 1);
  drawCorner(width - 18, 18, -1, 1);
  drawCorner(18, height - 18, 1, -1);
  drawCorner(width - 18, height - 18, -1, -1);

  // 4. Header Section: Institute & Crest
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(217, 119, 6); // Gold
  doc.setFontSize(11);
  doc.text(instituteName.toUpperCase(), width / 2, 28, { align: 'center' });

  // Main Certificate Title
  doc.setFont('times', 'bold');
  doc.setTextColor(15, 23, 42); // Rich Navy
  doc.setFontSize(26);
  doc.text('CERTIFICATE OF MERIT & COMPLETION', width / 2, 42, { align: 'center' });

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.setFontSize(10);
  doc.text('OFFICIAL RECORD OF ACADEMIC ATTENDANCE & CONDUCT', width / 2, 49, { align: 'center' });

  // Decorative Horizontal Divider with Center Diamond
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.6);
  doc.line(width / 2 - 60, 54, width / 2 + 60, 54);
  doc.setFillColor(217, 119, 6);
  // Diamond (drawn with lines since jsPDF has no polygon method)
  const cx = width / 2;
  const cy = 54;
  doc.setFillColor(217, 119, 6);
  doc.circle(cx, cy, 1.5, 'F');

  // 5. Recipient Notice
  doc.setFont('times', 'italic');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(13);
  doc.text('This is proudly presented to', width / 2, 65, { align: 'center' });

  // 6. Student Name (Hero Text)
  doc.setFont('times', 'bold');
  doc.setTextColor(15, 118, 110); // Rich Teal / Navy #0f766e
  doc.setFontSize(28);
  doc.text(student.name || 'Student Name', width / 2, 78, { align: 'center' });

  // Gold Underline beneath Student Name
  const nameWidth = doc.getTextWidth(student.name || 'Student Name');
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.8);
  doc.line(width / 2 - (nameWidth / 2 + 8), 81, width / 2 + (nameWidth / 2 + 8), 81);

  // 7. Academic Citation / Description
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(11);

  const className = student.program || student.className || 'Academic Program';
  const rollText = student.rollNo ? `(Roll No: #${student.rollNo})` : '';

  doc.text(
    `for successfully passing out and completing academic tenure in`,
    width / 2,
    91,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.text(`${className} ${rollText}`, width / 2, 99, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(10.5);
  doc.text(
    'Demonstrated commendable academic diligence, exemplary punctuality, and stellar conduct throughout.',
    width / 2,
    108,
    { align: 'center' }
  );

  // 8. Attendance Standing Ribbon / Badge (Center Display)
  const pct = student.attendancePercent ?? 100;
  const badgeY = 120;
  doc.setFillColor(240, 253, 250); // Light Teal
  doc.setDrawColor(13, 148, 136); // Teal 600
  doc.setLineWidth(0.8);
  doc.roundedRect(width / 2 - 50, badgeY, 100, 16, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.setFontSize(11);
  doc.text(`★  OVERALL ATTENDANCE SCORE: ${pct}%  ★`, width / 2, badgeY + 10.5, { align: 'center' });

  // 9. Signatures & Issuance Footer
  const footerY = 168;

  // Left Side: Date & Certificate ID
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);

  const issueDate = student.graduatedAt
    ? new Date(student.graduatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  doc.text(`Certificate No: ${student.certificateId || 'CERT-OFFICIAL'}`, 30, footerY);
  doc.text(`Issued On: ${issueDate}`, 30, footerY + 6);
  doc.text('Verification: Official Registry', 30, footerY + 12);

  // Center: Golden Seal Medal Graphic
  const sealX = width / 2;
  const sealY = footerY + 4;

  // Outer Starburst/Petals effect
  doc.setFillColor(254, 243, 199); // Light Amber
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1);
  doc.circle(sealX, sealY, 13, 'FD');

  doc.setFillColor(217, 119, 6); // Solid Gold Inner
  doc.circle(sealX, sealY, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text('OFFICIAL', sealX, sealY - 1.5, { align: 'center' });
  doc.text('SEAL', sealX, sealY + 2.5, { align: 'center' });
  doc.text('★ ★ ★', sealX, sealY + 6, { align: 'center' });

  // Right Side: Principal Signature Line
  const sigX = width - 75;
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.6);
  doc.line(sigX, footerY + 2, sigX + 50, footerY + 2);

  // Stamp cursive signature
  doc.setFont('times', 'italic');
  doc.setTextColor(15, 118, 110);
  doc.setFontSize(14);
  doc.text('Prof. M. Siddiqui', sigX + 25, footerY - 1, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.text('AUTHORIZED SIGNATURE', sigX + 25, footerY + 7, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('Principal / Head of Institute', sigX + 25, footerY + 12, { align: 'center' });

  // Save the PDF
  const safeName = (student.name || 'Unknown').replace(/\s+/g, '_');
  const filename = `${safeName}_Completion_Certificate.pdf`;
  doc.save(filename);
}


