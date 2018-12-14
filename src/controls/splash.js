import $ from 'jquery';
import modal from '../modal';
import viewer from '../viewer';

const defaultTitle = 'Om kartan';
const defaultContent = '<p></p>';
const cls = 'o-splash';
let title;
let content;
let buttons;
let revisitText;
let hideText;
let confirmText;

function getContent(url) {
  return $.get(url);
}

function openModal() {
  modal.createModal('#o-map', {
    title,
    content,
    cls
  });
  modal.showModal();
}

function addButtons() {
  const visitButtons = `${'<br>' +
    '<input id="o-splash-revisit-button" type="button" value="'}${revisitText}">` +
    `<input id="o-splash-hide-button" type="button" value="${hideText}">`;

  const bodyIndex = content.lastIndexOf('</body>');
  if (bodyIndex !== -1) {
    content = content.substring(0, bodyIndex) + visitButtons + content.substring(bodyIndex);
  } else {
    content += visitButtons;
  }
}

function clearLocalStorage() {
  localStorage.removeItem('splashVisibility');
  localStorage.removeItem('splashContent');
}

function bindUIActions() {
  $('#o-splash-revisit-button').on('click', () => {
    modal.closeModal();
  });

  $('#o-splash-hide-button').on('click', () => {
    const proceed = window.confirm(confirmText);
    if (proceed) {
      modal.closeModal();
      localStorage.setItem('splashVisibility', false);
    }
  });
}

function setLocalStorage() {
  const newContent = localStorage.getItem('splashContent') !== content;
  if (localStorage.getItem('splashVisibility') !== 'false' || newContent) {
    openModal();
    bindUIActions();
    localStorage.setItem('splashContent', content);
    if (newContent) {
      localStorage.setItem('splashVisibility', 'true');
    }
  }
}

function init(optOptions) {
  const options = optOptions || {};
  title = options.title || defaultTitle;
  if (options.buttons) {
    buttons = Object.prototype.hasOwnProperty.call(options.buttons, 'visible') ? options.buttons.visible : false;
    revisitText = Object.prototype.hasOwnProperty.call(options.buttons, 'revisitText') ? options.buttons.revisitText : 'Visa vid nästa besök';
    hideText = Object.prototype.hasOwnProperty.call(options.buttons, 'hideText') ? options.buttons.hideText : 'Visa inte igen';
    confirmText = Object.prototype.hasOwnProperty.call(options.buttons, 'confirmText') ? options.buttons.confirmText : 'Är du säker på att du vill dölja den här informationen?';
  }
  if (options.url) {
    const url = viewer.getBaseUrl() + options.url;
    getContent(url)
      .done((data) => {
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

export default { init };
