export const API_VERSION = {
  V1: '1',
  V2: '2',
} as const;

export type ApiVersion = keyof typeof API_VERSION;
