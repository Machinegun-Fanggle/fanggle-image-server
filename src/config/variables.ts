export enum NodeEnvVariables {
  DEV = 'dev'
}

export const getNodeEnv = (): string | null => process.env.NODE_ENV;
