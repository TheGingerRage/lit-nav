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
  STORE_LABELS: 'Store Labels',
  GET_LABELS: 'Get Labels',
  LIGHTNING_METADATA: 'Lightning Metadata',
  VISUALFORCE_METADATA: 'VisualForce Metadata'
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
    ORDER BY NamespacePrefix,Category
  `
};
