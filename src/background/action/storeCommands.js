export const storeCommands = (request, data) => {
  const { commands, orgKey, lastUpdated } = data;
  const { key, payload } = request;

  Object.keys(commands).forEach(k => {
    if (k !== key && k.split('!')[0] === orgKey) {
      delete commands[k];
    }
  });

  commands[key] = commands[orgKey] = payload;
  lastUpdated[orgKey] = new Date();
};
