docute.init({
	debug: true,
	routerMode: 'history',
	title: 'Lass',
	repo: 'lassjs/lass',
	'edit-link': 'https://github.com/lassjs/lass/tree/master/',
	twitter: 'niftylettuce',
	nav: {
		default: [
			{
				title: 'Scaffold a modern package boilerplate for Node.js',
				path: '/'
			}
		]
	},
	plugins: [
		docuteEmojify()
	]
});
