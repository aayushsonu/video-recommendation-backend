const { google } = require('googleapis');

require('dotenv').config()

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

        results.forEach(result => {
            const videoId = result.id.videoId;
            const title = result.snippet.title;
            console.log(`  * [${title}](https://www.youtube.com/watch?v=${videoId})`);

        });

    } catch (error) {
        console.error('Error searching YouTube:', error);
    }
}

// Example usage
const keyword = 'cats';
searchVideos(keyword)
    .then(data => console.log(JSON.stringify(data, null, 2)))
    .catch(error => console.error(error));