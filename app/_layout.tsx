import { Stack } from "expo-router";

// Polyfill fetch to prevent Supabase from trying to import @supabase/node-fetch
// This is a no-op in React Native where fetch already exists
if (typeof globalThis.fetch === 'undefined') {
  // @ts-ignore
  globalThis.fetch = fetch;
}

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
