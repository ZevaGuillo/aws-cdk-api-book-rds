import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Provider } from "aws-cdk-lib/custom-resources";
import * as path from "path";
import { Construct } from "constructs";

interface InitializeProps {
  vpc: ec2.Vpc;
  securityGroup: ec2.SecurityGroup;
  dataBase: rds.DatabaseInstance;
}

export class Initialize extends Construct {
  constructor(scope: Construct, id: string, props: InitializeProps) {
    super(scope, id);

    const pgLayer = new lambda.LayerVersion(this, 'pg-layer', {
        compatibleRuntimes: [
          lambda.Runtime.NODEJS_18_X,
        ],
        code: lambda.Code.fromAsset('src/layers/pg-utils'),
        description: 'Uso de libreria de postgres',
      });

    const initializeLambda = new NodejsFunction(this, "InitializeTableLambda", {
      // D:\Guillermo\proyecto\AWS\practica-RDS\src\resources\init-rds.ts
      entry: path.join(__dirname, "../src/resources/init-rds.ts"),
      runtime: lambda.Runtime.NODEJS_18_X,
      bundling: {
        externalModules: ["@aws-sdk/*"],
      },
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      timeout: cdk.Duration.minutes(5),
      environment: {
        RDS_SECRET_NAME: props.dataBase.secret?.secretName!,
        POSTGRES_DB: props.dataBase.secret?.secretValueFromJson("engine").unsafeUnwrap().toString()!,
        POSTGRES_USER:
          props.dataBase.secret?.secretValueFromJson("username").unsafeUnwrap().toString()!,
        POSTGRES_PASSWORD:
          props.dataBase.secret?.secretValueFromJson("password").unsafeUnwrap().toString()!,
        POSTGRES_HOST: props.dataBase.secret?.secretValueFromJson("host").unsafeUnwrap().toString()!,
        POSTGRES_PORT: "5432",
      },
    });
    
    const provider = new Provider(this, "CustomResourceProvider", {
      onEventHandler: initializeLambda,
    });

    new cdk.CustomResource(this, "customResourceResult", {
      serviceToken: provider.serviceToken,
    });
  }
}
