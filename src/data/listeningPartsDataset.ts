import {
  ETS_2026_PART1_SETS,
  ETS_2026_PART2_SETS,
  ETS_2026_PART3_SETS,
  ETS_2026_PART4_SETS,
} from "./ets2026/ets2026ListeningDataset";

export interface ExamQuestionOption {
  label: "A" | "B" | "C" | "D";
  text: string;
}

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  options: ExamQuestionOption[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanationVi: string;
  transcriptSegment?: string;
  audioUrl?: string;
  imageUrl?: string;
}

export interface ListeningExamSet {
  id: string;
  part: 1 | 2 | 3 | 4;
  level: number; // 1 to 8
  title: string;
  subtitle: string;
  category: string; // e.g. "Tranh một người", "Who", "Hội thoại 3 người", "Sân bay & Khách sạn"
  isPro?: boolean;
  totalQuestions: number;
  audioDurationSeconds: number;
  audioScript: string;
  audioUrl?: string;
  questions: ExamQuestion[];
}

export const LISTENING_PART_EXAM_SETS: ListeningExamSet[] = [
  // ========================== ETS 2026 OFFICIAL TOEIC SETS ==========================
  ...ETS_2026_PART1_SETS,
  ...ETS_2026_PART2_SETS,
  ...ETS_2026_PART3_SETS,
  ...ETS_2026_PART4_SETS,

  // ========================== PART 1 (4 sets across levels) ==========================
  {
    id: "p1-lvl1-set1",
    part: 1,
    level: 1,
    title: "Level 1 · Part 1 Đề cơ bản 1",
    subtitle: "Dưới 300/990 TOEIC · Tranh tả người đơn",
    category: "Tranh một người",
    totalQuestions: 25,
    audioDurationSeconds: 180,
    audioScript: "Part 1 Directions: Look at the picture and listen to the four statements. Select the statement that best describes what you see.",
    questions: Array.from({ length: 25 }, (_, i) => ({
      id: `p1-l1-s1-q${i + 1}`,
      questionNumber: i + 1,
      questionText: `Which statement best describes the photograph for question ${i + 1}?`,
      options: [
        { label: "A", text: "A woman is examining documents at her desk." },
        { label: "B", text: "Some people are walking in the hallway." },
        { label: "C", text: "A vehicle is parked in the driveway." },
        { label: "D", text: "Books are stacked on the floor." },
      ],
      correctAnswer: "A",
      explanationVi: "Đáp án A chính xác vì người phụ nữ đang xem xét tài liệu tại bàn làm việc, khớp với hành động trong tranh.",
      transcriptSegment: "Statement (A): A woman is examining documents at her desk.",
    })),
  },
  {
    id: "p1-lvl2-set1",
    part: 1,
    level: 2,
    title: "Level 2 · Part 1 Đề sơ cấp 2",
    subtitle: "300–400/990 TOEIC · Tranh nhiều người",
    category: "Tranh nhiều người",
    isPro: true,
    totalQuestions: 25,
    audioDurationSeconds: 180,
    audioScript: "Part 2 Directions for Level 2 multi-person photo descriptions.",
    questions: Array.from({ length: 25 }, (_, i) => ({
      id: `p1-l2-s1-q${i + 1}`,
      questionNumber: i + 1,
      questionText: `Select the best description for photo ${i + 1}.`,
      options: [
        { label: "A", text: "Colleagues are collaborating around a conference table." },
        { label: "B", text: "A chef is chopping vegetables in the kitchen." },
        { label: "C", text: "Luggage is being loaded onto an airplane." },
        { label: "D", text: "A technician is repairing a computer monitor." },
      ],
      correctAnswer: "A",
      explanationVi: "Đáp án A mô tả đúng nhóm đồng nghiệp đang thảo luận quanh bàn họp.",
      transcriptSegment: "Statement (A): Colleagues are collaborating around a conference table.",
    })),
  },
  {
    id: "p1-lvl3-set1",
    part: 1,
    level: 3,
    title: "Level 3 · Part 1 Đề trung cấp 3",
    subtitle: "400–500/990 TOEIC · Tranh tả cảnh văn phòng",
    category: "Tranh tả cảnh",
    totalQuestions: 25,
    audioDurationSeconds: 180,
    audioScript: "Part 1 Level 3 audio script.",
    questions: Array.from({ length: 25 }, (_, i) => ({
      id: `p1-l3-s1-q${i + 1}`,
      questionNumber: i + 1,
      questionText: `Listen and choose the statement for question ${i + 1}.`,
      options: [
        { label: "A", text: "Chairs have been arranged in rows facing the stage." },
        { label: "B", text: "A worker is painting the exterior wall." },
        { label: "C", text: "Pedestrians are crossing the street." },
        { label: "D", text: "Vessels are docked at the harbor." },
      ],
      correctAnswer: "A",
      explanationVi: "Đáp án A mô tả chính xác quang cảnh ghế được xếp thành hàng hướng về sân khấu.",
      transcriptSegment: "Statement (A): Chairs have been arranged in rows facing the stage.",
    })),
  },
  {
    id: "p1-lvl4-set1",
    part: 1,
    level: 4,
    title: "Level 4 · Part 1 Đề nâng cao 4",
    subtitle: "500–600/990 TOEIC · Tranh tả vật dụng",
    category: "Tranh tả vật",
    totalQuestions: 25,
    audioDurationSeconds: 180,
    audioScript: "Part 1 Level 4 audio script.",
    questions: Array.from({ length: 25 }, (_, i) => ({
      id: `p1-l4-s1-q${i + 1}`,
      questionNumber: i + 1,
      questionText: `Select the best statement for question ${i + 1}.`,
      options: [
        { label: "A", text: "Merchandise is neatly displayed on store shelves." },
        { label: "B", text: "A customer is paying with a credit card." },
        { label: "C", text: "The cashier is printing a receipt." },
        { label: "D", text: "Boxes are being stacked in the warehouse." },
      ],
      correctAnswer: "A",
      explanationVi: "Đáp án A miêu tả đúng hàng hóa được trưng bày gọn gàng trên kệ cửa hàng.",
      transcriptSegment: "Statement (A): Merchandise is neatly displayed on store shelves.",
    })),
  },

  // ========================== PART 2 (4 sets across levels) ==========================
  {
    id: "p2-lvl1-set1",
    part: 2,
    level: 1,
    title: "Level 1 · Part 2 Hỏi-Đáp cơ bản (Who/When)",
    subtitle: "Dưới 300/990 TOEIC · Câu hỏi trực diện",
    category: "Câu hỏi Who",
    totalQuestions: 25,
    audioDurationSeconds: 180,
    audioScript: "Part 2 Directions: You will hear a question or statement and three responses. Choose the best response.",
    questions: Array.from({ length: 25 }, (_, i) => ({
      id: `p2-l1-s1-q${i + 1}`,
      questionNumber: i + 1,
      questionText: `Who is responsible for scheduling the quarterly audit meeting?`,
      options: [
        { label: "A", text: "Ms. Henderson in accounting." },
        { label: "B", text: "Next Tuesday at 10 AM." },
        { label: "C", text: "In the main conference room." },
      ],
      correctAnswer: "A",
      explanationVi: "Câu hỏi bắt đầu bằng 'Who' hỏi về người, đáp án A ('Ms. Henderson') là phù hợp nhất.",
      transcriptSegment: "Who is responsible for scheduling the quarterly audit meeting? — Ms. Henderson in accounting.",
    })),
  },
  {
    id: "p2-lvl2-set1",
    part: 2,
    level: 2,
    title: "Level 2 · Part 2 Hỏi-Đáp sơ cấp (Where/Why)",
    subtitle: "300–400/990 TOEIC · Câu hỏi địa điểm & lý do",
    category: "Câu hỏi Where",
    isPro: true,
    totalQuestions: 25,
    audioDurationSeconds: 180,
    audioScript: "Part 2 Level 2 audio script.",
    questions: Array.from({ length: 25 }, (_, i) => ({
      id: `p2-l2-s1-q${i + 1}`,
      questionNumber: i + 1,
      questionText: `Where did you put the revised blueprint for the downtown facility?`,
      options: [
        { label: "A", text: "On the top shelf of the supply cabinet." },
        { label: "B", text: "To review the architectural drafts." },
        { label: "C", text: "Yes, the contractor approved it." },
      ],
      correctAnswer: "A",
      explanationVi: "Câu hỏi 'Where' hỏi về vị trí, đáp án A chỉ rõ vị trí trên kệ tủ.",
      transcriptSegment: "Where did you put the revised blueprint? — On the top shelf of the supply cabinet.",
    })),
  },
  {
    id: "p2-lvl3-set1",
    part: 2,
    level: 3,
    title: "Level 3 · Part 2 Hỏi-Đáp trung cấp (How/What)",
    subtitle: "400–500/990 TOEIC · Câu hỏi cách thức & chi tiết",
    category: "Câu hỏi How",
    totalQuestions: 25,
    audioDurationSeconds: 180,
    audioScript: "Part 2 Level 3 audio script.",
    questions: Array.from({ length: 25 }, (_, i) => ({
      id: `p2-l3-s1-q${i + 1}`,
      questionNumber: i + 1,
      questionText: `How can I access the secure corporate intranet from home?`,
      options: [
        { label: "A", text: "By logging in with your VPN credentials." },
        { label: "B", text: "It is located on the third floor." },
        { label: "C", text: "Until Friday afternoon." },
      ],
      correctAnswer: "A",
      explanationVi: "Câu hỏi 'How' hỏi phương thức, đáp án A giải thích cách dùng VPN.",
      transcriptSegment: "How can I access the secure corporate intranet? — By logging in with your VPN credentials.",
    })),
  },
  {
    id: "p2-lvl4-set1",
    part: 2,
    level: 4,
    title: "Level 4 · Part 2 Hỏi-Đáp nâng cao (Indirect)",
    subtitle: "500–600/990 TOEIC · Câu trả lời gián tiếp",
    category: "Câu hỏi Gián tiếp",
    totalQuestions: 25,
    audioDurationSeconds: 180,
    audioScript: "Part 2 Level 4 audio script.",
    questions: Array.from({ length: 25 }, (_, i) => ({
      id: `p2-l4-s1-q${i + 1}`,
      questionNumber: i + 1,
      questionText: `Aren't we supposed to receive the shipment of promotional banners today?`,
      options: [
        { label: "A", text: "The delivery truck had a flat tire on the highway." },
        { label: "B", text: "Yes, exactly three hundred copies." },
        { label: "C", text: "At the downtown post office." },
      ],
      correctAnswer: "A",
      explanationVi: "Đây là câu trả lời gián tiếp giải thích lý do tại sao hàng chưa đến.",
      transcriptSegment: "Aren't we supposed to receive the shipment today? — The delivery truck had a flat tire.",
    })),
  },

  // ========================== PART 3 (4 sets across levels) ==========================
  {
    id: "p3-lvl1-set1",
    part: 3,
    level: 1,
    title: "Level 1 · Part 3 Hội thoại ngắn cơ bản",
    subtitle: "300–400/990 TOEIC · Hội thoại 2 người",
    category: "Lịch hẹn & Công việc",
    totalQuestions: 25,
    audioDurationSeconds: 240,
    audioScript: "Part 3 Directions: You will hear some conversations between two or more people. Select the best answer to each question.",
    questions: Array.from({ length: 25 }, (_, i) => ({
      id: `p3-l1-s1-q${i + 1}`,
      questionNumber: i + 1,
      questionText: `What is the main topic of the conversation between the colleagues?`,
      options: [
        { label: "A", text: "Preparing a presentation for the client meeting." },
        { label: "B", text: "Renting office space downtown." },
        { label: "C", text: "Upgrading office software licenses." },
        { label: "D", text: "Organizing an annual company retreat." },
      ],
      correctAnswer: "A",
      explanationVi: "Đoạn hội thoại xoay quanh việc chuẩn bị slide thuyết trình cho cuộc họp khách hàng.",
      transcriptSegment: "M: Are the slides ready for the client meeting tomorrow? — W: Almost done, I just need to add the financial charts.",
    })),
  },
  {
    id: "p3-lvl2-set1",
    part: 3,
    level: 2,
    title: "Level 2 · Part 3 Hội thoại sơ cấp (3 người nói)",
    subtitle: "400–500/990 TOEIC · Hội thoại đa nhân vật",
    category: "Hội thoại 3 người nói",
    isPro: true,
    totalQuestions: 25,
    audioDurationSeconds: 240,
    audioScript: "Part 3 Level 2 audio script with three speakers.",
    questions: Array.from({ length: 25 }, (_, i) => ({
      id: `p3-l2-s1-q${i + 1}`,
      questionNumber: i + 1,
      questionText: `What problem do the speakers discuss regarding the inventory?`,
      options: [
        { label: "A", text: "Some electronic components were damaged in transit." },
        { label: "B", text: "The warehouse lacks sufficient storage racks." },
        { label: "C", text: "Suppliers increased prices unexpectedly." },
        { label: "D", text: "Shipments are delayed due to bad weather." },
      ],
      correctAnswer: "A",
      explanationVi: "Các nhân viên kho và quản lý thảo luận về việc linh kiện điện tử bị hỏng khi vận chuyển.",
      transcriptSegment: "Man 1: We received a box of damaged microchips. — Woman: Let's notify the supplier immediately.",
    })),
  },
  {
    id: "p3-lvl3-set1",
    part: 3,
    level: 3,
    title: "Level 3 · Part 3 Hội thoại trung cấp (Biểu đồ & Đồ họa)",
    subtitle: "500–600/990 TOEIC · Có hình / bảng biểu",
    category: "Có hình / bảng biểu",
    totalQuestions: 25,
    audioDurationSeconds: 240,
    audioScript: "Part 3 Level 3 graphic reference audio script.",
    questions: Array.from({ length: 25 }, (_, i) => ({
      id: `p3-l3-s1-q${i + 1}`,
      questionNumber: i + 1,
      questionText: `Look at the graphic. Which department has the highest budget allocation?`,
      options: [
        { label: "A", text: "Research and Development" },
        { label: "B", text: "Marketing and Sales" },
        { label: "C", text: "Human Resources" },
        { label: "D", text: "Customer Support" },
      ],
      correctAnswer: "A",
      explanationVi: "Dựa trên biểu đồ được cung cấp, phòng Nghiên cứu & Phát triển (R&D) chiếm ngân sách cao nhất.",
      transcriptSegment: "Woman: As you can see on the pie chart, Research and Development takes up thirty five percent of our budget.",
    })),
  },
  {
    id: "p3-lvl4-set1",
    part: 3,
    level: 4,
    title: "Level 4 · Part 3 Hội thoại nâng cao (Hàm ý người nói)",
    subtitle: "600–700/990 TOEIC · Câu hỏi hàm ý & suy luận",
    category: "Câu hỏi hàm ý người nói",
    totalQuestions: 25,
    audioDurationSeconds: 240,
    audioScript: "Part 3 Level 4 speaker intent audio script.",
    questions: Array.from({ length: 25 }, (_, i) => ({
      id: `p3-l4-s1-q${i + 1}`,
      questionNumber: i + 1,
      questionText: `What does the woman mean when she says, 'My calendar is completely full until Friday'?`,
      options: [
        { label: "A", text: "She cannot take on any new appointments before Friday." },
        { label: "B", text: "She is taking a day off later this week." },
        { label: "C", text: "She forgot to check her schedule." },
        { label: "D", text: "She wants to reschedule the Friday meeting." },
      ],
      correctAnswer: "A",
      explanationVi: "Câu nói hàm ý từ chối nhận thêm lịch hẹn mới vì lịch đã kín.",
      transcriptSegment: "Man: Can we meet on Thursday afternoon? — Woman: My calendar is completely full until Friday.",
    })),
  },

  // ========================== PART 4 (4 sets across levels) ==========================
  {
    id: "p4-lvl1-set1",
    part: 4,
    level: 1,
    title: "Level 1 · Part 4 Bài nói ngắn cơ bản (Thông báo)",
    subtitle: "Dưới 300/990 TOEIC · Thông báo nơi công cộng",
    category: "Sân bay & Khách sạn",
    totalQuestions: 25,
    audioDurationSeconds: 240,
    audioScript: "Part 4 Directions: You will hear some talks given by a single speaker. Select the best answer to each question.",
    questions: Array.from({ length: 25 }, (_, i) => ({
      id: `p4-l1-s1-q${i + 1}`,
      questionNumber: i + 1,
      questionText: `What is the purpose of the announcement at the airport terminal?`,
      options: [
        { label: "A", text: "Announcing a change in boarding gate for a flight." },
        { label: "B", text: "Reporting a lost luggage claim." },
        { label: "C", text: "Offering discounted airline tickets." },
        { label: "D", text: "Welcoming international delegates." },
      ],
      correctAnswer: "A",
      explanationVi: "Bài phát biểu thông báo về việc thay đổi cổng lên máy bay (boarding gate) cho hành khách.",
      transcriptSegment: "Attention passengers on flight 402 to Chicago, your departure gate has been changed to Gate 14.",
    })),
  },
  {
    id: "p4-lvl2-set1",
    part: 4,
    level: 2,
    title: "Level 2 · Part 4 Bài nói sơ cấp (Quảng cáo & Giới thiệu)",
    subtitle: "300–400/990 TOEIC · Bài phát biểu thương mại",
    category: "Mua sắm & Bán lẻ",
    isPro: true,
    totalQuestions: 25,
    audioDurationSeconds: 240,
    audioScript: "Part 4 Level 2 commercial talk audio script.",
    questions: Array.from({ length: 25 }, (_, i) => ({
      id: `p4-l2-s1-q${i + 1}`,
      questionNumber: i + 1,
      questionText: `What product or service is being advertised in the broadcast?`,
    options: [
        { label: "A", text: "An ergonomic office chair with lumbar support." },
        { label: "B", text: "A cloud-based accounting software." },
        { label: "C", text: "An organic skincare line." },
        { label: "D", text: "A smart home security system." },
      ],
      correctAnswer: "A",
      explanationVi: "Quảng cáo giới thiệu sản phẩm ghế văn phòng công thái học hỗ trợ thắt lưng.",
      transcriptSegment: "Are you suffering from back pain at work? Try our new ergonomic office chair designed for maximum comfort.",
    })),
  },
  {
    id: "p4-lvl3-set1",
    part: 4,
    level: 3,
    title: "Level 3 · Part 4 Bài nói trung cấp (Báo cáo kinh doanh)",
    subtitle: "400–500/990 TOEIC · Bản tin tài chính & kinh doanh",
    category: "Kế toán & Ngân sách",
    totalQuestions: 25,
    audioDurationSeconds: 240,
    audioScript: "Part 4 Level 3 business report audio script.",
    questions: Array.from({ length: 25 }, (_, i) => ({
      id: `p4-l3-s1-q${i + 1}`,
      questionNumber: i + 1,
      questionText: `According to the speaker, what caused the increase in quarterly revenue?`,
      options: [
        { label: "A", text: "Expansion into international export markets." },
        { label: "B", text: "Reduction in manufacturing overhead." },
        { label: "C", text: "Launch of a successful digital marketing campaign." },
        { label: "D", text: "Acquisition of a smaller competitor." },
      ],
      correctAnswer: "A",
      explanationVi: "Báo cáo doanh thu chỉ rõ nguyên nhân tăng trưởng là nhờ mở rộng thị trường xuất khẩu quốc tế.",
      transcriptSegment: "Our quarterly profits surged by twenty percent, largely driven by successful expansion into European export markets.",
    })),
  },
  {
    id: "p4-lvl4-set1",
    part: 4,
    level: 4,
    title: "Level 4 · Part 4 Bài nói nâng cao (Chỉ dẫn kỹ thuật)",
    subtitle: "500–600/990 TOEIC · Hướng dẫn quy trình vận hành",
    category: "Sự cố & Bảo trì",
    totalQuestions: 25,
    audioDurationSeconds: 240,
    audioScript: "Part 4 Level 4 technical briefing audio script.",
    questions: Array.from({ length: 25 }, (_, i) => ({
      id: `p4-l4-s1-q${i + 1}`,
      questionNumber: i + 1,
      questionText: `What instruction does the speaker give to the assembly line technicians?`,
      options: [
        { label: "A", text: "Shut down the primary conveyor belt for routine maintenance." },
        { label: "B", text: "Wear protective goggles at all times." },
        { label: "C", text: "Submit daily shift logs by noon." },
        { label: "D", text: "Inspect raw materials for defects." },
      ],
      correctAnswer: "A",
      explanationVi: "Kỹ thuật viên được chỉ thị tắt băng chuyền chính để bảo trì định kỳ.",
      transcriptSegment: "Attention technicians, please power down the primary conveyor belt at 3 PM for scheduled routine maintenance.",
    })),
  },
];
