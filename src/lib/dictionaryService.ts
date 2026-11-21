import { Howl } from "howler";
import type { CefrLevel, ListeningQuestion, VocabHighlight } from "../types/toeic";

export interface WordCollocation {
  phrase: string;
  meaningVi: string;
}

export interface WordSynonym {
  word: string;
  meaningVi: string;
}

export interface EnrichedWordEntry {
  word: string;
  lemma: string;
  partOfSpeech: string;
  posShort: string;
  cefr: CefrLevel;
  phoneticUs: string;
  phoneticUk: string;
  audioUsUrl?: string;
  audioUkUrl?: string;
  meaningVi: string;
  definitionEn: string;
  exampleSentence: string;
  collocations: WordCollocation[];
  synonyms: WordSynonym[];
  fromApi: boolean;
}

interface OfflineLexiconRecord {
  lemma?: string;
  pos: string;
  cefr: CefrLevel;
  phoneticUs: string;
  phoneticUk?: string;
  meaningVi: string;
  definitionEn: string;
  collocations: WordCollocation[];
  synonyms: WordSynonym[];
}

const OFFLINE_LEXICON: Record<string, OfflineLexiconRecord> = {
  woman: {
    pos: "noun",
    cefr: "A1",
    phoneticUs: "/ˈwʊmən/",
    phoneticUk: "/ˈwʊmən/",
    meaningVi: "người phụ nữ",
    definitionEn: "an adult female person",
    collocations: [
      { phrase: "young woman", meaningVi: "phụ nữ trẻ" },
      { phrase: "businesswoman", meaningVi: "nữ doanh nhân" },
    ],
    synonyms: [
      { word: "female", meaningVi: "nữ giới" },
      { word: "lady", meaningVi: "quý bà" },
    ],
  },
  man: {
    pos: "noun",
    cefr: "A1",
    phoneticUs: "/mæn/",
    meaningVi: "người đàn ông",
    definitionEn: "an adult male human being",
    collocations: [
      { phrase: "young man", meaningVi: "thanh niên" },
      { phrase: "businessman", meaningVi: "nam doanh nhân" },
    ],
    synonyms: [
      { word: "gentleman", meaningVi: "quý ông" },
      { word: "male", meaningVi: "nam giới" },
    ],
  },
  slice: {
    pos: "verb",
    cefr: "B1",
    phoneticUs: "/slaɪs/",
    meaningVi: "thái lát, cắt lát",
    definitionEn: "to cut something into thin, flat pieces",
    collocations: [
      { phrase: "slice onions", meaningVi: "thái hành tây" },
      { phrase: "slice thinly", meaningVi: "thái lát mỏng" },
    ],
    synonyms: [
      { word: "cut", meaningVi: "cắt" },
      { word: "chop", meaningVi: "băm, chặt" },
    ],
  },
  slicing: {
    lemma: "slice",
    pos: "verb",
    cefr: "B1",
    phoneticUs: "/ˈslaɪsɪŋ/",
    meaningVi: "đang thái lát, cắt lát",
    definitionEn: "cutting food or material into thin pieces",
    collocations: [
      { phrase: "slicing vegetables", meaningVi: "thái rau củ" },
      { phrase: "slicing bread", meaningVi: "cắt lát bánh mì" },
    ],
    synonyms: [
      { word: "cutting", meaningVi: "đang cắt" },
      { word: "chopping", meaningVi: "đang thái nhỏ" },
    ],
  },
  onion: {
    pos: "noun",
    cefr: "A2",
    phoneticUs: "/ˈʌnjən/",
    meaningVi: "củ hành tây",
    definitionEn: "a round vegetable with a strong smell and flavor made of layers",
    collocations: [
      { phrase: "red onion", meaningVi: "hành tây tím" },
      { phrase: "chopped onion", meaningVi: "hành tây thái nhỏ" },
    ],
    synonyms: [
      { word: "shallot", meaningVi: "hành tím" },
      { word: "scallion", meaningVi: "hành lá" },
    ],
  },
  opening: {
    lemma: "open",
    pos: "verb",
    cefr: "A1",
    phoneticUs: "/ˈoʊpənɪŋ/",
    phoneticUk: "/ˈəʊpənɪŋ/",
    meaningVi: "đang mở (cửa, tài liệu...)",
    definitionEn: "moving something so it is no longer closed",
    collocations: [
      { phrase: "opening the door", meaningVi: "mở cửa" },
      { phrase: "opening hours", meaningVi: "giờ mở cửa" },
    ],
    synonyms: [
      { word: "unlocking", meaningVi: "mở khóa" },
      { word: "unsealing", meaningVi: "bóc niêm phong" },
    ],
  },
  office: {
    pos: "noun",
    cefr: "A1",
    phoneticUs: "/ˈɔːfɪs/",
    phoneticUk: "/ˈɒfɪs/",
    meaningVi: "văn phòng, phòng làm việc",
    definitionEn: "a room or building where people work at desks",
    collocations: [
      { phrase: "front office", meaningVi: "bộ phận tiếp tân" },
      { phrase: "head office", meaningVi: "trụ sở chính" },
    ],
    synonyms: [
      { word: "workplace", meaningVi: "nơi làm việc" },
      { word: "branch", meaningVi: "chi nhánh" },
    ],
  },
  door: {
    pos: "noun",
    cefr: "A1",
    phoneticUs: "/dɔːr/",
    phoneticUk: "/dɔː/",
    meaningVi: "cánh cửa",
    definitionEn: "a movable barrier used to close an entrance",
    collocations: [
      { phrase: "front door", meaningVi: "cửa chính phía trước" },
      { phrase: "sliding door", meaningVi: "cửa trượt" },
    ],
    synonyms: [
      { word: "entrance", meaningVi: "lối vào" },
      { word: "gate", meaningVi: "cổng" },
    ],
  },
  pouring: {
    lemma: "pour",
    pos: "verb",
    cefr: "A2",
    phoneticUs: "/ˈpɔːrɪŋ/",
    meaningVi: "đang rót (nước, cà phê)",
    definitionEn: "causing a liquid to flow steadily from a container",
    collocations: [
      { phrase: "pour coffee", meaningVi: "rót cà phê" },
      { phrase: "pour into a cup", meaningVi: "rót vào tách" },
    ],
    synonyms: [
      { word: "serve", meaningVi: "phục vụ" },
      { word: "fill", meaningVi: "làm đầy" },
    ],
  },
  coffee: {
    pos: "noun",
    cefr: "A1",
    phoneticUs: "/ˈkɔːfi/",
    phoneticUk: "/ˈkɒfi/",
    meaningVi: "cà phê",
    definitionEn: "a hot dark drink made from roasted coffee beans",
    collocations: [
      { phrase: "coffee break", meaningVi: "giờ giải lao uống cà phê" },
      { phrase: "black coffee", meaningVi: "cà phê đen" },
    ],
    synonyms: [
      { word: "espresso", meaningVi: "cà phê pha máy" },
      { word: "beverage", meaningVi: "đồ uống" },
    ],
  },
  laptop: {
    pos: "noun",
    cefr: "A2",
    phoneticUs: "/ˈlæptɑːp/",
    phoneticUk: "/ˈlæptɒp/",
    meaningVi: "máy tính xách tay",
    definitionEn: "a portable personal computer small enough to use on one's lap",
    collocations: [
      { phrase: "open a laptop", meaningVi: "mở máy tính xách tay" },
      { phrase: "work on a laptop", meaningVi: "làm việc trên laptop" },
    ],
    synonyms: [
      { word: "notebook", meaningVi: "máy tính xách tay" },
      { word: "computer", meaningVi: "máy tính" },
    ],
  },
  desk: {
    pos: "noun",
    cefr: "A1",
    phoneticUs: "/desk/",
    meaningVi: "bàn làm việc",
    definitionEn: "a piece of furniture with a flat surface for writing or working",
    collocations: [
      { phrase: "front desk", meaningVi: "quầy lễ tân" },
      { phrase: "sit at a desk", meaningVi: "ngồi tại bàn làm việc" },
    ],
    synonyms: [
      { word: "table", meaningVi: "bàn" },
      { word: "workstation", meaningVi: "bàn làm việc" },
    ],
  },
  pointing: {
    lemma: "point",
    pos: "verb",
    cefr: "A2",
    phoneticUs: "/ˈpɔɪntɪŋ/",
    meaningVi: "đang chỉ tay vào",
    definitionEn: "directing someone's attention by extending a finger",
    collocations: [
      { phrase: "point at a chart", meaningVi: "chỉ vào biểu đồ" },
      { phrase: "point out", meaningVi: "chỉ ra" },
    ],
    synonyms: [
      { word: "indicate", meaningVi: "chỉ rõ" },
      { word: "gesture", meaningVi: "ra hiệu" },
    ],
  },
  chart: {
    pos: "noun",
    cefr: "B1",
    phoneticUs: "/tʃɑːrt/",
    phoneticUk: "/tʃɑːt/",
    meaningVi: "biểu đồ, bảng số liệu",
    definitionEn: "a visual display of data or information such as a graph or table",
    collocations: [
      { phrase: "bar chart", meaningVi: "biểu đồ cột" },
      { phrase: "organization chart", meaningVi: "sơ đồ tổ chức" },
    ],
    synonyms: [
      { word: "graph", meaningVi: "đồ thị" },
      { word: "diagram", meaningVi: "sơ đồ" },
    ],
  },
  conference: {
    pos: "noun",
    cefr: "B1",
    phoneticUs: "/ˈkɑːnfərəns/",
    phoneticUk: "/ˈkɒnfərəns/",
    meaningVi: "hội nghị, cuộc họp",
    definitionEn: "a formal meeting for discussion or exchange of views",
    collocations: [
      { phrase: "conference room", meaningVi: "phòng họp" },
      { phrase: "video conference", meaningVi: "họp trực tuyến" },
    ],
    synonyms: [
      { word: "meeting", meaningVi: "cuộc họp" },
      { word: "seminar", meaningVi: "hội thảo" },
    ],
  },
  schedule: {
    pos: "noun",
    cefr: "B1",
    phoneticUs: "/ˈskedʒuːl/",
    phoneticUk: "/ˈʃedjuːl/",
    meaningVi: "lịch trình, kế hoạch thời gian",
    definitionEn: "a plan for carrying out a process or procedure with times",
    collocations: [
      { phrase: "ahead of schedule", meaningVi: "trước tiến độ" },
      { phrase: "tight schedule", meaningVi: "lịch trình dày đặc" },
    ],
    synonyms: [
      { word: "timetable", meaningVi: "thời khóa biểu" },
      { word: "agenda", meaningVi: "chương trình nghị sự" },
    ],
  },
  shipment: {
    pos: "noun",
    cefr: "B2",
    phoneticUs: "/ˈʃɪpmənt/",
    meaningVi: "lô hàng vận chuyển",
    definitionEn: "a quantity of goods sent together to a destination",
    collocations: [
      { phrase: "track a shipment", meaningVi: "theo dõi lô hàng" },
      { phrase: "delayed shipment", meaningVi: "lô hàng bị trễ" },
    ],
    synonyms: [
      { word: "delivery", meaningVi: "lần giao hàng" },
      { word: "cargo", meaningVi: "hàng hóa" },
    ],
  },
  invoice: {
    pos: "noun",
    cefr: "B2",
    phoneticUs: "/ˈɪnvɔɪs/",
    meaningVi: "hóa đơn thanh toán",
    definitionEn: "a list of goods sent or services provided with a sum due",
    collocations: [
      { phrase: "issue an invoice", meaningVi: "xuất hóa đơn" },
      { phrase: "pay an invoice", meaningVi: "thanh toán hóa đơn" },
    ],
    synonyms: [
      { word: "bill", meaningVi: "hóa đơn" },
      { word: "receipt", meaningVi: "biên lai" },
    ],
  },
  deadline: {
    pos: "noun",
    cefr: "B1",
    phoneticUs: "/ˈdedlaɪn/",
    meaningVi: "hạn chót",
    definitionEn: "the latest time or date by which something should be completed",
    collocations: [
      { phrase: "meet a deadline", meaningVi: "kịp hạn chót" },
      { phrase: "extend the deadline", meaningVi: "gia hạn thời hạn" },
    ],
    synonyms: [
      { word: "due date", meaningVi: "ngày đến hạn" },
      { word: "cutoff", meaningVi: "mốc kết thúc" },
    ],
  },
  budget: {
    pos: "noun",
    cefr: "B1",
    phoneticUs: "/ˈbʌdʒɪt/",
    meaningVi: "ngân sách",
    definitionEn: "an estimate of income and expenditure for a set period",
    collocations: [
      { phrase: "annual budget", meaningVi: "ngân sách hàng năm" },
      { phrase: "stay within budget", meaningVi: "chi tiêu trong ngân sách" },
    ],
    synonyms: [
      { word: "allowance", meaningVi: "khoản chi" },
      { word: "funding", meaningVi: "nguồn vốn" },
    ],
  },
  approval: {
    pos: "noun",
    cefr: "B2",
    phoneticUs: "/əˈpruːvəl/",
    meaningVi: "sự phê duyệt, chấp thuận",
    definitionEn: "official agreement or permission to do something",
    collocations: [
      { phrase: "final approval", meaningVi: "phê duyệt cuối cùng" },
      { phrase: "pending approval", meaningVi: "đang chờ duyệt" },
    ],
    synonyms: [
      { word: "authorization", meaningVi: "ủy quyền" },
      { word: "consent", meaningVi: "sự đồng ý" },
    ],
  },
  quarter: {
    pos: "noun",
    cefr: "B1",
    phoneticUs: "/ˈkwɔːrtər/",
    phoneticUk: "/ˈkwɔːtə/",
    meaningVi: "quý (3 tháng tài chính)",
    definitionEn: "a three-month period on a financial calendar",
    collocations: [
      { phrase: "fourth quarter", meaningVi: "quý tư" },
      { phrase: "quarterly report", meaningVi: "báo cáo theo quý" },
    ],
    synonyms: [
      { word: "term", meaningVi: "kỳ hạn" },
      { word: "period", meaningVi: "giai đoạn" },
    ],
  },
  document: {
    pos: "noun",
    cefr: "A2",
    phoneticUs: "/ˈdɑːkjumənt/",
    phoneticUk: "/ˈdɒkjumənt/",
    meaningVi: "tài liệu, hồ sơ",
    definitionEn: "a piece of written, printed, or electronic matter providing information",
    collocations: [
      { phrase: "sign a document", meaningVi: "ký tài liệu" },
      { phrase: "attached document", meaningVi: "tài liệu đính kèm" },
    ],
    synonyms: [
      { word: "file", meaningVi: "hồ sơ" },
      { word: "record", meaningVi: "biên bản" },
    ],
  },
  presentation: {
    pos: "noun",
    cefr: "B1",
    phoneticUs: "/ˌpriːzenˈteɪʃən/",
    meaningVi: "bài thuyết trình",
    definitionEn: "a speech or talk introducing a new product or idea",
    collocations: [
      { phrase: "give a presentation", meaningVi: "trình bày bài thuyết trình" },
      { phrase: "slide presentation", meaningVi: "bài trình chiếu" },
    ],
    synonyms: [
      { word: "briefing", meaningVi: "buổi báo cáo ngắn" },
      { word: "talk", meaningVi: "bài nói" },
    ],
  },
};

export function toShortPos(pos: string): string {
  const low = pos.toLowerCase();
  if (low.includes("verb")) return "v";
  if (low.includes("noun")) return "n";
  if (low.includes("adj")) return "adj";
  if (low.includes("adv")) return "adv";
  if (low.includes("prep")) return "prep";
  return "phr";
}

export function inferWordCefr(word: string, fallback: CefrLevel = "B1"): CefrLevel {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (OFFLINE_LEXICON[clean]?.cefr) return OFFLINE_LEXICON[clean].cefr;
  if (clean.length <= 4) return "A1";
  if (clean.length <= 6) return "A2";
  if (clean.length <= 8) return fallback;
  if (clean.length <= 10) return "B2";
  return "C1";
}

export function getOfflineWordBadge(
  vocab: VocabHighlight,
  fallbackCefr: CefrLevel = "B1"
): { posShort: string; cefr: CefrLevel } {
  const clean = vocab.word.toLowerCase().replace(/[^a-z\s]/g, "").trim();
  const hit = OFFLINE_LEXICON[clean];
  return {
    posShort: toShortPos(hit?.pos || vocab.partOfSpeech),
    cefr: vocab.cefr || hit?.cefr || inferWordCefr(clean, fallbackCefr),
  };
}

function findMatchingQuestionVocab(
  cleanWord: string,
  question?: ListeningQuestion
): VocabHighlight | undefined {
  if (!question?.keyVocab?.length) return undefined;
  const low = cleanWord.toLowerCase();
  return question.keyVocab.find((v) => {
    const tokens = v.word.toLowerCase().split(/\s+/);
    return (
      v.word.toLowerCase() === low ||
      tokens.some((t) => t === low || low.startsWith(t) || t.startsWith(low))
    );
  });
}

function findOfflineRecord(cleanWord: string): OfflineLexiconRecord | undefined {
  const low = cleanWord.toLowerCase();
  if (OFFLINE_LEXICON[low]) return OFFLINE_LEXICON[low];
  // Simple plural/gerund stem check
  const candidates = [
    low.replace(/ies$/, "y"),
    low.replace(/es$/, ""),
    low.replace(/s$/, ""),
    low.replace(/ing$/, ""),
    low.replace(/ing$/, "e"),
    low.replace(/ed$/, ""),
    low.replace(/ed$/, "e"),
  ];
  for (const c of candidates) {
    if (c.length >= 3 && OFFLINE_LEXICON[c]) {
      return OFFLINE_LEXICON[c];
    }
  }
  return undefined;
}

interface FreeDictApiEntry {
  word?: string;
  phonetic?: string;
  phonetics?: { text?: string; audio?: string }[];
  meanings?: {
    partOfSpeech?: string;
    definitions?: {
      definition?: string;
      example?: string;
      synonyms?: string[];
    }[];
    synonyms?: string[];
  }[];
}

const apiCache = new Map<string, FreeDictApiEntry | null>();

async function fetchFreeDictionary(word: string): Promise<FreeDictApiEntry | null> {
  const key = word.toLowerCase().replace(/[^a-z-]/g, "");
  if (!key) return null;
  if (apiCache.has(key)) return apiCache.get(key) ?? null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (!res.ok) {
      apiCache.set(key, null);
      return null;
    }
    const json = (await res.json()) as FreeDictApiEntry[];
    const first = Array.isArray(json) && json.length > 0 ? json[0] : null;
    apiCache.set(key, first);
    return first;
  } catch {
    clearTimeout(timer);
    apiCache.set(key, null);
    return null;
  }
}

export async function lookupWordDetails(
  rawWord: string,
  question?: ListeningQuestion,
  fallbackCefr: CefrLevel = "B1"
): Promise<EnrichedWordEntry> {
  const cleanWord = rawWord.trim().replace(/^[^a-zA-Z0-9'-]+|[^a-zA-Z0-9'-]+$/g, "");
  const lower = cleanWord.toLowerCase();

  const qVocab = findMatchingQuestionVocab(lower, question);
  const offline = findOfflineRecord(lower);
  const queryTarget = offline?.lemma || lower;

  const apiEntry = await fetchFreeDictionary(queryTarget);

  const phonetics = apiEntry?.phonetics ?? [];
  const usPhoneticObj = phonetics.find((p) => p.audio?.includes("-us")) ?? phonetics.find((p) => p.text);
  const ukPhoneticObj = phonetics.find((p) => p.audio?.includes("-uk")) ?? phonetics.find((p) => p.text);

  const phoneticUs =
    usPhoneticObj?.text ||
    apiEntry?.phonetic ||
    offline?.phoneticUs ||
    qVocab?.phonetic ||
    `/${lower}/`;
  const phoneticUk =
    ukPhoneticObj?.text ||
    offline?.phoneticUk ||
    phoneticUs;

  const firstMeaning = apiEntry?.meanings?.[0];
  const firstDef = firstMeaning?.definitions?.[0];

  const partOfSpeech =
    offline?.pos || qVocab?.partOfSpeech || firstMeaning?.partOfSpeech || "word";

  const apiSynonyms = [
    ...(firstMeaning?.synonyms ?? []),
    ...(firstDef?.synonyms ?? []),
  ]
    .filter((s) => s.toLowerCase() !== lower)
    .slice(0, 4)
    .map((w) => ({
      word: w,
      meaningVi: OFFLINE_LEXICON[w.toLowerCase()]?.meaningVi || "từ đồng nghĩa",
    }));

  const synonyms =
    qVocab?.synonyms && qVocab.synonyms.length > 0
      ? qVocab.synonyms
      : offline?.synonyms && offline.synonyms.length > 0
      ? offline.synonyms
      : apiSynonyms;

  const collocations =
    qVocab?.collocations && qVocab.collocations.length > 0
      ? qVocab.collocations
      : offline?.collocations && offline.collocations.length > 0
      ? offline.collocations
      : [
          {
            phrase: `${cleanWord} in context`,
            meaningVi: qVocab?.meaningVi || offline?.meaningVi || "cách dùng trong câu",
          },
        ];

  return {
    word: cleanWord,
    lemma: offline?.lemma || cleanWord,
    partOfSpeech,
    posShort: toShortPos(partOfSpeech),
    cefr: qVocab?.cefr || offline?.cefr || inferWordCefr(lower, fallbackCefr),
    phoneticUs,
    phoneticUk,
    audioUsUrl: usPhoneticObj?.audio || undefined,
    audioUkUrl: ukPhoneticObj?.audio || undefined,
    meaningVi:
      qVocab?.meaningVi ||
      offline?.meaningVi ||
      "Từ vựng xuất hiện trong câu nghe TOEIC",
    definitionEn:
      qVocab?.definitionEn ||
      firstDef?.definition ||
      offline?.definitionEn ||
      `Vocabulary item used in this listening context: "${cleanWord}".`,
    exampleSentence:
      qVocab?.exampleSentence ||
      firstDef?.example ||
      question?.transcript ||
      `We practiced the word "${cleanWord}" in class today.`,
    collocations,
    synonyms,
    fromApi: Boolean(apiEntry),
  };
}

let activeWordHowl: Howl | null = null;

export function playWordPronunciation(
  word: string,
  accent: "US" | "UK" = "US",
  audioUrl?: string
) {
  if (activeWordHowl) {
    activeWordHowl.stop();
    activeWordHowl.unload();
    activeWordHowl = null;
  }

  if (audioUrl) {
    try {
      const normalizedUrl = audioUrl.startsWith("//") ? `https:${audioUrl}` : audioUrl;
      activeWordHowl = new Howl({
        src: [normalizedUrl],
        html5: true,
        onloaderror: () => speakWordWithBrowser(word, accent),
        onplayerror: () => speakWordWithBrowser(word, accent),
      });
      activeWordHowl.play();
      return;
    } catch {
      // Fallback below
    }
  }

  speakWordWithBrowser(word, accent);
}

function speakWordWithBrowser(word: string, accent: "US" | "UK") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = accent === "UK" ? "en-GB" : "en-US";
    utter.rate = 0.92;
    const voices = window.speechSynthesis.getVoices();
    const matched = voices.find((v) =>
      accent === "UK" ? v.lang.startsWith("en-GB") : v.lang.startsWith("en-US")
    );
    if (matched) utter.voice = matched;
    window.speechSynthesis.speak(utter);
  } catch {
    // Ignore speech errors in headless test runners
  }
}
