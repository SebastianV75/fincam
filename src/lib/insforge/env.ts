const requiredPublicEnvVars = {
  NEXT_PUBLIC_INSFORGE_BASE_URL: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL,
  NEXT_PUBLIC_INSFORGE_ANON_KEY: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
};

export function getInsforgePublicEnv() {
  const missingKeys = Object.entries(requiredPublicEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing InsForge environment variables: ${missingKeys.join(", ")}`
    );
  }

  return {
    baseUrl: requiredPublicEnvVars.NEXT_PUBLIC_INSFORGE_BASE_URL!,
    anonKey: requiredPublicEnvVars.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
  };
}
