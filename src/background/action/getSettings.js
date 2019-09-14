export const getSettings = (request, sender, sendResponse, data) => {
  let settings = localStorage.getItem('litnav_settings');

  if (settings) {
    sendResponse(JSON.parse(settings));
  } else {
    settings = {
      shortcut: 'ctrl+shift+space'
    };

    localStorage.setItem('litnav_settings', JSON.stringify(settings));
    sendResponse(settings);
  }
};
