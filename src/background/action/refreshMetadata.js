import { actionType, urlSuffix, defLabel, defUrlExtra, defType } from '../../common/constants';
import { getSetupTree } from './refreshMetadata/setupTree';
import { getCustomObjectsDef } from './refreshMetadata/customObjectsDef';
import { getObjectMetadata } from './refreshMetadata/objectMetadata';
import { storeCommands } from './storeCommands';
import { getDefTemplate } from './refreshMetadata/getDefTemplate';
import { getNForceSysProps } from './refreshMetadata/nForceSysProps';
import { getLlcBiSysProps } from './refreshMetadata/LlcBiSysProps';
import { getFlowsDef } from './refreshMetadata/flowsDef';

export const refreshMetadata = (request, sender, sendResponse, data) => {
  const { cookie } = request;
  const { domain } = cookie;
  let commands = {};

  commands['Refresh Metadata'] = {};
  commands['Setup'] = {};
  commands['OrgLimits'] = {};
  commands['clabels'] = {};

  const getDef = type => {
    const config = {
      url: getUrl(domain, urlSuffix[type]),
      label: defLabel[type],
      urlExtra: defUrlExtra[type]
    };

    return getDefTemplate(cookie, commands, config);
  };

  Promise.all([
    getObjectMetadata(cookie, commands),
    getSetupTree(cookie, commands),
    getCustomObjectsDef(cookie, commands),
    getFlowsDef(cookie, commands),
    getNForceSysProps(cookie, commands),
    getLlcBiSysProps(cookie, commands),
    ...Object.keys(defType).map(getDef)
  ]).then(() => {
    storeCommands({ ...request, payload: commands }, data);

    chrome.tabs.sendMessage(sender.tab.id, {
      action: actionType.REFRESH_METADATA_SUCCESS,
      commands
    });
  });
};

const getUrl = (domain, urlSuffix) => {
  return `https://${domain}/${urlSuffix}`;
};
