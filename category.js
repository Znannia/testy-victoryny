// category.js
const API_KEY = 'AIzaSyCsQ-lA5zK4THqs3C_1b_YASGHZ2lxnVNY'; // Замініть на ваш YouTube API-ключ

// Отримання категорії з URL
const urlParams = new URLSearchParams(window.location.search);
const category = urlParams.get('category');
document.getElementById('category-title').textContent = category;

// Плейлисти
const playlistIds = {
    'Географія': 'PLOI77RmcxMp7iQywXcinPbgpl4kTXx_oV',
    'Історія': 'PLOI77RmcxMp57Hj3qFR8kv0D1rYs-MJNO',
    'Біблія': 'PLOI77RmcxMp6bsY12dqBZ9tdf-EMf6lpY',
    'Україна': 'PLOI77RmcxMp7umvhlyP8jIgvCk_9gKUFN',
    'Загальні знання': 'PLOI77RmcxMp40BcW7EImRhMEtLFieW9B7',
    'Логіка': 'PLOI77RmcxMp69eZQe-B51PXjk-hG123nE',
    'Що зайве': 'PLOI77RmcxMp6jhCedjZf7QYOscN3KuMIO',
    'Не програєш': 'PLOI77RmcxMp5FIXH2Z9OGFTEhrGQjBi_S',
};

const playlistId = playlistIds[category];

// Завантаження відео з плейлиста
async function fetchCategoryVideos() {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${API_KEY}`);
    const data = await response.json();
    const videos = data.items;
    const categoryVideosDiv = document.getElementById('category-videos');
    videos.forEach(video => {
        const videoId = video.snippet.resourceId.videoId;
        const title = video.snippet.title;
        const videoElement = document.createElement('div');
        videoElement.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${videoId}?rel=0" frameborder="0" allowfullscreen></iframe>
            <p>${title}</p>
        `;
        categoryVideosDiv.appendChild(videoElement);
    });
}
fetchCategoryVideos();
