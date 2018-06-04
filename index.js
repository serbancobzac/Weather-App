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
				info = info + 	`<div class="info-days" id="info-day-${i}">
								<img src="http://openweathermap.org/img/w/${event.feature.f.data[i].weather[0].icon}.png">
								<br /><strong> ${dateConverter(event.feature.f.data[i].dt)} </strong>
								<br /> ${Math.round(event.feature.f.data[i].temp.day)} &deg;C
								<br /> ${event.feature.f.data[i].weather[0].description}</div>`;

				infowindow.setOptions({
					position: {
						lat: event.feature.f.lat,
						lng: event.feature.f.lng
					}
				});
				
				$("#map").after(
					`<div class="modal" id="modal-${i}">
						<div class="modal-content">
							<div class="modal-header">
								<span class="close-modal">&times;</span>
								<h2>${place.formatted_address} - ${dateConverter(event.feature.f.data[i].dt)}</h2>
							</div>
							<div class="modal-body">
								<img src="http://openweathermap.org/img/w/${event.feature.f.data[i].weather[0].icon}.png">
								<p>Average temperature: ${Math.round(event.feature.f.data[i].temp.day)} &deg;C</p>
								<p>Description: ${event.feature.f.data[i].weather[0].description}</p><br>
								<p>Minimum temperature: ${Math.round(event.feature.f.data[i].temp.min)} &deg;C</p>
								<p>Maximum temperature: ${Math.round(event.feature.f.data[i].temp.max)} &deg;C</p><br>
								<p>Morning temperature: ${Math.round(event.feature.f.data[i].temp.morn)} &deg;C</p>
								<p>Eve temperature: ${Math.round(event.feature.f.data[i].temp.eve)} &deg;C</p>
								<p>Night temperature: ${Math.round(event.feature.f.data[i].temp.night)} &deg;C</p><br>
								<p>Pressure: ${Math.round(event.feature.f.data[i].pressure)}</p>
								<p>Humidity: ${Math.round(event.feature.f.data[i].humidity)} %</p>
								<p>Wind speed: ${event.feature.f.data[i].speed} m/s</p>
								<p>Cloudiness: ${event.feature.f.data[i].clouds} %</p>
							</div>
						</div>
					</div>`
				);

				$(document).mouseup(function(e) {
					var container = $(`#modal-${i} .modal-content`);
	
					console.log(container);
					console.log(e.target);
					if (!container.is(e.target) && container.has(e.target).length === 0) {
						container.parent().hide();
					}
				});
			}
			info = info + `</div>`;
			infowindow.setContent(info);
			infowindow.setOptions({
				pixelOffset: {
					width: 0,
					height: -50
				}
			});
			infowindow.open(map);

			for (let i = 0; i < event.feature.f.days; i += 1) {
				$(`#info-day-${i}`).on("click", function(){
					$(`#modal-${i}`).toggle();
				});
			}
			$(".close-modal").on("click", function(){
				$(this).parent().parent().parent().toggle();
			});
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
};

function jsonToGeoJson(weatherItem) {
	var feature = {
		type: "Feature",
		properties: {
			city: weatherItem.city.name,
			days: weatherItem.cnt,
			data: weatherItem.list,
			lng: map.getCenter().lng(),
			lat: map.getCenter().lat()
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