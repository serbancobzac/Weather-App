var map;
function initMap() {
	navigator.geolocation.getCurrentPosition(function (position) {
		map = new google.maps.Map(document.getElementById("map"), {
			zoom: 17,
			center: {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			}
		});

		getWeather(map.getCenter().lat(), map.getCenter().lng());

		var cityInput = document.getElementById("city-input");
		var searchBox = new google.maps.places.Autocomplete(cityInput);
		map.controls[google.maps.ControlPosition.TOP_CENTER].push(cityInput);

		map.addListener("bounds_changed", function () {
			searchBox.setBounds(map.getBounds());
		});

		var place = {
			formatted_address: "Your location"
		};

		searchBox.addListener("place_changed", function () {
			place = searchBox.getPlace();

			var bounds = new google.maps.LatLngBounds();

			if (place.geometry.viewport) {
				bounds.union(place.geometry.viewport);
			} else {
				bounds.extend(place.geometry.location);
			}

			map.fitBounds(bounds);
			getWeather(map.getCenter().lat(), map.getCenter().lng());
		});

		var infowindow = new google.maps.InfoWindow();
		map.data.addListener("click", function (event) {
			var info = `<div id="weather-title">${place.formatted_address}</div><div id="weather-days">`;
			for (let i = 0; i < event.feature.f.days; i += 1) {
				info = info + 	`<div class="info-day">
								<img src="http://openweathermap.org/img/w/${event.feature.f.data[i].weather[0].icon}.png">
								<br /><strong> ${dateConverter(event.feature.f.data[i].dt)} </strong>
								<br /> ${Math.round(event.feature.f.data[i].temp.day)} &deg;C
								<br /> ${event.feature.f.data[i].weather[0].description}</div>`;
			}
			info = info + `</div>`;
			infowindow.setContent(info);
			infowindow.setOptions({
				position: {
					lat: map.getCenter().lat(),
					lng: map.getCenter().lng()
				},
				pixelOffset: {
					width: 0,
					height: -50
				}
			});
			infowindow.open(map);
		});
	});
}

var openWeatherMapKey = "98c355d73f22c6eb33c4bc0bd22031fe";

function getWeather(locLat, locLon) {
	var requestString = `https://api.openweathermap.org/data/2.5/forecast/daily?lon=${locLon}&lat=${locLat}
						&mode=json&cnt=5&units=metric&APPID=${openWeatherMapKey}`;
	var request = new XMLHttpRequest();
	request.onload = proccessResults;
	request.open("get", requestString, true);
	request.send();
}

var proccessResults = function() {
	resetData();
	map.data.addGeoJson(jsonToGeoJson(JSON.parse(this.responseText)));
}

function jsonToGeoJson(weatherItem) {
	var feature = {
		type: "Feature",
		properties: {
			city: weatherItem.city.name,
			days: weatherItem.cnt,
			data: weatherItem.list
		},
		geometry: {
		  type: "Point",
		  coordinates: [map.getCenter().lng(), map.getCenter().lat()]
		}
	};

	return feature;
}

function resetData() {
	map.data.forEach(function (feature) {
		map.data.remove(feature);
	});
}

function dateConverter(UNIX_timestamp){
	var a = new Date(UNIX_timestamp * 1000);
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var day = a.getDate();
	var date = day + ' ' + month + ' ' + year;
	return date;
}