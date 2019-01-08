import crypto from 'crypto';
import config from 'config';

/**
 * The UserValidation class
 */
export class UserEmail {
	/**
	 * @param {Object} user The object to perform validation on
	 * @param {String} redirect_url The redirect url
	 * @return {Object} The template object fot send grid.
	 */
	static resetPassword(user, redirect_url) {
		const recovery_token = crypto.createHash('md5').update(user.password_reset_code).digest('hex');
		const link = `${redirect_url}/${user.email}/${recovery_token}`;
		return {
			templateId: config.get('emailAlerts.templateIds.passwordRecovery'),
			recipients: [user.email],
			substitutions: {
				reset_password_link: `${link}`,
				reset_password_code: `${user.password_reset_code}`,
			},
		};
	}

	/**
	 * @param {Object} user The object to perform validation on
	 * @param {String} verify_redirect_url The redirect url
	 * @return {Object} The template object fot send grid.
	 */
	static verify(user, verify_redirect_url) {
		const verify_token = crypto.createHash('md5').update(user.verification_code).digest('hex');
		const link = `${verify_redirect_url}/${user.email}/${verify_token}`;
		return {
			templateId: config.get('emailAlerts.templateIds.emailVerification'),
			recipients: [user.email],
			substitutions: {
				verification_link: `${link}`,
				verification_code: `${user.verification_code}`,
			},
		};
	}

	/**
	 * @param {Object} userInvite The object to perform validation on
	 * @param {String} invite_redirect_url The redirect url
	 * @return {Object} The template object fot send grid.
	 */
	static inviteUser(userInvite, invite_redirect_url) {
		const verify_token = crypto.createHash('md5').update(userInvite.invite_password).digest('hex');
		const link = `${invite_redirect_url}/${userInvite.email}/${verify_token}`;
		return {
			templateId: config.get('emailAlerts.templateIds.inviteUser'),
			recipients: [userInvite.email],
			substitutions: {
				companyName: userInvite.company.name,
				email: userInvite.email,
				invite_link: `${link}`,
				invite_password: `${userInvite.invite_password}`,
				host_url: `${invite_redirect_url}`,
			},
		};
	}
}
