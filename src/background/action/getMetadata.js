export const getMetadata = (request, sender, sendResponse, data) => {
  const { metadata, orgKey } = data;
  const { key } = request;

  if (metadata[key] != null) {
    sendResponse(metadata[key]);
  } else if (metadata[orgKey] != null) {
    sendResponse(metadata[orgKey]);
  } else {
    sendResponse(null);
  }
};
