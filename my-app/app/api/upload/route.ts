import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/app/lib/supabase';
import { validateFile, getFileTypeFromExtension, validateRawText } from '@/app/lib/validation';
import { extractTextFromBase64PDF } from '@/app/lib/pdf-parser';

/**
 * POST /api/upload
 * 上传文件到 Supabase，提取文本，存储到数据库
 * 支持两种方式：
 * 1. FormData 上传文件
 * 2. JSON 提交原始文本
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const supabase = createServerSupabase();

    let filename: string;
    let fileType: 'pdf' | 'txt' | 'md' | 'raw_text';
    let rawText: string;

    // 处理 JSON 请求（直接文本提交）
    if (contentType.includes('application/json')) {
      const body = await request.json();
      filename = body.filename || `text_${Date.now()}`;
      fileType = body.file_type || 'raw_text';
      rawText = body.raw_text || '';

      // 验证原始文本
      const textError = validateRawText(rawText);
      if (textError) {
        return NextResponse.json(
          { error: textError.message },
          { status: 400 }
        );
      }
    } 
    // 处理 FormData 请求（文件上传）
    else {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json(
          { error: '没有上传文件' },
          { status: 400 }
        );
      }

      // 验证文件
      const validationError = validateFile(file);
      if (validationError) {
        return NextResponse.json(
          { error: validationError.message },
          { status: 400 }
        );
      }

      filename = file.name;
      fileType = getFileTypeFromExtension(filename) as 'pdf' | 'txt' | 'md' | 'raw_text';

      // 提取文本
      if (fileType === 'pdf') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          rawText = await extractTextFromBase64PDF(base64);
        } catch (error) {
          console.error('PDF 提取失败:', error);
          return NextResponse.json(
            { error: '无法提取 PDF 文本。文件可能已损坏或是扫描图像。' },
            { status: 400 }
          );
        }
      } else if (fileType === 'txt' || fileType === 'md') {
        rawText = await file.text();
      } else {
        return NextResponse.json(
          { error: '不支持此文件类型' },
          { status: 400 }
        );
      }

      if (!rawText.trim()) {
        return NextResponse.json(
          { error: '文件中没有可读取的文本内容' },
          { status: 400 }
        );
      }
    }

    // 保存到 documents 表
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
      console.error('数据库插入失败:', docError);
      return NextResponse.json(
        { error: `保存失败: ${docError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ 文件上传成功:', docData.id);

    return NextResponse.json({
      success: true,
      document: docData,
      textPreview: rawText.substring(0, 200) + (rawText.length > 200 ? '...' : ''),
    });
  } catch (error) {
    console.error('上传 API 错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
