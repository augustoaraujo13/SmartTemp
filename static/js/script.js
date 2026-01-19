const apiKey = "0de30e23d5383db1262ebe5479a8ccb2"; // Certifique-se de usar sua chave ativa

const cityInput = document.getElementById('city-input');
const suggestionsList = document.getElementById('suggestions');
let debounceTimer;

// 1. Inicialização (GPS ou Padrão)
window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            p => fetchWeather(`lat=${p.coords.latitude}&lon=${p.coords.longitude}`),
            () => fetchWeather("q=Rio de Janeiro")
        );
    }
});

// 2. Lógica de Autocomplete (Busca Inteligente)
cityInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = cityInput.value.trim();
    if (query.length < 3) { suggestionsList.classList.add('hidden'); return; }

    debounceTimer = setTimeout(async () => {
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            renderSuggestions(data);
        } catch (e) { console.error("Erro no Geocoding"); }
    }, 500);
});

function renderSuggestions(cities) {
    suggestionsList.innerHTML = '';
    if (cities.length === 0) { suggestionsList.classList.add('hidden'); return; }
    
    suggestionsList.classList.remove('hidden');
    cities.forEach(city => {
        const li = document.createElement('li');
        const state = city.state ? `${city.state}, ` : '';
        li.innerText = `${city.name}, ${state}${city.country}`;
        li.onclick = () => {
            cityInput.value = li.innerText;
            suggestionsList.classList.add('hidden');
            fetchWeather(`lat=${city.lat}&lon=${city.lon}`);
        };
        suggestionsList.appendChild(li);
    });
}

// 3. Busca de Clima
async function fetchWeather(query) {
    const url = `https://api.openweathermap.org/data/2.5/weather?${query}&units=metric&appid=${apiKey}&lang=pt_br`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.cod === 200) updateUI(data);
    } catch (e) { alert("Erro ao carregar clima"); }
}

function updateUI(data) {
    document.getElementById('city-name').innerText = data.name;
    document.getElementById('temp-number').innerText = `${Math.round(data.main.temp)}°`;
    document.getElementById('description').innerText = data.weather[0].description;
    document.getElementById('feels-like').innerText = `${Math.round(data.main.feels_like)}°`;
    document.getElementById('min-max').innerText = `${Math.round(data.main.temp_min)}°/${Math.round(data.main.temp_max)}°`;
    document.getElementById('humidity').innerText = `${data.main.humidity}%`;
    document.getElementById('wind').innerText = `${Math.round(data.wind.speed * 3.6)} km/h`;
    document.getElementById('visibility').innerText = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById('pressure').innerText = `${data.main.pressure} hPa`;
    document.getElementById('w-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    
    const d = new Date();
    document.getElementById('date-now').innerText = d.toLocaleDateString('pt-br', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Fechar lista ao clicar fora
document.addEventListener('click', (e) => {
    if (!cityInput.contains(e.target)) suggestionsList.classList.add('hidden');
});