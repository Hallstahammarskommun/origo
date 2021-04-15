// import DrawInteraction from 'ol/interaction/Draw';
// import ModifyInteraction from 'ol/interaction/Modify';
import formCreator from '../utils/formcreator';
import sidebar from '../sidebar';
// import featureLayer from '../featurelayer';
import { Component } from '../ui';

const Download = function Download(options = {}) {
  const {
    icon = '#ic_get_app_24px',
    title = 'Hämta data'
  } = options;

  let viewer;
  let mapMenu;
  let menuItem;

  // let activeButton;
  let selectedIndex;
  // let drawInteraction;
  // let modifyInteraction;
  let drawLayer;
  // let areaButtons;
  let layerTitles;
  let form;
  let layerInfo;
  let formOptions;
  let formElement;
  let attributeObjects;
  let map;
  let layers;

  function getLayerTitles() {
    let titles = '';
    layers.forEach((el) => {
      if (el.getVisible() === true && el.get('fme')) {
        titles += `<li>${el.get('title')}</li>`;
      }
    });
    return titles;
  }

  function setSidebarContent() {
    attributeObjects = formOptions.map((attributeObject) => {
      const obj = {};
      Object.assign(obj, attributeObject);
      obj.elId = `#input-${obj.name}`;
      obj.formElement = formCreator(obj);
      return obj;
    });

    if (selectedIndex) {
      `#input-DestinationFormat :nth-child(${selectedIndex + 1})`.el.selected(true);
    }
    layerTitles = getLayerTitles();

    if (layerTitles) {
      layerInfo = `<br>Nedan listas de lager som du kommer att hämta från den aktuella vyn:<br><br>${layerTitles}<br>`;
    } else {
      layerInfo = '<p style="font-style:italic;">Du måste tända ett nedladdningsbart lager i kartan för att kunna hämta hem data.</p>';
    }

    formElement = attributeObjects.reduce((prev, next) => prev + next.formElement, '');
    /* areaButtons = '<input id="o-extent-button" type="button" value="Aktuell vy"></input>' +
     '<input id="o-drawarea-button" type="button" value="Rita område"></input><br>';

    if (activeButton === 'area') {
      areaButtons = areaButtons.replace('"o-drawarea-button"', '"o-drawarea-button" class="o-area-active"');
    } else {
      areaButtons = areaButtons.replace('"o-extent-button"', '"o-extent-button" class="o-area-active"');
    } */
    form = `<br><form>${formElement}<br><input id="o-fme-download-button" type="button" value="Spara" disabled></input></div></form>`;
    return `<div id="tool-instructions">${layerInfo}</div>${form}`;
  }

  function fmeDownloadEnabled() {
    if (layerTitles && document.querySelector('#input-DestinationFormat')[0].selectedIndex !== 0) {
      document.querySelector('#o-fme-download-button').removeAttribute('disabled');
    } else {
      document.querySelector('#o-fme-download-button').disabled = true;
    }
  }

  /* function initInteractions() {
    if (!drawLayer) {
      drawLayer = featureLayer(null, map);
    }
    drawInteraction = new DrawInteraction({
      source: drawLayer.getFeatureLayer().getSource(),
      type: 'Polygon'
    });
    modifyInteraction = new ModifyInteraction({
      source: drawLayer.getFeatureLayer().getSource()
    });
    drawInteraction.on('drawstart', () => {
      $('.o-map').first().trigger({
        type: 'enableInteraction',
        interaction: 'download'
      });
      drawLayer.getFeatureLayer().getSource().clear();
    });
    drawInteraction.on('drawend', () => {
      map.removeInteraction(drawInteraction);
      drawLayer.getFeatureLayer().getSource().clear();
      sidebar.setVisibility(true);
    });
  }

  function addInteractions() {
    map.addInteraction(drawInteraction);
    map.addInteraction(modifyInteraction);
  }

  function drawInteractionAdded() {
    let interactionExist;
    map.getInteractions().forEach((interaction) => {
      if (interaction instanceof DrawInteraction) {
        interactionExist = true;
      }
    });
    return interactionExist;
  }

  function removeInteractions() {
    map.removeInteraction(drawInteraction);
    map.removeInteraction(modifyInteraction);
  } */

  function getVisibleLayers() {
    let layerNames = '';
    layers.forEach((el) => {
      if (el.getVisible() === true && el.get('fme')) {
        layerNames += `${el.get('name')};`;
      }
    });
    layerNames = layerNames.slice(0, -1);
    return layerNames;
  }

  function sendToFME(params) {
    const size = map.getSize();
    let extent;
    // let drawExtent;
    let visibleLayers;
    const paramsLength = Object.keys(params).length;
    let i;
    let fmeUrl = options.url;

    for (i = 0; i < paramsLength; i += 1) {
      if (i === (paramsLength - 1)) {
        fmeUrl += `${Object.keys(params)[i]}=${params[Object.keys(params)[i]]}`;
      } else {
        fmeUrl += `${Object.keys(params)[i]}=${params[Object.keys(params)[i]]}&`;
      }
    }

    const formatTypes = {
      dwg: 'ACAD',
      shape: 'ESRISHAPE',
      GeoJSON: 'GEOJSON',
      GeoPackage: 'GEOPACKAGE'
    };
    fmeUrl = fmeUrl.replace(/dwg|shape|GeoJSON|GeoPackage/gi, matched => formatTypes[matched]);

    visibleLayers = getVisibleLayers();
    visibleLayers = visibleLayers.replace(/;/g, '%20');
    fmeUrl += `&layer=${visibleLayers}`;

    // Aktuell vy är vald, annars ritat område. Avrundar till 2 decimaler.
    // if ($('#o-extent-button').hasClass('o-area-active')) {
    // size = map.getSize();
    extent = map.getView().calculateExtent(size);
    extent.forEach((coordinate, j) => {
      extent[j] = Math.round(coordinate * 100) / 100;
    });
    extent = encodeURI(extent).replace(/,/g, '%20');
    fmeUrl += `&extent=${extent}`;
    /* } else {
      const feature = drawLayer.getFeatureLayer().getSource().getFeatures()[0];
      drawExtent = feature.getGeometry().getCoordinates();
      drawExtent.forEach((coordinateArray) => {
        coordinateArray.forEach((coordinatePair) => {
          coordinatePair.forEach((_coordinate, index, coordArray) => {
            const drawCoordArray = coordArray;
            drawCoordArray[index] = Math.round(drawCoordArray[index] * 100) / 100;
          });
        });
      });
      drawExtent = encodeURI(drawExtent).replace(/,/g, '%20');
      fmeUrl += `&polygon=${drawExtent}`;
    } */

    window.open(fmeUrl, '_self');
  }

  return Component({
    name: 'download',
    onAdd(evt) {
      viewer = evt.target;
      map = viewer.getMap();
      layers = map.getLayers();
      formOptions = options.params;
      mapMenu = viewer.getControlByName('mapmenu');
      menuItem = mapMenu.MenuItem({
        click() {
          mapMenu.close();
          sidebar.init(viewer);
          sidebar.setContent({
            content: setSidebarContent(),
            title: 'Hämta data'
          });

          fmeDownloadEnabled();
          sidebar.setVisibility(true);

          document.querySelector('#input-DestinationFormat').addEventListener('change', () => {
            fmeDownloadEnabled();
          });

          // initInteractions();

          /* if (document.querySelector('#o-drawarea-button').classList.contains('o-area-active')) {
            addInteractions();
          } */

          /* document.querySelector('#o-extent-button').addEventListener('click', () => {
            if (document.querySelector('#o-drawarea-button').classList.contains('o-area-active')) {
              $('#o-drawarea-button').removeClass('o-area-active');
            }

            if (!document.querySelector('#o-extent-button').classList.contains('o-area-active')) {
              $('#o-extent-button').addClass('o-area-active');
              drawLayer.getFeatureLayer().getSource().clear();
            }
            const interactionExist = drawInteractionAdded();

            if (interactionExist) {
              removeInteractions();
            }
          });

          document.querySelector('#o-drawarea-button').addEventListener('click', () => {
            if (document.querySelector('#o-extent-button').classList.contains('o-area-active')) {
              $('#o-extent-button').removeClass('o-area-active');
            }

            if (!document.querySelector('#o-drawarea-button').classList.contains('o-area-active')) {
              $('#o-drawarea-button').addClass('o-area-active');
            }

            if (document.querySelector('#o-drawarea-button').classList.contains('o-area-active')) {
              const interactionExist = drawInteractionAdded();

              if (!interactionExist) {
                addInteractions();
              }
            }
          }); */

          document.querySelector('#o-fme-download-button').addEventListener('click', (e) => {
            const params = {};
            attributeObjects.forEach((obj) => {
              const formatSelector = document.getElementById('input-DestinationFormat');
              params[obj.name.toString()] = formatSelector.options[formatSelector.selectedIndex].value;
            });
            document.querySelector('#o-fme-download-button').classList.replace('focus', 'blurred');
            sendToFME(params);
            e.preventDefault();
          });

          document.querySelector('#o-close-button').addEventListener('click', () => {
            if (drawLayer) {
              drawLayer.getFeatureLayer().getSource().clear();
            }

            /* if (document.querySelector('#o-drawarea-button').classList.contains('o-area-active')) {
              activeButton = 'area';
            } else {
             activeButton = 'extent';
            } */

            if (document.querySelector('#input-DestinationFormat')[0].selectedIndex !== 0) {
              selectedIndex = document.querySelector('#input-DestinationFormat')[0].selectedIndex;
            } else {
              selectedIndex = 0;
            }
            // const interactionExist = drawInteractionAdded();

            /* if (interactionExist) {
              removeInteractions();
            } */
          });
        },
        icon,
        title
      });
      this.addComponent(menuItem);
      this.render();
    },
    render() {
      mapMenu.appendMenuItem(menuItem);
      this.dispatch('render');
    }
  });
};

export default Download;
