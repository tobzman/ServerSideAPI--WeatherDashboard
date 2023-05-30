const WEATHER_API_BASE_URL = "https://api.openweathermap.org";
const WEATHER_API_KEY = "f23ee9deb4e1a7450f3157c44ed020e1";
const MAX_DAILY_FORECAST = 5;

const recentLocations = [];

const locationInput = document.getElementById("locationInput");
const errorDisplay = document.getElementById("error");
const searchButton = document.getElementById("searchButton");
const cityElement = document.getElementById("city_name");
const weatherIconElement = document.getElementById("weather_icon");
const tempElement = document.getElementById("temp_value");
const humidityElement = document.getElementById("humid_value");
const windElement = document.getElementById("wind_value");
const forecastContainer = document.getElementById("forecast_items");
const searchHistoryContainer = document.getElementById("search_history");

const getLocation = () => {
  const userLocation = locationInput.value.trim();
  if (userLocation === "") {
    setLocationError("Please enter a location");
  } else {
    lookupLocation(userLocation);
  }
};

const clearError = () => {
  errorDisplay.textContent = "";
};

const setLocationError = (text) => {
  errorDisplay.textContent = text;

  setTimeout(clearError, 3000);
};

const lookupLocation = async (search) => {
  try {
    const geoApiUrl = `${WEATHER_API_BASE_URL}/geo/1.0/direct?q=${search}&limit=5&appid=${WEATHER_API_KEY}`;
    const geoResponse = await fetch(geoApiUrl);
    const geoData = await geoResponse.json();

    const { lat, lon } = geoData[0];

    const weatherApiUrl = `${WEATHER_API_BASE_URL}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${WEATHER_API_KEY}`;
    const weatherResponse = await fetch(weatherApiUrl);
    const weatherData = await weatherResponse.json();

    displayCurrentWeather(weatherData);
    displayWeather(weatherData);
    recentLocations.push(search);
    if (recentLocations.length > 5) {
      recentLocations.shift();
    }
    localStorage.setItem("recentLocations", JSON.stringify(recentLocations));
    renderSearchHistory();
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const getCurrentDate = () => {
  const currentDate = new Date();
  return currentDate.toLocaleDateString();
};

const displayCurrentWeather = (weatherData) => {
  const currentWeather = weatherData.current;

  cityElement.textContent = weatherData.timezone;
  weatherIconElement.setAttribute(
    "src",
    getWeatherIconUrl(currentWeather.weather[0].icon)
  );
  tempElement.textContent = `${currentWeather.temp}`;
  humidityElement.textContent = `${currentWeather.humidity}%`;
  windElement.textContent = `${currentWeather.wind_speed} MPH`;
};

const getWeatherIconUrl = (iconCode) => {
  return `https://openweathermap.org/img/w/${iconCode}.png`;
};

const loadSearchHistory = () => {
  const storedLocations = localStorage.getItem("recentLocations");
  if (storedLocations) {
    const parsedLocations = JSON.parse(storedLocations);
    recentLocations.push(...parsedLocations);
    renderSearchHistory();
  }
};

const displayWeather = (weatherData) => {
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

searchButton.addEventListener("click", getLocation);

window.addEventListener("load", loadSearchHistory);
