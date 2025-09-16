// CommonJS entry point
import('./main.mjs').catch(err => {
  console.error('Failed to load main.mjs:', err);
  process.exit(1);
}); 