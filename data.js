// ข้อมูลเว็บไซต์ ห้องเรียนครูเบ็ญจวรรณ
// สามารถเพิ่ม/แก้ไข/ลบรายการผ่าน "โหมดครูผู้สอน" บนหน้าเว็บได้

window.DEFAULT_CLASSROOM_DATA = {
  profile: {
    name: "นางสาวเบ็ญจวรรณ สิงห์กุล",
    role: "ตำแหน่งครู วิทยฐานะครูชำนาญการ",
    school: "ห้องเรียนภาษาไทย • ปีการศึกษา 2569",
    bio: "ยินดีต้อนรับนักเรียน ผู้ปกครอง และเพื่อนครูทุกท่าน เข้าสู่คลังรวบรวมสื่อการสอน ใบงาน แผนการจัดการเรียนรู้ คลังติวสอบ O-NET และเอกสารสำคัญต่างๆ อย่างเป็นระบบ",
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
    }
  ]
};
