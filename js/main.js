

var crs = new L.Proj.CRS(
    'EPSG:2193',
    '+proj=tmerc +lat_0=0 +lon_0=173 +k=0.9996 +x_0=1600000 +y_0=10000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
    {
      origin: [-1000000, 10000000],
      resolutions: [8960, 4480, 2240, 1120, 560, 280, 140, 70, 28, 14, 7, 2.8, 1.4, 0.7, 0.28, 0.14, 0.07]
    }
  );
  
  //overlays

  var dem_urlTemplate = 'https://xycarto-base-maps.s3-ap-southeast-2.amazonaws.com/wellyDEM-lidar/tile-cache/2020101712/wellyDEM-lidar/{z}/{x}/{y}.png'
  
  var dsm_urlTemplate = 'https://xycarto-base-maps.s3-ap-southeast-2.amazonaws.com/wellyDSM-lidar/tile-cache/2020101712/wellyDSM-lidar/{z}/{x}/{y}.png'
 
  var lowland_urlTemplate = 'https://maps.linz.io/tiles/wellyvation-lowlands-basemap/NZTM/{z}/{x}/{y}.png'

  var slope_urlTemplate = 'https://xycarto-base-maps.s3-ap-southeast-2.amazonaws.com/wellySLOPE-lidar/tile-cache/2020101712/wellySLOPE-lidar/{z}/{x}/{y}.png'

  //var slope_urlTemplate = 'http://localhost:8000/wellySLOPE-lidar/{z}/{x}/{y}.png'

  //basemaps
  var linzAerial_urlTemplate = 'https://basemaps.linz.govt.nz/v1/tiles/aerial/EPSG:2193/{z}/{x}/{y}.png?api=c01emr2n17q0qtdaens2m3abcwd'

  var linzColour_urlTemplate = 'https://tiles.maps.linz.io/nz_colour_basemap/NZTM/{z}/{x}/{y}.png'

  var linzTopo_urlTemplate = 'http://tiles-a.data-cdn.linz.govt.nz/services;key=1b85daaf8266427a9eb3f46a532cd2c7/tiles/v4/layer=50767/EPSG:2193/{z}/{x}/{y}.png'
  
  var settingsOverlay = {
    tms: true,
    maxZoom: 12,
    tileSize: 512,
    continuousWorld: true,
    attribution: '<a href="http://www.linz.govt.nz">Sourced from LINZ. CC-BY 4.0</a>', //Simple attribution for linz
};

  var settings = {
      tms: true,
      maxZoom: 12,
      continuousWorld: true,
      attribution: '<a href="http://www.linz.govt.nz">Sourced from LINZ. CC-BY 4.0</a>', //Simple attribution for linz
  };
  
  
  var map = new L.Map('map', {
      crs: crs,
      continuousWorld: true,
      worldCopyJump: false,
          zoomControl: false,
  });
  
  
  //overlays
  var demMap = new L.TileLayer(dem_urlTemplate, settingsOverlay);
  
  var dsmMap = new L.TileLayer(dsm_urlTemplate, settingsOverlay);

  var slopeMap = new L.TileLayer(slope_urlTemplate, settingsOverlay);
  
  var lowlandMap = new L.TileLayer(lowland_urlTemplate, settings);

  //basemaps
  var linzAerial = new L.TileLayer(linzAerial_urlTemplate, settings);

  var linzColour = new L.TileLayer(linzColour_urlTemplate, settings);

  var linzTopo = new L.TileLayer(linzTopo_urlTemplate, settings);
  
  var basemaps = {
      LINZColourBase: linzColour,
      LINZAerial: linzAerial,
      LINZTopo: linzTopo
      };

  var overlays = {
      DEM_HS: demMap,
      DSM_HS: dsmMap,
      Slope: slopeMap,
      Lowlands: lowlandMap};
  
  //var baseMaps = {"AerialElev": aerialElev};
  
  /*function addmaps(basemaps) {
          map.removeLayer(basemaps);
          map.addLayer(basemaps);
  };
  
  window.toggle = false;
  function togglell() {
      if(!toggle) {
          map.addLayer(lowlandMap);
      } else {
          map.removeLayer(lowlandMap);
      }
      toggle = !toggle
  };
  */
  
  /*var overlayMaps = {
      "</span><span>Aerial and Elevation</span>": aerialElev,
      "</span><span>Digital ELEVATION Model</span>": demMap,
      "</span><span>Digital SURFACE Model</span><hr>": dsmMap,
      "<span>Lowlands</span>": lowlandMap
  }*/
  
  
  var zoomcontrol = new L.Control.Zoom({ position: 'bottomright' }).addTo(map)
  
  var layers = L.control.layers(basemaps, overlays).addTo(map)
  
  map.addLayer(linzColour);
  
  map.setView([-41.29, 174.0], 3);
  
  //map.addControl(new L.Control.Permalink({ text: 'Permalink', layers: layers }));
  
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
