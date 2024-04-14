const express = require('express');
// const openai = require('openai');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config()

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware to parse JSON bodies
app.use(express.json());

async function searchVideos(keyword, maxResults = 5) {
    // Replace with your YouTube Data API v3 key
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
        console.log(results)
        return results

    } catch (error) {
        console.error('Error searching YouTube:', error);
    }
}

// Route to handle incoming text for video recommendations
app.post('/recommendations', async (req, res) => {
    try {
        const userInput = req.body.usertext;

        // For text-only input, use the gemini-pro model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `Given the input ${userInput}, generate keywords that are highly relevant to YouTube video recommendations using the YouTube Data API.`

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(text);


        videoRecommendations = searchVideos(text)
            .then(data => {
                console.log(JSON.stringify(data, null, 2))
                return JSON.stringify(data, null, 2)
            })
            .catch(error => {
                console.error(error)
                return { "err": "Something went wrong, Please Try again later" }
            });


        res.json({ videoRecommendations });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
