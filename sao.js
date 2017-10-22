const path = require('path');
const fs = require('fs');

const githubUsernameRegex = require('github-username-regex');
// const opn = require('opn');
const isURL = require('is-url');
const isEmail = require('is-email');
const semver = require('semver');
const spdxLicenseList = require('spdx-license-list/full');
const superb = require('superb');
const camelcase = require('camelcase');
const uppercamelcase = require('uppercamelcase');
const slug = require('speakingurl');
const npmConf = require('npm-conf');
const npmExists = require('npm-name-exists');
const isValidNpmName = require('is-valid-npm-name');
const fetchGithubUsername = require('github-username');

const conf = npmConf();

const defaultLicense =
  conf.get('init-license') === 'ISC' ? 'MIT' : conf.get('init-license');

module.exports = {
  enforceNewFolder: true,
  templateOptions: {
    context: {
      camelcase,
      uppercamelcase
    }
  },
  prompts: {
    name: {
      message: 'What is the name of the new package',
      default: ':folderName:',
      validate: async val => {
        if (process.env.NODE_ENV === 'test' && val === 'lass') return true;
        const check = isValidNpmName(val);
        if (check !== true) return check;
        return (await npmExists(val))
          ? `The package "${val}" already exists on npm`
          : true;
      }
    },
    description: {
      message: 'How would you describe the new package',
      default: `my ${superb()} project`
    },
    pm: {
      message: 'Choose a package manager',
      choices: ['npm5', 'yarn'],
      type: 'list',
      default: 'npm5',
      store: true
    },
    public: {
      message: 'Publicly available package',
      type: 'confirm',
      default: true
    },
    license: {
      message: 'Choose a license',
      choices: Object.keys(spdxLicenseList),
      type: 'list',
      default: defaultLicense,
      store: true
    },
    version: {
      message: 'Choose an initial semver version',
      default: conf.get('init-version'),
      validate: val => (semver.valid(val) ? true : 'Invalid semver version')
    },
    author: {
      message: "What is your name (the author's)",
      default: conf.get('init-author-name') || ':gitUser:',
      store: true
    },
    email: {
      message: "What is your email (the author's)",
      default: conf.get('init-author-email') || ':gitEmail:',
      store: true,
      validate: val => (isEmail(val) ? true : 'Invalid email')
    },
    website: {
      message: "What is your personal website (the author's)",
      default: conf.get('init-author-url') || '',
      store: true,
      validate: val => (val === '' || isURL(val) ? true : 'Invalid URL')
    },
    username: {
      message: 'What is your GitHub username or organization',
      store: true,
      default: async answers => {
        if (answers.name.indexOf('@') === 0)
          return answers.name.split('/')[0].substring(1);
        try {
          const githubUsername = await fetchGithubUsername(answers.email);
          return githubUsername;
        } catch (err) {
          return ':gitUser:';
        }
      },
      validate: val =>
        githubUsernameRegex.test(val) ? true : 'Invalid GitHub username'
    },
    repo: {
      message: "What is your GitHub repository's URL",
      default(answers) {
        const name =
          answers.name.indexOf('@') === 0
            ? answers.name.split('/')[1]
            : slug(answers.name);
        return `https://github.com/${slug(answers.username, {
          maintainCase: true
        })}/${name}`;
      },
      validate: val => {
        return isURL(val) &&
          val.indexOf('https://github.com/') === 0 &&
          val.lastIndexOf('/') !== val.length - 1
          ? true
          : 'Please include a valid GitHub.com URL without a trailing slash';
      }
    },
    keywords: {
      message:
        'Write some keywords related to your project (comma/space separated)',
      default(answers) {
        return `${answers.name} lass`;
      }
    }
  },
  move: {
    // We keep `.gitignore` as `gitignore` in the project
    // Because when it's published to npm
    // `.gitignore` file will be ignored!
    gitignore: '.gitignore',
    README: 'README.md',
    package: 'package.json'
  },
  filters: {
    // exclude MIT license from being copied
    LICENSE: 'license === "MIT"',
    // until this issue is resolved we need this line:
    // <https://github.com/saojs/sao/issues/59>
    'node_modules/**': false
  },
  post: async ctx => {
    ctx.gitInit();

    if (ctx.answers.pm === 'yarn') {
      ctx.yarnInstall();
    } else {
      ctx.npmInstall();
    }

    // create `LICENSE` file with license selected
    if (ctx.answers.license !== 'MIT') {
      try {
        fs.writeFileSync(
          path.join(ctx.folderName, 'LICENSE'),
          spdxLicenseList[ctx.answers.license].licenseText
        );
        ctx.log.warn(
          `You should update the ${ctx.chalk.yellow(
            'LICENSE'
          )} file accordingly (e.g. add your name/company/year)`
        );
      } catch (err) {
        ctx.log.error(err);
      }
    }

    /*
    try {
      const gh = ctx.answers.repo.replace('https://github.com/', '');
      await Promise.all(
        [
          ctx.answers.repo,
          `https://travis-ci.${ctx.answers.public ? 'org' : 'com'}/${gh}`,
          `https://codecov.io/gh/${gh}`
        ].map(link => opn(link, { wait: false }))
      );
      ctx.log.success(
        'Opened browser to GitHub, Travis-CI, and Codecov for configuration!'
      );
    } catch (err) {
      ctx.log.error(err.message);
    }
    */

    ctx.showTip();
  }
};
