import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/app/lib/supabase';

/**
 * PUT /api/documents/[id]/summaries
 * 更新 summary 嘅 edited_summary 欄位
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const documentId = id;

    const body = await request.json();
    const { summaryId, editedSummary } = body;

    if (!summaryId || !editedSummary) {
      return NextResponse.json(
        { error: '缺少必要欄位：summaryId 或 editedSummary' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // 更新 summary 嘅 edited_summary
    const { data: updatedSummary, error: updateError } = await supabase
      .from('summaries')
      .update({
        edited_summary: editedSummary,
        updated_at: new Date().toISOString(),
      })
      .eq('id', summaryId)
      .eq('document_id', documentId)
      .select()
      .single();

    if (updateError || !updatedSummary) {
      console.error('更新 summary 失敗:', updateError);
      return NextResponse.json(
        { error: '更新失敗，可能係 summary 唔存在' },
        { status: 404 }
      );
    }

    console.log('✅ Summary 已更新:', summaryId);

    return NextResponse.json({
      success: true,
      summary: updatedSummary,
      message: '摘要已保存',
    });
  } catch (error) {
    console.error('更新 summary API 錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}
