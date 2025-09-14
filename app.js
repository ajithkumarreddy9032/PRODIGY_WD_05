// Replace with your OpenWeatherMap API key:
const API_KEY = "b069c71268950f6656e757838d70b5a6"; // <-- put your key here

// DOM elements
const cityForm = document.getElementById("cityForm");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const result = document.getElementById("result");
const errorBox = document.getElementById("error");
const locationName = document.getElementById("locationName");
const description = document.getElementById("description");
const tempEl = document.getElementById("temp");
const feelsLikeEl = document.getElementById("feels_like");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const weatherIcon = document.getElementById("weatherIcon");
const updatedAt = document.getElementById("updatedAt");

// Helper: show error
function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
  result.classList.add("hidden");
}

// Helper: clear error
function clearError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

// Build URL for OpenWeatherMap current weather
function buildWeatherUrl({ city, lat, lon }) {
  const base = "https://api.openweathermap.org/data/2.5/weather";
  const units = "metric";
  if (city) {
    const q = encodeURIComponent(city);
    return ${base}?q=${q}&units=${units}&appid=${API_KEY};
  } else if (lat != null && lon != null) {
    return ${base}?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY};
  } else {
    throw new Error("Need city or lat/lon");
  }
}

// Fetch weather and update UI
async function fetchWeather(opts) {
  clearError();
  try {
    const url = buildWeatherUrl(opts);
    const resp = await fetch(url);
    if (!resp.ok) {
      if (resp.status === 404) throw new Error("Location not found. Check spelling.");
      throw new Error(Weather API error: ${resp.status} ${resp.statusText});
    }
    const data = await resp.json();
    updateUI(data);
  } catch (err) {
    showError(err.message);
    console.error(err);
  }
}

// Update DOM with API data
function updateUI(data) {
  const icon = data.weather?.[0]?.icon;
  const descriptionText = data.weather?.[0]?.description ?? "N/A";
  const name = ${data.name}${data.sys?.country ? ", " + data.sys.country : ""};
  const temp = Math.round(data.main?.temp ?? NaN);
  const feels = Math.round(data.main?.feels_like ?? NaN);
  const humidity = data.main?.humidity ?? "N/A";
  const wind = data.wind?.speed ?? "N/A";

  weatherIcon.src = icon ? https://openweathermap.org/img/wn/${icon}@2x.png : "";
  weatherIcon.alt = descriptionText;

  locationName.textContent = name;
  description.textContent = capitalize(descriptionText);
  tempEl.textContent = isFinite(temp) ? temp : "N/A";
  feelsLikeEl.textContent = isFinite(feels) ? feels : "N/A";
  humidityEl.textContent = humidity;
  windEl.textContent = wind;
  const now = new Date();
  updatedAt.textContent = Last updated: ${now.toLocaleString()};
  result.classList.remove("hidden");
  errorBox.classList.add("hidden");
}

// Utility: capitalize first letter
function capitalize(s = "") {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Events
cityForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city name.");
    return;
  }
  fetchWeather({ city });
});

geoBtn.addEventListener("click", () => {
  clearError();
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }
  geoBtn.disabled = true;
  geoBtn.textContent = "Locating...";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      fetchWeather({ lat: latitude, lon: longitude }).finally(() => {
        geoBtn.disabled = false;
        geoBtn.textContent = "Use My Location";
      });
    },
    () => {
      showError("Unable to retrieve location. Allow location access or try entering a city.");
      geoBtn.disabled = false;
      geoBtn.textContent = "Use My Location";
    },
    { enableHighAccuracy: false, timeout: 10000 }
  );
});