import { urlSuffix } from '../../../common/constants';

export const getNForceSysProps = ({ domain, value }, commands) => {
  const url = `https://${domain}/${urlSuffix.nForceSysProps}`;
  const headers = { Authorization: `Bearer ${value}` };

  return fetch(url, { headers })
    .then(response => response.json())
    .then(response => {
      if (response && Array.isArray(response.records)) {
        response.records.forEach(prop => {
          const { nFORCE__Category_Name__c, nFORCE__Key__c, Id, Name } = prop;

          const action = {
            key: Name,
            keyPrefix: Id,
            url: `/${Id}?setupid=CustomSettings&isdtp=p1`
          };

          commands[
            `Setup > System Property (nFORCE) > ${nFORCE__Category_Name__c} > ${nFORCE__Key__c}`
          ] = action;
        });
      }
    });
};
