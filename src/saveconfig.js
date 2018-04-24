"use strict";

var $ = require('jquery');
var Utils = require('./utils');
var Modal = require('./modal');
var Viewer = require('./viewer');

var $aboutButton;

function init() {
  render();
  bindUIActions();
}

function render() {
  var el = Utils.createListButton({
    id: 'o-save',
    iconCls: 'o-icon-fa-info',
    text: '',
    src: '#ic_save_24px'
  });
  $('#o-menutools').append(el);
  $aboutButton = $('#o-save-button');
}

function bindUIActions() {
  $aboutButton.on('click', function (e) {
    var config = Viewer.getConfig();
    var layers = Viewer.getLayers();
    var currentLayers = getLayersVisibility(layers);

    updateConfig();

    function getLayersVisibility(viewerLayers) {
      var layerProperties = [];
      viewerLayers.forEach(function (layer) {
        var currentLayer = {};
        currentLayer.visibility = layer.getVisible() === true ? true : false;
        currentLayer.name = layer.get('name');
        currentLayer.group = layer.get('group');
        layerProperties.push(currentLayer);
      });
      return layerProperties;
    }

    function updateConfig() {
      currentLayers.forEach(function (currentLayer) {
        config.layers.filter(function (configLayer) {
          if (configLayer.name === currentLayer.name) {
            configLayer.visible = currentLayer.visibility;
          }
        });
      });
    }

    $.ajax({
      type: 'POST',
      data: JSON.stringify(config),
      contentType: 'application/json',
      dataType: 'json',
      url: 'https://karta.hallstahammar.se/intern/saveconfig',
      timeout: 15000,
      success: success,
      error: error
    });

    function success(result) {
      if (result.hasOwnProperty('errno')) {
        Modal.createModal('#o-map', {
          title: 'Ojdå.',
          content: 'Något gick fel när din kartkonfigration skulle sparas. Kontakta systemförvaltaren.<hr>' +
            'Felmeddelande: ' + result.code
        });
        Modal.showModal();
      } else {
        Modal.createModal('#o-map', {
          title: 'Kartkonfiguration sparad',
          content: 'Din kartkonfiguration är nu sparad.'
        });
        Modal.showModal();
      }
    }

    function error(jqXHR, textStatus) {
      Modal.createModal('#o-map', {
        title: 'Ojdå.',
        content: 'Något gick fel när din kartkonfigration skulle sparas. Kontakta systemförvaltaren.<hr>' +
          'Felmeddelande: ' + textStatus
      });
      Modal.showModal();
    }

    e.preventDefault();
  });
}

module.exports.init = init;
