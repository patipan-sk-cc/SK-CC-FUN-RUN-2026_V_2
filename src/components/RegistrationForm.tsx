import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  FileText,
  User,
  Phone,
  Tag,
  Truck,
  CreditCard,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  XCircle,
  Eye,
  Trash2,
  Copy,
  Check,
  ZoomIn,
  Building,
  MapPin,
  HelpCircle,
  Shirt,
  Calendar,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { AddressInfo, DeliveryType, FormConfig, Registration } from '../types';
import { ImageZoomModal } from './ImageZoomModal';

const STUDENT_YEARS = ['67', '68', '69'];
const STUDENT_ROOMS = ['1', '2'];
const STUDENT_MAJORS = [
  'เทคโนโลยีดิจิทัลธุรกิจ',
  'การพัฒนาเด็กปฐมวัย',
  'การปกครองท้องถิ่น',
  'การจัดการ',
  'สาธารณสุขชุมชน',
];
const LEARNING_LOCATIONS = [
  'อำเภอเทพา',
  'อำเภอหาดใหญ่',
  'อำเภอควนเนียง',
  'อำเภอปากพะยูน จังหวัดพัทลุง',
  'อำเภอเมืองพัทลุง จังหวัดพัทลุง',
];

interface RegistrationFormProps {
  formConfig: FormConfig;
  onSubmitRegistration: (newReg: Omit<Registration, 'id' | 'registeredAt' | 'status'>) => Promise<Registration>;
  onResetToHome?: () => void;
  onNavigateToCheck?: (searchName?: string) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  formConfig,
  onSubmitRegistration,
  onResetToHome,
  onNavigateToCheck,
}) => {
  // Form field states
  const [prefix, setPrefix] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [applicantTypeId, setApplicantTypeId] = useState<string>('');
  
  // Conditional fields for นักศึกษา / อาจารย์พิเศษ
  const [studentYear, setStudentYear] = useState<string>('');
  const [studentRoom, setStudentRoom] = useState<string>('');
  const [studentMajor, setStudentMajor] = useState<string>('');
  const [learningLocation, setLearningLocation] = useState<string>('');

  const [shirtSize, setShirtSize] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup');

  // Address states
  const [address, setAddress] = useState<AddressInfo>({
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
  });

  // Slip image state
  const [slipImage, setSlipImage] = useState<string>('');
  const [slipFileName, setSlipFileName] = useState<string>('');

  // UI / Validation states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [lastSuccessRegistration, setLastSuccessRegistration] = useState<Registration | null>(null);

  // Zoom modal state
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form field options from dynamic formConfig or defaults
  const studentYearsList = formConfig.studentYears && formConfig.studentYears.length > 0 ? formConfig.studentYears : STUDENT_YEARS;
  const studentRoomsList = formConfig.studentRooms && formConfig.studentRooms.length > 0 ? formConfig.studentRooms : STUDENT_ROOMS;
  const studentMajorsList = formConfig.studentMajors && formConfig.studentMajors.length > 0 ? formConfig.studentMajors : STUDENT_MAJORS;
  const learningLocationsList = formConfig.learningLocations && formConfig.learningLocations.length > 0 ? formConfig.learningLocations : LEARNING_LOCATIONS;

  // Selected applicant object and price calculation
  const selectedApplicantType = formConfig.applicantTypes.find((t) => t.id === applicantTypeId);
  const isStudent = selectedApplicantType ? selectedApplicantType.name.includes('นักศึกษา') : false;
  const isLecturer = selectedApplicantType ? selectedApplicantType.name.includes('อาจารย์พิเศษ') : false;
  const ticketPrice = selectedApplicantType ? selectedApplicantType.price : 0;
  const shippingFee = deliveryType === 'postal' ? formConfig.deliveryFee : 0;
  const totalAmount = ticketPrice > 0 ? ticketPrice + shippingFee : 0;

  // Real-time Thai & English letter validation for full name
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow Thai characters, English letters, spaces, and periods
    const cleanVal = val.replace(/[^a-zA-Zก-๙\s\.]/g, '');
    setFullName(cleanVal);
    if (errors.fullName) {
      setErrors((prev) => ({ ...prev, fullName: '' }));
    }
  };

  // Real-time 10-digit phone validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  // Handle address changes
  const handleAddressChange = (field: keyof AddressInfo, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Handle slip upload (image only)
  const handleSlipFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, slipImage: 'กรุณาแนบไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)' }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, slipImage: 'ขนาดไฟล์ภาพต้องไม่เกิน 10MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSlipImage(dataUrl);
      setSlipFileName(file.name);
      setErrors((prev) => ({ ...prev, slipImage: '' }));
    };
    reader.readAsDataURL(file);
  };

  // Copy bank account number
  const handleCopyAccount = () => {
    navigator.clipboard.writeText(formConfig.bankInfo.accountNo);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  // Reset form completely
  const handleResetForm = () => {
    setPrefix('');
    setFullName('');
    setPhone('');
    setApplicantTypeId('');
    setStudentYear('');
    setStudentRoom('');
    setStudentMajor('');
    setLearningLocation('');
    setShirtSize('');
    setDeliveryType('pickup');
    setAddress({
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
    });
    setSlipImage('');
    setSlipFileName('');
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate all 3 parts strictly
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Part 1: General Info
    if (!prefix) newErrors.prefix = 'กรุณาเลือกคำนำหน้า';
    if (!fullName.trim()) {
      newErrors.fullName = 'กรุณาระบุชื่อ-สกุล (ตัวอักษรเท่านั้น)';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'ชื่อ-สกุลต้องมีความยาวอย่างน้อย 3 ตัวอักษร';
    }

    if (!phone) {
      newErrors.phone = 'กรุณาระบุเบอร์ติดต่อ 10 หลัก';
    } else if (phone.length !== 10) {
      newErrors.phone = 'เบอร์ติดต่อต้องมีตัวเลขครบ 10 หลัก (ปัจจุบันมี ' + phone.length + ' หลัก)';
    }

    if (!applicantTypeId) {
      newErrors.applicantType = 'กรุณาเลือกประเภทผู้สมัคร';
    } else {
      if (isStudent) {
        if (!studentYear) newErrors.studentYear = 'กรุณาเลือกรหัสชั้นปี (67, 68, 69)';
        if (!studentRoom) newErrors.studentRoom = 'กรุณาเลือกห้อง (1 หรือ 2)';
        if (!studentMajor) newErrors.studentMajor = 'กรุณาเลือกสาขาวิชา';
        if (!learningLocation) newErrors.learningLocation = 'กรุณาเลือกสถานที่จัดการเรียนการสอน';
      } else if (isLecturer) {
        if (!learningLocation) newErrors.learningLocation = 'กรุณาเลือกสถานที่จัดการเรียนการสอน';
      }
    }

    if (!shirtSize) newErrors.shirtSize = 'กรุณาเลือกขนาดเสื้อ';

    // Part 2: Delivery
    if (deliveryType === 'postal') {
      if (!address.houseNo.trim()) newErrors.houseNo = 'กรุณาระบุบ้านเลขที่';
      if (!address.subdistrict.trim()) newErrors.subdistrict = 'กรุณาระบุตำบล/แขวง';
      if (!address.district.trim()) newErrors.district = 'กรุณาระบุอำเภอ/เขต';
      if (!address.province.trim()) newErrors.province = 'กรุณาระบุจังหวัด';
      if (!address.postalCode.trim()) {
        newErrors.postalCode = 'กรุณาระบุรหัสไปรษณีย์';
      } else if (!/^\d{5}$/.test(address.postalCode.trim())) {
        newErrors.postalCode = 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก';
      }
    }

    // Part 3: Payment
    if (!slipImage) {
      newErrors.slipImage = 'กรุณาแนบไฟล์สลิปหลักฐานการโอนเงิน (ระบุ ชื่อ-สกุล ในสลิป)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorKey = Object.keys(errors)[0];
      const el = document.querySelector(`[data-error-field="${firstErrorKey}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedType = formConfig.applicantTypes.find((t) => t.id === applicantTypeId);
      const newRegistrationData = {
        prefix,
        fullName: fullName.trim(),
        phone: phone.trim(),
        applicantType: selectedType?.name || 'ประชาชน',
        applicantPrice: selectedType?.price || 350,
        studentYear: isStudent ? studentYear : undefined,
        studentRoom: isStudent ? studentRoom : undefined,
        studentMajor: isStudent ? studentMajor : undefined,
        learningLocation: (isStudent || isLecturer) ? learningLocation : undefined,
        shirtSize,
        deliveryType,
        deliveryFee: shippingFee,
        address: deliveryType === 'postal' ? address : undefined,
        totalAmount,
        slipImage,
        notes: `ลงทะเบียนผ่านเว็บไซต์ SK-CC วิ่งให้ FUN 2026`,
      };

      const savedReg = await onSubmitRegistration(newRegistrationData);
      setLastSuccessRegistration(savedReg);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0F4E7A', '#EDBA48', '#ffffff'],
        });
      } catch {
        // ignore confetti errors
      }
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (err.message || 'โปรดลองอีกครั้ง'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Page Title & Theme Header */}
      <div className="text-center mb-8">
        {formConfig.logoUrl !== '' && (
          <div className="flex justify-center mb-3">
            <img
              src={formConfig.logoUrl || '/logo.png'}
              alt="ตราสัญลักษณ์ วิทยาลัยชุมชนสงขลา"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-sm"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F4E7A] tracking-tight leading-snug">
          {formConfig.eventTitle || 'มหกรรมวิ่ง วิทยาลัยชุมชนสงขลา SK-CC วิ่งให้ FUN ประจำปี 2569'}
        </h2>
        <div className="text-lg sm:text-xl font-bold text-[#EDBA48] mt-1">
          {formConfig.eventDate || '18 ตุลาคม 2569'}
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-[#EDBA48]/60 text-[#0F4E7A] text-xs sm:text-sm font-semibold mt-3 shadow-xs">
          <Calendar className="w-4 h-4 text-[#EDBA48]" />
          <span>{formConfig.registrationPeriod || 'สมัครได้ตั้งเเต่วันที่ 23 กันยายน - 10 ตุลาคม 2569'}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl mx-auto">
          กรุณากรอกข้อมูลให้ครบถ้วนทั้ง 3 ส่วน เพื่อความถูกต้องในการจัดเตรียมเสื้อวิ่งและของที่ระลึก
        </p>
      </div>

      {/* Main Multi-Part Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* ========================================================================= */}
        {/* ส่วนที่ 1: ช่องกรอกข้อมูลทั่วไป */}
        {/* ========================================================================= */}
        <section
          id="section-part-1"
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0F4E7A] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                1
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F4E7A]">ส่วนที่ 1: ข้อมูลทั่วไปของผู้สมัคร</h3>
                <p className="text-xs text-slate-500">ข้อมูลส่วนตัวและขนาดเสื้อวิ่ง (บังคับกรอกทุกช่อง)</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 font-medium border border-rose-100">
              * บังคับกรอก
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
            {/* 1. Prefix Dropdown */}
            <div className="sm:col-span-4" data-error-field="prefix">
              <label htmlFor="field-prefix" className="block text-sm font-semibold text-slate-700 mb-1.5">
                คำนำหน้า <span className="text-rose-500">*</span>
              </label>
              <select
                id="field-prefix"
                value={prefix}
                onChange={(e) => {
                  setPrefix(e.target.value);
                  if (errors.prefix) setErrors((prev) => ({ ...prev, prefix: '' }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 transition ${
                  errors.prefix ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <option value="">-- เลือกคำนำหน้า --</option>
                {formConfig.prefixes.map((p) => (
                  <option key={p.id} value={p.label}>
                    {p.label}
                  </option>
                ))}
              </select>
              {errors.prefix && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.prefix}
                </p>
              )}
            </div>

            {/* 2. Full Name (Letters Only) */}
            <div className="sm:col-span-8" data-error-field="fullName">
              <label htmlFor="field-full-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                ชื่อ-สกุล (กรอกตัวอักษรเท่านั้น) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="field-full-name"
                  type="text"
                  value={fullName}
                  onChange={handleFullNameChange}
                  placeholder="เช่น สมชาย ใจดี หรือ Somchai Jaidee"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 transition ${
                    errors.fullName ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 hover:border-slate-400'
                  }`}
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              {errors.fullName ? (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.fullName}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">
                  พิมพ์เฉพาะพยัญชนะไทยหรืออังกฤษ ไม่ใส่ตัวเลขหรือสัญลักษณ์พิเศษ
                </p>
              )}
            </div>

            {/* 3. Phone Number (10 Digits Only) */}
            <div className="sm:col-span-6" data-error-field="phone">
              <label htmlFor="field-phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
                เบอร์ติดต่อ (10 หลักเท่านั้น) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="field-phone"
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="เช่น 0812345678"
                  className={`w-full pl-10 pr-16 py-2.5 rounded-xl border bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 font-mono tracking-wider transition ${
                    errors.phone ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 hover:border-slate-400'
                  }`}
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                  {phone.length}/10
                </span>
              </div>
              {errors.phone && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.phone}
                </p>
              )}
            </div>

            {/* 4. Applicant Type Dropdown */}
            <div className="sm:col-span-6" data-error-field="applicantType">
              <label htmlFor="field-applicant-type" className="block text-sm font-semibold text-slate-700 mb-1.5">
                เลือกประเภทผู้สมัคร <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="field-applicant-type"
                  value={applicantTypeId}
                  onChange={(e) => {
                    setApplicantTypeId(e.target.value);
                    if (errors.applicantType) setErrors((prev) => ({ ...prev, applicantType: '' }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 transition ${
                    errors.applicantType ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <option value="">-- เลือกประเภทผู้สมัคร --</option>
                  {formConfig.applicantTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.price} บาท)
                    </option>
                  ))}
                </select>
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              {errors.applicantType && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.applicantType}
                </p>
              )}
            </div>

            {/* Conditional Fields: สำหรับ "นักศึกษา" */}
            {isStudent && (
              <div className="sm:col-span-12 p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-[#EDBA48]/40 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0F4E7A]">
                  <GraduationCap className="w-5 h-5 text-[#EDBA48]" />
                  <span>ข้อมูลนักศึกษา (บังคับกรอกทุกช่อง)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  {/* ช่องรหัสชั้นปี */}
                  <div className="sm:col-span-3" data-error-field="studentYear">
                    <label htmlFor="field-student-year" className="block text-xs font-semibold text-slate-700 mb-1">
                      รหัสชั้นปี <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="field-student-year"
                      value={studentYear}
                      onChange={(e) => {
                        setStudentYear(e.target.value);
                        if (errors.studentYear) setErrors((prev) => ({ ...prev, studentYear: '' }));
                      }}
                      className={`w-full px-3 py-2 rounded-xl border bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 transition ${
                        errors.studentYear ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    >
                      <option value="">-- เลือกรหัสชั้นปี --</option>
                      {studentYearsList.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                    {errors.studentYear && (
                      <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {errors.studentYear}
                      </p>
                    )}
                  </div>

                  {/* ช่องห้อง */}
                  <div className="sm:col-span-3" data-error-field="studentRoom">
                    <label htmlFor="field-student-room" className="block text-xs font-semibold text-slate-700 mb-1">
                      ห้อง <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="field-student-room"
                      value={studentRoom}
                      onChange={(e) => {
                        setStudentRoom(e.target.value);
                        if (errors.studentRoom) setErrors((prev) => ({ ...prev, studentRoom: '' }));
                      }}
                      className={`w-full px-3 py-2 rounded-xl border bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 transition ${
                        errors.studentRoom ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    >
                      <option value="">-- เลือกห้อง --</option>
                      {studentRoomsList.map((rm) => (
                        <option key={rm} value={rm}>
                          ห้อง {rm}
                        </option>
                      ))}
                    </select>
                    {errors.studentRoom && (
                      <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {errors.studentRoom}
                      </p>
                    )}
                  </div>

                  {/* ช่องสาขา */}
                  <div className="sm:col-span-6" data-error-field="studentMajor">
                    <label htmlFor="field-student-major" className="block text-xs font-semibold text-slate-700 mb-1">
                      สาขา <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="field-student-major"
                      value={studentMajor}
                      onChange={(e) => {
                        setStudentMajor(e.target.value);
                        if (errors.studentMajor) setErrors((prev) => ({ ...prev, studentMajor: '' }));
                      }}
                      className={`w-full px-3 py-2 rounded-xl border bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 transition ${
                        errors.studentMajor ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    >
                      <option value="">-- เลือกสาขาวิชา --</option>
                      {studentMajorsList.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    {errors.studentMajor && (
                      <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {errors.studentMajor}
                      </p>
                    )}
                  </div>

                  {/* ช่องสถานที่จัดการเรียนการสอน */}
                  <div className="sm:col-span-12" data-error-field="learningLocation">
                    <label htmlFor="field-learning-location" className="block text-xs font-semibold text-slate-700 mb-1">
                      สถานที่จัดการเรียนการสอน <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="field-learning-location"
                      value={learningLocation}
                      onChange={(e) => {
                        setLearningLocation(e.target.value);
                        if (errors.learningLocation) setErrors((prev) => ({ ...prev, learningLocation: '' }));
                      }}
                      className={`w-full px-3.5 py-2 rounded-xl border bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 transition ${
                        errors.learningLocation ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    >
                      <option value="">-- เลือกสถานที่จัดการเรียนการสอน --</option>
                      {learningLocationsList.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                    {errors.learningLocation && (
                      <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {errors.learningLocation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Conditional Field: สำหรับ "อาจารย์พิเศษ" */}
            {isLecturer && (
              <div className="sm:col-span-12 p-4 sm:p-5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0F4E7A]">
                  <BookOpen className="w-5 h-5 text-[#EDBA48]" />
                  <span>ข้อมูลอาจารย์พิเศษ (บังคับกรอก)</span>
                </div>

                <div data-error-field="learningLocation">
                  <label htmlFor="field-lecturer-location" className="block text-xs font-semibold text-slate-700 mb-1">
                    สถานที่จัดการเรียนการสอน <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="field-lecturer-location"
                    value={learningLocation}
                    onChange={(e) => {
                      setLearningLocation(e.target.value);
                      if (errors.learningLocation) setErrors((prev) => ({ ...prev, learningLocation: '' }));
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 transition ${
                      errors.learningLocation ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  >
                    <option value="">-- เลือกสถานที่จัดการเรียนการสอน --</option>
                    {learningLocationsList.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  {errors.learningLocation && (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.learningLocation}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 5 & 6. Image Previews: Shirt Design & Size Chart */}
            <div className="sm:col-span-12 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 5. Shirt Design Preview Card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#0F4E7A] flex items-center gap-1.5">
                      <Shirt className="w-4 h-4 text-[#EDBA48]" />
                      5. แบบเสื้อ
                    </span>
                    <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      คลิกเพื่อขยาย
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {formConfig.shirtImages.map((img) => (
                      <div
                        key={img.id}
                        id={`preview-shirt-${img.id}`}
                        onClick={() =>
                          setZoomModal({
                            isOpen: true,
                            imageUrl: img.url,
                            title: img.title,
                            caption: 'แบบเสื้อวิ่งอย่างเป็นทางการ SK-CC FUN RUN 2026',
                          })
                        }
                        className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white aspect-square flex items-center justify-center p-2 hover:border-[#0F4E7A] hover:shadow-md transition"
                      >
                        <img
                          src={img.url}
                          alt={img.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition duration-200"
                        />
                        <div className="absolute inset-0 bg-[#0F4E7A]/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <span className="bg-[#0F4E7A] text-white text-[11px] font-medium px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
                            <ZoomIn className="w-3 h-3" /> ขยาย
                          </span>
                        </div>
                        <span className="absolute bottom-1 left-1 right-1 text-[10px] text-center text-slate-600 bg-white/90 px-1 py-0.5 rounded truncate">
                          {img.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Shirt Size Chart Preview Card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#0F4E7A] flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-[#EDBA48]" />
                      6. ตารางขนาดเสื้อ (รอบอก)
                    </span>
                    <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      คลิกเพื่อขยาย
                    </span>
                  </div>
                  <div className="space-y-2">
                    {formConfig.sizeChartImages.map((chart) => (
                      <div
                        key={chart.id}
                        id={`preview-chart-${chart.id}`}
                        onClick={() =>
                          setZoomModal({
                            isOpen: true,
                            imageUrl: chart.url,
                            title: chart.title,
                            caption: 'ตารางขนาดรอบอกและความยาวเสื้อวิ่งทุกไซส์ (SS - 5XL)',
                          })
                        }
                        className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white aspect-[4/3] flex items-center justify-center p-2 hover:border-[#0F4E7A] hover:shadow-md transition"
                      >
                        <img
                          src={chart.url}
                          alt={chart.title}
                          className="w-full h-full object-contain group-hover:scale-102 transition duration-200"
                        />
                        <div className="absolute inset-0 bg-[#0F4E7A]/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <span className="bg-[#0F4E7A] text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
                            <ZoomIn className="w-3 h-3" /> ขยายดูตารางไซส์
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Shirt Size Dropdown */}
            <div className="sm:col-span-12" data-error-field="shirtSize">
              <label htmlFor="field-shirt-size" className="block text-sm font-semibold text-slate-700 mb-1.5">
                7. เลือกขนาดเสื้อ <span className="text-rose-500">*</span>
              </label>
              <select
                id="field-shirt-size"
                value={shirtSize}
                onChange={(e) => {
                  setShirtSize(e.target.value);
                  if (errors.shirtSize) setErrors((prev) => ({ ...prev, shirtSize: '' }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 font-medium transition ${
                  errors.shirtSize ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <option value="">-- เลือกขนาดเสื้อ (SS - 5XL) --</option>
                {formConfig.shirtSizes.map((size) => (
                  <option key={size.id} value={size.label}>
                    {size.label}
                  </option>
                ))}
              </select>
              {errors.shirtSize && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.shirtSize}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ส่วนที่ 2: การจัดส่ง */}
        {/* ========================================================================= */}
        <section
          id="section-part-2"
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0F4E7A] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                2
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F4E7A]">ส่วนที่ 2: รูปแบบการจัดส่ง</h3>
                <p className="text-xs text-slate-500">รับด้วยตัวเอง หรือ จัดส่งทางไปรษณีย์ (+50 บาท)</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 font-medium border border-rose-100">
              * บังคับเลือก
            </span>
          </div>

          <div className="space-y-4">
            {/* Delivery Option Dropdown */}
            <div>
              <label htmlFor="field-delivery-type" className="block text-sm font-semibold text-slate-700 mb-1.5">
                เลือกรูปแบบการจัดส่ง <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="field-delivery-type"
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 transition"
                >
                  <option value="pickup">รับด้วยตัวเอง ณ วิทยาลัยชุมชนสงขลา (ไม่มีค่าจัดส่ง)</option>
                  <option value="postal">จัดส่งโดยไปรษณีย์ (+50 บาท รวมค่าเสื้อและค่าส่ง)</option>
                </select>
                <Truck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Notification / Prompt for Pickup */}
            {deliveryType === 'pickup' && (
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs sm:text-sm text-sky-900 flex items-start gap-2.5 animate-in fade-in duration-200">
                <Building className="w-5 h-5 text-[#0F4E7A] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sky-900 font-medium whitespace-pre-line leading-relaxed">
                    {formConfig.pickupInstructions ||
                      `รับเสื้อด้วยตนเอง : ท่านสามารถติดต่อรับเสื้อวิ่งได้\nในวันที่ 14 ตุลาคม 2569 ตั้งเเต่เวลา 09:00 - 16:00 น.\nณ อาคารวิทยบริการ ชั้น 2 วิทยาลัยชุมชนสงขลา`}
                  </p>
                </div>
              </div>
            )}

            {/* Detailed Postal Address Fields (Shown only when postal delivery selected) */}
            {deliveryType === 'postal' && (
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-4 bg-slate-50/60 p-5 rounded-xl border animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0F4E7A]">
                  <MapPin className="w-4 h-4 text-[#EDBA48]" />
                  <span>ข้อมูลที่อยู่สำหรับจัดส่งพัสดุ (บังคับกรอกทุกช่อง)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  {/* บ้านเลขที่ */}
                  <div className="sm:col-span-4" data-error-field="houseNo">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      บ้านเลขที่ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="addr-houseNo"
                      type="text"
                      value={address.houseNo}
                      onChange={(e) => handleAddressChange('houseNo', e.target.value)}
                      placeholder="เช่น 123/45"
                      className={`w-full px-3 py-2 rounded-lg border bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 ${
                        errors.houseNo ? 'border-rose-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.houseNo && <p className="text-[11px] text-rose-500 mt-0.5">{errors.houseNo}</p>}
                  </div>

                  {/* ซอย */}
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">ซอย</label>
                    <input
                      id="addr-soi"
                      type="text"
                      value={address.soi}
                      onChange={(e) => handleAddressChange('soi', e.target.value)}
                      placeholder="เช่น ร่วมใจ 3 (ถ้าไม่มีใส่ -)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20"
                    />
                  </div>

                  {/* ถนน */}
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">ถนน</label>
                    <input
                      id="addr-road"
                      type="text"
                      value={address.road}
                      onChange={(e) => handleAddressChange('road', e.target.value)}
                      placeholder="เช่น กาญจนวนิช (ถ้าไม่มีใส่ -)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20"
                    />
                  </div>

                  {/* หมู่ที่ */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">หมู่ที่</label>
                    <input
                      id="addr-moo"
                      type="text"
                      value={address.moo}
                      onChange={(e) => handleAddressChange('moo', e.target.value)}
                      placeholder="เช่น 2 (ถ้าไม่มีใส่ -)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20"
                    />
                  </div>

                  {/* ชื่อหมู่บ้าน */}
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อหมู่บ้าน/อาคาร</label>
                    <input
                      id="addr-village"
                      type="text"
                      value={address.village}
                      onChange={(e) => handleAddressChange('village', e.target.value)}
                      placeholder="เช่น บ้านสวนพฤกษา (ถ้าไม่มีใส่ -)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20"
                    />
                  </div>

                  {/* ตำบล */}
                  <div className="sm:col-span-4" data-error-field="subdistrict">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      ตำบล/แขวง <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="addr-subdistrict"
                      type="text"
                      value={address.subdistrict}
                      onChange={(e) => handleAddressChange('subdistrict', e.target.value)}
                      placeholder="เช่น เขารูปช้าง"
                      className={`w-full px-3 py-2 rounded-lg border bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 ${
                        errors.subdistrict ? 'border-rose-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.subdistrict && <p className="text-[11px] text-rose-500 mt-0.5">{errors.subdistrict}</p>}
                  </div>

                  {/* อำเภอ */}
                  <div className="sm:col-span-4" data-error-field="district">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      อำเภอ/เขต <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="addr-district"
                      type="text"
                      value={address.district}
                      onChange={(e) => handleAddressChange('district', e.target.value)}
                      placeholder="เช่น เมืองสงขลา"
                      className={`w-full px-3 py-2 rounded-lg border bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 ${
                        errors.district ? 'border-rose-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.district && <p className="text-[11px] text-rose-500 mt-0.5">{errors.district}</p>}
                  </div>

                  {/* จังหวัด */}
                  <div className="sm:col-span-4" data-error-field="province">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      จังหวัด <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="addr-province"
                      type="text"
                      value={address.province}
                      onChange={(e) => handleAddressChange('province', e.target.value)}
                      placeholder="เช่น สงขลา"
                      className={`w-full px-3 py-2 rounded-lg border bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 ${
                        errors.province ? 'border-rose-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.province && <p className="text-[11px] text-rose-500 mt-0.5">{errors.province}</p>}
                  </div>

                  {/* รหัสไปรษณีย์ */}
                  <div className="sm:col-span-4" data-error-field="postalCode">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      รหัสไปรษณีย์ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="addr-postalCode"
                      type="text"
                      maxLength={5}
                      value={address.postalCode}
                      onChange={(e) => handleAddressChange('postalCode', e.target.value.replace(/\D/g, ''))}
                      placeholder="เช่น 90000"
                      className={`w-full px-3 py-2 rounded-lg border bg-white text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20 ${
                        errors.postalCode ? 'border-rose-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.postalCode && <p className="text-[11px] text-rose-500 mt-0.5">{errors.postalCode}</p>}
                  </div>

                  {/* หมายเหตุ */}
                  <div className="sm:col-span-12">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">หมายเหตุเพิ่มเติม</label>
                    <input
                      id="addr-note"
                      type="text"
                      value={address.note}
                      onChange={(e) => handleAddressChange('note', e.target.value)}
                      placeholder="เช่น โทรแจ้งล่วงหน้า หรือฝากไว้ที่ป้อม รปภ."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4E7A]/20"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ส่วนที่ 3: ชำระเงิน */}
        {/* ========================================================================= */}
        <section
          id="section-part-3"
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0F4E7A] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                3
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F4E7A]">ส่วนที่ 3: ชำระเงินและแนบหลักฐาน</h3>
                <p className="text-xs text-slate-500">โอนเงินเข้าบัญชีงานวิ่งและแนบสลิปเพื่อยืนยันการสมัคร</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 font-medium border border-rose-100">
              * บังคับแนบสลิป
            </span>
          </div>

          {/* Pricing Calculation Summary Bar */}
          <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs text-slate-500">สรุปยอดชำระเงิน</span>
              <div className="text-xs sm:text-sm text-slate-700">
                ค่าสมัคร ({selectedApplicantType?.name || 'ยังไม่เลือก'}):{' '}
                <span className="font-semibold">{ticketPrice} บาท</span>
                {deliveryType === 'postal' && (
                  <span className="text-amber-700 font-medium"> + ค่าจัดส่งไปรษณีย์ 50 บาท</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">ยอดรวมสุทธิที่ต้องโอน</span>
              <span className="text-2xl sm:text-3xl font-black text-[#0F4E7A]">
                {totalAmount} <span className="text-sm font-normal text-slate-600">บาท</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Bank Transfer Info Card (GSB) */}
            <div className="md:col-span-6 bg-gradient-to-br from-[#eb1d74] to-[#ba1259] text-white p-6 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between">
              {/* Decorative GSB style circle */}
              <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-white text-[#eb1d74] flex items-center justify-center font-bold text-sm shadow-sm">
                      GSB
                    </div>
                    <div>
                      <h4 className="font-bold text-base leading-tight">ธนาคารออมสิน</h4>
                      <p className="text-xs text-pink-100">Government Savings Bank</p>
                    </div>
                  </div>
                  <span className="text-[11px] bg-white/20 px-2.5 py-1 rounded-full text-white font-medium">
                    บัญชีทางการ
                  </span>
                </div>

                <div className="mt-4 space-y-1">
                  <span className="text-xs text-pink-200">เลขที่บัญชี</span>
                  <div className="flex items-center justify-between bg-black/20 p-2.5 rounded-xl border border-white/20">
                    <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-white">
                      020470022508
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="flex items-center gap-1 text-xs bg-white text-[#eb1d74] px-2.5 py-1.5 rounded-lg font-semibold hover:bg-pink-50 transition shadow-xs"
                    >
                      {copiedAccount ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> คัดลอกแล้ว
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> คัดลอกเลข
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-xs text-pink-200">ชื่อบัญชี</span>
                  <p className="text-base font-bold text-white tracking-wide">วิ่งให้ Fun ครั้งที่ 2</p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/20 text-[11px] text-pink-100 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                <span>คำเตือน: กรุณาระบุ <strong>ชื่อ-สกุล ในสลิปการชำระเงิน</strong> ให้ชัดเจน</span>
              </div>
            </div>

            {/* Slip Upload & Attachment Card */}
            <div className="md:col-span-6 flex flex-col justify-between" data-error-field="slipImage">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  แนบส่งหลักฐานการชำระเงิน <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  แนบไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP) • ระบุ ชื่อ-สกุล ในสลิป
                </p>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSlipFileSelect}
                  className="hidden"
                />

                {!slipImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition hover:border-[#0F4E7A] hover:bg-slate-50/80 flex flex-col items-center justify-center min-h-[190px] ${
                      errors.slipImage ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#0F4E7A]/10 text-[#0F4E7A] flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-[#0F4E7A]">
                      คลิกเพื่ออัปโหลดไฟล์รูปสลิป
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      หรือลากไฟล์ภาพมาวางที่นี่ (ขนาดไม่เกิน 10MB)
                    </span>
                  </div>
                ) : (
                  <div className="border rounded-2xl p-4 bg-slate-50 border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="relative w-20 h-24 rounded-lg overflow-hidden border border-slate-300 bg-white shrink-0 group">
                        <img
                          src={slipImage}
                          alt="Slip Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setZoomModal({
                              isOpen: true,
                              imageUrl: slipImage,
                              title: 'สลิปการโอนเงิน',
                              caption: `ไฟล์: ${slipFileName || 'Slip Image'}`,
                            })
                          }
                          className="absolute inset-0 bg-[#0F4E7A]/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mb-0.5">
                          <CheckCircle className="w-3.5 h-3.5" /> แนบสลิปเรียบร้อย
                        </div>
                        <p className="text-xs font-medium text-slate-800 truncate">
                          {slipFileName || 'สลิปโอนเงิน.jpg'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          ตรวจสอบความชัดเจนของยอดเงินและชื่อผู้โอน
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() =>
                              setZoomModal({
                                isOpen: true,
                                imageUrl: slipImage,
                                title: 'สลิปการโอนเงิน',
                                caption: `ไฟล์: ${slipFileName || 'Slip Image'}`,
                              })
                            }
                            className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded text-[#0F4E7A] hover:bg-slate-100 font-medium flex items-center gap-1 transition"
                          >
                            <Eye className="w-3 h-3" /> ดูสลิป
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 font-medium transition"
                          >
                            เปลี่ยนภาพ
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSlipImage('');
                              setSlipFileName('');
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="text-xs px-2.5 py-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded font-medium transition flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> ลบ
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {errors.slipImage && (
                <p className="text-xs text-rose-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.slipImage}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* Action Buttons: สมัคร, ล้างข้อมูล, ยกเลิก */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {/* Button: สมัคร (Submit) */}
          <button
            id="btn-submit-registration"
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto min-w-[200px] px-8 py-3.5 rounded-xl font-bold text-base text-white bg-[#0F4E7A] hover:bg-[#0b3c5e] active:scale-98 shadow-md hover:shadow-lg disabled:opacity-60 transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>กำลังบันทึกข้อมูล...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-[#EDBA48]" />
                <span>สมัครเข้าร่วมกิจกรรม</span>
              </>
            )}
          </button>

          {/* Button: ล้างข้อมูล (Reset/Clear) */}
          <button
            id="btn-clear-registration-form"
            type="button"
            onClick={handleResetForm}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>ล้างข้อมูล</span>
          </button>

          {/* Button: ยกเลิก (Cancel) */}
          <button
            id="btn-cancel-registration"
            type="button"
            onClick={() => {
              if (window.confirm('ท่านต้องการยกเลิกการกรอกข้อมูลและย้อนกลับใช่หรือไม่?')) {
                handleResetForm();
                if (onResetToHome) onResetToHome();
              }
            }}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-rose-500" />
            <span>ยกเลิก</span>
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* Registration Success Confirmation Modal */}
      {/* ========================================================================= */}
      {lastSuccessRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4 shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold text-[#0F4E7A] uppercase tracking-wider">
              ลงทะเบียนสำเร็จ (Registration Complete)
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              SK-CC วิ่งให้ FUN 2026
            </h3>

            {/* Registration ID Badge */}
            <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs text-slate-500 font-medium">รหัสการสมัคร</span>
                <span className="font-mono text-base font-extrabold text-[#0F4E7A]">
                  {lastSuccessRegistration.id}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block">ชื่อ-สกุล</span>
                  <span className="font-medium text-slate-800">
                    {lastSuccessRegistration.prefix} {lastSuccessRegistration.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">เบอร์ติดต่อ</span>
                  <span className="font-mono text-slate-800">{lastSuccessRegistration.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">ขนาดเสื้อ</span>
                  <span className="font-medium text-slate-800">{lastSuccessRegistration.shirtSize}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">การจัดส่ง</span>
                  <span className="font-medium text-slate-800">
                    {lastSuccessRegistration.deliveryType === 'pickup' ? 'รับด้วยตัวเอง' : 'จัดส่งไปรษณีย์'}
                  </span>
                </div>

                {lastSuccessRegistration.studentYear && (
                  <div className="col-span-2 text-slate-700 bg-amber-50/80 p-2 rounded-lg border border-[#EDBA48]/40">
                    <span className="font-semibold text-[#0F4E7A]">ข้อมูลนักศึกษา:</span> รหัส {lastSuccessRegistration.studentYear} ห้อง {lastSuccessRegistration.studentRoom} สาขา {lastSuccessRegistration.studentMajor} ({lastSuccessRegistration.learningLocation})
                  </div>
                )}
                {!lastSuccessRegistration.studentYear && lastSuccessRegistration.learningLocation && (
                  <div className="col-span-2 text-slate-700 bg-sky-50/80 p-2 rounded-lg border border-sky-200">
                    <span className="font-semibold text-[#0F4E7A]">สถานที่จัดการเรียนการสอน:</span> {lastSuccessRegistration.learningLocation}
                  </div>
                )}

                <div className="col-span-2 pt-1 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500">ยอดชำระเงิน</span>
                  <span className="font-bold text-sm text-[#0F4E7A]">
                    {lastSuccessRegistration.totalAmount} บาท (แนบสลิปแล้ว)
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              เจ้าหน้าที่จะตรวจสอบข้อมูลและหลักฐานการโอนเงินของท่าน ท่านสามารถตรวจสอบสถานะการสมัครได้ที่เมนู{' '}
              <strong className="text-[#0F4E7A]">"ตรวจสอบการสมัคร"</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const nameToSearch = lastSuccessRegistration.fullName;
                  setLastSuccessRegistration(null);
                  handleResetForm();
                  if (onNavigateToCheck) onNavigateToCheck(nameToSearch);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#0F4E7A] text-white font-semibold text-sm hover:bg-[#0c3c5e] transition shadow-xs"
              >
                ตรวจสอบสถานะการสมัคร
              </button>
              <button
                type="button"
                onClick={() => {
                  setLastSuccessRegistration(null);
                  handleResetForm();
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition"
              >
                สมัครเพิ่มอีกท่าน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Lightbox Modal */}
      <ImageZoomModal
        isOpen={zoomModal.isOpen}
        imageUrl={zoomModal.imageUrl}
        title={zoomModal.title}
        caption={zoomModal.caption}
        onClose={() => setZoomModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
