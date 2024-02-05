import { APIGatewayProxyResult } from 'aws-lambda';
import { sendResponse } from 'src/utils';

export const handler = async function (): Promise<APIGatewayProxyResult> {

	return sendResponse(
		{
			message: 'Signout successfull',
		},
		200,
		{
			'Access-Control-Allow-Headers': '*',
			'Access-Control-Allow-Origin': '*',
			'Set-Cookie':
				'token=x; SameSite=None; Secure; HttpOnly; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;',
		});
};