import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/app/lib/supabase';
import { summarizeWithGitHubModel } from '@/app/lib/github-model-api';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/regenerate
 * 根據用戶嘅自訂提示重新生成摘要
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { summaryId, customPrompt, tone, maxLength } = body;

    if (!summaryId) {
      return NextResponse.json(
        { error: 'summaryId 必須提供' },
        { status: 400 }
      );
    }

    if (!customPrompt && !tone) {
      return NextResponse.json(
        { error: '必須提供 customPrompt 或 tone' },
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

    // 1. 獲取現有嘅 summary 記錄
    const { data: summary, error: summaryError } = await supabase
      .from('summaries')
      .select('*')
      .eq('id', summaryId)
      .eq('user_id', user.id) // 🔐 檢查權限
      .single();

    if (summaryError || !summary) {
      return NextResponse.json(
        { error: '摘要未搵著' },
        { status: 404 }
      );
    }

    // 2. 重新生成摘要
    console.log('🔄 重新生成摘要啦...');
    try {
      const result = await summarizeWithGitHubModel({
        text: summary.original_text,
        customPrompt,
        tone: tone || 'professional',
        maxLength: maxLength || 300,
      });

      // 3. 更新 summary 記錄
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
        console.error('更新摘要失敗:', updateError);
        return NextResponse.json(
          { error: '摘要更新失敗' },
          { status: 500 }
        );
      }

      console.log('✅ 摘要重新生成成功啦');

      return NextResponse.json({
        success: true,
        summary: updatedSummary,
        provider: result.provider,
      });
    } catch (aiError) {
      console.error('❌ 重新生成摘要失敗:', aiError);
      return NextResponse.json(
        { error: '摘要生成失敗。請重試。' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('重新生成 API 錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}
