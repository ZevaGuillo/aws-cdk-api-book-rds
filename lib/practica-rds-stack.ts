import * as cdk from "aws-cdk-lib";

import { Construct } from "constructs";
import { ApiLambda } from "./api-lambda-construct";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import * as iam from "aws-cdk-lib/aws-iam";
import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { CognitoUserPool } from "./auth/user-pool";
import { AuthApi } from "./auth/auth-api";

export class PracticaRdsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //get claves de secret manager
    const dbCredentialSecret = Secret.fromSecretNameV2(
      this,
      "db-secret",
      "rds!db-06331e49-949d-4af8-8069-26ed22dd9e93"
    );

    // get default VPC
    // const defaultVpc = Vpc.fromLookup(this, "VPC", {
    //   vpcId: "vpc-00e1a000cee3566f4"
    // })

    // // get segurity group de rds
    // const segurityGroupRDS = SecurityGroup.fromLookupById(this, "rds-segurity-group", "sg-089fdef234f6c2691")

    // // Define the IAM role to lambda
    // const lambdaRole = new iam.Role(this, `lambda-Role`, {
    //   assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'), // Cambia según el servicio que estés utilizando
    // });
    // lambdaRole.addToPolicy(new iam.PolicyStatement({
    //   actions: [
    //     'ec2:CreateNetworkInterface',
    //     // Agrega otras acciones que puedan ser necesarias
    //   ],
    //   resources: ['*'], // Puedes ajustar esto según tus necesidades
    // }));

    // cognito
    const userPool = new CognitoUserPool(this, "UserPool");
    const { userPoolId, userPoolClientId } = userPool;

    new AuthApi(this, "AuthServiceApi", {
      userPoolId,
      userPoolClientId,
    });

    // api gateway con lambda
    const rdsApiLambda = new ApiLambda(this, "api-lambda", {
      name: this.stackName,
      lambdaProps: {
        environment: {
          DB_HOST: "database-1.cz0uggsaudwo.us-east-1.rds.amazonaws.com",
          DB_PORT: "5432",
          DB_USER: dbCredentialSecret
            .secretValueFromJson("username")
            .unsafeUnwrap(),
          DB_PASSWORD: dbCredentialSecret
            .secretValueFromJson("password")
            .unsafeUnwrap(),
          DB_NAME: "booksdb",
        },
        allowPublicSubnet: true,
      },
    });
  }
}
