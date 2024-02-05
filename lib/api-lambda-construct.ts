import {
  RestApi,
  LambdaIntegration,
  EndpointType,
  Cors,
  IResource,
  MethodOptions,
} from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import {
  NodejsFunction,
  type NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import * as path from "path";
import { Duration } from "aws-cdk-lib";

type ApiLambdaProps = {
  name: string;
  lambdaProps?: NodejsFunctionProps;
  apiGatewayOptions?: MethodOptions;
};

export class ApiLambda extends Construct {
  public readonly apiResource: IResource;
  public readonly apiFunction: NodejsFunction;
  public readonly apiGateway: RestApi;

  constructor(scope: Construct, id: string, props: ApiLambdaProps) {
    super(scope, id);

    this.apiGateway = new RestApi(this, "api", {
      description: `${props.name}`,
      restApiName: `${props.name}`,
      endpointTypes: [EndpointType.REGIONAL],
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
      },
      deployOptions: {
        stageName: "dev",
      },
    });

    this.apiResource = this.apiGateway.root.addResource("book");
    const entry = path.join(__dirname, `/../src/handler.ts`);

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

    lambdaRole.addToPolicy(cloudwatchPolicy);

    // Define the IAM role to lambdaF

    this.apiFunction = new NodejsFunction(this, "lambda.name", {
      bundling: {
        minify: true,
        externalModules: ["aws-sdk"],
      },
      memorySize: 1024,
      functionName: `${props.name}-lam`,
      entry: path.join(__dirname, `/../src/handler.ts`),
      timeout: Duration.seconds(50),
      handler: "main",
      runtime: lambda.Runtime.NODEJS_16_X,
      logRetention: logs.RetentionDays.ONE_WEEK,
      role: lambdaRole,
      ...props.lambdaProps,
    });

    const idBooks = this.apiResource.addResource("{id}");

    this.apiResource.addMethod("GET", new LambdaIntegration(this.apiFunction), props.apiGatewayOptions);
    this.apiResource.addMethod("POST", new LambdaIntegration(this.apiFunction), props.apiGatewayOptions);
    idBooks.addMethod("PUT", new LambdaIntegration(this.apiFunction), props.apiGatewayOptions);
    idBooks.addMethod("DELETE", new LambdaIntegration(this.apiFunction), props.apiGatewayOptions);
  }

}
