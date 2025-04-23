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
  uploaded_by_teacher?: boolean;
  teacher_feedback?: boolean;
  teacher_email?: string;
};

type Student = {
  userId: string;
  email: string;
  displayName?: string;
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
  databaseRole?: string | null;
  roleCheckError?: string | null;
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
  const [students, setStudents] = useState<{id: string, email: string, displayName?: string}[]>([]);
  const [uploadsFilter, setUploadsFilter] = useState<'all'|'student'|'teacher'>('all');
  const [studentDocsFilter, setStudentDocsFilter] = useState<'all'|'student'|'teacher'>('all');
  
  // State for file upload to student
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Simple function to get display name
  const getUserDisplayName = (userDoc: Document | null, email: string): string => {
    // Use document's user_name if available
    if (userDoc?.user_name) {
      return userDoc.user_name;
    }
    // Otherwise just return the email
    return email;
  };

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

    // Direct role check from database to help with debugging
    const checkRoleDirectly = async () => {
      try {
        // Check if this user has a teacher role set in the database
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        setDebugInfo(prev => ({
          ...prev,
          databaseRole: data?.role || 'not found',
          roleCheckError: error?.message || null
        }));
        
        // If user should be a teacher but isn't in auth context, force refresh
        if (data?.role === 'teacher' && role !== 'teacher') {
          console.log('User should be teacher but context says otherwise, reloading...');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error checking role directly:', error);
      }
    };
    
    checkRoleDirectly();

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
            
            // Only set user_name for non-teacher uploads
            if (!doc.uploaded_by_teacher && !doc.user_name) {
              // Simple username extraction for student uploads only
              if (doc.user_email) {
                const username = doc.user_email.split('@')[0];
                doc.user_name = username;
              }
            }
            
            // For teacher uploads, make sure user_name is explicitly null or undefined
            if (doc.uploaded_by_teacher) {
              doc.user_name = undefined;
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

  // Define fetchAllStudents outside the useEffect
  const fetchAllStudents = async () => {
    if (!user || role !== 'teacher' || !session) return;
    
    try {
      // Query documents to get unique user_ids and emails
      const { data, error } = await supabase
        .from('documents')
        .select('user_id, user_email, user_name')
        .order('user_email');
        
      if (error) {
        console.error('Error fetching students:', error);
        return;
      }
      
      // Use a map to collect student information with both email and displayName
      const studentMap = new Map();
      data.forEach(item => {
        // If the student is not in the map yet or if this document has user_name and previous didn't
        if (!studentMap.has(item.user_id) || (!studentMap.get(item.user_id).displayName && item.user_name)) {
          studentMap.set(item.user_id, { 
            id: item.user_id, 
            email: item.user_email,
            displayName: item.user_name || item.user_email.split('@')[0] // Fall back to email username if no name
          });
        }
      });
      
      // Convert to array
      const uniqueStudents = Array.from(studentMap.values());
      
      setStudents(uniqueStudents);
    } catch (e) {
      console.error('Error in fetchAllStudents:', e);
    }
  };

  // Add new effect to fetch all students
  useEffect(() => {
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
  
  // Function to find and get student display name
  const getStudentDisplayName = (studentId: string): string => {
    const student = students.find(s => s.id === studentId);
    if (!student) return "Unknown Student";
    return student.displayName || student.email;
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
      const timestamp = Date.now();
      
      // Check if file with the same name exists to avoid overwrites, but preserve original name
      // We add a timestamp only in the storage path, not in the displayed filename
      const baseName = fileToUpload.name.substring(0, fileToUpload.name.lastIndexOf('.'));
      const fileName = `${baseName}_${timestamp}.${fileExt}`;
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
      
      // Find the student's email and display name
      const student = students.find(s => s.id === selectedStudent);
      const studentEmail = student?.email || 'Unknown';
      const studentDisplayName = student?.displayName || studentEmail.split('@')[0];
      
      // Use the original file name instead of creating a standardized one
      const displayFileName = fileToUpload.name;
      
      // Store document metadata in the documents table - WITHOUT user_name field
      const { error: dbError } = await supabase
        .from('documents')
        .insert([
          {
            user_id: selectedStudent,
            file_name: displayFileName,
            file_type: fileToUpload.type,
            file_size: fileToUpload.size,
            file_path: filePath,
            url: fileUrl,
            user_email: studentEmail,
            // Explicitly NOT including user_name field for teacher uploads
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
      
      // Refresh the document list
      refreshDocuments();
      
    } catch (error: any) {
      console.error("Error uploading document to student folder:", error.message);
      toast.error("Failed to upload document: " + error.message);
    } finally {
      setUploading(false);
    }
  };
  
  // Helper function to refresh document list
  const refreshDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error refreshing document list:', error);
        return;
      }
      
      // Create fresh signed URLs for each document
      const updatedDocs = await Promise.all((data || []).map(async (doc) => {
        try {
          const { data: urlData, error: urlError } = await supabase.storage
            .from('documents')
            .createSignedUrl(doc.file_path, 60 * 60 * 24 * 7);
            
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
      
      setAllDocuments(updatedDocs);
      
      // Update studentData with the refreshed docs
      const studentMap = new Map<string, Student>();
      
      updatedDocs.forEach(doc => {
        if (!studentMap.has(doc.user_id)) {
          // Look up student in existing students array to maintain display name
          const existingStudent = students.find(s => s.id === doc.user_id);
          
          studentMap.set(doc.user_id, {
            userId: doc.user_id,
            email: doc.user_email,
            displayName: existingStudent?.displayName || doc.user_name || doc.user_email.split('@')[0],
            documents: []
          });
        }
        
        studentMap.get(doc.user_id)?.documents.push(doc);
      });
      
      setStudentData(Array.from(studentMap.values()));
      
      // Also refresh the students list to ensure we have the latest display names
      fetchAllStudents();
    } catch (error: any) {
      console.error("Error refreshing documents:", error.message);
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
            <div className="space-y-2">
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
      
      {/* Debug info section */}
      
      
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
                        {student.displayName ? `${student.displayName} (${student.email})` : student.email}
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>All Uploads</CardTitle>
                  <CardDescription>
                    View all documents uploaded by students and teachers.
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant={uploadsFilter === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setUploadsFilter('all')}
                  >
                    All
                  </Button>
                  <Button 
                    variant={uploadsFilter === 'student' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setUploadsFilter('student')}
                  >
                    Student Uploads
                  </Button>
                  <Button 
                    variant={uploadsFilter === 'teacher' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setUploadsFilter('teacher')}
                  >
                    Teacher Feedback
                  </Button>
                </div>
              </div>
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
                  {(() => {
                    const filteredDocs = allDocuments.filter(doc => {
                      if (uploadsFilter === 'all') return true;
                      if (uploadsFilter === 'student') return !doc.uploaded_by_teacher;
                      if (uploadsFilter === 'teacher') return doc.uploaded_by_teacher;
                      return true;
                    });
                    
                    if (filteredDocs.length === 0) {
                      return (
                        <div className="flex justify-center items-center h-40 text-center text-gray-500">
                          <p>
                            {uploadsFilter === 'student' && "No student uploads found."}
                            {uploadsFilter === 'teacher' && "No teacher feedback found."}
                            {uploadsFilter === 'all' && "No documents found."}
                          </p>
                        </div>
                      );
                    }
                    
                    return filteredDocs.map((doc) => (
                      <div 
                        key={doc.id} 
                        className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          doc.uploaded_by_teacher 
                            ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 border-l-4' 
                            : ''
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="truncate">
                            <p className="font-medium truncate flex items-center">
                              {doc.uploaded_by_teacher && (
                                <span className="mr-2 text-blue-600">📝</span>
                              )}
                              {doc.file_name}
                              {doc.uploaded_by_teacher && (
                                <span className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">
                                  Teacher Feedback
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatFileSize(doc.file_size)} • Uploaded {new Date(doc.created_at).toLocaleString()}
                              {doc.uploaded_by_teacher && doc.teacher_email && (
                                <span className="ml-1">• By: {doc.teacher_email}</span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {doc.uploaded_by_teacher ? (
                                <div className="flex flex-col">
                                  <div>{getStudentDisplayName(doc.user_id)}</div>

                                </div>
                              ) : (
                                <div>
                                  {doc.user_name ? `${doc.user_name} (${doc.user_email})` : doc.user_email}
                                </div>
                              )}
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
                    ));
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="by-student">
          <div className="mb-4 flex justify-end">
            <div className="flex space-x-2">
              <Button 
                variant={studentDocsFilter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStudentDocsFilter('all')}
              >
                All Documents
              </Button>
              <Button 
                variant={studentDocsFilter === 'student' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStudentDocsFilter('student')}
              >
                Student Uploads
              </Button>
              <Button 
                variant={studentDocsFilter === 'teacher' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStudentDocsFilter('teacher')}
              >
                Teacher Feedback
              </Button>
            </div>
          </div>
          
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
              {studentData.map((student) => {
                // Find a student-uploaded document (not teacher feedback)
                const studentOwnDoc = student.documents.find(doc => !doc.uploaded_by_teacher);
                // Get student display name using the helper function or directly from studentData
                const studentDisplayName = getStudentDisplayName(student.userId);
                
                return (
                  <Card key={student.userId}>
                    <CardHeader>
                      <CardTitle>
                        {studentDisplayName !== student.email 
                          ? `${studentDisplayName} (${student.email})`
                          : student.email}
                      </CardTitle>
                      <CardDescription>
                        {student.documents.length} document{student.documents.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[400px] overflow-y-auto">
                      {student.documents.length === 0 ? (
                        <p className="text-center text-gray-500">No documents uploaded.</p>
                      ) : (
                        <div className="space-y-3">
                          {(() => {
                            const filteredDocs = student.documents.filter(doc => {
                              if (studentDocsFilter === 'all') return true;
                              if (studentDocsFilter === 'student') return !doc.uploaded_by_teacher;
                              if (studentDocsFilter === 'teacher') return doc.uploaded_by_teacher;
                              return true;
                            });
                            
                            if (filteredDocs.length === 0) {
                              return (
                                <div className="text-center text-gray-500 py-4">
                                  <p>
                                    {studentDocsFilter === 'student' && "No student uploads found."}
                                    {studentDocsFilter === 'teacher' && "No teacher feedback found for this student."}
                                    {studentDocsFilter === 'all' && "No documents found."}
                                  </p>
                                </div>
                              );
                            }
                            
                            return filteredDocs.map((doc) => (
                              <div 
                                key={doc.id} 
                                className={`p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                                  doc.uploaded_by_teacher 
                                    ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 border-l-4' 
                                    : ''
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="truncate flex-1">
                                    <p className="font-medium truncate flex items-center">
                                      {doc.uploaded_by_teacher && (
                                        <span className="mr-2 text-blue-600">📝</span>
                                      )}
                                      {doc.file_name}
                                      {doc.uploaded_by_teacher && (
                                        <span className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">
                                          Teacher Feedback
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatFileSize(doc.file_size)} • {new Date(doc.created_at).toLocaleString()}
                                      {doc.uploaded_by_teacher && doc.teacher_email && (
                                        <span className="ml-1">• Uploaded by: {doc.teacher_email}</span>
                                      )}
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
                            ));
                          })()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 