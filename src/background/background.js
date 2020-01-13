import { actions } from './action';
import { command, actionType } from '../common/constants';

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

chrome.commands.onCommand.addListener(cmd => {
  if (cmd === command.ShowCommandBar) {
    chrome.tabs.getSelected(null, tab => {
      chrome.tabs.sendMessage(tab.id, { action: actionType.SHOW_COMMAND_BAR });
    });
  }
});
