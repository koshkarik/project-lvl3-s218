export default (env) => {
  const path = `./config/webpack/${env}.js`;
  console.log('Webpack config:', path);
  const getCurrentWebpackConfig = require(path).default; //eslint-disable-line
  return getCurrentWebpackConfig({ env });
};

