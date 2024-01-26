import * as cdk from "aws-cdk-lib";

import { Construct } from "constructs";
import { ApiLambda } from "./api-lambda-construct";
import { RDS } from "./rds-construct";
import {
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import { Initialize } from "./initialize";

export class PracticaRdsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // api gateway con lambda
    const rdsApiLambda = new ApiLambda(this, "api-lambda", {
      name: this.stackName,
    });
    
  }
}
