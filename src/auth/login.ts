import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { InitiateAuthRequest } from 'aws-sdk/clients/cognitoidentityserviceprovider';
import { sendResponse } from 'src/utils';

const cognito = new CognitoIdentityServiceProvider();

export const handler = async function (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	console.log('[EVENT]', event);

	if (!event.body) {

		return sendResponse(JSON.stringify({
			message: 'You must provide a username and password',
		}), 400);
	}

	const { username, password } = JSON.parse(event.body);

	const params: InitiateAuthRequest = {
		ClientId: process.env.CLIENT_ID!,
		AuthFlow: 'USER_PASSWORD_AUTH',
		AuthParameters: {
			USERNAME: username,
			PASSWORD: password,
		},
	};

	try {
		const { AuthenticationResult } = await cognito.initiateAuth(params).promise();
		console.log('[AUTH]', AuthenticationResult);

		if (!AuthenticationResult) {
			const res = {
				message: 'User login failed',
			}
			return sendResponse(res, 400);
		}

		const token = AuthenticationResult.IdToken;

		const res = {
			message: 'Auth successfull',
			token: token,
		}

		return sendResponse(res, 500, {
			'Access-Control-Allow-Headers': '*',
			'Access-Control-Allow-Origin': '*',
			'Set-Cookie': `token=${token}; SameSite=None; Secure; HttpOnly; Path=/; Max-Age=3600;`,
		});
	} catch (err) {
		console.error(err);
		const res = {
			message: err,
		}
		return sendResponse(res, 500);
	}
};