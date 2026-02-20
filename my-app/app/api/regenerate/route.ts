import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/app/lib/supabase';
import { summarizeWithGitHubModel } from '@/app/lib/github-model-api';

/**
 * POST /api/regenerate
 * 根据用户的自定义提示重新生成摘要
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { summaryId, customPrompt, tone, maxLength } = body;

    if (!summaryId) {
      return NextResponse.json(
        { error: 'summaryId 必须提供' },
        { status: 400 }
      );
    }

    if (!customPrompt && !tone) {
      return NextResponse.json(
        { error: '必须提供 customPrompt 或 tone' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // 1. 获取现有的 summary 记录
    const { data: summary, error: summaryError } = await supabase
      .from('summaries')
      .select('*')
      .eq('id', summaryId)
      .single();

    if (summaryError || !summary) {
      return NextResponse.json(
        { error: '摘要未找到' },
        { status: 404 }
      );
    }

    // 2. 重新生成摘要
    console.log('🔄 重新生成摘要...');
    try {
      const result = await summarizeWithGitHubModel({
        text: summary.original_text,
        customPrompt,
        tone: tone || 'professional',
        maxLength: maxLength || 300,
      });

      // 3. 更新 summary 记录
      const { data: updatedSummary, error: updateError } = await supabase
        .from('summaries')
        .update({
          generated_summary: result.summary,
          regeneration_count: (summary.regeneration_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', summaryId)
        .select()
        .single();

      if (updateError) {
        console.error('更新摘要失败:', updateError);
        return NextResponse.json(
          { error: '摘要更新失败' },
          { status: 500 }
        );
      }

      console.log('✅ 摘要重新生成成功');

      return NextResponse.json({
        success: true,
        summary: updatedSummary,
        provider: result.provider,
      });
    } catch (aiError) {
      console.error('❌ 重新生成摘要失败:', aiError);
      return NextResponse.json(
        { error: '摘要生成失败。请重试。' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('重新生成 API 错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
