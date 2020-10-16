var crs = new L.Proj.CRS(
  'EPSG:2193',
  '+proj=tmerc +lat_0=0 +lon_0=173 +k=0.9996 +x_0=1600000 +y_0=10000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  {
    origin: [-1000000, 10000000],
    resolutions: [8960, 4480, 2240, 1120, 560, 280, 140, 70, 28, 14, 7, 2.8, 1.4, 0.7, 0.28, 0.14, 0.07]
  }
);



var urlTemplate = 'http://localhost:8080/wmts/1.0.0/wellyvation_dem_basemap/{z}/{x}/{y}.png'


var settings = {
    tms: true,
    maxZoom: 14,
    continuousWorld: true,
    attribution: '<a href="http://www.linz.govt.nz">Sourced from LINZ. CC-BY 3.0</a>', //Simple attribution for linz
};


var map = new L.Map('map', {
	crs: crs,
	continuousWorld: true,
	worldCopyJump: false,
        zoomControl: false,
});


var demMap = new L.TileLayer(urlTemplate, settings);
map.addLayer(demMap);

map.setView([-41.29, 175.4], 6);

