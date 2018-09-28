"use strict";

var defaultStyle = require('./stylefunctions/default');
var detaljplanStyle = require('./stylefunctions/detaljplan');
var detaljplanFocusStyle = require('./stylefunctions/detaljplanfocus');

var customStyles = {
  default: defaultStyle,
  detaljplan: detaljplanStyle,
  detaljplanFocus: detaljplanFocusStyle
};

module.exports = function styleFunctions(customStyle, params) {
  if (customStyle in customStyles) {
    return customStyles[customStyle](params);
  } else {
    return customStyles.default(params);
  }
};
