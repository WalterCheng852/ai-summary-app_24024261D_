# 📸 測試同截圖指南

## 🎯 前置準備

### 1️⃣ 先要設置 Supabase Object Storage

**詳細步驟見 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**

簡單版本：
1. 去 https://supabase.com/dashboard
2. 登入你嘅專案
3. 左側找「Storage」
4. 點「Create a new bucket」
5. 名稱：`documents`，選擇 Private
6. 點「Create bucket」
7. ✅ 完成！應用會自動上傳檔案

---

## 🚀 開始測試

### 啟動開發伺服器

```bash
cd /workspaces/ai-summary-app_24024261D_/my-app
npm run dev
```

打開 http://localhost:3000

---

## 📸 截圖檢查清單

### ✅ 應該要測試的功能

| # | 功能 | 步驟 | 截圖位置 |
|---|------|------|---------|
| 1 | 首頁設計 | 訪問首頁 | `./screenshots/01-home.png` |
| 2 | 檔案上傳 | 上傳 PDF/TXT | `./screenshots/02-upload.png` |
| 3 | Supabase 驗證 | 檢查 Storage bucket | `./screenshots/03-supabase-storage.png` |
| 4 | 摘要生成 | 點「生成摘要」 | `./screenshots/04-summary-generated.png` |
| 5 | 編輯器打開 | 點「✏️ 編輯摘要」 | `./screenshots/05-editor-open.png` |
| 6 | 文本選擇 | 在編輯器選擇文字 | `./screenshots/06-text-selection.png` |
| 7 | 格式化工具 | 選擇文字看工具欄 | `./screenshots/07-formatting-toolbar.png` |
| 8 | 粗體格式 | 點「B」加粗 | `./screenshots/08-bold-format.png` |
| 9 | AI 重寫 | 點「簡化」重寫 | `./screenshots/09-ai-rephrase.png` |
| 10 | 預覽更新 | 看右側預覽實時更新 | `./screenshots/10-preview-live.png` |
| 11 | 保存変更 | 點「✓ 保存變更」 | `./screenshots/11-save-changes.png` |
| 12 | 下載功能 | 點「⬇️ 下載」存 TXT | `./screenshots/12-download.png` |
| 13 | 手機響應式 | 縮小窗口或用手機 | `./screenshots/13-responsive-mobile.png` |
| 14 | 檔案歷史 | 查看過去上傳 | `./screenshots/14-history.png` |
| 15 | 重新生成 | 用不同風格重生成 | `./screenshots/15-regenerate.png` |

---

## 📸 如何截圖

### 方法 1：Chrome DevTools
1. 按 `F12` 打開開發者工具
2. 按 `Ctrl+Shift+M`（或點手機圖標）進入響應式模式
3. 右上角選擇「Capture screenshot」

### 方法 2：Windows 截圖工具
1. 按 `Win + Shift + S`
2. 拖動選擇區域
3. 自動保存到剪貼板

### 方法 3：Mac 截圖
1. 按 `Cmd + Shift + 4`
2. 拖動選擇區域
3. 保存到桌面

---

## 🧪 測試場景

### 場景 1：PDF 上傳
```
1. 準備：有一份 PDF 檔案（例如技術文件）
2. 上傳：拖到上傳區域或點選
3. 檢查：
   - ✅ 檔案名稱顯示
   - ✅ Supabase Storage 有檔案（瀏覽器開發者工具）
   - ✅ 資料庫 documents 表有記錄
4. 截圖：上傳完成狀態
```

### 場景 2：摘要編輯
```
1. 生成摘要後，點「✏️ 編輯摘要」
2. 選擇一句文字（例如：「這是一個關鍵點」）
3. 看工具欄是否出現
4. 試試：
   - **粗體**
   - *斜體*
   - <u>底線</u>
5. 截圖每個步驟
```

### 場景 3：AI 重寫
```
1. 編輯器中選擇文字
2. 工具欄點「AI 重寫」區域
3. 試試 4 個預設模式：
   - 簡化
   - 專業
   - 隨意
   - 自定義（輸入要求）
4. 觀察文字如何變化
5. 截圖最後結果
```

### 場景 4：行動裝置測試
```
1. Chrome DevTools → 響應式模式
2. 選擇「iPhone 12/13」或自訂寬度
3. 測試所有功能：
   - 上傳
   - 編輯
   - 文字選擇
   - 格式化
4. 確保沒有水平捲動問題
5. 截圖完整頁面
```

---

## 📊 Supabase 驗證檢查清單

### 檢查 Storage Bucket
```
Supabase Dashboard → Storage → 「documents」bucket
```

應該出現的檔案結構：
```
documents/
├── [document-id-1]/
│   └── original.pdf
├── [document-id-2]/
│   └── original.txt
└── [document-id-3]/
    └── original.md
```

### 檢查 Database Records
```
Supabase Dashboard → SQL Editor → 執行：
```

```sql
-- 檢查 documents 表
SELECT id, filename, file_type, file_url, created_at 
FROM documents 
ORDER BY created_at DESC 
LIMIT 10;
```

應該看到：
- ✅ `filename`：上傳的檔案名稱
- ✅ `file_url`：Supabase Storage 公開 URL
- ✅ `file_type`：pdf/txt/md/raw_text
- ✅ `created_at`：上傳時間

```sql
-- 檢查 summaries 表
SELECT id, document_id, generated_summary, edited_summary, created_at
FROM summaries
LIMIT 10;
```

應該看到生成的摘要記錄

---

## 🎬 截圖模板

### 1. 首頁截圖
```
標題：「應用程式首頁 - AI Summary 歡迎畫面」
展示：
- 大標題「AI Summary」
- 介紹文字
- 上傳區域
```

### 2. 上傳檔案截圖
```
標題：「檔案上傳成功 - 當前檔案顯示」
展示：
- 檔案名稱
- 上傳進度（如有）
- 檔案資訊
```

### 3. 編輯器截圖
```
標題：「改進的編輯器 - 雙欄布局（編輯 + 預覽）」
展示：
- 左側大型編輯區
- 右側實時預覽
- 格式化工具欄（選擇文字時）
- 字符計數
```

### 4. Supabase 驗證截圖
```
標題：「Supabase Storage Bucket - 上傳檔案驗證」
展示：
- Storage 中的 documents bucket
- 檔案清單（帶大小、上傳時間）
```

### 5. 行動版本截圖
```
標題：「行動友善響應式設計 - iPhone 12 視圖」
展示：
- 單欄布局
- 按鈕大小合適
- 文字清晰可讀
```

---

## 💡 測試提示

### ✅ 先做這些
1. 確保 Supabase 有 `documents` bucket（private）
2. 環境變數正確配置
3. 開發伺服器執行正常（`npm run dev`）

### ⚠️ 常見問題
| 問題 | 解決方案 |
|------|---------|
| 上傳失敗 | 檢查 Supabase 環境變數；Storage bucket 是否存在 |
| 格式化工具不出現 | 確保選擇了文字；瀏覽器支持文字選擇事件 |
| AI 重寫超時 | API 密鑰可能錯誤；檢查網絡連接 |
| 預覽不更新 | 檢查瀏覽器控制台懸誤；重新整理 |
| 手機顯示混亂 | 清除瀏覽器緩存；試試不同瀏覽器 |

### 📝 記錄測試結果
建議新建檔案記錄：`TEST_RESULTS.md`

```markdown
# 測試結果

## 日期：2026 年 2 月 20 日
## 環境：Chrome 最新版本

### 功能測試
- [ ] 首頁加載
- [ ] 檔案上傳
- [ ] 摘要生成
- [ ] 編輯器
- [ ] 文本選擇
- [ ] 格式化
- [ ] AI 重寫
- [ ] 下載
- [ ] 行動響應式

### Supabase 驗證
- [ ] Storage bucket 存在
- [ ] 檔案已上傳
- [ ] file_url 已填充
- [ ] Database 記錄完整

### 結論
✅ 所有功能正常
❌ 發現問題：[描述]
```

---

## 🚀 下一步

1. **測試應用**（~30 分鐘）
   - 按照上面嘅場景测試
   - 記錄任何問題

2. **截圖記錄**（~20 分鐘）
   - 拍攝 15 張關鍵截圖
   - 保存到 `./screenshots/`

3. **部署到 Vercel**
   ```bash
   vercel deploy --prod
   ```
   - 確保生產環境工作
   - 測試所有功能
   - 截圖已部署版本

4. **提交報告**
   ```bash
   git add screenshots/
   git commit -m "docs: add testing screenshots and verification"
   git push
   ```

---

## 📞 Need Help?

如果遇到問題：
1. 檢查 [FEATURES_GUIDE.md](./FEATURES_GUIDE.md)  - 功能說明
2. 檢查 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)  - Supabase 設置
3. 查看瀏覽器控制台错误 (F12)
4. 檢查 `.env.local` 環境變數
5. 試試清除 `.next` 資料夾並重新構建

---

**祝你測試順利！** 🎉

如有任何問題，隨時問我！
