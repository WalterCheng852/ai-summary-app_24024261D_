import { useState, useEffect } from 'react';

export interface PromptSettings {
  summarizePrompt: string;
  rephraseSimplify: string;
  rephraseProfessional: string;
  rephraseCasual: string;
}

export const DEFAULT_PROMPTS: PromptSettings = {
  summarizePrompt: `請將下列文本精確地總結成簡潔嘅要點。你應該：
1. 識別並提取最重要嘅核心信息同主要論點
2. 保留所有關鍵細節同數據（如日期、數字、重要人名或地名）
3. 刪除重複信息、冗長描述同不必要嘅背景資料
4. 使用清晰嘅項目符號 (- ) 或段落組織內容，確保邏輯流暢
5. 維持原文嘅事實準確性，唔好添加個人觀點或解釋
6. 用簡潔精煉嘅語言，避免冗贅嘅字句
7. 如果有多個要點，按重要性排列，最重要嘅排前面
8. 確保摘要可以獨立理解，唔洗去返回原文就明白大意

請直接輸出摘要內容，唔洗加「摘要：」呢類標籤。`,

  rephraseSimplify: `請用簡單易明嘅喼語重寫呢段文字。具體要求：
1. 用常用詞彙替換複雜或專業術語，確保一般人都能理解
2. 將長句子拆成短句，每句只含一個主要想法
3. 用簡單嘅字結構，避免複雜嘅文法同冗長嘅短語
4. 解釋所有可能唔明嘅概念或專業用語
5. 用具體例子或日常類比幫助理解
6. 刪除所有不必要嘅修飾詞同冗長嘅表達
7. 保持原文嘅核心意思同事實準確，唔好改變主要信息
8. 用友善、直接嘅語氣，好似同朋友傾偈咁
9. 確保簡化後嘅文字比原文短 20-30%，但意思完整

請直接輸出重寫後嘅文字，唔洗解釋過程。`,

  rephraseProfessional: `請用正式、專業嘅商業或學術語氣重寫呢段文字。具體要求：
1. 採用正式嘅用詞同表達方式，避免俚語或口語詞彙
2. 使用準確嘅行業術語或專業用語，提升內容嘅專業性
3. 組織句子嘅邏輯，確保論點清晰、論述嚴謹
4. 用被動語態或客觀敘述提升正式感，但唔好過度
5. 消除個人化嘅表達，改用中立、客觀嘅觀點
6. 確保語法完美，標點準確
7. 適當加入轉接詞（然而、因此、進一步、此外等）以提升連貫性
8. 保留所有關鍵信息同細節，唔好簡化或遺漏重點
9. 適合用於正式報告、商業提案或學術論文
10. 長度可以適當增加（10-20%），以容納更多專業表達

請直接輸出重寫後嘅文字，唔洗加額外說明。`,

  rephraseCasual: `請用友善、隨意、好似同朋友傾偈嘅語氣重寫呢段文字。具體要求：
1. 使用日常用語同口語詞彙，製造親切感
2. 加入俚語、感歎詞或粵語特色詞彙（啦、呀、呢個、嗰個等）增加親近感
3. 用第一人稱或直接對話嘅方式，好似同讀者傾緊天
4. 可以用短句同簡單句式，展示自然嘅說話節奏
5. 加入適當嘅表情詞或語氣詞（係呀、冇問題、抵得、靚得滾等）
6. 可以用反問句或修辭疑問提升互動感
7. 簡化複雜概念，用日常例子或比喻幫助理解
8. 保持輕鬆、正面嘅語氣，避免冗長或沉悶
9. 可以適當加入一啲幽默感或個人觀點，但唔好改變核心事實
10. 適合用於社交媒體、部落格或非正式溝通

請直接輸出重寫後嘅文字，唔洗額外評論。`,
};

export function usePromptSettings() {
  const [settings, setSettings] = useState<PromptSettings>(DEFAULT_PROMPTS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('aiSummarySettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  return { settings, isLoaded };
}
