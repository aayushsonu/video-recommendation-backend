var cors = require('cors')
const express = require('express');
const { google } = require('googleapis');
const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors())
app.use(express.json());

async function searchVideos(keyword, maxResults = 6) {
    const youtube = google.youtube({
        version: 'v3',
        auth: process.env.YOUTUBE_DATA_API
    });

    const params = {
        part: 'snippet',
        q: keyword,
        maxResults: maxResults
    };

    try {
        const response = await youtube.search.list(params);
        const results = response.data.items;
        console.log(`Found ${results.length} videos for "${keyword}"`);
        return results;
    } catch (error) {
        console.error('Error searching YouTube:', error);
        throw error; // Propagate the error
    }
}

app.post('/api/v1/recommendations', async (req, res) => {
    try {
        const userInput = req.body.usertext;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log(userInput)
        const prompt = `Based on the user input "${userInput}", recommend relevant YouTube video keywords only using the YouTube Data API in only 10 words, no more text`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log(text)

        const videoRecommendations = await searchVideos(text);
        console.log(JSON.stringify(videoRecommendations, null, 2));
        res.json({ videoRecommendations });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
