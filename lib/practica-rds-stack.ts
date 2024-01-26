import * as cdk from 'aws-cdk-lib';

import { Construct } from 'constructs';
import { ApiLambda } from './api-lambda-construct';
import { RdsProxy } from './rds-proxy-construct';

export class PracticaRdsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const rdsProxy = new RdsProxy(this, 'rds-proxy')

    // api gateway con lambda 
    const rdsApiLambda = new ApiLambda(this, "api-lambda", {
      name: this.stackName,
      // lambdaProps: {
      //   vpc: rdsProxy.vpc,
      //   securityGroups: [rdsProxy.proxyGroup],
      //   environment: {
      //     PROXY_ENDPOINT: rdsProxy.proxy.endpoint,
      //     RDS_SECRET_NAME: rdsProxy.rdsSecretName
      //   }
      // }
    });

    // rdsProxy.databaseCredentialsSecret.grantRead(rdsApiLambda.lambdafn)

  }
}
