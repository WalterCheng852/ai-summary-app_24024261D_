import { useState, useEffect } from 'react';

export interface PromptSettings {
  summarizePrompt: string;
  rephraseSimplify: string;
  rephraseProfessional: string;
  rephraseCasual: string;
}

export const DEFAULT_PROMPTS: PromptSettings = {
  summarizePrompt: '將以下文本總結成簡潔嘅要點，保留重要信息：',
  rephraseSimplify: '用更簡單嘅語言重寫',
  rephraseProfessional: '用更專業並正式嘅語氣重寫',
  rephraseCasual: '用更友善同隨意嘅語氣重寫',
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
