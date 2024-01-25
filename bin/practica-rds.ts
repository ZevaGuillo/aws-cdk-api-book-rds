#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { PracticaRdsStack } from "../lib/practica-rds-stack";

const app = new cdk.App();

const Main = async (app: cdk.App) => {

  //contexto
  const stage = app.node.tryGetContext("stage") || "dev";
  const region = app.node.tryGetContext("region") || "us-east-2";

  try {
    new PracticaRdsStack(app, "practica-rds-stack", {
      stackName: `practica-rds-stack`,
      env: {
        region: process.env.CDK_DEFAULT_REGION,
        account: process.env.CDK_DEFAULT_ACCOUNT,
      },
    });
  } catch (e) {
    console.error(e);
  }

  app.synth();
};

Main(app);
