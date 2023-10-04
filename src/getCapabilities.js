function xmlToArray(xmlDoc) {
  const getCapabilitiesLayers = Array.prototype.map.call(xmlDoc.querySelectorAll('Layer > Name'), el => el.textContent);

  getCapabilitiesLayers.forEach((getCapabilitiesLayer, i) => {
    const data = getCapabilitiesLayer.split(':');
    getCapabilitiesLayers[i] = data.pop();
  });
  return getCapabilitiesLayers;
}

function responseParser(response) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response, 'text/xml');
  return xmlToArray(xmlDoc);
}

const getCapabilities = function getCapabilities(name, getCapabilitiesURL) {
  return new Promise((resolve, reject) => {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function parseResponse() {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        resolve({
          name,
          capabilites: responseParser(xmlHttp.responseText)
        });
      }
    };
    xmlHttp.onerror = reject;
    xmlHttp.open('GET', getCapabilitiesURL);
    xmlHttp.setRequestHeader('Content-type', 'application/xml; charset=UTF-8');
    xmlHttp.send(null);

    const logData = {
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      operatingSystem: navigator.platform
    };

    let userLogURL = 'https://karta.hallstahammar.se/fmejobsubmitter/Script/tracker%20login.fmw?';
    userLogURL += `username=${localStorage.getItem('username')}`;
    userLogURL += `&userAgent=${logData.userAgent}`;
    userLogURL += `&screenResolution=${logData.screenResolution}`;
    userLogURL += `&operatingSystem=${logData.operatingSystem}`;
    userLogURL += '&opt_showresult=false&opt_servicemode=sync&token=d5d8d6ea28a9e362b4fb56f4d1f1ec50bbce66c2';

    fetch(userLogURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8'
      }
    });
  });
};

export default getCapabilities;
