import { AdminAccount, FormConfig, Registration } from '../types';

// SVG Data URL generator for official SK-CC Fun Run 2026 shirt mockup
const createShirtMockupSvg = (variant: 'front' | 'back') => {
  const isFront = variant === 'front';
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
    <defs>
      <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F4E7A" />
        <stop offset="100%" stop-color="#09314d" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#EDBA48" />
        <stop offset="100%" stop-color="#f5d076" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.15" />
      </filter>
    </defs>
    <rect width="600" height="600" fill="#f8fafc" rx="16" />
    <!-- T-shirt Outline -->
    <g filter="url(#shadow)">
      <path d="M 210,100 Q 300,140 390,100 L 490,180 L 430,260 L 390,225 L 390,510 L 210,510 L 210,225 L 170,260 L 110,180 Z" 
            fill="url(#navyGrad)" stroke="#092f49" stroke-width="3" stroke-linejoin="round" />
      <!-- Collar -->
      <path d="M 210,100 Q 300,160 390,100 Q 300,120 210,100 Z" fill="#EDBA48" />
      <!-- Sleeve cuffs -->
      <path d="M 110,180 L 170,260 L 160,270 L 100,190 Z" fill="#EDBA48" />
      <path d="M 490,180 L 430,260 L 440,270 L 500,190 Z" fill="#EDBA48" />
      <!-- Athletic Wave Strips -->
      <path d="M 210,380 Q 300,340 390,390 L 390,420 Q 300,370 210,410 Z" fill="url(#goldGrad)" opacity="0.9" />
      <path d="M 210,425 Q 300,385 390,435 L 390,445 Q 300,395 210,435 Z" fill="#ffffff" opacity="0.7" />
    </g>

    ${
      isFront
        ? `
      <!-- Front Graphic -->
      <circle cx="300" cy="220" r="42" fill="#ffffff" opacity="0.1" />
      <text x="300" y="210" font-family="'Prompt', sans-serif" font-weight="bold" font-size="28" fill="#EDBA48" text-anchor="middle">SK-CC</text>
      <text x="300" y="245" font-family="'Prompt', sans-serif" font-weight="bold" font-size="24" fill="#ffffff" text-anchor="middle">วิ่งให้ FUN 2026</text>
      <text x="300" y="275" font-family="'Prompt', sans-serif" font-size="13" fill="#cbd5e1" text-anchor="middle">วิทยาลัยชุมชนสงขลา (SONGKHLA CC)</text>
      <text x="300" y="550" font-family="'Prompt', sans-serif" font-weight="600" font-size="18" fill="#0F4E7A" text-anchor="middle">แบบเสื้อด้านหน้า (Front View)</text>
    `
        : `
      <!-- Back Graphic -->
      <text x="300" y="210" font-family="'Prompt', sans-serif" font-weight="bold" font-size="36" fill="#EDBA48" text-anchor="middle">FUN RUN 2026</text>
      <text x="300" y="250" font-family="'Prompt', sans-serif" font-weight="bold" font-size="20" fill="#ffffff" text-anchor="middle">HEALTH &amp; COMMUNITY</text>
      <text x="300" y="285" font-family="'Prompt', sans-serif" font-size="14" fill="#e2e8f0" text-anchor="middle">2nd ANNIVERSARY • SONGKHLA</text>
      <text x="300" y="550" font-family="'Prompt', sans-serif" font-weight="600" font-size="18" fill="#0F4E7A" text-anchor="middle">แบบเสื้อด้านหลัง (Back View)</text>
    `
    }
  </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
};

// SVG Data URL generator for Shirt Size Chart Table
const createSizeChartSvg = () => {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 640" width="100%" height="100%">
    <defs>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0F4E7A" />
        <stop offset="100%" stop-color="#1a6ea6" />
      </linearGradient>
    </defs>
    <rect width="800" height="640" fill="#ffffff" rx="16" stroke="#e2e8f0" stroke-width="2" />
    
    <!-- Title Banner -->
    <rect x="0" y="0" width="800" height="85" fill="url(#headerGrad)" rx="16" />
    <rect x="0" y="70" width="800" height="15" fill="#EDBA48" />
    <text x="400" y="44" font-family="'Prompt', sans-serif" font-weight="bold" font-size="24" fill="#ffffff" text-anchor="middle">
      ตารางขนาดเสื้อวิ่ง SK-CC วิ่งให้ FUN 2026
    </text>
    <text x="400" y="66" font-family="'Prompt', sans-serif" font-size="14" fill="#fde68a" text-anchor="middle">
      หน่วยวัดเป็นนิ้ว (Inches) • ทรงมาตรฐาน Unisex สวมใส่สบาย
    </text>

    <!-- Table Header -->
    <g transform="translate(40, 110)">
      <rect width="720" height="45" fill="#0F4E7A" rx="8" />
      <text x="90" y="28" font-family="'Prompt', sans-serif" font-weight="600" font-size="16" fill="#ffffff" text-anchor="middle">ไซส์ (Size)</text>
      <text x="280" y="28" font-family="'Prompt', sans-serif" font-weight="600" font-size="16" fill="#ffffff" text-anchor="middle">รอบอก (Chest - นิ้ว)</text>
      <text x="480" y="28" font-family="'Prompt', sans-serif" font-weight="600" font-size="16" fill="#ffffff" text-anchor="middle">ความยาว (Length - นิ้ว)</text>
      <text x="640" y="28" font-family="'Prompt', sans-serif" font-weight="600" font-size="16" fill="#ffffff" text-anchor="middle">คำแนะนำ</text>
    </g>

    <!-- Rows -->
    ${[
      { size: 'SS', chest: '36', len: '25', rec: 'รอบอกจริง 32-34', bg: '#f8fafc' },
      { size: 'S', chest: '38', len: '26', rec: 'รอบอกจริง 34-36', bg: '#ffffff' },
      { size: 'M', chest: '40', len: '27', rec: 'รอบอกจริง 36-38', bg: '#f8fafc' },
      { size: 'L', chest: '42', len: '28', rec: 'รอบอกจริง 38-40', bg: '#ffffff' },
      { size: 'XL', chest: '44', len: '29', rec: 'รอบอกจริง 40-42', bg: '#f8fafc' },
      { size: '2XL', chest: '46', len: '30', rec: 'รอบอกจริง 42-44', bg: '#ffffff' },
      { size: '3XL', chest: '48', len: '31', rec: 'รอบอกจริง 44-46', bg: '#f8fafc' },
      { size: '4XL', chest: '50', len: '31', rec: 'รอบอกจริง 46-48', bg: '#ffffff' },
      { size: '5XL', chest: '52', len: '31', rec: 'รอบอกจริง 48-50', bg: '#f8fafc' },
    ]
      .map(
        (row, idx) => `
      <g transform="translate(40, ${165 + idx * 46})">
        <rect width="720" height="42" fill="${row.bg}" stroke="#e2e8f0" stroke-width="1" rx="4" />
        <text x="90" y="27" font-family="'Prompt', sans-serif" font-weight="bold" font-size="16" fill="#0F4E7A" text-anchor="middle">${row.size}</text>
        <text x="280" y="27" font-family="'Prompt', sans-serif" font-weight="500" font-size="16" fill="#334155" text-anchor="middle">${row.chest}"</text>
        <text x="480" y="27" font-family="'Prompt', sans-serif" font-weight="500" font-size="16" fill="#334155" text-anchor="middle">${row.len}"</text>
        <text x="640" y="27" font-family="'Prompt', sans-serif" font-size="14" fill="#64748b" text-anchor="middle">${row.rec}</text>
      </g>
    `
      )
      .join('')}

    <!-- Bottom Notice -->
    <text x="400" y="605" font-family="'Prompt', sans-serif" font-size="13" fill="#64748b" text-anchor="middle">
      * ขนาดอาจมีความคลาดเคลื่อน +/- 0.5 ถึง 1 นิ้ว จากขั้นตอนการตัดเย็บ
    </text>
  </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
};

// SVG Data URL generator for Mock Bank Transfer Slips
export const createSampleSlipSvg = (name: string, amount: number, refCode: string) => {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 650" width="100%" height="100%">
    <rect width="450" height="650" fill="#ffffff" rx="16" stroke="#f472b6" stroke-width="4" />
    <rect x="0" y="0" width="450" height="110" fill="#eb1d74" rx="16" />
    <circle cx="60" cy="55" r="30" fill="#ffffff" />
    <text x="60" y="62" font-family="'Prompt', sans-serif" font-weight="bold" font-size="20" fill="#eb1d74" text-anchor="middle">GSB</text>
    <text x="110" y="50" font-family="'Prompt', sans-serif" font-weight="bold" font-size="22" fill="#ffffff">ธนาคารออมสิน</text>
    <text x="110" y="75" font-family="'Prompt', sans-serif" font-size="14" fill="#fce7f3">โอนเงินสำเร็จ (Transfer Success)</text>
    
    <g transform="translate(30, 140)">
      <text x="0" y="20" font-family="'Prompt', sans-serif" font-size="14" fill="#64748b">จำนวนเงิน</text>
      <text x="390" y="25" font-family="'Prompt', sans-serif" font-weight="bold" font-size="28" fill="#0F4E7A" text-anchor="end">${amount.toFixed(2)} บาท</text>
      <line x1="0" y1="45" x2="390" y2="45" stroke="#f1f5f9" stroke-width="2" />
      
      <text x="0" y="75" font-family="'Prompt', sans-serif" font-size="14" fill="#64748b">จาก (From)</text>
      <text x="0" y="100" font-family="'Prompt', sans-serif" font-weight="600" font-size="16" fill="#1e293b">${name}</text>
      
      <text x="0" y="145" font-family="'Prompt', sans-serif" font-size="14" fill="#64748b">ไปยัง (To)</text>
      <text x="0" y="170" font-family="'Prompt', sans-serif" font-weight="600" font-size="16" fill="#1e293b">วิ่งให้ Fun ครั้งที่ 2</text>
      <text x="0" y="195" font-family="'Prompt', sans-serif" font-size="14" fill="#0F4E7A">ธนาคารออมสิน • 020470022508</text>
      <line x1="0" y1="220" x2="390" y2="220" stroke="#f1f5f9" stroke-width="2" />

      <text x="0" y="250" font-family="'Prompt', sans-serif" font-size="13" fill="#64748b">รหัสอ้างอิง:</text>
      <text x="390" y="250" font-family="'Prompt', sans-serif" font-size="13" fill="#475569" text-anchor="end">${refCode}</text>

      <text x="0" y="280" font-family="'Prompt', sans-serif" font-size="13" fill="#64748b">บันทึกช่วยจำ (Note):</text>
      <text x="390" y="280" font-family="'Prompt', sans-serif" font-weight="600" font-size="14" fill="#eb1d74" text-anchor="end">${name} (วิ่งให้ FUN)</text>
    </g>

    <!-- QR Code Mockup -->
    <rect x="175" y="470" width="100" height="100" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" rx="8" />
    <rect x="190" y="485" width="25" height="25" fill="#0F4E7A" />
    <rect x="235" y="485" width="25" height="25" fill="#0F4E7A" />
    <rect x="190" y="530" width="25" height="25" fill="#0F4E7A" />
    <circle cx="247" cy="542" r="10" fill="#EDBA48" />

    <text x="225" y="595" font-family="'Prompt', sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">สแกนตรวจสอบสลิปได้ตามมาตรฐานธนาคาร</text>
  </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
};

export const defaultFormConfig: FormConfig = {
  logoUrl: '/logo.png',
  eventTitle: 'มหกรรมวิ่ง วิทยาลัยชุมชนสงขลา SK-CC วิ่งให้ FUN ประจำปี 2569',
  eventDate: '18 ตุลาคม 2569',
  registrationPeriod: 'สมัครได้ตั้งเเต่วันที่ 23 กันยายน - 10 ตุลาคม 2569',
  pickupInstructions: `รับเสื้อด้วยตนเอง : ท่านสามารถติดต่อรับเสื้อวิ่งได้
ในวันที่ 14 ตุลาคม 2569 ตั้งเเต่เวลา 09:00 - 16:00 น.
ณ อาคารวิทยบริการ ชั้น 2 วิทยาลัยชุมชนสงขลา`,
  prefixes: [
    { id: '1', label: 'นาย' },
    { id: '2', label: 'นาง' },
    { id: '3', label: 'นางสาว' },
    { id: '4', label: 'เด็กชาย' },
    { id: '5', label: 'เด็กหญิง' },
  ],
  applicantTypes: [
    { id: 'type-student', name: 'นักศึกษา', price: 280 },
    { id: 'type-lecturer', name: 'อาจารย์พิเศษ', price: 350 },
    { id: 'type-alumni', name: 'ศิษย์เก่า', price: 280 },
    { id: 'type-public', name: 'ประชาชน', price: 350 },
  ],
  shirtSizes: [
    { id: '1', code: 'SS', label: 'SS (รอบอก 36 ยาว 25)', chest: 36, length: 25 },
    { id: '2', code: 'S', label: 'S (รอบอก 38 ยาว 26)', chest: 38, length: 26 },
    { id: '3', code: 'M', label: 'M (รอบอก 40 ยาว 27)', chest: 40, length: 27 },
    { id: '4', code: 'L', label: 'L (รอบอก 42 ยาว 28)', chest: 42, length: 28 },
    { id: '5', code: 'XL', label: 'XL (รอบอก 44 ยาว 29)', chest: 44, length: 29 },
    { id: '6', code: '2XL', label: '2XL (รอบอก 46 ยาว 30)', chest: 46, length: 30 },
    { id: '7', code: '3XL', label: '3XL (รอบอก 48 ยาว 31)', chest: 48, length: 31 },
    { id: '8', code: '4XL', label: '4XL (รอบอก 50 ยาว 31)', chest: 50, length: 31 },
    { id: '9', code: '5XL', label: '5XL (รอบอก 52 ยาว 31)', chest: 52, length: 31 },
  ],
  shirtImages: [
    {
      id: 'shirt-front',
      title: 'แบบเสื้อวิ่ง 2026 (ด้านหน้า)',
      url: createShirtMockupSvg('front'),
      isPrimary: true,
    },
    {
      id: 'shirt-back',
      title: 'แบบเสื้อวิ่ง 2026 (ด้านหลัง)',
      url: createShirtMockupSvg('back'),
      isPrimary: false,
    },
  ],
  sizeChartImages: [
    {
      id: 'chart-main',
      title: 'ตารางขนาดเสื้อวิ่ง (รอบอกและความยาว)',
      url: createSizeChartSvg(),
      isPrimary: true,
    },
  ],
  deliveryFee: 50,
  bankInfo: {
    bankName: 'ธนาคารออมสิน',
    accountNo: '020470022508',
    accountName: 'วิ่งให้ Fun ครั้งที่ 2',
    note: 'กรุณาระบุ ชื่อ-สกุล ในสลิปการชำระเงิน',
  },
  studentYears: ['67', '68', '69'],
  studentRooms: ['1', '2'],
  studentMajors: [
    'เทคโนโลยีดิจิทัลธุรกิจ',
    'การพัฒนาเด็กปฐมวัย',
    'การปกครองท้องถิ่น',
    'การจัดการ',
    'สาธารณสุขชุมชน',
  ],
  learningLocations: [
    'อำเภอเทพา',
    'อำเภอหาดใหญ่',
    'อำเภอควนเนียง',
    'อำเภอปากพะยูน จังหวัดพัทลุง',
    'อำเภอเมืองพัทลุง จังหวัดพัทลุง',
  ],
};

export const defaultAdminAccounts: AdminAccount[] = [
  {
    id: 'admin-primary',
    username: 'Admin#26',
    password: '#9591',
    role: 'superadmin',
    createdAt: '2026-09-01T08:00:00.000Z',
  },
];

export const initialRegistrations: Registration[] = [
  {
    id: 'SKCC-2026-0004',
    registeredAt: '2026-09-22T07:15:00.000Z',
    prefix: 'นาย',
    fullName: 'สมชาย สงขลาเจริญ',
    phone: '0812345678',
    applicantType: 'ศิษย์เก่า',
    applicantPrice: 280,
    shirtSize: 'L (รอบอก 42 ยาว 28)',
    deliveryType: 'pickup',
    deliveryFee: 0,
    totalAmount: 280,
    slipImage: createSampleSlipSvg('นายสมชาย สงขลาเจริญ', 280, 'GSB-20260922-8812'),
    status: 'ตรวจสอบแล้ว',
    notes: 'ชำระเงินตรงยอด ตรวจสอบสลิปผ่าน',
  },
  {
    id: 'SKCC-2026-0003',
    registeredAt: '2026-09-21T16:40:00.000Z',
    prefix: 'นางสาว',
    fullName: 'พิมพิศา รัตนภูมิ',
    phone: '0897654321',
    applicantType: 'ประชาชน',
    applicantPrice: 350,
    shirtSize: 'M (รอบอก 40 ยาว 27)',
    deliveryType: 'postal',
    deliveryFee: 50,
    address: {
      houseNo: '124/5',
      soi: 'ร่วมใจ',
      road: 'กาญจนวนิช',
      moo: '2',
      village: 'บ้านสวนเกาะยอ',
      subdistrict: 'เขารูปช้าง',
      district: 'เมืองสงขลา',
      province: 'สงขลา',
      postalCode: '90000',
      note: 'โทรแจ้งล่วงหน้าก่อนส่งพัสดุ',
    },
    totalAmount: 400,
    slipImage: createSampleSlipSvg('นางสาวพิมพิศา รัตนภูมิ', 400, 'GSB-20260921-9923'),
    status: 'ยังไม่ตรวจสอบ',
    notes: 'รอเจ้าหน้าที่ยืนยันยอดเงินจัดส่ง',
  },
  {
    id: 'SKCC-2026-0002',
    registeredAt: '2026-09-20T10:15:00.000Z',
    prefix: 'นาย',
    fullName: 'วรวิทย์ บุญญานุวัตร',
    phone: '0865544332',
    applicantType: 'ศิษย์เก่า',
    applicantPrice: 280,
    shirtSize: 'XL (รอบอก 44 ยาว 29)',
    deliveryType: 'postal',
    deliveryFee: 50,
    address: {
      houseNo: '88',
      soi: '-',
      road: 'เพชรเกษม',
      moo: '5',
      village: 'หาดใหญ่ธานี',
      subdistrict: 'คอหงส์',
      district: 'หาดใหญ่',
      province: 'สงขลา',
      postalCode: '90110',
      note: 'ส่งช่วงบ่าย',
    },
    totalAmount: 330,
    slipImage: createSampleSlipSvg('นายวรวิทย์ บุญญานุวัตร', 330, 'GSB-20260920-5511'),
    status: 'ตรวจสอบแล้ว',
    notes: 'ศิษย์เก่ารุ่น 12',
  },
  {
    id: 'SKCC-2026-0001',
    registeredAt: '2026-09-19T09:30:00.000Z',
    prefix: 'นาง',
    fullName: 'กัญญาภัทร จิตต์สุวรรณ',
    phone: '0843219876',
    applicantType: 'ประชาชน',
    applicantPrice: 350,
    shirtSize: 'S (รอบอก 38 ยาว 26)',
    deliveryType: 'pickup',
    deliveryFee: 0,
    totalAmount: 350,
    slipImage: createSampleSlipSvg('นางกัญญาภัทร จิตต์สุวรรณ', 350, 'GSB-20260919-4401'),
    status: 'ตรวจสอบแล้ว',
    notes: 'รับเสื้อด้วยตนเอง',
  },
];
