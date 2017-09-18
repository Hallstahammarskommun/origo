"use strict";

var ol = require('openlayers');
var $ = require('jquery');
var viewer = require('./viewer');
var utils = require('./utils');

var $geolocateButtonId = undefined;
var $geolocateButton = undefined;
var enabled = false;
var map = undefined;
var geolocation = undefined;
var marker = undefined;
var markerEl = undefined;
var baseUrl = undefined;
var zoomLevel;

function init(opt_options) {
  var options = opt_options || {};
  var target = options.target || '#o-toolbar-navigation';
  map = viewer.getMap();
  baseUrl = viewer.getBaseUrl();
  zoomLevel = options.zoomLevel || viewer.getResolutions().length - 3 || 0;

  render(target);

  $geolocateButtonId = $('#o-geolocation-button');
  $geolocateButton = $('#o-geolocation-button button');

  markerEl = $('#o-geolocation_marker').get(0);
  marker = new ol.Overlay({
    id: 'geolocation-marker',
    positioning: 'center-center',
    element: markerEl,
    stopEvent: false
  });

  geolocation = new ol.Geolocation(({
    projection: map.getView().getProjection(),
    trackingOptions: {
      maximumAge: 10000,
      enableHighAccuracy: true,
      timeout: 600000
    }
  }));

  bindUIActions();
}

function render(target) {
  var tooltipText = 'Visa nuvarande position i kartan';
  var src = baseUrl + 'img/geolocation_marker.png';
  var markerImg = '<img id="o-geolocation_marker" src="' + src + '"/>';

  //Element for control
  var el = utils.createButton({
    id: 'o-geolocation-button',
    cls: 'o-geolocation-button',
    iconCls: 'o-icon-fa-location-arrow',
    src: '#fa-location-arrow',
    tooltipText: tooltipText,
    tooltipPlacement: 'east'
  });
  $(target).append(el);
  $('#o-map').prepend(markerImg);
}

function bindUIActions() {
  $geolocateButtonId.on('click', function(e) {
    if (enabled === true) {
      enabled = false;
    } else {
      enabled = true;
    }
    toggle();
    $geolocateButton.blur();
    e.preventDefault();
  });
}

function toggle() {
  map.once("pointerdrag", function() {
    enabled = false;
    $geolocateButton.removeClass('o-geolocation-button-true');
  });

  if ($geolocateButton.hasClass('o-geolocation-button-true')) {
    $geolocateButton.removeClass('o-geolocation-button-true');
    centerView();
    geolocation.on('change', updatePosition);
  } else {
    $geolocateButton.addClass('o-geolocation-button-true');
    if (!map.getOverlayById('geolocation-marker')) {
      map.addOverlay(marker);
    }

    centerView();
    geolocation.on('change', updatePosition);
    geolocation.setTracking(true); // Start position tracking
  }
}

function centerView() {
  var markerPosition = marker.getPosition();
  if (markerPosition) {
    map.getView().setCenter(markerPosition);
    map.getView().setZoom(10);
  }
}

function updatePosition() {
  addPosition(getPositionVal());
}

function getPositionVal() {
  var current = {};
  current.position = geolocation.getPosition();
  current.accuracy = geolocation.getAccuracy();
  current.heading = geolocation.getHeading() || 0;
  current.speed = geolocation.getSpeed() || 0;
  current.m = Date.now();
  return current;
}

function addPosition(current) {
  var position = current.position;

  if (enabled === true) {
    marker.setPosition(position);
    map.getView().animate({
      center: position,
      zoom: zoomLevel
    });

  } else {
    marker.setPosition(position);

  }
}

module.exports.init = init;
