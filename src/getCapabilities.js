"use strict";

var $ = require('jquery');
var getCapabilities;
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

getCapabilities = function getCapabilities(getCapabilitiesURL) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
       responseParser(xmlHttp.responseText);
    };
    xmlHttp.open("GET", getCapabilitiesURL, false); // true for asynchronous
    xmlHttp.send(null);

    return getCapabilitiesLayers;
}

module.exports = getCapabilities;
