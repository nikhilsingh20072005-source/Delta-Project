document.addEventListener("DOMContentLoaded", function () {

    console.log("MAP JS LOADED");

    const mapElement = document.getElementById("map");

    console.log("MAP ELEMENT =", mapElement);

    // Is page par map nahi hai
    if (!mapElement) {
        console.log("Map is not required on this page.");
        return;
    }

    // Leaflet map
    const map = L.map("map").setView([20.5937, 78.9629], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    // Location check
    if (
        typeof listingLocation === "undefined" ||
        typeof listingCountry === "undefined"
    ) {
        console.error("listingLocation or listingCountry is missing.");
        return;
    }

    const searchLocation =
        `${listingLocation}, ${listingCountry}`;

    console.log("Searching:", searchLocation);

    fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchLocation)}`
    )
    .then(response => response.json())
    .then(data => {

        console.log("Search result:", data);

        if (data.length === 0) {
            console.log("Location not found:", searchLocation);
            return;
        }

        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        console.log("Latitude:", lat);
        console.log("Longitude:", lon);

        map.setView([lat, lon], 12);

        const marker = L.marker([lat, lon]).addTo(map);

        marker.bindPopup(
            `<b>${listingLocation}</b><br>${listingCountry}`
        );

        marker.openPopup();

    })
    .catch(error => {
        console.error("Map error:", error);
    });

});