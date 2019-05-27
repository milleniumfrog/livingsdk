# LivingSDK

A package for using LivingApps as Backend for your nodejs or browser javascript applications. It enables you to login users, download App data, create/update/delete records.

Warning: The SDK is in alpha stage.
So we do not recommend to use the SDK for production projects.

## Usage:
First we need to install and import 
```bash
$ npm i @livinglogic/livingsdk
```
```typescript
// import LivingSDK class
import { LivingSDK } from '@livinglogic/livingsdk';
// login your user (not always required)
const lsdk = new LivingSDK({}, yourUsername, yourPassword);
```
When you have authenticated the user, you can download data from LivingApps.
```typescript
lsdk.get(appId)
	.then((LAAPI: LAAPI) => {
        return LAAPI;
    })
```
After downloading the LivingApps App data you can update the downloaded records (you can filter with your LivingApps view vemplate, so you do not need to download all records).
```typescript
// download app data
lsdk.get(lsd.appId, lsdktemplates.admin)
	.then((LAAPI: LAAPI) => {
        // select app
		return LAAPI.get('datasources').get('self').app;
	})
	.then((storage: any) => {
        const arr: Promise<any>[] = [];
            // iterate through records and update them
			storage.records.forEach((record: any) => {
				arr.push(record.sdkupdate({
					text: '[JS] this is a updated text',
					number: 84,
					phone: '+49 0000 0000000001',
					url: 'https://dev.milleniumfrog.de',
					mail: 'update@example.com',
					date: new Date(),
					textarea: '[JS] this is an even more updatetext',
					selection: 'option_2',
					options: '_3',
					multiple_options: ['_2'],
					checkmark: true,
					geodata: '0.1,1.0,'
				}));
			});
			return Promise.all(arr);
	});
```
Very similar to updating is inserting and removing records.
```typescript
// download app data
lsdk.get(appId)
	.then((LAAPI: LAAPI) => {
        //  get datasource
		return LAAPI.get('datasources').get('self');
	})
	.then((storage: any) => {
        // select app and insert record to app
		return storage.app.sdkinsert({
			text: '[JS] this is a text',
			number: 42,
			phone: '+49 0000 0000000000',
			url: 'https://milleniumfrog.de',
			mail: 'web@example.com',
			date: new Date(),
			textarea: '[JS] this is even more text',
			selection: 'option_1',
			options: '_1',
			multiple_options: ['_1'],
			checkmark: true,
			geodata: '0.0,0.0,'
		});
    });

// download app data
lsdk.get(lsd.appId, lsdktemplates.admin)
	.then((LAAPI: LAAPI) => {
        // select
		return LAAPI.get('datasources').get('self').app;
	})
	.then((storage: any) => {
        const arr: Promise<any>[] = [];
        // iterate through records and delete them from livingapps
		storage.records.forEach((rec: any) => {
			arr.push(rec.sdkdelete());
		})
		return Promise.all(arr);
	})
```
### DONTS
- do not use record.update and record.insert, use record.sdkupdate and record.insert instead.
- do not login for each request, even when we do that in the tests. When you do that your requests need 1 second more per request. Create a global LivingSDK instance and use her until you need to reauthenticate.

### known Limitations:
- can not upload file fields


### Authors:
- René Schwarzinger (livingsdk, livingapi injections, tests)
- Walter Dörwald ([livingapi](https://github.com/LivingLogic/LivingApps.Javascript.LivingAPI.git))