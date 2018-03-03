import validator from 'validator';

export const checkUrl = url => validator.isURL(url);

export const getInfoFromXml = (xmlData, id) => {
  const channelId = id;
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

export const parseXml = (xml) => {
  const parser = new DOMParser();
  return parser.parseFromString(xml, 'application/xml');
};

export const updateLocalStorage = (saveFeeds) => {
  const feedsToSave = saveFeeds.filter(item => item).join(' ');
  localStorage.setItem('savedFeeds', feedsToSave);
};

export const sortItemsByData = listOfItems => listOfItems.sort((a, b) =>
  new Date(b.pubData).getTime() - new Date(a.pubData).getTime());
