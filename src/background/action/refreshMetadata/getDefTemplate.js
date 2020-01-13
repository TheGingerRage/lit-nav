export const getDefTemplate = (cookie, commands, config) => {
  const { value } = cookie;
  const { label, url, urlExtra } = config;
  const headers = { Authorization: `Bearer ${value}` };

  return fetch(url, { headers })
    .then(response => response.json())
    .then(response => {
      if (response && Array.isArray(response.records)) {
        response.records.forEach(({ Id, Name, NamespacePrefix }) => {
          const namespace = NamespacePrefix ? ` (${NamespacePrefix})` : '';
          const name = `${Name}${namespace}`;

          commands[`Setup > ${label} > ${name}`] = {
            url: `/${Id}${urlExtra ? urlExtra : ''}`,
            key: Name
          };
        });
      }
    });
};
