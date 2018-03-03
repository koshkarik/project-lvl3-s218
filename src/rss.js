import axios from 'axios';
import _ from 'lodash';
import { state, addStreamToState, setInputFormState, addToSavedFeeds, updateStreamState, addItemToStateList } from './state';
import { buildDomForStream, inputField, alertDiv, form, addItemToDom } from './dom';
import { checkUrl, sortItemsByData } from './helpers';

const proxyCorsServer = 'https://crossorigin.me/';

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

const getStream = (url) => {
  const requestUrl = proxyCorsServer.concat(url);
  return axios.get(requestUrl);
};

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
    getStream(url).then(state.savedFeeds.includes(url) ? updateStreamState : addStreamToStateAndDom)
      .then(() => addToSavedFeeds(url))
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

export default () => {
  checkLocalStorage();
  runRss();
  timedRefresh();
};

