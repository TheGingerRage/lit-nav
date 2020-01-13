import { queryCustomLabels } from './queryCustomLabels';

export const getLabels = (request, sender, sendResponse, data) => {
  const { labels, orgKey, lastUpdated } = data;
  const { key } = request;

  if (labels[key]) {
    sendResponse({ labels: labels[key] });
  } else if (
    labels[orgKey] &&
    lastUpdated[orgKey] &&
    new Date().getTime() - lastUpdated[orgKey].getTime() < 1000 * 60 * 60
  ) {
    sendResponse({ labels: labels[orgKey] });
  } else {
    queryCustomLabels(request, sender, sendResponse, data);
  }
};
