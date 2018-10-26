import $ from 'jquery';
import utils from '../utils';
import modal from '../modal';
import viewer from '../viewer';

let $aboutButton;

function render() {
  const el = utils.createListButton({
    id: 'o-save',
    iconCls: 'o-icon-fa-info',
    text: '',
    src: '#ic_save_24px'
  });
  $('#o-menutools').append(el);
  $aboutButton = $('#o-save-button');
}


function bindUIActions() {
  $aboutButton.on('click', (e) => {
    const config = viewer.getConfig();
    const layers = viewer.getLayers();

    function getLayersVisibility(viewerLayers) {
      const layerProperties = [];
      viewerLayers.forEach((layer) => {
        const currentLayer = {};
        currentLayer.visibility = layer.getVisible() === true;
        currentLayer.name = layer.get('name');
        currentLayer.group = layer.get('group');
        layerProperties.push(currentLayer);
      });
      return layerProperties;
    }

    const currentLayers = getLayersVisibility(layers);

    function updateConfig() {
      currentLayers.forEach((currentLayer) => {
        config.layers.filter((configLayer) => {
          if (configLayer.name === currentLayer.name) {
            const layer = configLayer;
            layer.visible = currentLayer.visibility;
          }
          return false;
        });
      });
    }

    updateConfig();

    function success(result) {
      if (Object.property.hasOwnProperty.call(result, 'errno')) {
        modal.createModal('#o-map', {
          title: 'Ojdå.',
          content: `${'Något gick fel när din kartkonfigration skulle sparas. Kontakta systemförvaltaren.<hr>' +
            'Felmeddelande: '}${result.code}`
        });
        modal.showModal();
      } else {
        modal.createModal('#o-map', {
          title: 'Kartkonfiguration sparad',
          content: 'Din kartkonfiguration är nu sparad.'
        });
        modal.showModal();
      }
    }

    function error(jqXHR, textStatus) {
      modal.createModal('#o-map', {
        title: 'Ojdå.',
        content: `${'Något gick fel när din kartkonfigration skulle sparas. Kontakta systemförvaltaren.<hr>' +
          'Felmeddelande: '}${textStatus}`
      });
      modal.showModal();
    }

    $.ajax({
      type: 'POST',
      data: JSON.stringify(config),
      contentType: 'application/json',
      dataType: 'json',
      url: 'https://karta.hallstahammar.se/intern/saveconfig',
      timeout: 15000,
      success,
      error
    });

    e.preventDefault();
  });
}

function init() {
  render();
  bindUIActions();
}

export default { init };
