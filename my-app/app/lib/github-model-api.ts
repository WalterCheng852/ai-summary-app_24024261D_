/**
 * GitHub Model API 集成
 * 优先级：GitHub Model API（免费）> OpenRouter（备用）
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
 * 通过 GitHub Model API 生成摘要
 */
export async function summarizeWithGitHubModel(
  request: SummarizeRequest
): Promise<SummarizeResponse> {
  const apiKey = process.env.GITHUB_MODEL_API_KEY;
  if (!apiKey) {
    throw new Error('GITHUB_MODEL_API_KEY 未设置');
  }

  const systemPrompt = `你是一个专业的文件摘要生成器。
- 提取关键信息，清晰简洁
- 保留重要细节
- 用项目符号或段落组织内容
- 语言：${getLanguageForTone(request.tone || 'professional')}`;

  const userPrompt = request.customPrompt
    ? `请基于以下内容生成摘要，要求：${request.customPrompt}\n\n内容：\n${request.text}`
    : `请生成以下内容的摘要（最多 ${request.maxLength || 300} 字）：\n\n${request.text}`;

  try {
    console.log('📝 调用 GitHub Model API...');
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
      console.error('GitHub Model API 错误:', error);
      throw new Error(`GitHub Model API 返回 ${response.status}: ${error}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || '';

    if (!summary) {
      throw new Error('摘要生成失败：API 返回空结果');
    }

    return {
      summary: summary.trim(),
      provider: 'github-models',
      tokensUsed: data.usage?.total_tokens,
    };
  } catch (error) {
    console.error('❌ GitHub Model API 失败:', error);
    console.log('🔄 切换到 OpenRouter...');
    return summarizeWithOpenRouter(request);
  }
}

/**
 * 备用方案：通过 OpenRouter 生成摘要
 */
export async function summarizeWithOpenRouter(
  request: SummarizeRequest
): Promise<SummarizeResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('两个 API 都未设置：GITHUB_MODEL_API_KEY 和 OPENROUTER_API_KEY');
  }

  const systemPrompt = `你是一个专业的文件摘要生成器。
- 提取关键信息，清晰简洁
- 保留重要细节
- 用项目符号或段落组织内容
- 语言：${getLanguageForTone(request.tone || 'professional')}`;

  const userPrompt = request.customPrompt
    ? `请基于以下内容生成摘要，要求：${request.customPrompt}\n\n内容：\n${request.text}`
    : `请生成以下内容的摘要（最多 ${request.maxLength || 300} 字）：\n\n${request.text}`;

  try {
    console.log('📝 调用 OpenRouter API...');
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
      throw new Error('摘要生成失败：API 返回空结果');
    }

    return {
      summary: summary.trim(),
      provider: 'openrouter',
      tokensUsed: data.usage?.total_tokens,
    };
  } catch (error) {
    console.error('❌ OpenRouter 亦失败:', error);
    throw error;
  }
}

/**
 * 根据风格返回对应提示
 */
function getLanguageForTone(tone: string): string {
  const tones: Record<string, string> = {
    professional: '专业、正式、学术性强',
    casual: '友好、随意、易读',
    concise: '极简、要点突出、高度概括',
    detailed: '详细、全面、包含所有细节',
  };
  return tones[tone] || tones.professional;
}
