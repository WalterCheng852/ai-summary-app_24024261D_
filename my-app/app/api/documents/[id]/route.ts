import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/app/lib/supabase';

/**
 * GET /api/documents/[id]
 * 獲取單個 document 及其 summary
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerSupabase();
    const documentId = id;

    const { data: document, error: docError } = await supabase
      .from('documents')
      .select(
        `
        *,
        summaries (*)
      `
      )
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: '檔案未搵著' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('獲取 document 失敗:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id]
 * 刪除 document 和相關嘅 summary
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerSupabase();
    const documentId = id;

    // 刪除 document（summaries 會因為外鍵級聯刪除而自動刪除）
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      console.error('刪除 document 失敗:', deleteError);
      return NextResponse.json(
        { error: '刪除失敗' },
        { status: 500 }
      );
    }

    console.log('✅ Document 已刪除:', documentId);

    return NextResponse.json({
      success: true,
      message: '檔案已刪除',
    });
  } catch (error) {
    console.error('刪除 API 錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}
