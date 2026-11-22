import type { GrammarQuestionItem } from "../readingGrammarDataset";
import type { ReadingQuestion } from "../../types/toeic";

// ============================================================================
// PART 5: GRAMMAR & VOCABULARY QUESTIONS (ETS 2026)
// ============================================================================
export const ETS_2026_PART5_GRAMMAR_QUESTIONS: GrammarQuestionItem[] = [
  // 1. TỪ LOẠI - DANH TỪ & VỊ TRÍ DANH TỪ
  {
    id: "e26-r-p5-101",
    subtopicId: "position",
    subtopicName: "Vị trí của danh từ",
    questionText: "The human resources director announced the ------- of Ms. Elena Vargas as the new senior project coordinator.",
    options: [
      "(A) appoint",
      "(B) appointment",
      "(C) appointed",
      "(D) appointable",
    ],
    correctIndex: 1,
    explanation: "Sau mạo từ 'the' và trước giới từ 'of', vị trí này bắt buộc phải là một Danh từ (Noun) làm tân ngữ. 'Appointment' (sự bổ nhiệm) có đuôi danh từ '-ment' là đáp án chính xác.",
    grammarRule: "Cấu trúc cụm danh từ: The + [Noun] + of + Noun phrase. Hậu tố danh từ phổ biến: -ment, -tion, -sion, -ance, -ence, -ity.",
    translationVi: "Giám đốc nhân sự đã thông báo việc bổ nhiệm bà Elena Vargas làm điều phối viên dự án cấp cao mới.",
    vocab: [
      {
        word: "appointment",
        pos: "n",
        phonetic: "/əˈpɔɪntmənt/",
        meaningVi: "sự bổ nhiệm (chức vụ), cuộc hẹn",
      },
      {
        word: "coordinator",
        pos: "n",
        phonetic: "/koʊˈɔːrdɪneɪtər/",
        meaningVi: "người điều phối dự án",
      },
    ],
  },

  // 2. TỪ LOẠI - TÍNH TỪ ĐỨNG TRƯỚC DANH TỪ
  {
    id: "e26-r-p5-102",
    subtopicId: "mixed",
    subtopicName: "Tính từ bổ nghĩa",
    questionText: "Before signing the lease, tenants are advised to read the contract terms ------- to avoid unexpected fees.",
    options: [
      "(A) thorough",
      "(B) thoroughly",
      "(C) thoroughness",
      "(D) more thorough",
    ],
    correctIndex: 1,
    explanation: "Động từ 'read' cần một Trạng từ (Adverb) đi kèm để bổ nghĩa cho hành động 'đọc kỹ lưỡng'. 'Thoroughly' (một cách cẩn thận, tường tận) là trạng từ có đuôi '-ly' chính xác.",
    grammarRule: "Cấu trúc bổ nghĩa động từ: Verb + Object + [Adverb of Manner]. Trạng từ chỉ cách thức bổ nghĩa cho động từ hành động.",
    translationVi: "Trước khi ký hợp đồng thuê, người thuê nhà được khuyên nên đọc kỹ lưỡng các điều khoản hợp đồng để tránh các khoản phí phát sinh ngoài ý muốn.",
    vocab: [
      {
        word: "thoroughly",
        pos: "adv",
        phonetic: "/ˈθɜːrəli/",
        meaningVi: "một cách kỹ lưỡng, cẩn trọng",
      },
      {
        word: "lease",
        pos: "n",
        phonetic: "/liːs/",
        meaningVi: "hợp đồng cho thuê (nhà, văn phòng)",
      },
    ],
  },

  // 3. ĐỘNG TỪ & THÌ - HIỆN TẠI HOÀN THÀNH VỚI 'SINCE'
  {
    id: "e26-r-p5-103",
    subtopicId: "mixed",
    subtopicName: "Thì Hiện tại hoàn thành",
    questionText: "Ever since the new digital checkout kiosks were installed, customer waiting times ------- significantly.",
    options: [
      "(A) decrease",
      "(B) decreased",
      "(C) have decreased",
      "(D) will decrease",
    ],
    correctIndex: 2,
    explanation: "Mệnh đề bắt đầu bằng 'Since / Ever since' (kể từ khi) đi kèm mốc thời gian trong quá khứ thì mệnh đề chính phải chia ở thì Hiện tại hoàn thành (Present Perfect: have/has + V3/ed). Chủ ngữ 'waiting times' là số nhiều -> 'have decreased'.",
    grammarRule: "Công thức: Since / Ever since + S + V-quá khứ đơn, S + have/has + V3/ed.",
    translationVi: "Kể từ khi các quầy thanh toán kỹ thuật số mới được lắp đặt, thời gian chờ đợi của khách hàng đã giảm đi đáng kể.",
    vocab: [
      {
        word: "significantly",
        pos: "adv",
        phonetic: "/sɪɡˈnɪfɪkəntli/",
        meaningVi: "đáng kể, rõ rệt",
      },
      {
        word: "kiosk",
        pos: "n",
        phonetic: "/ˈkiːɑːsk/",
        meaningVi: "quầy thông tin / thanh toán tự động",
      },
    ],
  },

  // 4. BỊ ĐỘNG - PASSIVE VOICE
  {
    id: "e26-r-p5-104",
    subtopicId: "mixed",
    subtopicName: "Thể bị động",
    questionText: "All employees who wish to enroll in the advanced data science seminar must be ------- by their department head.",
    options: [
      "(A) approve",
      "(B) approving",
      "(C) approved",
      "(D) approval",
    ],
    correctIndex: 2,
    explanation: "Sau động từ khuyết thiếu bị động 'must be' là quá khứ phân từ V3/ed ('approved'). Dấu hiệu đi kèm: 'by their department head' (bởi trưởng bộ phận của họ).",
    grammarRule: "Thể bị động với động từ khuyết thiếu: Modal Verb + be + V3/ed (+ by O).",
    translationVi: "Tất cả nhân viên muốn đăng ký tham gia hội thảo khoa học dữ liệu nâng cao phải được trưởng bộ phận của họ phê duyệt.",
    vocab: [
      {
        word: "enroll",
        pos: "v",
        phonetic: "/ɪnˈroʊl/",
        meaningVi: "ghi danh, đăng ký học",
      },
      {
        word: "approve",
        pos: "v",
        phonetic: "/əˈpruːv/",
        meaningVi: "tán thành, phê duyệt",
      },
    ],
  },

  // 5. LIÊN TỪ & GIỚI TỪ (CONJUNCTIONS & PREPOSITIONS)
  {
    id: "e26-r-p5-105",
    subtopicId: "mixed",
    subtopicName: "Giới từ và Liên từ chỉ sự nhượng bộ",
    questionText: "------- severe weather conditions caused flight delays, the delegates arrived in time for the opening keynote address.",
    options: [
      "(A) Although",
      "(B) Despite",
      "(C) Because of",
      "(D) In spite of",
    ],
    correctIndex: 0,
    explanation: "Phía sau chỗ trống là một mệnh đề hoàn chỉnh có đầy đủ Chủ ngữ ('severe weather conditions') và Động từ chính ('caused'). Do đó ta phải dùng Liên từ 'Although' (Mặc dù). 'Despite' và 'In spite of' chỉ đi với Cụm danh từ / V-ing.",
    grammarRule: "Phân biệt: Although / Even though / Though + Clause (S + V) >< Despite / In spite of + Noun Phrase / V-ing.",
    translationVi: "Mặc dù điều kiện thời tiết khắc nghiệt gây ra tình trạng chậm chuyến bay, các đại biểu vẫn đến kịp giờ dự bài phát biểu khai mạc.",
    vocab: [
      {
        word: "delegate",
        pos: "n",
        phonetic: "/ˈdelɪɡət/",
        meaningVi: "đại biểu tham dự hội nghị",
      },
      {
        word: "keynote address",
        pos: "n",
        phonetic: "/ˈkiːnoʊt əˈdres/",
        meaningVi: "bài diễn văn khai mạc chủ chốt",
      },
    ],
  },

  // 6. TỪ VỰNG TOEIC KINH ĐIỂN - COLLOCATION
  {
    id: "e26-r-p5-106",
    subtopicId: "mixed",
    subtopicName: "Cụm từ cố định (Collocations)",
    questionText: "The manufacturing facility complies strictly with all environmental regulations to ------- harmful emissions.",
    options: [
      "(A) minimize",
      "(B) refuse",
      "(C) predict",
      "(D) celebrate",
    ],
    correctIndex: 0,
    explanation: "Xét về nghĩa trong ngữ cảnh công nghiệp và môi trường: 'comply with regulations' (tuân thủ quy định) nhằm 'minimize harmful emissions' (giảm thiểu khí thải độc hại).",
    grammarRule: "Collocation công nghiệp: to minimize emissions / waste / costs (giảm thiểu khí thải / chất thải / chi phí).",
    translationVi: "Cơ sở sản xuất tuân thủ nghiêm ngặt mọi quy định về môi trường nhằm giảm thiểu lượng khí thải độc hại.",
    vocab: [
      {
        word: "emission",
        pos: "n",
        phonetic: "/ɪˈmɪʃn/",
        meaningVi: "khí thải, sự phát thải",
      },
      {
        word: "comply",
        pos: "v",
        phonetic: "/kəmˈplaɪ/",
        meaningVi: "tuân theo, phục tùng (đi với giới từ with)",
      },
    ],
  },
];

// ============================================================================
// PART 6 & 7: READING COMPREHENSION SETS (ETS 2026)
// ============================================================================
export const ETS_2026_READING_QUESTIONS: ReadingQuestion[] = [
  // PART 6: TEXT COMPLETION (EMAIL DOAN VAN)
  {
    id: "e26-r-p6-131",
    part: 6,
    level: 5,
    topic: "Quản lý logistics & kho bãi",
    passageTitle: "Warehouse Management System Upgrade",
    passageText: `To: All Branch Managers
From: Karen Vance, Chief Logistics Officer
Subject: Warehouse Management System Upgrade
Date: October 14

Dear Team,
We are pleased to announce that our company will transition to the next-generation InventoryPro 4.0 software over the upcoming weekend. The implementation process [131: -------] on Friday at 8:00 PM and will conclude by Sunday afternoon. During this maintenance window, access to the current inventory database will be suspended.

Please instruct your warehouse staff to finalize all urgent shipping manifests beforehand. We appreciate your patience and cooperation as we modernize our logistics infrastructure.`,
    questionText: "Select the option that best completes blank [131].",
    options: [
      "will commence",
      "commenced",
      "has commenced",
      "was commencing",
    ],
    correctIndex: 0,
    grammarPoint: "Thì Tương lai đơn cho kế hoạch sắp tới",
    explanationVi: "Mốc thời gian 'over the upcoming weekend' (trong kỳ nghỉ cuối tuần sắp tới) và 'on Friday at 8:00 PM' chỉ hành động sẽ xảy ra trong tương lai. Ta dùng thì Tương lai đơn 'will commence' (sẽ bắt đầu).",
  },
  {
    id: "e26-r-p6-132",
    part: 6,
    level: 6,
    topic: "Quản lý logistics & kho bãi",
    passageTitle: "Warehouse Management System Upgrade (Cont.)",
    passageText: `(Tiếp nối thông báo nâng cấp InventoryPro 4.0 bên trên)
[132: -------]. Comprehensive online training webinars will be held starting next Tuesday to familiarize everyone with the new dashboard features.`,
    questionText: "Select the sentence that best fits blank [132].",
    options: [
      "We expect this upgrade to enhance our tracking accuracy by forty percent.",
      "Unfortunately, several cargo planes were delayed due to heavy fog.",
      "Our corporate headquarters will be closed for a national holiday.",
      "The annual sales banquet has been rescheduled for late November.",
    ],
    correctIndex: 0,
    grammarPoint: "Chọn câu liên kết ngữ cảnh đoạn văn",
    explanationVi: "Chọn câu liên kết ý hợp lý nhất: Câu trước nói về việc nâng cấp phần mềm kho bãi và câu sau nói về lịch tập huấn, nên câu hợp lý nhất là nói về lợi ích nâng cấp: 'Chúng tôi kỳ vọng đợt nâng cấp này sẽ nâng cao độ chính xác theo dõi hàng tồn lên 40%'.",
  },

  // PART 7: READING COMPREHENSION (EMAIL & MEMO ĐỌC HIỂU)
  {
    id: "e26-r-p7-147",
    part: 7,
    level: 5,
    topic: "Thông báo dịch vụ giao thông",
    passageTitle: "Metro Transit Authority - Service Advisory",
    passageText: `METRO TRANSIT AUTHORITY - SERVICE ADVISORY
Effective: Saturday, November 18 through Sunday, November 19

Track maintenance and signaling upgrades will take place along the Blue Line between Oakridge Station and Grand Central Terminal.
- Train service on this sector will be replaced by complimentary express shuttle buses running every 10 minutes.
- Passengers traveling to the International Airport should allow an additional 25 minutes of travel time.
- Normal subway train service will resume at 5:00 AM on Monday, November 20.

For real-time shuttle tracking, download the MetroTransit mobile app or visit www.metrotransit.org.`,
    questionText: "What is the primary purpose of the advisory notice?",
    options: [
      "To announce a temporary change in train transport service",
      "To recruit experienced subway track maintenance engineers",
      "To promote a mobile ticketing application discount",
      "To inform commuters about a fare increase",
    ],
    correctIndex: 0,
    grammarPoint: "Xác định mục đích chính của thông báo",
    explanationVi: "Mục đích chính của thông báo là thông báo sự thay đổi dịch vụ vận hành tàu tạm thời do bảo dưỡng đường ray (được thay thế bằng xe buýt đưa đón miễn phí).",
  },
  {
    id: "e26-r-p7-148",
    part: 7,
    level: 5,
    topic: "Thông báo dịch vụ giao thông",
    passageTitle: "Metro Transit Authority - Passenger Advisory",
    passageText: `(Tham chiếu thông báo của Metro Transit Authority bên trên)`,
    questionText: "What are passengers traveling to the airport advised to do?",
    options: [
      "Purchase a special shuttle bus ticket in advance",
      "Allow extra time for their commute journey",
      "Take an alternative subway line to Terminal 3",
      "Check in their luggage at Oakridge Station",
    ],
    correctIndex: 1,
    grammarPoint: "Kỹ năng quét thông tin chi tiết (Scanning)",
    explanationVi: "Văn bản nêu rõ: 'Passengers traveling to the International Airport should allow an additional 25 minutes of travel time' (Hành khách đi sân bay nên dành thêm 25 phút thời gian di chuyển).",
  },
];
