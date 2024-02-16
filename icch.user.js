// ==UserScript==
// @name         Infinite Craft combination helper
// @namespace    em-infinite-craft-combination-helper
// @version      0.1
// @description  Highlight combinations that you've already done, in Infinite Craft
// @author       Erik Mårtensson
// @match        *://neal.fun/infinite-craft/
// @grant        none
// --@require      http://127.0.0.1:37436/icch.user.js
// ==/UserScript==

// Create a reference to the original fetch function
const originalFetch = fetch;

const getCombinations = () => {
  return localStorage.getItem('combinations')
    ? JSON.parse(localStorage.getItem('combinations'))
    : {};
};

const saveCombination = (first, second) => {
  const combinations = getCombinations();
  const combs = !combinations[first] ? [] : combinations[first];
  if (!combs.includes(second)) {
    combs.push(second);
  }
  combinations[first] = combs;
  localStorage.setItem('combinations', JSON.stringify(combinations));
};

const checkCombination = (elements) => {
  const [first, second] = elements.sort();
  const combinations = getCombinations();
  return combinations[first] && combinations[first].includes(second);
};

// Create a wrapper function for fetch
window.fetch = async function(url, options) {
  // Check if the URL matches the target URL
  if (!/^https:\/\/neal\.fun\/api\/infinite-craft\/pair/.test(url)) {
    return originalFetch.call(this, url, options);
  }

  // Extract the query parameters
  const searchParams = new URLSearchParams(url.split('?')[1]);
  const first = searchParams.get('first');
  const second = searchParams.get('second');

  // Log or use the extracted query parameters
  // console.log('First parameter:', first);
  // console.log('Second parameter:', second);

  saveCombination(first, second);

  return originalFetch.call(this, url, options);
};

const getNameFromElement = (element) => {
  return element.innerText.substring(element.innerText.indexOf(' ') + 1);
}

document.addEventListener('mouseover', function(event) {
  // console.log(event);
  const itemsElement = document.querySelector('.items');
  const hoverElement = event.target;
  if (!itemsElement.contains(hoverElement)) {
    // console.log('Not hovering over items', itemsElement, hoverElement)
    return;
  }

  // if (!event.target.classList.contains('item') || !event.target.parentElement.classList.contains('items')) {
  //   return;
  // }

  const elementElement = hoverElement.classList.contains('item-emoji')
    ? hoverElement.parentElement
    : hoverElement;

  const first = getNameFromElement(elementElement);
  // console.log('Hovering over:', first);

  document.querySelectorAll('.items .item').forEach((element) => {
    const second = getNameFromElement(element);
    // console.log('Checking:', second, element);
    if (checkCombination([first, second])) {
      // console.log('Match found', second);
      element.style.background = '#77f066';
    }
  });
});

document.addEventListener('mouseout', function(event) {
  const itemsElement = document.querySelector('.items');
  const hoverElement = event.target;
  if (!itemsElement.contains(hoverElement)) {
    // console.log('Not hovering over items', itemsElement, hoverElement)
    return;
  }
  // if (!event.target.classList.contains('item') || !event.target.parentElement.classList.contains('items')) {
  //   return;
  // }
  // console.log('Mouse out');
  document.querySelectorAll('.items .item').forEach((element) => {
    element.style.background = '';
  });
});
