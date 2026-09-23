import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, ExternalLink, Database, HardDrive, CheckCircle } from 'lucide-react';
import { APPS_SCRIPT_CODE_GS, APPS_SCRIPT_INDEX_HTML } from '../data/appsScriptCode';

interface AppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({ isOpen, onClose }) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'gs' | 'html' | 'guide'>('gs');
  const [copiedGs, setCopiedGs] = useState<boolean>(false);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyGs = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE_GS);
    setCopiedGs(true);
    setTimeout(() => setCopiedGs(false), 2000);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_INDEX_HTML);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0F4E7A] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EDBA48] text-[#0F4E7A] flex items-center justify-center font-bold">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">โค้ด Google Apps Script (.gs &amp; index.html)</h3>
              <p className="text-xs text-amber-200">
                ฐานข้อมูลเชื่อมต่อ Google Sheets และบันทึกไฟล์สลิปลง Google Drive อัตโนมัติ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 pt-3 border-b border-slate-200 bg-slate-50 gap-3">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveCodeTab('gs')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition ${
                activeCodeTab === 'gs'
                  ? 'border-[#0F4E7A] text-[#0F4E7A] bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Code.gs (สคริปต์หลัก)
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('html')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition ${
                activeCodeTab === 'html'
                  ? 'border-[#0F4E7A] text-[#0F4E7A] bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              index.html (หน้าเว็บ)
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('guide')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition ${
                activeCodeTab === 'guide'
                  ? 'border-[#0F4E7A] text-[#0F4E7A] bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              วิธีสร้างฐานข้อมูล Google Sheets &amp; ติดตั้ง
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            {activeCodeTab === 'gs' && (
              <>
                <button
                  type="button"
                  onClick={handleCopyGs}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0F4E7A] text-white rounded-lg hover:bg-[#0c3e61] transition"
                >
                  {copiedGs ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedGs ? 'คัดลอกแล้ว' : 'คัดลอก Code.gs'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadFile('Code.gs', APPS_SCRIPT_CODE_GS)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดไฟล์ Code.gs</span>
                </button>
              </>
            )}

            {activeCodeTab === 'html' && (
              <>
                <button
                  type="button"
                  onClick={handleCopyHtml}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0F4E7A] text-white rounded-lg hover:bg-[#0c3e61] transition"
                >
                  {copiedHtml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHtml ? 'คัดลอกแล้ว' : 'คัดลอก index.html'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadFile('index.html', APPS_SCRIPT_INDEX_HTML)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดไฟล์ index.html</span>
                </button>
              </>
            )}

            {activeCodeTab === 'guide' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadFile('Code.gs', APPS_SCRIPT_CODE_GS)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-[#0F4E7A] rounded-lg hover:bg-slate-100 transition shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด Code.gs</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadFile('index.html', APPS_SCRIPT_INDEX_HTML)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-[#0F4E7A] rounded-lg hover:bg-slate-100 transition shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด index.html</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm leading-relaxed">
          {activeCodeTab === 'gs' && (
            <div className="relative">
              <pre className="whitespace-pre overflow-x-auto text-emerald-300">
                {APPS_SCRIPT_CODE_GS}
              </pre>
            </div>
          )}

          {activeCodeTab === 'html' && (
            <div className="relative">
              <pre className="whitespace-pre overflow-x-auto text-sky-300">
                {APPS_SCRIPT_INDEX_HTML}
              </pre>
            </div>
          )}

          {activeCodeTab === 'guide' && (
            <div className="bg-white text-slate-800 p-6 rounded-xl font-sans space-y-6 text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 className="text-base font-bold text-[#0F4E7A] flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#EDBA48]" />
                  <span>คู่มือการสร้างฐานข้อมูล Google Sheets และการติดตั้ง Apps Script</span>
                </h4>
                <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full font-semibold">
                  รองรับ 19 คอลัมน์ + Auto Drive Slips
                </span>
              </div>

              {/* STEP 1: CREATE GOOGLE SHEETS */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h5 className="font-bold text-[#0F4E7A] text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0F4E7A] text-white text-xs flex items-center justify-center font-bold">1</span>
                  <span>สร้างไฟล์ Google Sheets ใหม่</span>
                </h5>
                <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 pl-1">
                  <li>เข้าสู่ Google Sheets โดยเปิดเบราว์เซอร์ไปที่ <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">sheets.new</a> ในบัญชี Google (เช่น @sk-cc.ac.th หรือ Gmail)</li>
                  <li>ตั้งชื่อไฟล์ที่มุมซ้ายบน เช่น <strong className="text-slate-900">"SK-CC วิ่งให้ FUN 2026 - ข้อมูลการสมัคร"</strong></li>
                  <li>
                    <span className="text-emerald-700 font-semibold">ข้อแนะนำ:</span> ไม่จำเป็นต้องพิมพ์หัวตารางเอง! โค้ด Apps Script มีระบบสร้างชีตชื่อ <code>Registrations_2026</code> พร้อมใส่หัวตารางทั้ง 19 คอลัมน์ สีกรมท่า #0F4E7A ให้อัตโนมัติในขั้นตอนถัดไป
                  </li>
                </ol>
              </div>

              {/* STEP 2: PASTE CODE.GS & INDEX.HTML */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h5 className="font-bold text-[#0F4E7A] text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0F4E7A] text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span>เปิด Google Apps Script และวางโค้ด</span>
                </h5>
                <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 pl-1">
                  <li>ที่แถบเมนูด้านบนของ Google Sheets คลิก <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong></li>
                  <li>
                    ในไฟล์ <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs font-mono">Code.gs</code> ลบโค้ดเดิม <code>function myFunction() &#123;&#125;</code> ออกทั้งหมด แล้วนำโค้ดจากแท็บ <strong>Code.gs</strong> (หรือคลิกดาวน์โหลดไฟล์มาเปิดก๊อปปี้) ไปวางแทนที่
                  </li>
                  <li>
                    คลิกเครื่องหมายบวก <strong>+</strong> ข้างแถบเมนูไฟล์ &gt; เลือก <strong>HTML</strong> &gt; พิมพ์ชื่อว่า <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs font-mono">index</code> (ระบบจะใส่เป็น index.html) แล้วนำโค้ดจากแท็บ <strong>index.html</strong> ไปวาง
                  </li>
                  <li>กดปุ่ม <strong>บันทึกโครงการ (รูปแผ่นดิสก์ 💾)</strong> หรือกด Ctrl+S (Cmd+S)</li>
                </ol>
              </div>

              {/* STEP 3: RUN INIT DATABASE (AUTOMATIC SCHEMA CREATION) */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                <h5 className="font-bold text-[#0F4E7A] text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0F4E7A] text-white text-xs flex items-center justify-center font-bold">3</span>
                  <span>สร้างฐานข้อมูลและตารางอัตโนมัติ (คลิกเดียว)</span>
                </h5>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  ในหน้าต่าง Apps Script บริเวณแถบเครื่องมือด้านบน จะมีดรอปดาวน์ให้เลือกฟังก์ชัน ให้เลือกฟังก์ชัน <code className="bg-blue-100 text-[#0F4E7A] px-1.5 py-0.5 rounded font-bold font-mono">initSheetDatabase</code> แล้วกดปุ่ม <strong>"เรียกใช้" (Run ▶)</strong>:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-700 pl-2">
                  <li>ครั้งแรกจะมีหน้าต่างให้กด <strong>ตรวจสอบสิทธิ์ (Review Permissions)</strong> &gt; เลือกบัญชี Google &gt; กด <strong>ขั้นสูง (Advanced)</strong> &gt; กด <strong>ไปที่... (ไม่ปลอดภัย)</strong> &gt; กด <strong>อนุญาต (Allow)</strong></li>
                  <li>ระบบจะสร้างแผ่นงาน <code>Registrations_2026</code> พร้อมตั้งค่าหัวคอลัมน์ A ถึง S สีธีม #0F4E7A และสร้างโฟลเดอร์ Google Drive <code>SKCC_FunRun_2026_Slips</code> สำหรับเก็บสลิปทันที!</li>
                </ul>
              </div>

              {/* STEP 4: DEPLOY AS WEB APP */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h5 className="font-bold text-[#0F4E7A] text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0F4E7A] text-white text-xs flex items-center justify-center font-bold">4</span>
                  <span>การทำให้ใช้งานได้ (Deploy as Web App)</span>
                </h5>
                <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 pl-1 leading-relaxed">
                  <li>คลิกปุ่มสีน้ำเงิน <strong>การทำให้ใช้งานได้ (Deploy)</strong> มุมขวาบน &gt; เลือก <strong>การทำให้ใช้งานได้ใหม่ (New deployment)</strong></li>
                  <li>คลิกไอคอนรูปเฟือง ⚙️ ข้าง "เลือกประเภท" &gt; เลือก <strong>เว็บแอป (Web app)</strong></li>
                  <li>
                    ตั้งค่า 3 ช่องสำคัญ:
                    <div className="bg-white p-3 rounded-lg border border-slate-200 my-2 space-y-1 font-mono text-xs">
                      <div>• คำอธิบาย (Description): <span className="text-[#0F4E7A]">SKCC Fun Run 2026 Database API</span></div>
                      <div>• ดำเนินการในฐานะ (Execute as): <strong className="text-emerald-700">ฉัน (Me / your-account)</strong></div>
                      <div>• ผู้มีสิทธิ์เข้าถึง (Who has access): <strong className="text-rose-700">ทุกคน (Anyone)</strong> <span className="font-sans text-slate-500">*(สำคัญมาก เพื่อให้หน้าเว็บรับสมัครส่งข้อมูลและสลิปเข้าได้โดยไม่ต้องล็อกอิน)*</span></div>
                    </div>
                  </li>
                  <li>คลิก <strong>ทำให้ใช้งานได้ (Deploy)</strong> แล้วกดคัดลอก <strong>URL เว็บแอป (Web app URL)</strong></li>
                </ol>
              </div>

              {/* STEP 5: CONNECT IN APP */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                <h5 className="font-bold text-sm flex items-center gap-2 text-emerald-900">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>ขั้นตอนที่ 5: นำ URL มาเชื่อมต่อในระบบแดชบอร์ด</span>
                </h5>
                <p className="text-xs sm:text-sm leading-relaxed">
                  นำ URL ที่คัดลอกมา (ขึ้นต้นด้วย <code>https://script.google.com/macros/s/.../exec</code>) วางลงในช่อง <strong>"URL Google Apps Script Web App"</strong> ในเมนู <strong>"เชื่อมต่อ Google Sheets"</strong> ของแดชบอร์ดแอดมิน แล้วกดปุ่ม <strong>"เช็คสถานะเชื่อมต่อฐานข้อมูล..."</strong> ระบบจะแจ้งเตือนสำเร็จเป็นสีเขียวทันที
                </p>
              </div>

              {/* STRUCTURE DETAILS TABLE */}
              <div className="space-y-3 pt-2">
                <h5 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-[#0F4E7A]" />
                  <span>โครงสร้างตารางฐานข้อมูล 19 คอลัมน์ (Sheet: Registrations_2026)</span>
                </h5>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#0F4E7A] text-white">
                        <th className="p-2 border-r border-slate-600 w-16">คอลัมน์</th>
                        <th className="p-2 border-r border-slate-600">ชื่อหัวตาราง</th>
                        <th className="p-2">รายละเอียดข้อมูล</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">A</td><td className="p-2 font-semibold">รหัสการสมัคร</td><td className="p-2 text-slate-600">เช่น SKCC-2026-0001 (Unique ID)</td></tr>
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">B</td><td className="p-2 font-semibold">วันเวลาที่สมัคร</td><td className="p-2 text-slate-600">วันและเวลาที่บันทึกข้อมูล</td></tr>
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">C</td><td className="p-2 font-semibold">คำนำหน้า</td><td className="p-2 text-slate-600">เช่น นาย, นาง, นางสาว</td></tr>
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">D</td><td className="p-2 font-semibold">ชื่อ-สกุล</td><td className="p-2 text-slate-600">ชื่อและนามสกุลผู้สมัคร</td></tr>
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">E</td><td className="p-2 font-semibold">เบอร์ติดต่อ</td><td className="p-2 text-slate-600">เบอร์โทรศัพท์ 10 หลัก (บันทึกเป็นข้อความคงเลข 0 นำหน้า)</td></tr>
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">F</td><td className="p-2 font-semibold">ประเภทผู้สมัคร</td><td className="p-2 text-slate-600">เช่น บุคคลทั่วไป / นักศึกษา / VIP</td></tr>
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">G</td><td className="p-2 font-semibold">ค่าสมัคร</td><td className="p-2 text-slate-600">ราคาค่าสมัคร (บาท)</td></tr>
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">H</td><td className="p-2 font-semibold">รหัสปี (นักศึกษา)</td><td className="p-2 text-slate-600">เช่น 67, 68, 69 หรือ -</td></tr>
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">I</td><td className="p-2 font-semibold">ห้อง (นักศึกษา)</td><td className="p-2 text-slate-600">เช่น 1, 2 หรือ -</td></tr>
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">J</td><td className="p-2 font-semibold">สาขาวิชา (นักศึกษา)</td><td className="p-2 text-slate-600">เช่น เทคโนโลยีดิจิทัลธุรกิจ, การจัดการ</td></tr>
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">K</td><td className="p-2 font-semibold">สถานที่เรียน (นักศึกษา)</td><td className="p-2 text-slate-600">เช่น อำเภอเทพา, อำเภอหาดใหญ่</td></tr>
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">L</td><td className="p-2 font-semibold">ขนาดเสื้อ</td><td className="p-2 text-slate-600">รหัสไซส์ เช่น S, M, L, XL, 2XL</td></tr>
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">M</td><td className="p-2 font-semibold">รูปแบบการจัดส่ง</td><td className="p-2 text-slate-600">รับด้วยตัวเอง / จัดส่งไปรษณีย์</td></tr>
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">N</td><td className="p-2 font-semibold">ค่าจัดส่ง</td><td className="p-2 text-slate-600">ค่าส่งไปรษณีย์ เช่น 50 บาท (0 ถ้ามารับเอง)</td></tr>
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">O</td><td className="p-2 font-semibold">ยอดชำระสุทธิ</td><td className="p-2 text-slate-600">ค่าสมัคร + ค่าจัดส่ง (บาท)</td></tr>
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">P</td><td className="p-2 font-semibold">ที่อยู่จัดส่ง</td><td className="p-2 text-slate-600">ที่อยู่เต็มพร้อมตำบล อำเภอ จังหวัด รหัสไปรษณีย์</td></tr>
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">Q</td><td className="p-2 font-semibold">ลิงก์สลิปโอนเงิน (Drive)</td><td className="p-2 text-blue-600 underline">ลิงก์เปิดดูภาพสลิปใน Google Drive ทันที</td></tr>
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">R</td><td className="p-2 font-semibold">สถานะการตรวจสอบ</td><td className="p-2 text-slate-600">ยังไม่ตรวจสอบ / ตรวจสอบแล้ว</td></tr>
                      <tr className="hover:bg-slate-50"><td className="p-2 font-mono font-bold">S</td><td className="p-2 font-semibold">หมายเหตุ</td><td className="p-2 text-slate-600">หมายเหตุเพิ่มเติมจากผู้สมัครหรือเจ้าหน้าที่</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            ระบบจะสร้างโฟลเดอร์ใน Google Drive ชื่อ <strong>SKCC_FunRun_2026_Slips</strong> ให้อัตโนมัติเมื่อมีการอัปโหลดสลิป
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0F4E7A] text-white rounded-lg hover:bg-[#0c3e61] font-semibold transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
