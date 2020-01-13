import { actions } from './action';

let commands = {};
let metadata = {};
let lastUpdated = {};
let labels = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const orgKey = request.key != null ? request.key.split('!')[0] : null;
  const data = { commands, metadata, lastUpdated, labels, orgKey };

  if (actions[request.action]) {
    actions[request.action](request, sender, sendResponse, data);
  }
});
