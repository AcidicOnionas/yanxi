# Supabase Setup Guide

A simple guide to set up your Supabase project for file storage and user management.

## 1. Create the Documents Table

1. Log in to your Supabase dashboard
2. Navigate to the **Table Editor** in the left sidebar
3. Click on **New Table** button
4. Enter the following details:

   - **Name**: `documents`
   - **Description**: `Uploaded student documents and teacher feedback files`
   - **Enable Row Level Security**: ✅ (checked)

5. Set up the following columns:

   | Name | Type | Default Value | Primary | Nullable |
   |------|------|--------------|---------|----------|
   | id | uuid | gen_random_uuid() | ✅ (PK) | ❌ |
   | created_at | timestamp with time zone | now() | ❌ | ❌ |
   | user_id | uuid | | ❌ | ❌ |
   | file_name | text | | ❌ | ❌ |
   | file_type | text | | ❌ | ❌ |
   | file_size | integer | | ❌ | ❌ |
   | file_path | text | | ❌ | ❌ |
   | url | text | | ❌ | ❌ |
   | user_email | text | | ❌ | ❌ |
   | user_name | text | | ❌ | ✅ |
   | uploaded_by_teacher | boolean | false | ❌ | ❌ |
   | teacher_email | text | | ❌ | ✅ |

6. Click **Save** to create the table

## 2. Set Up Row Level Security (RLS) Policies

After creating the table, you need to set up RLS policies to control who can access the documents:

1. In the Table Editor, click on the `documents` table
2. Click on the **Policies** tab
3. If RLS is not enabled, click on **Enable RLS**
4. Create the following policies:

### Policy 1: Allow users to insert their own documents

1. Click **Add Policy**
2. For **Policy Name**, enter: `Users can insert their own documents`
3. For **Target Roles**, select: `authenticated`
4. For **Operation**, select: `INSERT`
5. For **WITH CHECK expression**, enter:
   ```sql
   auth.uid() = user_id
   ```
6. Click **Save**

### Policy 2: Allow users to read their own documents

1. Click **Add Policy**
2. For **Policy Name**, enter: `Users can read their own documents`
3. For **Target Roles**, select: `authenticated`
4. For **Operation**, select: `SELECT`
5. For **USING expression**, enter:
   ```sql
   auth.uid() = user_id
   ```
6. Click **Save**

### Policy 3: Allow teacher to read all documents

1. Click **Add Policy**
2. For **Policy Name**, enter: `Teacher can read all documents`
3. For **Target Roles**, select: `authenticated`
4. For **Operation**, select: `SELECT`
5. For **USING expression**, enter:
   ```sql
   auth.email() = 'chriscao0329@gmail.com'
   ```
6. Click **Save**

### Policy 4: Allow teacher to insert documents for any student

1. Click **Add Policy**
2. For **Policy Name**, enter: `Teacher can insert documents for any student`
3. For **Target Roles**, select: `authenticated`
4. For **Operation**, select: `INSERT`
5. For **WITH CHECK expression**, enter:
   ```sql
   auth.email() = 'chriscao0329@gmail.com'
   ```
6. Click **Save**

## 3. Verify the Setup

1. Ensure all four policies are correctly set up and activated
2. Clear your browser cache and reload the application
3. Try uploading a file as a student and then viewing it
4. Log in as the teacher and verify that you can see all student uploads

If you continue to experience issues, check the browser console for errors and ensure that the SQL in your policies exactly matches what's provided above.

## 4. Create Storage Bucket

1. Go to Supabase dashboard > Storage
2. Click "New Bucket"
3. Name it `documents`
4. Set it to "Private"

## 5. Add Storage Policies

Add the following policies in Storage > Policies:

### Policy 1: Allow users to upload to their own folder

```sql
(bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text)
```

### Policy 2: Allow users to read their own files

```sql
(bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text)
```

### Policy 3: Allow users to delete their own files

```sql
(bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text)
```

### Policy 4: Give teachers full access (try one of these)

Option A:
```sql
(bucket_id = 'documents' AND auth.email() = 'chriscao0329@gmail.com')
```

Option B (if A doesn't work):
```sql
(auth.email() = 'chriscao0329@gmail.com')
```

Option C (if others fail):
```sql
(true)  -- Only use for testing - gives access to all authenticated users
```

## 6. Testing

1. Log in as a student and upload a file
2. Verify you can view and delete the file
3. Log in as the teacher and check if you can see and delete student files

If only Option C works, you may need to check if there's a problem with how your teacher email is being compared. 

## 7. Configure Authentication and Email Templates

For the password reset functionality to work properly, you need to configure your Supabase project:

1. Go to Authentication > Email Templates
2. Update the "Password Reset" email template:
   - Customize the subject (e.g., "Reset your password")
   - You can customize the content, but make sure to keep the `{{ .ConfirmationURL }}` variable
   - Click "Save"

3. Configure Site URL Settings:
   - Go to Authentication > URL Configuration
   - Set your Site URL to your actual website URL (e.g., `https://yourdomain.com` or `http://localhost:3000` for local development)
   - Add any additional redirect URLs if needed
   - Click "Save"

4. Test the Password Reset Functionality:
   - Make sure you've added the Forgot Password page and link
   - Test the flow by clicking "Forgot password?" on the login page
   - You should receive an email with a reset link
   - The link should redirect you to your reset password page

**Note**: For local development, you might not receive emails unless you've configured Supabase to use a real email service provider. You can view the email in the Supabase dashboard under Authentication > Users. 