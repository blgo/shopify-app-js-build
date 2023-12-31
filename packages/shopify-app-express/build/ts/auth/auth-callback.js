"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authCallback = void 0;
var tslib_1 = require("tslib");
var shopify_api_1 = require("@shopify/shopify-api");
var redirect_to_auth_1 = require("../redirect-to-auth");
function authCallback(_a) {
    var req = _a.req, res = _a.res, api = _a.api, config = _a.config;
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var callbackResponse, error_1;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 9]);
                    return [4 /*yield*/, api.auth.callback({
                            rawRequest: req,
                            rawResponse: res,
                        })];
                case 1:
                    callbackResponse = _b.sent();
                    config.logger.debug('Callback is valid, storing session', {
                        shop: callbackResponse.session.shop,
                        isOnline: callbackResponse.session.isOnline,
                    });
                    return [4 /*yield*/, config.sessionStorage.storeSession(callbackResponse.session)];
                case 2:
                    _b.sent();
                    if (!!callbackResponse.session.isOnline) return [3 /*break*/, 4];
                    return [4 /*yield*/, registerWebhooks(config, api, callbackResponse.session)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    if (!(config.useOnlineTokens && !callbackResponse.session.isOnline)) return [3 /*break*/, 6];
                    config.logger.debug('Completing offline token OAuth, redirecting to online token OAuth', { shop: callbackResponse.session.shop });
                    return [4 /*yield*/, (0, redirect_to_auth_1.redirectToAuth)({ req: req, res: res, api: api, config: config, isOnline: true })];
                case 5:
                    _b.sent();
                    return [2 /*return*/, false];
                case 6:
                    res.locals.shopify = tslib_1.__assign(tslib_1.__assign({}, res.locals.shopify), { session: callbackResponse.session });
                    config.logger.debug('Completed OAuth callback', {
                        shop: callbackResponse.session.shop,
                        isOnline: callbackResponse.session.isOnline,
                    });
                    return [2 /*return*/, true];
                case 7:
                    error_1 = _b.sent();
                    config.logger.error("Failed to complete OAuth with error: ".concat(error_1));
                    return [4 /*yield*/, handleCallbackError(req, res, api, config, error_1)];
                case 8:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/, false];
            }
        });
    });
}
exports.authCallback = authCallback;
function registerWebhooks(config, api, session) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var responsesByTopic, topic, _a, _b, response, result;
        var e_1, _c;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    config.logger.debug('Registering webhooks', { shop: session.shop });
                    return [4 /*yield*/, api.webhooks.register({ session: session })];
                case 1:
                    responsesByTopic = _d.sent();
                    for (topic in responsesByTopic) {
                        if (!Object.prototype.hasOwnProperty.call(responsesByTopic, topic)) {
                            continue;
                        }
                        try {
                            for (_a = (e_1 = void 0, tslib_1.__values(responsesByTopic[topic])), _b = _a.next(); !_b.done; _b = _a.next()) {
                                response = _b.value;
                                if (!response.success && !shopify_api_1.gdprTopics.includes(topic)) {
                                    result = response.result;
                                    if (result.errors) {
                                        config.logger.error("Failed to register ".concat(topic, " webhook: ").concat(result.errors[0].message), { shop: session.shop });
                                    }
                                    else {
                                        config.logger.error("Failed to register ".concat(topic, " webhook: ").concat(JSON.stringify(result.data)), { shop: session.shop });
                                    }
                                }
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function handleCallbackError(req, res, api, config, error) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _a;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = true;
                    switch (_a) {
                        case error instanceof shopify_api_1.InvalidOAuthError: return [3 /*break*/, 1];
                        case error instanceof shopify_api_1.CookieNotFound: return [3 /*break*/, 2];
                        case error instanceof shopify_api_1.BotActivityDetected: return [3 /*break*/, 4];
                    }
                    return [3 /*break*/, 5];
                case 1:
                    res.status(400);
                    res.send(error.message);
                    return [3 /*break*/, 6];
                case 2: return [4 /*yield*/, (0, redirect_to_auth_1.redirectToAuth)({ req: req, res: res, api: api, config: config })];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 4:
                    res.status(410);
                    res.send(error.message);
                    return [3 /*break*/, 6];
                case 5:
                    res.status(500);
                    res.send(error.message);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=auth-callback.js.map