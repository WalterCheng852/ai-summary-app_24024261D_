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

## 步驟 3️⃣：配置 Bucket 權限

1. 搵到 `documents` bucket
2. 點「Policies」分頁
3. 點「New Policy」
4. 選擇「For individual insert access」
5. 配置如下：
   - **Path Expression**：`documents/{id}/*`
   - **Row Security**：Off（為咗簡單起見，生產環境要改）
6. 點擊「Create policy」

![image](https://via.placeholder.com/600x400?text=Set+Permissions)

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
