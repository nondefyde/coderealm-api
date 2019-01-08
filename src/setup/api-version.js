import Q from 'q';

export default config => {
	const version = config.get('api.versions').pop();
	process.env.API_VERSION = `v${version}`;
	return Q.resolve();
};
