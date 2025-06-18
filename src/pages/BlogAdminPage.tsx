import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  Lock, 
  Unlock,
  Search,
  Upload,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { uploadBlogImage, deleteBlogImage } from '@/utils/blogImageUpload';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  author_name: string;
  author_avatar: string | null;
  tags: string[];
  category: string;
  reading_time: number;
  published: boolean;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

const BlogAdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('posts');

  // Blog post form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    author_name: 'FurrChum Team',
    author_avatar: '',
    tags: [] as string[],
    category: 'Pet Care',
    reading_time: 5,
    published: false,
    is_featured: false,
    meta_title: '',
    meta_description: ''
  });

  const [newTag, setNewTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const categories = ['Pet Care', 'Veterinary Tips', 'Health & Wellness', 'Training', 'Nutrition', 'Emergency Care'];

  // Simple password protection (in production, use proper authentication)
  const ADMIN_PASSWORD = 'furrchum2024';

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem('blog_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadPosts();
    }
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('blog_admin_auth', 'true');
      toast.success('Login successful!');
      loadPosts();
    } else {
      toast.error('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('blog_admin_auth');
    setPassword('');
    toast.success('Logged out successfully');
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title
    if (field === 'title') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value),
        meta_title: value + ' | FurrChum Blog'
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadBlogImage(file);
      
      if (result.success && result.url) {
        setFormData(prev => ({
          ...prev,
          featured_image: result.url!
        }));
        toast.success('Image uploaded successfully!');
      } else {
        toast.error(result.error || 'Image upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An error occurred during upload');
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: '',
      author_name: 'FurrChum Team',
      author_avatar: '',
      tags: [],
      category: 'Pet Care',
      reading_time: 5,
      published: false,
      is_featured: false,
      meta_title: '',
      meta_description: ''
    });
    setCurrentPost(null);
    setIsEditing(false);
  };

  const editPost = (post: BlogPost) => {
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featured_image: post.featured_image || '',
      author_name: post.author_name,
      author_avatar: post.author_avatar || '',
      tags: post.tags,
      category: post.category,
      reading_time: post.reading_time,
      published: post.published,
      is_featured: post.is_featured,
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || ''
    });
    setCurrentPost(post);
    setIsEditing(true);
    setSelectedTab('editor');
  };

  const savePost = async () => {
    // Validation
    if (!formData.title || !formData.content || !formData.excerpt) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Save to Supabase database
    const postData = {
      ...formData,
      view_count: currentPost?.view_count || 0
    };

    try {
      if (currentPost) {
        // Update existing post
        const { data, error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', currentPost.id)
          .select()
          .single();

        if (error) throw error;
        setPosts(prev => prev.map(p => p.id === currentPost.id ? data : p));
        toast.success('Post updated successfully!');
      } else {
        // Create new post
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([postData])
          .select()
          .single();

        if (error) throw error;
        setPosts(prev => [data, ...prev]);
        toast.success('Post created successfully!');
      }

      resetForm();
      setSelectedTab('posts');
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post');
    }
  };

  const deletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', postId);

        if (error) throw error;
        setPosts(prev => prev.filter(p => p.id !== postId));
        toast.success('Post deleted successfully!');
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post');
      }
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle>Blog Admin Access</CardTitle>
            <CardDescription>Enter the admin password to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter admin password"
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                <Unlock className="mr-2 h-4 w-4" />
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Administration</h1>
            <p className="text-gray-600">Manage your blog posts and content</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <Lock className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Posts Management */}
          <TabsContent value="posts" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => {
                resetForm();
                setSelectedTab('editor');
              }}>
                <Plus className="mr-2 h-4 w-4" />
                New Post
              </Button>
            </div>

            <div className="grid gap-6">
              {filteredPosts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-gray-500">No posts found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredPosts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{post.category}</Badge>
                            {post.is_featured && <Badge variant="default">Featured</Badge>}
                            <Badge variant={post.published ? "default" : "secondary"}>
                              {post.published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>By {post.author_name}</span>
                            <span>{post.reading_time} min read</span>
                            <div className="flex gap-2">
                              {post.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => editPost(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deletePost(post.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Blog Editor */}
          <TabsContent value="editor" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {isEditing ? 'Edit Post' : 'Create New Post'}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={savePost}>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update' : 'Save'} Post
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Editor */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                        placeholder="Enter post title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleFormChange('slug', e.target.value)}
                        placeholder="post-url-slug"
                      />
                    </div>

                    <div>
                      <Label htmlFor="excerpt">Excerpt *</Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => handleFormChange('excerpt', e.target.value)}
                        placeholder="Brief description of the post"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="content">Content *</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => handleFormChange('content', e.target.value)}
                        placeholder="Write your blog post content in HTML"
                        rows={20}
                        className="font-mono"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* SEO Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Settings</CardTitle>
                    <CardDescription>Optimize your post for search engines</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="meta_title">Meta Title</Label>
                      <Input
                        id="meta_title"
                        value={formData.meta_title}
                        onChange={(e) => handleFormChange('meta_title', e.target.value)}
                        placeholder="SEO title for search engines"
                      />
                    </div>

                    <div>
                      <Label htmlFor="meta_description">Meta Description</Label>
                      <Textarea
                        id="meta_description"
                        value={formData.meta_description}
                        onChange={(e) => handleFormChange('meta_description', e.target.value)}
                        placeholder="SEO description for search engines (150-160 characters)"
                        rows={3}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {formData.meta_description.length}/160 characters
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Publish Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Publish</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="published">Published</Label>
                      <Switch
                        id="published"
                        checked={formData.published}
                        onCheckedChange={(checked) => handleFormChange('published', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="featured">Featured</Label>
                      <Switch
                        id="featured"
                        checked={formData.is_featured}
                        onCheckedChange={(checked) => handleFormChange('is_featured', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Post Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Post Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => handleFormChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="reading_time">Reading Time (minutes)</Label>
                      <Input
                        id="reading_time"
                        type="number"
                        value={formData.reading_time}
                        onChange={(e) => handleFormChange('reading_time', parseInt(e.target.value) || 0)}
                        min="1"
                        max="60"
                      />
                    </div>

                    <div>
                      <Label htmlFor="author_name">Author Name</Label>
                      <Input
                        id="author_name"
                        value={formData.author_name}
                        onChange={(e) => handleFormChange('author_name', e.target.value)}
                        placeholder="Author name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="featured_image">Featured Image</Label>
                      <div className="space-y-3">
                        {formData.featured_image && (
                          <div className="relative">
                            <img 
                              src={formData.featured_image} 
                              alt="Featured" 
                              className="w-full h-32 object-cover rounded-md border"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2"
                              onClick={() => handleFormChange('featured_image', '')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="flex flex-col gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                            disabled={isUploading}
                          />
                                                     <Button
                             variant="outline"
                             onClick={() => document.getElementById('image-upload')?.click()}
                             disabled={isUploading}
                             className="w-full"
                           >
                             {isUploading ? (
                               'Uploading...'
                             ) : (
                               <>
                                 <Upload className="mr-2 h-4 w-4" />
                                 Upload Image
                               </>
                             )}
                           </Button>
                          <Input
                            value={formData.featured_image}
                            onChange={(e) => handleFormChange('featured_image', e.target.value)}
                            placeholder="Or paste image URL"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag"
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button size="sm" onClick={addTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer">
                          {tag}
                          <X 
                            className="ml-1 h-3 w-3" 
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Blog Analytics</CardTitle>
                <CardDescription>Overview of your blog performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{posts.length}</div>
                    <div className="text-sm text-gray-500">Total Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{posts.filter(p => p.published).length}</div>
                    <div className="text-sm text-gray-500">Published</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{posts.filter(p => !p.published).length}</div>
                    <div className="text-sm text-gray-500">Drafts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{posts.filter(p => p.is_featured).length}</div>
                    <div className="text-sm text-gray-500">Featured</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Analytics and activity tracking would be implemented here in production.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default BlogAdminPage; 