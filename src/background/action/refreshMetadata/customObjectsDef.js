import { urlSuffix } from '../../../common/constants';

let records;

export const getCustomObjectsDef = ({ domain, value }, commands) => {
  const url = `https://${domain}/${urlSuffix.CustomObjectDef}`;
  const headers = { Authorization: `Bearer ${value}` };

  records = [];

  return new Promise((resolve, reject) =>
    fetchCustomObjectsDef(url, headers, domain, commands, resolve, reject)
  );
};

const fetchCustomObjectsDef = (url, headers, domain, commands, resolve, reject) => {
  fetch(url, { headers })
    .then(response => response.json())
    .then(response => {
      if (response && Array.isArray(response.records)) {
        records.push(...response.records);

        if (response.nextRecordsUrl) {
          fetchCustomObjectsDef(
            `https://${domain}/${response.nextRecordsUrl}`,
            headers,
            domain,
            commands,
            resolve,
            reject
          );
        } else {
          records.forEach(obj => {
            if (obj.attributes != null) {
              const { ManageableState, NamespacePrefix, DeveloperName } = obj;

              if (ManageableState !== 'unmanaged' || !NamespacePrefix) {
                const action = {
                  key: DeveloperName,
                  keyPrefix: obj.Id,
                  url: `http://${domain}/${obj.Id}`
                };
                const apiName =
                  (NamespacePrefix ? `${NamespacePrefix}__` : '') + `${DeveloperName}__c`;
                commands[`Setup > Custom Object > ${apiName}`] = action;
              }
            }
          });

          resolve();
        }
      }
    });
};
