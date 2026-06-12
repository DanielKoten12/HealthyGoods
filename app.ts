import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import aiRouter from './src/nutrigenius/ai-routes';

dotenv.config();

const app = express();

// Supabase Init
let supabase: any;
try {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_KEY || '';
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
} catch (e) {
  console.error('Supabase initialization failed:', e);
}

// Helper to check Supabase
const checkSupabase = (res: any) => {
  if (!supabase) {
    res.status(500).json({ error: 'Supabase is not configured. Please add SUPABASE_URL and SUPABASE_KEY to Secrets.' });
    return false;
  }
  return true;
};

// Gemini Init
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

app.use(cors());
app.use(express.json());

// Main AI Routes
app.use('/api/ai', aiRouter);

// API Routes
app.post('/api/auth/register', async (req, res) => {
  if (!checkSupabase(res)) return;
  const { email, password, name } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  if (data.user) {
    const { error: dbError } = await supabase
      .from('users')
      .insert([{ id: data.user.id, email, name }]);

    if (dbError) console.error('DB Error:', dbError);
  }

  res.json({ message: 'Registration successful', data });
});

app.post('/api/auth/login', async (req, res) => {
  if (!checkSupabase(res)) return;
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: 'Login successful', data });
});

app.get('/api/menus', async (_req, res) => {
  if (!checkSupabase(res)) return;
  const { data, error } = await supabase
    .from('menus')
    .select('*');

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post('/api/profile', async (req, res) => {
  if (!checkSupabase(res)) return;
  const { userId, height, weight, activity_level, health_goal, allergies, subscription_tier } = req.body;

  const { error: profileError } = await supabase
    .from('health_profiles')
    .upsert({
      user_id: userId,
      height,
      weight,
      activity_level,
      health_goal,
      allergies
    });

  if (profileError) return res.status(400).json({ error: profileError.message });

  if (subscription_tier) {
    await supabase
      .from('users')
      .update({ is_premium: true, subscription_tier })
      .eq('id', userId);
  }

  res.json({ message: 'Profile updated successfully' });
});

app.get('/api/recommendations', async (req, res) => {
  if (!checkSupabase(res)) return;
  const userId = req.query.userId as string;

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('is_premium, subscription_tier')
    .eq('id', userId)
    .single();

  if (userError || !user) return res.status(404).json({ error: 'User not found' });

  const allowedTiers = ['monthly', 'yearly'];
  if (!user.is_premium || !allowedTiers.includes(user.subscription_tier)) {
    return res.status(403).json({ error: 'Access Denied: Monthly subscription required for NutriGenius AI.' });
  }

  const { data: profile, error: profileError } = await supabase
    .from('health_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (profileError || !profile) {
    return res.status(400).json({ error: 'Profile not found. Please complete your health questionnaire first.' });
  }

  const { data: menus, error: menusError } = await supabase
    .from('menus')
    .select('*');

  if (menusError) return res.status(400).json({ error: menusError.message });

  const prompt = `
    You are a professional nutritionist for "Healthy Goods" catering.
    User Data:
    - Height: ${profile.height} cm
    - Weight: ${profile.weight} kg
    - Activity Level: ${profile.activity_level}
    - Health Goal: ${profile.health_goal}
    - Allergies: ${JSON.stringify(profile.allergies)}

    Catering Menus Available:
    ${JSON.stringify(menus)}

    Tasks:
    1. Calculate daily calorie needs (TDEE) and macronutrient targets (Protein, Carbs, Fats) based on the user data.
    2. Recommend 3 menus from the list that best fit their goals and avoid their allergies.
    3. Return the response ONLY in JSON format like this:
    {
      "summary": "AI Nutritionist summary about user needs",
      "macroTargets": { "calories": 0, "protein": 0, "carbs": 0, "fats": 0 },
      "recommendedMenus": [
         { "id": 1, "reason": "Why this menu is good for the user" }
      ]
    }
  `;

  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const aiResponse = JSON.parse(result.text || '{}');
    res.json(aiResponse);
  } catch (err) {
    console.error('Gemini Error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default app;
