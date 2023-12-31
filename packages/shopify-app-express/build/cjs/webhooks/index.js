'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var express = require('express');
var shopifyApi = require('@shopify/shopify-api');
var appInstallations = require('../app-installations.js');
var ensureInstalledOnShop = require('../middlewares/ensure-installed-on-shop.js');
var process = require('./process.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var express__default = /*#__PURE__*/_interopDefaultLegacy(express);

function processWebhooks({
  api,
  config
}) {
  return function ({
    webhookHandlers
  }) {
    mountWebhooks(api, config, webhookHandlers);
    return [express__default["default"].text({
      type: '*/*',
      limit: '10mb'
    }), async (req, res) => {
      await process.process({
        req,
        res,
        api,
        config
      });
    }];
  };
}
function mountWebhooks(api, config, handlers) {
  api.webhooks.addHandlers(handlers);

  // Add our custom app uninstalled webhook
  const appInstallations$1 = new appInstallations.AppInstallations(config);
  api.webhooks.addHandlers({
    APP_UNINSTALLED: {
      deliveryMethod: shopifyApi.DeliveryMethod.Http,
      callbackUrl: config.webhooks.path,
      callback: ensureInstalledOnShop.deleteAppInstallationHandler(appInstallations$1, config)
    }
  });
}

exports.processWebhooks = processWebhooks;
