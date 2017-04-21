 /* ========================================================================
 * Copyright 2016 Origo
 * Licensed under BSD 2-Clause (https://github.com/origo-map/origo/blob/master/LICENSE.txt)
 * ======================================================================== */
"use strict";

var $ = require('jquery');
var Utils = require('./utils');
var Modal = require('./modal');
var viewer = require('./viewer');
var formCreator = require('./utils/formcreator');

var buttonText;
var title;
var content;
var form;
var text;
var formOptions;
var url;
var formElement;
var attributeObjects;
var map;
var options;
var currentExtent;
var useVisibleLayers;
var layers;

function init(opt_options) {

  map = viewer.getMap();
  layers = map.getLayers();
  options = opt_options || {};
  formOptions = options.params;
  buttonText = options.buttontext || '';
  url = options.url || '';
  title = options.title || '';
  currentExtent = options.currentExtent || false;
  useVisibleLayers = options.useVisibleLayers || false;
  text = options.text || '<p></p>';

  //Create an array of defined attributes and corresponding values from selected feature
  attributeObjects = formOptions.map(function(attributeObject) {
    var obj = {};
    $.extend(obj, attributeObject);
    obj.elId = '#input-' + obj.name;
    obj.formElement = formCreator(obj);
    return obj;
  });

  var formElement = attributeObjects.reduce(function(prev, next) {
    return prev + next.formElement;
  }, '');

  form = '<br><form>' + formElement + '<br><div class="o-form-save"><input id="o-save-button" type="button" value="Spara"></input></div></form>';
  render();
  bindUIActions();
}

function render() {
  var el = Utils.createListButton({
    id: 'o-download',
    iconCls: 'o-icon-fa-download',
    src: 'css/svg/fa-icons.svg#fa-download',
    text: buttonText
  });
  $('#o-menutools').append(el);
}

function bindUIActions() {
  $('#o-download-button').on('click', function(e) {

    if (useVisibleLayers) {
      content = '';
      content = text + '<br><br>' + getLayerTitles() + form;
    } else {
      content = '';
      content = text + '<br>' +form;
    }

    Modal.createModal('#o-map', {
      title: title,
      content: content,
    });

    Modal.showModal();
    $('#o-save-button').on('click', function(e) {
      var params = {};
      attributeObjects.forEach(function(obj) {
        params[obj.name.toString()] = $(obj.elId).val();
      });

      Modal.closeModal();
      $('#o-save-button').blur();
      fme(params);
      e.preventDefault();
    });
  });
}

function fme(params) {
  var size;
  var extent;
  var visibleLayers;
  var paramsLength = Object.keys(params).length;
  var i;
  var fmeUrl;

  fmeUrl = url;

  for(i = 0; i < paramsLength; i++) {
    if (i ===  (paramsLength - 1)) {
      fmeUrl += Object.keys(params)[i] + '=' + params[Object.keys(params)[i]];
    } else {
      fmeUrl += Object.keys(params)[i] + '=' + params[Object.keys(params)[i]] + '&';
    }
  }

  if (useVisibleLayers) {
    visibleLayers = getVisibleLayers();
    visibleLayers = visibleLayers.replace(/;/g, '%20');
    fmeUrl += '&layer=' + visibleLayers;
  }

  if (currentExtent) {
    size = map.getSize();
    extent = map.getView().calculateExtent(size);
    extent = encodeURI(extent).replace(/,/g, '%20');
    fmeUrl += '&extent=' + extent;
  }

    window.open(fmeUrl);
}

function getVisibleLayers() {
  var layerNames = '';

  layers.forEach(function(el) {
    if (el.getVisible() === true && el.get('group') != 'background' && el.get('group') != 'tom') {
      layerNames += el.get('name') + ';';
    }
  });
  layerNames = layerNames.slice(0, -1);
  return layerNames;
}

function getLayerTitles() {
  var layerTitles = '';

  layers.forEach(function(el) {
    if (el.getVisible() === true && el.get('group') != 'background' && el.get('group') != 'tom') {
      layerTitles += '<li>' + el.get('title') + '</li>';
    }
  });
  return layerTitles;
}

module.exports.init = init;
