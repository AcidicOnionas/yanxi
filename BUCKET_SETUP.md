# Storage Bucket Setup

Follow these steps to manually create the required storage bucket and set up policies in your Supabase dashboard:

## 1. Create the "documents" Bucket

1. Log in to your Supabase dashboard
2. Navigate to the **Storage** section in the left sidebar
3. Click on the **New Bucket** button
4. Enter `documents` as the bucket name
5. Select **Private** as the bucket type
6. Click **Create bucket**

## 2. Set Up Storage Policies

After creating the bucket, you need to set up the correct policies to allow file access:

1. In the Storage section, click on the **Policies** tab
2. You'll need to create four policies:

### Policy 1: Allow authenticated users to upload files to their own folders

1. Click **Add Policy**
2. For **Policy Name**, enter: `Allow users to upload to their own folder`
3. For **Allowed Operations**, select: `INSERT`
4. For **Target Roles**, select: `authenticated`
5. For **Policy Definition**, enter the following SQL:
```sql
(bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text)
```
6. Click **Save Policy**

### Policy 2: Allow users to read their own files

1. Click **Add Policy**
2. For **Policy Name**, enter: `Allow users to read their own files`
3. For **Allowed Operations**, select: `SELECT`
4. For **Target Roles**, select: `authenticated`
5. For **Policy Definition**, enter the following SQL:
```sql
(bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text)
```
6. Click **Save Policy**

### Policy 3: Allow teacher to view all files

1. Click **Add Policy**
2. For **Policy Name**, enter: `Allow teacher to view all files`
3. For **Allowed Operations**, select: `SELECT`
4. For **Target Roles**, select: `authenticated`
5. For **Policy Definition**, enter the following SQL:
```sql
(bucket_id = 'documents' AND auth.email() = 'chriscao0329@gmail.com')
```
6. Click **Save Policy**

### Policy 4: Allow teacher to upload to any student folder

1. Click **Add Policy**
2. For **Policy Name**, enter: `Allow teacher to upload to student folders`
3. For **Allowed Operations**, select: `INSERT`
4. For **Target Roles**, select: `authenticated`
5. For **Policy Definition**, enter the following SQL:
```sql
(bucket_id = 'documents' AND auth.email() = 'chriscao0329@gmail.com')
```
6. Click **Save Policy**

## 3. Verify the Setup

1. Ensure all four policies are correctly set up and activated
2. Check that the bucket is created and visible in the Storage section
3. Clear your browser cache and reload the application
4. Try uploading a file as a student and then viewing it
5. Log in as the teacher and verify that you can see all student uploads and upload to student folders

If you continue to experience issues, check the browser console for errors and ensure that the SQL in your policies exactly matches what's provided above. 