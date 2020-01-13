import { excludedDomains, urlSuffix } from '../../common/constants';

const getFilteredCookies = (allCookies, filter) => {
  return allCookies.filter(
    c => c.domain.startsWith(filter) && !excludedDomains.some(d => c.domain.endsWith(d))
  );
};

const getDomain = url => {
  const a = document.createElement('a');
  a.setAttribute('href', url);
  return a.hostname;
};

export const fetchCookie = (request, sender, sendResponse, data) => {
  const orgDomain = getDomain(sender.tab.url);
  const parts = orgDomain.split('.');
  let orgName = parts[0];

  chrome.cookies.getAll({ name: 'sid' }, allCookies => {
    let possibleCookies = getFilteredCookies(allCookies, orgName);

    while (possibleCookies.length === 0 && orgName.lastIndexOf('--') !== -1) {
      orgName = orgName.substring(0, orgName.lastIndexOf('--'));
      possibleCookies = getFilteredCookies(allCookies, orgName);
    }

    if (possibleCookies.length > 0) {
      let cookie = null;

      possibleCookies.forEach(c => {
        const testUrl = `https://${c.domain}/${urlSuffix.TestCookie}`;
        const headers = { Authorization: `Bearer ${c.value}` };

        fetch(testUrl, { headers })
          .then(response => {
            if (response.status === 200 && !cookie) {
              cookie = c;
              chrome.tabs.sendMessage(sender.tab.id, { cookie });
            }
          })
          .catch(err => console.error(err));
      });
    }
  });
};
