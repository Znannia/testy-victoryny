const API_KEY = 'AIzaSyCILrgPfPm9NS6cgQHZhnXjcD7ab-GghDg'; // Залиште ваш новий API-ключ
const CHANNEL_ID = 'UC0usNaN5iwML35qPxASBDWQ';

// Оновлення годинника і дати
function updateTime() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString('uk-UA');
    document.getElementById('date').textContent = now.toLocaleDateString('uk-UA');
}
setInterval(updateTime, 1000);
updateTime();

// Функція для відображення відео (з обкладинками)
function renderVideos(videos, container, isLatest = false) {
    videos.forEach((video) => {
        const videoId = isLatest ? video.id.videoId : video.snippet.resourceId.videoId;
        const title = video.snippet.title;
        const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`; // Обкладинка відео
        const videoElement = document.createElement('div');
        videoElement.innerHTML = `
            <div class="video-container">
                <img src="${thumbnail}" alt="${title}" class="thumbnail" data-video-id="${videoId}">
            </div>
            <p>${title}${isLatest ? ' <span class="new">Нове</span>' : ''}</p>
        `;
        container.appendChild(videoElement);
    });

    // Додаємо обробник кліків для обкладинок
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
    const cacheDuration = 24 * 60 * 60 * 1000; // 24 години

    latestVideosDiv.classList.add('loading'); // Додаємо лоадер

    // Перевіряємо кеш
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
            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=3&order=date&type=video&key=${API_KEY}`
        );
        if (!response.ok) {
            throw new Error('Не вдалося завантажити відео');
        }
        const data = await response.json();
        const videos = data.items.filter(item => item.id && item.id.videoId && item.snippet);
        if (videos.length === 0) {
            latestVideosDiv.innerHTML = '<p>Немає доступних відео.</p>';
            latestVideosDiv.classList.remove('loading');
            return;
        }

        // Зберігаємо в кеш
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
    const cacheDuration = 24 * 60 * 60 * 1000; // 24 години

    randomVideosDiv.classList.add('loading'); // Додаємо лоадер

    // Перевіряємо кеш
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
        // Визначаємо кількість відео залежно від ширини екрана
        const width = window.innerWidth;
        let videoCount = 9; // <600px
        if (width >= 600 && width < 900) {
            videoCount = 12; // 600px–900px
        } else if (width >= 900) {
            videoCount = 15; // >900px
        }

        const videosToShow = [];
        const categories = Object.keys(playlistIds);

        // Завантажуємо всі відео з усіх плейлистів за один раз
        for (const category of categories) {
            const playlistId = playlistIds[category];
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${API_KEY}`
            );
            if (!response.ok) {
                throw new Error('Не вдалося завантажити відео');
            }
            const data = await response.json();
            const items = data.items.filter(item => item.snippet && item.snippet.resourceId && item.snippet.resourceId.videoId);
            videosToShow.push(...items);
        }

        // Перемішуємо відео і вибираємо потрібну кількість
        const shuffledVideos = videosToShow.sort(() => Math.random() - 0.5).slice(0, videoCount);
        if (shuffledVideos.length === 0) {
            randomVideosDiv.innerHTML = '<p>Немає доступних відео.</p>';
            randomVideosDiv.classList.remove('loading');
            return;
        }

        // Зберігаємо в кеш
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
