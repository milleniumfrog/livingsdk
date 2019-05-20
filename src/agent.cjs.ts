import * as https from 'https';
export const agent = new https.Agent({
    ecdhCurve: 'auto'
});