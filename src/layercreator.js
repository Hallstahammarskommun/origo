"use strict";

var $ = require('jquery');
var viewer = require('./viewer');
var mapUtils = require('./maputils');
var group = require('./layer/group');
var type = {};
type.WFS = require('./layer/wfs');
//type.AGS_FEATURE = require('./layer/agsfeature');
//type.TOPOJSON = require('./layer/topojson');
//type.GEOJSON = require('./layer/geojson');
type.WMS = require('./layer/wms');
type.WMTS = require('./layer/wmts');
//type.AGS_TILE = require('./layer/agstile');
//type.XYZ = require('./layer/xyz');
//type.OSM = require('./layer/osm');
//type.GROUP = groupLayer;
var getCapabilitiesLayers;

function responseParser(response) {
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(response,"text/xml");
  xmlToArray(xmlDoc);
}

function xmlToArray(xmlDoc) {
  getCapabilitiesLayers = $(xmlDoc).find("Layer > Name").map(function() {
    return $(this).text();
  }).get();

  getCapabilitiesLayers.forEach(function(getCapabilitiesLayer, i) {
  var data = getCapabilitiesLayer.split(':');
  getCapabilitiesLayers[i] = data.pop();
  })
}

module.exports = {
getCapabilities: function getCapabilities(getCapabilitiesURL) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
       responseParser(xmlHttp.responseText);
    };
    xmlHttp.open("GET", getCapabilitiesURL, false); // true for asynchronous
    xmlHttp.send(null);
},

layerCreator: function layerCreator(opt_options) {
  var defaultOptions = {
    name: undefined,
    id: undefined,
    title: undefined,
    group: 'none',
    opacity: 1,
    geometryName: 'geom',
    geometryType: undefined,
    filter: undefined,
    layerType: undefined,
    legend: false,
    sourceName: undefined,
    attribution: undefined,
    style: 'default',
    styleName: undefined,
    queryable: true,
    minResolution: undefined,
    maxResolution: undefined,
    visible: false,
    secure: undefined,
    type: undefined,
    extent: undefined,
    attributes: undefined
  };
  var projection = viewer.getProjection();
  var options = opt_options || {};
  var layerOptions = $.extend(defaultOptions, options);
  var name = layerOptions.name;
  layerOptions.minResolution = layerOptions.hasOwnProperty('minScale') ? mapUtils.scaleToResolution(layerOptions.minScale, projection): undefined;
  layerOptions.maxResolution = layerOptions.hasOwnProperty('maxScale') ? mapUtils.scaleToResolution(layerOptions.maxScale, projection): undefined;
  layerOptions.sourceName = layerOptions.source;
  layerOptions.styleName = layerOptions.style;
  layerOptions.secure = false;
  if (getCapabilitiesLayers != undefined) {
    if (getCapabilitiesLayers.indexOf(name) > -1) { } else {
      layerOptions.secure = true;
    }
  }
  if (layerOptions.id === undefined) {
    layerOptions.id = name.split('__').shift();
  }
  layerOptions.name = name.split(':').pop();

  if (type.hasOwnProperty(layerOptions.type)) {
    return type[layerOptions.type](layerOptions, layerCreator);
  } else {
    console.log('Layer type is missing or layer type is not correct. Check your layer definition: ');
    console.log(layerOptions);
  }
}
}

 /*function groupLayer(options) {
  if (options.hasOwnProperty('layers')) {
    var layers = options.layers.map(function(layer) {
      return layerCreator(layer);
    });
    var layerOptions = {};
    layerOptions.layers = layers;
    return group($.extend(options, layerOptions));
  } else {
    console.log('Group layer has no layers');
  }
}*/
