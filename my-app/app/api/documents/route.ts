import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, isSupabaseConfigured, getSupabaseConfigMessage } from '@/app/lib/supabase';

/**
 * GET /api/documents
 * 獲取所有 documents 和對應嘅 summaries
 */
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        documents: [],
        count: 0,
        warning: getSupabaseConfigMessage(),
      });
    }

    const supabase = createServerSupabase();

    // 獲取所有 documents，按 created_at 降序排列（最新喑在前）
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select(
        `
        id,
        filename,
        file_type,
        created_at,
        updated_at,
        summaries (
          id,
          generated_summary,
          edited_summary,
          regeneration_count
        )
      `
      )
      .order('created_at', { ascending: false });

    if (docError) {
      console.error('獲取檔案清單失敗:', docError);
      return NextResponse.json(
        { error: '獲取檔案清單失敗' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      documents: documents || [],
      count: documents?.length || 0,
    });
  } catch (error) {
    console.error('檔案清單 API 錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}
