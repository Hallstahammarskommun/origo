/* ========================================================================
 * Copyright 2016 Origo
 * Licensed under BSD 2-Clause (https://github.com/origo-map/origo/blob/master/LICENSE.txt)
 * ======================================================================== */
"use strict";

var ol = require('openlayers');
var $ = require('jquery');
var Viewer = require('./viewer');
var wktToFeature = require('./maputils')['wktToFeature'];
var Popup = require('./popup');
var typeahead = require('../externs/typeahead.bloodhound.browserify.js');
typeahead.loadjQueryPlugin();
var Bloodhound = require('../externs/typeahead.bloodhound.browserify.js').Bloodhound;
var getFeature = require('./getfeature');
var getAttributes = require('./getattributes');
var featureInfo = require('./featureinfo');
var mapUtils = require('./maputils');
var getCenter = require('./geometry/getcenter');
var utils = require('./utils');

var adress, fastighet, gatunamn;
var map,
    name,
    geometryAttribute,
    titleAttribute,
    contentAttribute,
    maxZoomLevel,
    urlAds,
    urlFat,
    urlGan,
    title,
    hintText,
    hint,
    highlight,
    projectionCode;

function init(options){

    name = options.searchAttribute;
    geometryAttribute = options.geometryAttribute;
    urlAds = options.urlAds;
    urlFat = options.urlFat;
    urlGan = options.urlGan;
    title = options.title || '';
    titleAttribute = options.titleAttribute || undefined;
    contentAttribute = options.contentAttribute || undefined;
    maxZoomLevel: options.maxZoomLevel || 2;
    hintText = options.hintText || "Sök i Hallstakartan";
    hint = options.hasOwnProperty('hint') ? options.hint : true;
    highlight = options.hasOwnProperty('highlight') ? options.highlight : true;
    projectionCode = Viewer.getProjectionCode();

    map = Viewer.getMap();

    var el = '<div id="o-search-wrapper">' +
                '<div id="o-search" class="o-search o-search-false">' +
                    '<input class="o-search-field typeahead form-control" type="text" placeholder="' + hintText + '">' +
                    '<button id="o-search-button-close">' +
                        '<svg class="o-icon-search-fa-times">' +
                            '<use xlink:href="#fa-times"></use>' +
                        '</svg>' +
                    '</button>' +
                '</div>' +
              '</div>';
    $('#o-map').append(el);
    // constructs the suggestion engine
    // fix for internet explorer
        // constructs the suggestion engine
        // fix for internet explorer
    $.support.cors = true;
    fastighet = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace(),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url: urlFat + '?q=&QUERY',
        wildcard: '&QUERY',
    }
    });
    adress = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace(),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url: urlAds + '?q=%QUERY',
        wildcard: '%QUERY'
      }
    });
    gatunamn = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace(),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url: urlGan + '?q=%QUERY',
        wildcard: '%QUERY'
      }
    });

    adress.initialize();
    fastighet.initialize();
    gatunamn.initialize();

    $('.typeahead').typeahead({
      autoSelect: true,
      hint: hint,
      highlight: highlight,
      minLength: 2
    }, {
      name: 'fastighet',
      limit: 5,
      displayKey: name,
      source: fastighet,
      templates: {
          footer: '<h3 class="multiple-datasets"></h3>'
        }
      }, {
        name: 'gatunamn',
        limit: 5,
        displayKey: name,
        source: gatunamn,
        templates: {
            footer: '<h3 class="multiple-datasets"></h3>'
          }
      }, {
        name: 'adress',
        limit: 5,
        displayKey: name,
        source: adress
      });

    bindUIActions();
}
function bindUIActions() {
        $('.typeahead').on('typeahead:selected', selectHandler);

        $('#o-search .o-search-field').on('input', function() {
          if($('#o-search .o-search-field.tt-input').val() &&  $('#o-search').hasClass('o-search-false')) {
            $('#o-search').removeClass('o-search-false');
            $('#o-search').addClass('o-search-true');
            onClearSearch();
          }
          else if(!($('#o-search .o-search-field.tt-input').val()) &&  $('#o-search').hasClass('o-search-true')) {
            $('#o-search').removeClass('o-search-true');
            $('#o-search').addClass('o-search-false');
            offClearSearch();
          }
        });
}
function onClearSearch() {
    $('#o-search-button-close').on('click', function(e) {
      $('.typeahead').typeahead('val', '');
      featureInfo.clear();
      Viewer.removeOverlays();
      $('#o-search').removeClass('o-search-true');
      $('#o-search').addClass('o-search-false');
      $('#o-search .o-search-field.tt-input').val('');
      $('#o-search-button').blur();
      e.preventDefault();
    });
}

function offClearSearch() {
    console.log('offClearSearch');
    // $('#search-button').off('click', function(e) {
    //   e.preventDefault();
    // });
}
/*function showOverlay(data, coord) {
    Viewer.removeOverlays();
    var popup = Popup('#o-map');
    var overlay = new ol.Overlay({
        element: popup.getEl()
    });

    map.addOverlay(overlay);

    overlay.setPosition(coord);
    var content = data[name];
    // content += '<br>' + data.postnr + '&nbsp;' + data.postort;
    popup.setContent({
        content: content,
        title: title
    });
    popup.setVisibility(true);

    mapUtils.zoomToExent(new ol.geom.Point(coord), maxZoomLevel);
}*/
function showFeatureInfo(features, title, content) {
    var obj = {};
    obj.feature = features[0];
    obj.title = title;
    obj.content = content;
    featureInfo.identify([obj], 'overlay', getCenter(features[0].getGeometry()));
    mapUtils.zoomToExent(features[0].getGeometry(), maxZoomLevel);
}

/**There are several different ways to handle selected search result.
 * Option 1. Feature info is requested from a map service.
 * In this case idAttribute and layerNameAttribute must be provided.
 * A map service is used to get the geometry and attributes. The layer is defined
 * as an ordinary layer in the layer config section.
 * Option 2. Same as option 1 but for single layer search. layerName is defined
 * as an option and is not included in the search response.
 * In this case geometryAttribute and layerName must be provided.
 * Option 3. Complete feature info is included in the search result.
 * In this case titleAttribute, contentAttribute and geometryAttribute must be provided.
 * Option 4. This is a single table search. No layer is defined.
 * In this case geometryAttribute and title must be defined.
 * Option 5. Feature info is shown without selection in the map.
 * This is a simple single table search. In this case title, northing and easting
 * must be defined.
 */
function selectHandler(evt, data) {

 if (titleAttribute && contentAttribute && geometryAttribute) {
        var feature = wktToFeature(data[geometryAttribute], projectionCode);
        //Make sure the response is wrapped in a html element
        var content = utils.createElement('div', data[contentAttribute])
        showFeatureInfo([feature], data[titleAttribute], content);
    } else {
        console.log('Search options are missing');
    }
}

module.exports.init = init;
