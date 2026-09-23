export type NavigationTab = 'register' | 'check' | 'admin';

export type DeliveryType = 'pickup' | 'postal';

export type VerificationStatus = 'ยังไม่ตรวจสอบ' | 'ตรวจสอบแล้ว';

export interface PrefixOption {
  id: string;
  label: string;
}

export interface ApplicantTypeOption {
  id: string;
  name: string;
  price: number;
}

export interface ShirtSizeOption {
  id: string;
  code: string;
  label: string;
  chest: number;
  length: number;
}

export interface ShirtImage {
  id: string;
  title: string;
  url: string;
  isPrimary?: boolean;
}

export interface AddressInfo {
  houseNo: string;
  soi: string;
  road: string;
  moo: string;
  village: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  note: string;
}

export interface Registration {
  id: string;
  registeredAt: string;
  prefix: string;
  fullName: string;
  phone: string;
  applicantType: string;
  applicantPrice: number;
  studentYear?: string; // '67' | '68' | '69'
  studentRoom?: string; // '1' | '2'
  studentMajor?: string; // 'เทคโนโลยีดิจิทัลธุรกิจ' | 'การพัฒนาเด็กปฐมวัย' | 'การปกครองท้องถิ่น' | 'การจัดการ' | 'สาธารณสุขชุมชน'
  learningLocation?: string; // 'อำเภอเทพา' | 'อำเภอหาดใหญ่' | 'อำเภอควนเนียง' | 'อำเภอปากพะยูน จังหวัดพัทลุง' | 'อำเภอเมืองพัทลุง จังหวัดพัทลุง'
  shirtSize: string;
  deliveryType: DeliveryType;
  deliveryFee: number;
  address?: AddressInfo;
  totalAmount: number;
  slipImage: string; // Base64 data URL or external URL
  status: VerificationStatus;
  notes?: string;
  driveFileUrl?: string;
}

export interface AdminAccount {
  id: string;
  username: string;
  password: string;
  role: 'superadmin' | 'officer';
  createdAt: string;
}

export interface AppsScriptConfig {
  webAppUrl: string;
  lastTestedAt?: string;
  isConnected?: boolean;
  message?: string;
}

export interface FormConfig {
  logoUrl?: string;
  eventTitle: string;
  eventDate: string;
  registrationPeriod: string;
  pickupInstructions: string;
  prefixes: PrefixOption[];
  applicantTypes: ApplicantTypeOption[];
  shirtSizes: ShirtSizeOption[];
  shirtImages: ShirtImage[];
  sizeChartImages: ShirtImage[];
  deliveryFee: number;
  bankInfo: {
    bankName: string;
    accountNo: string;
    accountName: string;
    note: string;
  };
  studentYears?: string[];
  studentRooms?: string[];
  studentMajors?: string[];
  learningLocations?: string[];
}
