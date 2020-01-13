// @copyright 2012+ Daniel Nakov / SilverlineCRM
// http://silverlinecrm.com

const save = () => {
  var payload = document.getElementById('shortcut').value;

  chrome.extension.sendMessage(
    { action: 'Set Settings', key: 'shortcut', payload: payload },
    () => {
      chrome.tabs.getSelected(null, tab => {
        chrome.tabs.executeScript(tab.id, { code: 'window.location.reload();' });
      });
    }
  );
};

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('save').addEventListener('click', save);

  chrome.browserAction.setBadgeText({ text: '' });
  chrome.extension.sendMessage({ action: 'Get Settings' }, response => {
    document.getElementById('shortcut').value = response['shortcut'];
  });
});
