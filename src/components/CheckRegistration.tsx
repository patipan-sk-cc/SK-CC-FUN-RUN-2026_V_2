import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, Clock, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Registration } from '../types';

interface CheckRegistrationProps {
  registrations: Registration[];
  initialSearchQuery?: string;
  onRefresh?: () => void;
  logoUrl?: string;
}

export const CheckRegistration: React.FC<CheckRegistrationProps> = ({
  registrations,
  initialSearchQuery = '',
  onRefresh,
  logoUrl,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchQuery);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchTerm(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const handleRefreshClick = () => {
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Filter registrations strictly matching name
  const cleanQuery = searchTerm.trim().toLowerCase();
  const matchedList = cleanQuery
    ? registrations.filter((reg) => {
        const full = `${reg.prefix} ${reg.fullName}`.toLowerCase();
        const nameOnly = reg.fullName.toLowerCase();
        return full.includes(cleanQuery) || nameOnly.includes(cleanQuery);
      })
    : [];

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="text-center mb-8">
        {logoUrl !== '' && (
          <div className="flex justify-center mb-3">
            <img
              src={logoUrl || '/logo.png'}
              alt="ตราสัญลักษณ์ วิทยาลัยชุมชนสงขลา"
              className="w-14 h-14 object-contain drop-shadow-sm"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[#0F4E7A] text-xs font-semibold mb-2">
          <UserCheck className="w-4 h-4 text-[#EDBA48]" />
          <span>ระบบตรวจสอบรายชื่อผู้สมัคร SK-CC วิ่งให้ FUN</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F4E7A] tracking-tight">
          ตรวจสอบสถานะการสมัคร
        </h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          พิมพ์ชื่อ หรือ นามสกุล เพื่อค้นหาสถานะการตรวจสอบความถูกต้องของข้อมูลและหลักฐานการโอนเงิน
        </p>
      </div>

      {/* Search Input Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200 mb-6">
        <label htmlFor="search-input" className="block text-sm font-bold text-slate-700 mb-2">
          ค้นหาด้วย ชื่อ หรือ นามสกุล
        </label>
        <div className="relative flex items-center">
          <input
            id="search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="พิมพ์ชื่อหรือนามสกุล เช่น สมชาย, รัตนภูมิ..."
            className="w-full pl-11 pr-24 py-3 rounded-xl border border-slate-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 focus:border-[#0F4E7A] transition"
            autoFocus
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition"
            >
              ล้างคำค้น
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
          <span>* เพื่อความเป็นส่วนตัว ระบบจะแสดงเฉพาะ ชื่อ-สกุล และสถานะการตรวจสอบเท่านั้น</span>
          {onRefresh && (
            <button
              type="button"
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="flex items-center gap-1 text-[#0F4E7A] hover:underline font-medium cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>รีเฟรชข้อมูล</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      {cleanQuery === '' ? (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white/60">
          <div className="w-12 h-12 rounded-full bg-[#0F4E7A]/10 text-[#0F4E7A] mx-auto flex items-center justify-center mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-slate-700">กรุณาพิมพ์ชื่อหรือนามสกุลในช่องค้นหา</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            ระบบจะแสดงผลการค้นหาทันที พร้อมแจ้งสถานะว่าเจ้าหน้าที่ได้ตรวจสอบแล้วหรือยังไม่ตรวจสอบ
          </p>
        </div>
      ) : matchedList.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-slate-800">
            ไม่พบรายชื่อที่ตรงกับ "{searchTerm}"
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            กรุณาตรวจสอบตัวสะกด หรือหากเพิ่งสมัครเสร็จสิ้น กรุณารอสักครู่หรือกดปุ่มรีเฟรช
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span>
              พบรายชื่อผู้สมัคร <strong>{matchedList.length}</strong> รายการ
            </span>
            <span>สถานะการตรวจสอบ</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {matchedList.map((reg) => {
              const isVerified = reg.status === 'ตรวจสอบแล้ว';
              return (
                <div
                  key={reg.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition"
                >
                  {/* Name and Surname ONLY */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        isVerified
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isVerified ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-800">
                        {reg.prefix} {reg.fullName}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        ผู้สมัครงาน SK-CC วิ่งให้ FUN 2026
                      </span>
                    </div>
                  </div>

                  {/* Status ONLY: ตรวจสอบแล้ว / ยังไม่ตรวจสอบ */}
                  <div>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ตรวจสอบแล้ว</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>ยังไม่ตรวจสอบ</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
            หากข้อมูลของท่านยังขึ้นสถานะ "ยังไม่ตรวจสอบ" เจ้าหน้าที่กำลังดำเนินการตรวจสอบหลักฐานการโอนเงินตามลำดับการสมัคร
          </div>
        </div>
      )}
    </div>
  );
};
