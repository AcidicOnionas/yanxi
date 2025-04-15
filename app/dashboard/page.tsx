"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

// Define a type for the debug info
interface DebugInfo {
  hasSession?: boolean;
  hasUser?: boolean;
  userId?: string;
  userEmail?: string;
  role?: string | null;
  documentsFound?: number;
  [key: string]: any; // Allow additional properties
}

export default function Dashboard() {
  const router = useRouter();
  const { user, role, session, deleteAccount } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug data
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});

  // Check if we have a valid session and user
  useEffect(() => {
    if (!session) {
      setError("No active session found. Please log in again.");
      setLoading(false);
      return;
    }

    if (!user) {
      setError("User data not found. Please log in again.");
      setLoading(false);
      return;
    }

    // Update debug info
    setDebugInfo({
      hasSession: !!session,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      role,
    });

    // Redirect teacher to teacher-portal
    if (user && role === 'teacher') {
      router.push('/teacher-portal');
    }
  }, [user, role, router, session]);

  // Fetch previously uploaded documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user || !session) return;
      
      try {
        // First check if the documents table exists by making a simple query
        const { error: tableCheckError } = await supabase
          .from('documents')
          .select('count')
          .limit(1);
          
        if (tableCheckError) {
          if (tableCheckError.message.includes('does not exist')) {
            setError("The documents table does not exist in the database. Please set up the database tables according to the instructions.");
            setLoading(false);
            return;
          }
        }
        
        // If table exists, get user documents
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Update URLs for all documents
        const updatedDocs = await Promise.all((data || []).map(async (doc) => {
          try {
            const { data: urlData, error: urlError } = await supabase.storage
              .from('documents')
              .createSignedUrl(doc.file_path, 60 * 60 * 24 * 7);
              
            if (urlError) {
              console.error('Error refreshing URL:', urlError);
              return doc;
            }
            
            return { ...doc, url: urlData.signedUrl };
          } catch (e) {
            console.error('Error processing document URL:', e);
            return doc;
          }
        }));
        
        setDebugInfo(prev => ({ ...prev, documentsFound: updatedDocs?.length || 0 }));
        setDocuments(updatedDocs || []);
      } catch (error: any) {
        console.error("Error fetching documents:", error.message);
        setError(`Failed to load documents: ${error.message}`);
        toast.error("Failed to load your documents");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [user, session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileType = selectedFile.type;
      
      // Check file type
      if (fileType !== 'application/pdf' && 
          !fileType.startsWith('image/png')) {
        toast.error("Please upload only PDF or PNG files");
        return;
      }
      
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !user) return;
    
    setUploading(true);
    setError(null); // Clear previous errors
    
    try {
      console.log('Starting file upload process...');
      
      // Prepare the file upload
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      console.log('Uploading file with path:', filePath);
      
      // Upload the file to the documents bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error('Upload error:', uploadError.message);
        throw uploadError;
      }
      
      console.log('File uploaded successfully');
      
      // Get a URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
        
      const fileUrl = urlData.publicUrl;
      
      // Store document metadata in the documents table
      const { error: dbError } = await supabase
        .from('documents')
        .insert([
          {
            user_id: user.id,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_path: filePath,
            url: fileUrl,
            user_email: user.email,
            user_name: user.user_metadata?.full_name || 'Unknown User'
          }
        ]);
        
      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }
      
      toast.success("Document uploaded successfully!");
      setFile(null);
      
      // Refresh documents list
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error refreshing document list:', error);
      } else {
        setDocuments(data || []);
      }
      
    } catch (error: any) {
      console.error("Error uploading document:", error.message);
      setError(`Upload failed: ${error.message}`);
      toast.error("Failed to upload document: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Function to delete a document
  const handleDeleteDocument = async (docId: string, filePath: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }
    
    try {
      // First delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);
        
      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        toast.error("Failed to delete the file: " + storageError.message);
        return;
      }
      
      // Then delete the record from the database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId);
        
      if (dbError) {
        console.error('Error deleting document record:', dbError);
        toast.error("Failed to delete document record: " + dbError.message);
        return;
      }
      
      // Update the UI
      setDocuments(documents.filter(doc => doc.id !== docId));
      toast.success("Document deleted successfully");
      
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document: " + error.message);
    }
  };

  // Add function to handle account deletion
  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This will permanently delete all your uploaded documents and your account information. This action cannot be undone.")) {
      return;
    }
    
    try {
      const { error } = await deleteAccount();
      
      if (error) {
        console.error('Error deleting account:', error);
        toast.error(`Failed to delete account: ${error.message}`);
        return;
      }
      
      toast.success("Your account has been successfully deleted");
      router.push("/");
    } catch (error: any) {
      console.error('Error in handleDeleteAccount:', error);
      toast.error(`An unexpected error occurred: ${error.message}`);
    }
  };

  if (role === 'teacher') {
    return null; // This will be redirected anyway
  }

  if (error) {
    return (
      <div className="container py-10">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <p className="text-sm text-gray-500 mb-6">
              This may be due to missing database tables or incorrect setup. Please follow the Supabase setup instructions.
            </p>
            <div className="space-y-2">
              <Link href="/debug">
                <Button variant="outline" className="w-full">View Debug Information</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">Return to Home</Button>
              </Link>
              <Link href="/login">
                <Button className="w-full">Try Logging In Again</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Debug information */}
        <div className="mt-8 max-w-lg mx-auto">
          <details className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <summary className="cursor-pointer font-medium">Debug Information</summary>
            <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>
              Upload PDF or PNG files to share with your teacher.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="file">Select File (PDF or PNG only, max 10MB)</Label>
                <Input 
                  id="file" 
                  type="file" 
                  onChange={handleFileChange}
                  accept=".pdf,.png"
                  required
                  className="mt-1"
                />
              </div>
              
              {file && (
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                  <p className="text-sm font-medium">Selected file:</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{file.name}</p>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSubmit}
              disabled={!file || uploading}
              className="w-full"
            >
              {uploading ? "Uploading..." : "Upload Document"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
            <CardDescription>
              View and manage your uploaded documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p>Loading documents...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-40 text-center text-red-500">
                <p>{error}</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="flex justify-center items-center h-40 text-center text-gray-500">
                <p>No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${doc.uploaded_by_teacher ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="truncate">
                        <div className="flex items-center gap-1">
                          <p className="font-medium truncate">{doc.file_name}</p>
                          {doc.uploaded_by_teacher && (
                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">
                              Teacher Feedback
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(doc.created_at).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          View
                        </a>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Management Section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-semibold mb-4">Account Management</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Delete Account</CardTitle>
            <CardDescription>
              This action will permanently delete your account and all uploaded documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Once you delete your account, all your personal information and uploads will be permanently removed from our system. This action cannot be undone.
            </p>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="w-full"
            >
              Delete My Account
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Debug section */}
      <div className="mt-8 max-w-lg mx-auto">
        <details className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
          <summary className="cursor-pointer font-medium">Debug Information</summary>
          <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
} 