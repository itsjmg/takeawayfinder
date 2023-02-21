// Get references to HTML elements
const form = document.querySelector('form');
const cuisineSelect = document.getElementById('cuisine');
const locationInput = document.getElementById('location');
const useLocationButton = document.getElementById('btn-location');
const submitButton = document.getElementById('btn-submit');
const resultDiv = document.getElementById('result');
const mapDiv = document.getElementById('map');

// Initialize Google Maps API
let map;
function initMap() {
  map = new google.maps.Map(mapDiv, {
    center: {lat: 37.7749, lng: -122.4194},
    zoom: 13
  });
}

// Handle form submit event
form.addEventListener('submit', (event) => {
  event.preventDefault();
  search();
});

// Handle use location button click event
useLocationButton.addEventListener('click', () => {
  getLocation();
});

// Search for takeaways based on the user's selected cuisine
function search() {
  const cuisine = cuisineSelect.value;
  const location = locationInput.value;

  // Make API request to Google Places API
  const request = {
    query: cuisine + ' takeaway ' + location,
    fields: ['name', 'vicinity', 'rating', 'geometry']
  };
  const service = new google.maps.places.PlacesService(map);
  service.textSearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // Filter open takeaways that match the user's selected cuisine
      const openTakeaways = results.filter(result => {
        if (result.opening_hours && result.opening_hours.open_now) {
          const types = result.types.map(type => type.toLowerCase());
          return types.includes('meal_takeaway') && types.includes(cuisine.toLowerCase());
        }
        return false;
      });
      if (openTakeaways.length > 0) {
        // Display a random open takeaway
        const randomTakeaway = openTakeaways[Math.floor(Math.random() * openTakeaways.length)];
        resultDiv.innerHTML = `
          <h2>${randomTakeaway.name}</h2>
          <p>Address: ${randomTakeaway.vicinity}</p>
          <p>Rating: ${randomTakeaway.rating}</p>
        `;
        map.setCenter(randomTakeaway.geometry.location);
        map.setZoom(15);
        const marker = new google.maps.Marker({
          position: randomTakeaway.geometry.location,
          map: map,
          title: randomTakeaway.name
        });
      } else {
        resultDiv.innerHTML = `<p>No open takeaways found for ${cuisine} in ${location}.</p>`;
        map.setCenter({lat: 0, lng: 0});
        map.setZoom(2);
      }
    } else {
      resultDiv.innerHTML = `<p>Error: ${status}</p>`;
      map.setCenter({lat: 0, lng: 0});
      map.setZoom(2);
    }
  });
}

// Get the user's current location
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;

      var geocoder = new google.maps.Geocoder();
      var latlng = {lat: lat, lng: lng};
      geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === 'OK') {
          if (results[0]) {
            document.getElementById('location').value = results[0].formatted_address;
          }
        }
      });
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

document.getElementById('btn-location').addEventListener('click', getLocation);

function search(e) {
  e.preventDefault();
  const cuisine = document.getElementById('cuisine').value;
  const location = document.getElementById('location').value;

  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: location }, (results, status) => {
    if (status === 'OK') {
      const location = results[0].geometry.location;

      const request = {
        location: location,
        radius: '50000',
        type: 'meal_takeaway'
      };

      const service = new google.maps.places.PlacesService(document.createElement('div'));
      service.nearbySearch(request, (results, status) => {
        if (status === 'OK') {
          const openTakeaways = [];
          for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const placeId = result.place_id;
            const detailsRequest = {
              placeId: placeId,
              fields: ['types']
            };
            service.getDetails(detailsRequest, (detailsResult, detailsStatus) => {
              if (detailsStatus === 'OK') {
                if (isCuisineMatch(cuisine, detailsResult.types)) {
                  if (detailsResult.opening_hours && detailsResult.opening_hours.isOpen()) {
                    openTakeaways.push(result);
                  }
                }
              }
            });
          }
          if (openTakeaways.length > 0) {
            const randomTakeaway = openTakeaways[Math.floor(Math.random() * openTakeaways.length)];
            const name = randomTakeaway.name;
            const address = randomTakeaway.vicinity;
            const rating = randomTakeaway.rating;
            document.getElementById('result').innerHTML = `Name: ${name}<br>Address: ${address}<br>Rating: ${rating}`;
          } else {
            document.getElementById('result').innerHTML = `No open takeaways found for ${cuisine}`;
          }
        } else {
          document.getElementById('result').innerHTML = `Error: ${status}`;
        }
      });
    } else {
      document.getElementById('result').innerHTML = `Error: ${status}`;
    }
  });
}

function isCuisineMatch(cuisine, types) {
  return types.includes(`restaurant`) && types.includes(cuisine);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  form.addEventListener('submit', search);
  const btnLocation = document.getElementById('btn-location');
  btnLocation.addEventListener('click', getLocation);
});

