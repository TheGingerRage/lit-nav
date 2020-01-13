import { urlSuffix } from '../../../common/constants';

export const getObjectMetadata = ({ domain, value }, commands) => {
  const url = `https://${domain}/${urlSuffix.ObjectMetadata}`;
  const headers = { Authorization: `Bearer ${value}` };

  return fetch(url, { headers })
    .then(response => response.json())
    .then(response => {
      response.sobjects.forEach(obj => {
        if (obj.keyPrefix) {
          const { label, labelPlural, keyPrefix, name } = obj;

          let action = {
            key: name,
            keyPrefix: keyPrefix,
            url: `https://${domain}/${keyPrefix}`
          };

          let cmdName;

          if (name.includes('__') && name.indexOf('__') !== name.indexOf('__c')) {
            cmdName = `List ${labelPlural} (${name.split('__')[0]})`;
          } else {
            cmdName = `List ${labelPlural}`;
          }

          commands[cmdName] = action;
          commands[cmdName]['synonyms'] = [name];

          action = {
            key: name,
            keyPrefix: keyPrefix,
            url: `https://${domain}/${keyPrefix}/e`
          };

          cmdName = `New ${label}`;
          commands[cmdName] = action;
          commands[cmdName]['synonyms'] = [name];
        }
      });
    });
};
