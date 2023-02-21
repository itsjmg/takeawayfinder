class TakeawayFinder {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async search(cuisine, location) {
    const locationResult = await this._geocodeLocation(location);
    if (!locationResult) {
      return { error: 'Failed to geocode location' };
    }

    const openTakeaways = await this._findOpenTakeaways(cuisine, locationResult);
    if (openTakeaways.length === 0) {
      return { error: `No open takeaways found for ${cuisine}` };
    }

    const randomTakeaway = openTakeaways[Math.floor(Math.random() * openTakeaways.length)];
    return {
      name: randomTakeaway.name,
      address: randomTakeaway.vicinity,
      rating: randomTakeaway.rating,
      location: {
        lat: randomTakeaway.geometry.location.lat(),
        lng: randomTakeaway.geometry.location.lng(),
      },
    };
  }

  async _geocodeLocation(location) {
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: location }, (results, status) => {
        if (status === 'OK') {
          resolve(results[0].geometry.location);
        } else {
          reject(status);
        }
      });
    });
  }

  async _findOpenTakeaways(cuisine, location) {
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    const request = {
      location: location,
      radius: '50000',
      type: 'meal_takeaway',
    };

    return new Promise((resolve, reject) => {
      service.nearbySearch(request, (results, status) => {
        if (status === 'OK') {
          const openTakeaways = [];
          const promises = [];
          for (const result of results) {
            const placeId = result.place_id;
            const detailsRequest = {
              placeId: placeId,
              fields: ['types', 'opening_hours', 'name', 'vicinity', 'rating', 'geometry'],
            };
            promises.push(new Promise((resolve, reject) => {
              service.getDetails(detailsRequest, (detailsResult, detailsStatus) => {
                if (detailsStatus === 'OK') {
                  if (this._isCuisineMatch(cuisine, detailsResult.types)) {
                    if (detailsResult.opening_hours && detailsResult.opening_hours.isOpen()) {
                      openTakeaways.push(detailsResult);
                    }
                  }
                  resolve();
                } else {
                  reject(detailsStatus);
                }
              });
            }));
          }
          Promise.all(promises).then(() => {
            resolve(openTakeaways);
          }).catch((err) => {
            reject(err);
          });
        } else {
          reject(status);
        }
      });
    });
  }

  _isCuisineMatch(cuisine, types) {
    const cuisineTypes = {
      'Chinese': ['meal_delivery', 'meal_takeaway', 'restaurant'],
      'Italian': ['meal_delivery', 'meal_takeaway', 'restaurant'],
      'Mexican': ['meal_delivery', 'meal_takeaway', 'restaurant'],
      'Thai': ['meal_delivery', 'meal_takeaway', 'restaurant'],
    };
    return types.some((type) => cuisineTypes[cuisine].includes(type));
  }
}
