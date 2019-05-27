# LivingApps Javascript SDK
Download, Upload, Update Records in LivingApps

## Its an alpha
This package is in alpha stage and used for internal projects, but we do not 
recommend to use it in your production projects.

## Usage
install the livingsdk
```bash
$ npm i @livinglogic/livingsdk 
```

```typescript
// import LivingSDK class
import { LivingSDK } from '@livinglogic/livingsdk';
// create livingsdk instance
const lsdk = new LivingSDK();
```

## Testing
- replace placeholders in .local.env
```bash
source .local.env
npm i 
npm run test
```