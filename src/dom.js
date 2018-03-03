import { state, removeStreamFromState } from './state';

export const inputField = document.querySelector('input');
export const form = document.querySelector('form');
export const alertDiv = document.querySelector('[data-alert]');
const streamsUl = document.querySelector('.streams-list');
const itemsWrapper = document.querySelector('.all-items');
const modal = document.querySelector('.modal');
const modalTitle = modal.querySelector('.modal-title');
const modalBody = modal.querySelector('.modal-body');

export const getAllStreamsListNodes = streamsList => streamsList.map((stream) => {
  const { channelTitle, channelDesc, channelId } = stream;
  const newListItem = document.createElement('li');
  newListItem.setAttribute('class', 'list-group-item');
  const newTitle = document.createElement('h4');
  newTitle.textContent = channelTitle;
  newListItem.append(newTitle);
  const desc = document.createElement('p');
  desc.textContent = channelDesc;
  newListItem.append(desc);
  const buttonToRemove = document.createElement('button');
  buttonToRemove.setAttribute('data-remove', channelId);
  buttonToRemove.setAttribute('class', 'btn btn-danger');
  buttonToRemove.textContent = 'remove';
  buttonToRemove.addEventListener('click', (e) => {
    const idToRemove = e.target.dataset.remove;
    removeStreamFromState(idToRemove);
    buildListOfStreamsDomEl(); // eslint-disable-line
    buildItemsDom(); //eslint-disable-line
  });
  newListItem.append(buttonToRemove);
  return newListItem;
});

export const createModalBtn = () => {
  const btn = document.createElement('button');
  btn.setAttribute('class', 'btn btn-light');
  btn.setAttribute('data-toggle', 'modal');
  btn.setAttribute('data-target', '#exampleModalCenter');
  btn.textContent = 'more';
  return btn;
};

export const createItemNode = (item) => {
  const { title, link, description } = item;
  const divEl = document.createElement('div');
  divEl.setAttribute('class', 'mb-3 border-bottom pb-2');
  const newLink = document.createElement('a');
  newLink.setAttribute('class', 'text-dark');
  newLink.setAttribute('href', link);
  newLink.setAttribute('target', '_blank');
  const h4 = document.createElement('h4');
  h4.textContent = title;
  newLink.append(h4);
  const buttonToOpenModal = createModalBtn();
  buttonToOpenModal.addEventListener('click', () => {
    modalTitle.textContent = title;
    modalBody.textContent = description;
  });
  divEl.append(newLink);
  divEl.append(buttonToOpenModal);
  return divEl;
};

export const getAllItemsNodes = () => state.allStreamsItems.map(createItemNode);

export const buildListOfStreamsDomEl = () => {
  const allStreamsNodes = getAllStreamsListNodes(state.listOfStreams);
  streamsUl.innerHTML = '';
  allStreamsNodes.forEach(node => streamsUl.append(node));
};

export const buildItemsDom = () => {
  itemsWrapper.innerHTML = '';
  const allItems = getAllItemsNodes();
  allItems.forEach((item) => {
    itemsWrapper.append(item);
  });
};

export const addItemToDom = (item) => {
  const newItem = createItemNode(item);
  itemsWrapper.prepend(newItem);
};

export const buildDomForStream = () => {
  buildListOfStreamsDomEl();
  buildItemsDom();
};
