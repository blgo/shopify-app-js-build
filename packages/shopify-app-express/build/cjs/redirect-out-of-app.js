'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function redirectOutOfApp({
  config
}) {
  return function redirectOutOfApp({
    req,
    res,
    redirectUri,
    shop
  }) {
    var _req$headers$authoriz;
    if ((_req$headers$authoriz = req.headers.authorization) !== null && _req$headers$authoriz !== void 0 && _req$headers$authoriz.match(/Bearer (.*)/)) {
      appBridgeHeaderRedirect(config, res, redirectUri);
    } else if (req.query.embedded === '1') {
      exitIframeRedirect(config, req, res, redirectUri, shop);
    } else {
      serverSideRedirect(config, res, redirectUri, shop);
    }
  };
}
function appBridgeHeaderRedirect(config, res, redirectUri) {
  config.logger.debug(`Redirecting: request has bearer token, returning headers to ${redirectUri}`);
  res.status(403);
  res.append('Access-Control-Expose-Headers', ['X-Shopify-Api-Request-Failure-Reauthorize', 'X-Shopify-Api-Request-Failure-Reauthorize-Url']);
  res.header('X-Shopify-API-Request-Failure-Reauthorize', '1');
  res.header('X-Shopify-API-Request-Failure-Reauthorize-Url', redirectUri);
  res.end();
}
function exitIframeRedirect(config, req, res, redirectUri, shop) {
  config.logger.debug(`Redirecting: request is embedded, using exitiframe path to ${redirectUri}`, {
    shop
  });
  const queryParams = new URLSearchParams({
    ...req.query,
    shop,
    redirectUri
  }).toString();
  res.redirect(`${config.exitIframePath}?${queryParams}`);
}
function serverSideRedirect(config, res, redirectUri, shop) {
  config.logger.debug(`Redirecting: request is at top level, going to ${redirectUri} `, {
    shop
  });
  res.redirect(redirectUri);
}

exports.redirectOutOfApp = redirectOutOfApp;
