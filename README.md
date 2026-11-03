# Helions Business School

A React/Vite learning management system using Supabase for authentication, data, and private lesson files.

## Deployment

1. Supabase project: `lwivftyzzhsayotzlqcb` (the database and private `lesson-materials` bucket were created in ChatGPT).
2. Deploy this GitHub repository on Vercel with framework **Vite**, build command `npm run build`, output directory `dist`.
3. Add Vercel environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. These should be the public project URL and publishable key, never the service role key.
4. Redeploy after changing environment variables.
5. Register a student account on the site. To designate the owner as administrator, use the Supabase SQL editor while logged into your own Supabase account:

```sql
update public.profiles set role='admin'
where id=(select id from auth.users where email='YOUR_EMAIL_ADDRESS' limit 1);
```

Replace the email placeholder with the exact address you used to register, and run this once. Never allow regular users to grant themselves admin access.

## Features

- Student registration/login, browse published courses, enrol, track lesson completion
- Admin: create/edit/publish courses, add/edit/delete lessons, upload documents (max 10 MB per file)
- Private file access protected by Supabase storage policies
- Admin access is secured in the database, not just by hiding navigation items

## Important

- Video hosting uses external links, not uploads.
- No payment processing or certificates in this version.
- Vercel Hobby is for personal, non-commercial use. Commercial Helions training requires an appropriate hosting plan.
- Review and test authentication and storage policies before inviting real students.
