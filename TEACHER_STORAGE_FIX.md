# Teacher Storage Access Fix - Alternative Approaches

Since the initial policy didn't work, try these alternative approaches:

## Option 1: More Explicit Policy

1. Log in to your Supabase dashboard
2. Navigate to the **Storage** section in the left sidebar
3. Click on the **Policies** tab
4. Delete any existing teacher policies
5. Click **Add Policy**
6. For **Policy Name**, enter: `Teacher view all documents`
7. For **Allowed Operations**, select **SELECT**
8. For **Target Roles**, select: `authenticated`
9. For **Policy Definition**, enter the following SQL:
```sql
(bucket_id = 'documents' AND auth.email() = 'chriscao0329@gmail.com')
```
10. Click **Save Policy**

## Option 2: Use LIKE Operator for Email

Sometimes exact matching can be an issue. Try with a LIKE operator:

```sql
(bucket_id = 'documents' AND auth.email() LIKE '%chriscao0329@gmail.com%')
```

## Option 3: Super Admin Policy

Create a completely permissive policy for the teacher:

```sql
(true)  -- This will allow all operations for any authenticated user
```
**Note**: This is not recommended for production but useful for testing purposes.

## Option 4: Double-check Email Format

1. Go to the SQL editor in Supabase
2. Run this query to see the actual email format:

```sql
SELECT auth.email();
```

3. Use the exact format returned in your policy.

## Option 5: Use UUID Instead of Email

If you know the teacher's UUID:

```sql
(auth.uid() = 'your-teacher-uuid-here')
```

## Testing After Changes

After applying any of these policy changes:

1. Log out completely
2. Log back in as the teacher
3. Go to the Teacher Portal's "Troubleshoot" tab
4. Use the "Test File Access" tool to check if you can access files now

If the problem persists, try re-uploading a file as a student and checking if the teacher can access the newly uploaded file. 