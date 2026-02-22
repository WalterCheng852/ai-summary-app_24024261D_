import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/app/lib/supabase';
import { createClient } from '@supabase/supabase-js';

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
    
    // 從 Authorization header 取得 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '需要登入先至可以查看檔案' },
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
      .eq('user_id', user.id) // 只能查看自己嘅檔案
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
    
    // 從 Authorization header 取得 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '需要登入先至可以刪除檔案' },
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

    const documentId = id;

    // 驗證檔案屬於當前用戶
    const { data: document } = await supabase
      .from('documents')
      .select('user_id')
      .eq('id', documentId)
      .single();

    if (!document || document.user_id !== user.id) {
      return NextResponse.json(
        { error: '冇權限刪除呢個檔案' },
        { status: 403 }
      );
    }

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
