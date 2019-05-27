import * as process from 'process';

export const livingappsData = {
    "username": process.env.TESTUSERNAME as string,
    "password": process.env.TESTPWD as string,
    "appId": process.env.TESTAPPID as string,
    "url": process.env.TESTSERVER as string,
}
export const removeData = true;