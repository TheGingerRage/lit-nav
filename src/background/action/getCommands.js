export const getCommands = (request, sender, sendResponse, data) => {
  const { commands, orgKey, lastUpdated } = data;
  const { key } = request;

  if (commands[key]) {
    sendResponse(commands[key]);
  } else if (
    commands[orgKey] &&
    lastUpdated[orgKey] &&
    new Date().getTime() - lastUpdated[orgKey].getTime() < 1000 * 60 * 60
  ) {
    sendResponse(commands[orgKey]);
  } else {
    sendResponse();
  }
};
