import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/app/lib/supabase';
import { validateFile, getFileTypeFromExtension, validateRawText } from '@/app/lib/validation';
import { extractTextFromBase64PDF } from '@/app/lib/pdf-parser';

/**
 * POST /api/upload
 * 上傳檔案到 Supabase，提取文字，儲存到資料庫
 * 支持兩種方式：
 * 1. FormData 上傳檔案
 * 2. JSON 提交原始文字
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // 檢查 Supabase 環境變數
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl?.includes('supabase.co') || !supabaseServiceRoleKey) {
      console.error('❌ Supabase 環境變數冇配置好');
      console.log('SUPABASE_URL:', supabaseUrl);
      console.log('SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '已設置' : '未設置');
      
      return NextResponse.json(
        { 
          error: 'Supabase 未配置。請去 .env.local 填入 SUPABASE_URL、SUPABASE_ANON_KEY 同 SUPABASE_SERVICE_ROLE_KEY',
          details: 'Environment variables missing'
        },
        { status: 500 }
      );
    }

    const supabase = createServerSupabase();

    let filename: string;
    let fileType: 'pdf' | 'txt' | 'md' | 'raw_text';
    let rawText: string;

    // 處理 JSON 請求（直接文字提交）
    if (contentType.includes('application/json')) {
      const body = await request.json();
      filename = body.filename || `文字_${Date.now()}`;
      fileType = body.file_type || 'raw_text';
      rawText = body.raw_text || '';

      // 驗證原始文字
      const textError = validateRawText(rawText);
      if (textError) {
        return NextResponse.json(
          { error: textError.message },
          { status: 400 }
        );
      }
    } 
    // 處理 FormData 請求（檔案上傳）
    else {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json(
          { error: '冇上傳檔案' },
          { status: 400 }
        );
      }

      // 驗證檔案
      const validationError = validateFile(file);
      if (validationError) {
        return NextResponse.json(
          { error: validationError.message },
          { status: 400 }
        );
      }

      filename = file.name;
      fileType = getFileTypeFromExtension(filename) as 'pdf' | 'txt' | 'md' | 'raw_text';

      // 提取文字
      if (fileType === 'pdf') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          rawText = await extractTextFromBase64PDF(base64);
        } catch (error) {
          console.error('PDF 提取失敗:', error);
          return NextResponse.json(
            { error: '無法提取 PDF 文字。檔案可能已損壞或係掃描影像。' },
            { status: 400 }
          );
        }
      } else if (fileType === 'txt' || fileType === 'md') {
        rawText = await file.text();
      } else {
        return NextResponse.json(
          { error: '唔支持呢種檔案類型' },
          { status: 400 }
        );
      }

      if (!rawText.trim()) {
        return NextResponse.json(
          { error: '檔案嗰度冇可讀嘅文字內容' },
          { status: 400 }
        );
      }
    }

    // 保存到 documents 表
    console.log('💾 儲存檔案到 Supabase:', { filename, fileType, textLength: rawText.length });

    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert({
        filename,
        file_url: null,
        file_type: fileType,
        raw_text: rawText,
      })
      .select()
      .single();

    if (docError) {
      console.error('❌ 數據庫插入失敗:', docError);
      return NextResponse.json(
        { 
          error: `儲存失敗: ${docError.message}`,
          details: docError
        },
        { status: 500 }
      );
    }

    console.log('✅ 檔案上傳成功:', docData.id);

    return NextResponse.json({
      success: true,
      document: docData,
      textPreview: rawText.substring(0, 200) + (rawText.length > 200 ? '...' : ''),
    });
  } catch (error) {
    console.error('❌ 上傳 API 錯誤:', error);
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    return NextResponse.json(
      { error: '伺服器錯誤: ' + errorMessage },
      { status: 500 }
    );
  }
}
