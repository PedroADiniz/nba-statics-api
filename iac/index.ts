import * as pulumi from "@pulumi/pulumi";
import { Railway } from "./railway/index";

const config = new pulumi.Config();

const provider = config.require("Provider", { allowedValues: ["railway"] });

let infrastructure: pulumi.dynamic.Resource | null = null;

if (provider === "railway") {
  const RAILWAY_TOKEN = config.requireSecret("RAILWAY_TOKEN");
  const RAILWAY_PROJECT_NAME = config.require("RAILWAY_PROJECT_NAME");
  const RAILWAY_WORKSPACE_NAME = config.require("RAILWAY_WORKSPACE_NAME");
  const RAILWAY_DROPLET_NAME = config.require("RAILWAY_DROPLET_NAME");
  const RAILWAY_ENVIRONMENT_NAME = config.require("RAILWAY_ENVIRONMENT_NAME");
  const RAILWAY_DOCKER_IMAGE_NAME = config.require("RAILWAY_DOCKER_IMAGE_NAME");
  const RAILWAY_VARIABLE = config.requireSecretObject<Record<string, string>>(
    "RAILWAY_VARIABLE",
  );

  infrastructure = new Railway("railway-nba-api", {
    RAILWAY_PROJECT_NAME: RAILWAY_PROJECT_NAME,
    RAILWAY_WORKSPACE_NAME: RAILWAY_WORKSPACE_NAME,
    RAILWAY_DROPLET_NAME: RAILWAY_DROPLET_NAME,
    RAILWAY_ENVIRONMENT_NAME: RAILWAY_ENVIRONMENT_NAME,
    RAILWAY_TOKEN: RAILWAY_TOKEN,
    RAILWAY_DOCKER_IMAGE_NAME: RAILWAY_DOCKER_IMAGE_NAME,
    RAILWAY_VARIABLE: RAILWAY_VARIABLE,
  });
}

export { infrastructure };
