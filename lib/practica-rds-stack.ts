import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from "aws-cdk-lib/aws-iam";
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from 'constructs';
import path = require('path');

export class PracticaRdsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the IAM role to lambda
    const lambdaRole = new iam.Role(this, `lambda-role`, {
      roleName: `${this.stackName}-role-stack`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    // creacion de politica para logs
    const cloudwatchPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["logs:*"],
      resources: ["*"],
    });

    lambdaRole.addToPolicy(cloudwatchPolicy)

    const api = new apigateway.RestApi(this, 'api', {
      description: `${this.stackName}`,
      restApiName: `${this.stackName}`,
      deployOptions: {
        stageName: 'dev',
      },
    });

    const lambdafn = new NodejsFunction(this, "lambda.name", {
      bundling: {
        minify: true,
        externalModules: ["aws-sdk"],
      },
      memorySize: 1024,
      functionName: `${this.stackName}-lam`,
      environment: {  },
      entry: path.join(__dirname, `/../src/handler.ts`),
      timeout: cdk.Duration.seconds(50),
      handler: 'main',
      runtime: lambda.Runtime.NODEJS_16_X,
      logRetention: logs.RetentionDays.ONE_WEEK,
      role: lambdaRole,
    });

    const books = api.root.addResource('books');

    books.addMethod('GET', new apigateway.LambdaIntegration(lambdafn))

  }
}
