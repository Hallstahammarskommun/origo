"use strict";
var viewer = require('./viewer');
var $ = require('jquery');
var legend = require('./legend');
var ol = require('openlayers');

function init(opt_options) {
  var options = opt_options || {};
  var groupTitle = options.groupTitle || "Egna lager"
  var map = viewer.getMap();
  var vectorSource;
  var vectorLayer;
  var vectorLayerName
  var vectorLayerGroup;
  var group;

  var dragAndDrop = new ol.interaction.DragAndDrop({
    formatConstructors: [
      ol.format.GPX,
      ol.format.GeoJSON,
      ol.format.KML
    ]
  });

  map.addInteraction(dragAndDrop)

  dragAndDrop.on('addfeatures', function(event) {
    vectorSource = new ol.source.Vector({
      features: event.features
    });

    vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      name: event.file.name.split('.')[0],
      group: "draganddrop",
      title: event.file.name.split('.')[0],
      queryable: true
    })

    viewer.getSettings().layers.push(vectorLayer)
    map.addLayer(vectorLayer);
    map.getView().fit(vectorSource.getExtent());

    if ($('#o-group-draganddrop').length === 0) {
      group = {
        name: "draganddrop",
        title: groupTitle,
        expanded: true
      };
      legend.createGroup(group, undefined, true);
    }

    vectorLayerGroup = vectorLayer.get('group');
    vectorLayerName = vectorLayer.get('name')

    legend.createLegendItem(vectorLayerName, null, null, true)
    legend.addCheckbox(vectorLayer, vectorLayerName)
    legend.addTickListener(vectorLayer)
  });
}

module.exports.init = init;
