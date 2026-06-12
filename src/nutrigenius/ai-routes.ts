import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";
import { readEnv } from '../../env.js';

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Gemini Init
const apiKey = readEnv('GEMINI_API_KEY');
const textModel = readEnv('GEMINI_TEXT_MODEL', 'gemini-2.5-flash');
const visionModel = readEnv('GEMINI_VISION_MODEL', 'gemini-2.5-flash');
const ai = new GoogleGenAI({ apiKey });

const ALLERGY_ALIASES: Record<string, string[]> = {
  peanut: ['peanut', 'peanuts', 'kacang', 'kacang tanah', 'saus kacang'],
  egg: ['egg', 'eggs', 'telur'],
  fish: ['fish', 'ikan', 'seafood', 'salmon', 'tuna', 'udang'],
  soy: ['soy', 'kedelai', 'tempe', 'tahu', 'tofu', 'soya'],
  mushroom: ['mushroom', 'jamur'],
  dairy: ['dairy', 'milk', 'susu', 'keju', 'yogurt'],
  gluten: ['gluten', 'gandum', 'terigu', 'mie', 'pasta', 'bread', 'roti']
};

const MENU_NAME_TRANSLATIONS: Record<string, string> = {
  'Salmon Quinoa Bowl': 'Bowl Quinoa Salmon Panggang',
  'Dada Ayam Brokoli Steam': 'Dada Ayam Kukus Brokoli'
};

const normalizeText = (value: unknown) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const parseJsonArray = (value: unknown) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [trimmed];
  } catch {
    return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  }
};

const extractAllergyTokens = (input: unknown) => {
  const combined = Array.isArray(input) ? input.join(', ') : String(input || '');
  const normalized = normalizeText(combined);
  if (!normalized) return [];

  const tokens = new Set<string>();
  for (const [canonical, aliases] of Object.entries(ALLERGY_ALIASES)) {
    const matched = aliases.some((alias) => normalized.includes(normalizeText(alias)));
    if (matched) tokens.add(canonical);
  }

  return Array.from(tokens);
};

const inferMenuAllergens = (menu: any) => {
  const explicitAllergens = parseJsonArray(menu?.allergens).map(normalizeText);
  const text = normalizeText(`${menu?.name || ''} ${menu?.description || ''}`);
  const allergens = new Set<string>();

  for (const [canonical, aliases] of Object.entries(ALLERGY_ALIASES)) {
    if (explicitAllergens.includes(canonical)) {
      allergens.add(canonical);
      continue;
    }

    if (aliases.some((alias) => text.includes(normalizeText(alias)))) {
      allergens.add(canonical);
    }
  }

  return Array.from(allergens);
};

const localizeMenuName = (name: string) => MENU_NAME_TRANSLATIONS[name] || name;

const activityMultiplierMap: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725
};

const calculateNutritionTargets = (userProfile: any) => {
  const height = Number(userProfile?.height || 170);
  const weight = Number(userProfile?.weight || 65);
  const activityMultiplier = activityMultiplierMap[userProfile?.activity_level] || 1.2;

  // Estimasi umum untuk dewasa muda ketika usia dan jenis kelamin belum tersedia.
  const bmr = Math.round((10 * weight) + (6.25 * height) - (5 * 25));
  const tdee = Math.round(bmr * activityMultiplier);

  let calories = tdee;
  let proteinMultiplier = 1.8;
  let fatsRatio = 0.25;

  if (userProfile?.health_goal === 'diet') {
    calories = tdee - 300;
    proteinMultiplier = 2;
    fatsRatio = 0.3;
  } else if (userProfile?.health_goal === 'bulking') {
    calories = tdee + 250;
    proteinMultiplier = 2.2;
    fatsRatio = 0.3;
  }

  const protein = Math.round(weight * proteinMultiplier);
  const fats = Math.round((calories * fatsRatio) / 9);
  const carbs = Math.max(0, Math.round((calories - (protein * 4) - (fats * 9)) / 4));

  return {
    bmr,
    tdee,
    macroTargets: {
      calories,
      protein,
      carbs,
      fats,
    }
  };
};

const scoreMenu = (menu: any, healthGoal: string) => {
  const calories = Number(menu?.calories || 0);
  const protein = Number(menu?.protein || 0);
  const carbs = Number(menu?.carbs || 0);
  const fats = Number(menu?.fats || 0);

  if (healthGoal === 'diet') {
    return (protein * 3) + carbs - (calories * 0.12) - (fats * 0.6);
  }

  if (healthGoal === 'bulking') {
    return (protein * 2.8) + (carbs * 1.6) + (calories * 0.08) - (fats * 0.1);
  }

  return (protein * 2.4) + (carbs * 1.1) - Math.abs(calories - 430) * 0.08 - (fats * 0.2);
};

const buildFallbackRecommendations = (userProfile: any, menus: any[], blockedAllergies: string[]) => {
  const nutrition = calculateNutritionTargets(userProfile);
  const sortedMenus = [...menus]
    .sort((a, b) => scoreMenu(b, userProfile?.health_goal) - scoreMenu(a, userProfile?.health_goal))
    .slice(0, 3)
    .map((menu) => ({
      id: menu.id,
      menuName: localizeMenuName(menu.name),
      reason: `Cocok untuk target ${userProfile?.health_goal || 'harian'} karena memberi sekitar ${menu.protein || 0} g protein, ${menu.carbs || 0} g karbohidrat, dan ${menu.calories || 0} kkal per porsi.`
    }));

  const allergySummary = blockedAllergies.length
    ? `Menu sudah disaring agar menghindari alergen: ${blockedAllergies.join(', ')}.`
    : 'Tidak ada alergi yang tercatat, jadi rekomendasi difokuskan pada target gizi harian Anda.';

  return {
    summary: `Strategi nutrisi Anda difokuskan pada target ${userProfile?.health_goal || 'maintenance'} dengan target asupan kalori harian ${nutrition.macroTargets.calories} kkal, protein ${nutrition.macroTargets.protein} g, karbohidrat ${nutrition.macroTargets.carbs} g, dan lemak ${nutrition.macroTargets.fats} g. ${allergySummary}`,
    bmr: nutrition.bmr,
    tdee: nutrition.tdee,
    macroTargets: nutrition.macroTargets,
    recommendedMenus: sortedMenus
  };
};

const sanitizeRecommendations = (recommendedMenus: any[], safeMenus: any[]) => {
  const safeMenuMap = new Map(safeMenus.map((menu) => [Number(menu.id), menu]));
  const usedIds = new Set<number>();

  return (Array.isArray(recommendedMenus) ? recommendedMenus : [])
    .map((menu) => {
      const matchedMenu = safeMenuMap.get(Number(menu?.id));
      if (!matchedMenu) return null;
      if (usedIds.has(matchedMenu.id)) return null;
      usedIds.add(matchedMenu.id);

      return {
        id: matchedMenu.id,
        menuName: menu?.menuName || localizeMenuName(matchedMenu.name),
        reason: menu?.reason || `Pilihan aman yang selaras dengan kebutuhan makro harian Anda.`
      };
    })
    .filter(Boolean);
};

/**
 * Endpoint 1: POST /api/ai/recommend-menu
 * Calculates TDEE/Macros and recommends menus using Gemini 3.1 Pro
 */
router.post('/recommend-menu', async (req, res) => {
  const { userProfile, menuDatabase } = req.body;

  if (!userProfile || !menuDatabase) {
    return res.status(400).json({ error: 'User profile and menu database are required.' });
  }

  const blockedAllergies = extractAllergyTokens(userProfile?.allergies);
  const safeMenus = menuDatabase.filter((menu: any) => {
    const menuAllergens = inferMenuAllergens(menu);
    return !menuAllergens.some((allergen) => blockedAllergies.includes(allergen));
  });

  const candidateMenus = safeMenus.length > 0 ? safeMenus : menuDatabase;
  const fallbackResponse = buildFallbackRecommendations(userProfile, candidateMenus, blockedAllergies);

  if (blockedAllergies.length > 0 && safeMenus.length === 0) {
    return res.json({
      ...fallbackResponse,
      summary: `Belum ada menu yang benar-benar aman untuk alergi ${blockedAllergies.join(', ')}. ${fallbackResponse.summary}`,
      recommendedMenus: []
    });
  }
  if (!apiKey) {
    return res.json(fallbackResponse);
  }

  try {
    const prompt = `
      Anda adalah Asisten Ahli Gizi profesional. 
      Tugas Anda adalah menganalisis biometrik dan tujuan pengguna, menghitung kebutuhan gizi HARIAN, lalu merekomendasikan menu terbaik dari database katering kami.

      PROFIL PENGGUNA:
      - Tinggi: ${userProfile.height} cm
      - Berat: ${userProfile.weight} kg
      - Level Aktivitas: ${userProfile.activity_level}
      - Tujuan: ${userProfile.health_goal}
      - Alergi: ${userProfile.allergies || 'Tidak ada'}

      DATABASE KATERING YANG AMAN UNTUK PENGGUNA:
      ${JSON.stringify(candidateMenus)}

      INSTRUKSI:
      1. Hitung BMR dan TDEE dengan rumus Mifflin-St Jeor.
      2. Tentukan target makro HARIAN (Protein, Karbohidrat, Lemak) dalam gram.
      3. Rekomendasikan maksimal 3 menu dari database yang sesuai profil.
      4. HINDARI menu yang mengandung alergen pengguna.
      5. Tulis SEMUA output dalam Bahasa Indonesia, termasuk nama menu yang dilokalkan bila aslinya berbahasa Inggris.
      6. Untuk setiap menu, isi "menuName" dengan nama makanan dalam Bahasa Indonesia.
      7. Beri ringkasan singkat dalam Bahasa Indonesia yang fokus pada kebutuhan gizi 1 hari.
    `;

    const response = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Nutrition strategy summary" },
            bmr: { type: Type.NUMBER },
            tdee: { type: Type.NUMBER },
            macroTargets: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fats: { type: Type.NUMBER },
              },
              required: ["calories", "protein", "carbs", "fats"]
            },
            recommendedMenus: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  menuName: { type: Type.STRING, description: "Nama menu dalam Bahasa Indonesia" },
                  reason: { type: Type.STRING, description: "Why this meal is recommended" }
                },
                required: ["id", "menuName", "reason"]
              }
            }
          },
          required: ["summary", "bmr", "tdee", "macroTargets", "recommendedMenus"]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text);
    const sanitizedMenus = sanitizeRecommendations(parsedResponse?.recommendedMenus, candidateMenus);

    res.json({
      ...fallbackResponse,
      ...parsedResponse,
      recommendedMenus: sanitizedMenus.length > 0 ? sanitizedMenus : fallbackResponse.recommendedMenus
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('AI Recommendation Error:', message);
    res.json(fallbackResponse);
  }
});

/**
 * Endpoint 2: POST /api/ai/scan-food
 * Analyzes food images using Gemini 3 Flash (Vision)
 */
router.post('/scan-food', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided.' });
  }
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
  }

  try {
    const base64Data = req.file.buffer.toString('base64');
    
    const response = await ai.models.generateContent({
      model: visionModel,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: req.file.mimetype } },
          { text: "Analisis gambar makanan ini. Identifikasi nama makanan dan estimasi Kalori, Protein, Karbohidrat, dan Lemak untuk 1 porsi standar. Output ONLY JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            food_name: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fats: { type: Type.NUMBER }
          },
          required: ["food_name", "calories", "protein", "carbs", "fats"]
        }
      }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('AI Vision Error:', message);
    res.status(500).json({ error: message || 'Failed to analyze image with AI.' });
  }
});

export default router;
