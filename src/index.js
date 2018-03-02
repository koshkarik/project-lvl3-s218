import axios from 'axios';
import validator from 'validator';
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
console.log('go');

const state = {
  inputForm: {
    valid: false,
  },
  feedsQuantity: 0,
  savedFeeds: ['http://feeds.bbci.co.uk/news/world/africa/rss.xml'],
  listOfStreams: [],

};

const checkUrl = url => validator.isURL(url);

const getInfoFromXml = (xmlData) => {
  const channelId = state.feedsQuantity;
  state.feedsQuantity += 1;
  const channel = xmlData.querySelector('channel');
  const channelTitle = channel.querySelector('title').textContent;
  const channelDesc = channel.querySelector('description').textContent;
  const items = [...channel.getElementsByTagName('item')];
  const parsedItems = items.map((item) => {
    console.log(item);
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description') ? item.querySelector('description').textContent : '';
    return { title, link, description };
  });
  return {
    channelTitle, channelId, channelDesc, items: parsedItems, data: xmlData,
  };
};

const removeStream = (id) => {
  const newFeedsState = state.listOfStreams.filter(feed => feed.channelId !== Number(id));
  state.listOfStreams = [...newFeedsState];
  // eslint-disable-next-line no-use-before-define
  buildListOfStreamsDomEl();
  // eslint-disable-next-line no-use-before-define
  buildItemsDom();
};

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
    removeStream(idToRemove);
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

const getAllItemsNodes = (streamsList) => {
  const allItems = streamsList.reduce((acc, cur) => {
    const { items } = cur;
    return [...acc, ...items];
  }, []);
  return allItems.map((item) => {
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
  });
};

const getStream = (url) => {
  const requestUrl = proxyCorsServer.concat(url);
  return axios.get(requestUrl);
};

const parseXml = (xml) => {
  const parser = new DOMParser();
  return parser.parseFromString(xml, 'application/xml');
};

const buildListOfStreamsDomEl = () => {
  const allStreamsNodes = getAllStreamsListNodes(state.listOfStreams);
  streamsUl.innerHTML = '';
  allStreamsNodes.forEach(node => streamsUl.append(node));
};

const buildItemsDom = () => {
  itemsWrapper.innerHTML = '';
  const allItems = getAllItemsNodes(state.listOfStreams);
  allItems.forEach((item) => {
    itemsWrapper.append(item);
  });
};

const handleInputClass = (inputEl) => {
  const { classList } = inputEl;
  state.inputForm.valid = checkUrl(inputEl.value);
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

const addStreamToStateAndDom = (stream) => {
  const parsedXml = parseXml(stream.data);
  const newChannelData = getInfoFromXml(parsedXml);
  state.listOfStreams.push(newChannelData);
  buildListOfStreamsDomEl();
  buildItemsDom();
};

const runRss = () => {
  const promises = state.savedFeeds.map(stream => getStream(stream));
  axios.all(promises)
    .then((streamsData) => {
      streamsData.forEach((piece) => {
        addStreamToStateAndDom(piece);
      });
    });
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
    getStream(url).then(addStreamToStateAndDom).then(() => state.savedFeeds.push(url))
      .catch((error) => {
        console.log(error);
        alertDiv.classList.remove('invisible');
      });
  });
};

runRss();

