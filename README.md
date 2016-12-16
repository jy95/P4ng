# P4ng [![Build Status](https://img.shields.io/travis/jy95/P4ng.svg)](https://travis-ci.org/jy95/P4ng)  [![Coveralls branch](https://img.shields.io/coveralls/jy95/P4ng/master.svg)](https://coveralls.io/github/jy95/P4ng?branch=master) [![Dependency Status](https://img.shields.io/david/jy95/P4ng.svg)](https://david-dm.org/jy95/P4ng)  [![Dev Dependency Status](https://img.shields.io/david/dev/jy95/P4ng.svg)](https://david-dm.org/jy95/P4ng?type=dev) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


> P4ng is a 4 player off and online version of the classic pong game by Team JaEGT.

## Install

> Notice :  
> We use a [MongoDb](https://www.mongodb.com) database for test and server.  
> Make sure that you run it before running

Clone this repository :

```sh
$ git clone https://github.com/jy95/P4ng.git
```
Install with [npm](https://www.npmjs.com/)
```sh
$ npm install --production
```

### Client Installation

> You have two possibilities to install the client.  
> Choose the preferred way

#### Electron packaged client

First step : Install the electron-packager

```sh
$ npm install electron-packager -g
```

Second step : Run the script :

```sh
$ npm run packagerApp
```
> This script is designed to work on Windows 32 bits  
> If you wish to change for your OS or architecture,    
> Change line 95 in scripts/packager-script.js to yours  
> https://github.com/electron-userland/electron-packager for more details

Last step : Run it :
> Example from Windows CMD

```sh
 <path/to/packagedClient>/P4ng.exe
```

#### Electron unpackaged client

Simply run this :

```sh
$ npm run startClient
```

### Server Installation

Simply run this :

```sh
$ npm run startServer
```

## Running tests

> Worry about the project stability ? Just use the tests  
> NB :  Only server tests

Install dev dependencies:

```sh
$ npm install --only=dev
```

Run the test :

```sh
$ npm test
```
> The tests are written in [Mocha](https://mochajs.org/)  
> Fun and simple :)

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jy95/P4ng/issues).

## Code Coverage
> Still never believe the crazy monkey ,known as an programmer, makes always a perfect commit ?  
> This section is for you.

As previously told , We use [Mocha](https://mochajs.org/) for testing.  
The choice for local coverage is [Istanbul](https://github.com/gotwarlost/istanbul) because It works fine with [Mocha](https://mochajs.org/) and in addiction to work with our [Coveralls](https://coveralls.io/github/jy95/P4ng?branch=master)

If you wish to check your coverage locally :

```sh
$ npm run cover
```

If you wish to check your coverage after a build on [Travis-CI](https://travis-ci.org/jy95/P4ng) , add this in your .travis.yml file :
> The dropDatabase line exists because Travis-CI runs npm test before this command

```sh
after_success:
  - mongo P4ngDb --eval "db.dropDatabase()"
  - npm run coveralls
```

## Team JaEGT members

**Jacques**

* [github/jy95](https://github.com/jy95)

**Emilien**

* [github/EmilienD](https://github.com/EmilienD)

**Gaël**

* [github/calypsow777](https://github.com/calypsow777)

**Theodor**

* [github/tdimov93](https://github.com/tdimov93)

## License

Copyright © 2016 [Team JaEGT](https://github.com/jy95/P4ng)
Licensed under the MIT license.
