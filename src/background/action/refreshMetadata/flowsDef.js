import { urlSuffix } from '../../../common/constants';

export const getFlowsDef = ({ domain, value }, commands) => {
  const url = `https://${domain}/${urlSuffix.Flows}`;
  const headers = { Authorization: `Bearer ${value}` };

  return fetch(url, { headers })
    .then(response => response.json())
    .then(response => {
      if (response && Array.isArray(response.records)) {
        response.records.forEach(({ Id, DeveloperName }) => {
          const action = {
            key: DeveloperName,
            keyPrefix: Id,
            url: `https://${domain}/${Id}`
          };

          commands[`Setup > Flow > ${DeveloperName}`] = action;
        });
      }
    });
};
