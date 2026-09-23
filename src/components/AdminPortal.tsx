import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Shirt,
  Truck,
  DollarSign,
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  ExternalLink,
  Shield,
  Settings,
  Database,
  Link,
  Check,
  AlertCircle,
  FileCode,
  Lock,
  UserPlus,
  Key,
  X,
  Upload,
  Image as ImageIcon,
  Calendar,
  Type,
  FileText,
  GraduationCap,
  Building,
  CreditCard,
  Phone,
  User,
  MapPin,
  Tag,
  ZoomIn,
} from 'lucide-react';
import {
  AdminAccount,
  ApplicantTypeOption,
  AppsScriptConfig,
  DeliveryType,
  FormConfig,
  PrefixOption,
  Registration,
  ShirtImage,
  ShirtSizeOption,
  VerificationStatus,
} from '../types';
import { ImageZoomModal } from './ImageZoomModal';
import { AppsScriptModal } from './AppsScriptModal';
import {
  exportRegistrationsToCSV,
  testGoogleAppsScriptConnection,
  updateRegistrationInGoogleSheets,
  deleteRegistrationInGoogleSheets,
  updateStatusInGoogleSheets,
  syncToGoogleAppsScript,
  fetchFormConfigFromGoogleSheets,
  saveFormConfigToGoogleSheets,
  fetchRegistrationsFromGoogleSheets,
  generateRegistrationId,
} from '../services/storageService';
import { APPS_SCRIPT_CODE_GS, APPS_SCRIPT_INDEX_HTML } from '../data/appsScriptCode';

interface AdminPortalProps {
  currentAdmin: AdminAccount;
  registrations: Registration[];
  formConfig: FormConfig;
  adminAccounts: AdminAccount[];
  appsScriptConfig: AppsScriptConfig;
  onUpdateRegistrations: (updated: Registration[]) => void;
  onUpdateFormConfig: (newConfig: FormConfig) => void;
  onUpdateAdminAccounts: (newAccounts: AdminAccount[]) => void;
  onUpdateAppsScriptConfig: (newConfig: AppsScriptConfig) => void;
  onRefreshData: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentAdmin,
  registrations,
  formConfig,
  adminAccounts,
  appsScriptConfig,
  onUpdateRegistrations,
  onUpdateFormConfig,
  onUpdateAdminAccounts,
  onUpdateAppsScriptConfig,
  onRefreshData,
}) => {
  // Navigation tabs inside Admin Portal
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'table' | 'formSettings' | 'adminUsers' | 'googleSync'>('dashboard');

  // Filter & Search states for registrations table
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals
  const [zoomModal, setZoomModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    caption?: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: '',
  });

  const [isAppsScriptModalOpen, setIsAppsScriptModalOpen] = useState<boolean>(false);

  // Registration Edit/Add Modal
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [isNewRegistrationModalOpen, setIsNewRegistrationModalOpen] = useState<boolean>(false);

  // New Admin Account Modal
  const [isNewAdminModalOpen, setIsNewAdminModalOpen] = useState<boolean>(false);
  const [newAdminUsername, setNewAdminUsername] = useState<string>('');
  const [newAdminPassword, setNewAdminPassword] = useState<string>('');

  // Password Change Modal
  const [changingPasswordAdmin, setChangingPasswordAdmin] = useState<AdminAccount | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState<string>('');

  // Editable Event Texts
  const [eventTitleInput, setEventTitleInput] = useState<string>(formConfig.eventTitle || '');
  const [eventDateInput, setEventDateInput] = useState<string>(formConfig.eventDate || '');
  const [registrationPeriodInput, setRegistrationPeriodInput] = useState<string>(formConfig.registrationPeriod || '');
  const [pickupInstructionsInput, setPickupInstructionsInput] = useState<string>(formConfig.pickupInstructions || '');
  const [savedTextNotice, setSavedTextNotice] = useState<boolean>(false);

  // Editable Bank Info & Delivery Fee
  const [bankNameInput, setBankNameInput] = useState<string>(formConfig.bankInfo?.bankName || '');
  const [accountNoInput, setAccountNoInput] = useState<string>(formConfig.bankInfo?.accountNo || '');
  const [accountNameInput, setAccountNameInput] = useState<string>(formConfig.bankInfo?.accountName || '');
  const [bankNoteInput, setBankNoteInput] = useState<string>(formConfig.bankInfo?.note || '');
  const [deliveryFeeInput, setDeliveryFeeInput] = useState<number>(formConfig.deliveryFee ?? 50);
  const [savedBankNotice, setSavedBankNotice] = useState<boolean>(false);

  useEffect(() => {
    setEventTitleInput(formConfig.eventTitle || '');
    setEventDateInput(formConfig.eventDate || '');
    setRegistrationPeriodInput(formConfig.registrationPeriod || '');
    setPickupInstructionsInput(formConfig.pickupInstructions || '');
    setBankNameInput(formConfig.bankInfo?.bankName || '');
    setAccountNoInput(formConfig.bankInfo?.accountNo || '');
    setAccountNameInput(formConfig.bankInfo?.accountName || '');
    setBankNoteInput(formConfig.bankInfo?.note || '');
    setDeliveryFeeInput(formConfig.deliveryFee ?? 50);
  }, [formConfig]);

  const handleSaveEventTexts = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFormConfig({
      ...formConfig,
      eventTitle: eventTitleInput.trim(),
      eventDate: eventDateInput.trim(),
      registrationPeriod: registrationPeriodInput.trim(),
      pickupInstructions: pickupInstructionsInput.trim(),
    });
    setSavedTextNotice(true);
    setTimeout(() => setSavedTextNotice(false), 3000);
  };

  const handleSaveBankInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFormConfig({
      ...formConfig,
      deliveryFee: Number(deliveryFeeInput) || 0,
      bankInfo: {
        bankName: bankNameInput.trim(),
        accountNo: accountNoInput.trim(),
        accountName: accountNameInput.trim(),
        note: bankNoteInput.trim(),
      },
    });
    setSavedBankNotice(true);
    setTimeout(() => setSavedBankNotice(false), 3000);
  };

  // Editable Website Logo State and Handlers
  const [logoUrlInput, setLogoUrlInput] = useState<string>(
    formConfig.logoUrl !== undefined ? formConfig.logoUrl : '/logo.png'
  );
  const [logoNotice, setLogoNotice] = useState<string>('');

  useEffect(() => {
    setLogoUrlInput(formConfig.logoUrl !== undefined ? formConfig.logoUrl : '/logo.png');
  }, [formConfig.logoUrl]);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น (PNG, JPG, SVG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        onUpdateFormConfig({
          ...formConfig,
          logoUrl: dataUrl,
        });
        setLogoUrlInput(dataUrl);
        setLogoNotice('อัปโหลดและเปลี่ยนโลโก้ใหม่สำเร็จแล้ว!');
        setTimeout(() => setLogoNotice(''), 4000);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveLogoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFormConfig({
      ...formConfig,
      logoUrl: logoUrlInput.trim(),
    });
    setLogoNotice('บันทึกที่อยู่ URL โลโก้สำเร็จแล้ว!');
    setTimeout(() => setLogoNotice(''), 4000);
  };

  const handleDeleteLogo = () => {
    if (window.confirm('คุณต้องการลบโลโก้ออกจากเว็บไซต์ใช่หรือไม่?\n(เว็บไซต์จะซ่อนรูปภาพโลโก้ทุกตำแหน่งทันที)')) {
      onUpdateFormConfig({
        ...formConfig,
        logoUrl: '',
      });
      setLogoUrlInput('');
      setLogoNotice('ลบโลโก้เว็บไซต์เรียบร้อยแล้ว');
      setTimeout(() => setLogoNotice(''), 4000);
    }
  };

  const handleResetDefaultLogo = () => {
    onUpdateFormConfig({
      ...formConfig,
      logoUrl: '/logo.png',
    });
    setLogoUrlInput('/logo.png');
    setLogoNotice('คืนค่าโลโก้เริ่มต้น (/logo.png) เรียบร้อยแล้ว');
    setTimeout(() => setLogoNotice(''), 4000);
  };

  // Google Apps Script Connection & Sheets State
  const [testUrlInput, setTestUrlInput] = useState<string>(appsScriptConfig.webAppUrl || '');
  const [spreadsheetUrlInput, setSpreadsheetUrlInput] = useState<string>(appsScriptConfig.spreadsheetUrl || '');
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState<boolean>(false);
  const [syncStatusNotice, setSyncStatusNotice] = useState<string>('');
  const [connectionTestResult, setConnectionTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(
    appsScriptConfig.lastTestedAt
      ? {
          tested: true,
          success: !!appsScriptConfig.isConnected,
          message: appsScriptConfig.message || 'บันทึกการเชื่อมต่อแล้ว',
        }
      : null
  );

  // Shirt & Size Chart Image URL inputs
  const [shirtImageUrlInput, setShirtImageUrlInput] = useState<string>('');
  const [shirtImageTitleInput, setShirtImageTitleInput] = useState<string>('');
  const [sizeChartUrlInput, setSizeChartUrlInput] = useState<string>('');
  const [sizeChartTitleInput, setSizeChartTitleInput] = useState<string>('');

  // New Registration Form State (Admin Manual Add)
  const [newRegistrationForm, setNewRegistrationForm] = useState<
    Omit<Registration, 'id' | 'registeredAt' | 'status'> & { id?: string; status?: VerificationStatus }
  >({
    prefix: formConfig.prefixes[0]?.label || 'นาย',
    fullName: '',
    phone: '',
    applicantType: formConfig.applicantTypes[0]?.name || 'บุคคลทั่วไป',
    applicantPrice: formConfig.applicantTypes[0]?.price || 350,
    studentYear: '',
    studentRoom: '',
    studentMajor: '',
    learningLocation: '',
    shirtSize: formConfig.shirtSizes[0]?.label || 'M',
    deliveryType: 'pickup',
    deliveryFee: 0,
    address: {
      houseNo: '',
      soi: '',
      road: '',
      moo: '',
      village: '',
      subdistrict: '',
      district: '',
      province: 'สงขลา',
      postalCode: '',
      note: '',
    },
    totalAmount: formConfig.applicantTypes[0]?.price || 350,
    slipImage: '',
    status: 'ยังไม่ตรวจสอบ',
    notes: '',
  });

  const handleDownloadAppsScriptFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Refresh button
  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Status toggle for a registration row with Google Sheets sync
  const handleToggleStatus = (id: string) => {
    const reg = registrations.find((item) => item.id === id);
    if (!reg) return;

    const newStatus: VerificationStatus =
      reg.status === 'ตรวจสอบแล้ว' ? 'ยังไม่ตรวจสอบ' : 'ตรวจสอบแล้ว';

    const updated = registrations.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    onUpdateRegistrations(updated);

    if (appsScriptConfig.webAppUrl) {
      updateStatusInGoogleSheets(appsScriptConfig.webAppUrl, id, newStatus).catch((err) => {
        console.warn('Update status in Google Sheets note:', err);
      });
    }
  };

  // Delete registration record with Google Sheets sync
  const handleDeleteRegistration = (id: string, name: string) => {
    if (
      window.confirm(
        `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลการสมัครของ "${name}" (รหัส: ${id})?\n(ข้อมูลจะถูกลบออกจาก Google Sheets ด้วย)`
      )
    ) {
      const updated = registrations.filter((item) => item.id !== id);
      onUpdateRegistrations(updated);

      if (appsScriptConfig.webAppUrl) {
        deleteRegistrationInGoogleSheets(appsScriptConfig.webAppUrl, id).catch((err) => {
          console.warn('Delete registration from Google Sheets note:', err);
        });
      }
    }
  };

  // Save edited registration with Google Sheets sync
  const handleSaveEditedRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRegistration) return;

    const updated = registrations.map((item) =>
      item.id === editingRegistration.id ? editingRegistration : item
    );
    onUpdateRegistrations(updated);

    if (appsScriptConfig.webAppUrl) {
      updateRegistrationInGoogleSheets(appsScriptConfig.webAppUrl, editingRegistration).catch((err) => {
        console.warn('Update registration in Google Sheets note:', err);
      });
    }

    setEditingRegistration(null);
  };

  // Create new registration with Google Sheets sync
  const handleCreateNewRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegistrationForm.fullName.trim()) {
      alert('กรุณากรอกชื่อ-สกุลผู้สมัคร');
      return;
    }
    if (!newRegistrationForm.phone.trim()) {
      alert('กรุณากรอกเบอร์โทรติดต่อ');
      return;
    }

    const newId = generateRegistrationId(registrations);
    const newReg: Registration = {
      ...newRegistrationForm,
      id: newId,
      registeredAt: new Date().toISOString(),
      status: newRegistrationForm.status || 'ยังไม่ตรวจสอบ',
    };

    const updated = [newReg, ...registrations];
    onUpdateRegistrations(updated);

    if (appsScriptConfig.webAppUrl) {
      syncToGoogleAppsScript(appsScriptConfig.webAppUrl, newReg)
        .then((res) => {
          if (res.success && res.driveSlipUrl) {
            const listWithDrive = updated.map((r) =>
              r.id === newId ? { ...r, driveFileUrl: res.driveSlipUrl } : r
            );
            onUpdateRegistrations(listWithDrive);
          }
        })
        .catch(console.warn);
    }

    setIsNewRegistrationModalOpen(false);
    // Reset form
    setNewRegistrationForm({
      prefix: formConfig.prefixes[0]?.label || 'นาย',
      fullName: '',
      phone: '',
      applicantType: formConfig.applicantTypes[0]?.name || 'บุคคลทั่วไป',
      applicantPrice: formConfig.applicantTypes[0]?.price || 350,
      studentYear: '',
      studentRoom: '',
      studentMajor: '',
      learningLocation: '',
      shirtSize: formConfig.shirtSizes[0]?.label || 'M',
      deliveryType: 'pickup',
      deliveryFee: 0,
      address: {
        houseNo: '',
        soi: '',
        road: '',
        moo: '',
        village: '',
        subdistrict: '',
        district: '',
        province: 'สงขลา',
        postalCode: '',
        note: '',
      },
      totalAmount: formConfig.applicantTypes[0]?.price || 350,
      slipImage: '',
      status: 'ยังไม่ตรวจสอบ',
      notes: '',
    });
  };

  // Add Shirt Image from URL (Method 2)
  const handleAddShirtImageFromUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shirtImageUrlInput.trim()) {
      alert('กรุณากรอก URL ลิงก์รูปภาพแบบเสื้อ');
      return;
    }
    const newImg: ShirtImage = {
      id: 'shirt-' + Date.now(),
      title: shirtImageTitleInput.trim() || 'แบบเสื้อวิ่ง 2026',
      url: shirtImageUrlInput.trim(),
    };
    onUpdateFormConfig({
      ...formConfig,
      shirtImages: [...formConfig.shirtImages, newImg],
    });
    setShirtImageUrlInput('');
    setShirtImageTitleInput('');
    alert('เพิ่มแบบเสื้อจาก URL สำเร็จแล้ว');
  };

  // Add Size Chart from URL (Method 2)
  const handleAddSizeChartFromUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeChartUrlInput.trim()) {
      alert('กรุณากรอก URL ลิงก์รูปภาพตารางขนาดเสื้อ');
      return;
    }
    const newChart: ShirtImage = {
      id: 'chart-' + Date.now(),
      title: sizeChartTitleInput.trim() || 'ตารางขนาดเสื้อ 2026',
      url: sizeChartUrlInput.trim(),
    };
    onUpdateFormConfig({
      ...formConfig,
      sizeChartImages: [...formConfig.sizeChartImages, newChart],
    });
    setSizeChartUrlInput('');
    setSizeChartTitleInput('');
    alert('เพิ่มตารางขนาดเสื้อจาก URL สำเร็จแล้ว');
  };

  // Pull latest Config & Registrations from Google Sheets
  const handlePullFromSheets = async () => {
    if (!appsScriptConfig.webAppUrl) {
      alert('กรุณาระบุ URL Google Apps Script ก่อน');
      return;
    }
    setIsSyncingSheets(true);
    setSyncStatusNotice('กำลังดึงข้อมูลจาก Google Sheets...');
    try {
      const [cfgRes, regRes] = await Promise.all([
        fetchFormConfigFromGoogleSheets(appsScriptConfig.webAppUrl),
        fetchRegistrationsFromGoogleSheets(appsScriptConfig.webAppUrl),
      ]);
      if (cfgRes.success && cfgRes.config) {
        onUpdateFormConfig(cfgRes.config);
      }
      if (regRes.success && regRes.data && regRes.data.length > 0) {
        onUpdateRegistrations(regRes.data);
      }
      setSyncStatusNotice('ดึงตัวเลือกและรายชื่อผู้สมัครจาก Google Sheets สำเร็จแล้ว!');
      setTimeout(() => setSyncStatusNotice(''), 4000);
    } catch (err: any) {
      alert(`ดึงข้อมูลไม่สำเร็จ: ${err.message}`);
      setSyncStatusNotice('');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Push all Form Config to Google Sheets Config_2026
  const handlePushConfigToSheets = async () => {
    if (!appsScriptConfig.webAppUrl) {
      alert('กรุณาระบุ URL Google Apps Script ก่อน');
      return;
    }
    setIsSyncingSheets(true);
    setSyncStatusNotice('กำลังบันทึกตัวเลือกลง Google Sheets...');
    try {
      const res = await saveFormConfigToGoogleSheets(appsScriptConfig.webAppUrl, formConfig);
      if (res.success) {
        setSyncStatusNotice('บันทึกตัวเลือกทั้งหมดลงชีต Config_2026 สำเร็จเรียบร้อย!');
        setTimeout(() => setSyncStatusNotice(''), 4000);
      } else {
        alert(`บันทึกล้มเหลว: ${res.message}`);
      }
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Test Google Apps Script Connection
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    const result = await testGoogleAppsScriptConnection(testUrlInput);
    setConnectionTestResult({
      tested: true,
      success: result.success,
      message: result.message,
    });
    const finalSpreadsheetUrl = result.spreadsheetUrl || spreadsheetUrlInput || appsScriptConfig.spreadsheetUrl;
    if (result.spreadsheetUrl) {
      setSpreadsheetUrlInput(result.spreadsheetUrl);
    }
    onUpdateAppsScriptConfig({
      webAppUrl: testUrlInput.trim(),
      spreadsheetUrl: finalSpreadsheetUrl,
      isConnected: result.success,
      lastTestedAt: new Date().toISOString(),
      message: result.message,
    });
    setIsTestingConnection(false);
  };

  // Add new Admin Account
  const handleCreateAdminAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUsername.trim() || !newAdminPassword.trim()) {
      alert('กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน');
      return;
    }
    if (adminAccounts.some((a) => a.username.toLowerCase() === newAdminUsername.trim().toLowerCase())) {
      alert('มีชื่อผู้ใช้งานนี้อยู่ในระบบแล้ว');
      return;
    }

    const newAdmin: AdminAccount = {
      id: 'admin-' + Date.now(),
      username: newAdminUsername.trim(),
      password: newAdminPassword.trim(),
      role: 'officer',
      createdAt: new Date().toISOString(),
    };

    onUpdateAdminAccounts([...adminAccounts, newAdmin]);
    setNewAdminUsername('');
    setNewAdminPassword('');
    setIsNewAdminModalOpen(false);
    alert(`เพิ่มบัญชีแอดมิน "${newAdmin.username}" เรียบร้อยแล้ว`);
  };

  // Change Admin Password
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changingPasswordAdmin || !newPasswordVal.trim()) return;

    const updated = adminAccounts.map((a) =>
      a.id === changingPasswordAdmin.id ? { ...a, password: newPasswordVal.trim() } : a
    );
    onUpdateAdminAccounts(updated);
    setChangingPasswordAdmin(null);
    setNewPasswordVal('');
    alert('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
  };

  // Delete Admin Account
  const handleDeleteAdminAccount = (id: string, username: string) => {
    if (adminAccounts.length <= 1) {
      alert('ไม่สามารถลบบัญชีแอดมินได้ เนื่องจากต้องมีอย่างน้อย 1 บัญชีในระบบ');
      return;
    }
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีแอดมิน "${username}"?`)) {
      const updated = adminAccounts.filter((a) => a.id !== id);
      onUpdateAdminAccounts(updated);
    }
  };

  // Calculate Dashboard Statistics
  const totalRegistrations = registrations.length;
  const totalVerified = registrations.filter((r) => r.status === 'ตรวจสอบแล้ว').length;
  const totalUnverified = totalRegistrations - totalVerified;
  const totalAlumni = registrations.filter((r) => r.applicantType.includes('ศิษย์เก่า')).length;
  const totalPublic = registrations.filter((r) => r.applicantType.includes('ประชาชน')).length;
  const totalPickup = registrations.filter((r) => r.deliveryType === 'pickup').length;
  const totalPostal = registrations.filter((r) => r.deliveryType === 'postal').length;
  const totalRevenue = registrations.reduce((sum, r) => sum + (r.totalAmount || 0), 0);

  // Shirt sizes breakdown
  const shirtCounts: { [size: string]: number } = {};
  registrations.forEach((r) => {
    const key = r.shirtSize || 'ไม่ระบุ';
    shirtCounts[key] = (shirtCounts[key] || 0) + 1;
  });

  // Filter registrations for Table view: SORTED LATEST TO OLDEST
  const filteredRegistrations = registrations
    .slice()
    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
    .filter((r) => {
      const matchSearch =
        searchTerm === '' ||
        r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone.includes(searchTerm);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchType = typeFilter === 'all' || r.applicantType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#0F4E7A] text-white">
              <Shield className="w-5 h-5 text-[#EDBA48]" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0F4E7A]">
                ระบบจัดการสำหรับเจ้าหน้าที่ (Officer Portal)
              </h2>
              <p className="text-xs text-slate-500">
                ผู้ใช้งานปัจจุบัน:{' '}
                <strong className="text-slate-800 font-mono">{currentAdmin.username}</strong> •
                วิทยาลัยชุมชนสงขลา
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Button: Refresh from Database */}
          <button
            id="btn-refresh-database"
            type="button"
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0F4E7A]' : ''}`} />
            <span>รีเฟรชข้อมูล จากฐานข้อมูล</span>
          </button>

          {/* Button: View Apps Script Code */}
          <button
            id="btn-view-apps-script-code"
            type="button"
            onClick={() => setIsAppsScriptModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#0F4E7A] text-white hover:bg-[#0c3e61] transition shadow-xs cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-[#EDBA48]" />
            <span>โค้ด Apps Script (.gs)</span>
          </button>

          {/* Button: Export CSV */}
          <button
            id="btn-export-csv"
            type="button"
            onClick={() => exportRegistrationsToCSV(registrations)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก Excel/CSV</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3">
        <button
          id="tab-admin-dashboard"
          type="button"
          onClick={() => setActiveAdminTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition ${
            activeAdminTab === 'dashboard'
              ? 'bg-[#0F4E7A] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>แดชบอร์ดสรุปผล</span>
        </button>

        <button
          id="tab-admin-table"
          type="button"
          onClick={() => setActiveAdminTab('table')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition ${
            activeAdminTab === 'table'
              ? 'bg-[#0F4E7A] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>ตารางข้อมูลผู้สมัคร ({registrations.length})</span>
        </button>

        <button
          id="tab-admin-form-settings"
          type="button"
          onClick={() => setActiveAdminTab('formSettings')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition ${
            activeAdminTab === 'formSettings'
              ? 'bg-[#0F4E7A] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>จัดการช่องฟอร์มกรอกข้อมูล</span>
        </button>

        <button
          id="tab-admin-users"
          type="button"
          onClick={() => setActiveAdminTab('adminUsers')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition ${
            activeAdminTab === 'adminUsers'
              ? 'bg-[#0F4E7A] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>จัดการบัญชีแอดมิน ({adminAccounts.length})</span>
        </button>

        <button
          id="tab-admin-google-sync"
          type="button"
          onClick={() => setActiveAdminTab('googleSync')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition ${
            activeAdminTab === 'googleSync'
              ? 'bg-[#0F4E7A] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Link className="w-4 h-4 text-[#EDBA48]" />
          <span>เชื่อมต่อ Google Sheets &amp; Drive</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. DASHBOARD TAB */}
      {/* ========================================================================= */}
      {activeAdminTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Counters Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Runners */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">ผู้สมัครทั้งหมด</span>
                <span className="p-2 rounded-lg bg-sky-50 text-[#0F4E7A]">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#0F4E7A] mt-2">
                {totalRegistrations} <span className="text-xs font-normal text-slate-500">คน</span>
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                ล่าสุด: {registrations[0]?.fullName || '-'}
              </span>
            </div>

            {/* Verified vs Unverified */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">สถานะการตรวจสอบ</span>
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-2xl font-black text-emerald-600">{totalVerified}</span>
                <span className="text-xs text-slate-400">ตรวจสอบแล้ว</span>
                <span className="text-slate-300">/</span>
                <span className="text-xl font-bold text-amber-600">{totalUnverified}</span>
                <span className="text-xs text-slate-400">ยังไม่ตรวจ</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{
                    width: totalRegistrations > 0 ? `${(totalVerified / totalRegistrations) * 100}%` : '0%',
                  }}
                />
                <div
                  className="bg-amber-400 h-full"
                  style={{
                    width: totalRegistrations > 0 ? `${(totalUnverified / totalRegistrations) * 100}%` : '0%',
                  }}
                />
              </div>
            </div>

            {/* Alumni vs Public */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">ประเภทผู้สมัคร</span>
                <span className="p-2 rounded-lg bg-amber-50 text-[#EDBA48]">
                  <Shirt className="w-4 h-4" />
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-700 mt-2">
                ศิษย์เก่า: <strong className="text-base text-[#0F4E7A]">{totalAlumni}</strong> คน
              </p>
              <p className="text-sm font-semibold text-slate-700">
                ประชาชน: <strong className="text-base text-[#0F4E7A]">{totalPublic}</strong> คน
              </p>
            </div>

            {/* Total Revenue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">ยอดเงินรวมโดยประมาณ</span>
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">
                {totalRevenue.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-500">บาท</span>
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                รับเอง {totalPickup} ราย • ไปรษณีย์ {totalPostal} ราย
              </span>
            </div>
          </div>

          {/* Shirt Sizes Distribution Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-[#0F4E7A] mb-4 flex items-center gap-2">
              <Shirt className="w-4 h-4 text-[#EDBA48]" />
              <span>สรุปยอดจำนวนเสื้อวิ่งแยกตามขนาด (SS - 5XL)</span>
            </h3>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
              {formConfig.shirtSizes.map((size) => {
                const count = shirtCounts[size.label] || 0;
                return (
                  <div
                    key={size.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-center hover:border-[#0F4E7A] transition"
                  >
                    <span className="block text-xs font-bold text-[#0F4E7A]">{size.code}</span>
                    <span className="text-[11px] text-slate-400 block mb-1">อก {size.chest}"</span>
                    <span className="text-xl font-black text-slate-900">{count}</span>
                    <span className="text-[10px] text-slate-500 block">ตัว</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REGISTRATIONS TABLE TAB (LATEST TO OLDEST) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'table' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Table Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหาชื่อ, รหัส, หรือเบอร์โทร..."
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-700"
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="ตรวจสอบแล้ว">ตรวจสอบแล้ว</option>
                <option value="ยังไม่ตรวจสอบ">ยังไม่ตรวจสอบ</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-700"
              >
                <option value="all">ทุกประเภทผู้สมัคร</option>
                {formConfig.applicantTypes.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNewRegistrationModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#0F4E7A] text-white hover:bg-[#0c3e61] transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#EDBA48]" />
                <span>เพิ่มข้อมูลผู้สมัคร</span>
              </button>
            </div>
          </div>

          {/* Table Container (Shows all data, sorted from latest to oldest) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0F4E7A] text-white">
                    <th className="py-3 px-4 font-semibold">วันเวลา / รหัส</th>
                    <th className="py-3 px-4 font-semibold">ชื่อ-สกุล</th>
                    <th className="py-3 px-4 font-semibold">เบอร์โทร</th>
                    <th className="py-3 px-4 font-semibold">ประเภท</th>
                    <th className="py-3 px-4 font-semibold">ไซส์เสื้อ</th>
                    <th className="py-3 px-4 font-semibold">การจัดส่ง &amp; ที่อยู่</th>
                    <th className="py-3 px-4 font-semibold text-right">ยอดชำระ</th>
                    <th className="py-3 px-4 font-semibold text-center">สลิปโอนเงิน</th>
                    <th className="py-3 px-4 font-semibold text-center">สถานะการตรวจสอบ</th>
                    <th className="py-3 px-4 font-semibold text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        ไม่พบข้อมูลการสมัครที่ตรงกับเงื่อนไข
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => {
                      const isVerified = reg.status === 'ตรวจสอบแล้ว';
                      return (
                        <tr
                          key={reg.id}
                          className="hover:bg-slate-50/80 transition group"
                        >
                          {/* Date & ID */}
                          <td className="py-3 px-4 align-top">
                            <span className="font-mono font-bold text-[#0F4E7A] block">
                              {reg.id}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(reg.registeredAt).toLocaleString('th-TH', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </span>
                          </td>

                          {/* Full Name */}
                          <td className="py-3 px-4 align-top font-semibold text-slate-800">
                            {reg.prefix} {reg.fullName}
                          </td>

                          {/* Phone */}
                          <td className="py-3 px-4 align-top font-mono text-slate-600">
                            {reg.phone}
                          </td>

                          {/* Applicant Type */}
                          <td className="py-3 px-4 align-top">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                                reg.applicantType.includes('ศิษย์เก่า')
                                  ? 'bg-amber-100 text-amber-800'
                                  : reg.applicantType.includes('นักศึกษา')
                                  ? 'bg-blue-100 text-blue-800 font-semibold'
                                  : reg.applicantType.includes('อาจารย์')
                                  ? 'bg-purple-100 text-purple-800 font-semibold'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {reg.applicantType}
                            </span>
                            {reg.studentYear && (
                              <div className="mt-1 text-[11px] text-slate-600 bg-amber-50/90 p-1.5 rounded-lg border border-amber-200/60 leading-tight">
                                <span className="font-bold text-[#0F4E7A]">ปี {reg.studentYear} ห้อง {reg.studentRoom}</span>
                                <div className="text-slate-700 font-medium truncate max-w-[140px]" title={reg.studentMajor}>
                                  สาขา: {reg.studentMajor}
                                </div>
                                <div className="text-slate-500 text-[10px] truncate max-w-[140px]" title={reg.learningLocation}>
                                  {reg.learningLocation}
                                </div>
                              </div>
                            )}
                            {!reg.studentYear && reg.learningLocation && (
                              <div className="mt-1 text-[11px] text-slate-600 bg-sky-50/90 p-1.5 rounded-lg border border-sky-200/60 leading-tight">
                                <span className="font-bold text-[#0F4E7A]">สถานที่สอน:</span>
                                <div className="text-slate-500 text-[10px] truncate max-w-[140px]" title={reg.learningLocation}>
                                  {reg.learningLocation}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Shirt Size */}
                          <td className="py-3 px-4 align-top font-medium text-slate-700">
                            {reg.shirtSize}
                          </td>

                          {/* Delivery & Address */}
                          <td className="py-3 px-4 align-top max-w-[220px]">
                            {reg.deliveryType === 'pickup' ? (
                              <span className="text-slate-600 font-medium text-xs flex items-center gap-1">
                                <Truck className="w-3 h-3 text-[#0F4E7A]" /> รับเอง ณ วชช.สงขลา
                              </span>
                            ) : (
                              <div>
                                <span className="text-amber-800 font-medium text-xs flex items-center gap-1">
                                  <Truck className="w-3 h-3 text-amber-600" /> จัดส่งไปรษณีย์
                                </span>
                                {reg.address && (
                                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                                    {reg.address.houseNo} {reg.address.village} {reg.address.subdistrict} {reg.address.district} {reg.address.province} {reg.address.postalCode}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Total Amount */}
                          <td className="py-3 px-4 align-top text-right font-bold text-slate-800">
                            {reg.totalAmount} บาท
                          </td>

                          {/* Slip Image Thumbnail */}
                          <td className="py-3 px-4 align-top text-center">
                            {reg.slipImage ? (
                              <div
                                onClick={() =>
                                  setZoomModal({
                                    isOpen: true,
                                    imageUrl: reg.slipImage,
                                    title: `สลิปการโอนเงิน: ${reg.prefix} ${reg.fullName}`,
                                    caption: `รหัส: ${reg.id} • ยอดเงิน: ${reg.totalAmount} บาท`,
                                  })
                                }
                                className="relative inline-block w-12 h-14 rounded border border-slate-200 overflow-hidden cursor-pointer hover:border-[#0F4E7A] hover:shadow transition group"
                              >
                                <img
                                  src={reg.slipImage}
                                  alt="Slip"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-[#0F4E7A]/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                  <Eye className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">ไม่มีสลิป</span>
                            )}
                          </td>

                          {/* Status & Quick Toggle */}
                          <td className="py-3 px-4 align-top text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(reg.id)}
                              title="คลิกเพื่อสลับสถานะ"
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition shadow-2xs ${
                                isVerified
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              }`}
                            >
                              {isVerified ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>ตรวจสอบแล้ว</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>ยังไม่ตรวจสอบ</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Actions: Edit & Delete */}
                          <td className="py-3 px-4 align-top text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => setEditingRegistration({ ...reg })}
                                title="แก้ไขข้อมูล"
                                className="p-1.5 text-slate-500 hover:text-[#0F4E7A] hover:bg-slate-100 rounded transition"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRegistration(reg.id, reg.fullName)}
                                title="ลบข้อมูล"
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FORM SETTINGS TAB (Prefixes, Types, Shirts, Sizes) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'formSettings' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-4 rounded-xl bg-amber-50 border border-[#EDBA48]/40 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#0F4E7A] shrink-0" />
              <span>
                แอดมินสามารถ เพิ่ม ลบ แก้ไข โลโก้เว็บไซต์ ข้อความประชาสัมพันธ์ และช่องฟอร์มกรอกข้อมูลทุกช่องได้ที่นี่
                ข้อมูลจะอัปเดตลงหน้าเว็บและชีต <strong>Config_2026</strong> ทันที
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePullFromSheets}
                disabled={isSyncingSheets || !appsScriptConfig.webAppUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#0F4E7A] ${isSyncingSheets ? 'animate-spin' : ''}`} />
                <span>ดึงตัวเลือกจาก Sheets</span>
              </button>

              <button
                type="button"
                onClick={handlePushConfigToSheets}
                disabled={isSyncingSheets || !appsScriptConfig.webAppUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F4E7A] text-white hover:bg-[#0c3e61] text-xs font-semibold transition disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5 text-[#EDBA48]" />
                <span>บันทึกตัวเลือกลง Google Sheets</span>
              </button>
            </div>
          </div>

          {/* Form Settings: Website Logo Management */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-5">
              <div>
                <h4 className="font-bold text-[#0F4E7A] text-base flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#EDBA48]" />
                  <span>จัดการโลโก้เว็บไซต์ (Website Logo Management)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  แอดมินสามารถ อัปโหลดเปลี่ยนโลโก้ใหม่ (เพิ่ม/แก้ไข), ลบโลโก้ หรือคืนค่าเริ่มต้นได้ตามต้องการ
                </p>
              </div>
              {logoNotice && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{logoNotice}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Current Logo Preview */}
              <div className="md:col-span-4 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center text-center">
                <span className="text-xs font-bold text-slate-600 mb-3">
                  พรีวิวโลโก้ปัจจุบันบนเว็บไซต์
                </span>

                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center p-2 mb-3 relative overflow-hidden shadow-2xs">
                  {formConfig.logoUrl !== '' ? (
                    <img
                      src={formConfig.logoUrl || '/logo.png'}
                      alt="โลโก้ปัจจุบัน"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-slate-400 text-xs flex flex-col items-center gap-1 p-2">
                      <AlertCircle className="w-6 h-6 text-amber-500" />
                      <span className="font-semibold text-slate-600">ไม่มีโลโก้</span>
                      <span className="text-[10px] text-slate-400 leading-tight">
                        (โลโก้ถูกลบออกแล้ว)
                      </span>
                    </div>
                  )}
                </div>

                <div className="w-full flex items-center justify-center gap-2">
                  {formConfig.logoUrl !== '' && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setZoomModal({
                            isOpen: true,
                            imageUrl: formConfig.logoUrl || '/logo.png',
                            title: 'โลโก้เว็บไซต์ SK-CC วิ่งให้ FUN',
                          })
                        }
                        className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#0F4E7A]" />
                        <span>ดูภาพเต็ม</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteLogo}
                        className="py-1.5 px-3 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        title="ลบโลโก้ออกจากเว็บไซต์"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>ลบโลโก้</span>
                      </button>
                    </>
                  )}
                  {formConfig.logoUrl === '' && (
                    <button
                      type="button"
                      onClick={handleResetDefaultLogo}
                      className="w-full py-1.5 px-3 rounded-lg bg-[#0F4E7A] hover:bg-[#0c3e61] text-white text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#EDBA48]" />
                      <span>คืนค่าโลโก้เดิม (/logo.png)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Actions to Add / Edit / Replace Logo */}
              <div className="md:col-span-8 space-y-4">
                {/* Method 1: Upload Image File */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#0F4E7A]" />
                    <span>วิธีที่ 1: อัปโหลดรูปภาพโลโก้ใหม่จากเครื่อง (แนะนำ)</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mb-3">
                    รองรับไฟล์รูปภาพ PNG (พื้นหลังโปร่งใส), JPG, WebP หรือ SVG ขนาดไฟล์แนะนำไม่เกิน 2MB
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F4E7A] text-white text-xs sm:text-sm font-bold hover:bg-[#0c3e61] transition shadow-xs cursor-pointer">
                    <Upload className="w-4 h-4 text-[#EDBA48]" />
                    <span>เลือกไฟล์รูปภาพเพื่อเปลี่ยนโลโก้</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Method 2: Image URL */}
                <form onSubmit={handleSaveLogoUrl} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Link className="w-4 h-4 text-[#0F4E7A]" />
                    <span>วิธีที่ 2: ระบุที่อยู่ลิงก์รูปภาพโลโก้ (Image URL)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={logoUrlInput}
                      onChange={(e) => setLogoUrlInput(e.target.value)}
                      placeholder="เช่น /logo.png หรือ https://example.com/logo.png"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 bg-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-white border border-slate-300 text-[#0F4E7A] hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer shadow-2xs"
                    >
                      บันทึก URL
                    </button>
                  </div>
                </form>

                {/* Quick Actions */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-400">
                    * เมื่อเปลี่ยนหรือลบแล้ว โลโก้จะอัปเดตบนแถบเมนูด้านบน หน้าฟอร์ม หน้าค้นหา และท้ายเว็บทันที
                  </span>
                  {formConfig.logoUrl !== '/logo.png' && (
                    <button
                      type="button"
                      onClick={handleResetDefaultLogo}
                      className="text-xs text-[#0F4E7A] hover:underline font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#EDBA48]" />
                      <span>คืนค่าโลโก้เดิม (/logo.png)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Settings: Event Texts Management */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
              <div>
                <h4 className="font-bold text-[#0F4E7A] text-base flex items-center gap-2">
                  <Type className="w-5 h-5 text-[#EDBA48]" />
                  <span>แก้ไขข้อความหัวเรื่อง กำหนดการ และคำแนะนำการรับเสื้อ</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  ปรับเปลี่ยนข้อความประชาสัมพันธ์หลักและคำแนะนำการรับเสื้อบนหน้าฟอร์มการสมัคร
                </p>
              </div>
              {savedTextNotice && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>บันทึกข้อความสำเร็จแล้ว!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveEventTexts} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* 1. Event Title */}
                <div className="sm:col-span-12">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#0F4E7A]" />
                    <span>ข้อความหัวเรื่องกิจกรรม (Event Title)</span>
                  </label>
                  <input
                    type="text"
                    value={eventTitleInput}
                    onChange={(e) => setEventTitleInput(e.target.value)}
                    placeholder="เช่น มหกรรมวิ่ง วิทยาลัยชุมชนสงขลา SK-CC วิ่งให้ FUN ประจำปี 2569"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    แสดงเป็นหัวข้อใหญ่บนหน้าเว็บฟอร์มลงทะเบียน
                  </span>
                </div>

                {/* 2. Event Date */}
                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#EDBA48]" />
                    <span>วันที่จัดกิจกรรม (Event Date)</span>
                  </label>
                  <input
                    type="text"
                    value={eventDateInput}
                    onChange={(e) => setEventDateInput(e.target.value)}
                    placeholder="เช่น 18 ตุลาคม 2569"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20"
                  />
                </div>

                {/* 3. Registration Period */}
                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#EDBA48]" />
                    <span>กำหนดการรับสมัคร (Registration Period)</span>
                  </label>
                  <input
                    type="text"
                    value={registrationPeriodInput}
                    onChange={(e) => setRegistrationPeriodInput(e.target.value)}
                    placeholder="เช่น สมัครได้ตั้งเเต่วันที่ 23 กันยายน - 10 ตุลาคม 2569"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20"
                  />
                </div>

                {/* 4. Pickup Instructions */}
                <div className="sm:col-span-12">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#0F4E7A]" />
                    <span>ข้อความคำแนะนำการรับเสื้อด้วยตนเอง (ส่วนที่ 2 การจัดส่ง)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={pickupInstructionsInput}
                    onChange={(e) => setPickupInstructionsInput(e.target.value)}
                    placeholder="เช่น รับเสื้อด้วยตนเอง : ท่านสามารถติดต่อรับเสื้อวิ่งได้..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 leading-relaxed"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    ข้อความนี้จะแสดงเมื่อผู้สมัครเลือก "รับด้วยตัวเอง ณ วิทยาลัยชุมชนสงขลา"
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('ต้องการคืนค่าข้อความเริ่มต้นใช่หรือไม่?')) {
                      setEventTitleInput('มหกรรมวิ่ง วิทยาลัยชุมชนสงขลา SK-CC วิ่งให้ FUN ประจำปี 2569');
                      setEventDateInput('18 ตุลาคม 2569');
                      setRegistrationPeriodInput('สมัครได้ตั้งเเต่วันที่ 23 กันยายน - 10 ตุลาคม 2569');
                      setPickupInstructionsInput(
                        'รับเสื้อด้วยตนเอง : ท่านสามารถติดต่อรับเสื้อวิ่งได้\nในวันที่ 14 ตุลาคม 2569 ตั้งเเต่เวลา 09:00 - 16:00 น.\nณ อาคารวิทยบริการ ชั้น 2 วิทยาลัยชุมชนสงขลา'
                      );
                    }
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
                >
                  คืนค่าข้อความเริ่มต้น
                </button>

                <button
                  id="btn-save-event-texts"
                  type="submit"
                  className="px-5 py-2.5 bg-[#0F4E7A] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#0c3e61] transition shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#EDBA48]" />
                  <span>บันทึกการแก้ไขข้อความ</span>
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manage Prefixes */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-[#0F4E7A] text-sm flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#EDBA48]" />
                  <span>จัดการคำนำหน้าชื่อ (Prefixes)</span>
                </h4>
              </div>

              {/* List */}
              <div className="space-y-2 mb-4">
                {formConfig.prefixes.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                  >
                    <span className="font-semibold text-slate-700">{p.label}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const newLabel = prompt(`แก้ไขคำนำหน้า:`, p.label);
                          if (newLabel && newLabel.trim()) {
                            const updated = formConfig.prefixes.map((item) =>
                              item.id === p.id ? { ...item, label: newLabel.trim() } : item
                            );
                            onUpdateFormConfig({ ...formConfig, prefixes: updated });
                          }
                        }}
                        className="text-[#0F4E7A] hover:underline px-2 py-1 text-xs"
                      >
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (formConfig.prefixes.length <= 1) {
                            alert('ต้องมีคำนำหน้าอย่างน้อย 1 รายการ');
                            return;
                          }
                          const updated = formConfig.prefixes.filter((item) => item.id !== p.id);
                          onUpdateFormConfig({ ...formConfig, prefixes: updated });
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Prefix Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.currentTarget.elements.namedItem('newPrefix') as HTMLInputElement).value;
                  if (!input.trim()) return;
                  const newP: PrefixOption = { id: 'p-' + Date.now(), label: input.trim() };
                  onUpdateFormConfig({ ...formConfig, prefixes: [...formConfig.prefixes, newP] });
                  e.currentTarget.reset();
                }}
                className="flex gap-2"
              >
                <input
                  name="newPrefix"
                  type="text"
                  placeholder="เพิ่มคำนำหน้าใหม่ เช่น ร.ต.อ., ผศ.ดร."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#0F4E7A] text-white rounded-lg text-xs font-semibold hover:bg-[#0c3e61]"
                >
                  เพิ่ม
                </button>
              </form>
            </div>

            {/* Manage Applicant Types & Pricing */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h4 className="font-bold text-[#0F4E7A] text-sm mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#EDBA48]" />
                <span>จัดการประเภทผู้สมัครและราคา (Types &amp; Price)</span>
              </h4>

              <div className="space-y-2 mb-4">
                {formConfig.applicantTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{type.name}</span>
                      <span className="text-slate-500 ml-2 font-mono">({type.price} บาท)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const newName = prompt(`ระบุชื่อประเภทใหม่สำหรับ "${type.name}":`, type.name);
                          if (newName && newName.trim()) {
                            const newPrice = prompt(`ระบุราคาสำหรับ "${newName.trim()}" (บาท):`, type.price.toString());
                            if (newPrice !== null && !isNaN(Number(newPrice))) {
                              const updated = formConfig.applicantTypes.map((t) =>
                                t.id === type.id ? { ...t, name: newName.trim(), price: Number(newPrice) } : t
                              );
                              onUpdateFormConfig({ ...formConfig, applicantTypes: updated });
                            }
                          }
                        }}
                        className="text-[#0F4E7A] hover:underline px-2 py-1"
                      >
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (formConfig.applicantTypes.length <= 1) {
                            alert('ต้องมีประเภทผู้สมัครอย่างน้อย 1 ประเภท');
                            return;
                          }
                          const updated = formConfig.applicantTypes.filter((t) => t.id !== type.id);
                          onUpdateFormConfig({ ...formConfig, applicantTypes: updated });
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Type Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.currentTarget;
                  const name = (target.elements.namedItem('typeName') as HTMLInputElement).value;
                  const price = (target.elements.namedItem('typePrice') as HTMLInputElement).value;
                  if (!name.trim() || !price) return;
                  const newType: ApplicantTypeOption = {
                    id: 't-' + Date.now(),
                    name: name.trim(),
                    price: Number(price),
                  };
                  onUpdateFormConfig({ ...formConfig, applicantTypes: [...formConfig.applicantTypes, newType] });
                  target.reset();
                }}
                className="grid grid-cols-12 gap-2"
              >
                <input
                  name="typeName"
                  type="text"
                  placeholder="ชื่อประเภทผู้สมัครใหม่"
                  className="col-span-7 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
                <input
                  name="typePrice"
                  type="number"
                  placeholder="ราคา (บาท)"
                  className="col-span-3 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
                <button
                  type="submit"
                  className="col-span-2 px-2 py-1.5 bg-[#0F4E7A] text-white rounded-lg text-xs font-semibold hover:bg-[#0c3e61]"
                >
                  เพิ่ม
                </button>
              </form>
            </div>

            {/* Manage Bank Info & Shipping Fee */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs md:col-span-2">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h4 className="font-bold text-[#0F4E7A] text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#EDBA48]" />
                  <span>จัดการข้อมูลบัญชีธนาคารและค่าจัดส่งไปรษณีย์</span>
                </h4>
                {savedBankNotice && (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full animate-in fade-in">
                    ✓ บันทึกข้อมูลการเงินสำเร็จ
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveBankInfo} className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
                <div className="sm:col-span-4">
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อธนาคาร</label>
                  <input
                    type="text"
                    value={bankNameInput}
                    onChange={(e) => setBankNameInput(e.target.value)}
                    placeholder="เช่น ธนาคารออมสิน"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-semibold text-slate-700 mb-1">เลขที่บัญชี</label>
                  <input
                    type="text"
                    value={accountNoInput}
                    onChange={(e) => setAccountNoInput(e.target.value)}
                    placeholder="เช่น 020470022508"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อบัญชี</label>
                  <input
                    type="text"
                    value={accountNameInput}
                    onChange={(e) => setAccountNameInput(e.target.value)}
                    placeholder="เช่น วิ่งให้ Fun ครั้งที่ 2"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="sm:col-span-8">
                  <label className="block font-semibold text-slate-700 mb-1">คำแนะนำ / บันทึกช่วยจำในสลิป</label>
                  <input
                    type="text"
                    value={bankNoteInput}
                    onChange={(e) => setBankNoteInput(e.target.value)}
                    placeholder="เช่น กรุณาระบุ ชื่อ-สกุล ในสลิปการชำระเงิน"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-semibold text-slate-700 mb-1">ค่าจัดส่งไปรษณีย์ (บาท)</label>
                  <input
                    type="number"
                    value={deliveryFeeInput}
                    onChange={(e) => setDeliveryFeeInput(Number(e.target.value))}
                    placeholder="50"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold font-mono"
                  />
                </div>

                <div className="sm:col-span-12 flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0F4E7A] text-white rounded-xl font-bold text-xs hover:bg-[#0c3e61] transition shadow-xs"
                  >
                    บันทึกข้อมูลบัญชีและค่าจัดส่ง
                  </button>
                </div>
              </form>
            </div>

            {/* Manage Shirt Sizes */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs md:col-span-2">
              <h4 className="font-bold text-[#0F4E7A] text-sm mb-4 flex items-center gap-2">
                <Shirt className="w-4 h-4 text-[#EDBA48]" />
                <span>จัดการตัวเลือกขนาดเสื้อวิ่งและตารางไซส์ (Shirt Sizes)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-4">
                {formConfig.shirtSizes.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 mr-2">{s.code}</span>
                      <span className="text-slate-600 font-medium">อก {s.chest}" ยาว {s.length}"</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const newChest = prompt(`ระบุรอบอกใหม่ (นิ้ว) สำหรับ ${s.code}:`, s.chest.toString());
                          const newLen = prompt(`ระบุความยาวใหม่ (นิ้ว) สำหรับ ${s.code}:`, s.length.toString());
                          if (newChest && newLen && !isNaN(Number(newChest)) && !isNaN(Number(newLen))) {
                            const updated = formConfig.shirtSizes.map((item) =>
                              item.id === s.id
                                ? {
                                    ...item,
                                    chest: Number(newChest),
                                    length: Number(newLen),
                                    label: `${item.code} (รอบอก ${newChest} ยาว ${newLen})`,
                                  }
                                : item
                            );
                            onUpdateFormConfig({ ...formConfig, shirtSizes: updated });
                          }
                        }}
                        className="text-[#0F4E7A] hover:underline px-1.5 py-0.5"
                      >
                        แก้
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (formConfig.shirtSizes.length <= 1) {
                            alert('ต้องมีขนาดเสื้ออย่างน้อย 1 ขนาด');
                            return;
                          }
                          const updated = formConfig.shirtSizes.filter((item) => item.id !== s.id);
                          onUpdateFormConfig({ ...formConfig, shirtSizes: updated });
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Shirt Size Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.currentTarget;
                  const code = (target.elements.namedItem('sizeCode') as HTMLInputElement).value.trim();
                  const chest = (target.elements.namedItem('sizeChest') as HTMLInputElement).value;
                  const length = (target.elements.namedItem('sizeLength') as HTMLInputElement).value;
                  if (!code || !chest || !length) return;
                  const newSize: ShirtSizeOption = {
                    id: 'sz-' + Date.now(),
                    code: code.toUpperCase(),
                    chest: Number(chest),
                    length: Number(length),
                    label: `${code.toUpperCase()} (รอบอก ${chest} ยาว ${length})`,
                  };
                  onUpdateFormConfig({ ...formConfig, shirtSizes: [...formConfig.shirtSizes, newSize] });
                  target.reset();
                }}
                className="grid grid-cols-12 gap-2"
              >
                <input
                  name="sizeCode"
                  type="text"
                  placeholder="รหัสไซส์ เช่น 6XL"
                  className="col-span-4 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
                <input
                  name="sizeChest"
                  type="number"
                  placeholder="รอบอก (นิ้ว)"
                  className="col-span-3 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
                <input
                  name="sizeLength"
                  type="number"
                  placeholder="ความยาว (นิ้ว)"
                  className="col-span-3 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
                <button
                  type="submit"
                  className="col-span-2 px-2 py-1.5 bg-[#0F4E7A] text-white rounded-lg text-xs font-semibold hover:bg-[#0c3e61]"
                >
                  เพิ่มไซส์
                </button>
              </form>
            </div>

            {/* Manage Student & Learning Location Options */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs md:col-span-2">
              <h4 className="font-bold text-[#0F4E7A] text-sm mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#EDBA48]" />
                <span>จัดการตัวเลือกฟอร์มข้อมูลนักศึกษา / อาจารย์พิเศษ</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Student Years */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="font-bold text-xs text-slate-700 mb-2">รหัสชั้นปี (เช่น 67, 68, 69)</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(formConfig.studentYears || ['67', '68', '69']).map((yr) => (
                      <span
                        key={yr}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        {yr}
                        <button
                          type="button"
                          onClick={() => {
                            const list = formConfig.studentYears || ['67', '68', '69'];
                            if (list.length <= 1) {
                              alert('ต้องมีอย่างน้อย 1 รายการ');
                              return;
                            }
                            onUpdateFormConfig({
                              ...formConfig,
                              studentYears: list.filter((y) => y !== yr),
                            });
                          }}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const val = (e.currentTarget.elements.namedItem('newYr') as HTMLInputElement).value.trim();
                      if (!val) return;
                      const list = formConfig.studentYears || ['67', '68', '69'];
                      if (!list.includes(val)) {
                        onUpdateFormConfig({ ...formConfig, studentYears: [...list, val] });
                      }
                      e.currentTarget.reset();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      name="newYr"
                      type="text"
                      placeholder="เพิ่มชั้นปี เช่น 70"
                      className="flex-1 px-2.5 py-1 text-xs rounded border border-slate-300 bg-white"
                    />
                    <button type="submit" className="px-3 py-1 bg-[#0F4E7A] text-white rounded text-xs font-bold">
                      เพิ่ม
                    </button>
                  </form>
                </div>

                {/* 2. Student Rooms */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="font-bold text-xs text-slate-700 mb-2">ห้อง (เช่น 1, 2, 3)</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(formConfig.studentRooms || ['1', '2']).map((rm) => (
                      <span
                        key={rm}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        ห้อง {rm}
                        <button
                          type="button"
                          onClick={() => {
                            const list = formConfig.studentRooms || ['1', '2'];
                            if (list.length <= 1) {
                              alert('ต้องมีอย่างน้อย 1 รายการ');
                              return;
                            }
                            onUpdateFormConfig({
                              ...formConfig,
                              studentRooms: list.filter((r) => r !== rm),
                            });
                          }}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const val = (e.currentTarget.elements.namedItem('newRm') as HTMLInputElement).value.trim();
                      if (!val) return;
                      const list = formConfig.studentRooms || ['1', '2'];
                      if (!list.includes(val)) {
                        onUpdateFormConfig({ ...formConfig, studentRooms: [...list, val] });
                      }
                      e.currentTarget.reset();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      name="newRm"
                      type="text"
                      placeholder="เพิ่มห้อง เช่น 3"
                      className="flex-1 px-2.5 py-1 text-xs rounded border border-slate-300 bg-white"
                    />
                    <button type="submit" className="px-3 py-1 bg-[#0F4E7A] text-white rounded text-xs font-bold">
                      เพิ่ม
                    </button>
                  </form>
                </div>

                {/* 3. Student Majors */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="font-bold text-xs text-slate-700 mb-2">สาขาวิชา</p>
                  <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
                    {(formConfig.studentMajors || [
                      'เทคโนโลยีดิจิทัลธุรกิจ',
                      'การพัฒนาเด็กปฐมวัย',
                      'การปกครองท้องถิ่น',
                      'การจัดการ',
                      'สาธารณสุขชุมชน',
                    ]).map((maj) => (
                      <div
                        key={maj}
                        className="flex items-center justify-between px-2.5 py-1 bg-white border border-slate-300 rounded text-xs"
                      >
                        <span className="truncate">{maj}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = formConfig.studentMajors || [
                              'เทคโนโลยีดิจิทัลธุรกิจ',
                              'การพัฒนาเด็กปฐมวัย',
                              'การปกครองท้องถิ่น',
                              'การจัดการ',
                              'สาธารณสุขชุมชน',
                            ];
                            if (list.length <= 1) {
                              alert('ต้องมีอย่างน้อย 1 สาขา');
                              return;
                            }
                            onUpdateFormConfig({
                              ...formConfig,
                              studentMajors: list.filter((m) => m !== maj),
                            });
                          }}
                          className="text-rose-500 hover:text-rose-700 ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const val = (e.currentTarget.elements.namedItem('newMaj') as HTMLInputElement).value.trim();
                      if (!val) return;
                      const list = formConfig.studentMajors || [
                        'เทคโนโลยีดิจิทัลธุรกิจ',
                        'การพัฒนาเด็กปฐมวัย',
                        'การปกครองท้องถิ่น',
                        'การจัดการ',
                        'สาธารณสุขชุมชน',
                      ];
                      onUpdateFormConfig({ ...formConfig, studentMajors: [...list, val] });
                      e.currentTarget.reset();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      name="newMaj"
                      type="text"
                      placeholder="เพิ่มสาขาวิชาใหม่"
                      className="flex-1 px-2.5 py-1 text-xs rounded border border-slate-300 bg-white"
                    />
                    <button type="submit" className="px-3 py-1 bg-[#0F4E7A] text-white rounded text-xs font-bold">
                      เพิ่ม
                    </button>
                  </form>
                </div>

                {/* 4. Learning Locations */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="font-bold text-xs text-slate-700 mb-2">สถานที่จัดการเรียนการสอน</p>
                  <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
                    {(formConfig.learningLocations || [
                      'อำเภอเทพา',
                      'อำเภอหาดใหญ่',
                      'อำเภอควนเนียง',
                      'อำเภอปากพะยูน จังหวัดพัทลุง',
                      'อำเภอเมืองพัทลุง จังหวัดพัทลุง',
                    ]).map((loc) => (
                      <div
                        key={loc}
                        className="flex items-center justify-between px-2.5 py-1 bg-white border border-slate-300 rounded text-xs"
                      >
                        <span className="truncate">{loc}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = formConfig.learningLocations || [
                              'อำเภอเทพา',
                              'อำเภอหาดใหญ่',
                              'อำเภอควนเนียง',
                              'อำเภอปากพะยูน จังหวัดพัทลุง',
                              'อำเภอเมืองพัทลุง จังหวัดพัทลุง',
                            ];
                            if (list.length <= 1) {
                              alert('ต้องมีอย่างน้อย 1 สถานที่');
                              return;
                            }
                            onUpdateFormConfig({
                              ...formConfig,
                              learningLocations: list.filter((l) => l !== loc),
                            });
                          }}
                          className="text-rose-500 hover:text-rose-700 ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const val = (e.currentTarget.elements.namedItem('newLoc') as HTMLInputElement).value.trim();
                      if (!val) return;
                      const list = formConfig.learningLocations || [
                        'อำเภอเทพา',
                        'อำเภอหาดใหญ่',
                        'อำเภอควนเนียง',
                        'อำเภอปากพะยูน จังหวัดพัทลุง',
                        'อำเภอเมืองพัทลุง จังหวัดพัทลุง',
                      ];
                      onUpdateFormConfig({ ...formConfig, learningLocations: [...list, val] });
                      e.currentTarget.reset();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      name="newLoc"
                      type="text"
                      placeholder="เพิ่มสถานที่จัดการเรียนการสอน"
                      className="flex-1 px-2.5 py-1 text-xs rounded border border-slate-300 bg-white"
                    />
                    <button type="submit" className="px-3 py-1 bg-[#0F4E7A] text-white rounded text-xs font-bold">
                      เพิ่ม
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Manage Shirt Images */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h4 className="font-bold text-[#0F4E7A] text-sm mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#EDBA48]" />
                <span>จัดการภาพแบบเสื้อวิ่ง (Shirt Designs)</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {formConfig.shirtImages.map((img) => (
                  <div key={img.id} className="border border-slate-200 rounded-xl p-2 bg-slate-50 relative group">
                    <div className="aspect-square bg-white rounded-lg overflow-hidden flex items-center justify-center p-2 mb-2">
                      <img src={img.url} alt={img.title} className="w-full h-full object-contain" />
                    </div>
                    <p className="text-[11px] font-semibold text-slate-700 truncate">{img.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setZoomModal({
                            isOpen: true,
                            imageUrl: img.url,
                            title: img.title,
                          })
                        }
                        className="text-[10px] text-[#0F4E7A] hover:underline"
                      >
                        ดูรูปขยาย
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (formConfig.shirtImages.length <= 1) {
                            alert('ต้องมีภาพแบบเสื้ออย่างน้อย 1 ภาพ');
                            return;
                          }
                          const updated = formConfig.shirtImages.filter((i) => i.id !== img.id);
                          onUpdateFormConfig({ ...formConfig, shirtImages: updated });
                        }}
                        className="text-rose-500 hover:text-rose-700 text-[10px]"
                      >
                        ลบภาพ
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload or Add Shirt Image: Method 1 and Method 2 */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="block text-xs font-bold text-[#0F4E7A]">เพิ่มรูปภาพแบบเสื้อวิ่ง (เลือกได้ 2 วิธี)</span>

                {/* Method 1: Upload File */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#0F4E7A]" />
                    <span>วิธีที่ 1: เลือกไฟล์รูปภาพจากเครื่อง</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const dataUrl = ev.target?.result as string;
                        const newImg: ShirtImage = {
                          id: 'shirt-' + Date.now(),
                          title: file.name.replace(/\.[^/.]+$/, ''),
                          url: dataUrl,
                        };
                        onUpdateFormConfig({
                          ...formConfig,
                          shirtImages: [...formConfig.shirtImages, newImg],
                        });
                      };
                      reader.readAsDataURL(file);
                      e.target.value = '';
                    }}
                    className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                  />
                </div>

                {/* Method 2: Image URL */}
                <form onSubmit={handleAddShirtImageFromUrl} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5 text-[#EDBA48]" />
                    <span>วิธีที่ 2: ระบุที่อยู่ลิงก์รูปภาพโลโก้ / แบบเสื้อ (Image URL)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-7">
                      <input
                        type="url"
                        value={shirtImageUrlInput}
                        onChange={(e) => setShirtImageUrlInput(e.target.value)}
                        placeholder="https://example.com/shirt-design.jpg"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={shirtImageTitleInput}
                        onChange={(e) => setShirtImageTitleInput(e.target.value)}
                        placeholder="ชื่อภาพ (เช่น ด้านหน้า)"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        className="w-full py-1.5 px-2.5 text-xs rounded-lg bg-[#0F4E7A] text-white font-semibold hover:bg-[#0c3e61] transition cursor-pointer"
                      >
                        + เพิ่มจาก URL
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Manage Size Chart Images */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h4 className="font-bold text-[#0F4E7A] text-sm mb-4 flex items-center gap-2">
                <Shirt className="w-4 h-4 text-[#EDBA48]" />
                <span>จัดการภาพตารางขนาดเสื้อ (Size Chart)</span>
              </h4>

              <div className="space-y-3 mb-4">
                {formConfig.sizeChartImages.map((chart) => (
                  <div key={chart.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between gap-3">
                    <div className="w-16 h-12 bg-white rounded border border-slate-200 overflow-hidden shrink-0">
                      <img src={chart.url} alt={chart.title} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{chart.title}</p>
                      <button
                        type="button"
                        onClick={() =>
                          setZoomModal({
                            isOpen: true,
                            imageUrl: chart.url,
                            title: chart.title,
                          })
                        }
                        className="text-[11px] text-[#0F4E7A] hover:underline"
                      >
                        คลิกเพื่อซูมดู
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (formConfig.sizeChartImages.length <= 1) {
                          alert('ต้องมีตารางขนาดเสื้ออย่างน้อย 1 ภาพ');
                          return;
                        }
                        const updated = formConfig.sizeChartImages.filter((c) => c.id !== chart.id);
                        onUpdateFormConfig({ ...formConfig, sizeChartImages: updated });
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Upload Size Chart Image: Method 1 and Method 2 */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="block text-xs font-bold text-[#0F4E7A]">เพิ่มภาพตารางขนาดเสื้อ (เลือกได้ 2 วิธี)</span>

                {/* Method 1: Upload File */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#0F4E7A]" />
                    <span>วิธีที่ 1: เลือกไฟล์รูปภาพจากเครื่อง</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const dataUrl = ev.target?.result as string;
                        const newChart: ShirtImage = {
                          id: 'chart-' + Date.now(),
                          title: 'ตารางขนาดเสื้อ (' + file.name + ')',
                          url: dataUrl,
                        };
                        onUpdateFormConfig({
                          ...formConfig,
                          sizeChartImages: [...formConfig.sizeChartImages, newChart],
                        });
                      };
                      reader.readAsDataURL(file);
                      e.target.value = '';
                    }}
                    className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                  />
                </div>

                {/* Method 2: Image URL */}
                <form onSubmit={handleAddSizeChartFromUrl} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5 text-[#EDBA48]" />
                    <span>วิธีที่ 2: ระบุที่อยู่ลิงก์รูปภาพตารางไซส์ (Image URL)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-7">
                      <input
                        type="url"
                        value={sizeChartUrlInput}
                        onChange={(e) => setSizeChartUrlInput(e.target.value)}
                        placeholder="https://example.com/size-chart.jpg"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={sizeChartTitleInput}
                        onChange={(e) => setSizeChartTitleInput(e.target.value)}
                        placeholder="ชื่อภาพ (เช่น ตารางไซส์ 2026)"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        className="w-full py-1.5 px-2.5 text-xs rounded-lg bg-[#0F4E7A] text-white font-semibold hover:bg-[#0c3e61] transition cursor-pointer"
                      >
                        + เพิ่มจาก URL
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ADMIN ACCOUNTS TAB */}
      {/* ========================================================================= */}
      {activeAdminTab === 'adminUsers' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-[#0F4E7A] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#EDBA48]" />
                  <span>จัดการบัญชีแอดมินและรหัสผ่าน</span>
                </h3>
                <p className="text-xs text-slate-500">
                  แอดมินสามารถเพิ่ม ลบ บัญชี และเปลี่ยนรหัสผ่านสำหรับเข้าสู่ระบบเจ้าหน้าที่
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewAdminModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F4E7A] text-white text-xs font-semibold hover:bg-[#0c3e61] transition"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#EDBA48]" />
                <span>เพิ่มแอดมินใหม่</span>
              </button>
            </div>

            {/* List of Admins */}
            <div className="divide-y divide-slate-100">
              {adminAccounts.map((admin) => (
                <div key={admin.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0F4E7A]/10 text-[#0F4E7A] flex items-center justify-center font-bold text-sm">
                      {admin.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                        <span>{admin.username}</span>
                        {admin.username === currentAdmin.username && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                            คุณกำลังใช้งาน
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">
                        รหัสผ่าน: •••••••• (คลิกเปลี่ยนรหัสเพื่อดูหรือแก้)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setChangingPasswordAdmin(admin);
                        setNewPasswordVal(admin.password);
                      }}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition"
                    >
                      <Key className="w-3 h-3 text-[#EDBA48]" />
                      <span>เปลี่ยนรหัสผ่าน</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAdminAccount(admin.id, admin.username)}
                      disabled={adminAccounts.length <= 1}
                      title={adminAccounts.length <= 1 ? 'ต้องมีอย่างน้อย 1 บัญชี' : 'ลบบัญชี'}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. GOOGLE SHEETS & APPS SCRIPT SYNC TAB */}
      {/* ========================================================================= */}
      {activeAdminTab === 'googleSync' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0F4E7A]">
                    เชื่อมต่อฐานข้อมูล Google Sheets ผ่าน Google Apps Script
                  </h3>
                  <p className="text-xs text-slate-500">
                    บันทึกข้อมูลและอัปโหลดไฟล์ภาพสลิปลง Google Drive อัตโนมัติ
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadAppsScriptFile('Code.gs', APPS_SCRIPT_CODE_GS)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition shadow-xs"
                  title="ดาวน์โหลดไฟล์สคริปต์ Code.gs"
                >
                  <Download className="w-3.5 h-3.5 text-[#0F4E7A]" />
                  <span>ดาวน์โหลด Code.gs</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadAppsScriptFile('index.html', APPS_SCRIPT_INDEX_HTML)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition shadow-xs"
                  title="ดาวน์โหลดไฟล์เว็บ index.html"
                >
                  <Download className="w-3.5 h-3.5 text-[#0F4E7A]" />
                  <span>ดาวน์โหลด index.html</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAppsScriptModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-[#0F4E7A] text-white font-semibold hover:bg-[#0c3e61] transition shadow-xs"
                >
                  <FileCode className="w-3.5 h-3.5 text-[#EDBA48]" />
                  <span>เปิดดูโค้ด &amp; วิธีติดตั้ง</span>
                </button>
              </div>
            </div>

            {/* Input URL & Test Button */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  URL Google Apps Script Web App (ขึ้นต้นด้วย https://script.google.com/macros/s/...)
                </label>
                <input
                  type="url"
                  value={testUrlInput}
                  onChange={(e) => setTestUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Connection Status Button */}
                <button
                  id="btn-check-apps-script-connection"
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection || !testUrlInput.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#0F4E7A] hover:bg-[#0c3e61] disabled:opacity-50 transition shadow-xs cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isTestingConnection ? 'animate-spin' : ''}`} />
                  <span>
                    {isTestingConnection
                      ? 'กำลังตรวจสอบการเชื่อมต่อ...'
                      : 'เช็คสถานะเชื่อมต่อฐานข้อมูล Google Sheets ผ่าน Google Apps Script'}
                  </span>
                </button>

                {connectionTestResult && (
                  <div
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold ${
                      connectionTestResult.success
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {connectionTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>{connectionTestResult.message}</span>
                  </div>
                )}
              </div>

              {/* Direct Link to Google Sheets & 2-Way Sync Actions */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-[#EDBA48]" />
                      <span>ลิงก์ไปยัง Google Sheets ของระบบ</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      เข้าถึงชีต Registrations_2026 (ตารางผู้สมัคร) และ Config_2026 (ตารางตัวเลือก) ได้โดยตรง
                    </p>
                  </div>

                  {(spreadsheetUrlInput || appsScriptConfig.spreadsheetUrl) && (
                    <a
                      href={spreadsheetUrlInput || appsScriptConfig.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>เปิดดู Google Sheets ในแท็บใหม่</span>
                    </a>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={spreadsheetUrlInput}
                    onChange={(e) => {
                      setSpreadsheetUrlInput(e.target.value);
                      onUpdateAppsScriptConfig({
                        ...appsScriptConfig,
                        spreadsheetUrl: e.target.value.trim(),
                      });
                    }}
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20"
                  />
                  {spreadsheetUrlInput && (
                    <a
                      href={spreadsheetUrlInput}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-[#0F4E7A] text-white text-xs font-semibold hover:bg-[#0c3e61] flex items-center gap-1.5 transition shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#EDBA48]" />
                      <span>เปิดลิงก์</span>
                    </a>
                  )}
                </div>

                {/* 2-Way Sync Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handlePullFromSheets}
                    disabled={isSyncingSheets || !testUrlInput.trim()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition disabled:opacity-50 shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#0F4E7A] ${isSyncingSheets ? 'animate-spin' : ''}`} />
                    <span>ดึงตัวเลือกและข้อมูลผู้สมัครจาก Google Sheets</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePushConfigToSheets}
                    disabled={isSyncingSheets || !testUrlInput.trim()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F4E7A] text-white hover:bg-[#0c3e61] text-xs font-semibold transition disabled:opacity-50 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5 text-[#EDBA48]" />
                    <span>บันทึกตัวเลือกฟอร์มทั้งหมดขึ้น Google Sheets ตอนนี้</span>
                  </button>

                  {syncStatusNotice && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300 animate-in fade-in">
                      {syncStatusNotice}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Architecture Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <span className="font-bold text-[#0F4E7A] block mb-1">1. ตาราง Google Sheets</span>
                <p className="text-slate-500 leading-relaxed">
                  ตาราง Registrations_2026 จะบันทึกข้อมูลทุกคอลัมน์ ทั้งชื่อ เบอร์ ประเภท ไซส์เสื้อ ที่อยู่ และสถานะ
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <span className="font-bold text-[#0F4E7A] block mb-1">2. Google Drive สลิป</span>
                <p className="text-slate-500 leading-relaxed">
                  ระบบสร้างโฟลเดอร์ <strong>SKCC_FunRun_2026_Slips</strong> บันทึกไฟล์ภาพสลิป และใส่ลิงก์ URL ลงใน Sheet ให้คลิกดูได้ทันที
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <span className="font-bold text-[#0F4E7A] block mb-1">3. ปลอดภัย &amp; ยั่งยืน</span>
                <p className="text-slate-500 leading-relaxed">
                  ระบบทำงานบนสิทธิ์ของเจ้าของสคริปต์ ผู้สมัครทั่วไปไม่ต้องใช้บัญชี Google ก็สามารถส่งข้อมูลการสมัครได้
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT REGISTRATION */}
      {/* ========================================================================= */}
      {editingRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-[#0F4E7A] flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#EDBA48]" />
                  <span>แก้ไขข้อมูลผู้สมัคร ({editingRegistration.id})</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  แก้ไขข้อมูลได้ทุกช่อง ทั้งข้อมูลส่วนตัว ข้อมูลการเรียน การจัดส่ง สลิป และสถานะ
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRegistration(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedRegistration} className="space-y-5 text-xs sm:text-sm">
              {/* SECTION 1: Personal Info */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0F4E7A] flex items-center gap-1.5 border-b pb-1">
                  <User className="w-3.5 h-3.5" />
                  <span>1. ข้อมูลส่วนตัวผู้สมัคร</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">คำนำหน้า</label>
                    <select
                      value={editingRegistration.prefix}
                      onChange={(e) =>
                        setEditingRegistration({ ...editingRegistration, prefix: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      {formConfig.prefixes.map((p) => (
                        <option key={p.id} value={p.label}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block font-semibold text-slate-700 mb-1">ชื่อ-สกุล</label>
                    <input
                      type="text"
                      value={editingRegistration.fullName}
                      onChange={(e) =>
                        setEditingRegistration({ ...editingRegistration, fullName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block font-semibold text-slate-700 mb-1">เบอร์ติดต่อ (10 หลัก)</label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={editingRegistration.phone}
                      onChange={(e) =>
                        setEditingRegistration({
                          ...editingRegistration,
                          phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Type & Academic Info */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0F4E7A] flex items-center gap-1.5 border-b pb-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>2. ประเภทผู้สมัคร &amp; ข้อมูลการศึกษา</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label className="block font-semibold text-slate-700 mb-1">ประเภทผู้สมัคร</label>
                    <select
                      value={editingRegistration.applicantType}
                      onChange={(e) => {
                        const typeObj = formConfig.applicantTypes.find((t) => t.name === e.target.value);
                        const p = typeObj ? typeObj.price : editingRegistration.applicantPrice;
                        setEditingRegistration({
                          ...editingRegistration,
                          applicantType: e.target.value,
                          applicantPrice: p,
                          totalAmount: p + editingRegistration.deliveryFee,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                    >
                      {formConfig.applicantTypes.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name} ({t.price} บาท)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">ค่าสมัคร (บาท)</label>
                    <input
                      type="number"
                      value={editingRegistration.applicantPrice}
                      onChange={(e) => {
                        const p = Number(e.target.value);
                        setEditingRegistration({
                          ...editingRegistration,
                          applicantPrice: p,
                          totalAmount: p + editingRegistration.deliveryFee,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">ขนาดเสื้อวิ่ง</label>
                    <select
                      value={editingRegistration.shirtSize}
                      onChange={(e) =>
                        setEditingRegistration({ ...editingRegistration, shirtSize: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                    >
                      {formConfig.shirtSizes.map((s) => (
                        <option key={s.id} value={s.label}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Student Specific Fields */}
                  <div className="sm:col-span-12 p-3 bg-amber-50/70 border border-[#EDBA48]/40 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสชั้นปี</label>
                      <input
                        type="text"
                        value={editingRegistration.studentYear || ''}
                        onChange={(e) =>
                          setEditingRegistration({ ...editingRegistration, studentYear: e.target.value })
                        }
                        placeholder="เช่น 67"
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ห้อง</label>
                      <input
                        type="text"
                        value={editingRegistration.studentRoom || ''}
                        onChange={(e) =>
                          setEditingRegistration({ ...editingRegistration, studentRoom: e.target.value })
                        }
                        placeholder="เช่น 1"
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">สาขาวิชา</label>
                      <input
                        type="text"
                        value={editingRegistration.studentMajor || ''}
                        onChange={(e) =>
                          setEditingRegistration({ ...editingRegistration, studentMajor: e.target.value })
                        }
                        placeholder="เช่น เทคโนโลยีดิจิทัลธุรกิจ"
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">สถานที่เรียน / สอน</label>
                      <input
                        type="text"
                        value={editingRegistration.learningLocation || ''}
                        onChange={(e) =>
                          setEditingRegistration({ ...editingRegistration, learningLocation: e.target.value })
                        }
                        placeholder="เช่น อำเภอหาดใหญ่"
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Delivery & Full Address */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0F4E7A] flex items-center gap-1.5 border-b pb-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>3. ข้อมูลการจัดส่ง &amp; ที่อยู่</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-8">
                    <label className="block font-semibold text-slate-700 mb-1">รูปแบบการจัดส่ง</label>
                    <select
                      value={editingRegistration.deliveryType}
                      onChange={(e) => {
                        const dType = e.target.value as DeliveryType;
                        const fee = dType === 'postal' ? (formConfig.deliveryFee ?? 50) : 0;
                        setEditingRegistration({
                          ...editingRegistration,
                          deliveryType: dType,
                          deliveryFee: fee,
                          totalAmount: editingRegistration.applicantPrice + fee,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="pickup">รับด้วยตัวเอง ณ วชช.สงขลา</option>
                      <option value="postal">จัดส่งทางไปรษณีย์ (+{formConfig.deliveryFee ?? 50} บาท)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block font-semibold text-slate-700 mb-1">ค่าจัดส่ง (บาท)</label>
                    <input
                      type="number"
                      value={editingRegistration.deliveryFee}
                      onChange={(e) => {
                        const fee = Number(e.target.value);
                        setEditingRegistration({
                          ...editingRegistration,
                          deliveryFee: fee,
                          totalAmount: editingRegistration.applicantPrice + fee,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>

                  {/* Address Breakdown Fields */}
                  <div className="sm:col-span-12 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0F4E7A]" />
                      <span>ที่อยู่จัดส่งโดยละเอียด</span>
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 text-xs">
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">บ้านเลขที่</label>
                        <input
                          type="text"
                          value={editingRegistration.address?.houseNo || ''}
                          onChange={(e) =>
                            setEditingRegistration({
                              ...editingRegistration,
                              address: {
                                ...(editingRegistration.address || {
                                  houseNo: '',
                                  soi: '',
                                  road: '',
                                  moo: '',
                                  village: '',
                                  subdistrict: '',
                                  district: '',
                                  province: '',
                                  postalCode: '',
                                  note: '',
                                }),
                                houseNo: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">หมู่ที่</label>
                        <input
                          type="text"
                          value={editingRegistration.address?.moo || ''}
                          onChange={(e) =>
                            setEditingRegistration({
                              ...editingRegistration,
                              address: {
                                ...(editingRegistration.address || {
                                  houseNo: '',
                                  soi: '',
                                  road: '',
                                  moo: '',
                                  village: '',
                                  subdistrict: '',
                                  district: '',
                                  province: '',
                                  postalCode: '',
                                  note: '',
                                }),
                                moo: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">หมู่บ้าน / อาคาร</label>
                        <input
                          type="text"
                          value={editingRegistration.address?.village || ''}
                          onChange={(e) =>
                            setEditingRegistration({
                              ...editingRegistration,
                              address: {
                                ...(editingRegistration.address || {
                                  houseNo: '',
                                  soi: '',
                                  road: '',
                                  moo: '',
                                  village: '',
                                  subdistrict: '',
                                  district: '',
                                  province: '',
                                  postalCode: '',
                                  note: '',
                                }),
                                village: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">ซอย</label>
                        <input
                          type="text"
                          value={editingRegistration.address?.soi || ''}
                          onChange={(e) =>
                            setEditingRegistration({
                              ...editingRegistration,
                              address: {
                                ...(editingRegistration.address || {
                                  houseNo: '',
                                  soi: '',
                                  road: '',
                                  moo: '',
                                  village: '',
                                  subdistrict: '',
                                  district: '',
                                  province: '',
                                  postalCode: '',
                                  note: '',
                                }),
                                soi: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">ถนน</label>
                        <input
                          type="text"
                          value={editingRegistration.address?.road || ''}
                          onChange={(e) =>
                            setEditingRegistration({
                              ...editingRegistration,
                              address: {
                                ...(editingRegistration.address || {
                                  houseNo: '',
                                  soi: '',
                                  road: '',
                                  moo: '',
                                  village: '',
                                  subdistrict: '',
                                  district: '',
                                  province: '',
                                  postalCode: '',
                                  note: '',
                                }),
                                road: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">ตำบล / แขวง</label>
                        <input
                          type="text"
                          value={editingRegistration.address?.subdistrict || ''}
                          onChange={(e) =>
                            setEditingRegistration({
                              ...editingRegistration,
                              address: {
                                ...(editingRegistration.address || {
                                  houseNo: '',
                                  soi: '',
                                  road: '',
                                  moo: '',
                                  village: '',
                                  subdistrict: '',
                                  district: '',
                                  province: '',
                                  postalCode: '',
                                  note: '',
                                }),
                                subdistrict: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">อำเภอ / เขต</label>
                        <input
                          type="text"
                          value={editingRegistration.address?.district || ''}
                          onChange={(e) =>
                            setEditingRegistration({
                              ...editingRegistration,
                              address: {
                                ...(editingRegistration.address || {
                                  houseNo: '',
                                  soi: '',
                                  road: '',
                                  moo: '',
                                  village: '',
                                  subdistrict: '',
                                  district: '',
                                  province: '',
                                  postalCode: '',
                                  note: '',
                                }),
                                district: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">จังหวัด</label>
                        <input
                          type="text"
                          value={editingRegistration.address?.province || ''}
                          onChange={(e) =>
                            setEditingRegistration({
                              ...editingRegistration,
                              address: {
                                ...(editingRegistration.address || {
                                  houseNo: '',
                                  soi: '',
                                  road: '',
                                  moo: '',
                                  village: '',
                                  subdistrict: '',
                                  district: '',
                                  province: '',
                                  postalCode: '',
                                  note: '',
                                }),
                                province: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">รหัสไปรษณีย์</label>
                        <input
                          type="text"
                          value={editingRegistration.address?.postalCode || ''}
                          onChange={(e) =>
                            setEditingRegistration({
                              ...editingRegistration,
                              address: {
                                ...(editingRegistration.address || {
                                  houseNo: '',
                                  soi: '',
                                  road: '',
                                  moo: '',
                                  village: '',
                                  subdistrict: '',
                                  district: '',
                                  province: '',
                                  postalCode: '',
                                  note: '',
                                }),
                                postalCode: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-mono"
                        />
                      </div>
                      <div className="sm:col-span-12">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">หมายเหตุที่อยู่</label>
                        <input
                          type="text"
                          value={editingRegistration.address?.note || ''}
                          onChange={(e) =>
                            setEditingRegistration({
                              ...editingRegistration,
                              address: {
                                ...(editingRegistration.address || {
                                  houseNo: '',
                                  soi: '',
                                  road: '',
                                  moo: '',
                                  village: '',
                                  subdistrict: '',
                                  district: '',
                                  province: '',
                                  postalCode: '',
                                  note: '',
                                }),
                                note: e.target.value,
                              },
                            })
                          }
                          placeholder="เช่น ฝากไว้ป้อมยาม, โทรแจ้งก่อนส่ง"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Payment Slip & Drive File */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0F4E7A] flex items-center gap-1.5 border-b pb-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>4. สลิปการชำระเงิน &amp; ยอดเงิน</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  <div className="sm:col-span-4">
                    <label className="block font-semibold text-slate-700 mb-1">ภาพหลักฐานการโอน</label>
                    <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 flex flex-col items-center">
                      {editingRegistration.slipImage ? (
                        <div className="relative group w-full aspect-3/4 max-h-36 bg-white rounded-lg overflow-hidden flex items-center justify-center border border-slate-200">
                          <img
                            src={editingRegistration.slipImage}
                            alt="Payment Slip"
                            className="w-full h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setZoomModal({
                                isOpen: true,
                                imageUrl: editingRegistration.slipImage || '',
                                title: `หลักฐานการโอน (${editingRegistration.fullName})`,
                              })
                            }
                            className="absolute inset-0 bg-slate-900/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-xs font-semibold gap-1"
                          >
                            <ZoomIn className="w-4 h-4" /> ดูภาพขยาย
                          </button>
                        </div>
                      ) : (
                        <div className="w-full aspect-3/4 max-h-36 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs text-center p-2">
                          ไม่มีภาพสลิป
                        </div>
                      )}

                      <div className="w-full mt-2 space-y-1">
                        <label className="block text-[10px] text-center font-semibold text-[#0F4E7A] bg-white border border-slate-300 hover:bg-slate-50 py-1 px-2 rounded cursor-pointer transition">
                          <Upload className="w-3 h-3 inline mr-1" /> เปลี่ยนรูปสลิปใหม่
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const dataUrl = ev.target?.result as string;
                                if (dataUrl) {
                                  setEditingRegistration({
                                    ...editingRegistration,
                                    slipImage: dataUrl,
                                  });
                                }
                              };
                              reader.readAsDataURL(f);
                            }}
                          />
                        </label>
                        {editingRegistration.slipImage && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingRegistration({
                                ...editingRegistration,
                                slipImage: '',
                              })
                            }
                            className="w-full text-[10px] text-rose-500 hover:underline text-center"
                          >
                            ลบรูปสลิปออก
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-8 space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">ลิงก์ Google Drive สลิป</label>
                      <input
                        type="url"
                        value={editingRegistration.driveFileUrl || ''}
                        onChange={(e) =>
                          setEditingRegistration({
                            ...editingRegistration,
                            driveFileUrl: e.target.value,
                          })
                        }
                        placeholder="https://drive.google.com/..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">ยอดชำระสุทธิ (บาท)</label>
                        <input
                          type="number"
                          value={editingRegistration.totalAmount}
                          onChange={(e) =>
                            setEditingRegistration({
                              ...editingRegistration,
                              totalAmount: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold font-mono text-[#0F4E7A]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">สถานะการตรวจสอบ</label>
                        <select
                          value={editingRegistration.status}
                          onChange={(e) =>
                            setEditingRegistration({
                              ...editingRegistration,
                              status: e.target.value as VerificationStatus,
                            })
                          }
                          className={`w-full px-3 py-2 rounded-lg border font-bold ${
                            editingRegistration.status === 'ตรวจสอบแล้ว'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                              : 'border-amber-300 bg-amber-50 text-amber-800'
                          }`}
                        >
                          <option value="ยังไม่ตรวจสอบ">ยังไม่ตรวจสอบ</option>
                          <option value="ตรวจสอบแล้ว">ตรวจสอบแล้ว</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">หมายเหตุเจ้าหน้าที่ / แอดมิน</label>
                      <textarea
                        rows={2}
                        value={editingRegistration.notes || ''}
                        onChange={(e) =>
                          setEditingRegistration({
                            ...editingRegistration,
                            notes: e.target.value,
                          })
                        }
                        placeholder="บันทึกช่วยจำสำหรับเจ้าหน้าที่ เช่น โทรยืนยันแล้ว, รับเสื้อแทนได้"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRegistration(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#0F4E7A] text-white hover:bg-[#0c3e61] font-bold shadow-xs flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-[#EDBA48]" />
                  <span>บันทึกการแก้ไขข้อมูลทั้งหมด</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW REGISTRATION (MANUAL) */}
      {/* ========================================================================= */}
      {isNewRegistrationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 my-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-[#0F4E7A] flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#EDBA48]" />
                  <span>เพิ่มข้อมูลผู้สมัครใหม่ (Add New Runner)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  กรอกข้อมูลผู้สมัครได้ทุกช่อง ข้อมูลจะถูกบันทึกลงระบบและส่งขึ้น Google Sheets ทันที
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewRegistrationModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewRegistrationSubmit} className="space-y-5 text-xs sm:text-sm">
              {/* SECTION 1: Personal Info */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0F4E7A] flex items-center gap-1.5 border-b pb-1">
                  <User className="w-3.5 h-3.5" />
                  <span>1. ข้อมูลส่วนตัวผู้สมัคร</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">คำนำหน้า</label>
                    <select
                      value={newRegistrationForm.prefix}
                      onChange={(e) =>
                        setNewRegistrationForm({ ...newRegistrationForm, prefix: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      {formConfig.prefixes.map((p) => (
                        <option key={p.id} value={p.label}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block font-semibold text-slate-700 mb-1">ชื่อ-สกุล *</label>
                    <input
                      type="text"
                      required
                      value={newRegistrationForm.fullName}
                      onChange={(e) =>
                        setNewRegistrationForm({ ...newRegistrationForm, fullName: e.target.value })
                      }
                      placeholder="เช่น สมชาย ใจดี"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block font-semibold text-slate-700 mb-1">เบอร์ติดต่อ *</label>
                    <input
                      type="tel"
                      required
                      value={newRegistrationForm.phone}
                      onChange={(e) =>
                        setNewRegistrationForm({ ...newRegistrationForm, phone: e.target.value })
                      }
                      placeholder="0812345678"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Applicant Type & Student Info */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0F4E7A] flex items-center gap-1.5 border-b pb-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>2. ประเภทผู้สมัคร &amp; ข้อมูลนักศึกษา</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-8">
                    <label className="block font-semibold text-slate-700 mb-1">ประเภทผู้สมัคร</label>
                    <select
                      value={newRegistrationForm.applicantType}
                      onChange={(e) => {
                        const chosen = formConfig.applicantTypes.find((t) => t.name === e.target.value);
                        const price = chosen ? chosen.price : 350;
                        const fee = newRegistrationForm.deliveryType === 'postal' ? formConfig.deliveryFee : 0;
                        setNewRegistrationForm({
                          ...newRegistrationForm,
                          applicantType: e.target.value,
                          applicantPrice: price,
                          totalAmount: price + fee,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      {formConfig.applicantTypes.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name} ({t.price} บาท)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block font-semibold text-slate-700 mb-1">ราคาค่าสมัคร (บาท)</label>
                    <input
                      type="number"
                      value={newRegistrationForm.applicantPrice}
                      onChange={(e) => {
                        const pr = Number(e.target.value) || 0;
                        const fee = newRegistrationForm.deliveryType === 'postal' ? formConfig.deliveryFee : 0;
                        setNewRegistrationForm({
                          ...newRegistrationForm,
                          applicantPrice: pr,
                          totalAmount: pr + fee,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                {/* Student specific fields */}
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                  <span className="block text-xs font-semibold text-blue-900">
                    ข้อมูลนักศึกษา (กรณีเป็นนักศึกษา วชช.สงขลา)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">รหัสปี (ชั้นปี)</label>
                      <input
                        type="text"
                        value={newRegistrationForm.studentYear || ''}
                        onChange={(e) =>
                          setNewRegistrationForm({
                            ...newRegistrationForm,
                            studentYear: e.target.value,
                          })
                        }
                        placeholder="เช่น 67"
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">ห้อง</label>
                      <input
                        type="text"
                        value={newRegistrationForm.studentRoom || ''}
                        onChange={(e) =>
                          setNewRegistrationForm({
                            ...newRegistrationForm,
                            studentRoom: e.target.value,
                          })
                        }
                        placeholder="เช่น 1, 2"
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">สาขาวิชา</label>
                      <input
                        type="text"
                        value={newRegistrationForm.studentMajor || ''}
                        onChange={(e) =>
                          setNewRegistrationForm({
                            ...newRegistrationForm,
                            studentMajor: e.target.value,
                          })
                        }
                        placeholder="เช่น การจัดการ"
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">สถานที่จัดการศึกษา</label>
                      <input
                        type="text"
                        value={newRegistrationForm.learningLocation || ''}
                        onChange={(e) =>
                          setNewRegistrationForm({
                            ...newRegistrationForm,
                            learningLocation: e.target.value,
                          })
                        }
                        placeholder="เช่น วชช.สงขลา"
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Shirt Size & Delivery */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0F4E7A] flex items-center gap-1.5 border-b pb-1">
                  <Shirt className="w-3.5 h-3.5" />
                  <span>3. ไซส์เสื้อ &amp; รูปแบบการจัดส่ง</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label className="block font-semibold text-slate-700 mb-1">ขนาดเสื้อวิ่ง</label>
                    <select
                      value={newRegistrationForm.shirtSize}
                      onChange={(e) =>
                        setNewRegistrationForm({ ...newRegistrationForm, shirtSize: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      {formConfig.shirtSizes.map((s) => (
                        <option key={s.id} value={s.label}>
                          {s.label} ({s.chest} นิ้ว / {s.length} นิ้ว)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block font-semibold text-slate-700 mb-1">รูปแบบการจัดส่ง</label>
                    <select
                      value={newRegistrationForm.deliveryType}
                      onChange={(e) => {
                        const dType = e.target.value as DeliveryType;
                        const fee = dType === 'postal' ? formConfig.deliveryFee : 0;
                        setNewRegistrationForm({
                          ...newRegistrationForm,
                          deliveryType: dType,
                          deliveryFee: fee,
                          totalAmount: newRegistrationForm.applicantPrice + fee,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="pickup">รับด้วยตัวเอง ณ วิทยาลัยชุมชนสงขลา (ฟรี)</option>
                      <option value="postal">จัดส่งทางไปรษณีย์ (+{formConfig.deliveryFee} บาท)</option>
                    </select>
                  </div>
                </div>

                {/* Postal Address Fields */}
                {newRegistrationForm.deliveryType === 'postal' && (
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                    <span className="block text-xs font-semibold text-amber-900">
                      ที่อยู่จัดส่งพัสดุไปรษณีย์
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 text-xs">
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">บ้านเลขที่</label>
                        <input
                          type="text"
                          value={newRegistrationForm.address?.houseNo || ''}
                          onChange={(e) =>
                            setNewRegistrationForm({
                              ...newRegistrationForm,
                              address: {
                                ...(newRegistrationForm.address || {
                                  houseNo: '',
                                  soi: '',
                                  road: '',
                                  moo: '',
                                  village: '',
                                  subdistrict: '',
                                  district: '',
                                  province: 'สงขลา',
                                  postalCode: '',
                                  note: '',
                                }),
                                houseNo: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">หมู่ที่</label>
                        <input
                          type="text"
                          value={newRegistrationForm.address?.moo || ''}
                          onChange={(e) =>
                            setNewRegistrationForm({
                              ...newRegistrationForm,
                              address: {
                                ...(newRegistrationForm.address || {
                                  houseNo: '',
                                  soi: '',
                                  road: '',
                                  moo: '',
                                  village: '',
                                  subdistrict: '',
                                  district: '',
                                  province: 'สงขลา',
                                  postalCode: '',
                                  note: '',
                                }),
                                moo: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">ตำบล / แขวง</label>
                        <input
                          type="text"
                          value={newRegistrationForm.address?.subdistrict || ''}
                          onChange={(e) =>
                            setNewRegistrationForm({
                              ...newRegistrationForm,
                              address: {
                                ...(newRegistrationForm.address || {
                                  houseNo: '',
                                  soi: '',
                                  road: '',
                                  moo: '',
                                  village: '',
                                  subdistrict: '',
                                  district: '',
                                  province: 'สงขลา',
                                  postalCode: '',
                                  note: '',
                                }),
                                subdistrict: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">อำเภอ / เขต</label>
                        <input
                          type="text"
                          value={newRegistrationForm.address?.district || ''}
                          onChange={(e) =>
                            setNewRegistrationForm({
                              ...newRegistrationForm,
                              address: {
                                ...(newRegistrationForm.address || {
                                  houseNo: '',
                                  soi: '',
                                  road: '',
                                  moo: '',
                                  village: '',
                                  subdistrict: '',
                                  district: '',
                                  province: 'สงขลา',
                                  postalCode: '',
                                  note: '',
                                }),
                                district: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">จังหวัด</label>
                        <input
                          type="text"
                          value={newRegistrationForm.address?.province || 'สงขลา'}
                          onChange={(e) =>
                            setNewRegistrationForm({
                              ...newRegistrationForm,
                              address: {
                                ...(newRegistrationForm.address || {
                                  houseNo: '',
                                  soi: '',
                                  road: '',
                                  moo: '',
                                  village: '',
                                  subdistrict: '',
                                  district: '',
                                  province: 'สงขลา',
                                  postalCode: '',
                                  note: '',
                                }),
                                province: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">รหัสไปรษณีย์</label>
                        <input
                          type="text"
                          value={newRegistrationForm.address?.postalCode || ''}
                          onChange={(e) =>
                            setNewRegistrationForm({
                              ...newRegistrationForm,
                              address: {
                                ...(newRegistrationForm.address || {
                                  houseNo: '',
                                  soi: '',
                                  road: '',
                                  moo: '',
                                  village: '',
                                  subdistrict: '',
                                  district: '',
                                  province: 'สงขลา',
                                  postalCode: '',
                                  note: '',
                                }),
                                postalCode: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 4: Payment & Status */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0F4E7A] flex items-center gap-1.5 border-b pb-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>4. สลิปการโอนเงิน &amp; สถานะการตรวจสอบ</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                  <div className="sm:col-span-4 space-y-2">
                    <label className="block font-semibold text-slate-700">ภาพสลิปโอนเงิน</label>
                    <div className="p-3 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center">
                      {newRegistrationForm.slipImage ? (
                        <div className="w-24 h-32 rounded border border-slate-200 overflow-hidden mb-2">
                          <img
                            src={newRegistrationForm.slipImage}
                            alt="Slip"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="py-4 text-slate-400">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                          <span className="text-[11px]">ไม่มีภาพสลิป</span>
                        </div>
                      )}
                      <label className="w-full py-1.5 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer text-center">
                        <span>เลือกรูปภาพ</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const dataUrl = ev.target?.result as string;
                              if (dataUrl) {
                                setNewRegistrationForm({
                                  ...newRegistrationForm,
                                  slipImage: dataUrl,
                                });
                              }
                            };
                            reader.readAsDataURL(f);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="sm:col-span-8 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">ยอดชำระสุทธิ (บาท)</label>
                        <input
                          type="number"
                          value={newRegistrationForm.totalAmount}
                          onChange={(e) =>
                            setNewRegistrationForm({
                              ...newRegistrationForm,
                              totalAmount: Number(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-[#0F4E7A]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">สถานะการตรวจสอบ</label>
                        <select
                          value={newRegistrationForm.status || 'ยังไม่ตรวจสอบ'}
                          onChange={(e) =>
                            setNewRegistrationForm({
                              ...newRegistrationForm,
                              status: e.target.value as VerificationStatus,
                            })
                          }
                          className={`w-full px-3 py-2 rounded-lg border font-bold ${
                            newRegistrationForm.status === 'ตรวจสอบแล้ว'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                              : 'border-amber-300 bg-amber-50 text-amber-800'
                          }`}
                        >
                          <option value="ยังไม่ตรวจสอบ">ยังไม่ตรวจสอบ</option>
                          <option value="ตรวจสอบแล้ว">ตรวจสอบแล้ว</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">หมายเหตุเจ้าหน้าที่ / แอดมิน</label>
                      <textarea
                        rows={2}
                        value={newRegistrationForm.notes || ''}
                        onChange={(e) =>
                          setNewRegistrationForm({
                            ...newRegistrationForm,
                            notes: e.target.value,
                          })
                        }
                        placeholder="บันทึกช่วยจำสำหรับเจ้าหน้าที่"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewRegistrationModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#0F4E7A] text-white hover:bg-[#0c3e61] font-bold shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#EDBA48]" />
                  <span>เพิ่มผู้สมัครและบันทึกลง Google Sheets</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW ADMIN ACCOUNT */}
      {/* ========================================================================= */}
      {isNewAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-[#0F4E7A] mb-1">เพิ่มบัญชีเจ้าหน้าที่แอดมินใหม่</h3>
            <p className="text-xs text-slate-500 mb-4">กำหนดชื่อผู้ใช้และรหัสผ่านสำหรับเจ้าหน้าที่</p>

            <form onSubmit={handleCreateAdminAccount} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่อผู้ใช้งาน (Username)</label>
                <input
                  type="text"
                  required
                  value={newAdminUsername}
                  onChange={(e) => setNewAdminUsername(e.target.value)}
                  placeholder="เช่น Admin#27 หรือ Officer01"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">รหัสผ่าน (Password)</label>
                <input
                  type="text"
                  required
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="เช่น #9592 หรือ Password"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewAdminModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0F4E7A] text-white hover:bg-[#0c3e61] font-semibold"
                >
                  บันทึกบัญชีใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CHANGE ADMIN PASSWORD */}
      {/* ========================================================================= */}
      {changingPasswordAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-[#0F4E7A] mb-1">
              เปลี่ยนรหัสผ่าน ({changingPasswordAdmin.username})
            </h3>
            <p className="text-xs text-slate-500 mb-4">ระบุรหัสผ่านใหม่สำหรับเข้าสู่ระบบ</p>

            <form onSubmit={handleSaveNewPassword} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">รหัสผ่านใหม่</label>
                <input
                  type="text"
                  required
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setChangingPasswordAdmin(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0F4E7A] text-white hover:bg-[#0c3e61] font-semibold"
                >
                  อัปเดตรหัสผ่าน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIGHTBOX MODALS */}
      {/* ========================================================================= */}
      <ImageZoomModal
        isOpen={zoomModal.isOpen}
        imageUrl={zoomModal.imageUrl}
        title={zoomModal.title}
        caption={zoomModal.caption}
        onClose={() => setZoomModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <AppsScriptModal
        isOpen={isAppsScriptModalOpen}
        onClose={() => setIsAppsScriptModalOpen(false)}
      />
    </div>
  );
};
