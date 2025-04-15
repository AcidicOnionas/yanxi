import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json();
    
    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }
    
    // Try to download the file to check access
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(filePath);
      
    if (downloadError) {
      // Check if it's a permission issue
      if (downloadError.message.includes('Permission')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Permission denied. The current user cannot access this file.',
          details: downloadError
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        success: false, 
        error: downloadError.message,
        details: downloadError
      }, { status: 500 });
    }
    
    // Try to create a signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 60 * 60);
      
    if (signedUrlError) {
      return NextResponse.json({ 
        success: false, 
        error: 'File found but could not create signed URL',
        details: signedUrlError,
        downloadSuccess: true
      }, { status: 500 });
    }
    
    // Try to get public URL
    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
    
    return NextResponse.json({ 
      success: true, 
      message: 'File access test successful',
      fileSize: downloadData.size,
      fileType: downloadData.type,
      signedUrl: signedUrlData.signedUrl,
      publicUrl: publicUrlData.publicUrl,
    });
  } catch (error: any) {
    console.error('Error testing file access:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 