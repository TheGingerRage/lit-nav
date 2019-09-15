export const getLabels = (request, sender, sendResponse, data) => {
  let labels = localStorage.getItem(`labels:${request.key}`);

  if (labels) {
    sendResponse(JSON.parse(labels));
  } else {
    sendResponse();
  }
};
