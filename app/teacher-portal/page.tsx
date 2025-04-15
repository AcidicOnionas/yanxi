"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";

type Document = {
  id: string;
  created_at: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  url: string;
  user_email: string;
  user_name?: string;
};

type Student = {
  userId: string;
  email: string;
  documents: Document[];
};

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

export default function TeacherPortal() {
  const router = useRouter();
  const { user, role, session } = useAuth();
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [studentData, setStudentData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const [students, setStudents] = useState<{id: string, email: string}[]>([]);
  
  // State for file upload to student
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

    // Redirect students to dashboard
    if (user && role === 'student') {
      router.push('/dashboard');
    }
  }, [user, role, router, session]);

  // Fetch all student uploads
  useEffect(() => {
    const fetchAllDocuments = async () => {
      if (!user || role !== 'teacher' || !session) return;
      
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
        
        // If table exists, get all documents
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Just like the student dashboard, update URLs for all documents
        const documents = data as Document[];
        console.log(`Found ${documents.length} documents, refreshing URLs...`);
        
        // Create fresh signed URLs for each document
        const updatedDocs = await Promise.all(documents.map(async (doc) => {
          try {
            const { data: urlData, error: urlError } = await supabase.storage
              .from('documents')
              .createSignedUrl(doc.file_path, 60 * 60 * 24 * 7); // 7 day expiration
              
            if (urlError) {
              console.error(`Error creating signed URL for ${doc.file_name}:`, urlError);
              return doc; // Return original document if we can't get a fresh URL
            }
            
            return { ...doc, url: urlData.signedUrl };
          } catch (e) {
            console.error(`Error refreshing URL for ${doc.file_name}:`, e);
            return doc;
          }
        }));
        
        console.log(`Successfully refreshed URLs for documents`);
        setAllDocuments(updatedDocs);
        setDebugInfo(prev => ({ 
          ...prev, 
          documentsFound: updatedDocs.length
        }));
        
        // Create a map of students and their documents
        const studentMap = new Map<string, Student>();
        
        updatedDocs.forEach(doc => {
          if (!studentMap.has(doc.user_id)) {
            studentMap.set(doc.user_id, {
              userId: doc.user_id,
              email: doc.user_email,
              documents: []
            });
          }
          
          studentMap.get(doc.user_id)?.documents.push(doc);
        });
        
        setStudentData(Array.from(studentMap.values()));
      } catch (error: any) {
        console.error("Error fetching documents:", error.message);
        setError(`Failed to load documents: ${error.message}`);
        toast.error("Failed to load student documents");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllDocuments();
  }, [user, role, session]);

  // Add new effect to fetch all students
  useEffect(() => {
    const fetchAllStudents = async () => {
      if (!user || role !== 'teacher' || !session) return;
      
      try {
        // Query documents to get unique user_ids and emails
        const { data, error } = await supabase
          .from('documents')
          .select('user_id, user_email')
          .order('user_email');
          
        if (error) {
          console.error('Error fetching students:', error);
          return;
        }
        
        // Extract unique students
        const uniqueStudents = Array.from(
          new Map(data.map(item => [item.user_id, { id: item.user_id, email: item.user_email }]))
            .values()
        );
        
        setStudents(uniqueStudents);
      } catch (e) {
        console.error('Error in fetchAllStudents:', e);
      }
    };
    
    fetchAllStudents();
  }, [user, role, session]);

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
      setAllDocuments(allDocuments.filter(doc => doc.id !== docId));
      
      // Also update studentData
      const updatedStudentData = studentData.map(student => ({
        ...student,
        documents: student.documents.filter(doc => doc.id !== docId)
      })).filter(student => student.documents.length > 0);
      
      setStudentData(updatedStudentData);
      toast.success("Document deleted successfully");
      
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document: " + error.message);
    }
  };

  // Add function to handle file selection
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
      
      setFileToUpload(selectedFile);
    }
  };
  
  // Add function to upload file to student folder
  const handleUploadToStudent = async () => {
    if (!fileToUpload || !selectedStudent) {
      toast.error("Please select both a student and a file");
      return;
    }
    
    setUploading(true);
    
    try {
      // Prepare the file upload path - use student's ID folder
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `teacher_feedback_${Date.now()}.${fileExt}`;
      const filePath = `${selectedStudent}/${fileName}`;
      
      console.log('Uploading file to student folder:', filePath);
      
      // Upload the file to the documents bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error('Upload error:', uploadError.message);
        throw uploadError;
      }
      
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
            user_id: selectedStudent,
            file_name: fileToUpload.name,
            file_type: fileToUpload.type,
            file_size: fileToUpload.size,
            file_path: filePath,
            url: fileUrl,
            user_email: students.find(s => s.id === selectedStudent)?.email || 'Unknown',
            uploaded_by_teacher: true,
            teacher_email: user?.email
          }
        ]);
        
      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }
      
      toast.success("Document uploaded to student folder successfully!");
      setFileToUpload(null);
      setSelectedStudent("");
      setUploadDialogOpen(false);
      
      // Refresh documents list
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error refreshing document list:', error);
      } else {
        setAllDocuments(data || []);
        
        // Update studentData as well with the refreshed docs
        const groupedByStudent = (data || []).reduce((acc, doc) => {
          if (!acc[doc.user_id]) {
            acc[doc.user_id] = {
              userId: doc.user_id,
              email: doc.user_email,
              documents: []
            };
          }
          acc[doc.user_id].documents.push(doc);
          return acc;
        }, {} as Record<string, Student>);
        
        setStudentData(Object.values(groupedByStudent));
      }
      
    } catch (error: any) {
      console.error("Error uploading document to student folder:", error.message);
      toast.error("Failed to upload document: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (role === 'student') {
    return null; // This will be redirected anyway
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  if (error) {
    return (
      <div className="container py-10">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Teacher Portal</CardTitle>
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
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">Teacher Portal</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Manage student documents and provide feedback.
      </p>
      
      {/* Add Upload to Student button */}
      <div className="mb-6">
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>Upload Document to Student</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload to Student</DialogTitle>
              <DialogDescription>
                Upload a document or feedback file to a student's folder.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="student" className="text-right">
                  Student
                </Label>
                <Select 
                  value={selectedStudent} 
                  onValueChange={setSelectedStudent}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  File
                </Label>
                <Input
                  id="file"
                  type="file"
                  className="col-span-3"
                  onChange={handleFileChange}
                  accept=".pdf,.png"
                />
              </div>
              {fileToUpload && (
                <div className="col-span-3 col-start-2">
                  <p className="text-sm font-medium">Selected file:</p>
                  <p className="text-sm text-gray-500 truncate">{fileToUpload.name}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleUploadToStudent}
                disabled={!fileToUpload || !selectedStudent || uploading}
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Uploads</TabsTrigger>
          <TabsTrigger value="by-student">By Student</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Student Uploads</CardTitle>
              <CardDescription>
                View all documents uploaded by students in chronological order.
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading documents...</p>
                </div>
              ) : allDocuments.length === 0 ? (
                <div className="flex justify-center items-center h-40 text-center text-gray-500">
                  <p>No documents have been uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allDocuments.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="truncate">
                          <p className="font-medium truncate">{doc.file_name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatFileSize(doc.file_size)} • Uploaded {new Date(doc.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {doc.user_name || 'Unknown User'} ({doc.user_email})
                          </span>
                          <div className="flex items-center space-x-2">
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View
                            </a>
                            <button
                              onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                              className="text-red-600 hover:underline text-sm"
                              aria-label="Delete document"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="by-student">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading student data...</p>
            </div>
          ) : studentData.length === 0 ? (
            <div className="flex justify-center items-center h-40 text-center text-gray-500">
              <p>No student uploads found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {studentData.map((student) => (
                <Card key={student.userId}>
                  <CardHeader>
                    <CardTitle>{student.documents[0]?.user_name || 'Unknown'} ({student.email})</CardTitle>
                    <CardDescription>
                      {student.documents.length} document{student.documents.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-[400px] overflow-y-auto">
                    {student.documents.length === 0 ? (
                      <p className="text-center text-gray-500">No documents uploaded.</p>
                    ) : (
                      <div className="space-y-3">
                        {student.documents.map((doc) => (
                          <div 
                            key={doc.id} 
                            className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="truncate flex-1">
                                <p className="font-medium truncate">{doc.file_name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatFileSize(doc.file_size)} • {new Date(doc.created_at).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <a 
                                  href={doc.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-2 text-blue-600 hover:underline text-sm"
                                >
                                  View
                                </a>
                                <button
                                  onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                                  className="ml-2 text-red-600 hover:underline text-sm"
                                  aria-label="Delete document"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 