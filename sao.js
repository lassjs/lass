const fs = require('fs');
const path = require('path');

const camelcase = require('camelcase');
const debug = require('debug')('lass');
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
      validate: (value) => {
        if (process.env.NODE_ENV === 'test' && value === 'lass') return true;

        return isValidNpmName(value);
      }
    },
    description: {
      message: 'How would you describe the new package',
      default: `my ${superb.random()} project`,
      validate: (value) =>
        /"/.test(value) ? 'Description cannot contain double quotes' : true
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
      validate: (value) =>
        semver.valid(value) ? true : 'Invalid semver version'
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
      validate: (value) => (isEmail(value) ? true : 'Invalid email')
    },
    website: {
      message: "What is your personal website (the author's)",
      default: conf.get('init-author-url') || '',
      store: true,
      validate: (value) => (value === '' || isURL(value) ? true : 'Invalid URL')
    },
    username: {
      message: 'What is your GitHub username or organization',
      store: true,
      default: async (answers) => {
        if (answers.name.indexOf('@') === 0)
          return answers.name.split('/')[0].slice(1);

        try {
          const githubUsername = await fetchGithubUsername(answers.email);
          return githubUsername;
        } catch (err) {
          debug(err);
          return ':gitUser:';
        }
      },
      validate: (value) =>
        githubUsernameRegex.test(value) ? true : 'Invalid GitHub username'
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
      validate: (value) => {
        return isURL(value) &&
          value.indexOf('https://github.com/') === 0 &&
          value.lastIndexOf('/') !== value.length - 1
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
      when: (answers) => answers.coverage,
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
    package: 'package.json',
    nycrc: '.nycrc'
  },
  filters: {
    // Exclude MIT license from being copied
    LICENSE: 'license === "MIT"',
    // Until this issue is resolved we need this line:
    // <https://github.com/saojs/sao/issues/59>
    'node_modules/**': false
  },
  post: async (ctx) => {
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

    // Create `LICENSE` file with license selected
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
    ].map((link) => console.log(`TODO: ${link}`));

    // Fix package.json file
    fixpack(`${ctx.folderPath}/package.json`);

    // Install packages
    if (ctx.answers.pm === 'yarn') ctx.yarnInstall();
    else ctx.npmInstall();

    // add husky hooks
    await execa('./node_modules/.bin/husky', ['install'], {
      cwd: ctx.folderPath,
      stdio: 'inherit'
    });

    await Promise.all([
      execa(
        './node_modules/.bin/husky',
        [
          'add',
          '.husky/commit-msg',
          `${
            ctx.answers.pm === 'yarn' ? 'yarn' : 'npx --no-install'
          } commitlint --edit $1`
        ],
        {
          cwd: ctx.folderPath,
          stdio: 'inherit'
        }
      ),
      execa(
        './node_modules/.bin/husky',
        [
          'add',
          '.husky/pre-commit',
          `${
            ctx.answers.pm === 'yarn' ? 'yarn' : 'npx --no-install'
          } lint-staged`
        ],
        {
          cwd: ctx.folderPath,
          stdio: 'inherit'
        }
      )
    ]);

    // Format code with xo
    await execa('./node_modules/.bin/xo', ['--fix'], {
      cwd: ctx.folderPath,
      stdio: 'inherit'
    });

    // Run tests
    await execa(which(ctx.answers.pm).stdout, ['test'], {
      cwd: ctx.folderPath,
      stdio: 'inherit'
    });

    // Make initial commit
    spawn.sync('git', ['add', '-A'], {
      cwd: ctx.folderPath
    });
    spawn.sync(
      'git',
      [
        'commit',
        '-m',
        'feat: initial commit from https://lass.js.org',
        '--no-verify'
      ],
      {
        cwd: ctx.folderPath
      }
    );

    ctx.showTip();
  }
};
