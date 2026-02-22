# Supabase Object Storage 設置指南

## 步驟 1️⃣：登錄 Supabase 控制台

1. 訪問 https://supabase.com/dashboard
2. 使用你既帳戶登錄
3. 選擇你嘅專案（`ai-summary-app_24024261D_`）

## 步驟 2️⃣：建立 Storage Bucket

1. 在左側菜單，搵「Storage」
2. 點擊「Create a new bucket」
3. **Bucket 名稱**：`documents`
4. **Public/Private**：選擇「Private」（安全）
5. 點擊「Create bucket」

![image](https://via.placeholder.com/600x400?text=Create+Bucket)

## 步驟 3️⃣：配置 Bucket 權限（詳細步驟）

### 選項 A：簡單方法（推薦新手）

**如果你想簡單啲，可以跳過 Policy 配置！**

因為：
- 我哋嘅應用用 `SUPABASE_SERVICE_ROLE_KEY`（後端密鑰）來上傳
- 呢個密鑰本身就有所有權限
- 所以唔一定需要複雜嘅 Policy

✅ **你可以直接開始用應用，應該可以正常上傳！**

---

### 選項 B：完整 Policy 設置（生產環境推薦）

如果你想設置 Policy（更安全），跟著呢啲步驟：

#### 步驟 1：打開 New Policy

1. 去 Supabase Dashboard
2. Storage → 搵 `documents` bucket
3. 點「Policies」分頁
4. 點「New Policy」或「+ Create a new policy」

#### 步驟 2：選擇 Policy 模板

你會見到幾個選項：
- ✅ **「For individual upload access」** ← **選擇呢個！**
- 「For individual insert access」
- 「For individual delete access」
- 「Custom policy」

點選「For individual upload access」

#### 步驟 3：填寫 Policy 名稱

| 欄位 | 输入 | 說明 |
|------|------|------|
| **Policy name** | `Allow all upload` | 簡單易記嘅名稱 |

#### 步驟 4：選擇允許嘅操作

勾選：
- ☑️ **INSERT** ← 允許上傳新檔案
- ☑️ **SELECT** ← 允許読取（下載）

⬜ **不要勾選** UPDATE 同 DELETE（除非你要允許刪除）

#### 步驟 5：設置目標角色 (Target roles)

| 設置 | 值 | 說明 |
|------|-----|------|
| **Target roles** | `Defaults to all (public) roles if none selected` | 保持預設 = 所有人都可以上傳 |

不需要改，保持預設即可。

#### 步驟 6：設置 Policy 條件

呢個係最重要嘅部分！在「Policy definition」欄位，**刪除現有內容**，輸入：

```sql
true
```

就係咁簡單！`true` 表示允許所有請求。

**完整配置後應該睇起來係咁樣：**
```
Policy name: Allow all upload
Allowed operations: [✓ INSERT] [✓ SELECT] [ UPDATE] [ DELETE]
Target roles: (defaults to public)
Policy definition: true
```

#### 步驟 7：儲存 Policy

點「Save policy」或「Create policy」

✅ 應該會顯示成功訊息

---

### ⚙️ 詳細解釋

| 欄位 | 中文 | 例子 | 說明 |
|------|------|------|------|
| **SELECT** | 讀取 | 下載檔案 | 允許用戶從 bucket 讀取檔案 |
| **INSERT** | 上傳 | 上傳新檔案 | **最重要** - 允許上傳 |
| **UPDATE** | 更新 | 修改檔案 | 通常唔需要 |
| **DELETE** | 刪除 | 刪除檔案 | 通常唔需要 |
| **Policy definition** | 條件式 | `true` 或 `bucket_id = 'documents'` | 決定誰可以執行操作 |

#### Policy Definition 解釋

- `true` = **允許所有人**（開放 ⚠️）
- `auth.uid() = user_id` = **只允許自己嘅檔案**（安全 ✅）
- `bucket_id = 'documents'` = **只限呢個 bucket**（中等安全）

**對於開發，用 `true` 就得，簡單同快速！**

---

### 🖼️ 圖片參考

你看到嘅 Supabase Policy 編輯器應該係咁樣：

```
┌─────────────────────────────────────┐
│ Adding new policy to documents      │
├─────────────────────────────────────┤
│                                     │
│ Policy name                         │
│ [Allow all upload____________]      │
│                                     │
│ Allowed operation                   │
│ ☑ SELECT  ☑ INSERT  ☐ UPDATE       │
│ ☐ DELETE                            │
│                                     │
│ Target roles                        │
│ [Defaults to all (public)...]      │
│                                     │
│ Policy definition                   │
│ [true___________________________]   │
│                                     │
│ [Save policy]  [Cancel]             │
└─────────────────────────────────────┘
```

填完以上資料，點「Save policy」就得！

---

### ✅ 驗證 Policy 已建立

建立完後：
1. 返回「Policies」分頁
2. 應該會聞到新嘅 policy：「Allow all upload」
3. 顯示允許嘅操作：INSERT, SELECT
4. 就算完成咗！

---

## ⚠️ 如果你仲係搞唔掂...

**唔使擔心！** 只要有環境變數，應用應該可以正常運作：
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- ✅ `SUPABASE_SERVICE_ROLE_KEY` ← 呢個最重要！

因為我哋嘅後端用 `SERVICE_ROLE_KEY`（有超級權限），唔完全依賴 Policy。

**所以：先試試上傳，如果成功咗就唔需要改 Policy！**

## 步驟 4️⃣：測試 Bucket

```typescript
// 測試上傳
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

const { data, error } = await supabase.storage
  .from('documents')
  .upload('test.txt', file);
```

## ✅ 完成！

你嘅 bucket 而家可以用咗。應用程式會自動上傳檔案到呢個 bucket。

---

## 🔒 **安全建議（生產環境）**

1. **使用 RLS（Row Level Security）**：限制只有登錄用戶可以上傳
2. **驗證檔案類型**：確保只接受安全嘅檔案格式
3. **檔案大小限制**：設定上傳大小限制（例如 50MB）
4. **掃毒**：集成檔案掃毒服務
5. **過期期限**：定期刪除舊檔案

---

## 📝 **環境變數（已配置）**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xqyhxqlcnckvjuspuweb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```
