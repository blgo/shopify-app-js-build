"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectOutOfApp = void 0;
var tslib_1 = require("tslib");
function redirectOutOfApp(_a) {
    var config = _a.config;
    return function redirectOutOfApp(_a) {
        var _b;
        var req = _a.req, res = _a.res, redirectUri = _a.redirectUri, shop = _a.shop;
        if ((_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.match(/Bearer (.*)/)) {
            appBridgeHeaderRedirect(config, res, redirectUri);
        }
        else if (req.query.embedded === '1') {
            exitIframeRedirect(config, req, res, redirectUri, shop);
        }
        else {
            serverSideRedirect(config, res, redirectUri, shop);
        }
    };
}
exports.redirectOutOfApp = redirectOutOfApp;
function appBridgeHeaderRedirect(config, res, redirectUri) {
    config.logger.debug("Redirecting: request has bearer token, returning headers to ".concat(redirectUri));
    res.status(403);
    res.append('Access-Control-Expose-Headers', [
        'X-Shopify-Api-Request-Failure-Reauthorize',
        'X-Shopify-Api-Request-Failure-Reauthorize-Url',
    ]);
    res.header('X-Shopify-API-Request-Failure-Reauthorize', '1');
    res.header('X-Shopify-API-Request-Failure-Reauthorize-Url', redirectUri);
    res.end();
}
function exitIframeRedirect(config, req, res, redirectUri, shop) {
    config.logger.debug("Redirecting: request is embedded, using exitiframe path to ".concat(redirectUri), { shop: shop });
    var queryParams = new URLSearchParams(tslib_1.__assign(tslib_1.__assign({}, req.query), { shop: shop, redirectUri: redirectUri })).toString();
    res.redirect("".concat(config.exitIframePath, "?").concat(queryParams));
}
function serverSideRedirect(config, res, redirectUri, shop) {
    config.logger.debug("Redirecting: request is at top level, going to ".concat(redirectUri, " "), { shop: shop });
    res.redirect(redirectUri);
}
//# sourceMappingURL=redirect-out-of-app.js.map