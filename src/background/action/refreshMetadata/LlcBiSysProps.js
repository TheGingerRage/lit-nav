import { urlSuffix } from '../../../common/constants';

export const getLlcBiSysProps = ({ domain, value }, commands) => {
  const url = `https://${domain}/${urlSuffix.LlcBiSysProps}`;
  const headers = { Authorization: `Bearer ${value}` };

  return fetch(url, { headers })
    .then(response => response.json())
    .then(response => {
      if (response && Array.isArray(response.records)) {
        response.records.forEach(prop => {
          const { LLC_BI__Category_Name__c, LLC_BI__Key__c, Id, Name } = prop;

          const action = {
            key: Name,
            keyPrefix: Id,
            url: `/${Id}?setupid=CustomSettings&isdtp=p1`
          };

          commands[
            `Setup > System Property (LLC_BI) > ${LLC_BI__Category_Name__c} > ${LLC_BI__Key__c}`
          ] = action;
        });
      }
    });
};
