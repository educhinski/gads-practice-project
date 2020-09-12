// feature-detect sw availability
if ('serviceWorker' in navigator) {
  console.log('CLIENT: service worker registration in progress.');

  // register the service worker
  navigator.serviceWorker.register('/worker.js')
    .then(
      () => console.log('CLIENT: service worker registration complete.'),
      () => console.log('CLIENT: service worker registration failure')
    );
} else {
  console.log('CLIENT: service worker is not supported.');
}

let api = '';
const key = 'c7bc66869ebb4c1c14bfd7bb11cdcad9';
const weather = {};

// DOM elements
const myLocation = document.querySelector('#location');
const search = document.querySelector('#search');
const city = document.querySelector('.city');
const icon = document.querySelector('.icon');
const temp = document.querySelector('.temp');
const description = document.querySelector('.description');
const form = document.querySelector('#form');
const errorP = document.querySelector('.error');
const humidity = document.querySelector('#humidity');
const feelLike = document.querySelector('#feel-like');
const wind = document.querySelector('#wind');
const farenheit = document.querySelector('#farenheit');
const celsius = document.querySelector('#celsius');
const high = document.querySelector('#high');
const low = document.querySelector('#low');
const lastUpdated = document.querySelector('#last-updated');

// handle finding user's location
myLocation.addEventListener('click', () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(setPosition, showError);
  } else {
    errorP.textContent = 'Your device doesn\'t support location. Search by city name below.';
    errorP.classList.remove('hidden');
    console.error('Error');
  }

  function setPosition(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;

    api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${key}`;
    getWeather();
  }

  function showError(error) {
    errorP.textContent = `${error.message}. (Check Permissions or settings). Search by city name below.`;
    errorP.classList.remove('hidden');
    console.error(error);
  }
});

// handle submitting
form.addEventListener('submit', function (e) {
  e.preventDefault();
  api = `https://api.openweathermap.org/data/2.5/weather?q=${search.value}&units=metric&appid=${key}`;
  getWeather();
});

// get weather data
async function getWeather() {
  fetch(api)
    .then(response => response.json())
    .then(data => {
      weather.temperature = data.main.temp;
      weather.description = data.weather[0].description;
      weather.iconId = data.weather[0].icon;
      weather.city = data.name;
      weather.country = data.sys.country;
      weather.humidity = data.main.humidity;
      weather.feels_like = data.main.feels_like;
      weather.wind_speed = data.wind.speed;
      weather.temp_high = data.main.temp_max;
      weather.temp_low = data.main.temp_min;
      weather.last_updated = data.dt;
    })
    .then(() => displayWeather())
    .catch(err => {
      errorP.textContent = 'Unable to get the request. Please wait for at least a minute and try again.';
      errorP.classList.remove('hidden');
      console.error(err);
    });
}

// display weather to UI
function displayWeather() {
  document.querySelector('.top').classList.remove('hidden');
  city.textContent = `${weather.city}, ${weather.country}`;
  temp.textContent = Math.round(weather.temperature);
  description.textContent = weather.description;
  icon.innerHTML = `<img src="icons/${weather.iconId}.png" alt="Weather Icon"/>`;
  humidity.textContent = `Humidity: ${weather.humidity} %`;
  feelLike.textContent = `Feels like: ${Math.round(weather.feels_like)} °C`;
  wind.textContent = `Wind: ${Math.round(weather.wind_speed)} m/s`;
  high.textContent = Math.round(weather.temp_high);
  low.textContent = Math.round(weather.temp_low);
  document.querySelector('.credit').classList.remove('hidden');
  const date = new Date(weather.last_updated);
  lastUpdated.textContent = `
      ${date.getHours().toString().padStart('2', '0')} : 
      ${date.getMinutes().toString().padStart('2', '0')}`;
}

// convert to farenheit
farenheit.addEventListener('click', () => {
  temp.textContent = convertToF(weather.temperature, true);
  high.textContent = convertToF(weather.temp_high, true);
  low.textContent = convertToF(weather.temp_low, true);
  feelLike.textContent = `Feels like: ${convertToF(weather.feels_like, true)} °F`;
  farenheit.classList.add('active');
  celsius.classList.remove('active');
});

// convert back to celsius
celsius.addEventListener('click', () => {
  temp.textContent = convertToF(weather.temperature, false);
  high.textContent = convertToF(weather.temp_high, false);
  low.textContent = convertToF(weather.temp_low, false);
  feelLike.textContent = `Feels like: ${convertToF(weather.feels_like, false)} °C`;
  celsius.classList.add('active');
  farenheit.classList.remove('active');
});

function convertToF(temp, convert) {
  if (convert)
    return Math.round((temp - 32) * 5 / 9);
  else
    return Math.round(temp);
}
