class Map {
  constructor(mapDivId, options = {}) {
    this.mapDivId = mapDivId;
    this.map = new google.maps.Map(document.getElementById(mapDivId), options);
  }

  addMarker(position, options = {}) {
    const marker = new google.maps.Marker({
      position,
      map: this.map,
      ...options,
    });
    return marker;
  }

  setCenter(position) {
    this.map.setCenter(position);
  }

  getCenter() {
    return this.map.getCenter();
  }
}
