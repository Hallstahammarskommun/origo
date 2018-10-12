import $ from 'jquery';
import viewer from './src/viewer';
import mapLoader from './src/maploader';
import controlInitialiser from './src/controlinitialiser';
import origoConfig from './conf/origoConfig';
import controls from './conf/origoControls';
import modal from './src/modal';

const origo = {};
origo.map = {};
origo.config = origoConfig;
origo.controls = controls;

function init(config) {
  viewer.init(config.el, config.options);

  // Init controls
  controlInitialiser(config.options.controls);
}

origo.map.init = function initMap(options, defaultOptions) {
  const config = defaultOptions ? $.extend(origo.config, defaultOptions) : origo.config;
  const url = 'https://karta.hallstahammar.se/intern/getconfig';

  function loadMap(mapOptions, errorText) {
    const map = mapLoader(mapOptions, config);
    if (map) {
      map.then((mapConfig) => {
        init(mapConfig);
      }).then(() => {
        if (errorText) {
          modal.createModal('#o-map', {
            title: 'Kunde inte ladda konfiguration',
            content: `Något gick fel vid anslutning till databasen. Standardutförandet av kartan har laddats. Kontakta systemförvaltaren.
              Felmeddelande: ${errorText}`
          });
          modal.showModal();
        }
      });
      return viewer;
    }
    return null;
  }

  function success(result) {
    let res;
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

  if (options === 'temp.json') {
    $.ajax({
      type: 'GET',
      dataType: 'json',
      url,
      timeout: 15000,
      success,
      error
    });
  } else {
    loadMap(options);
  }
};

export default origo;
