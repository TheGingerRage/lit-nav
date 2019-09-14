export const getLabels = (request, sender, sendResponse, data) => {
  const { labels, orgKey } = data;
  const { key } = request;

  if (labels[key]) {
    sendResponse(labels[key]);
  } else if (labels[orgKey]) {
    sendResponse(labels[orgKey]);
  } else {
    sendResponse();
  }
};
