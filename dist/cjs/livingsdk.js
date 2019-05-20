'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));
var livingApi = require('@livinglogic/livingapi');
var ul4 = require('@livinglogic/ul4');

var agent = undefined;

livingApi.Control.prototype.asjson = function (value) {
    return value;
};
livingApi.StringControl.prototype.asjson = function (value) {
    return value;
};
livingApi.GeoControl.prototype.asjson = function (value) {
    if (value instanceof livingApi.Geo)
        value = value.lat + ", " + value.long + ", " + value.info;
    return value;
};
livingApi.DateControl.prototype.asjson = function (value) {
    return value;
};
livingApi.App.prototype.sdkinsert = function (values) {
    if (values === void 0) { values = {}; }
    var record = this.__call__(values);
    this.globals.handler.save(this);
    return this.globals.Login._insert(this, values);
};
livingApi.Record.prototype.sdkupdate = function (values) {
    if (values === void 0) { values = {}; }
    if (ul4._ismap(values)) {
        for (var _i = 0, _a = values.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (!this.fields.has(key))
                throw new ul4.ArgumentError("update() get an unexpected keyword argument " + ul4._repr(key));
            this.fields.get(key).value = value;
        }
    }
    else if (ul4._isobject(values)) {
        for (var key in values) {
            if (!this.fields.has(key))
                throw new ul4.ArgumentError("update() get an unexpected keyword argument " + ul4._repr(key));
            this.fields.get(key).value = values[key];
        }
    }
    else
        throw new ul4.TypeError("values must be an object or a Map");
    this.app.globals.handler.save(this);
    return this.app.globals.Login._update(this, values);
};
// inject insert and update
var LivingSDK = /** @class */ (function () {
    function LivingSDK(options, username, password) {
        if (options === void 0) { options = {}; }
        /** @type {String} */
        this._password = password || '';
        /** @type {String} */
        this._userName = username || '';
        /** @type {Object} */
        this._options = {
            /** @type {String} */
            url: options.url || 'https://my.living-apps.de',
            /** @type {Boolean} */
            loginRequired: options.loginRequired !== undefined ? options.loginRequired : true
        };
        if (!this._options.url)
            throw new Error('[LivingSDK] missing property ._options._url');
        this._options.url = this._options.url.lastIndexOf('/') === this._options.url.length - 1 ? this._options.url : this._options.url + "/";
        this.hostName = this._options.url.split('//')[1].substr(0, this._options.url.split('//')[1].length - 1);
        if (this._options.loginRequired && !this._userName) {
            throw new Error('[LivingSDK] You want to login without a username');
        }
        this.session = this.login();
    }
    /**
     * get token for Session
     * @return {Promise.<String>}
     */
    LivingSDK.prototype.login = function () {
        if (!this._options.loginRequired) {
            return Promise.resolve(undefined);
        }
        var url = "https://" + this.hostName + "/gateway/login";
        return axios.post(url, {
            username: this._userName,
            password: this._password
        }, {
            httpsAgent: agent,
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(function (a) { return a.data.auth_token; });
    };
    LivingSDK.prototype.get = function (appId, templateName) {
        var _this = this;
        return this.session.then(function (auth_token) {
            return axios.get("https://" + _this.hostName + "/gateway/apps/" + appId + (templateName !== undefined ? '?template=' + templateName : ''), {
                httpsAgent: agent,
                headers: {
                    'X-La-Auth-Token': auth_token !== undefined ? auth_token : '',
                    Accept: 'application/la-ul4on'
                }
            })
                .then(function (res) {
                var dump;
                dump = ul4.loads(res.data);
                dump.get('globals').Login = _this;
                return dump;
            });
        });
    };
    LivingSDK.prototype._insert = function (app, values) {
        var _this = this;
        return this.session.then(function (auth_token) {
            var fields = {};
            for (var ident in values) {
                if (!app.controls.has(ident)) {
                    throw new Error("insert() got an unexpected keyword argument " + ident);
                }
                fields[ident] = app.controls.get(ident).asjson(values[ident]);
            }
            var data = {};
            data.id = app.id;
            data.data = [{ 'fields': fields }];
            return axios.post("https://" + _this.hostName + "/gateway/v1/appdd/" + app.id + ".json", {
                appdd: data
            }, {
                httpsAgent: agent,
                headers: {
                    'X-La-Auth-Token': auth_token !== undefined ? auth_token : '',
                }
            })
                .then(function (res) {
                return {
                    HTTPstatusCode: res.status,
                    recordid: res.data.id,
                    Record: new livingApi.Record({
                        id: res.data.id,
                        createdat: new Date(Date.now()),
                        updatedat: null,
                        updatedby: null,
                        updatecount: 0
                    })
                };
            });
        });
    };
    LivingSDK.prototype._update = function (record, values) {
        var _this = this;
        return this.session.then(function (auth_token) {
            var fields = {};
            var app = record.app;
            for (var ident in values) {
                if (!app.controls.has(ident)) {
                    throw new Error("update() got an unexpected keyword argument " + ident);
                }
                fields[ident] = values[ident];
            }
            var data = {};
            data.id = app.id;
            data.data = [{ 'id': record.id, 'fields': fields }];
            console.log("https://" + _this.hostName + "/gateway/v1/appdd/" + app.id + ".json");
            return axios.post("https://" + _this.hostName + "/gateway/v1/appdd/" + app.id + ".json", {
                appdd: data
            }, {
                httpsAgent: agent,
                headers: {
                    'X-La-Auth-Token': auth_token !== undefined ? auth_token : '',
                    'Content-Type': 'application/json'
                }
            })
                .then(function (res) {
                var body = res.data;
                for (var ident in values)
                    record.fields.get(ident).value = values[ident];
                var returnObj = {
                    HTTPstatusCode: res.status,
                    recordid: body.id,
                    Record: record
                };
                return returnObj;
            });
        });
    };
    LivingSDK.prototype._delete = function (record) {
        var _this = this;
        var app = record.app;
        return this.session.then(function (auth_token) {
            return axios.delete("https://" + _this.hostName + "/gateway/v1/appdd/" + app.id + "/" + record.id + ".json", {
                httpsAgent: agent,
                headers: {
                    'X-La-Auth-Token': auth_token !== undefined ? auth_token : '',
                }
            });
        });
    };
    return LivingSDK;
}());

exports.LivingSDK = LivingSDK;
//# sourceMappingURL=livingsdk.js.map
