import Mux from '@mux/mux-node';

export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
  jwtSigningKey: process.env.MUX_SIGNING_KEY_ID,
  jwtPrivateKey: process.env.MUX_SIGNING_KEY_PRIVATE?.replace(/\\n/g, '\n'), // Fix for .env newlines
});

export function isMuxSigningConfigured(): boolean {
  return !!(
    process.env.MUX_TOKEN_ID &&
    process.env.MUX_TOKEN_SECRET &&
    process.env.MUX_SIGNING_KEY_ID &&
    process.env.MUX_SIGNING_KEY_PRIVATE
  );
}
