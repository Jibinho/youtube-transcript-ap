const express = require('express');
const cors = require('cors');
const { YouTubeTranscript } = require('youtube-transcript');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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
    res.status(500).send('Erreur lors de la récupération de la transcription.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
