// ข้อมูลเว็บไซต์ ห้องเรียนครูเบ็ญจวรรณ
// รวมสื่อและเอกสารครบชุดจากโฟลเดอร์ ติวภาษาไทย ป.6 และ ม.3 (O-NET 2569)

window.DEFAULT_CLASSROOM_DATA = {
  profile: {
    name: "นางสาวเบ็ญจวรรณ สิงห์กุล",
    role: "ตำแหน่งครู วิทยฐานะครูชำนาญการ",
    school: "โรงเรียนวัดราษฎร์บำรุง สพป.สระบุรี เขต 2 • ปีการศึกษา 2569",
    bio: "ยินดีต้อนรับนักเรียน ผู้ปกครอง และเพื่อนครูทุกท่าน เข้าสู่คลังรวบรวมสื่อการสอน ใบงาน สรุปเนื้อหา คลังติวสอบ O-NET ป.6 และ ม.3 และเอกสารสำคัญต่างๆ อย่างเป็นระบบ",
    avatarText: "ครูเบ็ญ"
  },

  categories: [
    { id: "lesson-plans", name: "แผน / สรุปเนื้อหา" },
    { id: "worksheets", name: "ใบงาน / แบบฝึกหัด" },
    { id: "media", name: "สไลด์ / สื่อภาพ" },
    { id: "games", name: "เกมการเรียนรู้" },
    { id: "exams", name: "ข้อสอบ / O-NET" },
    { id: "documents", name: "เอกสาร PDF / ทั่วไป" }
  ],

  announcements: [
    {
      id: "ann-1",
      title: "รวมชุดติวเข้ม O-NET ภาษาไทย ป.6 และ ม.3 ปี 2569 ครบทุกหมวดแล้ว!",
      content: "มีทั้งเว็บติวสอบออนไลน์, สไลด์สอนขึ้นจอ, PowerPoint, สมุดโน้ตภาพพาสเทล, ใบงานพาร์ทเขียน, ข้อสอบจำลอง และเฉลยละเอียดครบทั้ง ป.6 และ ม.3",
      date: "2026-11-18"
    }
  ],

  resources: [
    // --- เกมการเรียนรู้ ---
    {
      id: "game-kham-khlong-chong",
      title: "เกมคำคล้องจองหรรษา (บทเรียน + สื่อบัตรคำ + ใบงาน + 3 เกม)",
      category: "games",
      type: "onet",
      subject: "ภาษาไทย",
      grade: "ประถมศึกษา",
      year: "2569",
      url: "kham-khlong-chong/index.html",
      description: "บทเรียนสำเร็จรูปและเกมฝึกทักษะเรื่อง คำคล้องจอง ครบ 4 บทเรียน พร้อมเกมหรรษา 3 เกม เสียงอ่านภาษาไทย และเกียรติบัตร",
      date: "2026-11-18",
      pinned: true
    },

    {
      id: "history-smart-class",
      title: "History Smart Class: เว็บแอปสื่อการสอนประวัติศาสตร์ ม.1–ม.3 (ครบ 15 หน่วย)",
      category: "lesson-plans",
      type: "onet",
      subject: "ประวัติศาสตร์",
      grade: "ม.1–ม.3",
      year: "2569",
      url: "history-m1-m3/index.html",
      description: "เว็บแอปสื่อการสอนประวัติศาสตร์ ม.1–ม.3 อ้างอิงหนังสือเรียน พว. ครบ 15 หน่วย (สไลด์, ใบงานโต้ตอบ, คลังข้อสอบ และโหมดครู)",
      date: "2026-11-18",
      pinned: true
    },
    {
      id: "history-index-75",
      title: "สารบัญสื่อการสอนประวัติศาสตร์ ม.1–ม.3 (รวม 75 ไฟล์: PPTX, DOCX, HTML)",
      category: "documents",
      type: "link",
      subject: "ประวัติศาสตร์",
      grade: "ม.1–ม.3",
      year: "2569",
      url: "history-m1-m3/สารบัญสื่อการสอน_ประวัติศาสตร์_ม1-ม3.html",
      description: "หน้ารวมลิงก์ดาวน์โหลดสไลด์ Interactive, ใบงาน A4 พร้อมเฉลย, PowerPoint (.pptx) และ Word (.docx) ครบทั้ง 15 หน่วย",
      date: "2026-11-18",
      pinned: true
    },

    // --- ป.6 (onet-thai-p6-2569) ---
    {
      id: "onet-p6-2569",
      title: "เว็บติวสอบ O-NET ภาษาไทย ป.6 (ปี 2569) — หน้าหลักรวมชุดติว",
      category: "exams",
      type: "onet",
      subject: "ภาษาไทย",
      grade: "ป.6",
      year: "2569",
      url: "onet-thai-p6-2569/index.html",
      description: "ศูนย์รวมสื่อติว O-NET ภาษาไทย ป.6 ปี 69 ครบชุด (สไลด์, สมุดโน้ตภาพ, ข้อสอบจำลอง, เฉลย และใบงาน)",
      date: "2026-11-18",
      pinned: true
    },
    {
      id: "onet-m3-2569",
      title: "เว็บติวสอบ O-NET ภาษาไทย ม.3 (ปี 2569) — หน้าหลักรวมชุดติว",
      category: "exams",
      type: "onet",
      subject: "ภาษาไทย",
      grade: "ม.3",
      year: "2569",
      url: "onet-thai-m3-2569/index.html",
      description: "ศูนย์รวมสื่อติว O-NET ภาษาไทย ม.3 ปี 69 ครบชุด (สไลด์, PowerPoint, สมุดโน้ตภาพ, ข้อสอบจำลอง และใบงาน)",
      date: "2026-11-18",
      pinned: true
    },
    {
      id: "p6-summary-doc",
      title: "สรุปเนื้อหาและเทคนิคพิชิต O-NET ภาษาไทย ป.6 ปี 69",
      category: "lesson-plans",
      type: "doc",
      subject: "ภาษาไทย",
      grade: "ป.6",
      year: "2569",
      url: "onet-thai-p6-2569/1_สรุปเนื้อหาและเทคนิคพิชิต_ONET_ภาษาไทย_ป6_ปี69.docx",
      description: "เอกสาร Word (.docx) สรุปเนื้อหาสำคัญและเทคนิคการทำข้อสอบ O-NET ภาษาไทย ป.6",
      date: "2026-11-18",
      pinned: false
    },
    {
      id: "p6-mock-exam",
      title: "ชุดข้อสอบจำลอง O-NET ภาษาไทย ป.6 ปี 69 (22 ข้อ 100 คะแนน)",
      category: "exams",
      type: "doc",
      subject: "ภาษาไทย",
      grade: "ป.6",
      year: "2569",
      url: "onet-thai-p6-2569/2_ชุดข้อสอบจำลอง_ONET_ภาษาไทย_ป6_ปี69_22ข้อ_100คะแนน.docx",
      description: "ไฟล์ข้อสอบจำลอง (.docx) จำนวน 22 ข้อ คะแนนเต็ม 100 คะแนน พร้อมพิมพ์ใช้งาน",
      date: "2026-11-18",
      pinned: false
    },
    {
      id: "p6-answer-key",
      title: "เฉลยละเอียดและเกณฑ์การให้คะแนน O-NET ภาษาไทย ป.6 ปี 69",
      category: "exams",
      type: "doc",
      subject: "ภาษาไทย",
      grade: "ป.6",
      year: "2569",
      url: "onet-thai-p6-2569/3_เฉลยละเอียดและเกณฑ์การให้คะแนน_ONET_ภาษาไทย_ป6_ปี69.docx",
      description: "เอกสารเฉลยคำตอบอย่างละเอียด พร้อมเกณฑ์การให้คะแนนพาร์ทเขียน (.docx)",
      date: "2026-11-18",
      pinned: false
    },
    {
      id: "p6-writing-worksheet",
      title: "ใบงานฝึกทักษะพาร์ทเขียน ป.6: เรียงลำดับและย่อความ (พร้อมเฉลย)",
      category: "worksheets",
      type: "doc",
      subject: "ภาษาไทย",
      grade: "ป.6",
      year: "2569",
      url: "onet-thai-p6-2569/4_ใบงานฝึกทักษะพาร์ทเขียน_เรียงลำดับและย่อความ_พร้อมเฉลย.docx",
      description: "ใบงานฝึกเขียนเรียงลำดับเหตุการณ์และย่อความสำหรับเตรียมสอบ O-NET ป.6 พร้อมเฉลย",
      date: "2026-11-18",
      pinned: false
    },
    {
      id: "p6-slide-html",
      title: "สไลด์นำเสนอสอนขึ้นจอ: ติวเข้ม O-NET ภาษาไทย ป.6 ปี 69",
      category: "media",
      type: "canva",
      subject: "ภาษาไทย",
      grade: "ป.6",
      year: "2569",
      url: "onet-thai-p6-2569/5_สไลด์นำเสนอสอนขึ้นจอ_ติวเข้ม_ONET_ภาษาไทย_ป6_ปี69.html",
      description: "สไลด์ HTML แบบโต้ตอบสำหรับเปิดสอนขึ้นจอในห้องเรียน ป.6 ภาพสวยชัดเจน",
      date: "2026-11-18",
      pinned: true
    },
    {
      id: "p6-notebook-html",
      title: "สมุดโน้ตภาพสีพาสเทล: สรุปและตะลุยด่าน O-NET ภาษาไทย ป.6 ปี 69",
      category: "media",
      type: "canva",
      subject: "ภาษาไทย",
      grade: "ป.6",
      year: "2569",
      url: "onet-thai-p6-2569/6_สมุดโน้ตภาพสีพาสเทล_สรุปและตะลุยด่าน_ONET_ภาษาไทย_ป6_ปี69.html",
      description: "สมุดโน้ตภาพสีพาสเทลสุดน่ารัก สรุปเนื้อหาและตะลุยด่านฝึกคิด ป.6",
      date: "2026-11-18",
      pinned: true
    },
    {
      id: "p6-blueprint-pdf",
      title: "เอกสาร Test Blueprint O-NET ภาษาไทย ป.6 ปี 69 (TB_61ThP6)",
      category: "documents",
      type: "pdf",
      subject: "ภาษาไทย",
      grade: "ป.6",
      year: "2569",
      url: "onet-thai-p6-2569/TB_61ThP6%20O_NET69.pdf",
      description: "ไฟล์ PDF ผังการสร้างข้อสอบ O-NET ภาษาไทย ป.6 ปีการศึกษา 2569",
      date: "2026-11-18",
      pinned: false
    },

    // --- ม.3 (onet-thai-m3-2569) ---
    {
      id: "m3-summary-doc",
      title: "สรุปเนื้อหาและเทคนิคพิชิต O-NET ภาษาไทย ม.3 ปี 69",
      category: "lesson-plans",
      type: "doc",
      subject: "ภาษาไทย",
      grade: "ม.3",
      year: "2569",
      url: "onet-thai-m3-2569/1_สรุปเนื้อหาและเทคนิคพิชิต_ONET_ภาษาไทย_ม3_ปี69.docx",
      description: "เอกสาร Word (.docx) สรุปเนื้อหาสำคัญและเทคนิคการทำข้อสอบ O-NET ภาษาไทย ม.3",
      date: "2026-11-18",
      pinned: false
    },
    {
      id: "m3-mock-exam",
      title: "ชุดข้อสอบจำลอง O-NET ภาษาไทย ม.3 ปี 69 (30 ข้อ 100 คะแนน)",
      category: "exams",
      type: "doc",
      subject: "ภาษาไทย",
      grade: "ม.3",
      year: "2569",
      url: "onet-thai-m3-2569/2_ชุดข้อสอบจำลอง_ONET_ภาษาไทย_ม3_ปี69_30ข้อ_100คะแนน.docx",
      description: "ไฟล์ข้อสอบจำลอง (.docx) จำนวน 30 ข้อ คะแนนเต็ม 100 คะแนน สำหรับระดับชั้น ม.3",
      date: "2026-11-18",
      pinned: false
    },
    {
      id: "m3-answer-key",
      title: "เฉลยละเอียดและเกณฑ์การให้คะแนน O-NET ภาษาไทย ม.3 ปี 69",
      category: "exams",
      type: "doc",
      subject: "ภาษาไทย",
      grade: "ม.3",
      year: "2569",
      url: "onet-thai-m3-2569/3_เฉลยละเอียดและเกณฑ์การให้คะแนน_ONET_ภาษาไทย_ม3_ปี69.docx",
      description: "เอกสารเฉลยคำตอบอย่างละเอียด พร้อมเกณฑ์การให้คะแนนพาร์ทเขียน ม.3 (.docx)",
      date: "2026-11-18",
      pinned: false
    },
    {
      id: "m3-writing-worksheet",
      title: "ใบงานฝึกทักษะพาร์ทเขียน ม.3: ผสมผสาน 30 คะแนน (พร้อมเฉลย)",
      category: "worksheets",
      type: "doc",
      subject: "ภาษาไทย",
      grade: "ม.3",
      year: "2569",
      url: "onet-thai-m3-2569/4_ใบงานฝึกทักษะพาร์ทเขียน_ผสมผสาน30คะแนน_พร้อมเฉลย.docx",
      description: "ใบงานฝึกทักษะการเขียนแบบผสมผสาน 30 คะแนน สำหรับเตรียมสอบ O-NET ม.3 พร้อมเฉลย",
      date: "2026-11-18",
      pinned: false
    },
    {
      id: "m3-slide-html",
      title: "สไลด์นำเสนอสอนขึ้นจอ: ติวเข้ม O-NET ภาษาไทย ม.3 ปี 69",
      category: "media",
      type: "canva",
      subject: "ภาษาไทย",
      grade: "ม.3",
      year: "2569",
      url: "onet-thai-m3-2569/5_สไลด์นำเสนอสอนขึ้นจอ_ติวเข้ม_ONET_ภาษาไทย_ม3_ปี69.html",
      description: "สไลด์ HTML แบบโต้ตอบสำหรับเปิดสอนขึ้นจอในห้องเรียน ม.3",
      date: "2026-11-18",
      pinned: true
    },
    {
      id: "m3-notebook-html",
      title: "สมุดโน้ตภาพสีพาสเทล: สรุปและตะลุยด่าน O-NET ภาษาไทย ม.3 ปี 69",
      category: "media",
      type: "canva",
      subject: "ภาษาไทย",
      grade: "ม.3",
      year: "2569",
      url: "onet-thai-m3-2569/6_สมุดโน้ตภาพสีพาสเทล_สรุปและตะลุยด่าน_ONET_ภาษาไทย_ม3_ปี69.html",
      description: "สมุดโน้ตภาพสีพาสเทลสุดน่ารัก สรุปเนื้อหาและตะลุยด่านฝึกคิด ม.3",
      date: "2026-11-18",
      pinned: true
    },
    {
      id: "m3-pptx-slide",
      title: "ไฟล์ PowerPoint: สไลด์ติวเข้ม O-NET ภาษาไทย ม.3 ปี 69 (.pptx)",
      category: "media",
      type: "canva",
      subject: "ภาษาไทย",
      grade: "ม.3",
      year: "2569",
      url: "onet-thai-m3-2569/7_สไลด์ติวเข้ม_ONET_ภาษาไทย_ม3_ปี69.pptx",
      description: "ไฟล์ PowerPoint (.pptx) สำหรับดาวน์โหลดไปเปิดสอนหรือแก้ไขเพิ่มเติม",
      date: "2026-11-18",
      pinned: false
    },
    {
      id: "m3-blueprint-pdf",
      title: "เอกสาร Test Blueprint O-NET ภาษาไทย ม.3 ปี 69 (TB_91ThM3)",
      category: "documents",
      type: "pdf",
      subject: "ภาษาไทย",
      grade: "ม.3",
      year: "2569",
      url: "onet-thai-m3-2569/TB_91ThM3%20O_NET69.pdf",
      description: "ไฟล์ PDF ผังการสร้างข้อสอบ O-NET ภาษาไทย ม.3 ปีการศึกษา 2569",
      date: "2026-11-18",
      pinned: false
    }
  ]
};
