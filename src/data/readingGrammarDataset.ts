import { ETS_2026_PART5_GRAMMAR_QUESTIONS } from "./ets2026/ets2026ReadingDataset";

export interface GrammarQuestionItem {
  id: string;
  subtopicId: string;
  subtopicName: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  grammarRule: string;
  translationVi: string;
  vocab: {
    word: string;
    pos: string;
    phonetic: string;
    meaningVi: string;
  }[];
}

export interface GrammarSubtopic {
  id: string;
  title: string;
  count: number;
}

export interface GrammarTopic {
  id: string;
  title: string;
  category: "Từ loại" | "Động từ" | "Ngữ pháp khác";
  totalCount: number;
  subtopics: GrammarSubtopic[];
  questions: GrammarQuestionItem[];
}

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    id: "ets-2026-special",
    title: "Chuyên đề ETS 2026 Trọng điểm",
    category: "Từ loại",
    totalCount: ETS_2026_PART5_GRAMMAR_QUESTIONS.length,
    subtopics: [
      { id: "mixed", title: "Tổng hợp Đề thi 2026", count: ETS_2026_PART5_GRAMMAR_QUESTIONS.length },
      { id: "position", title: "Vị trí từ loại", count: 2 },
    ],
    questions: ETS_2026_PART5_GRAMMAR_QUESTIONS,
  },
  {
    id: "noun",
    title: "Danh từ",
    category: "Từ loại",
    totalCount: 287,
    subtopics: [
      { id: "mixed", title: "Hỗn hợp", count: 287 },
      { id: "position", title: "Vị trí của danh từ", count: 68 },
      { id: "compound", title: "Danh từ ghép", count: 11 },
      { id: "determiners", title: "Từ hạn định và cụm danh từ", count: 64 },
      { id: "singular", title: "Danh từ số ít không đứng một mình", count: 16 },
      { id: "uncountable", title: "Danh từ không đếm được", count: 16 },
      { id: "person_thing", title: "Danh từ chỉ người và chỉ vật", count: 10 },
      { id: "suffix_al_ive", title: "Danh từ đuôi -al và -ive", count: 20 },
      { id: "suffixes", title: "Hậu tố từ loại", count: 82 },
    ],
    questions: [
      {
        id: "noun-1",
        subtopicId: "mixed",
        subtopicName: "Hỗn hợp",
        questionText: 'Từ "powerful" thuộc loại từ nào?',
        options: [
          "(A) Động từ",
          "(B) Danh từ",
          "(C) Tính từ",
          "(D) Trạng từ",
        ],
        correctIndex: 2,
        explanation:
          'Từ "powerful" có đuôi "-ful" gắn sau danh từ "power", đây là hậu tố điển hình cấu tạo nên Tính từ (Adjective) mang ý nghĩa "hùng mạnh, quyền năng".',
        grammarRule:
          "Công thức hậu tố tính từ: Noun + -ful -> Adjective (peaceful, successful, powerful, harmful).",
        translationVi:
          'Từ "powerful" có nghĩa là "hùng mạnh, có uy lực" và thuộc loại tính từ.',
        vocab: [
          {
            word: "powerful",
            pos: "adj",
            phonetic: "/ˈpaʊərfəl/",
            meaningVi: "hùng mạnh, có năng lực lớn",
          },
          {
            word: "power",
            pos: "n",
            phonetic: "/ˈpaʊər/",
            meaningVi: "sức mạnh, năng lượng, quyền lực",
          },
        ],
      },
      {
        id: "noun-2",
        subtopicId: "position",
        subtopicName: "Vị trí của danh từ",
        questionText:
          "The company will announce its annual _______ at the upcoming shareholder convention.",
        options: [
          "(A) profit",
          "(B) profitable",
          "(C) profitably",
          "(D) profiteer",
        ],
        correctIndex: 0,
        explanation:
          'Sau tính từ "annual" và tính từ sở hữu "its", chỗ trống cần một Danh từ số ít/số nhiều để làm tân ngữ cho ngoại động từ "announce". "Profit" (lợi nhuận) là danh từ phù hợp nhất về ngữ nghĩa.',
        grammarRule:
          "Trật tự cụm danh từ: Possessive Adjective + Descriptive Adjective + NOUN (its annual profit).",
        translationVi:
          "Công ty sẽ công bố mức lợi nhuận hàng năm tại đại hội cổ đông sắp tới.",
        vocab: [
          {
            word: "profit",
            pos: "n",
            phonetic: "/ˈprɒfɪt/",
            meaningVi: "lợi nhuận, tiền lãi",
          },
          {
            word: "shareholder",
            pos: "n",
            phonetic: "/ˈʃeərhəʊldər/",
            meaningVi: "cổ đông",
          },
          {
            word: "convention",
            pos: "n",
            phonetic: "/kənˈvɛnʃən/",
            meaningVi: "đại hội, hội nghị thường niên",
          },
        ],
      },
      {
        id: "noun-3",
        subtopicId: "compound",
        subtopicName: "Danh từ ghép",
        questionText:
          "Employees must display their identification _______ at all security checkpoints.",
        options: [
          "(A) badges",
          "(B) badly",
          "(C) badging",
          "(D) badged",
        ],
        correctIndex: 0,
        explanation:
          '"identification badge" (thẻ nhận dạng/thẻ nhân viên) là danh từ ghép cố định quen thuộc trong môi trường công sở TOEIC.',
        grammarRule:
          "Danh từ ghép (Compound Noun): Noun + Noun (identification badge, assembly line, safety inspection).",
        translationVi:
          "Nhân viên phải xuất trình thẻ nhận diện của mình tại tất cả các trạm kiểm soát an ninh.",
        vocab: [
          {
            word: "badge",
            pos: "n",
            phonetic: "/bædʒ/",
            meaningVi: "huy hiệu, thẻ đeo",
          },
          {
            word: "checkpoint",
            pos: "n",
            phonetic: "/ˈtʃɛk.pɔɪnt/",
            meaningVi: "trạm kiểm soát",
          },
        ],
      },
      {
        id: "noun-4",
        subtopicId: "suffix_al_ive",
        subtopicName: "Danh từ đuôi -al và -ive",
        questionText:
          "The board of directors submitted their final _______ for the new office expansion project.",
        options: [
          "(A) approve",
          "(B) approval",
          "(C) approvingly",
          "(D) approvable",
        ],
        correctIndex: 1,
        explanation:
          'Đuôi "-al" thường gặp ở tính từ (formal, normal), nhưng có một nhóm danh từ đặc biệt đuôi "-al" rất hay ra trong TOEIC: approval (sự phê duyệt), proposal (bản đề xuất), arrival (sự đến), removal (sự tháo dỡ). Ở đây cần danh từ sau tính từ "final".',
        grammarRule:
          "Danh từ đuôi -al trọng điểm TOEIC: approval, proposal, refusal, arrival, renewal, dismissal.",
        translationVi:
          "Hội đồng quản trị đã đệ trình bản phê duyệt cuối cùng cho dự án mở rộng văn phòng mới.",
        vocab: [
          {
            word: "approval",
            pos: "n",
            phonetic: "/əˈpruːvəl/",
            meaningVi: "sự phê duyệt, chấp thuận",
          },
          {
            word: "expansion",
            pos: "n",
            phonetic: "/ɪkˈspænʃən/",
            meaningVi: "sự mở rộng",
          },
        ],
      },
      {
        id: "noun-5",
        subtopicId: "determiners",
        subtopicName: "Từ hạn định và cụm danh từ",
        questionText:
          "_______ attendee received a complimentary conference welcome packet upon arrival.",
        options: [
          "(A) Every",
          "(B) All",
          "(C) Several",
          "(D) Both",
        ],
        correctIndex: 0,
        explanation:
          '"Attendee" là danh từ đếm được số ít, động từ "received" đi sau. "Every" đi kèm trực tiếp với danh từ đếm được số ít (Every + Singular Countable Noun). "All", "Several", "Both" đi với danh từ số nhiều.',
        grammarRule:
          "Từ hạn định: Each / Every + Danh từ đếm được số ít; All / Several / Many + Danh từ số nhiều.",
        translationVi:
          "Mỗi người tham dự đều nhận được một tập tài liệu chào mừng hội nghị miễn phí khi đến nơi.",
        vocab: [
          {
            word: "attendee",
            pos: "n",
            phonetic: "/əˌtɛnˈdiː/",
            meaningVi: "người tham dự",
          },
          {
            word: "complimentary",
            pos: "adj",
            phonetic: "/ˌkɒmplɪˈmɛntəri/",
            meaningVi: "miễn phí, tặng kèm",
          },
        ],
      },
    ],
  },
  {
    id: "adjective",
    title: "Tính từ",
    category: "Từ loại",
    totalCount: 130,
    subtopics: [
      { id: "mixed", title: "Hỗn hợp", count: 130 },
      { id: "position", title: "Vị trí tính từ trước danh từ", count: 45 },
      { id: "linking_verbs", title: "Tính từ sau Linking Verbs", count: 35 },
      { id: "participles", title: "Tính từ đuôi -ed và -ing", count: 30 },
      { id: "order", title: "Trật tự của nhiều tính từ", count: 20 },
    ],
    questions: [
      {
        id: "adj-1",
        subtopicId: "mixed",
        subtopicName: "Hỗn hợp",
        questionText:
          "The newly renovated auditorium is _______ for hosting international seminars.",
        options: [
          "(A) suit",
          "(B) suitably",
          "(C) suitable",
          "(D) suitability",
        ],
        correctIndex: 2,
        explanation:
          'Sau động từ to-be "is", ta cần một Tính từ (be + Adjective + for). "Suitable" (thích hợp) tạo thành cụm "be suitable for" (phù hợp cho việc gì).',
        grammarRule:
          "Cấu trúc: S + to-be / linking verb + Adjective (suitable, capable, eligible, responsible).",
        translationVi:
          "Hội trường mới được cải tạo rất thích hợp để tổ chức các hội thảo quốc tế.",
        vocab: [
          {
            word: "suitable",
            pos: "adj",
            phonetic: "/ˈsuːtəbəl/",
            meaningVi: "thích hợp, phù hợp",
          },
          {
            word: "auditorium",
            pos: "n",
            phonetic: "/ˌɔːdɪˈtɔːriəm/",
            meaningVi: "khán phòng, hội trường lớn",
          },
        ],
      },
      {
        id: "adj-2",
        subtopicId: "participles",
        subtopicName: "Tính từ đuôi -ed và -ing",
        questionText:
          "The hiring committee was _______ by the applicant's extensive international experience.",
        options: [
          "(A) impressed",
          "(B) impressive",
          "(C) impressively",
          "(D) impressing",
        ],
        correctIndex: 0,
        explanation:
          'Chủ ngữ "The hiring committee" (hội đồng tuyển dụng) chịu tác động và cảm thấy ấn tượng, nên dùng quá khứ phân từ dạng bị động đuôi "-ed" (be impressed by). Nếu miêu tả đặc điểm đối tượng làm người khác ấn tượng thì dùng "impressive".',
        grammarRule:
          "Phân từ tính từ: S + be + V-ed (cảm giác của người) vs S + be + V-ing / -ive (tính chất của vật/sự việc).",
        translationVi:
          "Hội đồng tuyển dụng rất ấn tượng trước kinh nghiệm quốc tế sâu rộng của ứng viên.",
        vocab: [
          {
            word: "impressed",
            pos: "adj",
            phonetic: "/ɪmˈprɛst/",
            meaningVi: "bị ấn tượng, cảm kích",
          },
          {
            word: "applicant",
            pos: "n",
            phonetic: "/ˈæplɪkənt/",
            meaningVi: "ứng viên xin việc",
          },
        ],
      },
    ],
  },
  {
    id: "adverb",
    title: "Trạng từ",
    category: "Từ loại",
    totalCount: 137,
    subtopics: [
      { id: "mixed", title: "Hỗn hợp", count: 137 },
      { id: "modify_verb", title: "Trạng từ bổ nghĩa cho động từ", count: 50 },
      { id: "modify_adj", title: "Trạng từ bổ nghĩa cho tính từ", count: 32 },
      { id: "special", title: "Trạng từ đặc biệt trong TOEIC", count: 35 },
      { id: "frequency", title: "Trạng từ chỉ tần suất", count: 20 },
    ],
    questions: [
      {
        id: "adv-1",
        subtopicId: "modify_verb",
        subtopicName: "Trạng từ bổ nghĩa cho động từ",
        questionText:
          "Quality inspectors examine each batch _______ before shipment to overseas clients.",
        options: [
          "(A) careful",
          "(B) carefully",
          "(C) caring",
          "(D) carefulness",
        ],
        correctIndex: 1,
        explanation:
          'Bổ nghĩa cho ngoại động từ hành động "examine" (kiểm tra), ta cần một Trạng từ chỉ cách thức (Adverb of manner). "Carefully" (một cách cẩn thận) bổ nghĩa cho hành động kiểm tra.',
        grammarRule:
          "Vị trí trạng từ: Verb + Object + ADVERB (examine the batch carefully) hoặc S + ADVERB + Verb.",
        translationVi:
          "Các thanh tra chất lượng kiểm tra từng lô hàng một cách kỹ lưỡng trước khi vận chuyển tới khách hàng nước ngoài.",
        vocab: [
          {
            word: "carefully",
            pos: "adv",
            phonetic: "/ˈkeərfəli/",
            meaningVi: "cẩn thận, kỹ lưỡng",
          },
          {
            word: "shipment",
            pos: "n",
            phonetic: "/ˈʃɪpmənt/",
            meaningVi: "lô hàng, chuyến hàng",
          },
        ],
      },
    ],
  },
  {
    id: "tenses",
    title: "Thì",
    category: "Động từ",
    totalCount: 113,
    subtopics: [
      { id: "mixed", title: "Hỗn hợp", count: 113 },
      { id: "present_simple", title: "Hiện tại đơn & Hiện tại tiếp diễn", count: 30 },
      { id: "past_tenses", title: "Quá khứ đơn & Quá khứ hoàn thành", count: 40 },
      { id: "present_perfect", title: "Hiện tại hoàn thành (since/for)", count: 25 },
      { id: "future_tenses", title: "Các thì tương lai", count: 18 },
    ],
    questions: [
      {
        id: "tense-1",
        subtopicId: "present_perfect",
        subtopicName: "Hiện tại hoàn thành (since/for)",
        questionText:
          "Dr. Bennett _______ as the head of research since the laboratory opened in 2018.",
        options: [
          "(A) serves",
          "(B) has served",
          "(C) served",
          "(D) is serving",
        ],
        correctIndex: 1,
        explanation:
          'Có mệnh đề thời gian "since the laboratory opened in 2018" (kể từ khi...), mệnh đề chính bắt buộc phải chia ở thì Hiện tại hoàn thành (Present Perfect) để diễn tả hành động bắt đầu từ quá khứ và vẫn tiếp diễn.',
        grammarRule:
          "Công thức Since: S + have/has + V3/ed + since + S + V2/ed (mốc quá khứ).",
        translationVi:
          "Tiến sĩ Bennett đã giữ chức trưởng nhóm nghiên cứu kể từ khi phòng thí nghiệm mở cửa vào năm 2018.",
        vocab: [
          {
            word: "serve",
            pos: "v",
            phonetic: "/sɜːrv/",
            meaningVi: "phục vụ, đảm nhiệm chức vụ",
          },
          {
            word: "laboratory",
            pos: "n",
            phonetic: "/ləˈbɒrətəri/",
            meaningVi: "phòng thí nghiệm",
          },
        ],
      },
    ],
  },
  {
    id: "subject_verb_agreement",
    title: "Hòa hợp chủ ngữ – động từ",
    category: "Động từ",
    totalCount: 129,
    subtopics: [
      { id: "mixed", title: "Hỗn hợp", count: 129 },
      { id: "prepositional_phrase", title: "Chủ ngữ kèm cụm giới từ", count: 45 },
      { id: "indefinite_pronoun", title: "Đại từ bất định (Each, Everyone)", count: 34 },
      { id: "collective_nouns", title: "Danh từ tập hợp và số đo", count: 30 },
      { id: "neither_nor", title: "Either/or, Neither/nor", count: 20 },
    ],
    questions: [
      {
        id: "sva-1",
        subtopicId: "prepositional_phrase",
        subtopicName: "Chủ ngữ kèm cụm giới từ",
        questionText:
          "The list of participants eligible for travel reimbursement _______ verified yesterday.",
        options: [
          "(A) was",
          "(B) were",
          "(C) are",
          "(D) have been",
        ],
        correctIndex: 0,
        explanation:
          'Chủ ngữ chính của câu là danh từ số ít "The list" (cụm "of participants eligible for travel reimbursement" chỉ là bổ ngữ giới từ đứng sau). Thời gian xảy ra là "yesterday" nên động từ to-be quá khứ số ít là "was".',
        grammarRule:
          "Quy tắc S-V: Bỏ qua cụm giới từ xen giữa (of, with, in addition to), động từ hòa hợp theo danh từ đứng đầu (The list -> was).",
        translationVi:
          "Danh sách những người tham gia đủ điều kiện được hoàn trả chi phí công tác đã được xác minh vào ngày hôm qua.",
        vocab: [
          {
            word: "reimbursement",
            pos: "n",
            phonetic: "/ˌriːɪmˈbɜːrsmənt/",
            meaningVi: "khoản hoàn tiền, bồi hoàn",
          },
          {
            word: "eligible",
            pos: "adj",
            phonetic: "/ˈɛlɪdʒəbəl/",
            meaningVi: "đủ điều kiện, thích hợp",
          },
        ],
      },
    ],
  },
  {
    id: "passive_voice",
    title: "Chủ động – bị động",
    category: "Động từ",
    totalCount: 113,
    subtopics: [
      { id: "mixed", title: "Hỗn hợp", count: 113 },
      { id: "basic_passive", title: "Thể bị động cơ bản", count: 40 },
      { id: "modal_passive", title: "Bị động với động từ khiếm khuyết", count: 33 },
      { id: "two_objects", title: "Bị động với động từ 2 tân ngữ", count: 25 },
      { id: "special_cases", title: "Cấu trúc bị động đặc biệt", count: 15 },
    ],
    questions: [
      {
        id: "pas-1",
        subtopicId: "basic_passive",
        subtopicName: "Thể bị động cơ bản",
        questionText:
          "All confidential files must be _______ in the encrypted company database.",
        options: [
          "(A) store",
          "(B) storing",
          "(C) stored",
          "(D) storage",
        ],
        correctIndex: 2,
        explanation:
          'Chủ ngữ "All confidential files" (hồ sơ bảo mật) là vật, phải được lưu trữ. Cấu trúc bị động với modal verb: must + be + V3/ed (must be stored).',
        grammarRule:
          "Bị động động từ khuyết thiếu: Modal Verb + be + V-ed/V3 (must be stored, can be downloaded).",
        translationVi:
          "Tất cả các tài liệu bảo mật phải được lưu trữ trong cơ sở dữ liệu đã mã hóa của công ty.",
        vocab: [
          {
            word: "confidential",
            pos: "adj",
            phonetic: "/ˌkɒnfɪˈdɛnʃəl/",
            meaningVi: "bảo mật, tuyệt mật",
          },
          {
            word: "encrypted",
            pos: "adj",
            phonetic: "/ɪnˈkrɪptɪd/",
            meaningVi: "được mã hóa",
          },
        ],
      },
    ],
  },
  {
    id: "gerund_infinitive",
    title: "Danh động từ",
    category: "Động từ",
    totalCount: 76,
    subtopics: [
      { id: "mixed", title: "Hỗn hợp", count: 76 },
      { id: "verbs_gerund", title: "Động từ theo sau bởi V-ing", count: 30 },
      { id: "preposition_gerund", title: "Giới từ + V-ing", count: 26 },
      { id: "special_expressions", title: "Cụm diễn đạt cố định với V-ing", count: 20 },
    ],
    questions: [
      {
        id: "ger-1",
        subtopicId: "preposition_gerund",
        subtopicName: "Giới từ + V-ing",
        questionText:
          "The marketing team looks forward to _______ the new campaign next quarter.",
        options: [
          "(A) launch",
          "(B) launching",
          "(C) launched",
          "(D) launcher",
        ],
        correctIndex: 1,
        explanation:
          'Trong cụm "look forward to", từ "to" là một Giới từ (preposition) chứ không phải To-infinitive, do đó theo sau bắt buộc phải là một Danh động từ V-ing (look forward to doing sth).',
        grammarRule:
          "Cụm từ cố định đi với V-ing: look forward to + V-ing, be committed to + V-ing, be used to + V-ing.",
        translationVi:
          "Đội ngũ tiếp thị rất mong đợi được khởi động chiến dịch mới vào quý tới.",
        vocab: [
          {
            word: "campaign",
            pos: "n",
            phonetic: "/kæmˈpeɪn/",
            meaningVi: "chiến dịch tiếp thị/quảng bá",
          },
          {
            word: "quarter",
            pos: "n",
            phonetic: "/ˈkwɔːrtər/",
            meaningVi: "quý (3 tháng)",
          },
        ],
      },
    ],
  },
  {
    id: "imperatives",
    title: "Câu mệnh lệnh",
    category: "Động từ",
    totalCount: 85,
    subtopics: [
      { id: "mixed", title: "Hỗn hợp", count: 85 },
      { id: "positive", title: "Mệnh lệnh khẳng định", count: 45 },
      { id: "negative", title: "Mệnh lệnh phủ định (Do not / Please)", count: 40 },
    ],
    questions: [
      {
        id: "imp-1",
        subtopicId: "positive",
        subtopicName: "Mệnh lệnh khẳng định",
        questionText:
          "Please _______ the attached contract and return the signed copy to human resources.",
        options: [
          "(A) review",
          "(B) reviewing",
          "(C) reviewed",
          "(D) reviewer",
        ],
        correctIndex: 0,
        explanation:
          'Sau từ lịch sự "Please" trong câu mệnh lệnh, động từ đứng đầu câu bắt buộc phải ở dạng nguyên mẫu không "to" (Bare Infinitive).',
        grammarRule: "Câu mệnh lệnh: Please + Bare Infinitive (Please review, Please submit).",
        translationVi:
          "Vui lòng xem lại hợp đồng đính kèm và gửi lại bản sao đã ký cho phòng nhân sự.",
        vocab: [
          {
            word: "contract",
            pos: "n",
            phonetic: "/ˈkɒntrækt/",
            meaningVi: "hợp đồng",
          },
        ],
      },
    ],
  },
  {
    id: "verb_forms",
    title: "Dạng động từ",
    category: "Động từ",
    totalCount: 98,
    subtopics: [
      { id: "mixed", title: "Hỗn hợp", count: 98 },
      { id: "to_inf", title: "Động từ theo sau bởi To-V", count: 48 },
      { id: "causative", title: "Động từ sai khiến (Have, Make, Let)", count: 30 },
      { id: "perception", title: "Động từ tri giác", count: 20 },
    ],
    questions: [
      {
        id: "vf-1",
        subtopicId: "to_inf",
        subtopicName: "Động từ theo sau bởi To-V",
        questionText:
          "The executive committee decided _______ the launch date until safety testing finishes.",
        options: [
          "(A) postpone",
          "(B) to postpone",
          "(C) postponing",
          "(D) postponed",
        ],
        correctIndex: 1,
        explanation:
          'Động từ "decide" nằm trong nhóm động từ chỉ ý định/kế hoạch, luôn đi với To-infinitive (decide to do something).',
        grammarRule:
          "Động từ theo sau là To-V: decide, plan, intend, hope, agree, offer, refuse + TO-V.",
        translationVi:
          "Ban điều hành đã quyết định hoãn ngày ra mắt cho đến khi quá trình kiểm tra an toàn hoàn tất.",
        vocab: [
          {
            word: "postpone",
            pos: "v",
            phonetic: "/poʊstˈpoʊn/",
            meaningVi: "hoãn lại, dời lịch",
          },
        ],
      },
    ],
  },
];
