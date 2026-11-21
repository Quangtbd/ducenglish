import type {
  CefrLevel,
  ListeningQuestion,
  ThematicListeningSet,
  ToeicPart,
  TopicId,
  VocabHighlight,
} from "../types/toeic";

interface SeedTopicConfig {
  id: string;
  title: string;
  titleVi: string;
  cefrLevel: CefrLevel;
  part: ToeicPart;
  topic: Exclude<TopicId, "all">;
  descriptionVi: string;
  items: {
    title: string;
    transcript: string;
    transcriptVi: string;
    linkedSpeechTip: string;
    grammarNote: string;
    choices?: string[];
    dialogue?: { speaker: string; text: string; voiceName?: "Puck" | "Charon" | "Kore" | "Fenrir" | "Zephyr" }[];
    keyVocab: VocabHighlight[];
  }[];
}

const CEFR_TO_NUMERIC_LEVEL: Record<CefrLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 4,
  B2: 6,
  C1: 7,
  C2: 8,
};

function buildSet(cfg: SeedTopicConfig): ThematicListeningSet {
  const numLevel = CEFR_TO_NUMERIC_LEVEL[cfg.cefrLevel];
  const questions: ListeningQuestion[] = cfg.items.map((item, idx) => ({
    id: `${cfg.id}-q${idx + 1}`,
    testId: cfg.id,
    part: cfg.part,
    order: idx + 1,
    level: numLevel,
    topic: cfg.topic,
    title: item.title,
    transcript: item.transcript,
    transcriptVi: item.transcriptVi,
    linkedSpeechTip: item.linkedSpeechTip,
    grammarNote: item.grammarNote,
    choices: item.choices,
    correctChoiceIndex: item.choices ? 0 : undefined,
    dialogue: item.dialogue,
    keyVocab: item.keyVocab,
  }));

  return {
    id: cfg.id,
    title: cfg.title,
    titleVi: cfg.titleVi,
    cefrLevel: cfg.cefrLevel,
    part: cfg.part,
    topic: cfg.topic,
    descriptionVi: cfg.descriptionVi,
    questions,
  };
}

export const THEMATIC_LISTENING_SETS: ThematicListeningSet[] = [
  // ================= A1 (<300) =================
  buildSet({
    id: "theme-a1-office-arrival",
    title: "Morning Office Arrival",
    titleVi: "Buổi sáng tại văn phòng",
    cefrLevel: "A1",
    part: 1,
    topic: "office",
    descriptionVi: "Câu mô tả hành động đơn giản khi nhân viên đến công ty.",
    items: [
      {
        title: "Opening the office door",
        transcript: "A man is opening the front door of the office.",
        transcriptVi: "Một người đàn ông đang mở cửa trước của văn phòng.",
        linkedSpeechTip: "Cụm 'front door of' nối nhẹ thành /frʌnt dɔːr əv/.",
        grammarNote: "Thì hiện tại tiếp diễn diễn tả hành động đang diễn ra.",
        keyVocab: [
          {
            word: "front door",
            phonetic: "/frʌnt dɔːr/",
            partOfSpeech: "noun phrase",
            meaningVi: "cửa chính phía trước",
            exampleSentence: "Please lock the front door before leaving.",
          },
        ],
      },
      {
        title: "Pouring morning coffee",
        transcript: "She is pouring coffee into a white ceramic cup.",
        transcriptVi: "Cô ấy đang rót cà phê vào một chiếc cốc sứ trắng.",
        linkedSpeechTip: "Nối âm 'coffee into' có âm lướt nhẹ /j/ ở giữa.",
        grammarNote: "Giới từ 'into' chỉ chuyển động hướng vào bên trong.",
        keyVocab: [
          {
            word: "pour",
            phonetic: "/pɔːr/",
            partOfSpeech: "verb",
            meaningVi: "rót, đổ",
            exampleSentence: "He poured water into the glass.",
          },
        ],
      },
      {
        title: "Sitting at the desk",
        transcript: "Two colleagues are sitting next to each other at a desk.",
        transcriptVi: "Hai đồng nghiệp đang ngồi cạnh nhau tại một chiếc bàn.",
        linkedSpeechTip: "'next to' thường đọc gọn âm /t/ đầu của 'to'.",
        grammarNote: "'each other' = lẫn nhau (dùng cho 2 người).",
        keyVocab: [
          {
            word: "colleague",
            phonetic: "/ˈkɒl.iːɡ/",
            partOfSpeech: "noun",
            meaningVi: "đồng nghiệp",
            exampleSentence: "I had lunch with a colleague from accounting.",
          },
        ],
      },
    ],
  }),
  buildSet({
    id: "theme-a1-desk-setup",
    title: "Daily Desk & Printer Setup",
    titleVi: "Bàn làm việc & Máy in",
    cefrLevel: "A1",
    part: 1,
    topic: "office",
    descriptionVi: "Từ vựng cơ bản về thiết bị văn phòng, bàn phím và tài liệu.",
    items: [
      {
        title: "Typing on a laptop",
        transcript: "The employee is typing on a laptop near the window.",
        transcriptVi: "Nhân viên đang gõ phím trên máy tính xách tay gần cửa sổ.",
        linkedSpeechTip: "'typing on a' nối mượt thành /ˈtaɪ.pɪŋ ɒn ə/.",
        grammarNote: "Cụm giới từ 'near the window' chỉ vị trí.",
        keyVocab: [
          {
            word: "employee",
            phonetic: "/ɪmˈplɔɪ.iː/",
            partOfSpeech: "noun",
            meaningVi: "nhân viên",
            exampleSentence: "Every employee receives a security badge.",
          },
        ],
      },
      {
        title: "Checking the printer tray",
        transcript: "He is placing paper into the printer tray.",
        transcriptVi: "Anh ấy đang đặt giấy vào khay máy in.",
        linkedSpeechTip: "'placing paper' chú ý âm bật môi /p/ rõ ràng.",
        grammarNote: "'place A into B' = đặt A vào B.",
        keyVocab: [
          {
            word: "tray",
            phonetic: "/treɪ/",
            partOfSpeech: "noun",
            meaningVi: "khay đựng",
            exampleSentence: "The bottom tray holds legal-size paper.",
          },
        ],
      },
      {
        title: "Organizing folders",
        transcript: "Blue folders are stacked neatly on the shelf.",
        transcriptVi: "Những tập hồ sơ màu xanh được xếp gọn gàng trên kệ.",
        linkedSpeechTip: "'stacked neatly' có cụm phụ âm /kt/ đọc khép hơi.",
        grammarNote: "Thể bị động hiện tại diễn tả trạng thái vật đang nằm sẵn.",
        keyVocab: [
          {
            word: "neatly",
            phonetic: "/ˈniːt.li/",
            partOfSpeech: "adverb",
            meaningVi: "gọn gàng, ngăn nắp",
            exampleSentence: "Arrange the brochures neatly on the counter.",
          },
        ],
      },
    ],
  }),
  buildSet({
    id: "theme-a1-room-directions",
    title: "Asking for Room Directions",
    titleVi: "Hỏi đường đến phòng họp",
    cefrLevel: "A1",
    part: 2,
    topic: "office",
    descriptionVi: "Câu hỏi ngắn Where / When phổ biến ở Part 2.",
    items: [
      {
        title: "Where is the meeting room?",
        transcript: "Where is the main conference room located?",
        transcriptVi: "Phòng hội nghị chính nằm ở đâu vậy?",
        linkedSpeechTip: "'Where is' nối nhanh thành /weər ɪz/.",
        grammarNote: "Câu hỏi với 'Where' trả lời bằng vị trí cụ thể.",
        choices: [
          "It is on the second floor, next to the elevator.",
          "At three o'clock this afternoon.",
          "Yes, I booked it yesterday.",
        ],
        keyVocab: [
          {
            word: "located",
            phonetic: "/ləʊˈkeɪ.tɪd/",
            partOfSpeech: "adjective",
            meaningVi: "tọa lạc, nằm ở",
            exampleSentence: "Our branch is located downtown.",
          },
        ],
      },
      {
        title: "When does training start?",
        transcript: "When does the new software training start?",
        transcriptVi: "Buổi đào tạo phần mềm mới bắt đầu khi nào?",
        linkedSpeechTip: "'When does' thường đọc lướt nhẹ âm /d/.",
        grammarNote: "Câu hỏi 'When' dùng trợ động từ 'does' cho chủ ngữ số ít.",
        choices: [
          "Right after the lunch break.",
          "In the training center.",
          "About twenty participants.",
        ],
        keyVocab: [
          {
            word: "training",
            phonetic: "/ˈtreɪ.nɪŋ/",
            partOfSpeech: "noun",
            meaningVi: "buổi đào tạo",
            exampleSentence: "Safety training is mandatory for staff.",
          },
        ],
      },
      {
        title: "Who has the room key?",
        transcript: "Who has the key to the supply closet?",
        transcriptVi: "Ai đang giữ chìa khóa tủ văn phòng phẩm?",
        linkedSpeechTip: "'key to the' nối liền mạch với trọng âm rơi vào 'key' và 'supply'.",
        grammarNote: "Câu hỏi 'Who' hỏi về người chịu trách nhiệm.",
        choices: [
          "Check with the receptionist at the front desk.",
          "We need more printer ink.",
          "On the top shelf.",
        ],
        keyVocab: [
          {
            word: "receptionist",
            phonetic: "/rɪˈsep.ʃən.ɪst/",
            partOfSpeech: "noun",
            meaningVi: "nhân viên lễ tân",
            exampleSentence: "Ask the receptionist for a visitor pass.",
          },
        ],
      },
    ],
  }),
  buildSet({
    id: "theme-a1-simple-appointment",
    title: "Scheduling an Appointment",
    titleVi: "Đặt lịch hẹn cơ bản",
    cefrLevel: "A1",
    part: 2,
    topic: "hr",
    descriptionVi: "Hỏi giờ hẹn, xác nhận lịch và lựa chọn thời gian.",
    items: [
      {
        title: "Confirming Tuesday morning",
        transcript: "Can we meet on Tuesday morning at ten?",
        transcriptVi: "Chúng ta có thể gặp nhau vào 10 giờ sáng thứ Ba không?",
        linkedSpeechTip: "'meet on' nối thành /miː.tɒn/.",
        grammarNote: "Giới từ 'on' đi với thứ, 'at' đi với giờ.",
        choices: [
          "Sure, ten o'clock works well for me.",
          "Yes, I met him last week.",
          "In the main lobby.",
        ],
        keyVocab: [
          {
            word: "work well",
            phonetic: "/wɜːrk wel/",
            partOfSpeech: "verb phrase",
            meaningVi: "phù hợp, thuận tiện",
            exampleSentence: "Friday afternoon works well for our team.",
          },
        ],
      },
      {
        title: "Rescheduling lunch",
        transcript: "Would you prefer Monday or Wednesday for lunch?",
        transcriptVi: "Bạn thích ăn trưa vào thứ Hai hay thứ Tư hơn?",
        linkedSpeechTip: "Câu hỏi lựa chọn 'A or B' lên giọng ở 'Monday' và xuống giọng ở 'Wednesday'.",
        grammarNote: "Không trả lời Yes/No cho câu hỏi lựa chọn 'or'.",
        choices: [
          "Wednesday is better because I am free all afternoon.",
          "Yes, I had a sandwich.",
          "At the Italian restaurant.",
        ],
        keyVocab: [
          {
            word: "prefer",
            phonetic: "/prɪˈfɜːr/",
            partOfSpeech: "verb",
            meaningVi: "thích hơn",
            exampleSentence: "I prefer morning flights.",
          },
        ],
      },
      {
        title: "Checking dentist hours",
        transcript: "What time does the dental clinic close today?",
        transcriptVi: "Hôm nay phòng khám nha khoa đóng cửa lúc mấy giờ?",
        linkedSpeechTip: "'What time' nối âm /t/ gọn giữa hai từ.",
        grammarNote: "Hỏi giờ đóng cửa lịch cố định dùng thì hiện tại đơn.",
        choices: [
          "At six thirty, an hour later than usual.",
          "It is across from the bank.",
          "Yes, I have an appointment.",
        ],
        keyVocab: [
          {
            word: "clinic",
            phonetic: "/ˈklɪn.ɪk/",
            partOfSpeech: "noun",
            meaningVi: "phòng khám",
            exampleSentence: "The clinic opens at eight.",
          },
        ],
      },
    ],
  }),

  // ================= A2 (300–450) =================
  buildSet({
    id: "theme-a2-hotel-booking",
    title: "Business Trip Hotel Booking",
    titleVi: "Đặt phòng khách sạn đi công tác",
    cefrLevel: "A2",
    part: 3,
    topic: "travel",
    descriptionVi: "Hội thoại đặt phòng, hỏi giá ưu đãi công ty và bữa sáng.",
    items: [
      {
        title: "Requesting a quiet room",
        transcript: "I would like to reserve a quiet single room for three nights starting May twelfth.",
        transcriptVi: "Tôi muốn đặt một phòng đơn yên tĩnh trong ba đêm bắt đầu từ ngày 12 tháng 5.",
        linkedSpeechTip: "'would like to' đọc lướt nhẹ thành /wʊd laɪk tə/.",
        grammarNote: "'for + khoảng thời gian' chỉ độ dài lưu trú.",
        dialogue: [
          { speaker: "Guest", text: "I would like to reserve a quiet single room for three nights starting May twelfth.", voiceName: "Puck" },
          { speaker: "Receptionist", text: "Certainly. Does your company have a corporate discount code with us?", voiceName: "Kore" },
        ],
        keyVocab: [
          {
            word: "reserve",
            phonetic: "/rɪˈzɜːrv/",
            partOfSpeech: "verb",
            meaningVi: "đặt trước",
            exampleSentence: "We reserved a table for six.",
          },
        ],
      },
      {
        title: "Checking breakfast inclusion",
        transcript: "Complimentary breakfast is served daily in the lobby cafe from six to nine.",
        transcriptVi: "Bữa sáng miễn phí được phục vụ hàng ngày tại quán cà phê sảnh từ 6 đến 9 giờ.",
        linkedSpeechTip: "'served daily' nối âm /d/ liền mượt.",
        grammarNote: "'complimentary' là từ khóa rất hay gặp trong TOEIC nghĩa là miễn phí.",
        keyVocab: [
          {
            word: "complimentary",
            phonetic: "/ˌkɒm.plɪˈmen.tər.i/",
            partOfSpeech: "adjective",
            meaningVi: "miễn phí, tặng kèm",
            exampleSentence: "Guests receive complimentary Wi-Fi.",
          },
        ],
      },
      {
        title: "Airport shuttle option",
        transcript: "Our shuttle bus departs for the terminal every thirty minutes on the hour and half hour.",
        transcriptVi: "Xe trung chuyển của chúng tôi rời đi ra nhà ga mỗi 30 phút vào đúng giờ chẵn và rưỡi.",
        linkedSpeechTip: "'thirty minutes on' nối âm /sɒn/.",
        grammarNote: "'depart for + địa điểm' = khởi hành đi tới đâu.",
        keyVocab: [
          {
            word: "shuttle bus",
            phonetic: "/ˈʃʌt.əl bʌs/",
            partOfSpeech: "noun phrase",
            meaningVi: "xe buýt trung chuyển",
            exampleSentence: "Take the shuttle bus to Terminal 2.",
          },
        ],
      },
    ],
  }),
  buildSet({
    id: "theme-a2-remote-work",
    title: "Remote Work Policy Discussion",
    titleVi: "Thảo luận chính sách làm việc từ xa",
    cefrLevel: "A2",
    part: 3,
    topic: "hr",
    descriptionVi: "Trao đổi lịch làm việc tại nhà và họp trực tuyến hàng tuần.",
    items: [
      {
        title: "Two days from home",
        transcript: "Under the new policy, full-time staff may work from home every Tuesday and Thursday.",
        transcriptVi: "Theo chính sách mới, nhân viên toàn thời gian có thể làm việc tại nhà vào thứ Ba và thứ Năm.",
        linkedSpeechTip: "'work from' giữ âm /k/ nhẹ trước /fr/.",
        grammarNote: "'Under the new policy' = theo quy định mới.",
        dialogue: [
          { speaker: "Manager", text: "Under the new policy, full-time staff may work from home every Tuesday and Thursday.", voiceName: "Charon" },
          { speaker: "Staff", text: "Great, do we still join the morning check-in call at nine?", voiceName: "Kore" },
        ],
        keyVocab: [
          {
            word: "policy",
            phonetic: "/ˈpɒl.ə.si/",
            partOfSpeech: "noun",
            meaningVi: "chính sách, quy định",
            exampleSentence: "Check the return policy on your receipt.",
          },
        ],
      },
      {
        title: "Equipment allowance",
        transcript: "Each employee can claim up to two hundred dollars for a monitor or ergonomic chair.",
        transcriptVi: "Mỗi nhân viên có thể đề xuất hoàn chi phí tới 200 đô cho màn hình hoặc ghế công thái học.",
        linkedSpeechTip: "'claim up to' nối thành /kleɪ.mʌp tuː/.",
        grammarNote: "'up to + số lượng' = tối đa lên tới.",
        keyVocab: [
          {
            word: "allowance",
            phonetic: "/əˈlaʊ.əns/",
            partOfSpeech: "noun",
            meaningVi: "khoản trợ cấp, phụ cấp",
            exampleSentence: "Travel allowances cover train tickets.",
          },
        ],
      },
      {
        title: "Updating team calendar",
        transcript: "Remember to mark your remote days on the shared team calendar before Friday.",
        transcriptVi: "Nhớ đánh dấu ngày làm việc từ xa trên lịch chung của nhóm trước thứ Sáu.",
        linkedSpeechTip: "'Remember to' đọc nhanh thành /rɪˈmem.bə tə/.",
        grammarNote: "'remember to V' = nhớ phải làm việc gì trong tương lai.",
        keyVocab: [
          {
            word: "shared calendar",
            phonetic: "/ʃeərd ˈkæl.ɪn.dər/",
            partOfSpeech: "noun phrase",
            meaningVi: "lịch dùng chung",
            exampleSentence: "Add the deadline to our shared calendar.",
          },
        ],
      },
    ],
  }),
  buildSet({
    id: "theme-a2-hotel-checkin",
    title: "Hotel Check-in Instructions",
    titleVi: "Hướng dẫn nhận phòng khách sạn",
    cefrLevel: "A2",
    part: 4,
    topic: "travel",
    descriptionVi: "Thông báo chào mừng đoàn khách và hướng dẫn thẻ từ, Wi-Fi.",
    items: [
      {
        title: "Key card activation",
        transcript: "Welcome to the Harbor View Hotel. Please tap your key card on the elevator sensor before choosing your floor.",
        transcriptVi: "Chào mừng tới khách sạn Harbor View. Vui lòng chạm thẻ phòng vào cảm biến thang máy trước khi chọn tầng.",
        linkedSpeechTip: "'tap your' nối âm nhẹ /p/ sang /j/.",
        grammarNote: "'before + V-ing' rút gọn mệnh đề thời gian.",
        keyVocab: [
          {
            word: "key card",
            phonetic: "/kiː kɑːrd/",
            partOfSpeech: "noun phrase",
            meaningVi: "thẻ từ mở phòng",
            exampleSentence: "Leave your key card at reception when checking out.",
          },
        ],
      },
      {
        title: "Fitness center access",
        transcript: "The fitness center on the third floor remains open twenty-four hours a day for all registered guests.",
        transcriptVi: "Phòng tập thể hình ở tầng ba mở cửa suốt 24 giờ mỗi ngày cho toàn bộ khách đã đăng ký.",
        linkedSpeechTip: "'hours a day' nối thành /aʊəz ə deɪ/.",
        grammarNote: "'remain + adj' = duy trì ở trạng thái nào.",
        keyVocab: [
          {
            word: "registered",
            phonetic: "/ˈredʒ.ɪ.stərd/",
            partOfSpeech: "adjective",
            meaningVi: "đã đăng ký",
            exampleSentence: "Parking is free for registered visitors.",
          },
        ],
      },
      {
        title: "Checkout reminder",
        transcript: "Standard checkout is at noon, though late checkout until two is available upon request.",
        transcriptVi: "Giờ trả phòng tiêu chuẩn là 12 giờ trưa, tuy nhiên có thể trả muộn tới 2 giờ nếu yêu cầu trước.",
        linkedSpeechTip: "'checkout is at' nối liền /ˈtʃek.aʊ.tɪz æt/.",
        grammarNote: "'upon request' = khi có yêu cầu.",
        keyVocab: [
          {
            word: "upon request",
            phonetic: "/əˈpɒn rɪˈkwest/",
            partOfSpeech: "prepositional phrase",
            meaningVi: "khi được yêu cầu",
            exampleSentence: "Extra towels are provided upon request.",
          },
        ],
      },
    ],
  }),
  buildSet({
    id: "theme-a2-grand-opening",
    title: "Grand Opening Ceremony",
    titleVi: "Thông báo khai trương chi nhánh mới",
    cefrLevel: "A2",
    part: 4,
    topic: "marketing",
    descriptionVi: "Bài phát thanh khai trương cửa hàng mới kèm ưu đãi.",
    items: [
      {
        title: "Saturday ribbon cutting",
        transcript: "Join us this Saturday morning at nine for the grand opening of our newest Downtown Bakery branch.",
        transcriptVi: "Hãy tham gia cùng chúng tôi sáng thứ Bảy này lúc 9 giờ cho lễ khai trương chi nhánh tiệm bánh mới nhất.",
        linkedSpeechTip: "'Join us' nối thẳng thành /dʒɔɪ.nʌs/.",
        grammarNote: "Cụm 'grand opening' là bẫy paraphrase hay gặp với 'launch / new store'.",
        keyVocab: [
          {
            word: "branch",
            phonetic: "/brɑːntʃ/",
            partOfSpeech: "noun",
            meaningVi: "chi nhánh",
            exampleSentence: "They opened a new branch near the station.",
          },
        ],
      },
      {
        title: "First fifty shoppers",
        transcript: "The first fifty customers in line will receive a free reusable canvas tote bag.",
        transcriptVi: "Năm mươi khách hàng đầu tiên xếp hàng sẽ nhận được một túi vải canvas tái sử dụng miễn phí.",
        linkedSpeechTip: "'first fifty' đọc gọn âm /t/ giữa hai phụ âm.",
        grammarNote: "'in line' = đang xếp hàng chờ.",
        keyVocab: [
          {
            word: "reusable",
            phonetic: "/ˌriːˈjuː.zə.bəl/",
            partOfSpeech: "adjective",
            meaningVi: "có thể tái sử dụng",
            exampleSentence: "Bring a reusable bottle to the gym.",
          },
        ],
      },
      {
        title: "Live acoustic music",
        transcript: "Enjoy complimentary refreshments and live acoustic music in the courtyard until four o'clock.",
        transcriptVi: "Thưởng thức đồ uống nhẹ miễn phí và nhạc acoustic trực tiếp tại sân trong cho tới 4 giờ chiều.",
        linkedSpeechTip: "'refreshments and' nối âm /sənt/.",
        grammarNote: "'refreshments' (luôn số nhiều) = đồ ăn nhẹ và thức uống.",
        keyVocab: [
          {
            word: "refreshments",
            phonetic: "/rɪˈfreʃ.mənts/",
            partOfSpeech: "noun (plural)",
            meaningVi: "đồ ăn nhẹ và nước uống",
            exampleSentence: "Light refreshments will follow the seminar.",
          },
        ],
      },
    ],
  }),

  // ================= B1 (450–650) =================
  buildSet({
    id: "theme-b1-internship-interview",
    title: "Marketing Internship Interview",
    titleVi: "Phỏng vấn thực tập sinh Marketing",
    cefrLevel: "B1",
    part: 3,
    topic: "hr",
    descriptionVi: "Trao đổi về kinh nghiệm mạng xã hội, kỹ năng phân tích và thời gian thực tập.",
    items: [
      {
        title: "Discussing campaign portfolio",
        transcript: "I noticed on your resume that you managed the social media calendar for your university business club.",
        transcriptVi: "Tôi thấy trong hồ sơ bạn từng quản lý lịch đăng bài mạng xã hội cho câu lạc bộ kinh doanh ở trường.",
        linkedSpeechTip: "'noticed on' nối nhẹ /tɪs.tɒn/.",
        grammarNote: "Mệnh đề danh ngữ sau 'noticed that...' tường thuật thông tin trong CV.",
        dialogue: [
          { speaker: "Interviewer", text: "I noticed on your resume that you managed the social media calendar for your university business club.", voiceName: "Fenrir" },
          { speaker: "Candidate", text: "Yes, I created weekly promotional graphics and grew our follower count by thirty-five percent.", voiceName: "Zephyr" },
        ],
        keyVocab: [
          {
            word: "promotional",
            phonetic: "/prəˈməʊ.ʃən.əl/",
            partOfSpeech: "adjective",
            meaningVi: "mang tính quảng bá, khuyến mãi",
            exampleSentence: "Design promotional flyers for the expo.",
          },
        ],
      },
      {
        title: "Asking about weekly hours",
        transcript: "The paid internship runs for twelve weeks and requires twenty hours per week.",
        transcriptVi: "Kỳ thực tập có lương kéo dài 12 tuần và yêu cầu làm việc 20 giờ mỗi tuần.",
        linkedSpeechTip: "'runs for' nối liền mạch giữa /z/ và /f/.",
        grammarNote: "'paid internship' = thực tập có hưởng lương.",
        keyVocab: [
          {
            word: "internship",
            phonetic: "/ˈɪn.tɜːn.ʃɪp/",
            partOfSpeech: "noun",
            meaningVi: "kỳ thực tập",
            exampleSentence: "She completed a summer internship in finance.",
          },
        ],
      },
      {
        title: "Next interview round",
        transcript: "We will contact shortlisted candidates by Friday to schedule a brief creative exercise.",
        transcriptVi: "Chúng tôi sẽ liên hệ các ứng viên lọt vào vòng trong trước thứ Sáu để hẹn làm bài kiểm tra sáng tạo ngắn.",
        linkedSpeechTip: "'shortlisted candidates' chú ý kết thúc -ed phát âm /ɪd/.",
        grammarNote: "'shortlisted' = được chọn vào danh sách rút gọn.",
        keyVocab: [
          {
            word: "candidate",
            phonetic: "/ˈkæn.dɪ.dət/",
            partOfSpeech: "noun",
            meaningVi: "ứng viên",
            exampleSentence: "Three candidates interviewed for the post.",
          },
        ],
      },
    ],
  }),
  buildSet({
    id: "theme-b1-supplier-contract",
    title: "Negotiating a Supplier Contract",
    titleVi: "Đàm phán hợp đồng nhà cung cấp",
    cefrLevel: "B1",
    part: 3,
    topic: "logistics",
    descriptionVi: "Thương lượng chiết khấu số lượng lớn và thời hạn giao hàng.",
    items: [
      {
        title: "Volume discount request",
        transcript: "If we increase our monthly paper order to five hundred boxes, could you offer an eight percent discount?",
        transcriptVi: "Nếu chúng tôi tăng đơn đặt giấy hàng tháng lên 500 thùng, bên bạn có thể chiết khấu 8% không?",
        linkedSpeechTip: "'offer an eight' nối âm thành /ˈɒf.ər æn eɪt/.",
        grammarNote: "Câu điều kiện loại 1 diễn đạt đề nghị thương lượng thực tế.",
        dialogue: [
          { speaker: "Buyer", text: "If we increase our monthly paper order to five hundred boxes, could you offer an eight percent discount?", voiceName: "Kore" },
          { speaker: "Supplier", text: "For a twelve-month commitment, we can definitely match that rate and waive delivery fees.", voiceName: "Puck" },
        ],
        keyVocab: [
          {
            word: "commitment",
            phonetic: "/kəˈmɪt.mənt/",
            partOfSpeech: "noun",
            meaningVi: "cam kết",
            exampleSentence: "Signing a two-year commitment lowers the fee.",
          },
        ],
      },
      {
        title: "Waiving delivery charges",
        transcript: "Free express shipping applies automatically once your invoice exceeds one thousand dollars.",
        transcriptVi: "Miễn phí vận chuyển nhanh sẽ tự động áp dụng khi hóa đơn vượt quá 1.000 đô la.",
        linkedSpeechTip: "'exceeds one' giữ âm /z/ trước /w/.",
        grammarNote: "'exceed' = vượt quá ngưỡng quy định.",
        keyVocab: [
          {
            word: "waive",
            phonetic: "/weɪv/",
            partOfSpeech: "verb",
            meaningVi: "miễn giảm (phí)",
            exampleSentence: "The bank waived the late fee.",
          },
        ],
      },
      {
        title: "Reviewing penalty clause",
        transcript: "Let us double-check the clause regarding late shipments before signing the agreement.",
        transcriptVi: "Hãy kiểm tra kỹ lại điều khoản liên quan tới việc giao hàng trễ trước khi ký thỏa thuận.",
        linkedSpeechTip: "'Let us' thường nói nối thành /ˈlet əs/.",
        grammarNote: "'regarding + N' = về vấn đề gì.",
        keyVocab: [
          {
            word: "clause",
            phonetic: "/klɔːz/",
            partOfSpeech: "noun",
            meaningVi: "điều khoản hợp đồng",
            exampleSentence: "Read every clause in the lease.",
          },
        ],
      },
    ],
  }),
  buildSet({
    id: "theme-b1-flight-delay",
    title: "Flight Delay Announcement",
    titleVi: "Thông báo hoãn chuyến bay",
    cefrLevel: "B1",
    part: 4,
    topic: "travel",
    descriptionVi: "Thông báo sân bay về thay đổi cổng lên máy bay và phiếu ăn miễn phí.",
    items: [
      {
        title: "Technical inspection delay",
        transcript: "Attention passengers on Flight 34B to Singapore: departure has been delayed by forty-five minutes for a routine technical check.",
        transcriptVi: "Xin lưu ý hành khách chuyến bay 34B đi Singapore: giờ khởi hành bị hoãn 45 phút để kiểm tra kỹ thuật định kỳ.",
        linkedSpeechTip: "'delayed by' đọc rõ âm /d/ chuyển sang /b/.",
        grammarNote: "Thì hiện tại hoàn thành bị động 'has been delayed' nhấn mạnh trạng thái hiện tại.",
        keyVocab: [
          {
            word: "departure",
            phonetic: "/dɪˈpɑːr.tʃər/",
            partOfSpeech: "noun",
            meaningVi: "sự khởi hành",
            exampleSentence: "Check the departure board for gate updates.",
          },
        ],
      },
      {
        title: "Meal voucher pickup",
        transcript: "Travelers may pick up a complimentary meal voucher at the customer service desk near Gate 12.",
        transcriptVi: "Hành khách có thể nhận phiếu ăn miễn phí tại quầy dịch vụ khách hàng gần Cửa số 12.",
        linkedSpeechTip: "'pick up a' nối liên tục thành /pɪk ʌp ə/.",
        grammarNote: "'pick up' = đến lấy / nhận trực tiếp.",
        keyVocab: [
          {
            word: "voucher",
            phonetic: "/ˈvaʊ.tʃər/",
            partOfSpeech: "noun",
            meaningVi: "phiếu quà tặng / phiếu ăn",
            exampleSentence: "Redeem your voucher before boarding.",
          },
        ],
      },
      {
        title: "Updated boarding gate",
        transcript: "Please keep your boarding pass handy and listen for further updates around eleven fifteen.",
        transcriptVi: "Vui lòng giữ thẻ lên máy bay sẵn trên tay và lắng nghe cập nhật tiếp theo vào khoảng 11 giờ 15.",
        linkedSpeechTip: "'around eleven' nối /dɪ/ mượt mà.",
        grammarNote: "'keep something handy' = giữ sẵn bên người để tiện dùng.",
        keyVocab: [
          {
            word: "boarding pass",
            phonetic: "/ˈbɔːr.dɪŋ pɑːs/",
            partOfSpeech: "noun phrase",
            meaningVi: "thẻ lên máy bay",
            exampleSentence: "Scan your digital boarding pass at the gate.",
          },
        ],
      },
    ],
  }),
  buildSet({
    id: "theme-b1-new-staff-orientation",
    title: "Orientation for New Employees",
    titleVi: "Định hướng nhân viên mới",
    cefrLevel: "B1",
    part: 4,
    topic: "hr",
    descriptionVi: "Bài phát biểu chào mừng nhân sự mới và lịch tham quan tòa nhà.",
    items: [
      {
        title: "Morning welcome packet",
        transcript: "Inside your welcome folder, you will find your building access badge and the employee handbook.",
        transcriptVi: "Bên trong tập hồ sơ chào mừng, bạn sẽ thấy thẻ ra vào tòa nhà và cuốn sổ tay nhân viên.",
        linkedSpeechTip: "'find your' nối /d/ với /j/ nhẹ.",
        grammarNote: "Đảo trạng ngữ chỉ nơi chốn lên đầu câu để nhấn mạnh.",
        keyVocab: [
          {
            word: "handbook",
            phonetic: "/ˈhænd.bʊk/",
            partOfSpeech: "noun",
            meaningVi: "sổ tay hướng dẫn",
            exampleSentence: "Dress code rules appear in the staff handbook.",
          },
        ],
      },
      {
        title: "IT setup session",
        transcript: "Right after the tour, our IT support team will help everyone configure company email accounts.",
        transcriptVi: "Ngay sau chuyến tham quan, đội hỗ trợ CNTT sẽ giúp mọi người thiết lập tài khoản email công ty.",
        linkedSpeechTip: "'help everyone' nối âm /p/ nhẹ sang /e/.",
        grammarNote: "'help someone (to) V' = giúp ai đó làm gì.",
        keyVocab: [
          {
            word: "configure",
            phonetic: "/kənˈfɪɡ.ər/",
            partOfSpeech: "verb",
            meaningVi: "cấu hình, cài đặt",
            exampleSentence: "Configure two-factor security on your phone.",
          },
        ],
      },
      {
        title: "Lunch with mentors",
        transcript: "At twelve thirty, department mentors will join you in the rooftop cafeteria for an informal lunch.",
        transcriptVi: "Vào 12 giờ 30, các anh chị hướng dẫn sẽ cùng dùng bữa trưa thân mật với bạn tại căng tin tầng thượng.",
        linkedSpeechTip: "'for an informal' nối liền /fər æn ɪnˈfɔːr.məl/.",
        grammarNote: "'informal' = thân mật, không gò bó nghi thức.",
        keyVocab: [
          {
            word: "mentor",
            phonetic: "/ˈmen.tɔːr/",
            partOfSpeech: "noun",
            meaningVi: "người hướng dẫn, cố vấn",
            exampleSentence: "Every trainee is paired with a senior mentor.",
          },
        ],
      },
    ],
  }),

  // ================= B2 (650–780) =================
  buildSet({
    id: "theme-b2-supply-chain",
    title: "Supply Chain Traceability",
    titleVi: "Truy xuất nguồn gốc chuỗi cung ứng",
    cefrLevel: "B2",
    part: 3,
    topic: "logistics",
    descriptionVi: "Thảo luận nâng cấp mã QR theo dõi lô hàng nguyên liệu.",
    items: [
      {
        title: "Scanning batch barcodes",
        transcript: "By upgrading to QR batch labels, warehouse staff can trace any raw ingredient back to its origin within seconds.",
        transcriptVi: "Bằng cách nâng cấp lên nhãn lô QR, nhân viên kho có thể truy ngược mọi nguyên liệu thô về nguồn gốc chỉ trong vài giây.",
        linkedSpeechTip: "'trace any' nối /treɪ.sen.i/.",
        grammarNote: "'By + V-ing' nêu giải pháp đạt được kết quả.",
        dialogue: [
          { speaker: "Ops Lead", text: "By upgrading to QR batch labels, warehouse staff can trace any raw ingredient back to its origin within seconds.", voiceName: "Charon" },
          { speaker: "Analyst", text: "That will also cut our monthly inventory audit time nearly in half.", voiceName: "Kore" },
        ],
        keyVocab: [
          {
            word: "traceability",
            phonetic: "/ˌtreɪ.səˈbɪl.ə.ti/",
            partOfSpeech: "noun",
            meaningVi: "khả năng truy xuất nguồn gốc",
            exampleSentence: "Retailers demand full supply chain traceability.",
          },
        ],
      },
      {
        title: "Syncing scanner firmware",
        transcript: "All handheld barcode scanners need a quick firmware update before Monday's morning shift begins.",
        transcriptVi: "Toàn bộ máy quét mã vạch cầm tay cần cập nhật phần mềm điều khiển nhanh trước ca sáng thứ Hai.",
        linkedSpeechTip: "'update before' nối gọn âm /t/ cuối 'update'.",
        grammarNote: "'need + N' diễn đạt yêu cầu kỹ thuật cần thiết.",
        keyVocab: [
          {
            word: "handheld",
            phonetic: "/ˈhænd.held/",
            partOfSpeech: "adjective",
            meaningVi: "cầm tay",
            exampleSentence: "Couriers carry handheld tracking devices.",
          },
        ],
      },
      {
        title: "Training regional hubs",
        transcript: "We have scheduled short video demonstrations for all three regional distribution hubs later this week.",
        transcriptVi: "Chúng tôi đã lên lịch trình chiếu video hướng dẫn ngắn cho cả ba trung tâm phân phối khu vực vào cuối tuần này.",
        linkedSpeechTip: "'all three' chú ý âm /θ/ rõ sau âm /l/.",
        grammarNote: "'distribution hub' = trung tâm trung chuyển / phân phối.",
        keyVocab: [
          {
            word: "distribution",
            phonetic: "/ˌdɪs.trɪˈbjuː.ʃən/",
            partOfSpeech: "noun",
            meaningVi: "sự phân phối",
            exampleSentence: "The distribution network covers twelve provinces.",
          },
        ],
      },
    ],
  }),
  buildSet({
    id: "theme-b2-customer-feedback",
    title: "Addressing Negative Feedback",
    titleVi: "Xử lý phản hồi chưa hài lòng",
    cefrLevel: "B2",
    part: 3,
    topic: "marketing",
    descriptionVi: "Hội thoại CSKH phân tích đánh giá tiêu cực và đề xuất phương án đền bù.",
    items: [
      {
        title: "Identifying packaging damage",
        transcript: "Several online buyers reported dented outer cartons despite the protective foam inserts we added last month.",
        transcriptVi: "Một số người mua trực tuyến phản ánh thùng ngoài bị móp dù chúng ta đã chèn thêm xốp bảo vệ tháng trước.",
        linkedSpeechTip: "'cartons despite' giữ âm /z/ trước /d/.",
        grammarNote: "'despite + N/Noun phrase' = mặc dù có...",
        dialogue: [
          { speaker: "Support", text: "Several online buyers reported dented outer cartons despite the protective foam inserts we added last month.", voiceName: "Kore" },
          { speaker: "Product", text: "Let us switch to double-walled cardboard and reach out personally with replacement vouchers.", voiceName: "Fenrir" },
        ],
        keyVocab: [
          {
            word: "replacement",
            phonetic: "/rɪˈpleɪs.mənt/",
            partOfSpeech: "noun",
            meaningVi: "sự thay thế, hàng đổi mới",
            exampleSentence: "We shipped a free replacement unit today.",
          },
        ],
      },
      {
        title: "Proactive follow-up email",
        transcript: "Sending a sincere follow-up within twenty-four hours often turns a frustrated buyer into a loyal advocate.",
        transcriptVi: "Gửi email hỏi thăm chân thành trong vòng 24 giờ thường biến người mua bực bội thành khách hàng trung thành.",
        linkedSpeechTip: "'turns a' nối thành /tɜːrnz ə/.",
        grammarNote: "Danh động từ 'Sending...' làm chủ ngữ số ít chia động từ 'turns'.",
        keyVocab: [
          {
            word: "proactive",
            phonetic: "/prəʊˈæk.tɪv/",
            partOfSpeech: "adjective",
            meaningVi: "chủ động xử lý trước",
            exampleSentence: "Take proactive steps to prevent delays.",
          },
        ],
      },
      {
        title: "Tracking weekly satisfaction",
        transcript: "Let us monitor our post-delivery satisfaction score every Friday to verify that the new packaging holds up.",
        transcriptVi: "Hãy theo dõi điểm hài lòng sau giao hàng mỗi thứ Sáu để xác nhận bao bì mới chịu lực tốt.",
        linkedSpeechTip: "'holds up' nối âm thành /həʊldz ʌp/.",
        grammarNote: "'hold up' = chịu được áp lực, giữ vững chất lượng.",
        keyVocab: [
          {
            word: "verify",
            phonetic: "/ˈver.ɪ.faɪ/",
            partOfSpeech: "verb",
            meaningVi: "xác minh, kiểm chứng",
            exampleSentence: "Verify the shipping address before dispatch.",
          },
        ],
      },
    ],
  }),
  buildSet({
    id: "theme-b2-market-recap",
    title: "Market Recap: Closing Bell",
    titleVi: "Bản tin tài chính cuối phiên",
    cefrLevel: "B2",
    part: 4,
    topic: "finance",
    descriptionVi: "Bản tin radio tổng kết chỉ số cổ phiếu công nghệ và năng lượng sạch.",
    items: [
      {
        title: "Tech sector rally",
        transcript: "Good afternoon. Domestic equities closed higher today, led by a two percent surge across semiconductor manufacturers.",
        transcriptVi: "Chào buổi chiều. Cổ phiếu trong nước đóng cửa tăng điểm hôm nay, dẫn đầu bởi mức tăng 2% ở nhóm sản xuất bán dẫn.",
        linkedSpeechTip: "'led by a' nối nhịp nhàng /led baɪ ə/.",
        grammarNote: "Phân từ quá khứ rút gọn mệnh đề quan hệ 'led by...'.",
        keyVocab: [
          {
            word: "surge",
            phonetic: "/sɜːrdʒ/",
            partOfSpeech: "noun / verb",
            meaningVi: "đà tăng vọt",
            exampleSentence: "There was a sharp surge in online orders.",
          },
        ],
      },
      {
        title: "Retail earnings beat",
        transcript: "Shares of Pacific Apparel climbed sharply after quarterly revenue exceeded analyst expectations by twelve million dollars.",
        transcriptVi: "Cổ phiếu của Pacific Apparel tăng mạnh sau khi doanh thu quý vượt dự báo của chuyên gia 12 triệu đô.",
        linkedSpeechTip: "'Shares of' nối nhẹ thành /ʃeəz əv/.",
        grammarNote: "'exceed expectations' = vượt kỳ vọng thị trường.",
        keyVocab: [
          {
            word: "revenue",
            phonetic: "/ˈrev.ən.juː/",
            partOfSpeech: "noun",
            meaningVi: "doanh thu",
            exampleSentence: "Annual revenue rose 14% year over year.",
          },
        ],
      },
      {
        title: "Upcoming central bank minutes",
        transcript: "Investors are now watching tomorrow's central bank minutes for clues on interest rate plans next quarter.",
        transcriptVi: "Nhà đầu tư đang theo dõi biên bản ngân hàng trung ương ngày mai để tìm tín hiệu lãi suất quý tới.",
        linkedSpeechTip: "'clues on' nối /kluː.zɒn/.",
        grammarNote: "'minutes' (số nhiều) trong ngữ cảnh họp = biên bản cuộc họp.",
        keyVocab: [
          {
            word: "interest rate",
            phonetic: "/ˈɪn.trəst reɪt/",
            partOfSpeech: "noun phrase",
            meaningVi: "lãi suất",
            exampleSentence: "Lower interest rates encourage borrowing.",
          },
        ],
      },
    ],
  }),
  buildSet({
    id: "theme-b2-quality-resolution",
    title: "Factory Quality Resolution",
    titleVi: "Xử lý sự cố chất lượng nhà máy",
    cefrLevel: "B2",
    part: 4,
    topic: "logistics",
    descriptionVi: "Thông báo kỹ thuật về hiệu chỉnh cảm biến nhiệt và kiểm tra lại dây chuyền.",
    items: [
      {
        title: "Isolating line four",
        transcript: "Following yesterday's packaging seal inspection, technicians temporarily paused Assembly Line Four to recalibrate the heat sensors.",
        transcriptVi: "Sau đợt kiểm tra mép hàn bao bì hôm qua, kỹ thuật viên đã tạm dừng Dây chuyền 4 để hiệu chỉnh lại cảm biến nhiệt.",
        linkedSpeechTip: "'paused Assembly' nối âm /z/ sang /ə/.",
        grammarNote: "'Following + N' = ngay sau sự kiện nào.",
        keyVocab: [
          {
            word: "recalibrate",
            phonetic: "/ˌriːˈkæl.ɪ.breɪt/",
            partOfSpeech: "verb",
            meaningVi: "hiệu chỉnh lại thông số",
            exampleSentence: "Recalibrate the scale every Monday.",
          },
        ],
      },
      {
        title: "Sampling safety margin",
        transcript: "Random quality samples pulled every twenty minutes now fall well within our strict international tolerance margin.",
        transcriptVi: "Các mẫu kiểm định ngẫu nhiên lấy mỗi 20 phút hiện đều nằm gọn trong biên độ sai số quốc tế nghiêm ngặt.",
        linkedSpeechTip: "'well within' đọc liền mạch không ngắt.",
        grammarNote: "'fall within + ngưỡng' = nằm trong phạm vi cho phép.",
        keyVocab: [
          {
            word: "tolerance margin",
            phonetic: "/ˈtɒl.ər.əns ˈmɑːr.dʒɪn/",
            partOfSpeech: "noun phrase",
            meaningVi: "biên độ sai số cho phép",
            exampleSentence: "Maintain tight tolerance margins in production.",
          },
        ],
      },
      {
        title: "Preventing repeat downtime",
        transcript: "Automated alert thresholds have been lowered so supervisors receive instant warnings before minor drift becomes waste.",
        transcriptVi: "Ngưỡng cảnh báo tự động đã được hạ thấp để giám sát viên nhận tin tức thì trước khi sai lệch nhỏ gây hao hụt.",
        linkedSpeechTip: "'alerts' và 'thresholds' giữ cụm phụ âm cuối rõ.",
        grammarNote: "'so (that) + mệnh đề' chỉ mục đích.",
        keyVocab: [
          {
            word: "threshold",
            phonetic: "/ˈθreʃ.həʊld/",
            partOfSpeech: "noun",
            meaningVi: "ngưỡng giới hạn",
            exampleSentence: "Set a minimum alert threshold.",
          },
        ],
      },
    ],
  }),

  // ================= C1 (780–880) =================
  buildSet({
    id: "theme-c1-customs-passport",
    title: "Customs & Passport Validity",
    titleVi: "Thủ tục hải quan & Hộ chiếu",
    cefrLevel: "C1",
    part: 3,
    topic: "travel",
    descriptionVi: "Hội thoại tốc độ cao tại quầy thủ tục quốc tế xử lý hạn hộ chiếu 6 tháng.",
    items: [
      {
        title: "Six-month validity rule",
        transcript: "Under entry regulations at your destination, passports must remain valid for at least six months beyond your return date.",
        transcriptVi: "Theo quy định nhập cảnh tại điểm đến, hộ chiếu phải còn hiệu lực ít nhất sáu tháng sau ngày về.",
        linkedSpeechTip: "'valid for at least' nối /fər æt liːst/.",
        grammarNote: "'beyond + mốc thời gian' = vượt quá mốc thời gian đó.",
        dialogue: [
          { speaker: "Agent", text: "Under entry regulations at your destination, passports must remain valid for at least six months beyond your return date.", voiceName: "Kore" },
          { speaker: "Passenger", text: "Oh no, mine expires in four months! Is there an emergency consulate desk or rebooking option?", voiceName: "Puck" },
        ],
        keyVocab: [
          {
            word: "regulations",
            phonetic: "/ˌreɡ.jəˈleɪ.ʃənz/",
            partOfSpeech: "noun (plural)",
            meaningVi: "quy định pháp lý",
            exampleSentence: "Airport staff enforce customs regulations strictly.",
          },
        ],
      },
      {
        title: "Transferring fare credit",
        transcript: "Because you hold a flexible corporate fare, we can apply the full ticket value toward next week's departure without penalty.",
        transcriptVi: "Vì bạn sở hữu hạng vé doanh nghiệp linh hoạt, chúng tôi có thể bảo lưu toàn bộ giá trị vé sang chuyến tuần sau mà không phạt phí.",
        linkedSpeechTip: "'apply the full' đọc nhấn trọng âm đều trên 'apply', 'full', 'value'.",
        grammarNote: "'without penalty' = không bị tính phí phạt.",
        keyVocab: [
          {
            word: "flexible fare",
            phonetic: "/ˈflek.sə.bəl feər/",
            partOfSpeech: "noun phrase",
            meaningVi: "hạng vé đổi lịch linh hoạt",
            exampleSentence: "Business travelers often book flexible fares.",
          },
        ],
      },
      {
        title: "Expedited renewal guidance",
        transcript: "You can submit an expedited passport renewal online this afternoon and upload the confirmation once issued.",
        transcriptVi: "Bạn có thể nộp hồ sơ gia hạn hộ chiếu khẩn trực tuyến chiều nay và tải xác nhận lên ngay khi được cấp.",
        linkedSpeechTip: "'once issued' nối âm cuối /s/ nhẹ sang /ɪ/.",
        grammarNote: "'once + V3/ed' rút gọn mệnh đề thời gian chủ động/bị động.",
        keyVocab: [
          {
            word: "expedited",
            phonetic: "/ˈek.spə.daɪ.tɪd/",
            partOfSpeech: "adjective",
            meaningVi: "được xử lý khẩn, tăng tốc",
            exampleSentence: "Choose expedited shipping for urgent parts.",
          },
        ],
      },
    ],
  }),
  buildSet({
    id: "theme-c1-gmp-audit",
    title: "GMP Plant Inspection Audit",
    titleVi: "Thanh tra tiêu chuẩn GMP nhà máy",
    cefrLevel: "C1",
    part: 3,
    topic: "logistics",
    descriptionVi: "Trao đổi kiểm toán quy trình vệ sinh công nghiệp và tài liệu ISO.",
    items: [
      {
        title: "Sanitation log verification",
        transcript: "Auditors will cross-check sanitation sign-off logs against water filtration pressure readings from the past ninety days.",
        transcriptVi: "Kiểm toán viên sẽ đối chiếu chéo nhật ký ký xác nhận vệ sinh với chỉ số áp suất lọc nước trong 90 ngày qua.",
        linkedSpeechTip: "'against water' đọc lướt âm /t/ giữa cụm phụ âm.",
        grammarNote: "'cross-check A against B' = đối chiếu A với B.",
        dialogue: [
          { speaker: "Auditor", text: "Auditors will cross-check sanitation sign-off logs against water filtration pressure readings from the past ninety days.", voiceName: "Charon" },
          { speaker: "Supervisor", text: "Every shift record is digitized and backed up with timestamped supervisor approvals.", voiceName: "Zephyr" },
        ],
        keyVocab: [
          {
            word: "cross-check",
            phonetic: "/ˈkrɒs.tʃek/",
            partOfSpeech: "verb",
            meaningVi: "kiểm tra đối chiếu chéo",
            exampleSentence: "Cross-check receipts against the ledger.",
          },
        ],
      },
      {
        title: "Addressing minor discrepancy",
        transcript: "If any calibration sticker appears faded, replace it immediately and attach the lab certificate to the binder.",
        transcriptVi: "Nếu bất kỳ tem hiệu chuẩn nào bị mờ, hãy thay mới ngay và đính kèm chứng thư phòng lab vào tập hồ sơ.",
        linkedSpeechTip: "'appears faded' nối âm /z/ nhẹ.",
        grammarNote: "Câu mệnh lệnh kết hợp câu điều kiện thực tế.",
        keyVocab: [
          {
            word: "discrepancy",
            phonetic: "/dɪˈskrep.ən.si/",
            partOfSpeech: "noun",
            meaningVi: "sự sai lệch, chênh lệch",
            exampleSentence: "Explain any inventory discrepancy.",
          },
        ],
      },
      {
        title: "Corrective action timeline",
        transcript: "All corrective measures noted during the walkthrough must be closed out and documented within ten business days.",
        transcriptVi: "Mọi biện pháp khắc phục ghi nhận trong buổi khảo sát thực tế phải được hoàn tất và lập hồ sơ trong 10 ngày làm việc.",
        linkedSpeechTip: "'closed out and' nối liền /kləʊz.daʊ.tənd/.",
        grammarNote: "'close out' = hoàn thành dứt điểm hạng mục.",
        keyVocab: [
          {
            word: "corrective",
            phonetic: "/kəˈrek.tɪv/",
            partOfSpeech: "adjective",
            meaningVi: "mang tính khắc phục, sửa lỗi",
            exampleSentence: "Submit a corrective action plan.",
          },
        ],
      },
    ],
  }),
  buildSet({
    id: "theme-c1-flight-safety",
    title: "Pre-Flight Safety Briefing",
    titleVi: "Hướng dẫn an toàn bay nâng cao",
    cefrLevel: "C1",
    part: 4,
    topic: "travel",
    descriptionVi: "Thông báo của cơ trưởng về thời tiết nhiễu động và chuyển hướng dự phòng.",
    items: [
      {
        title: "Turbulence advisory",
        transcript: "Ladies and gentlemen, we anticipate moderate turbulence over the coastal range roughly forty minutes after takeoff.",
        transcriptVi: "Thưa quý khách, chúng tôi dự báo sẽ có vùng nhiễu động trung bình trên dãy núi ven biển sau khoảng 40 phút cất cánh.",
        linkedSpeechTip: "'Ladies and gentlemen' đọc nối mượt /ˈleɪ.di.zən ˈdʒen.təl.mən/.",
        grammarNote: "'anticipate + N' = dự đoán trước điều gì.",
        keyVocab: [
          {
            word: "turbulence",
            phonetic: "/ˈtɜːr.bjə.ləns/",
            partOfSpeech: "noun",
            meaningVi: "sự nhiễu động không khí",
            exampleSentence: "Fasten your seat belt during turbulence.",
          },
        ],
      },
      {
        title: "Electronic device stowage",
        transcript: "Please ensure heavy laptops are stowed securely beneath the seat in front of you prior to cabin crew verification.",
        transcriptVi: "Vui lòng đảm bảo máy tính xách tay nặng được cất gọn dưới ghế phía trước trước khi tiếp viên kiểm tra khoang.",
        linkedSpeechTip: "'front of you' nối nhẹ /frʌn.təv juː/.",
        grammarNote: "'prior to + N' = trước khi.",
        keyVocab: [
          {
            word: "stow",
            phonetic: "/stəʊ/",
            partOfSpeech: "verb",
            meaningVi: "cất giữ gọn gàng",
            exampleSentence: "Stow carry-on luggage in the overhead bin.",
          },
        ],
      },
      {
        title: "Alternate landing protocol",
        transcript: "Should crosswinds intensify at our destination, we carry ample fuel reserves to divert smoothly to our designated alternate airfield.",
        transcriptVi: "Nếu gió ngang mạnh lên tại điểm đến, máy bay mang đủ nhiên liệu dự trữ để chuyển hướng êm ái sang sân bay dự bị chỉ định.",
        linkedSpeechTip: "'Should crosswinds' dùng đảo ngữ điều kiện loại 1 trang trọng.",
        grammarNote: "Đảo ngữ 'Should + S + V' thay cho 'If + S + V'.",
        keyVocab: [
          {
            word: "divert",
            phonetic: "/daɪˈvɜːrt/",
            partOfSpeech: "verb",
            meaningVi: "chuyển hướng",
            exampleSentence: "Heavy fog forced two flights to divert.",
          },
        ],
      },
    ],
  }),
  buildSet({
    id: "theme-c1-product-recall",
    title: "Product Recall Protocol",
    titleVi: "Quy trình thu hồi sản phẩm khẩn",
    cefrLevel: "C1",
    part: 4,
    topic: "logistics",
    descriptionVi: "Thông báo nội bộ xử lý thu hồi lô đồ uống và liên hệ đại lý phân phối.",
    items: [
      {
        title: "Quarantining affected lot",
        transcript: "Effective immediately, all regional depots must quarantine Beverage Lot B-409 pending laboratory retesting.",
        transcriptVi: "Có hiệu lực ngay lập tức, toàn bộ kho vùng phải cách ly Lô đồ uống B-409 trong thời gian chờ xét nghiệm lại.",
        linkedSpeechTip: "'Effective immediately' giữ trọng âm rõ ở âm tiết thứ hai.",
        grammarNote: "'pending + N' = trong khi chờ đợi kết quả.",
        keyVocab: [
          {
            word: "quarantine",
            phonetic: "/ˈkwɒr.ən.tiːn/",
            partOfSpeech: "verb / noun",
            meaningVi: "cách ly, tạm giữ kiểm tra",
            exampleSentence: "Quarantine suspect pallets away from shipping.",
          },
        ],
      },
      {
        title: "Notifying retail partners",
        transcript: "Account managers are instructed to issue direct recall notices to retail partners before store opening hours.",
        transcriptVi: "Quản lý khách hàng được yêu cầu phát thông báo thu hồi trực tiếp tới các đối tác bán lẻ trước giờ mở cửa hàng.",
        linkedSpeechTip: "'direct recall' đọc rõ phụ âm /t/ trước /r/.",
        grammarNote: "'be instructed to V' = được chỉ thị thực hiện.",
        keyVocab: [
          {
            word: "recall",
            phonetic: "/rɪˈkɔːl/",
            partOfSpeech: "noun / verb",
            meaningVi: "thu hồi sản phẩm lỗi",
            exampleSentence: "The automaker issued a voluntary safety recall.",
          },
        ],
      },
      {
        title: "Consumer hotline staffing",
        transcript: "Customer care lines will stay staffed around the clock through Sunday to process full consumer reimbursements.",
        transcriptVi: "Đường dây chăm sóc khách hàng sẽ trực 24/24 hết Chủ nhật để xử lý hoàn tiền toàn bộ cho người tiêu dùng.",
        linkedSpeechTip: "'around the clock' đọc nối mượt mà.",
        grammarNote: "'around the clock' = suốt ngày đêm không nghỉ.",
        keyVocab: [
          {
            word: "reimbursement",
            phonetic: "/ˌriː.ɪmˈbɜːrs.mənt/",
            partOfSpeech: "noun",
            meaningVi: "sự hoàn trả tiền",
            exampleSentence: "Keep receipts for travel reimbursement.",
          },
        ],
      },
    ],
  }),

  // ================= C2 (880–990) =================
  buildSet({
    id: "theme-c2-merger-diligence",
    title: "Cross-Border M&A Diligence",
    titleVi: "Thẩm định sáp nhập xuyên biên giới",
    cefrLevel: "C2",
    part: 3,
    topic: "finance",
    descriptionVi: "Hội thoại cấp điều hành phân tích rủi ro sở hữu trí tuệ và định giá tài sản.",
    items: [
      {
        title: "Auditing patent encumbrances",
        transcript: "Before finalizing the acquisition term sheet, legal counsel flagged two licensing covenants tied to European software patents.",
        transcriptVi: "Trước khi chốt bản điều khoản mua lại, cố vấn pháp lý đã lưu ý hai giao ước cấp phép gắn với bằng sáng chế phần mềm châu Âu.",
        linkedSpeechTip: "'acquisition term' nối rõ nhịp câu dài đa mệnh đề.",
        grammarNote: "'covenant' = điều khoản cam kết ràng buộc trong hợp đồng tài chính.",
        dialogue: [
          { speaker: "CFO", text: "Before finalizing the acquisition term sheet, legal counsel flagged two licensing covenants tied to European software patents.", voiceName: "Fenrir" },
          { speaker: "Partner", text: "Let us carve out an escrow contingency until those cross-licensing obligations are explicitly reassigned.", voiceName: "Kore" },
        ],
        keyVocab: [
          {
            word: "acquisition",
            phonetic: "/ˌæk.wɪˈzɪʃ.ən/",
            partOfSpeech: "noun",
            meaningVi: "thương vụ mua lại doanh nghiệp",
            exampleSentence: "The acquisition closed in the third quarter.",
          },
        ],
      },
      {
        title: "Escrow valuation buffer",
        transcript: "Holding twelve percent of the purchase price in escrow for eighteen months shields buyers against undisclosed tax liabilities.",
        transcriptVi: "Giữ lại 12% giá mua trong tài khoản ký quỹ suốt 18 tháng giúp bên mua phòng ngừa các nghĩa vụ thuế chưa công bố.",
        linkedSpeechTip: "'shields buyers against' nối âm /z/ đều giữa các danh từ.",
        grammarNote: "'shield A against B' = bảo vệ A khỏi rủi ro B.",
        keyVocab: [
          {
            word: "liability",
            phonetic: "/ˌlaɪ.əˈbɪl.ə.ti/",
            partOfSpeech: "noun",
            meaningVi: "nghĩa vụ nợ, trách nhiệm pháp lý",
            exampleSentence: "Review contingent liabilities on the balance sheet.",
          },
        ],
      },
      {
        title: "Synergy realization milestone",
        transcript: "Post-merger integration savings depend heavily on consolidating redundant cloud infrastructure within two quarters.",
        transcriptVi: "Khoản tiết kiệm hợp nhất sau sáp nhập phụ thuộc lớn vào việc gộp hạ tầng đám mây trùng lặp trong vòng hai quý.",
        linkedSpeechTip: "'consolidating redundant' giữ trọng âm chính xác ở âm thứ 2 của cả hai từ.",
        grammarNote: "'consolidate' = hợp nhất, tinh gọn.",
        keyVocab: [
          {
            word: "consolidate",
            phonetic: "/kənˈsɒl.ɪ.deɪt/",
            partOfSpeech: "verb",
            meaningVi: "hợp nhất, củng cố",
            exampleSentence: "Consolidate regional offices into one hub.",
          },
        ],
      },
    ],
  }),
  buildSet({
    id: "theme-c2-pharma-compliance",
    title: "Regulatory Compliance Review",
    titleVi: "Đánh giá tuân thủ pháp chế chuyên sâu",
    cefrLevel: "C2",
    part: 3,
    topic: "hr",
    descriptionVi: "Trao đổi kiểm soát dữ liệu thử nghiệm, tiêu chuẩn bảo mật và báo cáo định kỳ.",
    items: [
      {
        title: "Harmonizing regional filings",
        transcript: "Harmonizing clinical documentation templates across both jurisdictions eliminates months of redundant regulatory review.",
        transcriptVi: "Chuẩn hóa thống nhất biểu mẫu hồ sơ giữa hai khu vực pháp lý giúp loại bỏ nhiều tháng thẩm định trùng lặp.",
        linkedSpeechTip: "'jurisdictions eliminates' nối âm /zɪ/ liên hoàn.",
        grammarNote: "'jurisdiction' = phạm vi quyền hạn pháp lý.",
        dialogue: [
          { speaker: "Director", text: "Harmonizing clinical documentation templates across both jurisdictions eliminates months of redundant regulatory review.", voiceName: "Charon" },
          { speaker: "Lead", text: "Agreed—let us appoint a dedicated compliance liaison to oversee validation sign-offs.", voiceName: "Zephyr" },
        ],
        keyVocab: [
          {
            word: "regulatory",
            phonetic: "/ˈreɡ.jə.lə.tər.i/",
            partOfSpeech: "adjective",
            meaningVi: "thuộc quy định pháp chế",
            exampleSentence: "The product passed every regulatory hurdle.",
          },
        ],
      },
      {
        title: "Data integrity audit trail",
        transcript: "Every revision to laboratory spreadsheets must generate an immutable audit trail recording user identity and rationale.",
        transcriptVi: "Mọi chỉnh sửa trên bảng tính phòng thí nghiệm phải tạo ra nhật ký kiểm toán bất biến ghi rõ danh tính và lý do.",
        linkedSpeechTip: "'immutable audit' nối nguyên âm mượt mà.",
        grammarNote: "'audit trail' = dấu vết kiểm toán truy xuất lịch sử.",
        keyVocab: [
          {
            word: "rationale",
            phonetic: "/ˌræʃ.əˈnɑːl/",
            partOfSpeech: "noun",
            meaningVi: "cơ sở lý do cốt lõi",
            exampleSentence: "State the rationale behind the budget shift.",
          },
        ],
      },
      {
        title: "Whistleblower protection channel",
        transcript: "Our ethics charter guarantees anonymous reporting channels free from any form of workplace retaliation.",
        transcriptVi: "Quy tắc đạo đức của chúng tôi bảo đảm kênh báo cáo ẩn danh hoàn toàn không bị trả đũa tại nơi làm việc.",
        linkedSpeechTip: "'guarantees anonymous' giữ trường độ nguyên âm dài rõ.",
        grammarNote: "'free from + N' = hoàn toàn tránh khỏi điều gì.",
        keyVocab: [
          {
            word: "anonymous",
            phonetic: "/əˈnɒn.ɪ.məs/",
            partOfSpeech: "adjective",
            meaningVi: "ẩn danh",
            exampleSentence: "Employees completed an anonymous survey.",
          },
        ],
      },
    ],
  }),
  buildSet({
    id: "theme-c2-shareholder-keynote",
    title: "Annual Shareholder Keynote",
    titleVi: "Phát biểu đại hội cổ đông thường niên",
    cefrLevel: "C2",
    part: 4,
    topic: "finance",
    descriptionVi: "Diễn văn tổng kết biên lợi nhuận, phân bổ vốn và định hướng tăng trưởng.",
    items: [
      {
        title: "Operating margin expansion",
        transcript: "Despite currency headwinds across emerging markets, disciplined cost stewardship expanded our operating margin by one hundred eighty basis points.",
        transcriptVi: "Bất chấp bất lợi tỷ giá tại các thị trường mới nổi, việc quản trị chi phí kỷ luật đã mở rộng biên lợi nhuận hoạt động thêm 180 điểm cơ bản.",
        linkedSpeechTip: "'currency headwinds' nhấn trọng âm đúng trên âm đầu mỗi từ.",
        grammarNote: "'basis point' = 0.01% trong thuật ngữ tài chính.",
        keyVocab: [
          {
            word: "headwind",
            phonetic: "/ˈhed.wɪnd/",
            partOfSpeech: "noun",
            meaningVi: "yếu tố cản trở bất lợi",
            exampleSentence: "Higher shipping rates created margin headwinds.",
          },
        ],
      },
      {
        title: "Capital allocation discipline",
        transcript: "Rather than pursuing speculative acquisitions, the board prioritized debt reduction and targeted research investments.",
        transcriptVi: "Thay vì chạy theo các thương vụ mua lại mang tính đầu cơ, hội đồng quản trị ưu tiên giảm nợ và đầu tư nghiên cứu có trọng tâm.",
        linkedSpeechTip: "'Rather than' đọc nối nhẹ /ð/ không ngắt.",
        grammarNote: "'Rather than + V-ing' = thay vì làm gì.",
        keyVocab: [
          {
            word: "prioritize",
            phonetic: "/praɪˈɒr.ɪ.taɪz/",
            partOfSpeech: "verb",
            meaningVi: "ưu tiên hàng đầu",
            exampleSentence: "Prioritize safety over speed.",
          },
        ],
      },
      {
        title: "Forward revenue guidance",
        transcript: "Looking ahead to fiscal twenty-seven, recurring enterprise subscriptions are projected to comprise over sixty percent of consolidated earnings.",
        transcriptVi: "Hướng tới năm tài chính 2027, doanh thu thuê bao doanh nghiệp định kỳ dự kiến chiếm hơn 60% lợi nhuận hợp nhất.",
        linkedSpeechTip: "'projected to comprise' đọc gọn nhóm âm /ktɪd tə/.",
        grammarNote: "'comprise' = bao gồm / chiếm tỷ trọng.",
        keyVocab: [
          {
            word: "projected",
            phonetic: "/prəˈdʒek.tɪd/",
            partOfSpeech: "adjective",
            meaningVi: "được dự phóng, ước tính",
            exampleSentence: "Projected demand remains resilient.",
          },
        ],
      },
    ],
  }),
  buildSet({
    id: "theme-c2-logistics-contingency",
    title: "Global Logistics Contingency",
    titleVi: "Phương án dự phòng chuỗi cung ứng toàn cầu",
    cefrLevel: "C2",
    part: 4,
    topic: "logistics",
    descriptionVi: "Thông báo điều phối vận tải đa phương thức trước gián đoạn cảng biển.",
    items: [
      {
        title: "Rerouting maritime freight",
        transcript: "To mitigate congestion at Pacific port terminals, logistics planners have shifted priority electronics cargo onto expedited rail corridors.",
        transcriptVi: "Để giảm thiểu ùn tắc tại các cảng Thái Bình Dương, đội điều phối đã chuyển lô hàng điện tử ưu tiên sang hành lang đường sắt tốc độ cao.",
        linkedSpeechTip: "'shifted priority' đọc rõ đuôi /-ɪd/ trước /pr/.",
        grammarNote: "'mitigate' = giảm nhẹ tác động tiêu cực.",
        keyVocab: [
          {
            word: "mitigate",
            phonetic: "/ˈmɪt.ɪ.ɡeɪt/",
            partOfSpeech: "verb",
            meaningVi: "giảm nhẹ, hạn chế rủi ro",
            exampleSentence: "Dual sourcing mitigates supply disruptions.",
          },
        ],
      },
      {
        title: "Buffer stock replenishment",
        transcript: "Safety inventory buffers at inland fulfillment centers will be replenished incrementally ahead of peak holiday demand.",
        transcriptVi: "Lượng hàng dự phòng an toàn tại các trung tâm hoàn tất đơn nội địa sẽ được bổ sung từng bước trước cao điểm lễ hội.",
        linkedSpeechTip: "'replenished incrementally' giữ rõ đuôi /-ʃt/ nối sang /ɪ/.",
        grammarNote: "'ahead of + N' = đi trước / chuẩn bị trước.",
        keyVocab: [
          {
            word: "replenish",
            phonetic: "/rɪˈplen.ɪʃ/",
            partOfSpeech: "verb",
            meaningVi: "bổ sung lại kho hàng",
            exampleSentence: "Stock clerks replenish shelves nightly.",
          },
        ],
      },
      {
        title: "Real-time customs pre-clearance",
        transcript: "Electronic manifest pre-clearance enables customs brokers to release incoming containers within hours of vessel docking.",
        transcriptVi: "Khai báo trước bảng kê điện tử giúp đại lý hải quan thông quan container nhập cảnh chỉ vài giờ sau khi tàu cập bến.",
        linkedSpeechTip: "'hours of vessel' nối âm mượt mà.",
        grammarNote: "'enable someone to V' = cho phép ai làm được việc gì.",
        keyVocab: [
          {
            word: "manifest",
            phonetic: "/ˈmæn.ɪ.fest/",
            partOfSpeech: "noun",
            meaningVi: "bảng kê khai hàng hóa vận chuyển",
            exampleSentence: "Verify the cargo manifest before unloading.",
          },
        ],
      },
    ],
  }),
];
