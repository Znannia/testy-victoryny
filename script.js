// script.js
const API_KEY = 'AIzaSyCsQ-lA5zK4THqs3C_1b_YASGHZ2lxnVNY'; // Замініть на ваш YouTube API-ключ
const CHANNEL_ID = 'UC0usNaN5iwML35qPxASBDWQ';

// Оновлення годинника і дати
function updateTime() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString('uk-UA');
    document.getElementById('date').textContent = now.toLocaleDateString('uk-UA');
}
setInterval(updateTime, 1000);
updateTime();

// Завантаження 3 останніх відео
async function fetchLatestVideos() {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=3&order=date&type=video&key=${API_KEY}`);
    const data = await response.json();
    const videos = data.items;
    const latestVideosDiv = document.getElementById('latest-videos');
    videos.forEach((video) => {
        const videoId = video.id.videoId;
        const title = video.snippet.title;
        const videoElement = document.createElement('div');
        videoElement.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${videoId}?rel=0" frameborder="0" allowfullscreen></iframe>
            <p>${title} <span class="new">Нове</span></p>
        `;
        latestVideosDiv.appendChild(videoElement);
    });
}
fetchLatestVideos();

// Плейлисти для випадкових відео
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

// Завантаження 9–15 випадкових відео (3 ряди мінімум)
async function fetchRandomVideos() {
    const randomVideosDiv = document.getElementById('random-videos');
    const videosToShow = [];
    const categories = Object.keys(playlistIds);

    // Завантажуємо відео з усіх плейлистів
    for (const category of categories) {
        const playlistId = playlistIds[category];
        const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${API_KEY}`);
        const data = await response.json();
        const items = data.items;
        if (items.length > 0) {
            const randomIndex = Math.floor(Math.random() * items.length);
            videosToShow.push(items[randomIndex]);
        }
    }

    // Доповнюємо до 9 відео, якщо не вистачає
    while (videosToShow.length < 9) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const playlistId = playlistIds[randomCategory];
        const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${API_KEY}`);
        const data = await response.json();
        const items = data.items;
        if (items.length > 0) {
            const randomIndex = Math.floor(Math.random() * items.length);
            videosToShow.push(items[randomIndex]);
        }
    }

    // Відображаємо відео
    videosToShow.forEach(video => {
        const videoId = video.snippet.resourceId.videoId;
        const title = video.snippet.title;
        const videoElement = document.createElement('div');
        videoElement.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${videoId}?rel=0" frameborder="0" allowfullscreen></iframe>
            <p>${title}</p>
        `;
        randomVideosDiv.appendChild(videoElement);
    });
}
fetchRandomVideos();

// Випадаючий список категорій у футері
document.getElementById('categories-btn').addEventListener('click', () => {
    const list = document.getElementById('categories-list');
    list.style.display = list.style.display === 'none' ? 'block' : 'none';
});
