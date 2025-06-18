import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Create Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBlogSetup() {
  console.log('🔍 Checking blog database setup...\n');

  try {
    // 1. Check if blog_posts table exists
    console.log('1. Checking if blog_posts table exists...');
    const { data: tables, error: tablesError } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);

    if (tablesError) {
      console.error('❌ blog_posts table not found or not accessible');
      console.error('Error:', tablesError.message);
      console.log('\n📝 To fix this:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the contents of: supabase/migrations/20250103_create_blog_posts_table.sql');
      console.log('4. Run the contents of: supabase/migrations/20250103_fix_blog_rls_policies.sql');
      return false;
    }
    console.log('✅ blog_posts table exists');

    // 2. Check for blog posts
    console.log('2. Checking for blog posts...');
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true);

    if (postsError) {
      console.error('❌ Error fetching blog posts:', postsError.message);
      return false;
    }

    console.log(`✅ Found ${posts.length} published blog posts`);

    if (posts.length === 0) {
      console.log('⚠️  No published blog posts found');
      console.log('The sample posts might not be inserted or published=false');
    } else {
      console.log('\n📄 Published posts:');
      posts.forEach(post => {
        console.log(`   - ${post.title} (${post.slug})`);
      });
    }

    // 3. Check storage bucket
    console.log('\n3. Checking storage bucket...');
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error('❌ Error checking storage buckets:', bucketsError.message);
    } else {
      const blogBucket = buckets.find(bucket => bucket.id === 'blog-images');
      if (blogBucket) {
        console.log('✅ blog-images storage bucket exists');
      } else {
        console.log('⚠️  blog-images storage bucket not found');
        console.log('Run the second migration to create it');
      }
    }

    // 4. Test the increment function
    console.log('\n4. Testing increment_blog_post_views function...');
    if (posts.length > 0) {
      const { error: funcError } = await supabase
        .rpc('increment_blog_post_views', { post_slug: posts[0].slug });

      if (funcError) {
        console.error('❌ increment_blog_post_views function error:', funcError.message);
      } else {
        console.log('✅ increment_blog_post_views function works');
      }
    }

    console.log('\n🎉 Blog setup verification complete!');
    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run the check
checkBlogSetup().then(success => {
  if (!success) {
    console.log('\n🚨 Setup incomplete. Please follow the instructions above.');
    process.exit(1);
  }
}); 