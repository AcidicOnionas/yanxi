import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get all documents from the database
    const { data: documents, error: fetchError } = await supabase
      .from('documents')
      .select('*');
      
    if (fetchError) {
      return NextResponse.json({ 
        success: false, 
        error: fetchError.message 
      }, { status: 500 });
    }
    
    if (!documents || documents.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No documents found to update' 
      });
    }
    
    // Track success and failures
    const results = {
      total: documents.length,
      success: 0,
      failed: 0,
      errors: [] as string[]
    };
    
    // Update each document with a fresh signed URL
    for (const doc of documents) {
      try {
        // Generate a new signed URL (valid for 7 days)
        const { data: urlData, error: urlError } = await supabase.storage
          .from('documents')
          .createSignedUrl(doc.file_path, 60 * 60 * 24 * 7);
          
        if (urlError) {
          results.failed++;
          results.errors.push(`Error for ${doc.file_name}: ${urlError.message}`);
          continue;
        }
        
        // Update the document record with the new URL
        const { error: updateError } = await supabase
          .from('documents')
          .update({ url: urlData.signedUrl })
          .eq('id', doc.id);
          
        if (updateError) {
          results.failed++;
          results.errors.push(`Error updating ${doc.file_name}: ${updateError.message}`);
          continue;
        }
        
        results.success++;
      } catch (e: any) {
        results.failed++;
        results.errors.push(`Exception for ${doc.file_name}: ${e.message}`);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Updated ${results.success} of ${results.total} document URLs`,
      results 
    });
  } catch (error: any) {
    console.error('Error refreshing document URLs:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 