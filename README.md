<h1 align="center">
  <a href="https://lass.js.org"><img src="https://cdn.rawgit.com/lassjs/lass/e39cd571/media/lass.png" alt="Lass" /></a>
</h1>
<div align="center">
  <a href="http://slack.crocodilejs.com"><img src="http://slack.crocodilejs.com/badge.svg" alt="chat" /></a>
  <a href="https://travis-ci.com/lassjs/lass"><img src="https://travis-ci.com/lassjs/lass.svg?branch=master" alt="build status" /></a>
  <a href="https://codecov.io/github/lassjs/lass"><img src="https://img.shields.io/codecov/c/github/lassjs/lass/master.svg" alt="code coverage" /></a>
  <a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code_style-XO-5ed9c7.svg" alt="code style" /></a>
  <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg" alt="styled with prettier" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/lassjs/lass.svg" alt="license" /></a>
  <a href="https://npm.im/lass"><img src="https://img.shields.io/npm/dt/lass.svg" alt="npm downloads" /></a>
</div>
<br />

<div align="center">
  Lass scaffolds a modern package boilerplate for <a href="https://nodejs.org">Node.js</a>
</div>

<div align="center">
  <sub>
    A lass that fell in love with a <a href="https://lad.js.org"><strong>lad</strong></a>
    &bull; Built by <a href="https://github.com/niftylettuce">@niftylettuce</a>
    and <a href="#contributors">contributors</a>
  </sub>
</div>

<hr />

<div align="center">:heart: Love this project? Support <a href="https://github.com/niftylettuce" target="_blank">@niftylettuce's</a> <a href="https://en.wikipedia.org/wiki/Free_and_open-source_software" target="_blank">FOSS</a> on <a href="https://patreon.com/niftylettuce" target="_blank">Patreon</a> or <a href="https://paypal.me/niftylettuce">PayPal</a> :unicorn:</div>


## Table of Contents

* [Features](#features)
* [Requirements](#requirements)
* [Install](#install)
* [Usage](#usage)
  * [Create a package](#create-a-package)
  * [Test it](#test-it)
* [Tips](#tips)
  * [Configuration](#configuration)
  * [Version Bump and Release](#version-bump-and-release)
* [Related](#related)
* [Contributors](#contributors)
* [Trademark Notice](#trademark-notice)
* [License](#license)


## Features

* Unit testing with [ava][]
* Commit linting with [commitlint][]
* Linting with [xo][] (uses [eslint][] and [prettier][])
* Markdown Linting with [remark][]
* Automatic code formatting with [prettier][]
* Automatic `git init`
* Automatic `npm install` (or `yarn install` if selected)
* Automatic builds, tests, and code coverage uploading to [Codecov][] with [Travis-CI][]
* Includes git/editor configurations:
  * [.gitignore](template/gitignore)
  * [.gitattributes](template/.gitattributes)
  * [.editorconfig](template/.editorconfig)
* Automatic markdown formatting and linting with [remark][]
  * Adheres to GitHub flavored markdown standards
  * Adds contributors section automatically with [remark-contributors][]
  * Adjusts heading gaps automatically
  * Adds a license block automatically with [remark-license][]
  * Utilizes configurable presets with [remark-preset-github][]
* Highly configurable and remembers your defaults with [sao][]
* Test coverage with [nyc][]
* Automatically generated files with tailored defaults
  * Readme with badges through [Shields.io][shields]
  * Choose from (343) different licenses with [spdx-license-list][] (defaults to your npm default or MIT)
  * Automatically inserts license year/name/email/website for MIT license if selected


## Requirements

Node.js v7.6.0+


## Install

[npm][]:

```sh
npm install -g lass
```

[yarn][]:

```sh
yarn global add lass
```


## Usage

### Create a package

```sh
lass new-package
cd new-package
```

### Test it

[npm][]:

```sh
npm test
```

[yarn][]:

```sh
yarn test
```


## Tips

### Configuration

You should configure [npm init defaults][npm-init-defaults] before using this package.

Run the following commands and replace the values below with your own:

```bash
npm config set init-author-email "niftylettuce@gmail.com"
npm config set init-author-name "Nick Baugh"
npm config set init-author-url "http://niftylettuce.com"
npm config set init-license "MIT"
npm config set init-version "0.0.0"
```

These defaults get utilized by `lass` when scaffolding a package and `npm init` in general.

To check your existing configuration, run `npm config list -l`.

### Version Bump and Release

We highly recommend to use the tools [np][] and [release][] to version bump and release your package to GitHub and NPM.


## Related

* [lad][] - Scaffold a [Koa][] webapp and API framework for [Node.js][node]
* [lipo][] - Free image manipulation API service built on top of [Sharp][]
* [cabin][] - Logging and analytics solution for [Node.js][node], [Lad][], [Koa][], and [Express][]


## Contributors

| Name             | Website                   |
| ---------------- | ------------------------- |
| **Nick Baugh**   | <http://niftylettuce.com> |
| **Pablo Varela** | <http://pablo.life>       |
| **Shaun Warman** | <http://shaunwarman.com>  |


## Trademark Notice

Lass, Lad, Cabin, Lipo, and their respective logos are trademarks of Niftylettuce LLC.
These trademarks may not be reproduced, distributed, transmitted, or otherwise used, except with the prior written permission of Niftylettuce LLC.
If you are seeking permission to use these trademarks, then please [contact us](mailto:niftylettuce@gmail.com).


## License

[MIT](LICENSE) © [Nick Baugh](http://niftylettuce.com)


## 

<a href="#"><img src="https://cdn.rawgit.com/lassjs/lass/e39cd571/media/lass-footer.png" alt="#" /></a>

[eslint]: https://eslint.org/

[xo]: https://github.com/sindresorhus/xo

[codecov]: https://codecov.io

[travis-ci]: https://travis-ci.com

[ava]: https://github.com/avajs/ava

[prettier]: https://prettier.io/

[npm]: https://www.npmjs.com/

[yarn]: https://yarnpkg.com/

[remark]: https://github.com/wooorm/remark

[remark-contributors]: https://github.com/hughsk/remark-contributors

[lad]: https://lad.js.org

[node]: https://nodejs.org

[koa]: http://koajs.com/

[remark-license]: https://github.com/wooorm/remark-license

[remark-preset-github]: https://github.com/niftylettuce/remark-preset-github

[sao]: https://sao.js.org/#/

[nyc]: https://github.com/istanbuljs/nyc

[shields]: https://shields.io/

[spdx-license-list]: https://github.com/sindresorhus/spdx-license-list

[npm-init-defaults]: https://docs.npmjs.com/misc/config#init-author-name

[sharp]: http://sharp.dimens.io/

[lipo]: https://lipo.io

[cabin]: http://cabinjs.com

[express]: https://expressjs.com

[commitlint]: https://github.com/marionebl/commitlint

[np]: https://github.com/sindresorhus/np

[release]: https://github.com/zeit/release
