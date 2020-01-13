import { urlSuffix } from '../../common/constants';

let labels = [];

export const queryCustomLabels = (request, sender, sendResponse, data) => {
  const { key, cookie } = request;
  const { domain, value } = cookie;
  const url = `https://${domain}/${urlSuffix.CustomLabels}`;
  const headers = { Authorization: `Bearer ${value}` };

  labels = [];

  fetchCustomLabels(url, headers, domain, key, sender.tab, data);
};

const fetchCustomLabels = (url, headers, domain, key, tab, data) => {
  fetch(url, { headers })
    .then(response => response.json())
    .then(response => {
      if (response && response.records && response.records.length > 0) {
        labels.push(...response.records);

        if (response.nextRecordsUrl) {
          fetchCustomLabels(
            `https://${domain}/${response.nextRecordsUrl}`,
            headers,
            domain,
            key,
            tab,
            data
          );
        } else {
          const { orgKey, lastUpdated } = data;

          Object.keys(data.labels).forEach(k => {
            if (k !== key && k.split('!')[0] === orgKey) {
              delete data.labels[k];
            }
          });

          data.labels[key] = data.labels[orgKey] = [...labels];
          lastUpdated[orgKey] = new Date();

          chrome.tabs.sendMessage(tab.id, { action: 'Render Labels', labels });
        }
      }
    });
};
