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
  Triggers: `
      SELECT
        Id,
        Name
      FROM 
        ApexTrigger`
};
export const SF_API_VERSION = 'v46.0';
export const toolingPath = `services/data/${SF_API_VERSION}/tooling`;
export const urlSuffix = {
  Setup: 'ui/setup/Setup',
  CustomLabels: `${toolingPath}/query/?q=${query.CustomLabels}`,
  CustomObjectDef: `${toolingPath}/query/?q=${query.CustomObjectDef}`,
  ApexClasses: `${toolingPath}/query/?q=${query.ApexClasses}`,
  Triggers: `${toolingPath}/query/?q=${query.Triggers}`,
  ObjectMetadata: `/services/data/${SF_API_VERSION}/sobjects/`
};
