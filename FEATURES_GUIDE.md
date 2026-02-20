# 🚀 AI Summary App - 完整功能指南

## 📋 目錄
1. [新增功能](#新增功能)
2. [Supabase Object Storage](#supabase-object-storage)
3. [改進的編輯器](#改進的編輯器)
4. [文本格式化](#文本格式化)
5. [AI 重寫功能](#ai-重寫功能)
6. [使用步驟](#使用步驟)
7. [API 端點](#api-端點)

---

## 新增功能

### ✨ 主要改進

1. **Supabase Object Storage 集成**
   - 所有上傳嘅檔案而家儲存喺 Supabase storage bucket
   - 自動生成公開 URL 以便日後存取
   - 提供下載功能

2. **全新編輯器設計**
   - 側邊預覽 (Side-by-side preview)
   - **大型編輯區域** (h-96 ≈ 384px 高度)
   - 實時字符計數
   - 響應式佈局 (mobile-friendly)

3. **文本選擇和格式化**
   - 選擇文字後自動出現工具欄
   - **粗體** (Bold)：`**文字**`
   - *斜體* (Italic)：`*文字*`
   - <u>底線</u> (Underline)：`<u>文字</u>`

4. **AI 重寫功能**
   - 選擇文字，彈出 AI 重寫菜單
   - 4 個預設模式：簡化、專業、隨意、自定義
   - 自定義重寫指令

5. **額外功能**
   - ⬇️ 下載摘要為 TXT 檔案
   - 📋 複製到剪貼板
   - 🔄 重新生成摘要（5 種風格）

---

## Supabase Object Storage

### 設置步驟

**詳見 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**

簡單流程：
1. 登錄 Supabase 控制台
2. 建立 Bucket 名稱：`documents`
3. 設定為 Private（安全）
4. 配置 Policies（權限）
5. 應用會自動上傳檔案

### 上傳流程

```
用戶上傳檔案
    ↓
後端建立 document 記錄
    ↓
上傳檔案到 storage bucket
    ↓
取得公開 URL
    ↓
更新 document 記錄中嘅 file_url
    ↓
返回成功回應給用戶
```

### 儲存路徑結構
```
documents/
├── {documentId}/
│   ├── original.pdf
│   ├── original.txt
│   └── original.md
```

---

## 改進的編輯器

### 新布局（編輯模式）

```
┌─────────────────────────────────┬──────────────────────┐
│     編輯器（左側）              │    預覽（右側）      │
│                                 │                      │
│ [格式化工具欄]                  │ 實時 Markdown 預覽   │
│                                 │                      │
│ [大型文字編輯區 h-96]           │ [固定/粘性位置]      │
│ (支持 Cmd/Ctrl + A 選全部)     │                      │
│                                 │ 字符計數：XXXX      │
│                                 │                      │
│ [✓ 保存變更] [✕ 取消]         │                      │
└─────────────────────────────────┴──────────────────────┘
```

### 響應式設計
- **桌面 (lg+)**：2 列並排
- **手機 (<lg)**：1 列堆疊

---

## 文本格式化

### 使用方法

1. **選擇文字**
   - 喺編輯器中拖動滑鼠選擇文字
   - 或雙擊選擇單字

2. **格式化工具欄自動出現**
   - 顯示選定文字
   - 提供格式化按鈕

3. **點擊格式按鈕**
   - **B** → Bold：`**text**`
   - *I* → Italic：`*text*`
   - *U* → Underline：`<u>text</u>`

4. **實時預覽更新**
   - 右側預覽立即反映變更

---

## AI 重寫功能

### 4 個預設模式

| 模式 | 用途 | 範例提示 |
|------|------|---------|
| **簡化** | 簡單易懂 | "用更簡單嘅語言重寫" |
| **專業** | 正式文件 | "用更專業並正式嘅語氣" |
| **隨意** | 友善溝通 | "用更友善同隨意嘅語氣" |
| **自定義** | 自定義要求 | 用戶輸入的任何指令 |

### 使用步驟

1. 選擇要重寫嘅文字
2. 格式化工具欄中點「AI 重寫」
3. 選擇預設模式 或 輸入自定義指令
4. 點「執行」
5. 文字自動替換為重寫版本

### 例子

**原文**：
> 該系統利用先進的機械學習演算法實現實時資料處理

**簡化後**：
> 系統用人工智能快速處理資料

**專業後**：
> 本系統採用深度機械學習演算法進行實時資料處理和分析

---

## 使用步驟

### 完整工作流程

#### 1️⃣ 上傳檔案
```
首頁 → 「上傳」區域 → 
  拖放檔案 OR 點選檔案 OR 貼文字 →
  檔案上傳到 Supabase storage →
  顯示當前檔案
```

#### 2️⃣ 生成摘要
```
當前檔案已選 → 「生成摘要」區域 →
  [可選：輸入自定義提示] →
  點「生成」→
  AI 生成摘要 →
  顯示摘要預覽
```

#### 3️⃣ 編輯摘要
```
摘要已生成 → 點「✏️ 編輯摘要」→
  側邊編輯模式啟動 →
  [選擇文字進行格式化或 AI 重寫] →
  點「✓ 保存變更」→
  摘要已更新
```

#### 4️⃣ 其他選項
```
摘要已保存 →
  - 「📋 複製」：複製到剪貼板
  - 「⬇️ 下載」：下載為 TXT 檔案
  - 「🔄 重新生成」：用不同風格重新生成
  - 「+ 上傳新檔案」：上傳其他檔案
```

---

## API 端點

### 已有的 API

| 方法 | 端點 | 功能 |
|------|------|------|
| GET | `/api/documents` | 獲取所有檔案 |
| GET | `/api/documents/{id}` | 獲取特定檔案 |
| POST | `/api/upload` | 上傳檔案（支援 PDF、TXT、MD 等） |
| POST | `/api/summarize` | 生成 AI 摘要 |
| POST | `/api/regenerate` | 重新生成摘要 |
| POST | `/api/rephrase` | **✨ NEW** - AI 重寫文字 |
| GET | `/api/health` | 健康檢查 |

### 新端點：`/api/rephrase`

**請求 (Request)**：
```json
{
  "text": "要重寫嘅文字",
  "prompt": "重寫指令（例如：簡化、用更專業嘅語氣等）"
}
```

**回應 (Response)**：
```json
{
  "success": true,
  "rephrased": "重寫後嘅文字",
  "originalText": "原始文字"
}
```

### 錯誤處理

```typescript
try {
  const response = await fetch('/api/rephrase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, prompt }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Error:', error.error);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

---

## 環境變數

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI API
GITHUB_MODEL_API_KEY=your-github-models-key
```

---

## 技術棧

| 功能 | 技術 |
|------|------|
| 前端框架 | Next.js 14+ (App Router) |
| UI 工具 | Tailwind CSS v4 |
| 資料庫 | Supabase (PostgreSQL) |
| 檔案存儲 | Supabase Storage |
| AI 模型 | GitHub Models (GPT-4o) |
| PDF 處理 | PDF.js |
| Markdown 渲染 | react-markdown |
| 3D 效果 | Three.js + React Three Fiber |

---

## 🎯 快速參考

### 鍵盤快捷鍵（編輯器中）
- `Ctrl/Cmd + A`：全選
- 拖動選擇：啟動格式化工具欄

### 常見問題

**Q: 上傳後檔案去咗邊？**
A: 檔案儲存喺 Supabase Storage bucket `documents/{documentId}/` 中

**Q: 可唔可以編輯已生成嘅摘要？**
A: 可以！點「✏️ 編輯摘要」進行全面編輯

**Q: 可唔可以重新生成摘要？**
A: 可以！點「🔄 重新生成」選擇風格或輸入自定義提示

**Q: 底線（Underline）係咩？**
A: HTML 標籤 `<u>` 出現在 Markdown 預覽中

**Q: AI 重寫安全嗎？**
A: 安全！只係前端重寫選定嘅文字，唔會互相影響

---

## 📞 支持

遇到問題？
1. 檢查 Supabase 配置（[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)）
2. 確保 API 密鑰正確
3. 檢查瀏覽器控制台嘅錯誤信息
4. 重新整理頁面試試

---

**最後更新**：2026 年 2 月 20 日
版本：2.0 (Object Storage + Enhanced Editor)
