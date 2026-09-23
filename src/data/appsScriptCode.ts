export const APPS_SCRIPT_CODE_GS = `/**
 * =========================================================================
 * SK-CC วิ่งให้ FUN 2026 - ระบบเชื่อมต่อ Google Sheets & Google Drive
 * วิทยาลัยชุมชนสงขลา (Songkhla Community College)
 * =========================================================================
 * รองรับ:
 * 1. บันทึกข้อมูลการสมัครลง Google Sheets
 * 2. อัปโหลดไฟล์สลิปโอนเงินเข้า Google Drive ในโฟลเดอร์เฉพาะอัตโนมัติ
 * 3. บันทึก URL ไฟล์ภาพสลิปลงใน Google Sheets เพื่อกดเปิดดูได้ทันที
 * 4. API สำหรับตรวจสอบสถานะการเชื่อมต่อ (Ping/Health Check)
 * 5. อัปเดตสถานะการตรวจสอบ (ตรวจสอบแล้ว / ยังไม่ตรวจสอบ)
 */

// ชื่อแผ่นงาน (Sheet Name) และชื่อโฟลเดอร์ใน Google Drive
const SHEET_NAME = 'Registrations_2026';
const DRIVE_FOLDER_NAME = 'SKCC_FunRun_2026_Slips';

/**
 * Handle GET Requests (Health check / Read records)
 */
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : '';
    
    if (action === 'ping') {
      return jsonResponse({
        status: 'success',
        connected: true,
        timestamp: new Date().toISOString(),
        message: 'เชื่อมต่อ Google Apps Script และ Google Sheets สำเร็จ'
      });
    }

    if (action === 'getRegistrations') {
      const sheet = getOrCreateSheet();
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return jsonResponse({ status: 'success', data: [] });
      }
      
      const headers = data[0];
      const rows = data.slice(1).map(row => {
        let obj = {};
        headers.forEach((h, i) => {
          obj[h] = row[i];
        });
        return obj;
      });
      return jsonResponse({ status: 'success', data: rows });
    }

    // Default Web page view: Render Index.html
    try {
      return HtmlService.createTemplateFromFile('Index')
        .evaluate()
        .setTitle('SK-CC วิ่งให้ FUN 2026 - Data Bridge')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
    } catch (renderErr) {
      return jsonResponse({
        status: 'success',
        connected: true,
        timestamp: new Date().toISOString(),
        message: 'Google Apps Script Web App พร้อมใช้งาน'
      });
    }
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Handle POST Requests (Create registration / Upload slip / Update status)
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action || 'addRegistration';

    if (action === 'testConnection') {
      return jsonResponse({
        status: 'success',
        connected: true,
        timestamp: new Date().toISOString(),
        sheetName: SHEET_NAME,
        message: 'เชื่อมต่อ Google Sheets และ Google Drive พร้อมใช้งาน'
      });
    }

    if (action === 'addRegistration') {
      const reg = payload.data;
      const sheet = getOrCreateSheet();

      // บันทึกไฟล์ภาพสลิปโอนเงินเข้า Google Drive
      let slipUrl = reg.slipImage || '';
      if (reg.slipBase64 && reg.slipBase64.startsWith('data:image')) {
        slipUrl = uploadSlipToDrive(reg.id, reg.fullName, reg.slipBase64);
      }

      // สร้างที่อยู่รวมกรณีจัดส่งทางไปรษณีย์
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

      // ข้อมูลการศึกษา (กรณีเป็นนักศึกษา)
      const studentInfo = [
        reg.studentYear ? 'รหัส ' + reg.studentYear : '',
        reg.studentRoom ? 'ห้อง ' + reg.studentRoom : '',
        reg.studentMajor || '',
        reg.learningLocation || ''
      ].filter(Boolean).join(' | ');

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
        message: 'บันทึกข้อมูลเรียบร้อยแล้ว',
        id: reg.id,
        driveSlipUrl: slipUrl
      });
    }

    if (action === 'updateStatus') {
      const { id, status } = payload;
      const sheet = getOrCreateSheet();
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
          // Column 18 (R) is status (1-based index 18)
          sheet.getRange(i + 1, 18).setValue(status);
          return jsonResponse({
            status: 'success',
            message: 'อัปเดตสถานะสำเร็จ'
          });
        }
      }
      return jsonResponse({ status: 'error', message: 'Registration not found' });
    }

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
            driveSlipUrl: slipUrl
          });
        }
      }
      return jsonResponse({ status: 'error', message: 'Registration not found' });
    }

    return jsonResponse({ status: 'error', message: 'Invalid action' });
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.toString() });
  }
}

/**
 * ฟังก์ชันสร้างหรือดึงโฟลเดอร์ Google Drive และบันทึกไฟล์สลิป
 */
function uploadSlipToDrive(regId, fullName, base64Data) {
  try {
    let folder;
    const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(DRIVE_FOLDER_NAME);
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }

    // แปลง Base64 เป็น Blob
    const parts = base64Data.split(';base64,');
    const contentType = parts[0].replace('data:', '');
    const decoded = Utilities.base64Decode(parts[1]);
    const cleanName = fullName.replace(/[\\/:*?"<>|]/g, '_');
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
 * ฟังก์ชันสร้าง Sheet และใส่ Header สีน้ำเงิน #0F4E7A สวยงาม
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
        max-width: 540px;
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
      .btn {
        background: #0F4E7A;
        color: white;
        border: none;
        padding: 10px 24px;
        border-radius: 8px;
        font-size: 15px;
        cursor: pointer;
        font-weight: 500;
        text-decoration: none;
        display: inline-block;
        margin-top: 12px;
      }
      .btn:hover { background: #0c3e61; }
    </style>
  </head>
  <body>
    <div class="card">
      <div style="font-size: 44px; margin-bottom: 12px;">🏃‍♂️💨</div>
      <h1>SK-CC วิ่งให้ FUN 2026</h1>
      <p>วิทยาลัยชุมชนสงขลา (Songkhla Community College)</p>
      <div class="status-pill">● Google Apps Script Web App ทำงานปกติ (Online)</div>
      <p>Web App นี้ทำหน้าที่เป็นตัวกลางรับข้อมูลการสมัคร บันทึกลง Google Sheets และส่งไฟล์ภาพสลิปไปยัง Google Drive โฟลเดอร์ <strong>SKCC_FunRun_2026_Slips</strong></p>
      <a href="<?= SpreadsheetApp.getActiveSpreadsheet().getUrl() ?>" target="_blank" class="btn">
        เปิดดู Google Sheets
      </a>
    </div>
  </body>
</html>
`;
