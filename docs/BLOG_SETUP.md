# Blog System Setup Guide

This guide will help you set up the blog system for your FurrChum application.

## Prerequisites

- Supabase project set up and running
- Database migrations applied
- Environment variables configured

## Database Setup

### 1. Run the Blog Migration

Apply the blog migrations to create the necessary database structure:

```bash
# If using Supabase CLI
supabase db push

# Or apply the migrations manually in your Supabase dashboard
# 1. Copy and paste: supabase/migrations/20250103_create_blog_posts_table.sql
# 2. Copy and paste: supabase/migrations/20250103_fix_blog_rls_policies.sql
```

### 2. Verify Database Structure

After running the migrations, you should have:

- `blog_posts` table with all necessary columns
- Proper indexes for performance
- Row Level Security (RLS) policies (updated to allow admin access)
- `increment_blog_post_views` function
- `blog-images` storage bucket for image uploads
- Storage policies for image management
- Sample blog posts inserted

### 3. Database Permissions

The migration automatically sets up:
- **Public access**: Anyone can read published blog posts
- **Authenticated access**: Only authenticated users can create/edit/delete posts
- **Admin access**: Use the password-protected admin panel (`/blog/admin`)

## File Structure

The blog system consists of these key files:

```
src/
├── pages/
│   ├── BlogPage.tsx              # Public blog listing and post view
│   ├── BlogAdminPage.tsx         # Password-protected admin panel
├── components/
│   └── Navbar.tsx               # Updated with blog link
├── integrations/supabase/
│   └── types.ts                 # Updated with blog_posts types
└── index.css                    # Enhanced with blog styling

supabase/migrations/
└── 20250103_create_blog_posts_table.sql  # Database schema
```

## Features

### Public Blog Features
- **Blog listing page** at `/blog`
- **Individual blog posts** at `/blog/:slug`
- **Search functionality** by title, content, and tags
- **Category filtering** (Pet Care, Veterinary Tips, etc.)
- **Featured posts** section
- **SEO optimization** with meta titles and descriptions
- **Social sharing** with native share API
- **Responsive design** for mobile and desktop
- **View count tracking**

### Admin Panel Features
- **Password protection** (password: `furrchum2024`)
- **Full CRUD operations** for blog posts
- **Rich text editor** for content creation
- **Image upload to Supabase Storage** (featured images)
- **SEO fields** (meta title, description)
- **Tag management system**
- **Category selection**
- **Publish/draft toggles**
- **Featured post marking**
- **Analytics dashboard**

## Usage

### Accessing the Blog

1. **Public blog**: Navigate to `/blog` to see all published posts
2. **Individual posts**: Click on any post or go to `/blog/post-slug`
3. **Admin panel**: Go to `/blog/admin` and enter password `furrchum2024`

### Creating Blog Posts

1. Go to `/blog/admin`
2. Enter the admin password: `furrchum2024`
3. Click on the "Editor" tab
4. Fill in all required fields:
   - Title (required)
   - URL slug (auto-generated from title)
   - Excerpt (required)
   - Content (required, supports HTML)
   - Featured image URL
   - Author information
   - Tags (comma-separated)
   - Category
   - Reading time estimate
   - SEO fields
5. Toggle "Published" to make the post live
6. Click "Save Post"

### Managing Existing Posts

1. Go to the "Posts" tab in the admin panel
2. Use the search function to find specific posts
3. Click "Edit" to modify a post
4. Click "Delete" to remove a post (with confirmation)

### Analytics

The "Analytics" tab shows:
- Total posts count
- Published vs draft posts
- View counts and engagement metrics
- Most popular posts

## Customization

### Styling

The blog uses Tailwind CSS classes and custom styles in `src/index.css`:

```css
/* Line clamp utilities for text truncation */
.line-clamp-1, .line-clamp-2, .line-clamp-3

/* Prose styling for blog content */
.prose h1, .prose h2, .prose h3, etc.
```

### Categories

Default categories are defined in `BlogPage.tsx`:
```typescript
const categories = ['all', 'Pet Care', 'Veterinary Tips', 'Health & Wellness', 'Training', 'Nutrition', 'Emergency Care'];
```

Add or modify categories by updating this array.

### Admin Password

The admin password is currently hardcoded as `furrchum2024`. For production, consider:

1. Moving it to environment variables
2. Implementing proper authentication
3. Adding role-based access control

### SEO Optimization

Each blog post supports:
- Custom meta titles
- Meta descriptions
- Open Graph tags (can be extended)
- Structured data (can be added)

## Sample Content

The migration includes 4 sample blog posts:

1. "Essential Pet Care Tips for New Pet Owners" (featured)
2. "Understanding Your Pet's Behavior" (featured)
3. "Emergency Pet Care: What Every Owner Should Know"
4. "Nutrition Guidelines for Different Life Stages"

These demonstrate the full feature set and can be edited or deleted as needed.

## Troubleshooting

### Common Issues

1. **"Blog post not found" error**
   - Ensure the migration ran successfully
   - Check that posts are marked as `published = true`
   - Verify the slug matches the URL

2. **Admin panel won't load**
   - Check the password is correct: `furrchum2024`
   - Ensure Supabase connection is working

3. **Images not loading**
   - Verify image URLs are accessible
   - Consider setting up Supabase Storage for image uploads

4. **Search not working**
   - Check database connection
   - Ensure RLS policies allow reading published posts

### Database Queries

To manually check your blog posts:

```sql
-- View all blog posts
SELECT * FROM blog_posts ORDER BY created_at DESC;

-- View only published posts
SELECT * FROM blog_posts WHERE published = true ORDER BY created_at DESC;

-- Check view counts
SELECT title, view_count FROM blog_posts ORDER BY view_count DESC;
```

## Next Steps

Consider these enhancements for production:

1. **Image Management**: Set up Supabase Storage for blog images
2. **Rich Editor**: Integrate a WYSIWYG editor like TinyMCE or Quill
3. **Comments System**: Add blog post comments
4. **Newsletter**: Add email subscription for blog updates
5. **RSS Feed**: Generate RSS/Atom feeds
6. **Analytics**: Integrate Google Analytics or similar
7. **Performance**: Add caching for popular posts
8. **Security**: Implement proper admin authentication

## Support

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Verify Supabase connection and permissions
3. Review the migration logs
4. Check that all required environment variables are set

The blog system is now ready to use! Start by creating your first blog post in the admin panel. 