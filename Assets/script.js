const WEATHER_API_BASE_URL = "https://openweathermap.org";
const WEATHER_API_KEY = "675a5e8d69b36fd32fa843e0b7a4d238";
const MAX_DAILY_FORECAST = 5;

const recentlocations = [];

const getLocation = () => {
  const userLocation = locationInput.value;
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
  var apiUrl = `${WEATHER_API_BASE_URL}/geo/1.0/direct?q=${search}&limit=5&appid=${WEATHER_API_KEY}`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      // Pick the First location from the results
      //const location = data[0];
      var lat = data[0].lat;
      var lon = data[0].lon;

      // Get the Weather for the cached location
      var apiUrl = `${WEATHER_API_BASE_URL}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${WEATHER_API_KEY}`;
      console.log(apiUrl);
      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);

          // Display the Current Weather
          displayCurrentweather(data);

          // Display the 5 Day Forecast
          displayWeather(data);
        });
    });
};

// Add an event handler for the search button
const displayCurrentweather = (weatherData) => {
  const Currentweather = weatherData.current;
  document.getElementById("temp_value").textContent = "${currentWeather.temp}°";
  document.getElementById("wind_value").textContent =
    "${currentWeather.wind_speed}MPH";
  document.getElementById("humid_value").textContent =
    "${currentWeather.humidity}%";
  document.getElementById("uvi_value").textContent = "${currentWeather.uvi}";
};

const displayWeather = (weatherData) => {
  const forecastContainer = document.getElementById("forecast");
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
