const API_KEY = 'AIzaSyCILrgPfPm9NS6cgQHZhnXjcD7ab-GghDg'; // Залиште ваш API-ключ
const CHANNEL_ID = 'UC0usNaN5iwML35qPxASBDWQ';

// Оновлення годинника і дати
function updateTime() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString('uk-UA');
    document.getElementById('date').textContent = now.toLocaleDateString('uk-UA');
}
setInterval(updateTime, 1000);
updateTime();

// Функція для перевірки тривалості відео (виключаємо Shorts)
async function filterNonShorts(videoIds) {
    if (!videoIds.length) return [];
    const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(',')}&key=${API_KEY}`
    );
    if (!response.ok) {
        console.error('Помилка завантаження тривалості відео:', response.statusText);
        return videoIds; // Повертаємо всі ID, якщо не вдалося перевірити
    }
    const data = await response.json();
    const nonShorts = [];
    data.items.forEach((item, index) => {
        const duration = item.contentDetails.duration; // Формат: PT1M30S
        const durationSeconds = parseDuration(duration);
        if (durationSeconds >= 60) { // Виключаємо відео коротше 60 секунд
            nonShorts.push(videoIds[index]);
        }
    });
    return nonShorts;
}

// Функція для парсингу тривалості у секунди
function parseDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
}

// Функція для відображення відео (з обкладинками)
function renderVideos(videos, container, isLatest = false) {
    videos.forEach((video) => {
        const videoId = isLatest ? video.id.videoId : video.snippet.resourceId.videoId;
        const title = video.snippet.title;
        const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const videoElement = document.createElement('div');
        videoElement.innerHTML = `
            <div class="video-container">
                <img src="${thumbnail}" alt="${title}" class="thumbnail" data-video-id="${videoId}">
            </div>
            <p>${title}${isLatest ? ' <span class="new">Нове</span>' : ''}</p>
        `;
        container.appendChild(videoElement);
    });

    document.querySelectorAll('.thumbnail').forEach(thumbnail => {
        thumbnail.addEventListener('click', (e) => {
            const videoId = e.target.getAttribute('data-video-id');
            const container = e.target.parentElement;
            container.innerHTML = `
                <iframe src="https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1" frameborder="0" allowfullscreen></iframe>
            `;
        });
    });
}

// Завантаження 3 останніх відео з кешуванням
async function fetchLatestVideos() {
    const latestVideosDiv = document.getElementById('latest-videos');
    const cacheKey = 'latestVideos';
    const cacheTimeKey = 'latestVideosTime';
    const cacheDuration = 24 * 60 * 60 * 1000;

    latestVideosDiv.classList.add('loading');

    const cachedVideos = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);
    const now = new Date().getTime();

    if (cachedVideos && cachedTime && (now - cachedTime) < cacheDuration) {
        const videos = JSON.parse(cachedVideos);
        renderVideos(videos, latestVideosDiv, true);
        latestVideosDiv.classList.remove('loading');
        return;
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=10&order=date&type=video&key=${API_KEY}`
        );
        if (!response.ok) {
            throw new Error('Не вдалося завантажити відео');
        }
        const data = await response.json();
        let videos = data.items.filter(item => 
            item.id && 
            item.id.videoId && 
            item.snippet && 
            item.snippet.title !== 'Private video' // Виключаємо "Private video"
        );

        // Фільтруємо Shorts
        const videoIds = videos.map(video => video.id.videoId);
        const nonShortsIds = await filterNonShorts(videoIds);
        videos = videos.filter(video => nonShortsIds.includes(video.id.videoId)).slice(0, 3);

        if (videos.length === 0) {
            latestVideosDiv.innerHTML = '<p>Немає доступних відео.</p>';
            latestVideosDiv.classList.remove('loading');
            return;
        }

        localStorage.setItem(cacheKey, JSON.stringify(videos));
        localStorage.setItem(cacheTimeKey, now.toString());

        renderVideos(videos, latestVideosDiv, true);
    } catch (error) {
        console.error('Помилка завантаження найновіших відео:', error);
        latestVideosDiv.innerHTML = '<p>Помилка завантаження відео. Спробуйте пізніше.</p>';
    } finally {
        latestVideosDiv.classList.remove('loading');
    }
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

// Завантаження 9–15 випадкових відео з кешуванням
async function fetchRandomVideos() {
    const randomVideosDiv = document.getElementById('random-videos');
    const cacheKey = 'randomVideos';
    const cacheTimeKey = 'randomVideosTime';
    const cacheDuration = 24 * 60 * 60 * 1000;

    randomVideosDiv.classList.add('loading');

    const cachedVideos = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);
    const now = new Date().getTime();

    if (cachedVideos && cachedTime && (now - cachedTime) < cacheDuration) {
        const videos = JSON.parse(cachedVideos);
        renderVideos(videos, randomVideosDiv);
        randomVideosDiv.classList.remove('loading');
        return;
    }

    try {
        const width = window.innerWidth;
        let videoCount = 9;
        if (width >= 600 && width < 900) {
            videoCount = 12;
        } else if (width >= 900) {
            videoCount = 15;
        }

        const videosToShow = [];
        const categories = Object.keys(playlistIds);

        for (const category of categories) {
            const playlistId = playlistIds[category];
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${API_KEY}`
            );
            if (!response.ok) {
                throw new Error('Не вдалося завантажити відео');
            }
            const data = await response.json();
            const items = data.items.filter(item => 
                item.snippet && 
                item.snippet.resourceId && 
                item.snippet.resourceId.videoId && 
                item.snippet.title !== 'Private video' // Виключаємо "Private video"
            );
            videosToShow.push(...items);
        }

        // Фільтруємо Shorts
        const videoIds = videosToShow.map(video => video.snippet.resourceId.videoId);
        const nonShortsIds = await filterNonShorts(videoIds);
        const filteredVideos = videosToShow.filter(video => nonShortsIds.includes(video.snippet.resourceId.videoId));

        const shuffledVideos = filteredVideos.sort(() => Math.random() - 0.5).slice(0, videoCount);
        if (shuffledVideos.length === 0) {
            randomVideosDiv.innerHTML = '<p>Немає доступних відео.</p>';
            randomVideosDiv.classList.remove('loading');
            return;
        }

        localStorage.setItem(cacheKey, JSON.stringify(shuffledVideos));
        localStorage.setItem(cacheTimeKey, now.toString());

        renderVideos(shuffledVideos, randomVideosDiv);
    } catch (error) {
        console.error('Помилка завантаження випадкових відео:', error);
        randomVideosDiv.innerHTML = '<p>Помилка завантаження відео. Спробуйте пізніше.</p>';
    } finally {
        randomVideosDiv.classList.remove('loading');
    }
}
fetchRandomVideos();

// Випадаючий список категорій у футері
document.getElementById('categories-btn').addEventListener('click', () => {
    const list = document.getElementById('categories-list');
    list.style.display = list.style.display === 'none' ? 'block' : 'none';
});
