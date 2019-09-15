export const storeLabels = (request, sender, sendResponse, data) => {
  const { key, payload } = request;
  let labels = localStorage.getItem(`labels:${key}`);

  if (labels) {
    labels = JSON.parse(labels);
  } else {
    labels = [];
  }

  localStorage.setItem(`labels:${key}`, JSON.stringify([...labels, ...payload]));
};
