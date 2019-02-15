import $ from 'jquery';
import { Component, Modal } from '../ui';

const Splash = function Splash(options = {}) {
  const defaultTitle = 'Om kartan';
  const defaultContent = '<p></p>';
  const cls = 'o-splash';
  let viewer;
  let modal;

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

  const addButtons = function addButtons() {
    const visitButtons = `${'<br>'}<input id="o-splash-hide-button" type="button" value="${hideText}">`;
    const bodyIndex = content.lastIndexOf('</body>');
    if (bodyIndex !== -1) {
      content = content.substring(0, bodyIndex) + visitButtons + content.substring(bodyIndex);
    } else {
      content += visitButtons;
    }
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

  return Component({
    name: 'splash',
    onAdd(evt) {
      viewer = evt.target;
      target = viewer.getId();
      if (!title) title = defaultTitle;
      if (options.buttons) {
        hideText = Object.prototype.hasOwnProperty.call(options.buttons, 'hideText') ? options.buttons.hideText : 'Visa inte igen';
        confirmText = Object.prototype.hasOwnProperty.call(options.buttons, 'confirmText') ? options.buttons.confirmText : 'Är du säker på att du vill dölja den här informationen?';
      }

      if (url) {
        const fullUrl = viewer.getBaseUrl() + url;
        const req = new Request(`${fullUrl}`);
        fetch(req).then(response => response.text().then((text) => {
          content = text;
          if (buttons) {
            addButtons();
            setLocalStorage();
            if (localStorage.getItem('splashVisibility') === 'true') {
              this.render();
            }
          } else {
            clearLocalStorage();
            this.render();
          }
        }));
      } else {
        if (!content) content = defaultContent;
        this.render();
      }
    },
    render() {
      modal = Modal({
        title,
        content,
        cls,
        target
      });
      this.addComponent(modal);
      this.dispatch('render');
      $('#o-splash-hide-button').on('click', () => {
        const proceed = window.confirm(confirmText);
        if (proceed) {
          modal.closeModal();
          localStorage.setItem('splashVisibility', false);
        }
      });
    }
  });
};

export default Splash;
