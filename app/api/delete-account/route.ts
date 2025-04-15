import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    // Get the session from the request
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user ID from the session
    const userId = session.user.id;

    // Delete all user's documents first
    // 1. Get documents
    const { data: documents, error: fetchError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('Error fetching documents:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // 2. Delete files from storage
    if (documents && documents.length > 0) {
      const filePaths = documents.map(doc => doc.file_path);
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove(filePaths);

      if (storageError) {
        console.error('Error deleting files from storage:', storageError);
        return NextResponse.json({ error: storageError.message }, { status: 500 });
      }
    }

    // 3. Delete document records
    const { error: docDeleteError } = await supabase
      .from('documents')
      .delete()
      .eq('user_id', userId);

    if (docDeleteError) {
      console.error('Error deleting document records:', docDeleteError);
      return NextResponse.json({ error: docDeleteError.message }, { status: 500 });
    }

    // 4. Mark the user account for deletion and scramble their data
    // We'll generate a random string to replace the email
    const randomString = Math.random().toString(36).substring(2, 15);
    const deletedEmail = `deleted-${randomString}@deleted.account`;
    
    // Update user with deleted flag and scrambled data
    const { error: updateError } = await supabase.auth.updateUser({
      email: deletedEmail,
      password: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      data: { 
        deleted: true,
        delete_requested_at: new Date().toISOString(),
        original_email_hash: session.user.email // Store a hash of the original email to prevent re-registration
      }
    });
    
    if (updateError) {
      console.error('Error marking user as deleted:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 5. End all sessions for this user
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' });
    
    if (signOutError) {
      console.error('Error signing out user from all devices:', signOutError);
      // This is not critical, so we'll just log it and continue
    }

    // Return success
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unexpected error in account deletion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 