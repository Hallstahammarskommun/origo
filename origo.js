"use strict";

window.proj4 = require('proj4');
global.jQuery = require("jquery");

var $ = require('jquery');
var Viewer = require('./src/viewer');
var mapLoader = require('./src/maploader');
var controlInitialiser = require('./src/controlinitialiser');
var Modal = require('./src/modal');

var origo = {};
origo.map = {};
origo.config = require('./conf/origoConfig');
origo.controls = require('./conf/origoControls');

origo.map.init = function (options, OptConfig) {
  var config = OptConfig ? $.extend(origo.config, OptConfig) : origo.config;
  var url = 'https://karta.hallstahammar.se/intern/getconfig';

  if (options === 'temp.json') {
    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: url,
      timeout: 15000,
      success: success,
      error: error
    });
  } else {
    loadMap(options);
  }

  function success(result) {
    var res;
    if (result[0].case === 'user not found') {
      res = options;
    } else {
      res = result[0].case;
    }

    loadMap(res);
  }

  function error(jqXHR) {
    loadMap(options, jqXHR.responseText);
  }

  function loadMap(options, errorText) {
    var map = mapLoader(options, config);
    if (map) {
      map.then(function (config) {
        init(config);
      }).then(function () {
        if (errorText) {
          Modal.createModal('#o-map', {
            title: 'Kunde inte ladda konfiguration',
            content: 'Något gick fel vid anslutning till databasen. Standardutförandet av kartan har laddats. Kontakta systemförvaltaren. <hr>' +
              'Felmeddelande: ' + errorText
          });
          Modal.showModal();
        }
      });
      return Viewer;
    }
    return undefined;
  }
};

function init(config) {
  Viewer.init(config.el, config.options);

  // Init controls
  controlInitialiser(config.options.controls);
}

module.exports = origo;
