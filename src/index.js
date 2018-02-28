import axios from 'axios';
import validator from 'validator';
import 'bootstrap/dist/css/bootstrap.min.css';

const inputField = document.querySelector('input');
const form = document.querySelector('form');
const streamsUl = document.querySelector('.streams-list');
const itemsWrapper = document.querySelector('.all-items');
const proxyCorsServer = 'https://api.codetabs.com/cors-proxy/';

const state = {
  inputForm: {
    valid: false,
    activeClass: '',
  },
  activeStreams: ['http://feeds.bbci.co.uk/news/world/africa/rss.xml'],
  listOfStreams: [],
};

const checkUrl = url => validator.isURL(url);

const getInfoFromXml = (xmlData) => {
  const channel = xmlData.querySelector('channel');
  const channelTitle = channel.querySelector('title').textContent;
  const channelDesc = channel.querySelector('description').textContent;
  const items = [...channel.getElementsByTagName('item')];
  const parsedItems = items.map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    return { title, link };
  });
  return { channelTitle, channelDesc, items: parsedItems };
};

const getAllStreamsListNodes = streamsList => streamsList.map((stream) => {
  const { channelTitle, channelDesc } = stream;
  const newListItem = document.createElement('li');
  newListItem.setAttribute('class', 'list-group-item');
  const newTitle = document.createElement('h4');
  newTitle.textContent = channelTitle;
  newListItem.append(newTitle);
  const desc = document.createElement('p');
  desc.textContent = channelDesc;
  newListItem.append(desc);
  return newListItem;
});

const getAllItemsNodes = (streamsList) => {
  const allItems = streamsList.reduce((acc, cur) => {
    const { items } = cur;
    return [...acc, ...items];
  }, []);
  return allItems.map((item) => {
    const { title, link } = item;
    const divEl = document.createElement('div');
    const newLink = document.createElement('a');
    newLink.setAttribute('href', link);
    newLink.setAttribute('target', '_blank');
    const h3 = document.createElement('h3');
    h3.textContent = title;
    newLink.append(h3);
    divEl.append(newLink);
    return divEl;
  });
};

const getStream = (url) => {
  const requestUrl = proxyCorsServer.concat(url);
  axios.get(requestUrl)
    .then((response) => {
      const parser = new DOMParser();
      const parsedXml = parser.parseFromString(response.data, 'application/xml');
      const newChannelData = getInfoFromXml(parsedXml);
      const { listOfStreams } = state;
      listOfStreams.push(newChannelData);
      const allStreamsNodes = getAllStreamsListNodes(listOfStreams);
      streamsUl.innerHTML = '';
      allStreamsNodes.forEach(node => streamsUl.append(node));
      const allItems = getAllItemsNodes(listOfStreams);
      allItems.forEach((item) => {
        itemsWrapper.append(item);
      });
      if (!state.activeStreams.includes(url)) {
        state.activeStreams.push(url);
      }
    });
};

const handleInputClass = (inputEl) => {
  const { classList } = inputEl;
  const { activeClass } = state.inputForm;
  const valid = checkUrl(inputEl.value);
  state.inputForm.valid = valid;
  const classToAdd = state.inputForm.valid ? 'is-valid' : 'is-invalid';
  const classToRemove = state.inputForm.valid ? 'is-invalid' : 'is-valid';
  if (inputEl.value.length === 0) {
    classList.remove(activeClass);
    state.inputForm.activeClass = '';
    return;
  }
  if (activeClass === classToRemove) {
    classList.remove(classToRemove);
  }
  classList.add(classToAdd);
  state.inputForm.activeClass = classToAdd;
};

const runRss = () => {
  const promises = state.activeStreams.map(stream => getStream(stream));
  axios.all(promises);
  inputField.addEventListener('input', (e) => {
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
    getStream(url);
  });
};

runRss();

