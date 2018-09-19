/* ========================================================================
 * Copyright 2016 Origo
 * Licensed under BSD 2-Clause (https://github.com/origo-map/origo/blob/master/LICENSE.txt)
 * ======================================================================== */
'use strict';

var ol = require('openlayers');
var $ = require('jquery');
var Utils = require('./utils');
var viewer = require('./viewer');
var formCreator = require('./utils/formcreator');
var sidebar = require('./sidebar');
var featureLayer = require('./featurelayer');

var activeButton;
var selectedIndex;
var buttonText;
var drawInteraction;
var modifyInteraction;
var drawLayer;
var areaButtons;
var layerTitles;
var form;
var layerInfo;
var formOptions;
var url;
var formElement;
var attributeObjects;
var map;
var options;
var layers;
var isActive = false;

function init(optOptions) {
  map = viewer.getMap();
  layers = map.getLayers();
  options = optOptions || {};
  formOptions = options.params;
  buttonText = options.buttontext || '';
  url = options.url || '';

  $('.o-map').on('enableInteraction', onEnableInteraction);
  render();
  bindUIActions();
}

function render() {
  var el = Utils.createListButton({
    id: 'o-download',
    iconCls: 'o-icon-fa-download',
    src: '#fa-download',
    text: buttonText
  });
  $('#o-menutools').append(el);
}

function onEnableInteraction(e) {
  if (e.interaction === 'download') {
    setActive(true);
  } else {
    setActive(false);
  }
}

function bindUIActions() {
  $('#o-download-button').on('click', function () {
    setActive(true);
    toggleDownload();
    sidebar.init();
    sidebar.setContent({
      content: setSidebarContent(),
      title: 'Hämta data'
    });

    if (selectedIndex) {
      $('#input-DestinationFormat :nth-child(' + (selectedIndex + 1) + ')').prop('selected', true);
    }
    layerTitles = getLayerTitles();

    if (layerTitles) {
      layerInfo = '<br>Nedan listas de lager som du kommer att hämta:<br><br>' + layerTitles + '<br>';
    } else {
      layerInfo = '<p style="font-style:italic;">Du måste tända ett nedladdningsbart lager i kartan för att kunna hämta hem data.</p>';
    }

    $(layerInfo).insertAfter('#tool-instructions');

    fmeDownloadEnabled();

    sidebar.setVisibility(true);

    $('#input-DestinationFormat').change(function () {
      fmeDownloadEnabled();
    });

    initInteractions();

    if ($('#o-drawarea-button').hasClass('o-area-active')) {
      addInteractions();
    }

    $('#o-extent-button').on('click', function () {
      if ($('#o-drawarea-button').hasClass('o-area-active')) {
        $('#o-drawarea-button').removeClass('o-area-active');
      }

      if (!$('#o-extent-button').hasClass('o-area-active')) {
        $('#o-extent-button').addClass('o-area-active');
        drawLayer.getFeatureLayer().getSource().clear();
      }
      var interactionExist = drawInteractionAdded();

      if (interactionExist) {
        removeInteractions();
      }
    });

    $('#o-drawarea-button').on('click', function () {
      if ($('#o-extent-button').hasClass('o-area-active')) {
        $('#o-extent-button').removeClass('o-area-active');
      }

      if (!$('#o-drawarea-button').hasClass('o-area-active')) {
        $('#o-drawarea-button').addClass('o-area-active');
      }

      if ($('#o-drawarea-button').hasClass('o-area-active')) {
        var interactionExist = drawInteractionAdded();

        if (!interactionExist) {
          addInteractions();
        }
      }
    });

    $('#o-fme-download-button').on('click', function (e) {
      var params = {};
      attributeObjects.forEach(function (obj) {
        params[obj.name.toString()] = $(obj.elId).val();
      });
      $('#o-fme-download-button').blur( );
      sendToFME(params);
      e.preventDefault();
    });
    $('.o-close-button').on('click', function () {
      if (drawLayer) {
        drawLayer.getFeatureLayer().getSource().clear();
      }

      if ($('#o-drawarea-button').hasClass('o-area-active')) {
        activeButton = 'area';
      } else {
        activeButton = 'extent';
      }

      if ($('#input-DestinationFormat')[0].selectedIndex !== 0) {
        selectedIndex = $('#input-DestinationFormat')[0].selectedIndex;
      } else {
        selectedIndex = 0;
      }
      var interactionExist = drawInteractionAdded();

      if (interactionExist) {
        removeInteractions();
      }

      setActive(false);
      toggleDownload();
    });
  });
}

function setSidebarContent() {
  attributeObjects = formOptions.map(function (attributeObject) {
    var obj = {};
    $.extend(obj, attributeObject);
    obj.elId = '#input-' + obj.name;
    obj.formElement = formCreator(obj);
    return obj;
  });

  formElement = attributeObjects.reduce(function (prev, next) {
    return prev + next.formElement;
  }, '');

  areaButtons = '<input id="o-extent-button" type="button" value="Aktuell vy"></input>' +
    '<input id="o-drawarea-button" type="button" value="Rita område"></input><br>';

  if (activeButton === 'area') {
    areaButtons = areaButtons.replace('"o-drawarea-button"', '"o-drawarea-button" class="o-area-active"');
  } else {
    areaButtons = areaButtons.replace('"o-extent-button"', '"o-extent-button" class="o-area-active"');
  }

  form = '<br><form>' + formElement + '<br><input id="o-fme-download-button" type="button" value="Spara" disabled></input></div></form>';
  return '<div id="tool-instructions">' + '</div>' + '<br>' + areaButtons + '<br>' + form;
}

function fmeDownloadEnabled() {
  if (layerTitles && $('#input-DestinationFormat')[0].selectedIndex !== 0) {
    $('#o-fme-download-button').removeAttr('disabled');
  } else {
    $('#o-fme-download-button').prop('disabled', true);
  }
}

function initInteractions() {
  if (!drawLayer) {
    drawLayer = featureLayer(null, map);
  }

  drawInteraction = new ol.interaction.Draw({
    source: drawLayer.getFeatureLayer().getSource(),
    type: 'Polygon'
  });

  modifyInteraction = new ol.interaction.Modify({
    source: drawLayer.getFeatureLayer().getSource()
  });

  drawInteraction.on('drawstart', function () {
    $('.o-map').first().trigger({
      type: 'enableInteraction',
      interaction: 'download'
    });
    drawLayer.getFeatureLayer().getSource().clear();
  });

  drawInteraction.on('drawend', function () {
    map.removeInteraction(drawInteraction);
    drawLayer.getFeatureLayer().getSource().clear();
  });
}

function addInteractions() {
  map.addInteraction(drawInteraction);
  map.addInteraction(modifyInteraction);
}

function removeInteractions() {
  map.removeInteraction(drawInteraction);
  map.removeInteraction(modifyInteraction);
}

function drawInteractionAdded() {
  var interactionExist;
  map.getInteractions().forEach(function (interaction) {
    if (interaction instanceof ol.interaction.Draw) {
      interactionExist = true;
    }
  });
  return interactionExist;
}

function sendToFME(params) {
  var size;
  var extent;
  var drawExtent;
  var visibleLayers;
  var paramsLength = Object.keys(params).length;
  var i;
  var fmeUrl;

  fmeUrl = url;

  for (i = 0; i < paramsLength; i++) {
    if (i === (paramsLength - 1)) {
      fmeUrl += Object.keys(params)[i] + '=' + params[Object.keys(params)[i]];
    } else {
      fmeUrl += Object.keys(params)[i] + '=' + params[Object.keys(params)[i]] + '&';
    }
  }

  var formatTypes = {
    dwg: 'ACAD',
    shape: 'ESRISHAPE',
    GeoJSON: 'GEOJSON'
  };
  fmeUrl = fmeUrl.replace(/dwg|shape|GeoJSON/gi, function (matched) {
    return formatTypes[matched];
  });

  visibleLayers = getVisibleLayers();
  visibleLayers = visibleLayers.replace(/;/g, '%20');
  fmeUrl += '&layer=' + visibleLayers;

  // Aktuell vy är vald, annars ritat område. Avrundar till 2 decimaler.
  if ($('#o-extent-button').hasClass('o-area-active')) {
    size = map.getSize();
    extent = map.getView().calculateExtent(size);
    extent.forEach(function (coordinate, j) {
      extent[j] = Math.round(coordinate * 100) / 100;
    });
  } else {
    var feature = drawLayer.getFeatureLayer().getSource().getFeatures()[0];
    drawExtent = feature.getGeometry().getCoordinates();
    drawExtent.forEach(function (coordinatearray) {
      coordinatearray.forEach(function (coordinatepair) {
        coordinatepair.forEach(function (coordinate, index, coordarray) {
          coordarray[index] = Math.round(coordarray[index] * 100) / 100;
        });
      });
    });
  }

  if (extent) {
    extent = encodeURI(extent).replace(/,/g, '%20');
    fmeUrl += '&extent=' + extent;
  } else {
    drawExtent = encodeURI(drawExtent).replace(/,/g, '%20');
    fmeUrl += '&polygon=' + drawExtent;
  }

  window.open(fmeUrl, '_self');
}

function getVisibleLayers() {
  var layerNames = '';

  layers.forEach(function (el) {
    if (el.getVisible() === true && el.get('fme')) {
      layerNames += el.get('name') + ';';
    }
  });
  layerNames = layerNames.slice(0, -1);
  return layerNames;
}

function getLayerTitles() {
  var titles = '';

  layers.forEach(function (el) {
    if (el.getVisible() === true && el.get('fme')) {
      titles += '<li>' + el.get('title') + '</li>';
    }
  });
  return titles;
}

function setActive(state) {
  if (state === true) {
    isActive = true;
  } else {
    isActive = false;
  }
}

function toggleDownload() {
  if (isActive) {
    $('.o-map').trigger({
      type: 'enableInteraction',
      interaction: 'download'
    });
  } else {
    $('.o-map').trigger({
      type: 'enableInteraction',
      interaction: 'featureInfo'
    });
  }
}

module.exports.init = init;
