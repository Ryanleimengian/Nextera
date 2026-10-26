# NextEra 官網（Nuxt）

NextEra 品牌官網，以 [Nuxt 4](https://nuxt.com/) 建置。全站共用版面由 `app/layouts/default.vue` 提供，**頁首**與**頁尾**已拆成可重用元件，各頁面只需專注內容。

## 專案結構（重點）

| 路徑 | 說明 |
|------|------|
| `app/components/layout/SiteHeader.vue` | 頁首導覽（`NuxtLink`） |
| `app/components/layout/SiteFooter.vue` | 頁尾 |
| `app/components/layout/MobileMenu.vue` | 手機選單 |
| `app/layouts/default.vue` | 預設版面：Header → 主內容 `<slot>` → Footer |
| `app/pages/` | 檔案式路由（`index`、`about`、`media`、`contact`、`work/`、`services/` 等） |
| `app/data/content.js` | 站點文案與結構化內容 |
| `public/assets/` | 靜態圖片與媒體 |
| `assets/js/` | 舊版 CDN SPA 原始碼（維護內容時可對照；上線以 Nuxt 為準） |

從舊 `app.js` 抽出的頁面元件在 `app/lib/nextera-legacy.mjs`，由 `app/plugins/nextera.client.js` 註冊。

## 開發

```bash
npm install
npm run dev
```

本機預設：<http://localhost:3000>

## 建置

```bash
npm run build    # Node 伺服器輸出（.output/）
npm run generate # 靜態站（若部署至 Netlify 等靜態主機，請依 Nuxt 文件設定）
npm run preview  # 預覽 production build
```

## 維護腳本（可選）

從舊 SPA 同步產物時：

```bash
node scripts/extract-css.mjs      # → app/assets/css/nextera.css
node scripts/build-legacy.mjs     # → app/lib/nextera-legacy.mjs
node scripts/export-artworks.mjs  # → app/utils/artworks.mjs
```

## 部署提示

- 靜態資源放在 `public/`，建置後會複製到輸出目錄。
- 若沿用 Netlify，請將建置指令改為 `npm run generate`（或 `nuxt build` + 對應 publish 目錄），並更新 publish 路徑為 Nuxt 產物（例如 `.output/public`）。
