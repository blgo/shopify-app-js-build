'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var shopifyApi = require('@shopify/shopify-api');
var redirectToAuth = require('../redirect-to-auth.js');

async function authCallback({
  req,
  res,
  api,
  config
}) {
  try {
    const callbackResponse = await api.auth.callback({
      rawRequest: req,
      rawResponse: res
    });
    config.logger.debug('Callback is valid, storing session', {
      shop: callbackResponse.session.shop,
      isOnline: callbackResponse.session.isOnline
    });
    await config.sessionStorage.storeSession(callbackResponse.session);

    // If this is an offline OAuth process, register webhooks
    if (!callbackResponse.session.isOnline) {
      await registerWebhooks(config, api, callbackResponse.session);
    }

    // If we're completing an offline OAuth process, immediately kick off the online one
    if (config.useOnlineTokens && !callbackResponse.session.isOnline) {
      config.logger.debug('Completing offline token OAuth, redirecting to online token OAuth', {
        shop: callbackResponse.session.shop
      });
      await redirectToAuth.redirectToAuth({
        req,
        res,
        api,
        config,
        isOnline: true
      });
      return false;
    }
    res.locals.shopify = {
      ...res.locals.shopify,
      session: callbackResponse.session
    };
    config.logger.debug('Completed OAuth callback', {
      shop: callbackResponse.session.shop,
      isOnline: callbackResponse.session.isOnline
    });
    return true;
  } catch (error) {
    config.logger.error(`Failed to complete OAuth with error: ${error}`);
    await handleCallbackError(req, res, api, config, error);
  }
  return false;
}
async function registerWebhooks(config, api, session) {
  config.logger.debug('Registering webhooks', {
    shop: session.shop
  });
  const responsesByTopic = await api.webhooks.register({
    session
  });
  for (const topic in responsesByTopic) {
    if (!Object.prototype.hasOwnProperty.call(responsesByTopic, topic)) {
      continue;
    }
    for (const response of responsesByTopic[topic]) {
      if (!response.success && !shopifyApi.gdprTopics.includes(topic)) {
        const result = response.result;
        if (result.errors) {
          config.logger.error(`Failed to register ${topic} webhook: ${result.errors[0].message}`, {
            shop: session.shop
          });
        } else {
          config.logger.error(`Failed to register ${topic} webhook: ${JSON.stringify(result.data)}`, {
            shop: session.shop
          });
        }
      }
    }
  }
}
async function handleCallbackError(req, res, api, config, error) {
  switch (true) {
    case error instanceof shopifyApi.InvalidOAuthError:
      res.status(400);
      res.send(error.message);
      break;
    case error instanceof shopifyApi.CookieNotFound:
      await redirectToAuth.redirectToAuth({
        req,
        res,
        api,
        config
      });
      break;
    case error instanceof shopifyApi.BotActivityDetected:
      res.status(410);
      res.send(error.message);
      break;
    default:
      res.status(500);
      res.send(error.message);
      break;
  }
}

exports.authCallback = authCallback;
