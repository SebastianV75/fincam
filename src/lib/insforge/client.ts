import { createClient } from "@insforge/sdk";

import { getInsforgePublicEnv } from "./env";

let insforgeClient: ReturnType<typeof createClient> | null = null;

export function getInsforgeClient() {
  if (insforgeClient) {
    return insforgeClient;
  }

  const { baseUrl, anonKey } = getInsforgePublicEnv();

  insforgeClient = createClient({
    baseUrl,
    anonKey,
  });

  return insforgeClient;
}
