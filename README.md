# 種德中藥行 · JUNG-DE 官方網站

近百年漢方老店的官方網站。內容導向、**無購物車**，唯一的轉換動作是 **LINE**（訂購／詢問／付款都透過 LINE 或來電）。

---

## 一、怎麼看（本機預覽）

這是純靜態網站，**不需要編譯**。但因為內容改用資料檔載入，**本機預覽要用小型伺服器**（不能直接雙擊 `index.html`）：

- 有 Python：在 `site/` 資料夾執行 `python -m http.server 8000`，再開 `http://localhost:8000`
- 上線到 Netlify 後一切正常，無此限制。

## 二、怎麼改內容（這是您日常會做的）

上線後，您會有一個**後臺**可以登入、打字、上傳照片、按新增／刪除——不用碰程式碼。

👉 **完整圖文步驟（如何上線、如何登入後臺、如何新增／下架商品）請看 [`後臺使用說明.md`](../後臺使用說明.md)。**

簡述：上線到 Netlify 後，打開 `你的網址/admin/` 登入，左邊就有「商品 / 文章 / 分類 / 內容頁 / 網站設定」。

- **新增商品**：商品 → 商品列表 → 按「Add 商品」→ 填名稱/價格/分類/上傳照片 → Publish。
- **下架商品**：在商品列表把那一筆刪掉 → Publish。
- 文章、分類、門市資料、LINE 連結同理。

> 進階：所有內容其實是 `content/` 資料夾裡的 JSON 檔（`products.json`、`articles.json`…），懂的人也可以直接改這些檔。後臺只是這些檔的友善編輯介面。

## 三、怎麼上線（變成打網址就能看的網站）

因為是純靜態網站，最簡單的方式是把 **整個 `site/` 資料夾** 拖到免費託管服務：

- **要用後臺，必須用「GitHub + Netlify」的方式上線**（不能只用拖拉），因為後臺要把你的修改存回 GitHub。
- 完整步驟見 [`後臺使用說明.md`](../後臺使用說明.md)。
- 不需要任何建置指令（build command 留空，發佈目錄＝這個資料夾）。

## 四、頁面一覽

| 頁面 | 網址（hash） | 說明 |
| --- | --- | --- |
| 首頁 | `#/` | Hero 引言、品牌特色、商品介紹、熱門商品、分類、文章預覽、門市資訊 |
| 關於種德 | `#/about` | 品牌故事，並連到「百年傳承」「媒體採訪」 |
| 漢方茶品 | `#/category/tea` | 分類介紹 + 商品列表 |
| 漢方佳餚 | `#/category/food` | 同上 |
| 藥草香袋 | `#/category/sachet` | 同上 |
| 漢方主題文章 | `#/articles` | 分類篩選 + 文章列表 |
| 客製化服務 | `#/content/service` | 代煎・代磨粉介紹 + 諮詢表單 |
| 百年傳承 | `#/content/heritage` | 年表 + 故事 |
| 媒體採訪 | `#/content/press` | 採訪內容 |
| 單一商品 | `#/product/rose` | 商品介紹頁（LINE 訂購，無結帳） |

## 五、技術說明（給工程師）

- 純 HTML / CSS / 原生 JavaScript，無建置步驟、無框架相依。
- 內容存於 `content/*.json`，由 `js/app.js` 啟動時 `fetch` 載入並組成 `window.JD_DATA`。
- 後臺為 **Decap CMS**：`admin/index.html` + `admin/config.yml`（`git-gateway` 後端 + Netlify Identity 登入）。
- 設計 token 在 `css/tokens/`，元件與頁面樣式在 `css/site.css`。
- 路由為 hash-based SPA（`js/app.js`），畫面元件是設計系統 primitives 的忠實移植（Button / LineButton / Tag / ProductCard / ArticleCard / SectionHeading / FeatureItem / Input / SiteHeader / SiteFooter）。
- 圖示使用 Remix Icon（CDN）；字型使用 Google Fonts 的 Noto Serif TC／Noto Sans TC／Inter。
- 部署：repo 根目錄 = 本資料夾內容（`index.html`、`admin/`、`content/`、`assets/` 都在根）；Netlify publish directory = 根；build command 留空。

## 待提供 / 可再優化

1. **真實 LINE 官方帳號連結**（目前 `content/settings.json` 內為範例）。
2. **真實商品、價格、照片**與**真實文章內容**（上線後直接用後臺改）。
3. 授權字型檔（目前以 Google Fonts 代替，可直接上線）。
4. 部分圖片為共用替代（`photo-tea.png`、`photo-family.png` 目前複製自既有照片），可換成實拍照。
