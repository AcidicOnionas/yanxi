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
    const userEmail = session.user.email;
    console.log(`Processing deletion for user: ${userId} (${userEmail})`);

    // 1. Get documents for this user
    console.log('Fetching user documents...');
    const { data: documents, error: fetchError } = await supabase
      .from('documents')
      .select('id, file_path')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('Error fetching documents:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    console.log(`Found ${documents?.length || 0} documents to delete`);

    // 2. Delete files from storage one by one to handle permissions properly
    if (documents && documents.length > 0) {
      console.log('Deleting files from storage...');
      
      for (const doc of documents) {
        try {
          console.log(`Deleting file: ${doc.file_path}`);
          const { error: storageError } = await supabase.storage
            .from('documents')
            .remove([doc.file_path]);
  
          if (storageError) {
            console.error(`Error deleting file ${doc.file_path}:`, storageError);
            // Continue with other files even if one fails
          }
        } catch (e) {
          console.error(`Exception deleting file ${doc.file_path}:`, e);
          // Continue with other files
        }
      }
    }

    // 3. Delete document records one by one
    if (documents && documents.length > 0) {
      console.log('Deleting document records...');
      
      for (const doc of documents) {
        try {
          console.log(`Deleting document record: ${doc.id}`);
          const { error: docDeleteError } = await supabase
            .from('documents')
            .delete()
            .eq('id', doc.id)
            .eq('user_id', userId); // Ensure RLS policy compliance
  
          if (docDeleteError) {
            console.error(`Error deleting document record ${doc.id}:`, docDeleteError);
            // Continue with other documents even if one fails
          }
        } catch (e) {
          console.error(`Exception deleting document record ${doc.id}:`, e);
          // Continue with other documents
        }
      }
    }

    // 4. Mark the user account for deletion and scramble their data
    console.log('Scrambling user account data...');
    const randomString = Math.random().toString(36).substring(2, 15);
    const deletedEmail = `deleted-${randomString}@deleted.account`;
    
    // Update user with deleted flag and scrambled data
    const { error: updateError } = await supabase.auth.updateUser({
      email: deletedEmail,
      password: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      data: { 
        deleted: true,
        delete_requested_at: new Date().toISOString(),
        original_email: userEmail // Store the original email
      }
    });
    
    if (updateError) {
      console.error('Error marking user as deleted:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 5. End all sessions for this user
    console.log('Signing out user from all sessions...');
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' });
    
    if (signOutError) {
      console.error('Error signing out user from all devices:', signOutError);
      // This is not critical, so we'll just log it and continue
    }

    // Return success
    console.log('Account deletion completed successfully');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unexpected error in account deletion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 