import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { RegistrationForm } from './components/RegistrationForm';
import { CheckRegistration } from './components/CheckRegistration';
import { AdminPortal } from './components/AdminPortal';
import {
  AdminAccount,
  AppsScriptConfig,
  FormConfig,
  NavigationTab,
  Registration,
} from './types';
import {
  getAdminAccounts,
  getAppsScriptConfig,
  getFormConfig,
  getRegistrations,
  saveAdminAccounts,
  saveAppsScriptConfig,
  saveFormConfig,
  saveRegistrations,
  submitRegistration,
  fetchFormConfigFromGoogleSheets,
  saveFormConfigToGoogleSheets,
  fetchRegistrationsFromGoogleSheets,
} from './services/storageService';
import { MapPin, Phone, Mail, Award, Calendar, Heart, Shield } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('register');
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(null);

  // Core application states
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [formConfig, setFormConfig] = useState<FormConfig>(getFormConfig());
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);
  const [appsScriptConfig, setAppsScriptConfig] = useState<AppsScriptConfig>(getAppsScriptConfig());

  // Search state passed to CheckRegistration
  const [checkSearchQuery, setCheckSearchQuery] = useState<string>('');

  // Load initial data from localStorage and attempt sync with Google Sheets
  const refreshAllData = useCallback(async () => {
    const localRegs = getRegistrations();
    const localCfg = getFormConfig();
    const localAdmins = getAdminAccounts();
    const localScript = getAppsScriptConfig();

    setRegistrations(localRegs);
    setFormConfig(localCfg);
    setAdminAccounts(localAdmins);
    setAppsScriptConfig(localScript);

    // If Google Apps Script Web App URL is configured, pull latest options and registrations
    if (localScript && localScript.webAppUrl && localScript.webAppUrl.trim()) {
      try {
        const [remoteCfg, remoteRegs] = await Promise.allSettled([
          fetchFormConfigFromGoogleSheets(localScript.webAppUrl),
          fetchRegistrationsFromGoogleSheets(localScript.webAppUrl),
        ]);

        if (remoteCfg.status === 'fulfilled' && remoteCfg.value.success && remoteCfg.value.config) {
          setFormConfig(remoteCfg.value.config);
        }

        if (remoteRegs.status === 'fulfilled' && remoteRegs.value.success && remoteRegs.value.data && remoteRegs.value.data.length > 0) {
          setRegistrations(remoteRegs.value.data);
          saveRegistrations(remoteRegs.value.data);
        }
      } catch (err) {
        console.warn('Initial Google Sheets sync notice:', err);
      }
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Handle new runner registration submission
  const handleRegistrationSubmit = async (
    newRegData: Omit<Registration, 'id' | 'registeredAt' | 'status'>
  ): Promise<Registration> => {
    const saved = await submitRegistration(newRegData);
    // Refresh local state list
    setRegistrations(getRegistrations());
    return saved;
  };

  // Admin updates registrations list (status toggle, edit, delete, add)
  const handleUpdateRegistrations = (updated: Registration[]) => {
    setRegistrations(updated);
    saveRegistrations(updated);
  };

  // Admin updates form configuration (and syncs to Google Sheets if connected)
  const handleUpdateFormConfig = (newCfg: FormConfig) => {
    setFormConfig(newCfg);
    saveFormConfig(newCfg);
    if (appsScriptConfig && appsScriptConfig.webAppUrl && appsScriptConfig.webAppUrl.trim()) {
      saveFormConfigToGoogleSheets(appsScriptConfig.webAppUrl, newCfg).catch((err) => {
        console.warn('Save form config to Google Sheets note:', err);
      });
    }
  };

  // Admin updates admin accounts
  const handleUpdateAdminAccounts = (newAccounts: AdminAccount[]) => {
    setAdminAccounts(newAccounts);
    saveAdminAccounts(newAccounts);
  };

  // Admin updates Apps Script config
  const handleUpdateAppsScriptConfig = (newCfg: AppsScriptConfig) => {
    setAppsScriptConfig(newCfg);
    saveAppsScriptConfig(newCfg);
  };

  // Navigate to Check Status tab with prefilled search
  const handleNavigateToCheck = (searchName?: string) => {
    if (searchName) {
      setCheckSearchQuery(searchName);
    }
    setActiveTab('check');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-[#EDBA48]/30 selection:text-[#0F4E7A]">
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentAdmin={currentAdmin}
        adminAccounts={adminAccounts}
        onAdminLogin={(admin) => {
          setCurrentAdmin(admin);
          setActiveTab('admin');
        }}
        onAdminLogout={() => {
          setCurrentAdmin(null);
          setActiveTab('register');
        }}
        logoUrl={formConfig.logoUrl}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'register' && (
          <RegistrationForm
            formConfig={formConfig}
            onSubmitRegistration={handleRegistrationSubmit}
            onResetToHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            onNavigateToCheck={handleNavigateToCheck}
          />
        )}

        {activeTab === 'check' && (
          <CheckRegistration
            registrations={registrations}
            initialSearchQuery={checkSearchQuery}
            onRefresh={refreshAllData}
            logoUrl={formConfig.logoUrl}
          />
        )}

        {activeTab === 'admin' && currentAdmin && (
          <AdminPortal
            currentAdmin={currentAdmin}
            registrations={registrations}
            formConfig={formConfig}
            adminAccounts={adminAccounts}
            appsScriptConfig={appsScriptConfig}
            onUpdateRegistrations={handleUpdateRegistrations}
            onUpdateFormConfig={handleUpdateFormConfig}
            onUpdateAdminAccounts={handleUpdateAdminAccounts}
            onUpdateAppsScriptConfig={handleUpdateAppsScriptConfig}
            onRefreshData={refreshAllData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0F4E7A] text-white border-t-4 border-[#EDBA48] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Column 1: Organization & Event */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                {formConfig.logoUrl !== '' && (
                  <img
                    src={formConfig.logoUrl || '/logo.png'}
                    alt="ตราสัญลักษณ์ วิทยาลัยชุมชนสงขลา"
                    className="w-10 h-10 object-contain bg-white rounded-lg p-0.5 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <h3 className="font-extrabold text-base tracking-wide text-white">
                    SK-CC วิ่งให้ FUN 2026
                  </h3>
                  <p className="text-xs text-amber-200">
                    วิทยาลัยชุมชนสงขลา (Songkhla Community College)
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-amber-300 font-medium pt-1">
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#EDBA48]" />
                  <span>จัดกิจกรรมปลายปี 2569 (2026)</span>
                </p>
                <p className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-[#EDBA48]" />
                  <span>เสื้อและของที่ระลึก</span>
                </p>
              </div>
            </div>

            {/* Column 2: Location & Contact */}
            <div className="md:col-span-4 space-y-2 text-xs text-slate-200">
              <h4 className="font-bold text-sm text-[#EDBA48] mb-2">สถานที่และการติดต่อ</h4>
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#EDBA48] shrink-0 mt-0.5" />
                <span>
                  วิทยาลัยชุมชนสงขลา 48/1 ถนนเกษตรขันธ์ ต.เทพา อ.เทพา จ.สงขลา 90150
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#EDBA48] shrink-0" />
                <span>โทรศัพท์ 074-376667</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#EDBA48] shrink-0" />
                <span>อีเมล : songkhla-iccs@sk-cc.ac.th</span>
              </p>
            </div>

            {/* Column 3: Quick Navigation */}
            <div className="md:col-span-3 space-y-2 text-xs">
              <h4 className="font-bold text-sm text-[#EDBA48] mb-2">เมนูลัด</h4>
              <ul className="space-y-1.5 text-slate-200">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#EDBA48] transition cursor-pointer"
                  >
                    • ลงทะเบียนผู้สมัคร
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('check');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#EDBA48] transition cursor-pointer"
                  >
                    • ตรวจสอบสถานะการสมัคร
                  </button>
                </li>
              </ul>
              <div className="pt-2 text-[11px] text-amber-200/80">
                <span>บัญชีโอนเงิน: ธนาคารออมสิน 020470022508 (วิ่งให้ Fun ครั้งที่ 2)</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-3">
            <p>© 2026 SK-CC วิ่งให้ FUN • วิทยาลัยชุมชนสงขลา สงวนลิขสิทธิ์</p>
            <p className="text-[11px] text-slate-300 flex items-center gap-1">
              <span>ขับเคลื่อนระบบด้วย React &amp; Tailwind CSS</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
