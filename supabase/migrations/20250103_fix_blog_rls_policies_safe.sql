-- Safe migration: Fix blog_posts RLS policies to allow proper admin access
-- This version handles existing policies gracefully

-- Drop ALL existing policies for blog_posts to start fresh
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'blog_posts' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON blog_posts';
    END LOOP;
END $$;

-- Create new policies
CREATE POLICY "Public can read published posts" ON blog_posts
    FOR SELECT USING (published = true);

CREATE POLICY "Anonymous can read all posts" ON blog_posts
    FOR SELECT USING (true);

CREATE POLICY "Anonymous can insert posts" ON blog_posts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anonymous can update posts" ON blog_posts
    FOR UPDATE USING (true);

CREATE POLICY "Anonymous can delete posts" ON blog_posts
    FOR DELETE USING (true);

-- Create storage bucket for blog images (only if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies for blog-images bucket to start fresh
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage'
        AND policyname LIKE '%blog images%'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Create storage policies
CREATE POLICY "Anyone can upload blog images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Anyone can view blog images" ON storage.objects
    FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Anyone can update blog images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'blog-images');

CREATE POLICY "Anyone can delete blog images" ON storage.objects
    FOR DELETE USING (bucket_id = 'blog-images'); 