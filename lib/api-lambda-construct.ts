import { RestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import * as iam from "aws-cdk-lib/aws-iam";
import { NodejsFunction, type NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import * as path from "path";
import { Duration } from 'aws-cdk-lib';


type ApiLambdaProps = {
    name: string,
    lambdaProps?: NodejsFunctionProps
}

export class ApiLambda extends Construct {

    private _lambdafn: NodejsFunction;

    constructor(scope: Construct, id: string, props: ApiLambdaProps) {
        super(scope, id)

        // Define the IAM role to lambda
        const lambdaRole = new iam.Role(this, `lambda-role`, {
            roleName: `${props.name}-role-stack`,
            assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        });

        // creacion de politica para logs
        const cloudwatchPolicy = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["logs:*"],
            resources: ["*"],
        });

        lambdaRole.addToPolicy(cloudwatchPolicy)

        const api = new RestApi(this, 'api', {
            description: `${props.name}`,
            restApiName: `${props.name}`,
            deployOptions: {
                stageName: 'dev',
            },
        });

        this._lambdafn = new NodejsFunction(this, "lambda.name", {
            bundling: {
                minify: true,
                externalModules: ["aws-sdk"],
            },
            memorySize: 1024,
            functionName: `${props.name}-lam`,
            entry: path.join(__dirname, `/../src/handler.ts`),
            timeout: Duration.seconds(50),
            handler: 'main',
            runtime: lambda.Runtime.NODEJS_16_X,
            logRetention: logs.RetentionDays.ONE_WEEK,
            role: lambdaRole,
            ...props.lambdaProps
        });

        const books = api.root.addResource('books');

        books.addMethod('ANY', new LambdaIntegration(this._lambdafn))

    }

    get lambdafn() {
        return this._lambdafn
    }

}