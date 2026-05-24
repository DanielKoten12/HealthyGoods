import express from 'express';
import multer from 'multer';
import { GoogleGenAI, Type } from "@google/genai";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Gemini Init
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

/**
 * Endpoint 1: POST /api/ai/recommend-menu
 * Calculates TDEE/Macros and recommends menus using Gemini 3.1 Pro
 */
router.post('/recommend-menu', async (req, res) => {
  const { userProfile, menuDatabase } = req.body;

  if (!userProfile || !menuDatabase) {
    return res.status(400).json({ error: 'User profile and menu database are required.' });
  }

  try {
    const prompt = `
      You are an Expert Dietitian AI Assistant. 
      Your task is to analyze the user's biometrics and goals, calculate their nutritional needs, and recommend the best meals from our catering database.

      USER PROFILE:
      - Height: ${userProfile.height} cm
      - Weight: ${userProfile.weight} kg
      - Activity Level: ${userProfile.activity_level}
      - Health Goal: ${userProfile.health_goal}
      - Allergies: ${userProfile.allergies || 'None'}

      CATERING DATABASE:
      ${JSON.stringify(menuDatabase)}

      INSTRUCTIONS:
      1. Calculate BMR and TDEE using Mifflin-St Jeor Equation.
      2. Determine Macro Targets (Protein, Carbs, Fats) in grams.
      3. Recommend exactly 3 meals from the database that fit the profile.
      4. EXCLUDE any meal containing ingredients the user is allergic to.
      5. Provide a short summary/strategy for the user.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
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
    console.error('AI Recommendation Error:', error);
    res.status(500).json({ error: 'Failed to generate AI recommendations.' });
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

  try {
    const base64Data = req.file.buffer.toString('base64');
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: req.file.mimetype } },
          { text: "Analyze this food image. Identify the food name and estimate Calories, Protein, Carbs, and Fats for a standard serving. Output ONLY JSON." }
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
    console.error('AI Vision Error:', error);
    res.status(500).json({ error: 'Failed to analyze image with AI.' });
  }
});

export default router;
