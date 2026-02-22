import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    // 1. 檢查文檔權限
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, user_id')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: '文檔未搵著或冇權限訪問' },
        { status: 404 }
      );
    }

    // 2. 更新 summary 嘅 edited_summary
    const { data: updatedSummary, error: updateError } = await supabase
      .from('summaries')
      .update({
        edited_summary: editedSummary,
        updated_at: new Date().toISOString(),
      })
      .eq('id', summaryId)
      .eq('document_id', documentId)
      .eq('user_id', user.id)  // 🔐 確保用戶只能編輯自己嘅摘要
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
