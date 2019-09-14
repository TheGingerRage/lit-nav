export const storeMetadata = (request, sender, sendResponse, data) => {
  const { metadata, orgKey } = data;
  const { key, payload } = request;

  Object.keys(metadata).forEach(k => {
    if (k !== key && k.split('!')[0] === orgKey) {
      delete metadata[k];
    }
  });

  metadata[key] = metadata[orgKey] = payload;
  sendResponse({});
};
