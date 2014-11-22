# express-fluent-logger

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]

access logger middleware using fluentd for express.js

## Install
```sh
$ npm install express-fluent-logger
```

## Example
```js
var app = require('express')();

app.use(require('express-fluent-logger')());

app.get('/', function(req, res) {
  res.send('hello world!');
});
```

## Test
```sh
$ fluentd -c test/fluent.conf &
$ npm test
```

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/express-fluent-logger.svg?style=flat
[npm-url]: https://npmjs.org/package/express-fluent-logger
[downloads-image]: https://img.shields.io/npm/dm/express-fluent-logger.svg?style=flat
[downloads-url]: https://npmjs.org/package/express-fluent-logger
[travis-image]: https://img.shields.io/travis/stoshiya/express-fluent-logger.svg?style=flat
[travis-url]: https://travis-ci.org/stoshiya/express-fluent-logger
