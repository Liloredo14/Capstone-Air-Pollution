const cityInp = document.getElementById("city");
const airQuality = document.querySelector(".air-quality");
const airQualityStat = document.querySelector(".air-quality-status");
const srchBtn = document.querySelector(".search-btn");
const errorLabel = document.querySelector("label[for='error-msg']");
const componentsEle = document.querySelectorAll(".component-val");

const appkey = "33a8c4f8543678e56017d5f81521dd25"; // API Key to request call in the Open Weather API server

let map;

//this function is to activate the promt location in the browser and enable it to locate the current location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onPositionGathered, onPositionGatherError);
    } else {
        onPositionGatherError({message: "Can't access Location."});
    }
}

function onPositionGathered(position) {
  latitude = position.coords.latitude.toFixed(4);
  longitude = position.coords.longitude.toFixed(4);
  setMapLocator(latitude, longitude);
  getAirQuality(latitude, longitude, appkey);
  console.log("Latitude: " + latitude + "\nLongitude: " + longitude);
}

let weatherDisplay = document.getElementById("weatherDisplay");

function getGeoLocationData(cityName, appkey) {
  fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${appkey}`
  )
    .then((response) => response.json())
    .then((data) => {
      // Process weather data (e.g., display temperature, description)
        // weatherDisplay.innerHTML = `Weather in ${data.name}: ${data.main.temp} K`;
      console.log(data);
      getAirQuality(data[0].lat, data[0].lon, appkey);
      refreshMap(data[0].lat, data[0].lon);
    })
    .catch((error) => {
      console.error("Error fetching Geo Location data:", error);
      weatherDisplay.innerHTML = "Error retrieving geo Location information.";
     
    });
   
}

async function getAirQuality(lat, lon, appkey) {
  try {
    const response = await fetch(
      `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${appkey}`
    );

    if (!response.ok) {
      throw new Error(
        `Air quality data fetch failed with status: ${response.status}`
      );
    }

    const airData = await response.json();
    console.log(airData); // For debugging or logging purposes (replace with your desired action)
    setValuesOfAir(airData);
    setComponentOfAir(airData);
    return airData; // Return the air quality data for further use
  } catch (error) {
    console.error("Error fetching air quality data:", error);
    // Handle the error appropriately, potentially calling onPositionGatherError or providing a user-friendly message
  }
}

//this function is to get the data in the server and it display the air status from "Good to Very Poor" and color indicator
function setValuesOfAir(airData) {
  const aqi = airData.list[0].main.aqi;
  let airStat, color;

  switch (aqi) {
    case 1:
      airStat = "Good";
      color = "rgb(19, 201, 28)";
      break;
    case 2:
      airStat = "Fair";
      color = "rgb(15, 134, 25)";
      break;
    case 3:
      airStat = "Moderate";
      color = "rgb(201, 204, 13)";
      break;
    case 4:
      airStat = "Poor";
      color = "rgb(204, 83, 13)";
      break;
    case 5:
      airStat = "Very Poor";
      color = "rgb(204, 13, 13)";
      break;
    default:
      airStat = "Unknown";
  }

  airQuality.innerHTML = aqi;
  airQualityStat.innerHTML = airStat;
  airQualityStat.style.color = color;
}

function setComponentOfAir(airData) {
  let component = { ...airData.list[0].components };
  componentsEle.forEach((ele) => {
    const attr = ele.getAttribute("data-comp");
    const value = component[attr];
    if (value !== undefined) {
      // Check if attribute exists
      ele.innerHTML = value; // Display only the data (no units)
    } else {
      ele.innerHTML = "Data unavailable"; // Handle missing data
    }
  });
}


function setMapLocator(lat, lon) {

  if (map !== undefined) {
    map.remove();
  }

  map = L.map("map").setView([lat, lon], 16); // Centered on Cabuyao City
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

L.control.scale({ imperial: true, metric: true }).addTo(map);

L.marker({ lon: lon, lat: lat }).bindPopup("Your current location").addTo(map);
}

function refreshMap(newLatitude, newLongitude) {
    setMapLocator(newLatitude, newLongitude);
}


srchBtn.addEventListener("click", () => {
  let city = cityInp.value;
  getGeoLocationData(city, appkey);
  
});

//for position Error function
function onPositionGatherError() {
  errorLabel.innerHTML = e.message;
}

//to locate your location
getUserLocation();