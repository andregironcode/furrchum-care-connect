-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_name TEXT NOT NULL DEFAULT 'FurrChum Team',
  author_avatar TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'Pet Care',
  reading_time INTEGER NOT NULL DEFAULT 5,
  published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_blog_posts_updated_at 
  BEFORE UPDATE ON blog_posts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_blog_post_views(post_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE blog_posts 
  SET view_count = view_count + 1 
  WHERE slug = post_slug AND published = true;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_posts
-- Public can read published posts
CREATE POLICY "Anyone can view published blog posts" ON blog_posts
  FOR SELECT USING (published = true);

-- Only authenticated users can insert/update/delete (for admin functionality)
-- In production, you might want to restrict this to specific roles
CREATE POLICY "Authenticated users can manage blog posts" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample blog posts
INSERT INTO blog_posts (
  title, 
  slug, 
  excerpt, 
  content, 
  featured_image, 
  author_name, 
  author_avatar, 
  tags, 
  category, 
  reading_time, 
  published, 
  is_featured, 
  meta_title, 
  meta_description
) VALUES 
(
  'Essential Pet Care Tips for New Pet Owners',
  'essential-pet-care-tips-new-owners',
  'Learn the fundamental aspects of pet care that every new pet owner should know to keep their furry friends healthy and happy.',
  '<h2>Getting Started with Pet Care</h2>
<p>Bringing a new pet home is an exciting experience, but it also comes with important responsibilities. Here are the essential tips every new pet owner should know:</p>

<h3>1. Regular Veterinary Check-ups</h3>
<p>Schedule regular check-ups with a qualified veterinarian to ensure your pet stays healthy. Preventive care is always better than reactive treatment.</p>

<h3>2. Proper Nutrition</h3>
<p>Feed your pet high-quality food appropriate for their age, size, and breed. Consult with your vet about the best diet plan.</p>

<h3>3. Exercise and Mental Stimulation</h3>
<p>Regular exercise and mental stimulation are crucial for your pet''s physical and mental well-being.</p>

<h3>4. Grooming and Hygiene</h3>
<p>Maintain proper grooming routines including regular baths, nail trims, and dental care.</p>

<h3>5. Creating a Safe Environment</h3>
<p>Pet-proof your home by removing hazardous items and creating a comfortable space for your pet.</p>',
  '/lovable-uploads/20250522_1312_Sunny Balcony Hug_simple_compose_01jvvf2jcffmhsv7cy9j1pb64z.png',
  'Dr. Sarah Johnson',
  '/lovable-uploads/d90a72b9-e0fd-4086-9692-b3c0a15463a7.png',
  ARRAY['pet care', 'new owners', 'health', 'veterinary'],
  'Pet Care',
  5,
  true,
  true,
  'Essential Pet Care Tips for New Pet Owners | FurrChum Blog',
  'Learn fundamental pet care tips for new owners including veterinary care, nutrition, exercise, and grooming.'
),
(
  'Understanding Your Pet''s Behavior',
  'understanding-pet-behavior',
  'Decode your pet''s behavior patterns and learn how to respond appropriately to their needs and emotions.',
  '<h2>Reading Your Pet''s Body Language</h2>
<p>Understanding your pet''s behavior is key to building a strong bond and ensuring their well-being.</p>

<h3>Common Behavioral Signs</h3>
<ul>
  <li><strong>Tail wagging:</strong> Not always a sign of happiness in dogs - context matters</li>
  <li><strong>Purring:</strong> Usually contentment in cats, but can indicate stress or pain</li>
  <li><strong>Hiding:</strong> Often a sign of stress, illness, or need for quiet time</li>
  <li><strong>Excessive vocalization:</strong> May indicate anxiety, attention-seeking, or medical issues</li>
</ul>

<h3>When to Seek Professional Help</h3>
<p>If you notice sudden behavioral changes, aggression, or signs of distress, consult with a veterinarian or certified animal behaviorist.</p>

<h3>Building Trust and Communication</h3>
<p>Consistent routines, positive reinforcement, and patience are key to developing a strong relationship with your pet.</p>',
  '/lovable-uploads/42e2d7bd-3440-457d-8a1e-fcd08a2d4014.png',
  'Dr. Michael Chen',
  '/lovable-uploads/f1cfd8b6-2fe1-42e8-bfa4-ea65c031203f.png',
  ARRAY['behavior', 'training', 'communication', 'psychology'],
  'Training',
  7,
  true,
  true,
  'Understanding Your Pet''s Behavior | FurrChum Blog',
  'Learn to decode your pet''s behavior patterns and understand their needs and emotions.'
),
(
  'Emergency Pet Care: What Every Owner Should Know',
  'emergency-pet-care-guide',
  'Essential knowledge for handling pet emergencies, from first aid basics to knowing when to seek immediate veterinary care.',
  '<h2>Pet Emergency Preparedness</h2>
<p>Being prepared for pet emergencies can save your pet''s life. Here''s what you need to know:</p>

<h3>Common Pet Emergencies</h3>
<ul>
  <li>Choking or difficulty breathing</li>
  <li>Severe bleeding or wounds</li>
  <li>Ingestion of toxic substances</li>
  <li>Seizures or loss of consciousness</li>
  <li>Trauma from accidents</li>
  <li>Heat stroke or hypothermia</li>
  <li>Severe vomiting or diarrhea</li>
</ul>

<h3>First Aid Kit Essentials</h3>
<p>Keep a well-stocked first aid kit specifically for your pet, including:</p>
<ul>
  <li>Bandages and gauze pads</li>
  <li>Antiseptic solution</li>
  <li>Digital thermometer</li>
  <li>Emergency contact numbers</li>
  <li>Muzzle (even friendly pets may bite when in pain)</li>
</ul>

<h3>When to Contact Emergency Services</h3>
<p>Don''t hesitate to contact emergency veterinary services if you''re unsure about your pet''s condition. It''s always better to be safe than sorry.</p>',
  '/lovable-uploads/020d6fdc-02f4-4190-acb2-59288e109f8d.png',
  'Dr. Emily Rodriguez',
  '/lovable-uploads/d90a72b9-e0fd-4086-9692-b3c0a15463a7.png',
  ARRAY['emergency', 'first aid', 'safety', 'health'],
  'Emergency Care',
  8,
  true,
  false,
  'Emergency Pet Care Guide | FurrChum Blog',
  'Learn essential emergency pet care skills including first aid, common emergencies, and when to seek help.'
),
(
  'Nutrition Guidelines for Different Life Stages',
  'pet-nutrition-life-stages',
  'Comprehensive guide to feeding your pet properly throughout their life, from puppyhood to senior years.',
  '<h2>Feeding Your Pet Through Life''s Stages</h2>
<p>Your pet''s nutritional needs change as they age. Here''s how to provide the best nutrition at every stage:</p>

<h3>Puppy/Kitten Stage (0-12 months)</h3>
<ul>
  <li>High-calorie, nutrient-dense food for growth</li>
  <li>Frequent small meals (3-4 times daily)</li>
  <li>Specific puppy/kitten formulations</li>
</ul>

<h3>Adult Stage (1-7 years)</h3>
<ul>
  <li>Balanced maintenance diet</li>
  <li>2 meals per day for most pets</li>
  <li>Monitor weight and adjust portions</li>
</ul>

<h3>Senior Stage (7+ years)</h3>
<ul>
  <li>Senior-specific formulations</li>
  <li>May need joint support supplements</li>
  <li>Easier to digest proteins</li>
</ul>

<h3>Special Dietary Considerations</h3>
<p>Some pets may require special diets due to allergies, medical conditions, or breed-specific needs. Always consult with your veterinarian before making significant dietary changes.</p>',
  '/lovable-uploads/20250529_2323_Tech-Savvy Pet Care_simple_compose_01jwejr4z1fahspey6bw5kctvm.png',
  'Dr. Sarah Johnson',
  '/lovable-uploads/d90a72b9-e0fd-4086-9692-b3c0a15463a7.png',
  ARRAY['nutrition', 'diet', 'health', 'life stages'],
  'Nutrition',
  6,
  true,
  false,
  'Pet Nutrition Guidelines for Different Life Stages | FurrChum Blog',
  'Complete guide to feeding your pet properly throughout their life stages, from puppy to senior years.'
);

-- Grant necessary permissions
GRANT ALL ON blog_posts TO authenticated;
GRANT SELECT ON blog_posts TO anon; 