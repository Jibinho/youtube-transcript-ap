const express = require('express');
const cors = require('cors');
const YouTubeTranscript = require('youtube-transcript').YouTubeTranscript;
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Route racine pour éviter l'erreur "Cannot GET /"
app.get('/', (req, res) => {
  res.send('API YouTube Transcript - Utilise /transcript?url=LIEN_YOUTUBE');
});

// Remplace par ta clé API Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Endpoint pour extraire la transcription
app.get('/transcript', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).send('URL YouTube manquante.');
    }

    const videoId = url.split('v=')[1].split('&')[0];
    const transcript = await YouTubeTranscript.fetchTranscript(videoId);

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `
      Nettoie cette transcription YouTube en markdown avec timestamps cliquables :
      ${JSON.stringify(transcript)}
    `;

    const result = await model.generateContent(prompt);
    const cleanedTranscript = result.response.text();

    res.set('Content-Type', 'text/plain');
    res.send(cleanedTranscript);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Erreur détaillée : ${error.message}`);
  }
});

// Export pour Vercel
module.exports = app;
