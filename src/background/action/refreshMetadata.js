import { actionType, urlSuffix, label, urlExtra, defType } from '../../common/constants';
import { getSetupTree } from './refreshMetadata/setupTree';
import { getCustomObjectsDef } from './refreshMetadata/customObjectsDef';
import { getObjectMetadata } from './refreshMetadata/objectMetadata';
import { storeCommands } from './storeCommands';
import { getDefTemplate } from './refreshMetadata/getDefTemplate';

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
      label: label[type],
      urlExtra: urlExtra[type]
    };

    return getDefTemplate(cookie, commands, config);
  };

  Promise.all([
    getObjectMetadata(cookie, commands),
    getSetupTree(cookie, commands),
    getCustomObjectsDef(cookie, commands),
    ...Object.keys(defType).map(getDef)
  ]).then(() => {
    storeCommands({ ...request, payload: commands }, data);

    chrome.tabs.sendMessage(sender.tab.id, {
      action: actionType.REFRESH_METADATA_SUCCESS,
      commands
    });
  });

  // getSysPropsNFORCEDef();
  // getSysPropsLLCBIDef();
  // getFlowsDef();
};

const getUrl = (domain, urlSuffix) => {
  return `https://${domain}/${urlSuffix}`;
};
