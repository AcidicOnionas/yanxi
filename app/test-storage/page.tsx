"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function TestStoragePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [uploadUrl, setUploadUrl] = useState("");

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      addLog(`File selected: ${e.target.files[0].name}`);
    }
  };

  const handleTestBucket = async () => {
    addLog("Testing bucket access...");
    try {
      const { data, error } = await supabase.storage.getBucket('documents');
      
      if (error) {
        addLog(`❌ Bucket error: ${error.message}`);
        if (error.message.includes('not found')) {
          addLog("Bucket doesn't exist. Try creating it...");
        }
      } else {
        addLog(`✅ Bucket exists: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      addLog(`❌ Exception: ${err.message}`);
    }
  };

  const handleCreateBucket = async () => {
    addLog("Creating bucket...");
    try {
      const { data, error } = await supabase.storage.createBucket('documents', {
        public: false
      });
      
      if (error) {
        addLog(`❌ Creation failed: ${error.message}`);
      } else {
        addLog(`✅ Bucket created: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      addLog(`❌ Exception: ${err.message}`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      addLog("❌ No file selected!");
      return;
    }

    setUploading(true);
    addLog(`Starting upload of ${file.name}...`);
    
    try {
      // Use a simple file path for testing
      const filePath = `test/${file.name}`;
      
      addLog(`Uploading to path: ${filePath}`);
      
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (error) {
        addLog(`❌ Upload failed: ${error.message}`);
        console.error("Full error:", error);
      } else {
        addLog(`✅ Upload successful: ${JSON.stringify(data)}`);
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);
          
        const url = urlData.publicUrl;
        addLog(`📎 File URL: ${url}`);
        setUploadUrl(url);
      }
    } catch (err: any) {
      addLog(`❌ Exception: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Storage Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Storage Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input 
                type="file" 
                onChange={handleFileChange}
                className="mb-4"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleTestBucket}>
                Test Bucket
              </Button>
              <Button onClick={handleCreateBucket} variant="secondary">
                Create Bucket
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!file || uploading}
              >
                {uploading ? "Uploading..." : "Upload File"}
              </Button>
              <Button onClick={clearLogs} variant="outline">
                Clear Logs
              </Button>
            </div>
            
            {uploadUrl && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900 rounded-md">
                <p className="font-medium">File uploaded!</p>
                <a 
                  href={uploadUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {uploadUrl}
                </a>
              </div>
            )}
            
            <div className="mt-4">
              <Link href="/session-debug">
                <Button variant="outline" size="sm">
                  Go to Session Debug
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-md h-[400px] overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet. Run some operations...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 