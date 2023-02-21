class Location {
  constructor() {
    this._latitude = null;
    this._longitude = null;
  }

  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this._latitude = position.coords.latitude;
            this._longitude = position.coords.longitude;
            resolve({
              latitude: this._latitude,
              longitude: this._longitude
            });
          },
          (error) => {
            reject(`Unable to get current location: ${error.message}`);
          }
        );
      } else {
        reject('Geolocation is not supported by this browser');
      }
    });
  }
}
