import axios from 'axios';
import validator from 'validator';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';

const inputField = document.querySelector('input');
const form = document.querySelector('form');
const streamsUl = document.querySelector('.streams-list');
const itemsWrapper = document.querySelector('.all-items');

const listOfStreams = [];

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

const handleInputClass = (inputEl) => {
  const { classList } = inputEl;
  const valid = checkUrl(inputEl.value);
  const classToAdd = valid ? 'is-valid' : 'is-invalid';
  const classToRemove = valid ? 'is-invalid' : 'is-valid';
  if (inputEl.value.length === 0) {
    classList.remove('is-invalid');
    classList.remove('is-valid');
    return;
  }
  if (classList.contains(classToRemove)) {
    classList.remove(classToRemove);
  }
  if (!classList.contains(classToAdd)) {
    classList.add(classToAdd);
  }
};

$(() => {
  inputField.addEventListener('input', (e) => {
    handleInputClass(e.target);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = inputField.value.includes('http') ? inputField.value : 'http://'.concat(inputField.value);
    if (!checkUrl(url)) {
      return;
    }
    inputField.value = '';
    handleInputClass(inputField);
    const targetUrl = new URL('/feed', url);
    console.log(targetUrl);
    axios.get(targetUrl)
      .then((response) => {
        const parser = new DOMParser();
        const parsedXml = parser.parseFromString(response.data, 'application/xml');
        const newChannelData = getInfoFromXml(parsedXml);
        listOfStreams.push(newChannelData);
        const allStreamsNodes = getAllStreamsListNodes(listOfStreams);
        streamsUl.innerHTML = '';
        allStreamsNodes.forEach(node => streamsUl.append(node));
        const allItems = getAllItemsNodes(listOfStreams);
        allItems.forEach((item) => {
          itemsWrapper.append(item);
        });
      });
  });
});
