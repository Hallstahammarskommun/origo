"use strict";

var defaultStyle = require('./stylefunctions/default');
var detaljplanStyle = require('./stylefunctions/detaljplan');

var customStyles = {
  default: defaultStyle,
  detaljplan: detaljplanStyle
};

module.exports = function styleFunctions(customStyle, params) {
  if (customStyle in customStyles) {
    return customStyles[customStyle](params);
  } else {
    return customStyles.default(params);
  }
};
