/*
   हेल्दी गुड्स (Healthy Goods) - Supabase SQL Schema
   Run these queries in your Supabase SQL Editor.
*/

-- 1. Users table (Handled by Supabase Auth but we create a custom table for profiles)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  is_premium BOOLEAN DEFAULT FALSE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);


-- 2. Health Profiles table
CREATE TABLE IF NOT EXISTS health_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  height NUMERIC,
  weight NUMERIC,
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active')),
  health_goal TEXT CHECK (health_goal IN ('diet', 'bulking', 'maintenance')),
  allergies JSONB DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for health_profiles
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own health profile" ON health_profiles 
FOR ALL USING (auth.uid() = user_id);


-- 3. Menus table
CREATE TABLE IF NOT EXISTS menus (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fats INTEGER,
  price INTEGER DEFAULT 26000,
  allergens JSONB DEFAULT '[]',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allow public read for menus
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view menus" ON menus FOR SELECT USING (true);


-- 4. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  total_price INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'delivered'
  delivery_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);


-- SEED DATA for Menus
INSERT INTO menus (name, description, calories, protein, carbs, fats, price, allergens, image_url)
VALUES 
('Nasi Merah Ayam Bakar', 'Nasi merah dengan ayam bakar rempah, tempe bacem, dan sayur urap.', 450, 30, 55, 12, 26000, '["soy"]', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'),
('Salmon Quinoa Bowl', 'Salmon panggang dengan quinoa, alpukat, dan bayam Jepang.', 520, 35, 45, 18, 26000, '["fish"]', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288'),
('Dada Ayam Brokoli Steam', 'Fillet dada ayam kukus dengan brokoli dan wortel madu.', 380, 40, 30, 8, 26000, '[]', 'https://images.unsplash.com/photo-1432139555190-58524dae6a55'),
('Gado-Gado Diet', 'Sayuran segar dengan saus kacang rendah lemak dan telur rebus.', 320, 15, 35, 14, 26000, '["peanut", "egg"]', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd'),
('Steak Tempe Jamur', 'Steak tempe homemade dengan saus mushroom dan salad jagung.', 350, 20, 40, 10, 26000, '["soy", "mushroom"]', 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6');
