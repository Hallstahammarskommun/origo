import { Component, Button, Modal } from '../ui';

const Splash = function Splash(options = {}) {
  const defaultTitle = 'Om kartan';
  const defaultContent = '<p></p>';
  const cls = 'o-splash';
  let viewer;
  let closeButton;
  let modal;
  let component;

  let {
    title,
    content,
    target,
    hideText,
    confirmText
  } = options;

  const {
    buttons,
    url
  } = options;

  const addButton = function addButton() {
    const closeButtonHtml = closeButton.render();
    content += closeButtonHtml;
    return content;
  };

  const clearLocalStorage = function clearLocalStorage() {
    localStorage.removeItem('splashVisibility');
    localStorage.removeItem('splashContent');
  };

  const setLocalStorage = function setLocalStorage() {
    const newContent = localStorage.getItem('splashContent') !== content;
    if (localStorage.getItem('splashVisibility') !== 'false' || newContent) {
      localStorage.setItem('splashContent', content);
      if (newContent) {
        localStorage.setItem('splashVisibility', 'true');
      }
    }
  };

  const createModal = function createModal(modalContent) {
    content = modalContent;

    if (buttons) {
      setLocalStorage();
      component.addComponent(closeButton);
      content = addButton();
    } else {
      clearLocalStorage();
    }

    if (localStorage.getItem('splashVisibility') !== 'false') {
      modal = Modal({
        title,
        content,
        cls,
        target
      });
      component.dispatch('render');
    }
  };

  return Component({
    name: 'splash',
    onInit() {
      if (!title) title = defaultTitle;
      if (!content) content = defaultContent;
      if (options.buttons) {
        hideText = Object.prototype.hasOwnProperty.call(options.buttons, 'hideText') ? options.buttons.hideText : 'Visa inte igen';
        confirmText = Object.prototype.hasOwnProperty.call(options.buttons, 'confirmText') ? options.buttons.confirmText : 'Är du säker på att du vill dölja den här informationen?';
      }
      if (buttons) {
        closeButton = Button({
          cls: 'rounded margin-top-small padding-y grey-lightest',
          style: 'display: block;',
          text: hideText,
          click() {
            const proceed = window.confirm(confirmText);
            if (proceed) {
              modal.closeModal();
              localStorage.setItem('splashVisibility', false);
            }
          }
        });
      }
    },
    onAdd(evt) {
      component = this;
      viewer = evt.target;
      target = viewer.getId();
      if (url) {
        const fullUrl = viewer.getBaseUrl() + url;
        const req = new Request(`${fullUrl}`);
        fetch(req).then(response => response.text().then((text) => {
          content = text;
          createModal(content);
        }));
      } else {
        createModal(content);
      }
    }
  });
};

export default Splash;
