import axios, { AxiosResponse } from 'axios';
///@ts-ignore
import * as livingApi from '@livinglogic/livingapi';
///@ts-ignore
import * as ul4 from '@livinglogic/ul4';
import { agent } from './agent.def';

export type Auth_Token = string;
export type LivingApi = any;
export type LAPIRecord = any;

export interface LivingSDKOptions {
	url?: string;
	loginRequired?: boolean;
};

livingApi.Control.prototype.asjson = function(value: any) {
    return value;
};

livingApi.StringControl.prototype.asjson = function(value: string | null) {
    return value;
};

livingApi.GeoControl.prototype.asjson = function(value: livingApi.Geo | null) {
    if (value instanceof livingApi.Geo)
		value = `${value.lat}, ${value.long}, ${value.info}`;
	return value;
}

livingApi.DateControl.prototype.asjson = function(value: livingApi.Date_ | null) {
    return value;
}

livingApi.App.prototype.sdkinsert = function(values: any = {}) {
    let record = this.__call__(values);
	this.globals.handler.save(this);
	return this.globals.Login._insert(this, values);
}

livingApi.Record.prototype.sdkupdate = function(values: any = {}) {
    if (ul4._ismap(values))
	{
		for (let [key, value] of values.entries())
		{
			if (!this.fields.has(key))
				throw new ul4.ArgumentError("update() get an unexpected keyword argument " + ul4._repr(key));
			this.fields.get(key).value = value;
		}
	}
	else if (ul4._isobject(values))
	{
		for (let key in values)
		{
			if (!this.fields.has(key))
				throw new ul4.ArgumentError("update() get an unexpected keyword argument " + ul4._repr(key));
			this.fields.get(key).value = values[key];
		}
	}
	else
        throw new ul4.TypeError("values must be an object or a Map");

	this.app.globals.handler.save(this);
	return this.app.globals.Login._update(this, values);
}

// inject insert and update

export class LivingSDK {
	private _password: string;
	private _userName: string;
	private _options: LivingSDKOptions
	private hostName: string;
	private session: Promise<string | undefined>;
	constructor(options: LivingSDKOptions = {}, username?: string, password?: string) {
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
        if(!this._options.url)
            throw new Error('[LivingSDK] missing property ._options._url');
		this._options.url = this._options.url.lastIndexOf('/') === this._options.url.length - 1 ? this._options.url : `${this._options.url}/`;
		this.hostName = this._options.url.split('//')[1].substr(0, this._options.url.split('//')[1].length - 1);
		if (this._options.loginRequired && !this._userName) {
			throw new Error('[LivingSDK] You want to login without a username')
		}
		this.session = this.login();
	}

	/**
	 * get token for Session
	 * @return {Promise.<String>}
	 */
	login(): Promise<Auth_Token | undefined> {
		if (!this._options.loginRequired) {
			return Promise.resolve(undefined);
		}
		let url = `https://${this.hostName}/gateway/login`;
		return axios.post(url, {
			username: this._userName,
			password: this._password
		}, {
				httpsAgent: agent,
				headers: {
					"Content-Type": "application/json"
				}
			})
			.then((a: any) => a.data.auth_token);
	}

	get(appId: string, templateName?: string): Promise<LivingApi> {
		return this.session.then((auth_token: Auth_Token | undefined) => {
			return axios.get(`https://${this.hostName}/gateway/apps/${appId}${templateName !== undefined ? '?template=' + templateName : ''}`,
				{
					httpsAgent: agent,
					headers: {
						'X-La-Auth-Token': auth_token !== undefined ? auth_token : '',
						Accept: 'application/la-ul4on'
					}
				})
				.then((res: AxiosResponse) => {
					let dump: any;
					dump = ul4.loads(res.data);
					dump.get('globals').Login = this;
					return <LivingApi>dump;
				});
		});
	}

	_insert(app: any, values: any): Promise<LAPIRecord> {
		return this.session.then((auth_token) => {

			let fields: any = {};

			for (let ident in values) {
				if (!app.controls.has(ident)) {
					throw new Error(`insert() got an unexpected keyword argument ${ident}`);
				}
				
				fields[ident] = app.controls.get(ident).asjson(values[ident]);
			}
			let data: any = {}; {
			}
			data.id = app.id; 
			data.data = [{ 'fields': fields }];
			return axios.post(`https://${this.hostName}/gateway/v1/appdd/${app.id}.json`, {
				appdd: data
			}, {
					httpsAgent: agent,
					headers: {
						'X-La-Auth-Token': auth_token !== undefined ? auth_token : '',
					}
				})
				.then((res: AxiosResponse) => {
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
				})
		})

	}

	_update(record: LAPIRecord, values: any) {
		return this.session.then((auth_token: Auth_Token | undefined) => {
			let fields: any = {};
			let app = record.app;
			for (let ident in values) {
				if (!app.controls.has(ident)) {
					throw new Error(`update() got an unexpected keyword argument ${ident}`);
				}
				fields[ident] = values[ident];
			}
			let data: any = {};
			data.id = app.id;
			data.data = [{ 'id': record.id, 'fields': fields }];
			console.log(`https://${this.hostName}/gateway/v1/appdd/${app.id}.json`);
			return axios.post(`https://${this.hostName}/gateway/v1/appdd/${app.id}.json`, {
				appdd: data
			}, {
					httpsAgent: agent,
					headers: {
						'X-La-Auth-Token': auth_token !== undefined ? auth_token : '',
						'Content-Type': 'application/json'
					}
				})
				.then((res: AxiosResponse) => {
					let body = res.data;
					for (let ident in values)
						record.fields.get(ident).value = values[ident];
					let returnObj = {
						HTTPstatusCode: res.status,
						recordid: body.id,
						Record: record
					};
					return returnObj;
				});
		});
	}

	_delete(record: LAPIRecord) {
		let app = record.app;
		return this.session.then((auth_token: Auth_Token | undefined) => {
			return axios.delete(`https://${this.hostName}/gateway/v1/appdd/${app.id}/${record.id}.json`, {
				httpsAgent: agent,
				headers: {
					'X-La-Auth-Token': auth_token !== undefined ? auth_token : '',
				}
		
			})
		})
	}
}
