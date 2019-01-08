import resources from '../../src/api/resource';

const length = resources.length;
const resourceItem = resources[Math.floor(Math.random() * length)];
export const Resource = resourceItem.model;
export const RESOURCE_NAME = resourceItem.resource_name;
/**
 * @return {Object}
 */
export const getResourceObj = () => {
	return {name: 'Test resource name'};
};
