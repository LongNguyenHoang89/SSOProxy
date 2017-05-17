# SSOProxy
CONIKS single sign on proxy. There are two main contributions of this proxy:

- Create a proof-of-concept single sign on system that supports authentication via social network API.
- Communicate with a CONIKS Client to perform registration and lookup requests.

## Dependencies
Install NodeJS (see https://github.com/nodejs/node or for GNU/Linux distrib you can install it via Nodesource https://github.com/nodesource/distributions)
(NPM is bundled with NodeJS)

```
npm install
```

### Other dependency

- MongoDB (2.x or later)

## Launch it
Install PM2 (see https://github.com/Unitech/pm2, basically run `npm install pm2 -g` to install it system-wide) and run :

```
pm2 start app.json
```

or directly (although we recommend that you use PM2) :

```
nodejs app.js
```

**Note that the app will be started on port 8080 (default in app.json and specified in app.json) and the authentication providers (Facebook, GitHub and Twitter) expect it runs on that port. Please do not change the port unless you know what you are doing.**
