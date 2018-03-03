import { getInfoFromXml, parseXml, updateLocalStorage, sortItemsByData } from './helpers';

export const state = {
  inputForm: {
    valid: false,
  },
  feedsQuantity: 0,
  savedFeeds: ['http://news.rambler.ru/rss/world/', 'http://feeds.bbci.co.uk/news/world/rss.xml'],
  listOfStreams: [],
  allStreamsItems: [],
};

export const removeStreamFromState = (id) => {
  delete state.savedFeeds[id];
  updateLocalStorage(state.savedFeeds);
  const newFeedsState = state.listOfStreams.filter(feed => feed.channelId !== Number(id));
  state.listOfStreams = [...newFeedsState];
  const newAllStreamsItems = state.allStreamsItems.filter(item => item.channelId !== Number(id));
  state.allStreamsItems = [...newAllStreamsItems];
};

export const saveAllItemsInState = (streamsList) => {
  const allItems = streamsList.reduce((acc, cur) => {
    const { items } = cur;
    return [...acc, ...items];
  }, []);
  const sortedItems = sortItemsByData(allItems);
  state.allStreamsItems = [...sortedItems];
};

export const addStreamToState = (stream) => {
  const parsedXml = parseXml(stream.data);
  const newChannelData = getInfoFromXml(parsedXml, state.feedsQuantity);
  state.listOfStreams.push(newChannelData);
  state.feedsQuantity += 1;
  saveAllItemsInState(state.listOfStreams);
};

export const updateStreamState = (stream) => {
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

export const setInputFormState = (bool) => {
  state.inputForm.valid = bool;
};

export const addToSavedFeeds = (url) => {
  if (!state.savedFeeds.includes(url)) {
    state.savedFeeds.push(url);
    updateLocalStorage(state.savedFeeds);
  }
};

export const addItemToStateList = (item) => {
  state.allStreamsItems = [item, ...state.allStreamsItems];
};
