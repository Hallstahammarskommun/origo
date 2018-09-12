"use strict";

var $ = require('jquery');
var Modal = require('./modal');
var viewer = require('./viewer');

var defaultTitle = 'Om kartan';
var defaultContent = '<p></p>';
var cls = 'o-splash';
var title;
var content;
var buttons;
var revisitText;
var hideText;
var confirmText;

function init(opt_options) {
  var options = opt_options || {};
  var url;
  title = options.title || defaultTitle;
  if (options.buttons) {
    buttons = options.buttons.hasOwnProperty('visible') ? options.buttons.visible : false;
    revisitText = options.buttons.hasOwnProperty('revisitText') ? options.buttons.revisitText : 'Visa vid nästa besök';
    hideText = options.buttons.hasOwnProperty('hideText') ? options.buttons.hideText : 'Visa inte igen'
    confirmText = options.buttons.hasOwnProperty('confirmText') ? options.buttons.confirmText : 'Är du säker på att du vill dölja den här informationen?';
  }

  if (options.url) {
    url = viewer.getBaseUrl() + options.url;
    getContent(url)
      .done(function(data) {
        content = data;
        if (buttons) {
          addButtons();
          setLocalStorage();
        } else {
          clearLocalStorage();
          openModal();
        }
      });
  } else {
    content = options.content || defaultContent;
    if (buttons) {
      addButtons();
      setLocalStorage();
    } else {
      clearLocalStorage();
      openModal();
    }
  }
}

function bindUIActions() {
  $('#o-splash-revisit-button').on('click', function(e) {
    Modal.closeModal();
  });

  $('#o-splash-hide-button').on('click', function(e) {
    var proceed = confirm(confirmText);
    if (proceed) {
      Modal.closeModal();
      localStorage.setItem("splashVisibility", false)
    }
  });

}

function getContent(url) {
  return $.get(url);
}

function addButtons() {
  var visitButtons = '<br>' +
    '<input id="o-splash-revisit-button" type="button" value="' + revisitText + '">' +
    '<input id="o-splash-hide-button" type="button" value="' + hideText + '">';

  var bodyIndex = content.lastIndexOf("</body>");
  if (bodyIndex != -1) {
    content = content.substring(0, bodyIndex) + visitButtons + content.substring(bodyIndex);
  } else {
    content += visitButtons;
  }
}

function clearLocalStorage() {
  localStorage.removeItem('splashVisibility');
  localStorage.removeItem('splashContent');
}

function setLocalStorage() {
  var newContent = localStorage.getItem("splashContent") != content;
  if (localStorage.getItem("splashVisibility") != "false" || newContent) {
    openModal();
    bindUIActions();
    localStorage.setItem("splashContent", content)
    if (newContent) {
      localStorage.setItem("splashVisibility", "true")
    }
  }
}

function openModal() {
  Modal.createModal('#o-map', {
    title: title,
    content: content,
    cls: cls
  });
  Modal.showModal();
}

module.exports.init = init;
