// ข้อมูลเริ่มต้นสำหรับเว็บไซต์ ห้องเรียนครูเบ็ญจวรรณ
// สามารถแก้ไขผ่าน "โหมดครูผู้สอน" บนหน้าเว็บ หรือแก้ไขไฟล์นี้โดยตรงได้

window.DEFAULT_CLASSROOM_DATA = {
  profile: {
    name: "ครูเบ็ญจวรรณ",
    role: "ครูผู้สอน / เจ้าของห้องเรียน",
    school: "โรงเรียนตัวอย่างวิทยาคม",
    bio: "ยินดีต้อนรับนักเรียน ผู้ปกครอง และเพื่อนครูทุกท่าน เข้าสู่คลังรวบรวมสื่อการสอน ใบงาน แผนการจัดการเรียนรู้ และเอกสารสำคัญต่างๆ เพื่อการเรียนรู้ที่สะดวกและเป็นระบบ",
    avatarText: "ครูเบ็ญ"
  },

  categories: [
    { id: "lesson-plans", name: "แผนการสอน" },
    { id: "worksheets", name: "ใบงาน / แบบฝึกหัด" },
    { id: "media", name: "สื่อการสอน / วิดีโอ" },
    { id: "exams", name: "ข้อสอบ / O-NET" },
    { id: "documents", name: "เอกสารทั่วไป / แบบฟอร์ม" }
  ],

  announcements: [
    {
      id: "ann-1",
      title: "เปิดคลังติวสอบ O-NET ภาษาไทย ป.6 และ ม.3 ปี 2569 แล้ว!",
      content: "นักเรียนสามารถเข้าฝึกทำข้อสอบออนไลน์ได้ทันทีจากมุม 'เว็บติวสอบ O-NET แนะนำ' หรือในหมวดหมู่ 'ข้อสอบ / O-NET' ครับ",
      date: "2026-11-18"
    },
    {
      id: "ann-2",
      title: "รวมแบบฟอร์มเอกสารราชการและแบบบันทึกคะแนน (ปพ.)",
      content: "จัดเก็บไว้ในหมวดหมู่ 'เอกสารทั่วไป / แบบฟอร์ม' เรียบร้อยแล้ว",
      date: "2026-11-10"
    }
  ],

  resources: [
    {
      id: "onet-p6-2569",
      title: "ติวสอบ O-NET ภาษาไทย ป.6 (ปี 2569)",
      category: "exams",
      type: "onet",
      subject: "ภาษาไทย",
      grade: "ป.6",
      url: "https://kruneungbenchawan.github.io/onet-thai-p6-2569/index.html",
      description: "เว็บไซต์ฝึกทำข้อสอบและทบทวนเนื้อหา O-NET วิชาภาษาไทย ระดับชั้นประถมศึกษาปีที่ 6 ปี 2569",
      date: "2026-11-18",
      pinned: true
    },
    {
      id: "onet-m3-2569",
      title: "ติวสอบ O-NET ภาษาไทย ม.3 (ปี 2569)",
      category: "exams",
      type: "onet",
      subject: "ภาษาไทย",
      grade: "ม.3",
      url: "https://kruneungbenchawan.github.io/onet-thai-m3-2569/",
      description: "เว็บไซต์ฝึกทำข้อสอบและทบทวนเนื้อหา O-NET วิชาภาษาไทย ระดับชั้นมัธยมศึกษาปีที่ 3 ปี 2569",
      date: "2026-11-18",
      pinned: true
    },
    {
      id: "res-1",
      title: "แผนการจัดการเรียนรู้ หน่วยที่ 1 การอ่านจับใจความสำคัญ",
      category: "lesson-plans",
      type: "gdrive",
      subject: "ภาษาไทย",
      grade: "ป.5",
      url: "https://drive.google.com/",
      description: "แผนการสอนฉบับสมบูรณ์ พร้อมจุดประสงค์การเรียนรู้ กิจกรรม และเกณฑ์การวัดผลประเมินผล",
      date: "2026-11-18",
      pinned: false
    },
    {
      id: "res-2",
      title: "ใบงานที่ 1 เรื่อง การวิเคราะห์โครงสร้างประโยค",
      category: "worksheets",
      type: "pdf",
      subject: "ภาษาไทย",
      grade: "ป.5",
      url: "https://drive.google.com/",
      description: "ไฟล์ PDF พร้อมพิมพ์สำหรับแจกนักเรียน ประกอบด้วยแบบฝึกหัด 2 หน้าและเฉลยท้ายเล่ม",
      date: "2026-11-15",
      pinned: false
    },
    {
      id: "res-3",
      title: "สไลด์ประกอบการสอน (Canva) — เทคนิคการเขียนสรุปความ",
      category: "media",
      type: "canva",
      subject: "ภาษาไทย",
      grade: "ป.6",
      url: "https://www.canva.com/",
      description: "สไลด์สีสันสดใส พร้อมตัวอย่างประกอบเข้าใจง่าย ใช้สอนผ่านโปรเจกเตอร์หรือออนไลน์",
      date: "2026-11-12",
      pinned: false
    },
    {
      id: "res-4",
      title: "วิดีโอทบทวนบทเรียน: คำราชาศัพท์น่ารู้",
      category: "media",
      type: "video",
      subject: "ภาษาไทย",
      grade: "ป.6",
      url: "https://www.youtube.com/",
      description: "คลิปวิดีโอสรุปเนื้อหาสั้นๆ 10 นาที สำหรับให้นักเรียนทบทวนก่อนสอบ",
      date: "2026-11-08",
      pinned: false
    },
    {
      id: "res-5",
      title: "แบบทดสอบก่อนเรียน-หลังเรียน หน่วยที่ 1 (Google Forms)",
      category: "exams",
      type: "link",
      subject: "ภาษาไทย",
      grade: "ป.5",
      url: "https://docs.google.com/forms/",
      description: "ข้อสอบปรนัย 20 ข้อ พร้อมระบบตรวจคำตอบอัตโนมัติ",
      date: "2026-11-05",
      pinned: false
    },
    {
      id: "res-6",
      title: "แบบฟอร์มบันทึกเวลาเรียนและคะแนนเก็บ (ปพ.5)",
      category: "documents",
      type: "sheet",
      subject: "งานวัดผลและเอกสาร",
      grade: "ครูและบุคลากร",
      url: "https://docs.google.com/spreadsheets/",
      description: "เทมเพลต Google Sheets คำนวณคะแนนเก็บและเกรดเฉลี่ยอัตโนมัติ",
      date: "2026-11-01",
      pinned: false
    }
  ]
};
