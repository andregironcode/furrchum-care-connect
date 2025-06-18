-- Fix blog_posts RLS policies to allow proper admin access

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can manage blog posts" ON blog_posts;

-- Create new policies that work better
-- Anyone can read published blog posts
CREATE POLICY "Public can read published posts" ON blog_posts
    FOR SELECT USING (published = true);

-- Allow anonymous users to read all posts (needed for admin panel)
-- In production, you might want to restrict this to authenticated users only
CREATE POLICY "Anonymous can read all posts" ON blog_posts
    FOR SELECT USING (true);

-- Allow anonymous users to insert posts (needed for admin panel)  
-- In production, you might want to restrict this to authenticated users only
CREATE POLICY "Anonymous can insert posts" ON blog_posts
    FOR INSERT WITH CHECK (true);

-- Allow anonymous users to update posts (needed for admin panel)
-- In production, you might want to restrict this to authenticated users only  
CREATE POLICY "Anonymous can update posts" ON blog_posts
    FOR UPDATE USING (true);

-- Allow anonymous users to delete posts (needed for admin panel)
-- In production, you might want to restrict this to authenticated users only
CREATE POLICY "Anonymous can delete posts" ON blog_posts
    FOR DELETE USING (true);

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

-- Create storage policy to allow anyone to upload images to blog-images bucket
CREATE POLICY "Anyone can upload blog images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'blog-images');

-- Create storage policy to allow anyone to view blog images
CREATE POLICY "Anyone can view blog images" ON storage.objects
    FOR SELECT USING (bucket_id = 'blog-images');

-- Create storage policy to allow anyone to update blog images  
CREATE POLICY "Anyone can update blog images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'blog-images');

-- Create storage policy to allow anyone to delete blog images
CREATE POLICY "Anyone can delete blog images" ON storage.objects
    FOR DELETE USING (bucket_id = 'blog-images'); 