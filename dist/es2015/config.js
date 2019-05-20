import * as process from 'process';
export var livingappsData = {
    "username": process.env.TESTUSERNAME,
    "password": process.env.TESTPWD,
    "appId": process.env.TESTAPPID,
    "url": process.env.TESTSERVER,
};
console.log(process.env.TESTPWD);
export var removeData = undefined;
//# sourceMappingURL=config.js.map