import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import { X, UploadCloud, FileSpreadsheet, Download, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../api/axios';
import {
  downloadOnlineStudentTemplate,
  downloadTeacherStudentTemplate,
  parseStudentsExcel,
} from '../utils/excelImport';

export default function BulkImportModal({
  type = 'online', // 'online' or 'teacher'
  classId: initialClassId = '',
  classes: passedClasses = [],
  onClose,
  onImported,
}) {
  const [classes, setClasses] = useState(passedClasses);
  const [classId, setClassId] = useState(initialClassId || (passedClasses[0]?.id || ''));
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch classes if not provided and type is online
  useEffect(() => {
    if (type === 'online' && classes.length === 0) {
      api.get('/admin/classes')
        .then((res) => {
          const list = res.data?.classes || [];
          setClasses(list);
          if (!classId && list.length > 0) {
            setClassId(list[0].id);
          }
        })
        .catch(() => {});
    }
  }, [type, classes.length, classId]);

  const validRows = useMemo(() => rows.filter((r) => r.status === 'valid'), [rows]);
  const errorRows = useMemo(() => rows.filter((r) => r.status === 'error'), [rows]);

  const handleDownloadTemplate = async () => {
    try {
      if (type === 'online') {
        await downloadOnlineStudentTemplate();
      } else {
        await downloadTeacherStudentTemplate();
      }
      toast.info('Sample template downloaded');
    } catch {
      toast.error('Could not generate template');
    }
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }
    setFile(selectedFile);
    setParsing(true);
    try {
      const parsed = await parseStudentsExcel(selectedFile, type);
      setRows(parsed);
      if (parsed.length === 0) {
        toast.warn('The uploaded sheet has no student records');
      } else {
        toast.success(`Loaded ${parsed.length} student rows from file`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to read Excel file');
      setRows([]);
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) processFile(droppedFile);
  };

  const handleImport = async () => {
    if (type === 'online' && !classId) {
      toast.error('Please select a target class/semester');
      return;
    }
    if (validRows.length === 0) {
      toast.error('No valid rows found to import');
      return;
    }

    setImporting(true);
    try {
      if (type === 'online') {
        const payload = {
          classId,
          students: validRows.map((r) => ({
            rollNo: r.rollNo,
            name: r.name,
            email: r.email,
            password: r.password,
          })),
        };
        const res = await api.post('/admin/students/bulk', payload);
        toast.success(`Successfully imported ${res.data.createdCount} students!`);
        if (res.data.skippedCount > 0) {
          toast.warn(`${res.data.skippedCount} students skipped due to duplicates.`);
        }
      } else {
        const payload = {
          students: validRows.map((r) => ({
            rollNo: Number(r.rollNo),
            name: r.name,
            fatherName: r.fatherName,
          })),
        };
        const res = await api.post('/teacher/students/bulk', payload);
        toast.success(`Successfully imported ${res.data.createdCount} students!`);
        if (res.data.skippedCount > 0) {
          toast.warn(`${res.data.skippedCount} students skipped due to duplicate roll numbers.`);
        }
      }

      onImported();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1f2a] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Bulk Student Import (Excel)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload your Excel spreadsheet to add multiple students in seconds.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Class Selector for Admin if multiple classes available */}
          {type === 'online' && classes.length > 0 && !initialClassId && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Target Class / Program
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.program} - {c.semester}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Row: Template Download & File Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Need a ready-to-use template?</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Download formatted Excel with sample student rows</p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 rounded-xl border border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/40 px-3.5 py-2 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition shadow-xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Template (.xlsx)</span>
            </button>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-7 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 bg-white/40 dark:bg-slate-900/20 cursor-pointer transition-colors text-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              onChange={(e) => processFile(e.target.files?.[0])}
            />
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 mb-3">
              <UploadCloud className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {file ? file.name : 'Click to select or drag & drop Excel sheet'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Supports Microsoft Excel (.xlsx, .xls)
            </p>
          </div>

          {/* Parsing State */}
          {parsing && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-teal-600 dark:text-teal-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Reading and verifying spreadsheet rows…</span>
            </div>
          )}

          {/* Rows Preview Table */}
          {rows.length > 0 && !parsing && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Preview ({rows.length} records found)
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 font-bold border border-emerald-200/60 dark:border-emerald-800/60">
                    <CheckCircle className="h-3 w-3" /> {validRows.length} Valid
                  </span>
                  {errorRows.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-2.5 py-0.5 font-bold border border-red-200/60 dark:border-red-800/60">
                      <AlertTriangle className="h-3 w-3" /> {errorRows.length} Issues
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                    <tr>
                      <th className="px-3 py-2">Roll</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">{type === 'online' ? 'Email' : 'Father Name'}</th>
                      <th className="px-3 py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    {rows.map((r) => (
                      <tr key={r.id} className={r.status === 'error' ? 'bg-red-50/30 dark:bg-red-950/20' : ''}>
                        <td className="px-3 py-2 font-bold">{r.rollNo}</td>
                        <td className="px-3 py-2 font-medium">{r.name}</td>
                        <td className="px-3 py-2 truncate max-w-[150px]">{type === 'online' ? r.email : r.fatherName}</td>
                        <td className="px-3 py-2 text-right">
                          {r.status === 'valid' ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Ready</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400 font-semibold" title={r.error}>
                              {r.error}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800/80 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={importing || validRows.length === 0}
            className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            {importing && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{importing ? 'Importing…' : `Import ${validRows.length} Students`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
