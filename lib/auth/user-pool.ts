import { RemovalPolicy } from 'aws-cdk-lib';
import { IUserPool, UserPool } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class CognitoUserPool extends Construct {
	public readonly userPoolId: string;
	public readonly userPoolClientId: string;
	public readonly userPool: IUserPool;

	constructor(scope: Construct, id: string) {
		super(scope, id);

		this.userPool = new UserPool(this, 'UserPool', {
			signInAliases: { username: true, email: true },
			selfSignUpEnabled: true,
			removalPolicy: RemovalPolicy.DESTROY,
		});

		const appClient = this.userPool.addClient('AppClient', {
			authFlows: {userPassword: true },
		});

		this.userPoolId = this.userPool.userPoolId;
		this.userPoolClientId = appClient.userPoolClientId;
	}
}