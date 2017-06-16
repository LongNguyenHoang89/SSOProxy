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

- MongoDB (2.x or later) (see https://www.mongodb.com/download-center?jmp=nav or use your GNU/Linux package manager)

(No need to create manually the database)

## Launch it (localhost)

### HTTPS

Generate the private key and the certificate signing request :

```
openssl req -new -newkey rsa:2048 -nodes -out localhost.csr -keyout private.key
```
Fill the information and be sure to answer "localhost" to the "Common name" input.

Generate the certificate (note that you must use the private.key and localhost.csr files generated previously):

```
openssl x509 -req -days 365 -in localhost.csr -signkey private.key -out localhost.crt
```

### Launch

Install PM2 (see https://github.com/Unitech/pm2, basically run `npm install pm2 -g` to install it system-wide) and run :

```
pm2 start app.json
```

or directly (although we recommend that you use PM2) :

```
nodejs app.js
```

**Note that the app will be started on port 8080 (default in app.json and specified in app.json) and the authentication providers (Facebook, GitHub and Twitter) expect it runs on that port. Please do not change the port unless you know what you are doing.**

**Note that the app will communicate with a ConiksClient (Ajax requests) via HTTPS, so don't forget to add an security exception for Firefox or Chrome (the cert is self-signed or/and expired) 
