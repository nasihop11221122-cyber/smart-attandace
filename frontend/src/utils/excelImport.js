import ExcelJS from 'exceljs';

/**
 * Downloads a sample Excel template for Online Students (Admin)
 */
export async function downloadOnlineStudentTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Students Template');

  sheet.columns = [
    { header: 'Roll No', key: 'rollNo', width: 14 },
    { header: 'Full Name', key: 'name', width: 26 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Password (Optional)', key: 'password', width: 22 },
  ];

  // Header styling
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F766E' }, // Teal 700
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 26;

  // Sample Rows
  sheet.addRow({ rollNo: '101', name: 'Rahim Khan', email: 'rahim@example.com', password: 'Student@123' });
  sheet.addRow({ rollNo: '102', name: 'Junaid Ahmed', email: 'junaid@example.com', password: '' });
  sheet.addRow({ rollNo: '103', name: 'Ayesha Malik', email: 'ayesha@example.com', password: '' });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'online_students_template.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Downloads a sample Excel template for Class Students (Teacher)
 */
export async function downloadTeacherStudentTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Class Students Template');

  sheet.columns = [
    { header: 'Roll No', key: 'rollNo', width: 14 },
    { header: 'Full Name', key: 'name', width: 26 },
    { header: 'Father Name', key: 'fatherName', width: 26 },
  ];

  // Header styling
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F766E' }, // Teal 700
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 26;

  // Sample Rows
  sheet.addRow({ rollNo: 1, name: 'Ali Raza', fatherName: 'Muhammad Raza' });
  sheet.addRow({ rollNo: 2, name: 'Hamza Tariq', fatherName: 'Tariq Mehmood' });
  sheet.addRow({ rollNo: 3, name: 'Zainab Noor', fatherName: 'Noor Muhammad' });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'class_students_template.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parses an Excel or CSV file in the browser
 */
export async function parseStudentsExcel(file, type = 'online') {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('Excel sheet is empty');

  const rows = [];
  const seenRolls = new Set();
  const seenEmails = new Set();

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    const values = row.values;
    // values can be 1-indexed array
    const rollRaw = values[1];
    const nameRaw = values[2];

    if (!rollRaw && !nameRaw) return; // Empty row

    const rollNo = rollRaw ? String(rollRaw).trim() : '';
    const name = nameRaw ? String(nameRaw).trim() : '';

    let error = null;
    if (!name) error = 'Name is missing';
    if (!rollNo) error = 'Roll No is missing';

    if (type === 'online') {
      const emailRaw = values[3];
      const passRaw = values[4];
      const email = emailRaw ? String(emailRaw?.text || emailRaw).trim().toLowerCase() : '';
      const password = passRaw ? String(passRaw).trim() : '';

      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailValid) error = 'Invalid or missing email';

      if (seenRolls.has(rollNo)) error = 'Duplicate Roll No in file';
      if (seenEmails.has(email)) error = 'Duplicate Email in file';

      if (rollNo) seenRolls.add(rollNo);
      if (email && emailValid) seenEmails.add(email);

      rows.push({
        id: rowNumber,
        rollNo,
        name,
        email,
        password: password || 'Student@123',
        status: error ? 'error' : 'valid',
        error,
      });
    } else {
      const fatherRaw = values[3];
      const fatherName = fatherRaw ? String(fatherRaw).trim() : '';

      if (!fatherName) error = 'Father Name is missing';
      const numRoll = Number(rollNo);
      if (isNaN(numRoll) || numRoll < 1) error = 'Roll No must be a positive number';

      if (seenRolls.has(numRoll)) error = 'Duplicate Roll No in file';
      if (!isNaN(numRoll) && numRoll >= 1) seenRolls.add(numRoll);

      rows.push({
        id: rowNumber,
        rollNo: numRoll || rollNo,
        name,
        fatherName,
        status: error ? 'error' : 'valid',
        error,
      });
    }
  });

  return rows;
}
