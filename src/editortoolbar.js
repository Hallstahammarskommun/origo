/* ========================================================================
 * Copyright 2016 Origo
 * Licensed under BSD 2-Clause (https://github.com/origo-map/origo/blob/master/LICENSE.txt)
 * ======================================================================== */
"use strict";

var ol = require('openlayers');
var $ = require('jquery');
var viewer = require('./viewer');
var transactionhandler = require('./transactionhandler');
var editortemplate = require("./templates/editortoolbar.template.handlebars");

var activeClass = 'o-control-active';
var map = undefined;
var srsName = undefined;
var currentLayer;
var fullEditableLayers;
var editableLayers = {};
var editableLayer = undefined;
var $editAttribute = undefined;
var $editDraw = undefined;
var $editDelete = undefined;
var $editClose = undefined;
var options = {};

module.exports = function() {
  transactionhandler();
  return {
    init: Init
  };
}()

function Init(opt_options) {

  $.extend(options, opt_options)

  fullEditableLayers = viewer.getEditableLayers();

  var editLayersName = layerNameArray(fullEditableLayers);

  currentLayer = options.defaultLayer || editLayersName[editLayersName.length-1];

  map = viewer.getMap();
  srsName = viewer.getProjectionCode();

  render(selectionModel(editLayersName.reverse()));

  $('.o-map').on('enableInteraction', onEnableInteraction);

  $(document).on('changeEdit', toggleState);

  //set edit properties for editable console
  editableLayers = setEditProps(editLayersName, map, srsName);

  emitEnableInteraction();

  viewer.getLayer(editLayersName[0]).setVisible(true);

  bindUIActions();

  if (options.isActive) {
    setActive(true);
  }
}

function render(selectOptions) {
  $("#o-map").append(editortemplate(selectOptions));
  $editAttribute = $('#o-editor-attribute');
  $editDraw = $('#o-editor-draw');
  $editDelete = $('#o-editor-delete');
  $editClose = $('#o-editor-close');
}

function layerNameArray(layers) {
  var layerArray = [];

  for(var i = 0; i < layers.length; i++) {
      layerArray.push(layers[i].get('name'));
  }

  return layerArray;
}

function bindUIActions() {
  var self = this;
  $editDraw.on('click', function(e) {
    emitToggleEdit('draw');
    $editDraw.blur();
    e.preventDefault();
    return false;
  });
  $editAttribute.on('click', function(e) {
    emitToggleEdit('attribute');
    $editAttribute.blur();
    e.preventDefault();
  });
  $editDelete.on('click', function(e) {
    emitToggleEdit('delete');
    $editDelete.blur();
    e.preventDefault();
  });
  $editClose.on('click', function(e) {
    $('.o-map').first().trigger({
      type: 'enableInteraction',
      interaction: 'featureInfo'
    });
    $editClose.blur();
    e.stopPropagation();
    e.preventDefault();
  });
  $('select[name="layer-dropdown"]').change(function() {

    fullEditableLayers.filter(function(layer) {
        if(layer.getVisible()) {
            layer.setVisible(false)
        }
    });

    currentLayer = editableLayers[$(this).val()]
    emitToggleEdit('edit', {
      options: currentLayer
    });

    currentLayer.editableLayer.setVisible(true);
  });
}

function onEnableInteraction(e) {
  e.stopPropagation();
  if (e.interaction === 'editor') {
    setActive(true);
    emitToggleEdit('edit', {
      options: editableLayers[currentLayer]
    });
  } else {
    setActive(false);
    emitToggleEdit('cancel');
  }
}

function setActive(state) {
  if (state === true) {
    $('#o-editor-toolbar').removeClass('o-hidden');
  } else {
    $('#o-editor-toolbar').addClass('o-hidden');
  }
}

function emitEnableInteraction() {
  $('.o-map').first().trigger({
    type: 'enableInteraction',
    interaction: 'editor'
  });
}

function emitToggleEdit(tool, opt_options) {
  var options = opt_options || {};
  var e = {
    type: 'toggleEdit',
    tool: tool
  };
  $.extend(e, options);
  $.event.trigger(e);
}

function selectionModel(layerNames) {
  var selectOptions = layerNames.map(function(layerName) {
    var obj = {};
    obj.name = viewer.getLayer(layerName).get('title');
    obj.value = layerName;
    return obj;
  });
  return selectOptions;
}

function setEditProps(layerNames, map, srsName) {
  var initialValue = {};
  var result = layerNames.reduce(function(layerProps, layerName) {
    var layer = viewer.getLayer(layerName);
    //get the layers source options
    var source = viewer.getMapSource()[layer.get('sourceName')];

    layerProps[layerName] = {
      editableLayer: layer,
      source: layer.getSource(),
      geometryType: layer.get('geometryType') || undefined,
      geometryName: layer.get('geometryName') || undefined,
      srsName: srsName,
      featureNS: source.workspace,
      featureType: layer.get('featureType'),
      attributes: layer.get('attributes'),
      title: layer.get('title') || 'Information',
      url: source.url,
      map: map
    };
    return layerProps;
  }, initialValue);
  return result;
}

function toggleState(e) {
  if (e.tool === 'draw') {
    if (e.active === false) {
      $editDraw.removeClass(activeClass);
    } else {
      $editDraw.addClass(activeClass);
    }
  }
}
