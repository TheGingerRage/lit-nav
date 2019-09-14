export const visualForceMetadata = (request, sender, sendResponse, data) => {
  const { url } = sender.tab;
  const [p1, p2, p3] = url.split('--');
  const targetUrl = `${p1}--${p2}.${p3.split('.')[1]}.cloudforce.com/ui/setup/Setup`;

  chrome.tabs.create({ url: targetUrl, active: false }, function(tab) {
    setTimeout(() => chrome.tabs.remove(tab.id), 4000);
  });
};
