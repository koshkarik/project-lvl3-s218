import axios from 'axios';
import validator from 'validator';
import _ from 'lodash';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const inputField = document.querySelector('input');
const form = document.querySelector('form');
const streamsUl = document.querySelector('.streams-list');
const itemsWrapper = document.querySelector('.all-items');
const alertDiv = document.querySelector('[data-alert]');
const modal = document.querySelector('.modal');
const modalTitle = modal.querySelector('.modal-title');
const modalBody = modal.querySelector('.modal-body');
const proxyCorsServer = 'https://crossorigin.me/';

const state = {
  inputForm: {
    valid: false,
  },
  feedsQuantity: 0,
  savedFeeds: ['http://news.rambler.ru/rss/world/', 'http://feeds.bbci.co.uk/news/world/rss.xml'],
  listOfStreams: [],
  allStreamsItems: [],
};

// helpers functions

const updateLocalStorage = () => {
  const feedsToSave = state.savedFeeds.filter(item => item).join(' ');
  localStorage.setItem('savedFeeds', feedsToSave);
};

const checkUrl = url => validator.isURL(url);

const getInfoFromXml = (xmlData) => {
  const channelId = state.feedsQuantity;
  const channel = xmlData.querySelector('channel');
  const channelTitle = channel.querySelector('title').textContent;
  const channelLink = channel.querySelector('link').textContent;
  const channelDesc = channel.querySelector('description').textContent;
  const items = [...channel.getElementsByTagName('item')];
  const parsedItems = items.map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description') ? item.querySelector('description').textContent : '';
    const pubData = channel.querySelector('pubDate').textContent;
    return {
      title, pubData, link, description, channelId,
    };
  });
  return {
    channelTitle, channelLink, channelId, channelDesc, items: parsedItems, data: xmlData,
  };
};

const getStream = (url) => {
  const requestUrl = proxyCorsServer.concat(url);
  return axios.get(requestUrl);
};

const parseXml = (xml) => {
  const parser = new DOMParser();
  return parser.parseFromString(xml, 'application/xml');
};

// handle state functions

const removeStreamFromState = (id) => {
  delete state.savedFeeds[id];
  updateLocalStorage();
  const newFeedsState = state.listOfStreams.filter(feed => feed.channelId !== Number(id));
  state.listOfStreams = [...newFeedsState];
  const newAllStreamsItems = state.allStreamsItems.filter(item => item.channelId !== Number(id));
  state.allStreamsItems = [...newAllStreamsItems];
};

const sortItemsByData = listOfItems => listOfItems.sort((a, b) =>
  new Date(b.pubData).getTime() - new Date(a.pubData).getTime());

const saveAllItemsInState = (streamsList) => {
  const allItems = streamsList.reduce((acc, cur) => {
    const { items } = cur;
    return [...acc, ...items];
  }, []);
  const sortedItems = sortItemsByData(allItems);
  state.allStreamsItems = [...sortedItems];
};

const addStreamToState = (stream) => {
  const parsedXml = parseXml(stream.data);
  const newChannelData = getInfoFromXml(parsedXml);
  state.listOfStreams.push(newChannelData);
  state.feedsQuantity += 1;
  saveAllItemsInState(state.listOfStreams);
};

const updateStreamState = (stream) => {
  const parsedXml = parseXml(stream.data);
  const newChannelData = getInfoFromXml(parsedXml);
  const { items, channelTitle } = newChannelData;
  state.listOfStreams.forEach((feed, ind) => {
    if (feed.channelTitle === channelTitle) {
      state.listOfStreams[ind] = {
        ...feed, items: items.map(item => ({ ...item, channelId: feed.channelId })),
      };
    }
  });
};

const setInputFormState = (bool) => {
  state.inputForm.valid = bool;
};

const addToSavedFeeds = (url) => {
  state.savedFeeds.push(url);
  updateLocalStorage();
};
const addItemToStateList = (item) => {
  state.allStreamsItems = [item, ...state.allStreamsItems];
};

// handle dom functions

const getAllStreamsListNodes = streamsList => streamsList.map((stream) => {
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

const createModalBtn = () => {
  const btn = document.createElement('button');
  btn.setAttribute('class', 'btn btn-light');
  btn.setAttribute('data-toggle', 'modal');
  btn.setAttribute('data-target', '#exampleModalCenter');
  btn.textContent = 'more';
  return btn;
};

const createItemNode = (item) => {
  const { title, link, description } = item;
  const divEl = document.createElement('div');
  divEl.setAttribute('class', 'mb-3');
  const newLink = document.createElement('a');
  newLink.setAttribute('href', link);
  newLink.setAttribute('target', '_blank');
  const h3 = document.createElement('h3');
  h3.textContent = title;
  newLink.append(h3);
  const buttonToOpenModal = createModalBtn();
  buttonToOpenModal.addEventListener('click', () => {
    modalTitle.textContent = title;
    modalBody.textContent = description;
  });
  divEl.append(newLink);
  divEl.append(buttonToOpenModal);
  return divEl;
};

const getAllItemsNodes = () => state.allStreamsItems.map(createItemNode);

const buildListOfStreamsDomEl = () => {
  const allStreamsNodes = getAllStreamsListNodes(state.listOfStreams);
  streamsUl.innerHTML = '';
  allStreamsNodes.forEach(node => streamsUl.append(node));
};

const buildItemsDom = () => {
  itemsWrapper.innerHTML = '';
  const allItems = getAllItemsNodes();
  allItems.forEach((item) => {
    itemsWrapper.append(item);
  });
};

const addItemToDom = (item) => {
  const newItem = createItemNode(item);
  itemsWrapper.prepend(newItem);
};

const handleInputClass = (inputEl) => {
  const { classList } = inputEl;
  setInputFormState(checkUrl(inputEl.value));
  const classToAdd = state.inputForm.valid ? 'is-valid' : 'is-invalid';
  const classToRemove = state.inputForm.valid ? 'is-invalid' : 'is-valid';
  if (inputEl.value.length === 0) {
    [...classList].forEach((className) => {
      if (className !== 'form-control') {
        classList.remove(className);
      }
    });
    return;
  }
  if (classList.contains(classToRemove)) {
    classList.remove(classToRemove);
  }
  classList.add(classToAdd);
};

const buildDomForStream = () => {
  buildListOfStreamsDomEl();
  buildItemsDom();
};

// stream and dom function

const addStreamToStateAndDom = (stream) => {
  addStreamToState(stream);
  buildDomForStream();
};

const getAllStreamsAndAction = (action) => {
  const promises = state.savedFeeds.filter(item => item).map(stream => getStream(stream));
  axios.all(promises)
    .then((streamsData) => {
      streamsData.forEach((piece) => {
        action(piece);
      });
    });
};

const runRss = () => {
  getAllStreamsAndAction(addStreamToStateAndDom);
  inputField.addEventListener('input', (e) => {
    if (!alertDiv.classList.contains('invisible')) {
      alertDiv.classList.add('invisible');
    }
    handleInputClass(e.target);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = inputField.value;
    if (!state.inputForm.valid) {
      return;
    }
    inputField.value = '';
    handleInputClass(inputField);
    getStream(url).then(addStreamToStateAndDom).then(() => addToSavedFeeds(url))
      .catch((error) => {
        console.log(error);
        alertDiv.classList.remove('invisible');
      });
  });
};

const refreshFeeds = () => {
  getAllStreamsAndAction(updateStreamState);
  const iter = ([firstStream, ...rest], acc) => {
    if (!firstStream) {
      return acc;
    }
    const difference = _.differenceWith(firstStream.items, state.allStreamsItems, _.isEqual);
    const newAcc = [...acc, ...difference];
    return iter(rest, newAcc);
  };
  const itemsToAdd = iter(state.listOfStreams, []);
  console.log(itemsToAdd);
  if (itemsToAdd.length > 0) {
    const sortedItems = sortItemsByData(itemsToAdd);
    sortedItems.forEach(item => addItemToStateList(item));
    sortedItems.reverse().forEach(item => addItemToDom(item));
  }
  timedRefresh(); // eslint-disable-line
};

const checkLocalStorage = () => {
  const savedFeeds = localStorage.getItem('savedFeeds');
  if (savedFeeds) {
    const parsedSavedFeeds = savedFeeds.split(' ');
    state.savedFeeds = [...parsedSavedFeeds];
  }
};

const timedRefresh = () => {
  setTimeout(refreshFeeds, 5000);
};

checkLocalStorage();
runRss();
timedRefresh();

