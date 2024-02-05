import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { SignUpRequest } from 'aws-sdk/clients/cognitoidentityserviceprovider';
import { sendResponse } from 'src/utils';

const cognito = new CognitoIdentityServiceProvider();

type eventBody = {
	username: string;
	email: string;
	password: string;
};

export const handler = async function (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	console.log('[EVENT]', event);

	if (!event.body) {

		return sendResponse({
			message: 'You must provide an email and password',
		}, 400);
	}

	const { username, email, password }: eventBody = JSON.parse(event.body);

	const params: SignUpRequest = {
		ClientId: process.env.CLIENT_ID!,
		Username: username,
		Password: password,
		UserAttributes: [{ Name: 'email', Value: email }],
	};

	try {
		const res = await cognito.signUp(params).promise();
		console.log('[AUTH]', res);

		return sendResponse({
			message: res,
		}, 200);

	} catch (err) {
		console.error(err);
		const res = {
			message: err,
		}
		return sendResponse(res, 500);
	}
};