import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Gemini Init
const apiKey = process.env.GEMINI_API_KEY || '';
const textModel = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
const visionModel = process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash';
const ai = new GoogleGenAI({ apiKey });

/**
 * Endpoint 1: POST /api/ai/recommend-menu
 * Calculates TDEE/Macros and recommends menus using Gemini 3.1 Pro
 */
router.post('/recommend-menu', async (req, res) => {
  const { userProfile, menuDatabase } = req.body;

  if (!userProfile || !menuDatabase) {
    return res.status(400).json({ error: 'User profile and menu database are required.' });
  }
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
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

      DATABASE KATERING:
      ${JSON.stringify(menuDatabase)}

      INSTRUKSI:
      1. Hitung BMR dan TDEE dengan rumus Mifflin-St Jeor.
      2. Tentukan target makro HARIAN (Protein, Karbohidrat, Lemak) dalam gram.
      3. Rekomendasikan tepat 3 menu dari database yang sesuai profil.
      4. HINDARI menu yang mengandung alergen pengguna.
      5. Beri ringkasan singkat dalam Bahasa Indonesia yang fokus pada kebutuhan gizi 1 hari.
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
                  reason: { type: Type.STRING, description: "Why this meal is recommended" }
                },
                required: ["id", "reason"]
              }
            }
          },
          required: ["summary", "bmr", "tdee", "macroTargets", "recommendedMenus"]
        }
      }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('AI Recommendation Error:', message);
    res.status(500).json({ error: message || 'Failed to generate AI recommendations.' });
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
