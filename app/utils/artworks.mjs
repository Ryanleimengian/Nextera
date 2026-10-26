/*
 * 原創概念作品畫面（以 HTML／SVG 繪製，非真實客戶作品）
 * 每個元件以 role="img" 及 aria-label 提供替代文字。
 */
  const ART_LABELS = {
    social: '概念設計：餐飲品牌九宮格社交貼文系列',
    reel: '概念設計：短影片三格分鏡',
    calendar: '概念設計：月度社交內容日曆',
    brand: '概念設計：品牌色彩、字體及貼文模板版面',
    slides: '概念設計：AI Marketing 工作坊教材頁面',
    worksheet: '概念設計：培訓練習成果，一個月內容日曆表',
    prompt: '概念設計：品牌語氣 Prompt 模板',
    sop: '概念設計：AI 內容審核操作 SOP',
    browser: '概念設計：專業服務公司官網桌面版首頁',
    phone: '概念設計：專業服務公司官網手機版畫面',
    sitemap: '概念設計：網站架構與主要頁面',
    form: '概念設計：分步查詢表單',
    chat: '概念設計：品牌內容 AI 助理介面，草稿待人工審核',
    flow: '概念設計：AI 內容生成及人工審核流程',
    review: '概念設計：人工審核清單與批准狀態',
  };

  const FoodMotif = {
    props: { motif: { type: String, default: 'bowl' } },
    template: `
      <svg viewBox="0 0 100 100" class="h-full w-full" aria-hidden="true">
        <template v-if="motif === 'bowl'">
          <circle cx="50" cy="50" r="40" fill="#F8F4EC" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1A293A" stroke-opacity=".12" />
          <circle cx="50" cy="50" r="31" fill="#C58B4C" />
          <path d="M28 46c8-6 16 6 24 0s16 6 22 0M27 55c8-6 16 6 24 0s16 6 22 0M31 63c8-5 14 5 21 0s14 5 18 0" fill="none" stroke="#F3D9A4" stroke-width="2.4" stroke-linecap="round" />
          <circle cx="62" cy="38" r="8" fill="#F6EEDC" /><circle cx="62" cy="38" r="4" fill="#E7AE45" />
          <ellipse cx="38" cy="36" rx="6" ry="3" fill="#6F8B58" transform="rotate(-30 38 36)" />
          <ellipse cx="44" cy="33" rx="5" ry="2.5" fill="#7E9A63" transform="rotate(20 44 33)" />
        </template>
        <template v-else-if="motif === 'cup'">
          <circle cx="50" cy="52" r="36" fill="#F3ECE0" />
          <circle cx="50" cy="52" r="36" fill="none" stroke="#1A293A" stroke-opacity=".1" />
          <rect x="70" y="46" width="14" height="10" rx="5" fill="#FFFFFF" stroke="#1A293A" stroke-opacity=".15" />
          <circle cx="50" cy="51" r="23" fill="#FFFFFF" stroke="#1A293A" stroke-opacity=".15" />
          <circle cx="50" cy="51" r="18" fill="#B98858" />
          <path d="M42 48c4-4 12-4 16 0" fill="none" stroke="#E6CDA6" stroke-width="2" stroke-linecap="round" />
        </template>
        <template v-else-if="motif === 'bun'">
          <circle cx="50" cy="50" r="40" fill="#F5F0E6" />
          <circle cx="50" cy="50" r="28" fill="#E3A852" />
          <path d="M30 38l40 24M30 50l34 20M36 30l34 22M26 58l26 16M44 26l28 18M34 64l-0 0" stroke="#C3812F" stroke-width="1.6" stroke-linecap="round" />
          <path d="M30 62l40-24M32 72l34-22M28 52l34-22M40 76l28-18" stroke="#C3812F" stroke-width="1.6" stroke-linecap="round" />
          <rect x="44" y="46" width="22" height="8" rx="1.5" fill="#F8E8A6" transform="rotate(-18 55 50)" />
        </template>
        <template v-else-if="motif === 'dimsum'">
          <circle cx="50" cy="50" r="40" fill="#D7B887" />
          <circle cx="50" cy="50" r="34" fill="#E6CFA5" />
          <path d="M16 50h68M50 16v68M26 26l48 48M74 26 26 74" stroke="#C9A876" stroke-width=".8" />
          <g v-for="p in [[37,40],[63,40],[50,63]]" :key="p[0] + '-' + p[1]">
            <circle :cx="p[0]" :cy="p[1]" r="12" fill="#F8F2E6" />
            <path :d="'M' + (p[0]-7) + ' ' + p[1] + 'q7-9 14 0'" fill="none" stroke="#DCCBAE" stroke-width="1.4" />
            <circle :cx="p[0]" :cy="p[1] - 2" r="2.2" fill="#E07F3C" />
          </g>
        </template>
        <template v-else>
          <circle cx="50" cy="50" r="41" fill="#FBF8F2" />
          <circle cx="50" cy="50" r="41" fill="none" stroke="#1A293A" stroke-opacity=".12" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#1A293A" stroke-opacity=".08" />
          <path d="M34 56c0-10 9-16 18-16s16 6 16 14-8 12-17 12-17-2-17-10z" fill="#9A5D3A" />
          <path d="M38 54c4-5 10-7 16-6" fill="none" stroke="#C7895C" stroke-width="2" stroke-linecap="round" />
          <circle cx="66" cy="38" r="5" fill="#E9B04B" /><circle cx="32" cy="40" r="4" fill="#7E9A63" /><circle cx="38" cy="34" r="3" fill="#6F8B58" />
          <path d="M58 68c4 2 9 1 12-3" fill="none" stroke="#B69860" stroke-width="2" stroke-linecap="round" />
        </template>
      </svg>`,
  };

  const SocialTile = {
    components: { FoodMotif },
    props: { tile: { type: Object, required: true } },
    template: `
      <div class="relative flex aspect-square flex-col overflow-hidden" :style="{ background: tile.bg, color: tile.fg || '#1A293A' }">
        <template v-if="tile.type === 'photo'">
          <div class="absolute inset-[12%]"><food-motif :motif="tile.motif" /></div>
          <span v-if="tile.tag" class="absolute bottom-[7%] left-[8%] text-[clamp(6px,1.1vw,10px)] font-semibold tracking-[0.16em]" :style="{ color: tile.tagColor || '#1A293A' }">{{ tile.tag }}</span>
        </template>
        <template v-else>
          <span class="mt-[12%] px-[10%] text-[clamp(5px,0.9vw,9px)] tracking-[0.22em] opacity-70">{{ tile.sub }}</span>
          <span class="mt-auto whitespace-pre-line px-[10%] pb-[12%] font-serif-tc text-[clamp(9px,1.7vw,18px)] font-bold leading-tight">{{ tile.title }}</span>
          <span class="absolute right-[10%] top-[12%] h-[18%] w-px rotate-45 origin-top" :style="{ background: tile.line || '#B69860' }"></span>
        </template>
      </div>`,
  };

  const SOCIAL_TILES = [
    { type: 'photo', motif: 'bowl', bg: '#E9E1D2', tag: '招牌湯麵' },
    { type: 'type', title: '週末\n限定', sub: 'WEEKEND', bg: '#1A293A', fg: '#F4EEDF' },
    { type: 'photo', motif: 'cup', bg: '#D8CAAF' },
    { type: 'type', title: '主廚\n推介', sub: "CHEF'S PICK", bg: '#F6F1E8' },
    { type: 'photo', motif: 'bun', bg: '#C9B68D', tag: '每日新鮮出爐', tagColor: '#FAF9F6' },
    { type: 'type', title: '一碗湯，\n慢火四小時。', sub: 'OUR STORY', bg: '#EDE5D6' },
    { type: 'photo', motif: 'dimsum', bg: '#22364A' },
    { type: 'type', title: '訂座\n資訊', sub: 'RESERVE', bg: '#B69860', line: '#1A293A' },
    { type: 'photo', motif: 'plate', bg: '#E5DCCB' },
  ];

  const ArtSocial = {
    components: { SocialTile },
    props: { compact: Boolean },
    data: () => ({ tiles: SOCIAL_TILES }),
    template: `
      <div class="w-full bg-[#FBFAF7] p-[3%] shadow-[0_1px_0_rgba(26,41,58,0.06)]">
        <div class="flex items-center gap-2 px-1 pb-[3%] pt-[1%]">
          <span class="h-[clamp(14px,2.4vw,24px)] w-[clamp(14px,2.4vw,24px)] rounded-full border border-navy/20 bg-[#EDE5D6]"></span>
          <span class="text-[clamp(7px,1vw,11px)] font-semibold text-navy">示例餐廳</span>
          <span class="ml-auto text-[clamp(6px,0.8vw,9px)] tracking-[0.18em] text-navy/50">CONCEPT</span>
        </div>
        <div class="grid grid-cols-3 gap-[2px]">
          <social-tile v-for="(t, i) in tiles" :key="i" :tile="t" />
        </div>
      </div>`,
  };

  const ArtReel = {
    components: { FoodMotif },
    data: () => ({
      frames: [
        { time: '0–3 秒', note: '出菜特寫', motif: 'bowl', bg: '#E9E1D2' },
        { time: '4–15 秒', note: '廚房製作過程', motif: 'dimsum', bg: '#22364A', dark: true },
        { time: '16–25 秒', note: '訂座資訊與地址', motif: 'plate', bg: '#EDE5D6', end: true },
      ],
    }),
    template: `
      <div class="grid w-full grid-cols-3 gap-[4%] bg-[#F3EEE5] p-[6%]">
        <div v-for="(f, i) in frames" :key="i">
          <div class="relative aspect-[9/16] overflow-hidden rounded-[6px] border border-navy/10" :style="{ background: f.bg }">
            <div class="absolute inset-x-[14%] top-[24%] aspect-square"><food-motif :motif="f.motif" /></div>
            <div class="absolute inset-x-[10%] bottom-[8%]" :class="f.dark ? 'text-paper' : 'text-navy'">
              <p class="font-serif-tc text-[clamp(8px,1.3vw,14px)] font-bold leading-snug">{{ f.end ? '即日起接受訂座' : (i === 0 ? '今日招牌' : '慢火四小時') }}</p>
              <p class="mt-1 h-px w-1/3" style="background:#B69860"></p>
            </div>
            <span class="absolute left-[10%] top-[6%] text-[clamp(6px,0.8vw,9px)] tracking-[0.14em]" :class="f.dark ? 'text-paper/70' : 'text-navy/60'">SCENE {{ i + 1 }}</span>
          </div>
          <p class="mt-2 text-[clamp(8px,1vw,12px)] font-semibold text-navy">{{ f.time }}</p>
          <p class="text-[clamp(8px,0.95vw,12px)] text-ink/70">{{ f.note }}</p>
        </div>
      </div>`,
  };

  const ArtCalendar = {
    data() {
      const plan = { 2: 'story', 5: 'kitchen', 9: 'season', 12: 'reel', 16: 'reserve', 19: 'kitchen', 23: 'story', 26: 'reel', 29: 'season' };
      return {
        week: ['一', '二', '三', '四', '五', '六', '日'],
        days: Array.from({ length: 35 }, (_, i) => {
          const d = i - 1;
          return { n: d >= 1 && d <= 30 ? d : null, type: plan[d] || null };
        }),
        types: {
          story: { label: '招牌菜故事', cls: 'bg-navy text-paper' },
          kitchen: { label: '廚房幕後', cls: 'bg-[#E7DCC6] text-navy' },
          season: { label: '季節限定', cls: 'bg-gold text-navy' },
          reel: { label: '短影片', cls: 'border border-navy text-navy' },
          reserve: { label: '訂座與活動', cls: 'bg-[#CFD5DB] text-navy' },
        },
      };
    },
    template: `
      <div class="w-full bg-[#FBFAF7] p-[4%]">
        <div class="flex items-end justify-between border-b border-line pb-3">
          <div>
            <p class="text-[clamp(7px,0.9vw,10px)] tracking-[0.2em] text-gold-700">CONTENT CALENDAR</p>
            <p class="mt-1 font-serif-tc text-[clamp(11px,1.7vw,20px)] font-bold text-navy">月度內容日曆・示例月份</p>
          </div>
          <div class="hidden flex-wrap justify-end gap-1.5 sm:flex">
            <span v-for="(t, k) in types" :key="k" class="rounded-[3px] px-1.5 py-0.5 text-[clamp(7px,0.8vw,10px)]" :class="t.cls">{{ t.label }}</span>
          </div>
        </div>
        <div class="mt-3 grid grid-cols-7 gap-px bg-line">
          <span v-for="w in week" :key="w" class="bg-[#F3EEE5] py-1 text-center text-[clamp(7px,0.85vw,10px)] text-ink/70">{{ w }}</span>
          <div v-for="(d, i) in days" :key="i" class="min-h-[clamp(26px,5vw,60px)] bg-[#FBFAF7] p-[6%]">
            <span v-if="d.n" class="text-[clamp(7px,0.85vw,10px)] tabular-nums text-ink/60">{{ d.n }}</span>
            <span v-if="d.type" class="mt-1 block truncate rounded-[3px] px-1 py-0.5 text-[clamp(6px,0.75vw,9px)]" :class="types[d.type].cls">{{ types[d.type].label }}</span>
          </div>
        </div>
      </div>`,
  };

  const ArtBrand = {
    components: { SocialTile },
    data: () => ({
      swatches: [
        { hex: '#1A293A', name: '深藍' },
        { hex: '#B69860', name: '金色' },
        { hex: '#EDE5D6', name: '米色' },
        { hex: '#FBFAF7', name: '暖白' },
      ],
      tiles: [SOCIAL_TILES[1], SOCIAL_TILES[0], SOCIAL_TILES[7]],
    }),
    template: `
      <div class="grid w-full gap-[4%] bg-[#F3EEE5] p-[5%] sm:grid-cols-[1fr_1.4fr]">
        <div>
          <p class="text-[clamp(7px,0.9vw,10px)] tracking-[0.2em] text-gold-700">BRAND BOARD</p>
          <p class="mt-2 font-serif-tc text-[clamp(14px,2.4vw,30px)] font-bold leading-tight text-navy">示例餐廳</p>
          <p class="text-[clamp(8px,1vw,12px)] tracking-[0.3em] text-navy/60">NEIGHBOURHOOD KITCHEN</p>
          <div class="mt-[8%] grid grid-cols-4 gap-1.5">
            <div v-for="s in swatches" :key="s.hex">
              <div class="aspect-square border border-navy/10" :style="{ background: s.hex }"></div>
              <p class="mt-1 text-[clamp(7px,0.8vw,10px)] text-ink/70">{{ s.name }}</p>
            </div>
          </div>
          <div class="mt-[8%] border-t border-line pt-3 text-navy">
            <p class="font-serif-tc text-[clamp(12px,1.8vw,22px)] font-bold">標題 Aa</p>
            <p class="text-[clamp(8px,1vw,12px)] text-ink/70">正文：清晰、親切、帶有溫度的語氣</p>
          </div>
        </div>
        <div class="grid grid-cols-3 content-start gap-[3%]">
          <social-tile v-for="(t, i) in tiles" :key="i" :tile="t" />
          <p class="col-span-3 mt-2 text-[clamp(7px,0.9vw,11px)] leading-relaxed text-ink/70">貼文模板：相片貼文與文字貼文交替，金色細線作為統一的視覺元素。</p>
        </div>
      </div>`,
  };

  const ArtSlides = {
    props: { compact: Boolean },
    data: () => ({
      steps: ['角色', '任務', '背景', '格式', '檢查'],
      points: ['先定義品牌語氣與禁用字眼', '提供目標客群與內容目的', '要求固定輸出格式', '產出後必須人工核對'],
    }),
    template: `
      <div class="w-full bg-navy p-[3%]">
        <div class="relative aspect-[16/10] w-full overflow-hidden bg-[#FBFAF7] p-[6%] text-navy">
          <span class="absolute -right-[6%] top-0 h-[140%] w-px origin-top rotate-[35deg] bg-gold/60"></span>
          <div class="flex items-center justify-between text-[clamp(6px,0.85vw,10px)] tracking-[0.2em] text-gold-700">
            <span>MODULE 05</span><span>AI MARKETING WORKSHOP</span>
          </div>
          <p class="mt-[5%] font-serif-tc text-[clamp(12px,2.4vw,30px)] font-bold leading-tight">Prompt 設計與<br />品牌語氣管理</p>
          <div class="mt-[5%] grid grid-cols-2 gap-[6%]">
            <ul class="space-y-[6%]">
              <li v-for="(p, i) in points" :key="p" class="flex gap-2 text-[clamp(7px,1vw,12px)] leading-snug text-ink">
                <span class="tabular-nums text-gold-700">0{{ i + 1 }}</span>{{ p }}
              </li>
            </ul>
            <div class="flex flex-col justify-center gap-[6%]">
              <div v-for="(s, i) in steps" :key="s" class="flex items-center gap-2">
                <span class="flex h-[clamp(12px,2vw,24px)] w-[clamp(12px,2vw,24px)] items-center justify-center rounded-full border border-navy text-[clamp(6px,0.8vw,10px)]" :class="i === 4 ? 'bg-navy text-paper' : ''">{{ i + 1 }}</span>
                <span class="text-[clamp(7px,1vw,12px)]">{{ s }}</span>
                <span class="h-px flex-1 bg-line"></span>
              </div>
            </div>
          </div>
          <p class="absolute bottom-[5%] left-[6%] text-[clamp(6px,0.8vw,9px)] text-ink/60">教材示例・第 12 頁</p>
        </div>
      </div>`,
  };

  const ArtWorksheet = {
    data: () => ({
      rows: [
        ['第 1 週', '新品介紹', '圖文貼文', '待審核'],
        ['第 2 週', '顧客常見問題', '短影片', '已批准'],
        ['第 3 週', '幕後故事', '輪播貼文', '已批准'],
        ['第 4 週', '節日推廣', '圖文貼文', '修改中'],
      ],
    }),
    template: `
      <div class="w-full bg-[#FBFAF7] p-[6%] text-navy">
        <p class="text-[clamp(7px,0.9vw,10px)] tracking-[0.2em] text-gold-700">EXERCISE 03</p>
        <p class="mt-1 font-serif-tc text-[clamp(12px,1.8vw,20px)] font-bold">練習成果：一個月內容日曆</p>
        <div class="mt-4 overflow-hidden border border-line">
          <div class="grid grid-cols-4 bg-navy px-2 py-1.5 text-[clamp(7px,0.9vw,11px)] text-paper">
            <span>週次</span><span>主題</span><span>形式</span><span>狀態</span>
          </div>
          <div v-for="(r, i) in rows" :key="i" class="grid grid-cols-4 border-t border-line px-2 py-2 text-[clamp(7px,0.9vw,11px)]">
            <span class="text-ink/70">{{ r[0] }}</span><span>{{ r[1] }}</span><span class="text-ink/70">{{ r[2] }}</span>
            <span :class="r[3] === '已批准' ? 'text-navy font-semibold' : 'text-gold-700'">{{ r[3] }}</span>
          </div>
        </div>
        <p class="mt-3 text-[clamp(7px,0.85vw,10px)] text-ink/60">由參與者以 AI 協助起草，經小組審核後定稿。</p>
      </div>`,
  };

  const ArtPrompt = {
    data: () => ({
      lines: [
        ['角色', '你是{品牌名稱}的社交媒體編輯'],
        ['目標客群', '{客群描述}'],
        ['品牌語氣', '{三個語氣關鍵詞}'],
        ['避免', '{禁用字眼及誇大用語}'],
        ['任務', '為{主題}撰寫 3 個貼文方向'],
        ['輸出格式', '標題｜正文｜行動呼籲'],
      ],
    }),
    methods: {
      parts(text) {
        return text.split(/(\{[^}]+\})/).filter(Boolean).map((t) => ({ t, v: t.startsWith('{') }));
      },
    },
    template: `
      <div class="w-full bg-navy p-[6%] text-paper">
        <div class="flex items-center justify-between">
          <p class="text-[clamp(7px,0.9vw,10px)] tracking-[0.2em] text-gold-300">PROMPT TEMPLATE</p>
          <span class="rounded-[3px] border border-gold/50 px-1.5 py-0.5 text-[clamp(6px,0.8vw,9px)] text-gold-300">v1.2</span>
        </div>
        <p class="mt-2 font-serif-tc text-[clamp(12px,1.8vw,20px)] font-bold">品牌語氣 Prompt</p>
        <dl class="mt-4 space-y-2 border-t border-white/10 pt-4 font-mono text-[clamp(7px,0.95vw,12px)] leading-relaxed">
          <div v-for="l in lines" :key="l[0]" class="grid grid-cols-[5.5em_1fr] gap-2">
            <dt class="text-paper/55">{{ l[0] }}</dt>
            <dd><span v-for="(p, i) in parts(l[1])" :key="i" :class="p.v ? 'text-gold-300' : ''">{{ p.t }}</span></dd>
          </div>
        </dl>
      </div>`,
  };

  const ArtSop = {
    data: () => ({
      steps: [
        ['確認資料來源', '只使用經確認的品牌及產品資料'],
        ['事實與數字核對', '價格、日期、地址逐項核對'],
        ['品牌語氣檢查', '對照語氣指南及禁用字眼'],
        ['敏感資料檢查', '不包含客戶個人資料'],
        ['負責人批准', '記錄批准人及版本'],
        ['發布與存檔', '保存最終版本及修改紀錄'],
      ],
    }),
    template: `
      <div class="w-full bg-[#FBFAF7] p-[5%] text-navy">
        <div class="flex items-end justify-between border-b border-line pb-3">
          <div>
            <p class="text-[clamp(7px,0.9vw,10px)] tracking-[0.2em] text-gold-700">STANDARD OPERATING PROCEDURE</p>
            <p class="mt-1 font-serif-tc text-[clamp(12px,1.8vw,20px)] font-bold">AI 內容審核 SOP</p>
          </div>
          <span class="text-[clamp(7px,0.85vw,10px)] text-ink/60">6 個步驟</span>
        </div>
        <ol class="mt-3 grid gap-x-[5%] sm:grid-cols-2">
          <li v-for="(s, i) in steps" :key="s[0]" class="flex gap-3 border-b border-line py-2.5">
            <span class="mt-0.5 flex h-[clamp(12px,1.6vw,18px)] w-[clamp(12px,1.6vw,18px)] shrink-0 items-center justify-center border border-navy text-[clamp(6px,0.8vw,10px)]" :class="i < 4 ? 'bg-navy text-paper' : ''">{{ i < 4 ? '✓' : '' }}</span>
            <div>
              <p class="text-[clamp(8px,1vw,13px)] font-semibold">{{ s[0] }}</p>
              <p class="text-[clamp(7px,0.85vw,11px)] text-ink/70">{{ s[1] }}</p>
            </div>
          </li>
        </ol>
      </div>`,
  };

  const BrowserChrome = {
    props: { url: { type: String, default: 'www.example.com' } },
    template: `
      <div class="w-full overflow-hidden rounded-[6px] border border-navy/15 bg-white shadow-[0_24px_60px_-30px_rgba(26,41,58,0.35)]">
        <div class="flex items-center gap-1.5 border-b border-navy/10 bg-[#F3F1EC] px-3 py-2">
          <span class="h-2 w-2 rounded-full bg-navy/15"></span><span class="h-2 w-2 rounded-full bg-navy/15"></span><span class="h-2 w-2 rounded-full bg-navy/15"></span>
          <span class="mx-auto rounded-[3px] bg-white px-3 py-0.5 text-[clamp(6px,0.8vw,10px)] text-ink/60">{{ url }}</span>
        </div>
        <slot></slot>
      </div>`,
  };

  const ArtBrowser = {
    components: { BrowserChrome },
    template: `
      <div class="w-full bg-[#E9E5DD] p-[5%]">
        <browser-chrome>
          <div class="text-[#22303D]">
            <div class="flex items-center justify-between border-b border-[#E5E1D8] px-[5%] py-[2.5%] text-[clamp(6px,0.85vw,11px)]">
              <span class="font-serif-tc font-bold tracking-wide">示例會計事務所</span>
              <span class="hidden gap-4 text-ink/70 sm:flex"><span>服務</span><span>常見問題</span><span>關於我們</span></span>
              <span class="rounded-[3px] bg-[#22303D] px-2 py-1 text-white">預約諮詢</span>
            </div>
            <div class="grid grid-cols-[1.2fr_1fr] gap-[5%] px-[5%] py-[6%]">
              <div>
                <p class="text-[clamp(6px,0.8vw,10px)] tracking-[0.2em] text-[#8C7442]">ACCOUNTING & ADVISORY</p>
                <p class="mt-2 font-serif-tc text-[clamp(9px,3.5cqw,28px)] font-bold leading-tight">清晰的會計與稅務安排，<br />讓業務專注成長。</p>
                <p class="mt-2 text-[clamp(6px,0.9vw,12px)] leading-relaxed text-ink/70">公司註冊、記帳報稅及商業顧問服務，一站整理。</p>
                <div class="mt-3 flex gap-2 text-[clamp(6px,0.85vw,11px)]">
                  <span class="rounded-[3px] bg-[#22303D] px-2.5 py-1 text-white">查看服務</span>
                  <span class="rounded-[3px] border border-[#22303D]/30 px-2.5 py-1">提交查詢</span>
                </div>
              </div>
              <div class="relative overflow-hidden rounded-[4px] bg-[#DCD5C7]">
                <div class="absolute inset-0" style="background: linear-gradient(135deg, #CFC6B4 0%, #E8E2D6 55%, #D5CCBB 100%)"></div>
                <div class="absolute bottom-[12%] left-[12%] right-[12%] space-y-1.5">
                  <span class="block h-[6px] w-2/3 rounded-full bg-white/70"></span>
                  <span class="block h-[6px] w-1/2 rounded-full bg-white/50"></span>
                </div>
                <span class="absolute right-[14%] top-[14%] h-[40%] w-px rotate-45 bg-[#8C7442]/60"></span>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-px border-t border-[#E5E1D8] bg-[#E5E1D8]">
              <div v-for="s in ['公司註冊', '記帳及報稅', '商業顧問']" :key="s" class="bg-white px-[8%] py-[8%]">
                <p class="text-[clamp(7px,1vw,13px)] font-semibold">{{ s }}</p>
                <span class="mt-2 block h-[4px] w-4/5 rounded-full bg-[#ECE8E0]"></span>
                <span class="mt-1 block h-[4px] w-3/5 rounded-full bg-[#ECE8E0]"></span>
              </div>
            </div>
          </div>
        </browser-chrome>
      </div>`,
  };

  const PhoneFrame = {
    template: `
      <div class="mx-auto w-full max-w-[220px] rounded-[22px] border-[5px] border-[#22303D] bg-white shadow-[0_24px_60px_-30px_rgba(26,41,58,0.45)]">
        <div class="mx-auto mt-1.5 h-1.5 w-12 rounded-full bg-[#22303D]/80"></div>
        <div class="overflow-hidden rounded-b-[16px] pt-1.5"><slot></slot></div>
      </div>`,
  };

  const ArtPhone = {
    components: { PhoneFrame },
    template: `
      <div class="grid w-full grid-cols-2 gap-[6%] bg-[#E9E5DD] p-[7%]">
        <phone-frame>
          <div class="text-[#22303D]">
            <div class="flex items-center justify-between px-3 py-2 text-[8px]"><span class="font-serif-tc font-bold">示例會計事務所</span><span>☰</span></div>
            <div class="px-3 pb-3">
              <p class="font-serif-tc text-[13px] font-bold leading-snug">清晰的會計與稅務安排</p>
              <p class="mt-1 text-[8px] leading-relaxed text-ink/70">公司註冊、記帳報稅及商業顧問服務。</p>
              <div class="mt-3 aspect-[4/3] rounded-[3px]" style="background: linear-gradient(135deg, #CFC6B4, #E8E2D6)"></div>
              <div class="mt-3 space-y-1.5">
                <div v-for="s in ['公司註冊', '記帳及報稅', '商業顧問']" :key="s" class="flex items-center justify-between border-b border-[#ECE8E0] pb-1.5 text-[9px]"><span>{{ s }}</span><span class="text-[#8C7442]">→</span></div>
              </div>
            </div>
            <div class="bg-[#22303D] py-2 text-center text-[9px] text-white">提交查詢</div>
          </div>
        </phone-frame>
        <phone-frame>
          <div class="px-3 pb-3 text-[#22303D]">
            <p class="pt-2 text-[7px] tracking-[0.2em] text-[#8C7442]">SERVICE</p>
            <p class="font-serif-tc text-[13px] font-bold">記帳及報稅</p>
            <p class="mt-2 text-[8px] font-semibold">適合對象</p>
            <span class="mt-1 block h-[4px] w-full rounded-full bg-[#ECE8E0]"></span>
            <span class="mt-1 block h-[4px] w-4/5 rounded-full bg-[#ECE8E0]"></span>
            <p class="mt-3 text-[8px] font-semibold">服務內容</p>
            <div class="mt-1 space-y-1">
              <div v-for="n in 3" :key="n" class="flex items-center gap-1.5"><span class="h-1 w-1 rounded-full bg-[#8C7442]"></span><span class="block h-[4px] flex-1 rounded-full bg-[#ECE8E0]"></span></div>
            </div>
            <p class="mt-3 text-[8px] font-semibold">常見問題</p>
            <div v-for="n in 3" :key="'q' + n" class="mt-1 flex justify-between border-b border-[#ECE8E0] pb-1 text-[8px] text-ink/60"><span class="block h-[4px] w-3/4 self-center rounded-full bg-[#ECE8E0]"></span><span>+</span></div>
            <div class="mt-3 rounded-[3px] bg-[#22303D] py-1.5 text-center text-[8px] text-white">預約諮詢</div>
          </div>
        </phone-frame>
      </div>`,
  };

  const ArtSitemap = {
    data: () => ({
      tree: [
        { t: '服務', c: ['公司註冊', '記帳及報稅', '商業顧問'] },
        { t: '常見問題', c: ['收費安排', '所需文件'] },
        { t: '關於我們', c: ['團隊', '辦公室'] },
        { t: '查詢', c: ['分步表單', '預約時段'] },
      ],
    }),
    template: `
      <div class="w-full bg-[#FBFAF7] p-[6%] text-navy">
        <p class="text-[clamp(7px,0.9vw,10px)] tracking-[0.2em] text-gold-700">SITEMAP</p>
        <div class="mt-3 flex justify-center"><span class="border border-navy bg-navy px-3 py-1 text-[clamp(8px,1vw,12px)] text-paper">首頁</span></div>
        <div class="mx-auto h-4 w-px bg-navy/30"></div>
        <div class="grid grid-cols-4 gap-2 border-t border-navy/30 pt-4">
          <div v-for="b in tree" :key="b.t" class="text-center">
            <span class="block border border-navy/40 bg-white py-1 text-[clamp(7px,0.95vw,12px)] font-semibold">{{ b.t }}</span>
            <span v-for="c in b.c" :key="c" class="mt-1.5 block border border-dashed border-line py-1 text-[clamp(6px,0.85vw,10px)] text-ink/70">{{ c }}</span>
          </div>
        </div>
      </div>`,
  };

  const ArtForm = {
    components: { BrowserChrome },
    data: () => ({ steps: ['需要的服務', '公司資料', '聯絡方式'] }),
    template: `
      <div class="w-full bg-[#E9E5DD] p-[5%]">
        <browser-chrome url="www.example.com/contact">
          <div class="grid gap-[5%] px-[6%] py-[5%] text-[#22303D] sm:grid-cols-[0.9fr_1.4fr]">
            <div>
              <p class="font-serif-tc text-[clamp(11px,1.8vw,22px)] font-bold leading-tight">告訴我們<br />你需要甚麼協助</p>
              <ol class="mt-4 space-y-2">
                <li v-for="(s, i) in steps" :key="s" class="flex items-center gap-2 text-[clamp(7px,0.95vw,12px)]">
                  <span class="flex h-5 w-5 items-center justify-center rounded-full border border-[#22303D] text-[9px]" :class="i === 0 ? 'bg-[#22303D] text-white' : ''">{{ i + 1 }}</span>{{ s }}
                </li>
              </ol>
            </div>
            <div class="space-y-2.5">
              <p class="text-[clamp(7px,0.95vw,12px)] font-semibold">步驟 1：你需要哪些服務？（可複選）</p>
              <div v-for="(o, i) in ['公司註冊', '記帳及報稅', '商業顧問', '未確定，希望先了解']" :key="o" class="flex items-center gap-2 border border-[#E5E1D8] px-2.5 py-2 text-[clamp(7px,0.95vw,12px)]">
                <span class="flex h-3 w-3 items-center justify-center border border-[#22303D] text-[7px]" :class="i === 1 ? 'bg-[#22303D] text-white' : ''">{{ i === 1 ? '✓' : '' }}</span>{{ o }}
              </div>
              <div class="flex justify-end"><span class="rounded-[3px] bg-[#22303D] px-3 py-1 text-[clamp(7px,0.9vw,11px)] text-white">下一步</span></div>
            </div>
          </div>
        </browser-chrome>
      </div>`,
  };

  const ArtChat = {
    props: { compact: Boolean },
    data: () => ({
      sources: ['品牌語氣指南 v1', '秋季產品資料', '禁用字眼清單'],
      drafts: [
        { t: '方向一：產品故事', d: '由選材到完成，介紹秋季新品背後的三個細節。' },
        { t: '方向二：使用情境', d: '以「下班後的小儀式」為主題，帶出產品用法。' },
        { t: '方向三：限定提醒', d: '簡潔說明供應期及門市資訊，附上查詢方式。' },
      ],
    }),
    template: `
      <div class="w-full bg-navy p-[4%]">
        <div class="overflow-hidden rounded-[6px] border border-white/10 bg-[#FBFAF7] text-navy">
          <div class="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span class="text-[clamp(8px,1vw,12px)] font-semibold">品牌內容助理</span>
            <span class="rounded-[3px] border border-gold/60 px-1.5 py-0.5 text-[clamp(6px,0.8vw,10px)] text-gold-700">原型</span>
          </div>
          <div class="grid" :class="compact ? '' : 'sm:grid-cols-[0.8fr_2fr]'">
            <aside v-if="!compact" class="hidden border-r border-line bg-[#F3EEE5] p-3 sm:block">
              <p class="text-[clamp(7px,0.85vw,10px)] tracking-[0.16em] text-ink/60">資料來源</p>
              <ul class="mt-2 space-y-1.5">
                <li v-for="s in sources" :key="s" class="flex items-center gap-1.5 text-[clamp(7px,0.9vw,11px)]"><span class="h-1.5 w-1.5 rounded-full bg-gold"></span>{{ s }}</li>
              </ul>
              <p class="mt-4 text-[clamp(7px,0.85vw,10px)] tracking-[0.16em] text-ink/60">不使用</p>
              <p class="mt-1 text-[clamp(7px,0.9vw,11px)] text-ink/70">客戶個人資料</p>
            </aside>
            <div class="space-y-3 p-[4%]">
              <div class="ml-auto max-w-[80%] rounded-[6px] bg-navy px-3 py-2 text-[clamp(7px,0.95vw,12px)] leading-relaxed text-paper">為秋季新品構思 3 個 Instagram 貼文方向，語氣溫暖、不誇張。</div>
              <div class="max-w-[92%] rounded-[6px] border border-line bg-white px-3 py-2.5">
                <div v-for="(d, i) in (compact ? drafts.slice(0, 2) : drafts)" :key="d.t" class="border-b border-line py-1.5 last:border-0">
                  <p class="text-[clamp(7px,0.95vw,12px)] font-semibold">{{ d.t }}</p>
                  <p class="text-[clamp(7px,0.9vw,11px)] leading-relaxed text-ink/70">{{ d.d }}</p>
                </div>
                <p class="mt-2 text-[clamp(6px,0.8vw,10px)] text-ink/55">參考：品牌語氣指南 v1・秋季產品資料</p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="rounded-[3px] bg-gold/20 px-2 py-1 text-[clamp(6px,0.85vw,10px)] font-semibold text-gold-700">草稿・待人工審核</span>
                <span class="text-[clamp(6px,0.85vw,10px)] text-ink/60">需經負責人批准後才可發布</span>
              </div>
            </div>
          </div>
        </div>
      </div>`,
  };

  const ArtFlow = {
    props: { compact: Boolean },
    data: () => ({
      steps: [
        { t: '提交主題與目標', who: '同事' },
        { t: '讀取已確認的品牌資料', who: 'AI' },
        { t: '生成多個草稿方向', who: 'AI' },
        { t: '檢查事實與品牌語氣', who: '人工' },
        { t: '批准或退回修改', who: '人工' },
        { t: '排程發布並存檔', who: '同事' },
      ],
    }),
    template: `
      <div class="w-full bg-[#FBFAF7] p-[6%] text-navy">
        <p v-if="!compact" class="text-[clamp(7px,0.9vw,10px)] tracking-[0.2em] text-gold-700">WORKFLOW</p>
        <ol class="relative" :class="compact ? 'space-y-1.5' : 'mt-3 space-y-2.5'">
          <span class="absolute bottom-3 left-[11px] top-3 w-px bg-line" aria-hidden="true"></span>
          <li v-for="(s, i) in (compact ? steps.slice(1, 5) : steps)" :key="s.t" class="relative flex items-center gap-3">
            <span class="relative z-[1] flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full border text-[9px] font-semibold" :class="s.who === '人工' ? 'border-gold bg-gold text-navy' : (s.who === 'AI' ? 'border-navy bg-navy text-paper' : 'border-navy/40 bg-white')">{{ compact ? i + 2 : i + 1 }}</span>
            <span class="flex-1 text-[clamp(8px,1vw,13px)]">{{ s.t }}</span>
            <span class="text-[clamp(6px,0.85vw,10px)] tracking-[0.12em]" :class="s.who === '人工' ? 'font-semibold text-gold-700' : 'text-ink/55'">{{ s.who }}</span>
          </li>
        </ol>
      </div>`,
  };

  const ArtReview = {
    data: () => ({
      checks: [
        ['產品名稱及供應期正確', true],
        ['沒有誇大或保證式字眼', true],
        ['符合品牌語氣指南', true],
        ['不含客戶個人資料', true],
        ['圖片及字體使用權已確認', false],
      ],
    }),
    template: `
      <div class="w-full bg-[#F3EEE5] p-[6%] text-navy">
        <div class="border border-line bg-white p-[6%]">
          <div class="flex items-center justify-between">
            <p class="font-serif-tc text-[clamp(11px,1.6vw,18px)] font-bold">審核：方向一・產品故事</p>
            <span class="rounded-[3px] bg-gold/20 px-1.5 py-0.5 text-[clamp(6px,0.8vw,10px)] font-semibold text-gold-700">待批准</span>
          </div>
          <ul class="mt-3 space-y-2">
            <li v-for="c in checks" :key="c[0]" class="flex items-center gap-2 text-[clamp(7px,0.95vw,12px)]">
              <span class="flex h-3.5 w-3.5 items-center justify-center border border-navy text-[8px]" :class="c[1] ? 'bg-navy text-paper' : ''">{{ c[1] ? '✓' : '' }}</span>
              <span :class="c[1] ? '' : 'text-ink/60'">{{ c[0] }}</span>
            </li>
          </ul>
          <div class="mt-4 flex gap-2 border-t border-line pt-3 text-[clamp(7px,0.9vw,11px)]">
            <span class="rounded-[3px] border border-navy/30 px-2.5 py-1">退回修改</span>
            <span class="rounded-[3px] bg-navy/30 px-2.5 py-1 text-paper">批准（尚有 1 項未確認）</span>
          </div>
        </div>
        <p class="mt-3 text-[clamp(6px,0.85vw,10px)] text-ink/60">所有檢查項目完成後，負責人才可批准發布。</p>
      </div>`,
  };

  /* ---------- 真實案例：以客戶提供的數據繪製 ---------- */
  const ArtTrend = {
    props: { data: { type: Object, required: true } },
    computed: {
      max() { return Math.max.apply(null, this.data.series); },
      bars() {
        const n = this.data.series.length; const w = 560 / n;
        const inRange = (i, r) => r && i >= r.from && i <= r.to;
        return this.data.series.map((v, i) => ({
          x: 20 + i * w, w: Math.max(w - 2, 1), h: Math.max((v / this.max) * 190, v > 0 ? 1 : 0),
          fill: inRange(i, this.data.highlight) ? '#B69860' : inRange(i, this.data.gap) ? '#C9C2B4' : '#1A293A',
        }));
      },
      ticks() {
        const start = new Date(this.data.start); const n = this.data.series.length; const w = 560 / n; const out = [];
        for (let m = 0; m < 12; m++) {
          const d = new Date(start.getFullYear(), m, 1);
          const idx = (d - start) / 864e5 / 7;
          if (idx >= 0 && idx < n) out.push({ x: 20 + idx * w, t: (m + 1) + '月' });
        }
        return out;
      },
      span() {
        const w = 560 / this.data.series.length;
        const f = (r) => r ? { x: 20 + r.from * w, w: (r.to - r.from + 1) * w, label: r.label } : null;
        return { hi: f(this.data.highlight), gap: f(this.data.gap) };
      },
    },
    template: `
      <div class="w-full bg-white p-[5%] text-navy">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <p class="font-serif-tc text-[clamp(11px,3.4cqw,20px)] font-bold">{{ data.title }}</p>
          <p class="text-[clamp(7px,1.9cqw,11px)] text-ink/60">{{ data.unit }}</p>
        </div>
        <svg viewBox="0 0 600 250" class="mt-[3%] w-full">
          <line x1="20" y1="210" x2="580" y2="210" stroke="#DED7C8" />
          <g v-if="span.hi">
            <rect :x="span.hi.x" y="6" :width="span.hi.w" height="204" fill="#B69860" fill-opacity=".08" />
            <text :x="span.hi.x + 4" y="20" font-size="11" fill="#7F6532" font-weight="600">{{ span.hi.label }}</text>
          </g>
          <g v-if="span.gap">
            <text :x="span.gap.x + span.gap.w / 2" y="200" font-size="10" fill="#6B6F76" text-anchor="middle">{{ span.gap.label }}</text>
          </g>
          <rect v-for="(b, i) in bars" :key="i" :x="b.x" :y="210 - b.h" :width="b.w" :height="b.h" :fill="b.fill" />
          <g v-for="t in ticks" :key="t.t">
            <line :x1="t.x" y1="210" :x2="t.x" y2="215" stroke="#9A958B" />
            <text :x="t.x" y="230" font-size="11" fill="#6B6F76">{{ t.t }}</text>
          </g>
        </svg>
        <p v-if="data.note" class="mt-[2%] text-[clamp(7px,1.8cqw,11px)] leading-relaxed text-ink/65">{{ data.note }}</p>
      </div>`,
  };

  const ArtAudience = {
    props: { data: { type: Object, required: true } },
    computed: {
      ageMax() { return Math.max.apply(null, this.data.ages.map((a) => a[1] + a[2])); },
      regionMax() { return Math.max.apply(null, this.data.regions.map((r) => r[1])); },
    },
    template: `
      <div class="w-full bg-white p-[5%] text-navy">
        <p class="font-serif-tc text-[clamp(11px,3.4cqw,20px)] font-bold">{{ data.title }}</p>
        <div class="mt-[4%] grid grid-cols-2 gap-[6%]">
          <div>
            <p class="text-[clamp(7px,2cqw,12px)] font-semibold text-gold-700">年齡及性別（%）</p>
            <ul class="mt-[5%] space-y-[4%]">
              <li v-for="a in data.ages" :key="a[0]" class="grid grid-cols-[3.2em_1fr_2.6em] items-center gap-[4%] text-[clamp(7px,1.9cqw,11px)]">
                <span class="text-ink/70">{{ a[0] }}</span>
                <span class="flex h-[0.9em]">
                  <span class="bg-navy" :style="{ width: (a[1] / ageMax * 100) + '%' }"></span>
                  <span class="bg-gold" :style="{ width: (a[2] / ageMax * 100) + '%' }"></span>
                </span>
                <span class="text-right tabular-nums">{{ (a[1] + a[2]).toFixed(1) }}</span>
              </li>
            </ul>
            <p class="mt-[5%] flex gap-[6%] text-[clamp(7px,1.8cqw,11px)] text-ink/70">
              <span class="flex items-center gap-1"><span class="inline-block h-2 w-2 bg-navy"></span>男性 {{ data.gender.male }}%</span>
              <span class="flex items-center gap-1"><span class="inline-block h-2 w-2 bg-gold"></span>女性 {{ data.gender.female }}%</span>
            </p>
          </div>
          <div>
            <p class="text-[clamp(7px,2cqw,12px)] font-semibold text-gold-700">國家／地區（%）</p>
            <ul class="mt-[5%] space-y-[4%]">
              <li v-for="r in data.regions" :key="r[0]" class="grid grid-cols-[3.6em_1fr_2.6em] items-center gap-[4%] text-[clamp(7px,1.9cqw,11px)]">
                <span class="text-ink/70">{{ r[0] }}</span>
                <span class="h-[0.9em] bg-[#F0EDE6]"><span class="block h-full bg-navy" :style="{ width: (r[1] / regionMax * 100) + '%' }"></span></span>
                <span class="text-right tabular-nums">{{ r[1] }}</span>
              </li>
            </ul>
          </div>
        </div>
        <p v-if="data.note" class="mt-[4%] text-[clamp(7px,1.8cqw,11px)] text-ink/65">{{ data.note }}</p>
      </div>`,
  };

  const ArtAccount = {
    props: { data: { type: Object, required: true } },
    template: `
      <div class="relative w-full overflow-hidden border border-white/15 bg-navy-900 p-[8%] text-paper" style="aspect-ratio: 4 / 5">
        <svg class="absolute inset-0 h-full w-full" viewBox="0 0 100 125" preserveAspectRatio="none" aria-hidden="true"><path d="M0 125 L100 20" stroke="#B69860" stroke-width=".3" /></svg>
        <div class="relative flex h-full flex-col">
          <p class="text-[clamp(7px,2.6cqw,13px)] font-semibold tracking-[0.2em] text-gold-300">{{ data.platform.toUpperCase() }}</p>
          <p class="mt-[6%] break-all font-display text-[clamp(18px,10cqw,58px)] leading-[1.05]">@{{ data.handle }}</p>
          <p class="mt-[4%] text-[clamp(8px,3cqw,16px)] text-paper/80">{{ data.industry }}</p>
          <ul class="mt-auto flex flex-wrap gap-[2.5%]">
            <li v-for="t in data.tags" :key="t" class="mb-[2.5%] border border-white/25 px-[3.5%] py-[1.5%] text-[clamp(7px,2.4cqw,12px)]">{{ t }}</li>
          </ul>
        </div>
      </div>`,
  };

  const ArtStats = {
    props: { data: { type: Object, required: true } },
    template: `
      <div class="w-full bg-white p-[6%] text-navy">
        <p class="font-serif-tc text-[clamp(11px,3.4cqw,20px)] font-bold">{{ data.title }}</p>
        <ul class="mt-[5%] grid gap-px bg-line" :class="data.items.length > 2 ? 'grid-cols-3' : 'grid-cols-2'">
          <li v-for="s in data.items" :key="s.label" class="bg-white py-[6%] pr-[4%]">
            <p class="font-display text-[clamp(18px,9cqw,52px)] leading-none">{{ s.value }}</p>
            <p class="mt-[6%] text-[clamp(7px,2.2cqw,12px)] text-ink/75">{{ s.label }}</p>
          </li>
        </ul>
        <p v-if="data.note" class="mt-[4%] text-[clamp(7px,1.8cqw,11px)] text-ink/65">{{ data.note }}</p>
      </div>`,
  };

  const ART_COMPONENTS = {
    trend: ArtTrend,
    audience: ArtAudience,
    account: ArtAccount,
    stats: ArtStats,
    social: ArtSocial,
    reel: ArtReel,
    calendar: ArtCalendar,
    brand: ArtBrand,
    slides: ArtSlides,
    worksheet: ArtWorksheet,
    prompt: ArtPrompt,
    sop: ArtSop,
    browser: ArtBrowser,
    phone: ArtPhone,
    sitemap: ArtSitemap,
    form: ArtForm,
    chat: ArtChat,
    flow: ArtFlow,
    review: ArtReview,
  };

  const ArtPiece = {
    props: {
      art: { type: String, required: true },
      compact: Boolean,
      label: String,
      data: Object,
    },
    computed: {
      component() { return ART_COMPONENTS[this.art]; },
      altText() { return this.label || ART_LABELS[this.art] || '概念設計畫面'; },
    },
    template: `
      <div role="img" :aria-label="altText" class="w-full select-none" style="container-type: inline-size">
        <div aria-hidden="true" class="pointer-events-none">
          <component :is="component" v-if="data" :data="data" />
          <component :is="component" v-else :compact="compact" />
        </div>
      </div>`,
  };

export { ArtPiece, ART_LABELS, PhoneFrame, BrowserChrome, FoodMotif };
