export const SF_API_VERSION = 'v46.0';
export const excludedDomains = ['visual.force.com', 'content.force.com', 'lightning.force.com'];
export const actionType = {
  FETCH_COOKIE: 'Fetch Cookie',
  STORE_COMMANDS: 'Store Commands',
  GET_COMMANDS: 'Get Commands',
  GET_SETTINGS: 'Get Settings',
  SET_SETTINGS: 'Set Settings',
  STORE_METADATA: 'Store Metadata',
  GET_METADATA: 'Get Metadata',
  QUERY_LABELS: 'Query Labels',
  GET_LABELS: 'Get Labels',
  LIGHTNING_METADATA: 'Lightning Metadata',
  VISUALFORCE_METADATA: 'VisualForce Metadata',
  REFRESH_METADATA: 'Refresh Metadata',
  REFRESH_METADATA_SUCCESS: 'Refresh Metadata Success'
};
export const query = {
  CustomLabels: `
    SELECT 
      Id,
      Name,
      Category,
      Value,
      NamespacePrefix
    FROM
      ExternalString
    ORDER BY NamespacePrefix,Category`,
  CustomObjectDef: `
    SELECT
      Id,
      DeveloperName,
      NamespacePrefix,
      ManageableState
    FROM
      CustomObject`,
  ApexClasses: `
    SELECT 
      Id,
      Name,
      NamespacePrefix
    FROM
      ApexClass`,
  Triggers: `SELECT Id, Name, NamespacePrefix FROM ApexTrigger`,
  Profiles: `SELECT Id, Name FROM Profile`,
  ApexPages: `SELECT Id, Name, NamespacePrefix FROM ApexPage`,
  Users: `SELECT Id, Name FROM User`,
  ApexComponents: `SELECT Id, Name, NamespacePrefix FROM ApexComponent`,
  nForceSysProps: `
    SELECT
      Id,
      Name,
      nFORCE__Category_Name__c,
      nFORCE__Key__c
    FROM
      nFORCE__System_Properties__c`
};
export const defType = {
  ApexPages: 'ApexPages',
  Profiles: 'Profiles',
  Triggers: 'Triggers',
  ApexClasses: 'ApexClasses',
  Users: 'Users',
  ApexComponents: 'ApexComponents'
};
export const defLabel = {
  [defType.ApexPages]: 'Visualforce Page',
  [defType.Profiles]: 'Profile',
  [defType.Triggers]: 'Apex Trigger',
  [defType.ApexClasses]: 'Apex Class',
  [defType.Users]: 'User',
  [defType.ApexComponents]: 'Visualforce Component'
};
export const defUrlExtra = {
  [defType.Users]: '?noredirect=1'
};
export const toolingPath = `services/data/${SF_API_VERSION}/tooling`;
export const dataPath = `services/data/${SF_API_VERSION}`;
export const urlSuffix = {
  Setup: 'ui/setup/Setup',
  CustomLabels: `${toolingPath}/query/?q=${query.CustomLabels}`,
  CustomObjectDef: `${toolingPath}/query/?q=${query.CustomObjectDef}`,
  ObjectMetadata: `${dataPath}/sobjects/`,
  nForceSysProps: `${dataPath}/query/?q=${query.nForceSysProps}`,
  [defType.ApexClasses]: `${toolingPath}/query/?q=${query.ApexClasses}`,
  [defType.Triggers]: `${toolingPath}/query/?q=${query.Triggers}`,
  [defType.Profiles]: `${toolingPath}/query/?q=${query.Profiles}`,
  [defType.ApexPages]: `${toolingPath}/query/?q=${query.ApexPages}`,
  [defType.Users]: `${toolingPath}/query/?q=${query.Users}`,
  [defType.ApexComponents]: `${toolingPath}/query/?q=${query.ApexComponents}`
};
