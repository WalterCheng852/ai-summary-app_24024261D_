/**
 * GitHub Model API 集成
 * 優先級：GitHub Model API（免費）> OpenRouter（備用）
 */

export interface SummarizeRequest {
  text: string;
  customPrompt?: string;
  tone?: 'professional' | 'casual' | 'concise' | 'detailed';
  maxLength?: number;
}

export interface SummarizeResponse {
  summary: string;
  tokensUsed?: number;
  provider: 'github-models' | 'openrouter';
}

/**
 * 透過 GitHub Model API 生成摘要
 */
export async function summarizeWithGitHubModel(
  request: SummarizeRequest
): Promise<SummarizeResponse> {
  const apiKey = process.env.GITHUB_MODEL_API_KEY;
  if (!apiKey) {
    throw new Error('GITHUB_MODEL_API_KEY 未設置啦');
  }

  const systemPrompt = `你係一個專業嘅檔案摘要生成器。
- 提取關鍵信息，清晰簡潔
- 保留重要細節
- 用項目符號或段落組織內容
- 語言：${getLanguageForTone(request.tone || 'professional')}`;

  const userPrompt = request.customPrompt
    ? `請基於以下內容生成摘要，要求：${request.customPrompt}\n\n內容：\n${request.text}`
    : `請生成以下內容嘅摘要（最多 ${request.maxLength || 300} 字）：\n\n${request.text}`;

  try {
    console.log('📝 調用 GitHub Model API...');
    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        top_p: 1,
        max_tokens: request.maxLength ? Math.ceil(request.maxLength * 1.2) : 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('GitHub Model API 錯誤:', error);
      throw new Error(`GitHub Model API 返回 ${response.status}: ${error}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || '';

    if (!summary) {
      throw new Error('摘要生成失敗：API 返回空結果');
    }

    return {
      summary: summary.trim(),
      provider: 'github-models',
      tokensUsed: data.usage?.total_tokens,
    };
  } catch (error) {
    console.error('❌ GitHub Model API 失敗:', error);
    console.log('🔄 轉用 OpenRouter...');
    return summarizeWithOpenRouter(request);
  }
}

/**
 * 備用方案：透過 OpenRouter 生成摘要
 */
export async function summarizeWithOpenRouter(
  request: SummarizeRequest
): Promise<SummarizeResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('兩個 API 都未設置：GITHUB_MODEL_API_KEY 同 OPENROUTER_API_KEY');
  }

  const systemPrompt = `你係一個專業嘅檔案摘要生成器。
- 提取關鍵信息，清晰簡潔
- 保留重要細節
- 用項目符號或段落組織內容
- 語言：${getLanguageForTone(request.tone || 'professional')}`;

  const userPrompt = request.customPrompt
    ? `請基於以下內容生成摘要，要求：${request.customPrompt}\n\n內容：\n${request.text}`
    : `請生成以下內容嘅摘要（最多 ${request.maxLength || 300} 字）：\n\n${request.text}`;

  try {
    console.log('📝 調用 OpenRouter API...');
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: request.maxLength ? Math.ceil(request.maxLength * 1.2) : 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter 返回 ${response.status}: ${error}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || '';

    if (!summary) {
      throw new Error('摘要生成失敗：API 返回空結果');
    }

    return {
      summary: summary.trim(),
      provider: 'openrouter',
      tokensUsed: data.usage?.total_tokens,
    };
  } catch (error) {
    console.error('❌ OpenRouter 都失敗咗:', error);
    throw error;
  }
}

/**
 * 根據風格返回對應提示
 */
function getLanguageForTone(tone: string): string {
  const tones: Record<string, string> = {
    professional: '專業、正式、學術性強',
    casual: '友好、隨意、易讀',
    concise: '極簡、要點突出、高度概括',
    detailed: '詳細、全面、包含所有細節',
  };
  return tones[tone] || tones.professional;
}
