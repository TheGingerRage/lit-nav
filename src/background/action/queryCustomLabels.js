import { query, actionType } from '../../common/constants';

export const queryCustomLabels = (request, sender, sendResponse, data) => {
  const { key, cookie } = request;
  const { domain, value } = cookie;
  const url = `https://${domain}/services/data/v43.0/tooling/query/?q=${query.CustomLabels}`;
  const headers = { Authorization: `Bearer ${value}` };

  localStorage.removeItem(`labels:${key}`);

  fetchCustomLabels(url, headers, domain, key, sender.tab);
};

const fetchCustomLabels = (url, headers, domain, key, tab) => {
  fetch(url, { headers })
    .then(response => response.json())
    .then(response => {
      chrome.tabs.sendMessage(tab.id, {
        key,
        action: actionType.STORE_LABELS,
        payload: response.records
      });

      if (response.nextRecordsUrl) {
        fetchCustomLabels(
          `https://${domain}/${response.nextRecordsUrl}`,
          headers,
          domain,
          key,
          tab
        );
      } else {
        chrome.tabs.sendMessage(tab.id, { action: 'Render Labels' });
      }
    });
};
