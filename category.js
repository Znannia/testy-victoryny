const API_KEY = 'AIzaSyCILrgPfPm9NS6cgQHZhnXjcD7ab-GghDg'; // Залиште ваш API-ключ

// Отримання категорії з URL
const urlParams = new URLSearchParams(window.location.search);
const category = decodeURIComponent(urlParams.get('category')); // Декодуємо параметр
document.getElementById('category-title').textContent = category || 'Категорія не вказана';

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

// Функція для відображення відео (з обкладинками)
function renderVideos(videos, container) {
    videos.forEach(video => {
        const videoId = video.snippet.resourceId.videoId;
        const title = video.snippet.title;
        const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`; // Обкладинка відео
        const videoElement = document.createElement('div');
        videoElement.innerHTML = `
            <div class="video-container">
                <img src="${thumbnail}" alt="${title}" class="thumbnail" data-video-id="${videoId}">
            </div>
            <p>${title}</p>
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

// Завантаження відео з плейлиста з кешуванням
async function fetchCategoryVideos() {
    const categoryVideosDiv = document.getElementById('category-videos');
    const cacheKey = `categoryVideos_${category}`;
    const cacheTimeKey = `categoryVideosTime_${category}`;
    const cacheDuration = 24 * 60 * 60 * 1000; // 24 години

    categoryVideosDiv.classList.add('loading'); // Додаємо лоадер

    // Перевіряємо кеш
    const cachedVideos = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);
    const now = new Date().getTime();

    if (cachedVideos && cachedTime && (now - cachedTime) < cacheDuration) {
        const videos = JSON.parse(cachedVideos);
        renderVideos(videos, categoryVideosDiv);
        categoryVideosDiv.classList.remove('loading');
        return;
    }

    try {
        if (!playlistId) {
            categoryVideosDiv.innerHTML = '<p>Категорія не знайдена.</p>';
            categoryVideosDiv.classList.remove('loading');
            return;
        }

        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${API_KEY}`
        );
        if (!response.ok) {
            throw new Error('Не вдалося завантажити відео');
        }
        const data = await response.json();
        const videos = data.items.filter(item => item.snippet && item.snippet.resourceId && item.snippet.resourceId.videoId);
        if (videos.length === 0) {
            categoryVideosDiv.innerHTML = '<p>Немає доступних відео у цій категорії.</p>';
            categoryVideosDiv.classList.remove('loading');
            return;
        }

        // Зберігаємо в кеш
        localStorage.setItem(cacheKey, JSON.stringify(videos));
        localStorage.setItem(cacheTimeKey, now.toString());

        renderVideos(videos, categoryVideosDiv);
    } catch (error) {
        console.error('Помилка завантаження відео категорії:', error);
        categoryVideosDiv.innerHTML = '<p>Помилка завантаження відео. Спробуйте пізніше.</p>';
    } finally {
        categoryVideosDiv.classList.remove('loading');
    }
}
fetchCategoryVideos();

// Випадаючий список категорій у футері
document.getElementById('categories-btn').addEventListener('click', () => {
    const list = document.getElementById('categories-list');
    list.style.display = list.style.display === 'none' ? 'block' : 'none';
});

// Оновлення годинника і дати (додаємо для синхронізації з index.html)
function updateTime() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString('uk-UA');
    document.getElementById('date').textContent = now.toLocaleDateString('uk-UA');
}
setInterval(updateTime, 1000);
updateTime();
