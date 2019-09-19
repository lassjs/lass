const fs = require('fs');
const path = require('path');

const camelcase = require('camelcase');
const execa = require('execa');
const fetchGithubUsername = require('github-username');
const fixpack = require('fixpack');
const githubUsernameRegex = require('github-username-regex');
const isEmail = require('is-email');
const isURL = require('is-url');
const isValidNpmName = require('is-valid-npm-name');
const npmConf = require('npm-conf');
const semver = require('semver');
const slug = require('speakingurl');
const spawn = require('cross-spawn');
const spdxLicenseList = require('spdx-license-list/full');
const superb = require('superb');
const uppercamelcase = require('uppercamelcase');
const { which } = require('shelljs');

const conf = npmConf();

const defaultLicense =
  conf.get('init-license') === 'ISC' ? 'MIT' : conf.get('init-license');

module.exports = {
  updateNotify: true,
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
      default: () => process.argv[2] || ':folderName:',
      validate: val => {
        if (process.env.NODE_ENV === 'test' && val === 'lass') return true;
        return isValidNpmName(val);
      }
    },
    description: {
      message: 'How would you describe the new package',
      default: `my ${superb.random()} project`
    },
    pm: {
      message: 'Choose a package manager',
      choices: ['npm', 'yarn'],
      type: 'list',
      default: 'npm',
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
      default: conf.get('init-version') || '0.0.0',
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
    },
    coverage: {
      message: 'Check code coverage after tests run',
      type: 'confirm',
      default: false,
      store: true
    },
    threshold: {
      when: answers => answers.coverage,
      type: 'list',
      message:
        'Select code coverage threshold required to pass (across lines/functions/branches)',
      choices: ['100', '90', '80', '70', '60', '50', '40', '30', '20', '10'],
      store: true
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

    const gh = ctx.answers.repo
      .replace('https://github.com/', '')
      .replace('.git', '');

    // <https://github.com/saojs/sao/issues/133>
    const cmd = `remote add origin git@github.com:${gh}.git`;
    const proc = spawn.sync('git', cmd.split(' '), {
      cwd: ctx.folderPath,
      stdio: 'inherit'
    });
    if (proc.error && proc.error.code === 'ENOENT') {
      ctx.log.warn(
        `${ctx.chalk.bold(
          'git'
        )} was not installed on this machine, therefore \`${cmd}\` was skipped.`
      );
    }

    // create `LICENSE` file with license selected
    if (ctx.answers.license !== 'MIT') {
      try {
        fs.writeFileSync(
          path.join(ctx.folderName, 'LICENSE'),
          spdxLicenseList[ctx.answers.license].licenseText
        );
        ctx.logger.warn(
          `You should update the ${ctx.chalk.yellow(
            'LICENSE'
          )} file accordingly (e.g. add your name/company/year)`
        );
      } catch (err) {
        ctx.logger.error(err);
      }
    }

    // Comment links for user
    [
      ctx.answers.repo,
      `https://travis-ci.com/${gh}`,
      `https://codecov.io/gh/${gh}`
    ].map(link => console.log(`TODO: ${link}`));

    // Fix package.json file
    fixpack(`${ctx.folderPath}/package.json`);

    // Install packages
    if (ctx.answers.pm === 'yarn') {
      ctx.yarnInstall();
    } else {
      ctx.npmInstall();
    }

    // Format code with xo
    await execa(`./node_modules/.bin/xo`, ['--fix'], {
      cwd: ctx.folderPath,
      stdio: 'inherit'
    });

    // Run tests
    await execa(which(ctx.answers.pm).stdout, ['test'], {
      cwd: ctx.folderPath,
      stdio: 'inherit'
    });

    ctx.showTip();
  }
};
