function initMap() {
	// Set current position on the map
	navigator.geolocation.getCurrentPosition(function(pos) {
		let position = {
			lat: pos.coords.latitude,
			lng: pos.coords.longitude
		};

		let map = new google.maps.Map(document.getElementById("map"), {
			zoom: 17,
			center: position
		});

		let markers = [];
		markers.push(new google.maps.Marker({
			position: position,
			title: "Your location",
			map: map
		}));

		let cityInput = document.getElementById("city-input");
		let searchBox = new google.maps.places.SearchBox(cityInput);
		map.controls[google.maps.ControlPosition.TOP_CENTER].push(cityInput);

		// map.addListener("bounds_changed", function() {
		// 	searchBox.setBounds(map.getBounds());
		// });

		searchBox.addListener("places_changed", function() {
			let places = searchBox.getPlaces();

			if (places.length === 0) { return;}

			markers.forEach(function(marker) {
				marker.setMap(null);
			});
			markers = [];

			let bounds = new google.maps.LatLngBounds();
			places.forEach(function(place) {
				markers.push(new google.maps.Marker({
					map: map,
					title: place.name,
					position: place.geometry.location
				}));

				if (place.geometry.viewport) {
					bounds.union(place.geometry.viewport);
				} else {
					bounds.extend(place.geometry.location);
				}
			});
			map.fitBounds(bounds);
		});
	});
}