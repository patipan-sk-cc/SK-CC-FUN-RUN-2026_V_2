export const APPS_SCRIPT_CODE_GS = `/**
 * =========================================================================
 * SK-CC วิ่งให้ FUN 2026 - ระบบเชื่อมต่อ Google Sheets & Google Drive
 * วิทยาลัยชุมชนสงขลา (Songkhla Community College)
 * =========================================================================
 * ฟังก์ชันหลัก:
 * 1. บันทึกข้อมูลการสมัครลง Google Sheets (19 คอลัมน์)
 * 2. แก้ไข (Update) และ ลบ (Delete) ข้อมูลผู้สมัครในชีต
 * 3. อัปเดตสถานะการตรวจสอบ (ตรวจสอบแล้ว / ยังไม่ตรวจสอบ)
 * 4. ซิงค์ตัวเลือกและบันทึกการตั้งค่าฟอร์ม (Form Options & Config) ลงชีต 'Config_2026'
 * 5. อัปโหลดไฟล์สลิปโอนเงินเข้า Google Drive 'SKCC_FunRun_2026_Slips' อัตโนมัติ
 * 6. ส่งกลับ URL ของ Google Sheets เพื่อกดเปิดจากระบบได้ทันที
 */

// ชื่อแผ่นงานหลัก (Registrations) แผ่นงานตั้งค่า (Config) และโฟลเดอร์ Google Drive
const SHEET_NAME = 'Registrations_2026';
const CONFIG_SHEET_NAME = 'Config_2026';
const DRIVE_FOLDER_NAME = 'SKCC_FunRun_2026_Slips';

/**
 * Handle GET Requests
 */
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : '';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const spreadsheetUrl = ss.getUrl();
    
    // 1. Ping / Health check
    if (action === 'ping') {
      return jsonResponse({
        status: 'success',
        connected: true,
        timestamp: new Date().toISOString(),
        spreadsheetUrl: spreadsheetUrl,
        sheetName: SHEET_NAME,
        configSheetName: CONFIG_SHEET_NAME,
        message: 'เชื่อมต่อ Google Apps Script และ Google Sheets สำเร็จ'
      });
    }

    // 2. ดึงข้อมูลการตั้งค่าฟอร์มและตัวเลือกทั้งหมดจากชีต Config_2026
    if (action === 'getFormConfig') {
      const config = readConfigFromSheet();
      return jsonResponse({
        status: 'success',
        data: config,
        spreadsheetUrl: spreadsheetUrl,
        message: 'ดึงข้อมูลตัวเลือกจาก Google Sheets สำเร็จ'
      });
    }

    // 3. ดึงรายชื่อผู้สมัครทั้งหมด
    if (action === 'getRegistrations') {
      const sheet = getOrCreateSheet();
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return jsonResponse({ status: 'success', data: [], spreadsheetUrl: spreadsheetUrl });
      }
      
      const headers = data[0];
      const rows = data.slice(1).map(row => {
        let obj = {};
        headers.forEach((h, i) => {
          obj[h] = row[i];
        });
        return obj;
      });
      return jsonResponse({ status: 'success', data: rows, spreadsheetUrl: spreadsheetUrl });
    }

    // 4. Default Web Page View (index.html)
    try {
      return HtmlService.createTemplateFromFile('index')
        .evaluate()
        .setTitle('SK-CC วิ่งให้ FUN 2026 - Data Bridge')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
    } catch (renderErr) {
      return jsonResponse({
        status: 'success',
        connected: true,
        timestamp: new Date().toISOString(),
        spreadsheetUrl: spreadsheetUrl,
        message: 'Google Apps Script Web App พร้อมใช้งาน'
      });
    }
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Handle POST Requests
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action || 'addRegistration';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const spreadsheetUrl = ss.getUrl();

    // 1. ทดสอบการเชื่อมต่อ
    if (action === 'testConnection') {
      return jsonResponse({
        status: 'success',
        connected: true,
        timestamp: new Date().toISOString(),
        sheetName: SHEET_NAME,
        spreadsheetUrl: spreadsheetUrl,
        message: 'เชื่อมต่อ Google Sheets และ Google Drive พร้อมใช้งาน'
      });
    }

    // 2. ดึงการตั้งค่าฟอร์มและตัวเลือก
    if (action === 'getFormConfig') {
      const config = readConfigFromSheet();
      return jsonResponse({
        status: 'success',
        data: config,
        spreadsheetUrl: spreadsheetUrl
      });
    }

    // 3. บันทึกและอัปเดตการตั้งค่าฟอร์ม / ตัวเลือกทั้งหมดลงใน Google Sheets
    if (action === 'saveFormConfig') {
      const configData = payload.data;
      writeConfigToSheet(configData);
      return jsonResponse({
        status: 'success',
        message: 'บันทึกและอัปเดตการตั้งค่าฟอร์มลง Google Sheets สำเร็จ',
        spreadsheetUrl: spreadsheetUrl
      });
    }

    // 4. เพิ่มผู้สมัครใหม่ (Add Registration)
    if (action === 'addRegistration') {
      const reg = payload.data;
      const sheet = getOrCreateSheet();

      // บันทึกสลิปโอนเงินเข้า Google Drive
      let slipUrl = reg.driveFileUrl || reg.slipImage || '';
      if (reg.slipBase64 && reg.slipBase64.startsWith('data:image')) {
        slipUrl = uploadSlipToDrive(reg.id, reg.fullName, reg.slipBase64);
      }

      // สร้างที่อยู่รวม
      let fullAddress = 'รับด้วยตัวเอง ณ วิทยาลัยชุมชนสงขลา';
      if (reg.deliveryType === 'postal' && reg.address) {
        const a = reg.address;
        fullAddress = [
          'บ้านเลขที่ ' + (a.houseNo || '-'),
          a.moo ? 'หมู่ ' + a.moo : '',
          a.village ? 'ม.' + a.village : '',
          a.soi ? 'ซ.' + a.soi : '',
          a.road ? 'ถ.' + a.road : '',
          'ต.' + (a.subdistrict || '-'),
          'อ.' + (a.district || '-'),
          'จ.' + (a.province || '-'),
          a.postalCode || '',
          a.note ? '(หมายเหตุ: ' + a.note + ')' : ''
        ].filter(Boolean).join(' ');
      }

      const row = [
        reg.id,                                // A: รหัสการสมัคร
        new Date().toLocaleString('th-TH'),   // B: วันที่-เวลา
        reg.prefix,                            // C: คำนำหน้า
        reg.fullName,                          // D: ชื่อ-สกุล
        "'" + reg.phone,                       // E: เบอร์ติดต่อ
        reg.applicantType,                     // F: ประเภทผู้สมัคร
        reg.applicantPrice,                    // G: ค่าสมัคร
        reg.studentYear || '-',                // H: รหัสปี (นักศึกษา)
        reg.studentRoom || '-',                // I: ห้อง (นักศึกษา)
        reg.studentMajor || '-',               // J: สาขาวิชา (นักศึกษา)
        reg.learningLocation || '-',           // K: สถานที่เรียน (นักศึกษา)
        reg.shirtSize,                         // L: ขนาดเสื้อ
        reg.deliveryType === 'pickup' ? 'รับด้วยตัวเอง' : 'จัดส่งไปรษณีย์', // M: การจัดส่ง
        reg.deliveryFee || 0,                  // N: ค่าจัดส่ง
        reg.totalAmount || 0,                  // O: ยอดชำระรวม
        fullAddress,                           // P: ที่อยู่จัดส่ง
        slipUrl,                               // Q: ลิงก์สลิปโอนเงิน Google Drive
        reg.status || 'ยังไม่ตรวจสอบ',          // R: สถานะ
        reg.notes || ''                        // S: หมายเหตุ
      ];

      sheet.appendRow(row);

      return jsonResponse({
        status: 'success',
        message: 'บันทึกข้อมูลการสมัครลง Google Sheets สำเร็จ',
        id: reg.id,
        driveSlipUrl: slipUrl,
        spreadsheetUrl: spreadsheetUrl
      });
    }

    // 5. แก้ไขข้อมูลผู้สมัครทุกช่อง (Update Registration)
    if (action === 'updateRegistration') {
      const reg = payload.data;
      const sheet = getOrCreateSheet();
      const data = sheet.getDataRange().getValues();

      let slipUrl = reg.driveFileUrl || reg.slipImage || '';
      if (reg.slipBase64 && reg.slipBase64.startsWith('data:image')) {
        slipUrl = uploadSlipToDrive(reg.id, reg.fullName, reg.slipBase64);
      }

      let fullAddress = 'รับด้วยตัวเอง ณ วิทยาลัยชุมชนสงขลา';
      if (reg.deliveryType === 'postal' && reg.address) {
        const a = reg.address;
        fullAddress = [
          'บ้านเลขที่ ' + (a.houseNo || '-'),
          a.moo ? 'หมู่ ' + a.moo : '',
          a.village ? 'ม.' + a.village : '',
          a.soi ? 'ซ.' + a.soi : '',
          a.road ? 'ถ.' + a.road : '',
          'ต.' + (a.subdistrict || '-'),
          'อ.' + (a.district || '-'),
          'จ.' + (a.province || '-'),
          a.postalCode || '',
          a.note ? '(หมายเหตุ: ' + a.note + ')' : ''
        ].filter(Boolean).join(' ');
      }

      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === reg.id) {
          const rowNum = i + 1;
          const updatedRow = [
            reg.id,
            data[i][1] || new Date().toLocaleString('th-TH'),
            reg.prefix,
            reg.fullName,
            "'" + reg.phone,
            reg.applicantType,
            reg.applicantPrice,
            reg.studentYear || '-',
            reg.studentRoom || '-',
            reg.studentMajor || '-',
            reg.learningLocation || '-',
            reg.shirtSize,
            reg.deliveryType === 'pickup' ? 'รับด้วยตัวเอง' : 'จัดส่งไปรษณีย์',
            reg.deliveryFee || 0,
            reg.totalAmount || 0,
            fullAddress,
            slipUrl,
            reg.status || 'ยังไม่ตรวจสอบ',
            reg.notes || ''
          ];
          sheet.getRange(rowNum, 1, 1, updatedRow.length).setValues([updatedRow]);
          return jsonResponse({
            status: 'success',
            message: 'อัปเดตข้อมูลผู้สมัครใน Google Sheets เรียบร้อยแล้ว',
            driveSlipUrl: slipUrl,
            spreadsheetUrl: spreadsheetUrl
          });
        }
      }
      return jsonResponse({ status: 'error', message: 'ไม่พบรหัสผู้สมัครในระบบ' });
    }

    // 6. ลบข้อมูลผู้สมัคร (Delete Registration)
    if (action === 'deleteRegistration') {
      const regId = payload.id;
      const sheet = getOrCreateSheet();
      const data = sheet.getDataRange().getValues();

      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === regId) {
          sheet.deleteRow(i + 1);
          return jsonResponse({
            status: 'success',
            message: 'ลบข้อมูลผู้สมัครออกจาก Google Sheets เรียบร้อยแล้ว',
            spreadsheetUrl: spreadsheetUrl
          });
        }
      }
      return jsonResponse({ status: 'error', message: 'ไม่พบรหัสผู้สมัครที่จะลบ' });
    }

    // 7. อัปเดตเฉพาะสถานะการตรวจสอบ (Update Status)
    if (action === 'updateStatus') {
      const { id, status } = payload;
      const sheet = getOrCreateSheet();
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
          sheet.getRange(i + 1, 18).setValue(status);
          return jsonResponse({
            status: 'success',
            message: 'อัปเดตสถานะใน Google Sheets สำเร็จ',
            spreadsheetUrl: spreadsheetUrl
          });
        }
      }
      return jsonResponse({ status: 'error', message: 'ไม่พบรหัสผู้สมัคร' });
    }

    return jsonResponse({ status: 'error', message: 'Invalid action' });
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.toString() });
  }
}

/**
 * ฟังก์ชันบันทึกการตั้งค่าฟอร์มและตัวเลือกลงชีต Config_2026
 */
function writeConfigToSheet(configObj) {
  if (!configObj) return;
  const sheet = getOrCreateConfigSheet();
  const jsonStr = JSON.stringify(configObj);
  sheet.getRange(2, 1).setValue('FORM_CONFIG_JSON');
  sheet.getRange(2, 2).setValue(jsonStr);
  sheet.getRange(2, 3).setValue(new Date().toLocaleString('th-TH'));
}

/**
 * ฟังก์ชันอ่านการตั้งค่าฟอร์มและตัวเลือกจากชีต Config_2026
 */
function readConfigFromSheet() {
  const sheet = getOrCreateConfigSheet();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'FORM_CONFIG_JSON' && data[i][1]) {
      try {
        return JSON.parse(data[i][1]);
      } catch (err) {
        Logger.log('Config parse error: ' + err.toString());
      }
    }
  }
  return null;
}

/**
 * ฟังก์ชันสร้างหรือดึงโฟลเดอร์ Google Drive สำหรับเก็บสลิป
 */
function getOrCreateDriveFolder() {
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  const folder = DriveApp.createFolder(DRIVE_FOLDER_NAME);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return folder;
}

/**
 * ฟังก์ชันสำหรับกดรันครั้งแรกใน Apps Script (เลือกฟังก์ชัน initSheetDatabase แล้วกด Run)
 * เพื่อสร้างชีต Registrations_2026, ชีต Config_2026 และโฟลเดอร์ Google Drive ทันที
 */
function initSheetDatabase() {
  const regSheet = getOrCreateSheet();
  const cfgSheet = getOrCreateConfigSheet();
  const folder = getOrCreateDriveFolder();
  SpreadsheetApp.getActiveSpreadsheet().toast('สร้างตารางผู้สมัคร ตารางตัวเลือก และโฟลเดอร์สลิป Drive สำเร็จ!', 'SK-CC 2026', 8);
  Logger.log('Initialized sheets: ' + regSheet.getName() + ', ' + cfgSheet.getName() + ' and folder: ' + folder.getName());
  return 'Database initialized successfully!';
}

/**
 * ฟังก์ชันบันทึกไฟล์สลิปโอนเงินเข้า Google Drive
 */
function uploadSlipToDrive(regId, fullName, base64Data) {
  try {
    if (!base64Data || !base64Data.startsWith('data:image')) return '';
    const folder = getOrCreateDriveFolder();

    // แปลง Base64 เป็น Blob
    const parts = base64Data.split(';base64,');
    const contentType = parts[0].replace('data:', '');
    const decoded = Utilities.base64Decode(parts[1]);
    const cleanName = (fullName || 'runner').replace(/[\\/:*?"<>|]/g, '_');
    const fileName = 'Slip_' + regId + '_' + cleanName + '.jpg';

    const blob = Utilities.newBlob(decoded, contentType, fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return file.getUrl();
  } catch (err) {
    Logger.log('Upload error: ' + err.toString());
    return '';
  }
}

/**
 * ฟังก์ชันสร้าง Sheet รายชื่อผู้สมัคร (19 คอลัมน์ สีกรมท่า #0F4E7A)
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      'รหัสการสมัคร',
      'วันเวลาที่สมัคร',
      'คำนำหน้า',
      'ชื่อ-สกุล',
      'เบอร์ติดต่อ',
      'ประเภทผู้สมัคร',
      'ค่าสมัคร',
      'รหัสปี (นักศึกษา)',
      'ห้อง (นักศึกษา)',
      'สาขาวิชา (นักศึกษา)',
      'สถานที่เรียน (นักศึกษา)',
      'ขนาดเสื้อ',
      'รูปแบบการจัดส่ง',
      'ค่าจัดส่ง',
      'ยอดชำระสุทธิ',
      'ที่อยู่จัดส่ง',
      'ลิงก์สลิปโอนเงิน (Drive)',
      'สถานะการตรวจสอบ',
      'หมายเหตุ'
    ];
    
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#0F4E7A');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setFontFamily('Prompt');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }
  return sheet;
}

/**
 * ฟังก์ชันสร้าง Sheet ตั้งค่าฟอร์มและตัวเลือก (Config_2026)
 */
function getOrCreateConfigSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG_SHEET_NAME);
    const headers = ['Config_Key', 'Config_Value_JSON', 'Updated_At'];
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#EDBA48');
    headerRange.setFontColor('#0F4E7A');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export const APPS_SCRIPT_INDEX_HTML = `<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <meta charset="UTF-8">
    <title>SK-CC วิ่งให้ FUN 2026 - Data Bridge</title>
    <style>
      body {
        font-family: 'Prompt', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #f8fafc;
        color: #0F4E7A;
        padding: 40px 20px;
        text-align: center;
      }
      .card {
        background: white;
        border-radius: 16px;
        padding: 32px;
        max-width: 580px;
        margin: 0 auto;
        box-shadow: 0 10px 25px rgba(15, 78, 122, 0.1);
        border: 2px solid #EDBA48;
      }
      h1 { font-size: 24px; margin-bottom: 8px; color: #0F4E7A; }
      p { color: #475569; font-size: 14px; line-height: 1.6; }
      .status-pill {
        display: inline-block;
        background: #ecfdf5;
        color: #059669;
        font-weight: 600;
        padding: 6px 16px;
        border-radius: 9999px;
        font-size: 14px;
        margin: 16px 0;
        border: 1px solid #a7f3d0;
      }
      .features {
        text-align: left;
        background: #f8fafc;
        padding: 16px 20px;
        border-radius: 12px;
        margin: 20px 0;
        font-size: 13px;
        color: #334155;
        border: 1px solid #e2e8f0;
      }
      .features li { margin-bottom: 6px; }
      .btn {
        background: #0F4E7A;
        color: white;
        border: none;
        padding: 12px 26px;
        border-radius: 10px;
        font-size: 15px;
        cursor: pointer;
        font-weight: 600;
        text-decoration: none;
        display: inline-block;
        margin-top: 12px;
        box-shadow: 0 4px 10px rgba(15, 78, 122, 0.2);
      }
      .btn:hover { background: #0c3e61; }
    </style>
  </head>
  <body>
    <div class="card">
      <div style="font-size: 48px; margin-bottom: 12px;">🏃‍♂️💨</div>
      <h1>SK-CC วิ่งให้ FUN 2026</h1>
      <p>วิทยาลัยชุมชนสงขลา (Songkhla Community College)</p>
      <div class="status-pill">● Google Apps Script Data Bridge ทำงานปกติ (Online)</div>
      
      <div class="features">
        <strong>ระบบเชื่อมต่อแบบสองทิศทาง (2-Way Sync):</strong>
        <ul style="padding-left: 20px; margin-top: 8px;">
          <li>ชีต <strong>Registrations_2026</strong>: จัดเก็บ เพิ่ม แก้ไข ลบ ข้อมูลผู้สมัคร (19 คอลัมน์)</li>
          <li>ชีต <strong>Config_2026</strong>: จัดเก็บและซิงค์ตัวเลือกทุกช่องของฟอร์มรับสมัคร</li>
          <li>โฟลเดอร์ <strong>SKCC_FunRun_2026_Slips</strong>: จัดเก็บสลิปโอนเงินอัตโนมัติใน Google Drive</li>
        </ul>
      </div>

      <a href="<?= SpreadsheetApp.getActiveSpreadsheet().getUrl() ?>" target="_blank" class="btn">
        📊 เปิดดู Google Sheets ของระบบ
      </a>
    </div>
  </body>
</html>
`;
