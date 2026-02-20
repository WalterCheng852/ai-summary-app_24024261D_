import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/app/lib/supabase';
import { summarizeWithGitHubModel, SummarizeRequest } from '@/app/lib/github-model-api';
import { validateRawText } from '@/app/lib/validation';

/**
 * POST /api/summarize
 * 生成文件摘要（或重新生成）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, customPrompt, tone, maxLength } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId 必须提供' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // 1. 获取 document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: '文件未找到' },
        { status: 404 }
      );
    }

    // 2. 验证文本
    const textError = validateRawText(document.raw_text);
    if (textError) {
      return NextResponse.json(
        { error: textError.message },
        { status: 400 }
      );
    }

    // 3. 调用 AI API 生成摘要
    console.log('🤖 开始生成摘要...');
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
      console.error('❌ AI 摘要生成失败:', aiError);
      return NextResponse.json(
        { error: '摘要生成失败。请检查 API 密钥配置。' },
        { status: 500 }
      );
    }

    // 4. 保存或更新 summary 记录
    const { data: existingSummary } = await supabase
      .from('summaries')
      .select('id, regeneration_count')
      .eq('document_id', documentId)
      .single();

    let summaryData;
    if (existingSummary) {
      // 更新现有记录
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
        console.error('更新摘要失败:', error);
        return NextResponse.json(
          { error: '摘要保存失败' },
          { status: 500 }
        );
      }
      summaryData = data;
    } else {
      // 创建新记录
      const { data, error } = await supabase
        .from('summaries')
        .insert({
          document_id: documentId,
          original_text: document.raw_text,
          generated_summary: generatedSummary,
          regeneration_count: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('创建摘要失败:', error);
        return NextResponse.json(
          { error: '摘要保存失败' },
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
    console.error('摘要 API 错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
