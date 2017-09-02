// Currently this isn't working due to:
// <https://github.com/prettier/prettier/pull/2434>
// <https://github.com/wooorm/remark-usage/issues/12>
// <https://github.com/wooorm/remark-usage/issues/11>

// <sub>This section is automatically rendered from [example.js](example.js).</sub>

// ### Install

// [npm][]:

console.log('sh', 'npm install -g sao');
console.log('sh', 'sao lass new-package');

// [yarn][]:

console.log('sh', 'yarn global add sao');
console.log('sh', 'sao lass new-package');

// ### Prompts

console.log(
  'log',
  `? ${Object.keys(require('./sao').prompts)
    .map(p => require('./sao').prompts[p].message)
    .join('\n? ')}`
);

// ### Structure

console.log(
  'sh',
  require('child_process')
    .execSync('tree new-package -I "node_modules|media|coverage"')
    .toString()
);
