import {
  type CustomResourceOptions,
  dynamic,
  type Input,
} from "@pulumi/pulumi";

type TProvisionByDockerInput = {
  RAILWAY_TOKEN: string;
  RAILWAY_WORKSPACE_NAME: string;
  RAILWAY_PROJECT_NAME: string;
  RAILWAY_WORKSPACE_ID: string;
  RAILWAY_PROJECT_ID: string;
  RAILWAY_SERVICE_ID: string;
  RAILWAY_DROPLET_NAME: string;
  RAILWAY_ENVIRONMENT_ID: string;
  RAILWAY_ENVIRONMENT_NAME: string;
  RAILWAY_DOCKER_IMAGE_NAME: string;
  RAILWAY_VARIABLE: Record<string, string>;
};

type TProvisionByDockerOutput = {
  workspace: Pick<TWorkspace, "id">;
  project: Pick<TWorkspace, "id">;
  droplet: Pick<TDroplet, "id">;
  environment: Pick<TEnvironment, "id">;
  variable: boolean;
  RAILWAY_TOKEN: string;
};

type TWorkspace = { id: string; name: string };
type TProject = { id: string; name: string };
type TDroplet = { id: string; name: string };
type TEnvironment = { id: string; name: string };

function parseWorkspaces(source: unknown): Array<TWorkspace> {
  if (
    source &&
    typeof source === "object" &&
    "data" in source &&
    source.data &&
    typeof source.data === "object" &&
    "me" in source.data &&
    source.data.me &&
    typeof source.data.me === "object" &&
    "workspaces" in source.data.me &&
    source.data.me.workspaces
  ) {
    if (source.data.me.workspaces instanceof Array) {
      return source.data.me.workspaces.reduce<Array<TWorkspace>>(
        (accumulator, workspace) => {
          if (
            workspace &&
            "id" in workspace &&
            workspace.id &&
            typeof workspace.id === "string" &&
            "name" in workspace &&
            workspace.name &&
            typeof workspace.name === "string"
          ) {
            accumulator.push({
              id: workspace.id,
              name: workspace.name,
            });
            return accumulator;
          }
          return accumulator;
        },
        [],
      );
    }
    return [];
  }
  return [];
}

function parseProjects(source: unknown): Array<TProject> {
  if (
    source &&
    typeof source === "object" &&
    "data" in source &&
    source.data &&
    typeof source.data === "object" &&
    "projects" in source.data &&
    source.data.projects &&
    typeof source.data.projects === "object" &&
    "edges" in source.data.projects &&
    source.data.projects.edges &&
    source.data.projects.edges instanceof Array
  ) {
    return source.data.projects.edges.reduce((accumulator, edge) => {
      if (
        edge &&
        "node" in edge &&
        edge.node &&
        typeof edge.node === "object" &&
        "id" in edge.node &&
        edge.node.id &&
        typeof edge.node.id === "string" &&
        "name" in edge.node &&
        edge.node.name &&
        typeof edge.node.name === "string"
      ) {
        accumulator.push({
          id: edge.node.id,
          name: edge.node.name,
        });
        return accumulator;
      }
      return accumulator;
    }, []);
  }
  return [];
}

function parseCreateProject(source: unknown): TProject {
  if (
    source &&
    typeof source === "object" &&
    "data" in source &&
    source.data &&
    typeof source.data === "object" &&
    "projectCreate" in source.data &&
    source.data.projectCreate &&
    typeof source.data.projectCreate === "object" &&
    "id" in source.data.projectCreate &&
    source.data.projectCreate.id &&
    typeof source.data.projectCreate.id === "string" &&
    "name" in source.data.projectCreate &&
    source.data.projectCreate.name &&
    typeof source.data.projectCreate.name === "string"
  ) {
    return {
      id: source.data.projectCreate.id,
      name: source.data.projectCreate.name,
    };
  }
  throw new Error("parse error");
}

function parseCreateDroplet(source: unknown): TDroplet {
  if (
    source &&
    typeof source === "object" &&
    "data" in source &&
    source.data &&
    typeof source.data === "object" &&
    "serviceCreate" in source.data &&
    source.data.serviceCreate &&
    typeof source.data.serviceCreate === "object" &&
    "id" in source.data.serviceCreate &&
    source.data.serviceCreate.id &&
    typeof source.data.serviceCreate.id === "string" &&
    "name" in source.data.serviceCreate &&
    source.data.serviceCreate.name &&
    typeof source.data.serviceCreate.name === "string"
  ) {
    return {
      id: source.data.serviceCreate.id,
      name: source.data.serviceCreate.name,
    };
  }
  throw new Error("parse error");
}

function parseDroplets(source: unknown): Array<TDroplet> {
  if (
    source &&
    typeof source === "object" &&
    "data" in source &&
    source.data &&
    typeof source.data === "object" &&
    "project" in source.data &&
    source.data.project &&
    typeof source.data.project === "object" &&
    "services" in source.data.project &&
    source.data.project.services &&
    typeof source.data.project.services === "object" &&
    "edges" in source.data.project.services &&
    source.data.project.services.edges &&
    source.data.project.services.edges instanceof Array
  ) {
    return source.data.project.services.edges.reduce((accumulator, edge) => {
      if (
        edge &&
        "node" in edge &&
        edge.node &&
        typeof edge.node === "object" &&
        "id" in edge.node &&
        edge.node.id &&
        typeof edge.node.id === "string" &&
        "name" in edge.node &&
        edge.node.name &&
        typeof edge.node.name === "string"
      ) {
        accumulator.push({
          id: edge.node.id,
          name: edge.node.name,
        });
        return accumulator;
      }
      return accumulator;
    }, []);
  }
  return [];
}

function parseEnvironments(source: unknown): Array<TEnvironment> {
  if (
    source &&
    typeof source === "object" &&
    "data" in source &&
    source.data &&
    typeof source.data === "object" &&
    "environments" in source.data &&
    source.data.environments &&
    typeof source.data.environments === "object" &&
    "edges" in source.data.environments &&
    source.data.environments.edges &&
    source.data.environments.edges instanceof Array
  ) {
    return source.data.environments.edges.reduce((accumulator, edge) => {
      if (
        edge &&
        "node" in edge &&
        edge.node &&
        typeof edge.node === "object" &&
        "id" in edge.node &&
        edge.node.id &&
        typeof edge.node.id === "string" &&
        "name" in edge.node &&
        edge.node.name &&
        typeof edge.node.name === "string"
      ) {
        accumulator.push({
          id: edge.node.id,
          name: edge.node.name,
        });
        return accumulator;
      }
      return accumulator;
    }, []);
  }
  return [];
}

function parseRedeploy(source: unknown): boolean {
  if (
    source &&
    typeof source === "object" &&
    "data" in source &&
    source.data &&
    typeof source.data === "object" &&
    "serviceInstanceRedeploy" in source.data &&
    typeof source.data.serviceInstanceRedeploy === "boolean"
  ) {
    return source.data.serviceInstanceRedeploy;
  }
  return false;
}

function parseVariables(source: unknown): boolean {
  if (
    source &&
    typeof source === "object" &&
    "data" in source &&
    source.data &&
    typeof source.data === "object" &&
    "variableCollectionUpsert" in source.data &&
    typeof source.data.variableCollectionUpsert === "boolean"
  ) {
    return source.data.variableCollectionUpsert;
  }
  return false;
}

async function getWorkspaceByAccount(
  inputs: TProvisionByDockerInput,
): Promise<Pick<TWorkspace, "id">> {
  const response = await fetch("https://backboard.railway.com/graphql/v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${inputs.RAILWAY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `query {me{workspaces{id name}}}`,
    }),
  });

  if (response.ok) {
    const workspaces = parseWorkspaces(await response.json());
    const workspace = workspaces.find(({ name }) =>
      name === inputs.RAILWAY_WORKSPACE_NAME
    );
    if (workspace) {
      inputs.RAILWAY_WORKSPACE_ID = workspace.id;
      return {
        id: workspace.id,
      };
    }
    throw new Error("workspace not found");
  }

  throw new Error("internal resource error");
}

async function getProjectByWorkspace(
  inputs: TProvisionByDockerInput,
): Promise<Pick<TProject, "id">> {
  const response = await fetch("https://backboard.railway.com/graphql/v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${inputs.RAILWAY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query:
        "query workspaceProjects($workspaceId: String!){projects(workspaceId: $workspaceId){edges{node{id name description}}}}",
      variables: { workspaceId: inputs.RAILWAY_WORKSPACE_ID },
    }),
  });

  if (response.ok) {
    const projects = parseProjects(await response.json());
    const project = projects.find(({ name }) =>
      name === inputs.RAILWAY_PROJECT_NAME
    );
    if (project) {
      inputs.RAILWAY_PROJECT_ID = project.id;
      return {
        id: project.id,
      };
    }
    throw new Error("project not found");
  }

  throw new Error("internal resource error");
}

async function createProjectByWorkspace(
  inputs: TProvisionByDockerInput,
): Promise<TProject> {
  const response = await fetch("https://backboard.railway.com/graphql/v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${inputs.RAILWAY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query:
        "mutation projectCreate($input: ProjectCreateInput!) {projectCreate(input: $input) { id name }}",
      variables: {
        input: {
          name: inputs.RAILWAY_PROJECT_NAME,
          workspaceId: inputs.RAILWAY_WORKSPACE_ID,
        },
      },
    }),
  });

  if (response.ok) {
    const project = parseCreateProject(await response.json());
    inputs.RAILWAY_PROJECT_ID = project.id;
    return project;
  }

  throw new Error("internal resource error");
}

async function createDropletByProject(
  inputs: TProvisionByDockerInput,
): Promise<TDroplet> {
  const response = await fetch("https://backboard.railway.com/graphql/v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${inputs.RAILWAY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query:
        "mutation serviceCreate($input:ServiceCreateInput!){serviceCreate(input:$input) {id name}}",
      variables: {
        input: {
          name: inputs.RAILWAY_DROPLET_NAME,
          projectId: inputs.RAILWAY_PROJECT_ID,
          source: {
            image: inputs.RAILWAY_DOCKER_IMAGE_NAME,
          },
          variables: inputs.RAILWAY_VARIABLE,
        },
      },
    }),
  });

  if (response.ok) {
    const droplet = parseCreateDroplet(await response.json());
    inputs.RAILWAY_SERVICE_ID = droplet.id;
    return droplet;
  }

  throw new Error("internal resource error");
}

async function getDropletByProject(
  inputs: TProvisionByDockerInput,
): Promise<Pick<TDroplet, "id">> {
  const response = await fetch("https://backboard.railway.com/graphql/v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${inputs.RAILWAY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query:
        "query GetServices($projectId: String!){project(id: $projectId){services{edges{node{id name}}}}}",
      variables: {
        projectId: inputs.RAILWAY_PROJECT_ID,
      },
    }),
  });

  if (response.ok) {
    const droplets = parseDroplets(await response.json());
    const droplet = droplets.find((droplet) =>
      droplet.name === inputs.RAILWAY_DROPLET_NAME
    );
    if (droplet) {
      inputs.RAILWAY_SERVICE_ID = droplet.id;
      return {
        id: droplet.id,
      };
    }
    throw new Error("droplet not found");
  }

  throw new Error("internal resource error");
}

async function getEnvironmentsByProject(
  inputs: TProvisionByDockerInput,
): Promise<Pick<TEnvironment, "id">> {
  const response = await fetch("https://backboard.railway.com/graphql/v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${inputs.RAILWAY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query:
        "query environments($projectId: String!) { environments(projectId: $projectId) { edges { node { id name createdAt }}}}",
      variables: {
        projectId: inputs.RAILWAY_PROJECT_ID,
      },
    }),
  });

  if (response.ok) {
    const environments = parseEnvironments(await response.json());
    const environment = environments.find((environment) =>
      environment.name === inputs.RAILWAY_ENVIRONMENT_NAME
    );
    if (environment) {
      inputs.RAILWAY_ENVIRONMENT_ID = environment.id;
      return {
        id: environment.id,
      };
    }
    throw new Error("environment not found");
  }

  throw new Error("internal resource error");
}

async function updateDropletByEnvironment(
  inputs: TProvisionByDockerInput,
): Promise<boolean> {
  const response = await fetch("https://backboard.railway.com/graphql/v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${inputs.RAILWAY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query:
        "mutation serviceInstanceRedeploy($serviceId: String!, $environmentId: String!){serviceInstanceRedeploy(serviceId: $serviceId, environmentId: $environmentId)}",
      variables: {
        serviceId: inputs.RAILWAY_SERVICE_ID,
        environmentId: inputs.RAILWAY_ENVIRONMENT_ID,
      },
    }),
  });

  if (response.ok) {
    return parseRedeploy(await response.json());
  }

  throw new Error("internal resource error");
}

async function upsertVariables(
  inputs: TProvisionByDockerInput,
): Promise<boolean> {
  const response = await fetch("https://backboard.railway.com/graphql/v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${inputs.RAILWAY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query:
        "mutation variableCollectionUpsert($input: VariableCollectionUpsertInput!){variableCollectionUpsert(input: $input)}",
      variables: {
        input: {
          projectId: inputs.RAILWAY_PROJECT_ID,
          environmentId: inputs.RAILWAY_ENVIRONMENT_ID,
          serviceId: inputs.RAILWAY_SERVICE_ID,
          variables: inputs.RAILWAY_VARIABLE,
          replace: true,
        },
      },
    }),
  });

  if (response.ok) {
    return parseVariables(await response.json());
  }

  throw new Error("internal resource variable error");
}

async function deleteDroplet(
  inputs: Pick<TProvisionByDockerInput, "RAILWAY_TOKEN" | "RAILWAY_SERVICE_ID">,
): Promise<boolean> {
  const response = await fetch("https://backboard.railway.com/graphql/v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${inputs.RAILWAY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: "mutation serviceDelete($id: String!) {serviceDelete(id: $id)}",
      variables: {
        id: inputs.RAILWAY_SERVICE_ID,
      },
    }),
  });

  if (response.ok) {
    return true;
  }

  throw new Error("internal resource error");
}

async function deleteProject(
  inputs: Pick<TProvisionByDockerInput, "RAILWAY_TOKEN" | "RAILWAY_PROJECT_ID">,
): Promise<boolean> {
  const response = await fetch("https://backboard.railway.com/graphql/v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${inputs.RAILWAY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: "mutation projectDelete($id: String!) {projectDelete(id: $id)}",
      variables: {
        id: inputs.RAILWAY_PROJECT_ID,
      },
    }),
  });

  if (response.ok) {
    return true;
  }

  throw new Error("internal resource error");
}

class ProvisionByDocker implements
  dynamic.ResourceProvider<
    TProvisionByDockerInput,
    TProvisionByDockerOutput
  > {
  public async create(
    input: TProvisionByDockerInput,
  ): Promise<dynamic.CreateResult<TProvisionByDockerOutput>> {
    const workspace: Pick<TWorkspace, "id"> = await getWorkspaceByAccount(
      input,
    );
    const project: TProject = await createProjectByWorkspace(input);
    const droplet: TDroplet = await createDropletByProject(input);
    const environment: Pick<TEnvironment, "id"> =
      await getEnvironmentsByProject(input);

    return {
      id: droplet.id,
      outs: {
        workspace: {
          id: workspace.id,
        },
        project: {
          id: project.id,
        },
        droplet: {
          id: droplet.id,
        },
        environment: {
          id: environment.id,
        },
        variable: true,
        RAILWAY_TOKEN: input.RAILWAY_TOKEN,
      },
    };
  }

  public async diff(
    _id: string,
    _output: TProvisionByDockerOutput,
    _input: TProvisionByDockerInput,
  ): Promise<dynamic.DiffResult> {
    return { changes: true };
  }

  public async update(
    _id: string,
    _output: TProvisionByDockerOutput,
    input: TProvisionByDockerInput,
  ): Promise<dynamic.UpdateResult<TProvisionByDockerOutput>> {
    const workspace: Pick<TWorkspace, "id"> = await getWorkspaceByAccount(
      input,
    );
    const project: Pick<TProject, "id"> = await getProjectByWorkspace(input);
    const droplet: Pick<TDroplet, "id"> = await getDropletByProject(input);
    const environment: Pick<TEnvironment, "id"> =
      await getEnvironmentsByProject(input);
    const update = await upsertVariables(input);
    await updateDropletByEnvironment(input);
    return {
      outs: {
        workspace: {
          id: workspace.id,
        },
        project: {
          id: project.id,
        },
        droplet: {
          id: droplet.id,
        },
        environment: {
          id: environment.id,
        },
        variable: update,
        RAILWAY_TOKEN: input.RAILWAY_TOKEN,
      },
    };
  }

  public async delete(
    _id: string,
    output: TProvisionByDockerOutput,
  ): Promise<void> {
    await deleteDroplet({
      RAILWAY_TOKEN: output.RAILWAY_TOKEN,
      RAILWAY_SERVICE_ID: output.droplet.id,
    });
    await deleteProject({
      RAILWAY_TOKEN: output.RAILWAY_TOKEN,
      RAILWAY_PROJECT_ID: output.project.id,
    });
  }
}

type TRailwayArgs<T> = {
  [K in keyof T]: T[K] extends string ? Input<string>
    : Record<string, Input<string>>;
};

class Railway extends dynamic.Resource {
  constructor(
    name: string,
    args: TRailwayArgs<
      Omit<
        TProvisionByDockerInput,
        | "RAILWAY_WORKSPACE_ID"
        | "RAILWAY_PROJECT_ID"
        | "RAILWAY_SERVICE_ID"
        | "RAILWAY_ENVIRONMENT_ID"
      >
    >,
    opts?: CustomResourceOptions,
  ) {
    super(
      new ProvisionByDocker(),
      name,
      {
        RAILWAY_TOKEN: args.RAILWAY_TOKEN,
        RAILWAY_VARIABLE: args.RAILWAY_VARIABLE,
        RAILWAY_PROJECT_NAME: args.RAILWAY_PROJECT_NAME,
        RAILWAY_DROPLET_NAME: args.RAILWAY_DROPLET_NAME,
        RAILWAY_WORKSPACE_NAME: args.RAILWAY_WORKSPACE_NAME,
        RAILWAY_ENVIRONMENT_NAME: args.RAILWAY_ENVIRONMENT_NAME,
        RAILWAY_DOCKER_IMAGE_NAME: args.RAILWAY_DOCKER_IMAGE_NAME,
        RAILWAY_PROJECT_ID: "",
        RAILWAY_SERVICE_ID: "",
        RAILWAY_WORKSPACE_ID: "",
        RAILWAY_ENVIRONMENT_ID: "",
      },
      opts,
    );
  }
}

export { Railway, type TProvisionByDockerInput };
