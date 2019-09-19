import { urlSuffix } from '../../../common/constants';

export const getTriggersDef = ({ domain, value }, commands) => {
  const url = `https://${domain}/${urlSuffix.Triggers}`;
  const headers = { Authorization: `Bearer ${value}` };

  fetch(url, { headers })
    .then(response => response.json())
    .then(response => {
      response.records.forEach(({ Id, Name }) => {
        commands[`Setup > Apex Trigger > ${Name}`] = {
          url: `/${Id}`,
          key: Name
        };
      });
    });
};
