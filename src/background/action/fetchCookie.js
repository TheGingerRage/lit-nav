import { excludedDomains } from '../../common/constants';

const getFilteredCookies = (allCookies, filter) => {
  return allCookies.filter(
    c => c.domain.startsWith(filter) && !excludedDomains.some(d => c.domain.endsWith(d))
  );
};

export const fetchCookie = (request, sender, sendResponse, data) => {
  const orgDomain = sender.tab.url.replace(/https?:\/\/(.*\.com).*/, '$1');
  const parts = orgDomain.split('.');

  if (parts.length > 0) {
    let orgName = parts[0].replace(/--.*/, '');

    chrome.cookies.getAll({ name: 'sid' }, allCookies => {
      let possibleCookies = getFilteredCookies(allCookies, orgName);

      if (possibleCookies.length === 0 && parts.length > 1) {
        orgName = parts[1].replace(/--.*/, '');
        possibleCookies = getFilteredCookies(allCookies, orgName);
      }

      if (possibleCookies.length > 0) {
        chrome.tabs.sendMessage(sender.tab.id, { cookie: possibleCookies[0] });
      }
    });
  }
};
