import { excludedDomains } from './constants';

export const getFilteredCookies = (allCookies, filter) => {
  return allCookies.filter(
    c => c.domain.startsWith(filter) && !excludedDomains.some(d => c.domain.endsWith(d))
  );
};
