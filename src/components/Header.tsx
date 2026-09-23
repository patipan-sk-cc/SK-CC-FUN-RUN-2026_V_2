import React, { useState } from 'react';
import { UserCheck, FileText, Shield, LogOut, CheckCircle2, User, Lock, AlertCircle, X } from 'lucide-react';
import { AdminAccount, NavigationTab } from '../types';

interface HeaderProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  currentAdmin: AdminAccount | null;
  adminAccounts: AdminAccount[];
  onAdminLogin: (admin: AdminAccount) => void;
  onAdminLogout: () => void;
  logoUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  currentAdmin,
  adminAccounts,
  onAdminLogin,
  onAdminLogout,
  logoUrl,
}) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  const openLoginModal = () => {
    setLoginUsername('');
    setLoginPassword('');
    setLoginError('');
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginUsername('');
    setLoginPassword('');
    setLoginError('');
    setIsLoginModalOpen(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedUser = loginUsername.trim();
    const trimmedPass = loginPassword.trim();

    // Check against accounts list or fallback default Admin#26 / #9591
    const match = adminAccounts.find(
      (a) => a.username === trimmedUser && a.password === trimmedPass
    );

    if (match || (trimmedUser === 'Admin#26' && trimmedPass === '#9591')) {
      const loggedInAdmin: AdminAccount = match || {
        id: 'admin-default',
        username: 'Admin#26',
        password: '#9591',
        role: 'superadmin',
        createdAt: new Date().toISOString(),
      };
      onAdminLogin(loggedInAdmin);
      setLoginUsername('');
      setLoginPassword('');
      setIsLoginModalOpen(false);
      onTabChange('admin');
    } else {
      setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        {/* Top Banner Stripe */}
        <div className="bg-[#0F4E7A] text-white px-4 py-1.5 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#EDBA48] animate-pulse"></span>
              <span className="font-medium text-amber-300">SK-CC FUN RUN 2026</span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="hidden sm:inline text-slate-200">
                วิทยาลัยชุมชนสงขลา (Songkhla Community College)
              </span>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Brand Logo & Title */}
            <div
              id="brand-header"
              onClick={() => onTabChange('register')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              {logoUrl !== '' && (
                <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0">
                  <img
                    src={logoUrl || '/logo.png'}
                    alt="ตราสัญลักษณ์ วิทยาลัยชุมชนสงขลา"
                    className="w-12 h-12 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F4E7A]">
                    SK-CC วิ่งให้ FUN
                  </h1>
                  <span className="px-2 py-0.5 text-xs font-bold bg-[#EDBA48] text-[#0F4E7A] rounded-full shadow-xs">
                    2026
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  ระบบลงทะเบียนและตรวจสอบการสมัคร วิทยาลัยชุมชนสงขลา
                </p>
              </div>
            </div>

            {/* Middle: 2 Core Navigation Menus (ตรงกลาง 2 เมนู: ลงทะเบียน, ตรวจสอบการสมัคร) */}
            <nav
              id="middle-nav-menu"
              className="hidden md:flex items-center bg-slate-100/90 p-1.5 rounded-full border border-slate-200"
            >
              <button
                id="nav-btn-register"
                type="button"
                onClick={() => onTabChange('register')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-[#0F4E7A] text-white shadow-md'
                    : 'text-slate-600 hover:text-[#0F4E7A] hover:bg-slate-200/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>ลงทะเบียน</span>
              </button>

              <button
                id="nav-btn-check"
                type="button"
                onClick={() => onTabChange('check')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'check'
                    ? 'bg-[#0F4E7A] text-white shadow-md'
                    : 'text-slate-600 hover:text-[#0F4E7A] hover:bg-slate-200/60'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>ตรวจสอบการสมัคร</span>
              </button>
            </nav>

            {/* Right: Officer/Admin Button (ส่วนเมนูสำหรับเจ้าหน้าที่จะอยู่ฝั่งขวาสุด) */}
            <div id="officer-menu-section" className="flex items-center gap-2">
              {currentAdmin ? (
                <div className="flex items-center gap-2">
                  <button
                    id="btn-admin-portal"
                    type="button"
                    onClick={() => onTabChange('admin')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition cursor-pointer ${
                      activeTab === 'admin'
                        ? 'bg-[#0F4E7A] text-white border-[#0F4E7A] shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="hidden sm:inline">ระบบเจ้าหน้าที่ ({currentAdmin.username})</span>
                    <span className="sm:hidden">เจ้าหน้าที่</span>
                  </button>
                  <button
                    id="btn-admin-logout"
                    type="button"
                    onClick={onAdminLogout}
                    title="ออกจากระบบเจ้าหน้าที่"
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  id="btn-officer-login"
                  type="button"
                  onClick={openLoginModal}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-[#0F4E7A] text-white border-[#0F4E7A] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-[#0F4E7A] hover:text-[#0F4E7A] hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-4 h-4 text-[#EDBA48]" />
                  <span>สำหรับเจ้าหน้าที่</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Navigation Bar (Middle menu on small screens) */}
          <div className="md:hidden flex items-center justify-around py-2.5 border-t border-slate-100 bg-slate-50 -mx-4 px-4">
            <button
              id="mobile-nav-register"
              type="button"
              onClick={() => onTabChange('register')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition ${
                activeTab === 'register'
                  ? 'bg-[#0F4E7A] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ลงทะเบียน</span>
            </button>
            <button
              id="mobile-nav-check"
              type="button"
              onClick={() => onTabChange('check')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition mx-1 ${
                activeTab === 'check'
                  ? 'bg-[#0F4E7A] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>ตรวจสอบ</span>
            </button>
            <button
              id="mobile-nav-admin"
              type="button"
              onClick={() => {
                if (!currentAdmin) {
                  openLoginModal();
                } else {
                  onTabChange('admin');
                }
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition ${
                activeTab === 'admin'
                  ? 'bg-[#0F4E7A] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#EDBA48]" />
              <span>{currentAdmin ? 'แดชบอร์ด' : 'เจ้าหน้าที่'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Login Dialog Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-7 border border-slate-200 relative animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={closeLoginModal}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-[#0F4E7A] text-white flex items-center justify-center shadow-xs">
                <Shield className="w-6 h-6 text-[#EDBA48]" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#0F4E7A]">เข้าสู่ระบบสำหรับเจ้าหน้าที่</h3>
                <p className="text-xs text-slate-500">
                  ระบบบริหารจัดการผู้สมัคร วิ่งให้ FUN 2026
                </p>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อผู้ใช้งาน (Username)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="กรอกชื่อผู้ใช้งาน"
                    autoComplete="off"
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่าน"
                    autoComplete="new-password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium font-mono focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0F4E7A] text-white text-xs font-bold rounded-xl hover:bg-[#0c3e61] transition shadow-xs cursor-pointer"
                >
                  เข้าสู่ระบบ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
