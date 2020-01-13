import { urlSuffix } from '../../../common/constants';

export const getSetupTree = ({ domain, value }, commands) => {
  const url = `https://${domain}/${urlSuffix.Setup}`;
  const headers = { Authorization: `Bearer ${value}` };

  return fetch(url, headers)
    .then(res => res.text())
    .then(text => new DOMParser().parseFromString(text, 'text/html'))
    .then(doc => {
      const items = doc.querySelectorAll('.setupLeaf > a[id*="_font"]');
      items.forEach(item => getCommandFromItem(item, commands));
    });
};

const getCommandFromItem = (item, commands) => {
  let hasParent = false;
  let hasTopParent = false;
  let parent, topParent, parentEl, topParentEl;

  if (
    item.parentElement &&
    item.parentElement.parentElement &&
    item.parentElement.parentElement.parentElement &&
    item.parentElement.parentElement.parentElement.classList.contains('parent')
  ) {
    hasParent = true;
    parentEl = item.parentElement.parentElement.parentElement;
    parent = parentEl.querySelector('.setupFolder').innerText;
  }

  if (
    hasParent &&
    parentEl.parentElement &&
    parentEl.parentElement.parentElement &&
    parentEl.parentElement.parentElement.classList.contains('parent')
  ) {
    hasTopParent = true;
    topParentEl = parentEl.parentElement.parentElement;
    topParent = topParentEl.querySelector('.setupFolder').innerText;
  }

  let name = `Setup > ${hasTopParent ? topParent + ' > ' : hasParent ? parent + ' > ' : ''}`;
  name += item.innerText;

  if (!commands[name]) {
    commands[name] = { url: item.getAttribute('href'), key: name };
  }
};
