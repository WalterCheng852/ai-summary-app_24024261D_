import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/rephrase
 * 使用 AI 重寫選定的文本
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, prompt } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: '文本不能為空' },
        { status: 400 }
      );
    }

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: '提示（prompt）不能為空' },
        { status: 400 }
      );
    }

    // 🔐 從 Authorization header 取得 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '需要登入' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );

    // 驗證用戶
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '認證失敗' },
        { status: 401 }
      );
    }

    const apiKey = process.env.GITHUB_MODEL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 密鑰未配置' },
        { status: 503 }
      );
    }

    console.log('🎯 開始 AI 重寫...');

    const systemPrompt = `你係一個專業嘅文本編輯助手。
- 根據用戶嘅要求重寫文本
- 保留原意同信息
- 保持專業同自然嘅語氣
- 用繁體中文回應`;

    const userPrompt = `${prompt}\n\n要重寫嘅文本：\n${text}`;

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
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ AI API 錯誤:', error);
      return NextResponse.json(
        { error: `AI 重寫失敗: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rephrased = data.choices?.[0]?.message?.content || '';

    if (!rephrased) {
      return NextResponse.json(
        { error: '重寫失敗：API 返回空結果' },
        { status: 500 }
      );
    }

    console.log('✅ AI 重寫成功');

    return NextResponse.json({
      success: true,
      rephrased: rephrased.trim(),
      originalText: text,
    });
  } catch (error) {
    console.error('❌ 重寫 API 錯誤:', error);
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    return NextResponse.json(
      { error: '伺服器錯誤: ' + errorMessage },
      { status: 500 }
    );
  }
}
