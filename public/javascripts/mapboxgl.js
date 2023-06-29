mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
    container: 'mapjs', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 5, // starting zoom
});

// Create a new marker.
const marker = new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(campground.title))
    .addTo(map);