import { AdminAccount, AppsScriptConfig, FormConfig, Registration } from '../types';
import { defaultAdminAccounts, defaultFormConfig, initialRegistrations } from '../data/initialData';

const STORAGE_KEYS = {
  REGISTRATIONS: 'skcc_run_2026_registrations',
  FORM_CONFIG: 'skcc_run_2026_form_config',
  ADMIN_ACCOUNTS: 'skcc_run_2026_admin_accounts',
  APPS_SCRIPT_CONFIG: 'skcc_run_2026_apps_script_config',
  CURRENT_ADMIN: 'skcc_run_2026_current_admin',
};

export const getStoredRegistrations = (): Registration[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(initialRegistrations));
      return initialRegistrations;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse registrations', e);
    return initialRegistrations;
  }
};

export const saveRegistrations = (list: Registration[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save registrations', e);
  }
};

export const getStoredFormConfig = (): FormConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FORM_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FORM_CONFIG, JSON.stringify(defaultFormConfig));
      return defaultFormConfig;
    }
    const parsed = JSON.parse(raw);
    
    // Ensure new event texts and student/lecturer types are seamlessly included
    const existingTypes: any[] = parsed.applicantTypes || [];
    const hasStudent = existingTypes.some((t) => t.name && t.name.includes('นักศึกษา'));
    const hasLecturer = existingTypes.some((t) => t.name && t.name.includes('อาจารย์พิเศษ'));
    
    let mergedTypes = [...existingTypes];
    if (!hasStudent) {
      mergedTypes.unshift({ id: 'type-student', name: 'นักศึกษา', price: 280 });
    }
    if (!hasLecturer) {
      mergedTypes.splice(1, 0, { id: 'type-lecturer', name: 'อาจารย์พิเศษ', price: 350 });
    }

    const merged: FormConfig = {
      ...defaultFormConfig,
      ...parsed,
      eventTitle: parsed.eventTitle || defaultFormConfig.eventTitle,
      eventDate: parsed.eventDate || defaultFormConfig.eventDate,
      registrationPeriod: parsed.registrationPeriod || defaultFormConfig.registrationPeriod,
      pickupInstructions: parsed.pickupInstructions || defaultFormConfig.pickupInstructions,
      applicantTypes: mergedTypes,
      studentYears: parsed.studentYears && parsed.studentYears.length > 0 ? parsed.studentYears : defaultFormConfig.studentYears,
      studentRooms: parsed.studentRooms && parsed.studentRooms.length > 0 ? parsed.studentRooms : defaultFormConfig.studentRooms,
      studentMajors: parsed.studentMajors && parsed.studentMajors.length > 0 ? parsed.studentMajors : defaultFormConfig.studentMajors,
      learningLocations: parsed.learningLocations && parsed.learningLocations.length > 0 ? parsed.learningLocations : defaultFormConfig.learningLocations,
      bankInfo: {
        ...defaultFormConfig.bankInfo,
        ...(parsed.bankInfo || {}),
      },
    };
    return merged;
  } catch (e) {
    console.error('Failed to parse form config', e);
    return defaultFormConfig;
  }
};

export const saveFormConfig = (config: FormConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.FORM_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save form config', e);
  }
};

export const getStoredAdminAccounts = (): AdminAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_ACCOUNTS, JSON.stringify(defaultAdminAccounts));
      return defaultAdminAccounts;
    }
    const parsed = JSON.parse(raw);
    // Ensure default admin always exists if empty
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_ACCOUNTS, JSON.stringify(defaultAdminAccounts));
      return defaultAdminAccounts;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to parse admin accounts', e);
    return defaultAdminAccounts;
  }
};

export const saveAdminAccounts = (accounts: AdminAccount[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save admin accounts', e);
  }
};

export const getStoredAppsScriptConfig = (): AppsScriptConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPS_SCRIPT_CONFIG);
    if (!raw) {
      return { webAppUrl: '', isConnected: false };
    }
    return JSON.parse(raw);
  } catch (e) {
    return { webAppUrl: '', isConnected: false };
  }
};

export const saveAppsScriptConfig = (config: AppsScriptConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.APPS_SCRIPT_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save apps script config', e);
  }
};

export const getCurrentAdmin = (): AdminAccount | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setCurrentAdmin = (admin: AdminAccount | null): void => {
  try {
    if (admin) {
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify(admin));
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
    }
  } catch (e) {
    console.error(e);
  }
};

/**
 * Generate next Registration ID format: SKCC-2026-XXXX
 */
export const generateRegistrationId = (existingList: Registration[]): string => {
  const currentYear = 2026;
  let maxSeq = 0;
  existingList.forEach((item) => {
    const match = item.id.match(/SKCC-2026-(\d+)/);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > maxSeq) maxSeq = num;
    }
  });
  const nextSeq = (maxSeq + 1).toString().padStart(4, '0');
  return `SKCC-${currentYear}-${nextSeq}`;
};

/**
 * Test Google Apps Script Web App Connection
 */
export const testGoogleAppsScriptConnection = async (
  url: string
): Promise<{ success: boolean; message: string; spreadsheetUrl?: string }> => {
  if (!url || !url.trim()) {
    return {
      success: false,
      message: 'กรุณาระบุ URL ของ Google Apps Script Web App',
    };
  }

  const cleanUrl = url.trim();
  if (!cleanUrl.startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      message: 'URL ต้องเริ่มต้นด้วย https://script.google.com/macros/s/...',
    };
  }

  try {
    const testEndpoint = cleanUrl.includes('?') ? `${cleanUrl}&action=ping` : `${cleanUrl}?action=ping`;
    
    const response = await fetch(testEndpoint, {
      method: 'GET',
      mode: 'cors',
    }).catch(async () => {
      return await fetch(testEndpoint, {
        method: 'GET',
        mode: 'no-cors',
      });
    });

    if (response) {
      let spreadsheetUrl: string | undefined = undefined;
      try {
        const text = await response.clone().text();
        if (text && text.startsWith('{')) {
          const json = JSON.parse(text);
          if (json.spreadsheetUrl) {
            spreadsheetUrl = json.spreadsheetUrl;
          }
        }
      } catch {
        // Ignored for no-cors
      }

      return {
        success: true,
        message: 'เชื่อมต่อ Google Apps Script สำเร็จ พร้อมรับข้อมูลเข้า Google Sheets และ Google Drive',
        spreadsheetUrl,
      };
    }
    return {
      success: false,
      message: 'ไม่สามารถติดต่อ Google Apps Script ได้ กรุณาตรวจสอบสิทธิ์ Deploy (Who has access: Anyone)',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message || 'เน็ตเวิร์กขัดข้อง'}`,
    };
  }
};

/**
 * Fetch Form Configuration from Google Sheets via Google Apps Script
 */
export const fetchFormConfigFromGoogleSheets = async (
  webAppUrl: string
): Promise<{ success: boolean; config?: FormConfig; message?: string }> => {
  if (!webAppUrl || !webAppUrl.trim()) {
    return { success: false, message: 'ไม่ได้ระบุ Web App URL' };
  }

  try {
    const endpoint = webAppUrl.includes('?')
      ? `${webAppUrl.trim()}&action=getFormConfig`
      : `${webAppUrl.trim()}?action=getFormConfig`;

    const response = await fetch(endpoint, {
      method: 'GET',
      mode: 'cors',
    });

    const result = await response.json();
    if (result && result.status === 'success' && result.data) {
      const config = result.data as FormConfig;
      // Save locally
      saveFormConfig(config);
      return { success: true, config, message: 'ดึงการตั้งค่าจาก Google Sheets สำเร็จ' };
    }
    return { success: false, message: result?.message || 'ไม่พบข้อมูลการตั้งค่าในชีต' };
  } catch (err: any) {
    console.warn('Fetch FormConfig error:', err);
    return { success: false, message: err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล' };
  }
};

/**
 * Save Form Configuration to Google Sheets via Google Apps Script
 */
export const saveFormConfigToGoogleSheets = async (
  webAppUrl: string,
  config: FormConfig
): Promise<{ success: boolean; message?: string }> => {
  if (!webAppUrl || !webAppUrl.trim()) {
    return { success: false, message: 'ไม่ได้ระบุ Web App URL' };
  }

  try {
    const payload = {
      action: 'saveFormConfig',
      data: config,
    };

    const response = await fetch(webAppUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return {
      success: result.status === 'success',
      message: result.message || (result.status === 'success' ? 'บันทึกลง Google Sheets สำเร็จ' : 'บันทึกล้มเหลว'),
    };
  } catch (err: any) {
    console.warn('Save FormConfig error:', err);
    return { success: false, message: err.message || 'เน็ตเวิร์กขัดข้อง' };
  }
};

/**
 * Send registration payload to Google Apps Script Web App if configured
 */
export const syncToGoogleAppsScript = async (
  webAppUrl: string,
  registration: Registration
): Promise<{ success: boolean; driveSlipUrl?: string; message?: string }> => {
  if (!webAppUrl || !webAppUrl.trim()) {
    return { success: false, message: 'No Web App URL configured' };
  }

  try {
    const payload = {
      action: 'addRegistration',
      data: {
        ...registration,
        slipBase64: registration.slipImage,
      },
    };

    const response = await fetch(webAppUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Google Apps Script handles text/plain best with JSON.parse
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return {
      success: result.status === 'success',
      driveSlipUrl: result.driveSlipUrl,
      message: result.message,
    };
  } catch (err: any) {
    console.warn('Google Apps Script background sync note:', err);
    return { success: false, message: err.message };
  }
};

/**
 * Update an existing registration in Google Sheets
 */
export const updateRegistrationInGoogleSheets = async (
  webAppUrl: string,
  registration: Registration
): Promise<{ success: boolean; driveSlipUrl?: string; message?: string }> => {
  if (!webAppUrl || !webAppUrl.trim()) {
    return { success: false, message: 'No Web App URL configured' };
  }

  try {
    const payload = {
      action: 'updateRegistration',
      data: {
        ...registration,
        slipBase64: registration.slipImage,
      },
    };

    const response = await fetch(webAppUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return {
      success: result.status === 'success',
      driveSlipUrl: result.driveSlipUrl,
      message: result.message,
    };
  } catch (err: any) {
    console.warn('Update registration in Sheets error:', err);
    return { success: false, message: err.message };
  }
};

/**
 * Delete a registration from Google Sheets
 */
export const deleteRegistrationInGoogleSheets = async (
  webAppUrl: string,
  id: string
): Promise<{ success: boolean; message?: string }> => {
  if (!webAppUrl || !webAppUrl.trim()) {
    return { success: false, message: 'No Web App URL configured' };
  }

  try {
    const payload = {
      action: 'deleteRegistration',
      id,
    };

    const response = await fetch(webAppUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return {
      success: result.status === 'success',
      message: result.message,
    };
  } catch (err: any) {
    console.warn('Delete registration from Sheets error:', err);
    return { success: false, message: err.message };
  }
};

/**
 * Update verification status of a registration in Google Sheets
 */
export const updateStatusInGoogleSheets = async (
  webAppUrl: string,
  id: string,
  status: string
): Promise<{ success: boolean; message?: string }> => {
  if (!webAppUrl || !webAppUrl.trim()) {
    return { success: false, message: 'No Web App URL configured' };
  }

  try {
    const payload = {
      action: 'updateStatus',
      id,
      status,
    };

    const response = await fetch(webAppUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return {
      success: result.status === 'success',
      message: result.message,
    };
  } catch (err: any) {
    console.warn('Update status in Sheets error:', err);
    return { success: false, message: err.message };
  }
};

/**
 * Fetch all registrations from Google Sheets
 */
export const fetchRegistrationsFromGoogleSheets = async (
  webAppUrl: string
): Promise<{ success: boolean; data?: Registration[]; message?: string }> => {
  if (!webAppUrl || !webAppUrl.trim()) {
    return { success: false, message: 'No Web App URL configured' };
  }

  try {
    const endpoint = webAppUrl.includes('?')
      ? `${webAppUrl.trim()}&action=getRegistrations`
      : `${webAppUrl.trim()}?action=getRegistrations`;

    const response = await fetch(endpoint, {
      method: 'GET',
      mode: 'cors',
    });

    const result = await response.json();
    if (result && result.status === 'success' && Array.isArray(result.data)) {
      return { success: true, data: result.data as Registration[] };
    }
    return { success: false, message: result?.message || 'ไม่สามารถดึงข้อมูลได้' };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
};

/**
 * Export registrations list to CSV file with UTF-8 BOM
 */
export const exportRegistrationsToCSV = (list: Registration[]) => {
  const headers = [
    'รหัสการสมัคร',
    'วันเวลาที่สมัคร',
    'คำนำหน้า',
    'ชื่อ-สกุล',
    'เบอร์ติดต่อ',
    'ประเภทผู้สมัคร',
    'ค่าสมัคร(บาท)',
    'รหัสชั้นปี',
    'ห้อง',
    'สาขา',
    'สถานที่จัดการเรียนการสอน',
    'ขนาดเสื้อ',
    'รูปแบบจัดส่ง',
    'ค่าจัดส่ง(บาท)',
    'ยอดชำระรวม(บาท)',
    'ที่อยู่จัดส่ง',
    'สถานะการตรวจสอบ',
    'ลิงก์สลิป/บันทึก',
  ];

  const rows = list.map((reg) => {
    let addressStr = 'รับด้วยตัวเอง ณ วิทยาลัยชุมชนสงขลา';
    if (reg.deliveryType === 'postal' && reg.address) {
      const a = reg.address;
      addressStr = [
        `บ้านเลขที่ ${a.houseNo || '-'}`,
        a.moo ? `หมู่ ${a.moo}` : '',
        a.village ? `ม.${a.village}` : '',
        a.soi ? `ซ.${a.soi}` : '',
        a.road ? `ถ.${a.road}` : '',
        `ต.${a.subdistrict || '-'}`,
        `อ.${a.district || '-'}`,
        `จ.${a.province || '-'}`,
        a.postalCode || '',
        a.note ? `(หมายเหตุ: ${a.note})` : '',
      ]
        .filter(Boolean)
        .join(' ');
    }

    return [
      `"${reg.id}"`,
      `"${new Date(reg.registeredAt).toLocaleString('th-TH')}"`,
      `"${reg.prefix}"`,
      `"${reg.fullName}"`,
      `"'${reg.phone}"`,
      `"${reg.applicantType}"`,
      reg.applicantPrice,
      `"${reg.studentYear || '-'}"`,
      `"${reg.studentRoom || '-'}"`,
      `"${reg.studentMajor || '-'}"`,
      `"${reg.learningLocation || '-'}"`,
      `"${reg.shirtSize}"`,
      `"${reg.deliveryType === 'pickup' ? 'รับด้วยตัวเอง' : 'จัดส่งไปรษณีย์'}"`,
      reg.deliveryFee,
      reg.totalAmount,
      `"${addressStr.replace(/"/g, '""')}"`,
      `"${reg.status}"`,
      `"${reg.driveFileUrl || 'สลิปแนบในระบบ'}"`,
    ].join(',');
  });

  // Include UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility in Thai
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SKCC_Run2026_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Aliases for clean API
export const getRegistrations = getStoredRegistrations;
export const getFormConfig = getStoredFormConfig;
export const getAdminAccounts = getStoredAdminAccounts;
export const getAppsScriptConfig = getStoredAppsScriptConfig;

/**
 * Submit a new registration, generate ID, save locally and sync to Google Apps Script if enabled
 */
export const submitRegistration = async (
  data: Omit<Registration, 'id' | 'registeredAt' | 'status'>
): Promise<Registration> => {
  const currentList = getStoredRegistrations();
  const newId = generateRegistrationId(currentList);
  const newRegistration: Registration = {
    ...data,
    id: newId,
    registeredAt: new Date().toISOString(),
    status: 'ยังไม่ตรวจสอบ',
  };

  const updatedList = [newRegistration, ...currentList];
  saveRegistrations(updatedList);

  // Background sync to Google Apps Script if configured
  const scriptCfg = getStoredAppsScriptConfig();
  if (scriptCfg && scriptCfg.webAppUrl) {
    syncToGoogleAppsScript(scriptCfg.webAppUrl, newRegistration)
      .then((res) => {
        if (res.success && res.driveSlipUrl) {
          // If Drive URL returned, update record
          const listWithDriveUrl = getStoredRegistrations().map((r) =>
            r.id === newId ? { ...r, driveFileUrl: res.driveSlipUrl } : r
          );
          saveRegistrations(listWithDriveUrl);
        }
      })
      .catch((err) => {
        console.warn('Background sync warning:', err);
      });
  }

  return newRegistration;
};
