import { urlSuffix } from '../../../common/constants';

export const getApexClassesDef = ({ domain, value }, commands) => {
  const url = `https://${domain}/${urlSuffix.ApexClasses}`;
  const headers = { Authorization: `Bearer ${value}` };

  return fetch(url, { headers })
    .then(response => response.json())
    .then(response => {
      response.records.forEach(({ Id, Name, NamespacePrefix }) => {
        const apiName = `${NamespacePrefix ? NamespacePrefix : ''}__${Name}`;
        commands[`Setup > Apex Class > ${apiName}`] = {
          url: `/${Id}`,
          key: apiName
        };
      });
    });
};
