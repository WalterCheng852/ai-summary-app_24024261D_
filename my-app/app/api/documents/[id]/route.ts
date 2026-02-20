import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/app/lib/supabase';

/**
 * GET /api/documents/[id]
 * 获取单个 document 及其 summary
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase();
    const documentId = params.id;

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
        { error: '文件未找到' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('获取 document 失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id]
 * 删除 document 和相关的 summary
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase();
    const documentId = params.id;

    // 删除 document（summaries 会因为外键级联删除而自动删除）
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      console.error('删除 document 失败:', deleteError);
      return NextResponse.json(
        { error: '删除失败' },
        { status: 500 }
      );
    }

    console.log('✅ Document 已删除:', documentId);

    return NextResponse.json({
      success: true,
      message: '文件已删除',
    });
  } catch (error) {
    console.error('删除 API 错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
