import mongoose from 'mongoose';

const categoryFashionId = mongoose.Types.ObjectId();
const categoryStyleId = mongoose.Types.ObjectId();
const categoryDesignId = mongoose.Types.ObjectId();

export const CATEGORIES = [
	{name: 'fashion', _id: categoryFashionId},
	{name: 'style', _id: categoryStyleId},
	{name: 'design', _id: categoryDesignId},
];

export const SEX = [
	{name: 'Male'},
	{name: 'Female'}
];

const userid1 = mongoose.Types.ObjectId();
const userid2 = mongoose.Types.ObjectId();
const userid3 = mongoose.Types.ObjectId();
const userid4 = mongoose.Types.ObjectId();
const userid5 = mongoose.Types.ObjectId();
const userid6 = mongoose.Types.ObjectId();
const userid7 = mongoose.Types.ObjectId();
const userid8 = mongoose.Types.ObjectId();
const userid9 = mongoose.Types.ObjectId();
const userid10 = mongoose.Types.ObjectId();
export const USERS = [
	{
		_id: userid1,
		email: `coder1@gmail.com`,
		password: 'password',
		account_verified: true,
		username: 'coder1'
	},
	{
		_id: userid2,
		email: `coder2@gmail.com`,
		password: 'password',
		account_verified: true,
		username: 'coder2'
	},
	{
		_id: userid3,
		email: `coder3@gmail.com`,
		password: 'password',
		account_verified: true,
		username: 'coder3'
	},
	{
		_id: userid4,
		email: `coder4@gmail.com`,
		password: 'password',
		account_verified: true,
		username: 'coder4'
	},
	{
		_id: userid5,
		email: `coder5@gmail.com`,
		password: 'password',
		account_verified: true,
		username: 'coder5'
	},
	{
		_id: userid6,
		email: `coder6@gmail.com`,
		password: 'password',
		account_verified: true,
		username: 'coder6'
	},
	{
		_id: userid7,
		email: `coder7@gmail.com`,
		password: 'password',
		account_verified: true,
		username: 'coder7'
	},
	{
		_id: userid8,
		email: `coder8@gmail.com`,
		password: 'password',
		account_verified: true,
		username: 'coder8'
	},
	{
		_id: userid9,
		email: `coder9@gmail.com`,
		password: 'password',
		account_verified: true,
		username: 'coder9'
	},
	{
		_id: userid10,
		email: `coder10@gmail.com`,
		password: 'password',
		account_verified: true,
		username: 'coder10'
	},
];
