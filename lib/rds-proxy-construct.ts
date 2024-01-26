import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
    AmazonLinuxGeneration,
    AmazonLinuxImage,
    Instance,
    InstanceClass,
    InstanceSize,
    InstanceType,
    Peer,
    Port,
    SecurityGroup,
    SubnetType,
    Vpc,
} from "aws-cdk-lib/aws-ec2";
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion } from "aws-cdk-lib/aws-rds";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import * as rds from 'aws-cdk-lib/aws-rds'
import { Construct } from "constructs"

type RdsProxyProps = {
}

export class RdsProxy extends Construct {

    private _proxy: rds.DatabaseProxy;
    private _vpc: Vpc;
    private _proxyGroup: SecurityGroup
    private _rdsSecretName: string;
    private _databaseCredentialsSecret: Secret

    constructor(scope: Construct, id: string, props?: RdsProxyProps) {
        super(scope, id)

        // 👇 create the VPC
        const vpc = new Vpc(this, 'my-cdk-vpc', {
            cidr: '10.0.0.0/16',
            natGateways: 0,
            maxAzs: 3,
            subnetConfiguration: [
                {
                    name: 'public-subnet-1',
                    subnetType: SubnetType.PUBLIC,
                    cidrMask: 24,
                },
                {
                    name: 'isolated-subnet-1',
                    subnetType: SubnetType.PRIVATE_ISOLATED,
                    cidrMask: 28,
                },
            ],
        });

        // 👇 create a security group for the EC2 instance
        const ec2InstanceSG = new SecurityGroup(this, 'ec2-instance-sg', {
            vpc,
        });

        ec2InstanceSG.addIngressRule(
            Peer.anyIpv4(),
            Port.tcp(22),
            'allow SSH connections from anywhere',
        );

        // 👇 create the EC2 instance
        const ec2Instance = new Instance(this, 'ec2-instance', {
            vpc,
            vpcSubnets: {
                subnetType: SubnetType.PUBLIC,
            },
            securityGroup: ec2InstanceSG,
            instanceType: InstanceType.of(
                InstanceClass.BURSTABLE2,
                InstanceSize.MICRO,
            ),
            machineImage: new AmazonLinuxImage({
                generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
            }),
            keyName: 'ec2-key-pair',
        });

        const dbInstance = new rds.DatabaseInstance(this, 'db-instance', {
            vpc,
            vpcSubnets: {
              subnetType: SubnetType.PRIVATE_ISOLATED,
            },
            engine: rds.DatabaseInstanceEngine.postgres({
              version: rds.PostgresEngineVersion.VER_13_10,
            }),
            instanceType: InstanceType.of(
              InstanceClass.BURSTABLE3,
              InstanceSize.MICRO,
            ),
            credentials: rds.Credentials.fromGeneratedSecret('postgres'),
            multiAz: false,
            allocatedStorage: 100,
            maxAllocatedStorage: 105,
            allowMajorVersionUpgrade: false,
            autoMinorVersionUpgrade: true,
            backupRetention: Duration.days(0),
            deleteAutomatedBackups: true,
            removalPolicy: RemovalPolicy.DESTROY,
            deletionProtection: false,
            databaseName: 'todosdb',
            publiclyAccessible: false,
          });
      
          dbInstance.connections.allowFrom(ec2Instance, Port.tcp(5432));
      
          new CfnOutput(this, 'dbEndpoint', {
            value: dbInstance.instanceEndpoint.hostname,
          });
      
          new CfnOutput(this, 'secretName', {
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            value: dbInstance.secret?.secretName!,
          });


    }




    get proxy() {
        return this._proxy
    }

    get rdsSecretName() {
        return this._rdsSecretName
    }

    get vpc() {
        return this._vpc
    }

    get proxyGroup() {
        return this._proxyGroup
    }

    get databaseCredentialsSecret() {
        return this._databaseCredentialsSecret
    }

}