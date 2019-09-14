export const lightningMetadata = (request, sender, sendResponse, data) => {
  const targetUrl = `${sender.tab.url.split('/lightning')[0]}/ui/setup/Setup`;

  chrome.tabs.create({ url: targetUrl, active: false }, tab => {
    setTimeout(() => chrome.tabs.remove(tab.id), 4000);
  });
};
