import config from 'config';
import sgMail from '@sendgrid/mail';
import Validator from 'validatorjs';


/**
 * @class
 */
class EmailService {
	/**
	 * @function
	 * @return {object} the sendgrid instance
	 */
	static sendgridConfig() {
		sgMail.setApiKey(`${config.get('email.sendgridApiKey')}`);
		sgMail.setSubstitutionWrappers('{{', '}}'); // Configure the substitution tag wrappers globally
		return sgMail;
	}

	/**
	 * @function
	 * @param {object} options the options object
	 * @return {function} the email send function
	 */
	static async sendEmail(options) {
		try {
			if (`${config.util.getEnv('NODE_ENV')}` === 'test') {
				return;
			}
			const rules = {
				recipients: 'required',
				templateId: 'required',
			};
			const validator = new Validator(options, rules);
			if (validator.fails()) {
				console.log(validator.errors.all());
				throw new Error('Email options validation error');
			}
			const sgMail = this.sendgridConfig();
			const message = {
				to: options.recipients,
				from: options.from || config.get('email.from'),
				subject: options.subject || config.get('email.subject'),
				templateId: options.templateId,
			};
			if (options.substitutions) {
				message.dynamicTemplateData = Object.assign({}, options.substitutions, {appName: config.get('app.name')});
				return await sgMail.send(message);
			}
		} catch (e) {
			console.log('email error : ', e);
		}
	}
}

export default EmailService;
