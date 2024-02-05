import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { ConfirmSignUpRequest } from 'aws-sdk/clients/cognitoidentityserviceprovider';
import { sendResponse } from 'src/utils';

const cognito = new CognitoIdentityServiceProvider();

type eventBody = { username: string; code: string };

export const handler = async function (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	console.log('[EVENT]', event);

	if (!event.body) {
		const res = {
			message: 'Debes proporcionar un código de verificación',
		}
		return sendResponse(res, 400);
	}

	const { username, code }: eventBody = JSON.parse(event.body);

	const params: ConfirmSignUpRequest = {
		ClientId: process.env.CLIENT_ID!,
		Username: username,
		ConfirmationCode: code,
	};

	try {
		const res = await cognito.confirmSignUp(params).promise();
		console.log('[AUTH]', res);

		const respose = {
			message: `Usuario ${username} confirmado exitosamente`,
			confirmed: true,
		}

		return sendResponse(respose, 200);

	} catch (err) {
		const res = {
			message: err,
		}
		return sendResponse(res, 500);
	}
};