

var settings = {
    maxZoom: 12,
    tms: true,
    continuousWorld: true,
    subdomains: '1234',
    attribution: '<a href="https://www.linz.govt.nz/linz-copyright" target="_blank">Data sourced from LINZ. CC-BY 4.0</a>',
    zIndex: 2
};

var aerialelev = L.tileLayer('http://maps.linz.io/tiles/wellyvation-basemap/NZTM/{z}/{x}/{y}.png', settings),
    dem = L.tileLayer('http://maps.linz.io/tiles/wellyvation-dem-basemap/NZTM/{z}/{x}/{y}.png', settings),
    dsm = L.tileLayer('http://maps.linz.io/tiles/wellyvation-dsm-basemap/NZTM/{z}/{x}/{y}.png', settings),
    lowlands = L.tileLayer('https://maps.linz.io/tiles/wellyvation-lowlands-basemap/NZTM/{z}/{x}/{y}.png', settings);

var baseMaps = {
    "AerialElev": aerialelev
};

var overlayMaps = {
    "</span><span>Aerial and Elevation</span>": aerialelev,
    "</span><span>Digital ELEVATION Model</span>": dem,
    "</span><span>Digital SURFACE Model</span><hr>": dsm,
    "<span>Lowlands</span>": lowlands,
};

var crs = new L.Proj.CRS(
    'EPSG:2193',
    '+proj=tmerc +lat_0=0 +lon_0=173 +k=0.9996 +x_0=1600000 +y_0=10000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs', {
        origin: [-1000000, 10000000],
        resolutions: [
            8960,
            4480,
            2240,
            1120,
            560,
            280,
            140,
            70,
            28,
            14,
            7, 
            2.8, 
            1.4, 
            0.7
        ]
    }
);

var map = new L.Map('map', {
    crs: crs,
    continuousWorld: true,
    worldCopyJump: false,
    zoomControl: false,
    maxZoom: 12,
    minZoom: 6,
    layers: [aerialelev]
});

var zoomcontrol = new L.Control.Zoom({ position: 'bottomright' }).addTo(map)

var layers = L.control.layers(baseMaps, overlayMaps, { "hideSingleBase": true }).addTo(map);

map.setView([-41.3, 175.05], 7);

map.addControl(new L.Control.Permalink({ text: 'Permalink', layers: layers }));

//setup sidebar
var sidebar = L.control.sidebar('sidebar', {
    closeButton: true,
    position: 'left',
    autoPan: false,
}).addTo(map);

sidebar.show();

//feature pop-up sidebar

var featurePopup = L.control.sidebar('feature-popup', {
    closeButton: true,
    position: 'left',
    autoPan: false,
}).addTo(map);

document.getElementById('feature-popup').appendChild(featurePopup.getCloseButton());

$(document).ready(function() {
    $(".menu").click(function() {
        sidebar.toggle();
    });
});

map.on('click', onMapClick);

map.on('dblclick', function(event) {
    mapClicked = false;
    if (map.getZoom() < map.getMaxZoom()) {
        map.zoomIn();
    }
});

featurePopup.on('hidden', function() {
    clearFeatureInfo();
});


function onMapClick(e) {
    mapClicked = true;
    setTimeout(function() {
        if (mapClicked) {
            featureInfo(e);
        }
    }, 200);
}

function clearFeatureInfo() {
    for (var i in queryLayers) {
        map.removeLayer(queryLayers[i]);
    }
    queryLayers = [];
}

function featureInfo(e) {
    clearFeatureInfo();
    queryUrl = baseQueryUrl + 'x=' + e.latlng.lng + '&y=' + e.latlng.lat;
    featuresFound = false;
    map.spin(true);
    $.getJSON(queryUrl, function(data) {
        $(".featureinfo-data").empty();
        for (var i in data.setQuery.layers) {
            var featureCount = 0;
            var geoJsonLayer = L.geoJson(data.setQuery.layers[i], {
                onEachFeature: function() {
                    featuresFound = true;
                    featureCount++;
                },
            });
            if (!featureCount) {
                continue;
            }
            queryLayers.push(geoJsonLayer);

            infoConfig = featureInfoConfig[data.setQuery.layers[i].id]
            $('.featureinfo-data').append('<h2>' + infoConfig.display_name + '</h2>');
            var table = $('<table></table>');
            $('.featureinfo-data').append(table);
            var firstRow = true;
            geoJsonLayer.eachLayer(function(layer) {
                if (!firstRow) {
                    table.append('<tr class="spacer"></tr>');
                }
                for (var prop in infoConfig.properties) {
                    table.append('<tr><th>' + infoConfig.properties[prop] + '</th><td>' + layer.feature.properties[prop] + '</td></tr>');
                }
                firstRow = false;
            });
            geoJsonLayer.addTo(map);
        }
        if (featuresFound) {
            if (sidebar.isVisible()) {
                sidebar.hide();
            }
            if (!featurePopup.isVisible()) {
                featurePopup.toggle();
            }
        } else {
            if (featurePopup.isVisible()) {
                featurePopup.toggle();
            }
        }
        map.spin(false);
    });
};
