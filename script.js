const apiKey = '2e3008f4471ce296ad8a9f6f2ad8b6cc';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

document.getElementById('search-btn').addEventListener('click', () => {
    const city = document.getElementById('city-input').value;
    if (city) {
        getWeather(city);
        updateSearchHistory(city);
    }
});

document.getElementById('location-btn').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            getWeatherByLocation(position.coords.latitude, position.coords.longitude);
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});

document.getElementById('unit-toggle').addEventListener('click', () => {
    const unit = document.querySelector('input[name="unit"]:checked').value;
    localStorage.setItem('unit', unit);
    getWeather(document.getElementById('city-input').value);
});

function updateSearchHistory(city) {
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        displaySearchHistory();
    }
}

function displaySearchHistory() {
    const historyContainer = document.getElementById('search-history');
    historyContainer.innerHTML = '';
    searchHistory.forEach(city => {
        const button = document.createElement('button');
        button.textContent = city;
        button.addEventListener('click', () => getWeather(city));
        historyContainer.appendChild(button);
    });
}

function getWeather(city) {
    const unit = localStorage.getItem('unit') || 'metric';
    fetch(`${apiUrl}?q=${city}&appid=${apiKey}&units=${unit}`)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
            displayWeatherAlerts(data);
            getForecast(data.coord.lat, data.coord.lon);
        })
        .catch(error => {
            document.getElementById('weather-info').innerHTML = '<p>City not found!</p>';
        });
}

function getWeatherByLocation(lat, lon) {
    const unit = localStorage.getItem('unit') || 'metric';
    fetch(`${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
            displayWeatherAlerts(data);
            getForecast(data.coord.lat, data.coord.lon);
        })
        .catch(error => {
            document.getElementById('weather-info').innerHTML = '<p>Location not found!</p>';
        });
}

function displayWeather(data) {
    const weatherInfo = document.getElementById('weather-info');
    const weatherHTML = `
        <p><strong>${data.name}, ${data.sys.country}</strong></p>
        <p><i class="fas fa-${getWeatherIcon(data.weather[0].main)}"></i> ${data.weather[0].description}</p>
        <p>Temperature: ${data.main.temp} °${localStorage.getItem('unit') === 'metric' ? 'C' : 'F'}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
    weatherInfo.innerHTML = weatherHTML;
}

function displayWeatherAlerts(data) {
    const alerts = data.alerts || [];
    const alertsContainer = document.getElementById('weather-alerts');
    alertsContainer.innerHTML = '';
    if (alerts.length > 0) {
        alerts.forEach(alert => {
            const alertHTML = `
                <div class="alert">
                    <h3>${alert.event}</h3>
                    <p>${alert.description}</p>
                </div>
            `;
            alertsContainer.innerHTML += alertHTML;
        });
    } else {
        alertsContainer.innerHTML = '<p>No weather alerts.</p>';
    }
}

function getForecast(lat, lon) {
    const unit = localStorage.getItem('unit') || 'metric';
    fetch(`${forecastUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`)
        .then(response => response.json())
        .then(data => {
            displayWeatherChart(data);
            display7DayForecast(data);
        });
}

function displayWeatherChart(data) {
    const ctx = document.getElementById('weather-chart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.list.map(entry => new Date(entry.dt * 1000).toLocaleTimeString()),
            datasets: [{
                label: 'Temperature (°C)',
                data: data.list.map(entry => entry.main.temp),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });
}

function display7DayForecast(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';
    data.list.forEach(entry => {
        const dayHTML = `
            <div class="forecast-day">
                <i class="fas fa-${getWeatherIcon(entry.weather[0].main)}"></i>
                <p>${new Date(entry.dt * 1000).toLocaleDateString()}</p>
                <p>${entry.main.temp} °${localStorage.getItem('unit') === 'metric' ? 'C' : 'F'}</p>
            </div>
        `;
        forecastContainer.innerHTML += dayHTML;
    });
}

function getWeatherIcon(weather) {
    switch (weather) {
        case 'Clear': return 'sun';
        case 'Clouds': return 'cloud';
        case 'Rain': return 'cloud-rain';
        case 'Snow': return 'snowflake';
        case 'Thunderstorm': return 'bolt';
        default: return 'smog';
    }
}

function applyUserPreferences() {
    const unit = localStorage.getItem('unit') || 'metric';
    document.querySelector(`input[name="unit"][value="${unit}"]`).checked = true;
}

applyUserPreferences();
displaySearchHistory();