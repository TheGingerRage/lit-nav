export const storeLabels = (request, sender, sendResponse, data) => {
  const { labels, orgKey } = data;
  const { key, payload } = request;

  Object.keys(labels).forEach(k => {
    if (k !== key && k.split('!')[0] === orgKey) {
      delete labels[k];
    }
  });

  labels[key] = labels[orgKey] = payload;
};
