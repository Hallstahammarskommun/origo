/* ========================================================================
 * Copyright 2016 Origo
 * Licensed under BSD 2-Clause (https://github.com/origo-map/origo/blob/master/LICENSE.txt)
 * ======================================================================== */
 "use strict";

var $ = require('jquery');
var utils = require('./utils');
var editortoolbar = require('./editortoolbar');

var $editorButton;

module.exports = function() {

  return {
    init: Init
  };
}();

function Init(options) {
  editortoolbar.init(options);
}
