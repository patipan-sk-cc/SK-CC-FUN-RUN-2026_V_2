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
        <div className="flex items-center justify-between px-6 pt-3 border-b border-slate-200 bg-slate-50">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveCodeTab('gs')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition ${
                activeCodeTab === 'gs'
                  ? 'border-[#0F4E7A] text-[#0F4E7A] bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Code.gs (สคริปต์หลัก Google Apps Script)
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('html')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition ${
                activeCodeTab === 'html'
                  ? 'border-[#0F4E7A] text-[#0F4E7A] bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              index.html (หน้า Web App)
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('guide')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition ${
                activeCodeTab === 'guide'
                  ? 'border-[#0F4E7A] text-[#0F4E7A] bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              คู่มือขั้นตอนการติดตั้ง (Step-by-Step)
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 pb-2">
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
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด .gs</span>
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
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด .html</span>
                </button>
              </>
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
            <div className="bg-white text-slate-800 p-6 rounded-xl font-sans space-y-5 text-sm">
              <h4 className="text-base font-bold text-[#0F4E7A] flex items-center gap-2">
                <Database className="w-5 h-5 text-[#EDBA48]" />
                ขั้นตอนการติดตั้ง Google Apps Script เพื่อเชื่อมต่อ Google Sheets &amp; Drive
              </h4>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h5 className="font-bold text-[#0F4E7A] mb-1">
                    ขั้นตอนที่ 1: สร้าง Google Sheets ใหม่
                  </h5>
                  <p className="text-slate-600 text-xs sm:text-sm">
                    1. เข้าสู่ <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">sheets.new</a> ในบัญชี Google (เช่น @sk-cc.ac.th หรือ Gmail)
                    <br />
                    2. ตั้งชื่อไฟล์ เช่น <strong>"SK-CC วิ่งให้ FUN 2026 - ข้อมูลการสมัคร"</strong>
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h5 className="font-bold text-[#0F4E7A] mb-1">
                    ขั้นตอนที่ 2: เปิด Apps Script และวางโค้ด
                  </h5>
                  <p className="text-slate-600 text-xs sm:text-sm">
                    1. ที่เมนูด้านบนของ Google Sheets คลิก <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong>
                    <br />
                    2. ลบโค้ดเดิมในไฟล์ <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">Code.gs</code> ออกทั้งหมด แล้ววางโค้ดจากแท็บ <strong>Code.gs</strong> ด้านบน
                    <br />
                    3. กดเครื่องหมาย <strong>+</strong> ข้างเมนูไฟล์ &gt; เลือก <strong>HTML</strong> &gt; ตั้งชื่อว่า <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">index</code> แล้ววางโค้ดจากแท็บ <strong>index.html</strong>
                    <br />
                    4. กดปุ่มบันทึก (ไอคอนแผ่นดิสก์)
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h5 className="font-bold text-[#0F4E7A] mb-1">
                    ขั้นตอนที่ 3: ทำให้ใช้งานได้ (Deploy as Web App)
                  </h5>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    1. คลิกปุ่มสีน้ำเงิน <strong>การทำให้ใช้งานได้ (Deploy)</strong> มุมขวาบน &gt; เลือก <strong>การทำให้ใช้งานได้ใหม่ (New deployment)</strong>
                    <br />
                    2. คลิกไอคอนรูปเฟือง ⚙️ ข้าง "เลือกประเภท" &gt; เลือก <strong>เว็บแอป (Web app)</strong>
                    <br />
                    3. ตั้งค่าดังนี้:
                    <br />
                    &nbsp;&nbsp;• คำอธิบาย: <span className="font-medium text-[#0F4E7A]">SKCC Fun Run 2026 API</span>
                    <br />
                    &nbsp;&nbsp;• ดำเนินการในฐานะ (Execute as): <strong className="text-emerald-700">ฉัน (Me)</strong>
                    <br />
                    &nbsp;&nbsp;• ผู้มีสิทธิ์เข้าถึง (Who has access): <strong className="text-emerald-700">ทุกคน (Anyone)</strong> *(จำเป็นเพื่อให้เว็บส่งข้อมูลได้)*
                    <br />
                    4. คลิก <strong>ทำให้ใช้งานได้ (Deploy)</strong> แล้วให้สิทธิ์การเข้าถึง (Authorize access)
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <h5 className="font-bold mb-1 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ขั้นตอนที่ 4: คัดลอก Web App URL มาใส่ในระบบ
                  </h5>
                  <p className="text-xs sm:text-sm">
                    คัดลอก URL ของเว็บแอป (ขึ้นต้นด้วย <code>https://script.google.com/macros/s/...</code>) แล้วนำมาวางในช่อง <strong>"URL Google Apps Script Web App"</strong> ในหน้าแดชบอร์ดเจ้าหน้าที่
                    จากนั้นกดปุ่ม <strong>"เช็คสถานะเชื่อมต่อฐานข้อมูล Google Sheets ผ่าน Google Apps Script"</strong> เพื่อทดสอบการทำงาน!
                  </p>
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
