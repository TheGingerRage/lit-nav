const openShorcuts = () => {
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts', active: true });
};

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('shortcut-link').addEventListener('click', openShorcuts);
  chrome.browserAction.setBadgeText({ text: '' });
});
