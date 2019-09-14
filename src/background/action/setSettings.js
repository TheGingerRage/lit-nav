export const setSettings = (request, sender, sendResponse, data) => {
  let settings = localStorage.getItem('litnav_settings');

  if (settings != null) {
    settings = JSON.parse(settings);
    settings[request.key] = request.payload;
    localStorage.setItem('litnav_settings', JSON.stringify(settings));
  }

  sendResponse();
};
