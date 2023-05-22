const WEATHER_API_BASE_URL = "https://api.openweathermap.org";
const WEATHER_API_KEY = "f23ee9deb4e1a7450f3157c44ed020e1";
const MAX_DAILY_FORECAST = 5;

let recentLocations = [];

const getLocation = () => {
  const userLocation = locationInput.value.trim();
  if (userLocation === "") {
    setLocationError("Please enter a location");
  } else {
    lookupLocation(userLocation);
  }
};

const clearError = () => {
  const errorDisplay = document.getElementById("error");
  errorDisplay.textContent = "";
};

const setLocationError = (text) => {
  const errorDisplay = document.getElementById("error");
  errorDisplay.textContent = text;

  setTimeout(clearError, 3000);
};

const lookupLocation = (search) => {
  const geoApiUrl = `${WEATHER_API_BASE_URL}/geo/1.0/direct?q=${search}&limit=5&appid=${WEATHER_API_KEY}`;
  fetch(geoApiUrl)
    .then((response) => response.json())
    .then((data) => {
      const { lat, lon } = data[0];

      const weatherApiUrl = `${WEATHER_API_BASE_URL}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${WEATHER_API_KEY}`;
      fetch(weatherApiUrl)
        .then((response) => response.json())
        .then((data) => {
          displayCurrentWeather(data);
          displayWeather(data);
          recentLocations.push(search);
          if (recentLocations.length > 5) {
            recentLocations.shift();
          }
          localStorage.setItem(
            "recentLocations",
            JSON.stringify(recentLocations)
          );
          renderSearchHistory();
        });
    });
};

const displayCurrentWeather = (weatherData) => {
  const currentWeather = weatherData.current;
  document.getElementById("city_name").textContent = weatherData.timezone;
  document.getElementById("date").textContent = getCurrentDate();
  document
    .getElementById("weather_icon")
    .setAttribute("src", getWeatherIconUrl(currentWeather.weather[0].icon));
  document.getElementById("temp_value").textContent = `${currentWeather.temp}`;
  document.getElementById(
    "humidity_value"
  ).textContent = `${currentWeather.humidity}%`;
  document.getElementById(
    "wind_speed_value"
  ).textContent = `${currentWeather.wind_speed} MPH`;
};

const getCurrentDate = () => {
  const currentDate = new Date();
  return currentDate.toLocaleDateString();
};

const getWeatherIconUrl = (iconCode) => {
  return `https://openweathermap.org/img/w/${iconCode}.png`;
};

const loadSearchHistory = () => {
  const storedLocations = localStorage.getItem("recentLocations");
  if (storedLocations) {
    recentLocations = JSON.parse(storedLocations);
    renderSearchHistory();
  }
};

const displayWeather = (weatherData) => {
  const forecastContainer = document.getElementById("forecast_items");
  forecastContainer.innerHTML = "";

  const dailyForecast = weatherData.daily.slice(1, MAX_DAILY_FORECAST + 1);

  dailyForecast.forEach((day) => {
    const date = new Date(day.dt * 1000).toLocaleDateString();
    const iconUrl = getWeatherIconUrl(day.weather[0].icon);
    const temp = day.temp.day;
    const windSpeed = day.wind_speed;
    const humidity = day.humidity;

    const forecastItem = document.createElement("div");
    forecastItem.classList.add("forecast-item");

    const dateElement = document.createElement("p");
    dateElement.textContent = date;

    const iconElement = document.createElement("img");
    iconElement.setAttribute("src", iconUrl);

    const tempElement = document.createElement("p");
    tempElement.textContent = `${temp}°F`;

    const windElement = document.createElement("p");
    windElement.textContent = `${windSpeed} MPH`;

    const humidityElement = document.createElement("p");
    humidityElement.textContent = `${humidity}%`;

    forecastItem.appendChild(dateElement);
    forecastItem.appendChild(iconElement);
    forecastItem.appendChild(tempElement);
    forecastItem.appendChild(windElement);
    forecastItem.appendChild(humidityElement);

    forecastContainer.appendChild(forecastItem);
  });
};

const renderSearchHistory = () => {
  const searchHistoryContainer = document.getElementById("search_history");
  searchHistoryContainer.innerHTML = "";

  recentLocations.forEach((location) => {
    const locationItem = document.createElement("div");
    locationItem.classList.add("search-history-item");
    locationItem.textContent = location;
    locationItem.addEventListener("click", () => {
      lookupLocation(location);
    });

    searchHistoryContainer.appendChild(locationItem);
  });
};

const searchButton = document.getElementById("search_button");
searchButton.addEventListener("click", getLocation);

// Load search history on page load
window.addEventListener("load", loadSearchHistory);
