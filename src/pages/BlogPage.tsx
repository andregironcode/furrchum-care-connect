import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Search, ArrowLeft, Share2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  created_at: string;
  meta_title: string | null;
  meta_description: string | null;
  is_featured: boolean;
  view_count: number;
  published: boolean;
  updated_at: string;
}

const BlogPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Pet Care', 'Veterinary Tips', 'Health & Wellness', 'Training', 'Nutrition', 'Emergency Care'];

  useEffect(() => {
    if (slug) {
      fetchSinglePost(slug);
    } else {
      fetchPosts();
    }
  }, [slug]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchSinglePost = async (postSlug: string) => {
    try {
      setLoading(true);
      
      // Increment view count
      await supabase.rpc('increment_blog_post_views', { post_slug: postSlug });
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', postSlug)
        .eq('published', true)
        .single();

      if (error) throw error;
      setCurrentPost(data);
      
              // Update page title and meta description for SEO
        if (data) {
          document.title = data.meta_title ?? data.title;
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription && data.meta_description) {
            metaDescription.setAttribute('content', data.meta_description);
          }
        }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      toast.error('Blog post not found');
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = posts.filter(post => post.is_featured).slice(0, 3);
  const recentPosts = posts.slice(0, 5);

  const handleShare = async (post: BlogPost) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: `${window.location.origin}/blog/${post.slug}`,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/blog/${post.slug}`);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // Single blog post view
  if (slug && currentPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/blog')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>

          <article className="bg-white rounded-lg shadow-lg overflow-hidden">
            {currentPost.featured_image && (
              <img
                src={currentPost.featured_image}
                alt={currentPost.title}
                className="w-full h-64 object-cover"
              />
            )}
            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="secondary">{currentPost.category}</Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 h-4 w-4" />
                  {format(parseISO(currentPost.created_at), 'MMM dd, yyyy')}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="mr-1 h-4 w-4" />
                  {currentPost.reading_time} min read
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {currentPost.title}
              </h1>

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={currentPost.author_avatar ?? undefined} />
                    <AvatarFallback>
                      {currentPost.author_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{currentPost.author_name}</p>
                    <p className="text-sm text-gray-500">{currentPost.view_count} views</p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handleShare(currentPost)}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>

              <Separator className="mb-8" />

              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: currentPost.content }}
              />

              {currentPost.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-lg font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentPost.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </main>
        <Footer />
      </div>
    );
  }

  // Blog listing view
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">FurrChum Blog</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Expert advice, tips, and insights for pet care, health, and well-being
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filter */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search blog posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Featured Posts */}
            {featuredPosts.length > 0 && searchTerm === '' && selectedCategory === 'all' && (
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Featured Posts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredPosts.map((post) => (
                    <Card 
                      key={post.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      {post.featured_image && (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-40 object-cover rounded-t-lg"
                        />
                      )}
                      <CardHeader>
                        <Badge variant="secondary" className="w-fit mb-2">
                          {post.category}
                        </Badge>
                        <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                        <CardDescription className="line-clamp-3">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{format(parseISO(post.created_at), 'MMM dd, yyyy')}</span>
                          <span>{post.reading_time} min read</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* All Posts */}
            <section>
              <h2 className="text-3xl font-bold mb-6">
                {searchTerm ? `Search Results (${filteredPosts.length})` : 'Latest Posts'}
              </h2>
              
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No blog posts found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredPosts.map((post) => (
                    <Card 
                      key={post.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      {post.featured_image && (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      )}
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">{post.category}</Badge>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="mr-1 h-4 w-4" />
                            {post.reading_time} min
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                        <CardDescription className="line-clamp-3">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={post.author_avatar ?? undefined} />
                              <AvatarFallback className="text-xs">
                                {post.author_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">{post.author_name}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {format(parseISO(post.created_at), 'MMM dd')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              {/* Recent Posts */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentPosts.map((post) => (
                    <div 
                      key={post.id}
                      className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      <h4 className="font-medium line-clamp-2 mb-1">{post.title}</h4>
                      <p className="text-sm text-gray-500">
                        {format(parseISO(post.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.filter(cat => cat !== 'all').map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded transition-colors ${
                          selectedCategory === category 
                            ? 'bg-primary text-white' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPage; 