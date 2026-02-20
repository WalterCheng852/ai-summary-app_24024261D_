import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/app/lib/supabase';

/**
 * GET /api/documents
 * 获取所有 documents 和对应的 summaries
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase();

    // 获取所有 documents，按 created_at 降序排列（最新的在前）
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
      console.error('获取文件列表失败:', docError);
      return NextResponse.json(
        { error: '获取文件列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      documents: documents || [],
      count: documents?.length || 0,
    });
  } catch (error) {
    console.error('文件列表 API 错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
