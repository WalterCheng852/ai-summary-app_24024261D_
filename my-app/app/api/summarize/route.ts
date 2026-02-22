import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/app/lib/supabase';
import { summarizeWithGitHubModel, SummarizeRequest } from '@/app/lib/github-model-api';
import { validateRawText } from '@/app/lib/validation';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/summarize
 * 生成檔案摘要（或重新生成）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, customPrompt, tone, maxLength } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId 必須提供' },
        { status: 400 }
      );
    }

    // 🔐 從 Authorization header 取得 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '需要登入先至可以生成摘要' },
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

    // 1. 獲取 document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id) // 🔐 檢查是否屬於當前用戶
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: '檔案未搵著' },
        { status: 404 }
      );
    }

    // 2. 驗證文字
    const textError = validateRawText(document.raw_text);
    if (textError) {
      return NextResponse.json(
        { error: textError.message },
        { status: 400 }
      );
    }

    // 3. 調用 AI API 生成摘要
    console.log('🤖 開始生成摘要...');
    const summarizeRequest: SummarizeRequest = {
      text: document.raw_text,
      customPrompt,
      tone: tone || 'professional',
      maxLength: maxLength || 300,
    };

    let generatedSummary: string;
    let provider: string;

    try {
      const result = await summarizeWithGitHubModel(summarizeRequest);
      generatedSummary = result.summary;
      provider = result.provider;
      console.log(`✅ 摘要生成成功 (${provider})`);
    } catch (aiError) {
      console.error('❌ AI 摘要生成失敗:', aiError);
      return NextResponse.json(
        { error: '摘要生成失敗。請檢查 API 密鑰配置。' },
        { status: 500 }
      );
    }

    // 4. 儲存或更新 summary 記錄
    const { data: existingSummary } = await supabase
      .from('summaries')
      .select('id, regeneration_count')
      .eq('document_id', documentId)
      .single();

    let summaryData;
    if (existingSummary) {
      // 更新現有記錄
      const { data, error } = await supabase
        .from('summaries')
        .update({
          generated_summary: generatedSummary,
          regeneration_count: (existingSummary.regeneration_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSummary.id)
        .select()
        .single();

      if (error) {
        console.error('更新摘要失敗:', error);
        return NextResponse.json(
          { error: '摘要儲存失敗' },
          { status: 500 }
        );
      }
      summaryData = data;
    } else {
      // 建立新記錄
      const { data, error } = await supabase
        .from('summaries')
        .insert({
          document_id: documentId,
          user_id: user.id, // 🔐 儲存用戶 ID
          original_text: document.raw_text,
          generated_summary: generatedSummary,
          regeneration_count: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('建立摘要失敗:', error);
        return NextResponse.json(
          { error: '摘要儲存失敗' },
          { status: 500 }
        );
      }
      summaryData = data;
    }

    return NextResponse.json({
      success: true,
      summary: summaryData,
      provider,
    });
  } catch (error) {
    console.error('摘要 API 錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}
