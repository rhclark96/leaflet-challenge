// Define the GeoJSON data source (all 4.5+ earthquakes in the last 30 days)
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

// Add the street map from Leaflet
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create map from Leaflet centered on U.S.
let myMap = L.map("map", {
    center: [40.58, -103.46],
    zoom: 3,
    layers: [street]
});

// Create a function to determine the color of the marker based on depth of earthquake
function myStyle(code) {
    let color = "black";
    if (code >= -10 && code <= 10) {
        color = "chartreuse";
    } else if (code > 10 && code <= 30) {
        color = "yellowgreen";
    } else if (code > 30 && code <= 50) {
        color = "gold";
    } else if (code > 50 && code <= 70) {
        color = "orange";
    } else if (code > 70 && code <= 90) {
        color = "darkorange";
    } else if (code > 90) {
        color = "red";
    }
    return {
        color: color,
        fillColor: color
    };
}

// Create markers
d3.json(url).then(data => {
    console.log(data.features);
    
    // Extract coordinates and magnitude from features array
    data.features.forEach(feature => {
        let coordinates = feature.geometry.coordinates;
        let magnitude = feature.properties.mag;

        // Call the myStyle feature as a variable determined by the depth
        let style = myStyle(coordinates[2]);

        // Create circles using magnitude as radius and a fixed color
        L.circle([coordinates[1], coordinates[0]], {
            radius: magnitude * 50000, // Adjust the multiplier for visibility
            color: style.color,
            fillColor: style.fillColor,
            fillOpacity: 0.5,
            weight: 2.0
        })
        .addTo(myMap) // Correctly chain addTo
        .bindPopup(`<h1>Magnitude: ${magnitude}</h1> <hr> Depth: ${coordinates[2]} km<hr>Location: (${coordinates[1]}, ${coordinates[0]})<hr>Learn more <a href="${feature.properties.url}" target="_blank">here</a>`); // Bind popup to the circle
    });

    // Create legend
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");

        // Define limits and colors for the legend
        let limits = [-10, 10, 30, 50, 70, 90, 1000]; // Depth ranges
        let colors = ["chartreuse", "yellowgreen", "gold", "orange", "darkorange", "red"]; // Corresponding colors
        let labels = [];

        // Add the minimum and maximum.
        let legendInfo = "<h4>Depth (km)</h4>" +
            "<div class=\"labels\">" +
                "<div class=\"min\">" +`Minimum: `+ limits[0] + "</div>" +
                "<div class=\"max\">" +`Maximum: `+ limits[limits.length - 1] + "</div>" +
            "</div>";

        div.innerHTML = legendInfo;

        limits.forEach(function(limit, index) {
            let rangeText = `${limits[index]} km - ${limits[index+1]} km`;
            labels.push("<li style=\"background-color:" + colors[index] + "\">" + rangeText + "</li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    // Adding the legend to the map
    legend.addTo(myMap);
});
