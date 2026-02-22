# 🎯 Supabase Policy 配置 - 視覺化逐步指南

## 方法選擇

```
你有兩個選擇：

┌─────────────────────────────────────┐
│  選項 A：簡單（推薦）              │
│  跳過 Policy，直接用應用            │
│  ✅ 應該可以正常運作                │
│  ⏱️  用時：0 分鐘                   │
└─────────────────────────────────────┘

或

┌─────────────────────────────────────┐
│  選項 B：完整（更安全）             │
│  設置 Policy（詳細步驟見下方）      │
│  ✅ 更符合最佳實踐 best practice   │
│  ⏱️  用時：3-5 分鐘                 │
└─────────────────────────────────────┘

👉 如果唔知點做，就選 Option A！
```

---

## 📸 **視覺化步驟-by-step**

### 🔵 **第一步：進入 Bucket 設置**

```
Supabase Dashboard
    ↓
左側選單找「Storage」
    ↓
搵 「documents」bucket
    ↓
點擊 「Policies」分頁
```

你應該會見到：
```
┌──────────────────────────────┐
│ documents /// Policies       │
├──────────────────────────────┤
│ Existing Policies:           │
│ (可能係空或有其他 policies) │
│                              │
│ [+ New Policy] [+ Create...] │
└──────────────────────────────┘
```

點「+ New Policy」或「+ Create a new policy」

---

### 🟢 **第二步：選擇 Policy 模板**

Supabase 會問你選擇哪種操作：

```
Select a template:

○ For individual SELECT access
○ For individual INSERT access  
○ For individual UPDATE access
○ For individual DELETE access
○ For individual upload access     ← 👈 選擇呢個！
○ For individual download access
○ Custom policy (with SQL)
```

**點選「For individual upload access」**

---

### 🔴 **第三步：填寫表單**

你會見到一個表單，分幾個部分：

#### 部分 1️⃣：Policy 名稱

```
┌──────────────────────────────────┐
│ Policy name                      │
│ A descriptive name for your ...  │
│                                  │
│ [________________] 0/50          │
│  輸入：Allow all upload           │
│                                  │
└──────────────────────────────────┘
```

**輸入：`Allow all upload`**

---

#### 部分 2️⃣：允許嘅操作

```
┌──────────────────────────────────┐
│ Allowed operation                │
│ Based on the operations you      │
│ have selected...                 │
│                                  │
│ ☑ SELECT    ☑ INSERT            │
│ ☐ UPDATE    ☐ DELETE            │
│                                  │
│ (顯示可用函數：upload, download,│
│  list, update, move, copy,      │
│  remove, createSignedUrl, etc.) │
└──────────────────────────────────┘
```

確保：
- ✅ **SELECT** - 勾選 ☑
- ✅ **INSERT** - 勾選 ☑
- ❌ **UPDATE** - 唔勾選 ☐
- ❌ **DELETE** - 唔勾選 ☐

---

#### 部分 3️⃣：目標角色

```
┌──────────────────────────────────┐
│ Target roles                     │
│ Apply policy to the selected ... │
│                                  │
│ ▼ Defaults to all (public)       │
│   roles if none selected         │
│                                  │
└──────────────────────────────────┘
```

**唔需要改！保持預設。**

---

#### 部分 4️⃣：Policy 定義（最重要！）

```
┌──────────────────────────────────┐
│ Policy definition                │
│ Provide a SQL conditional        │
│ expression that returns a        │
│ boolean.                         │
│                                  │
│ 1 │ true                         │  ← 就係咁！
│   │                              │
│   │                              │
│   │                              │
│   │                              │
│                                  │
└──────────────────────────────────┘
```

**把現有內容刪掉，只留：`true`**

---

### 🟡 **第四步：檢查配置**

確保所有欄位睇起來係咁樣：

| 欄位 | 應該係 |
|------|--------|
| Policy name | `Allow all upload` ✅ |
| SELECT | ☑️ 勾選 ✅ |
| INSERT | ☑️ 勾選 ✅ |
| UPDATE | ☐ 未勾選 ✅ |
| DELETE | ☐ 未勾選 ✅ |
| Target roles | Defaults to all (public) ✅ |
| Policy definition | `true` ✅ |

---

### ⚪ **第五步：保存**

```
見到畫面底部應該有：

┌──────────────────────────────────┐
│  [Save policy]  [Cancel]         │
└──────────────────────────────────┘
```

**點「Save policy」**

---

### ✨ **完成！**

應該會見到成功訊息：

```
✓ Policy successfully created!

documents
├── ✓ Allow all upload (INSERT, SELECT)
```

---

## 🧪 **驗證 Policy 運作**

### 檢查清單

- [ ] Supabase Dashboard → Storage → documents
- [ ] Policies 分頁出現嘅新 policy
- [ ] 顯示「INSERT, SELECT」操作
- [ ] Policy 狀態：✓ Active

如果都係 ✅，就成功咗！

---

## ❌ **如果出錯了...**

### 問題 1：Policy 顯示 ❌ 但唔知點解

**解決**：
1. 刪除呢個 policy（點 ... 選 Delete）
2. 重新建立，確保：
   - 名稱唔係空
   - Policy definition 係 `true`
   - 起碼有一個操作勾選

### 問題 2：上傳檔案仍然失敗

**唔需要驚！** 應用有 `SERVICE_ROLE_KEY`（後端超級密鑰），應該可以繞過 Policy。

檢查：
```
.env.local 中係否有：
✅ SUPABASE_SERVICE_ROLE_KEY=...
✅ NEXT_PUBLIC_SUPABASE_URL=...
```

### 問題 3：Policy definition 唔知點填

**最簡單嘅方案**：
```sql
true
```

就係咁。`true` 表示允許所有請求。

**其他選項**（進階）：
```sql
-- 只允許 documents bucket
bucket_id = 'documents'

-- 只允許上傳到特定資料夾
bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
```

但初期用 `true` 就得！

---

## 📋 **Policy 中英對照**

| 英文 | 中文 | 意思 |
|------|------|------|
| Policy name | 政策名稱 | 用途：辨別唔同 policies |
| SELECT | 選取/讀取 | 允許讀取（下載）檔案 |
| INSERT | 插入/上傳 | **允許上傳**（最重要） |
| UPDATE | 更新 | 允許修改檔案 |
| DELETE | 刪除 | 允許刪除檔案 |
| Target roles | 目標角色 | 誰可以執行呢個操作 |
| Public | 公開 | 所有人都可以 |
| Authenticated | 已認證 | 只有登錄用戶 |
| Policy definition | 政策條件 | 決定操作係否允許嘅 SQL 條件 |

---

## 🎬 **總結**

### ⚡ 最快方法（1 分鐘）
```
1. Storage → documents → Policies
2. + New Policy
3. Select「upload access」
4. 填 Name: Allow all upload
5. ☑ SELECT + ☑ INSERT
6. Policy definition: true
7. Save
✅ Done!
```

### 驗證方法（30 秒）
```
1. 去首頁試上傳一個檔案
2. 如果成功 → Policy 設置正確 ✅
3. 檢查 Supabase Storage 有冇檔案
4. Done!
```

### 如果仲係唔行到
```
唔使擔心！應用有 SERVICE_ROLE_KEY
應該都可以上傳
直接試試開發伺服器
npm run dev
去首頁試試上傳
```

---

## 📞 **快速幫助**

| 問題 | 答案 |
|------|------|
| **Policy definition 填咩？** | `true` |
| **要唔要勾 UPDATE/DELETE？** | 唔需要，只要 SELECT + INSERT |
| **Policy name 好重要嗎？** | 唔重要，任何名都得，只係用來分辨 |
| **唔做 Policy 得唔得？** | 得！應該都可以用 |
| **Policy 錯咗會點樣？** | 上傳失敗，檢查 .env.local 同 SERVICE_ROLE_KEY |

---

**就係咁簡單！** 

有任何問題隨時問我 😊
