// The Ricks Clips characters are drawn by the shared puppet engine (templates/bridge/puppet.ts), like every other
// character that uses it. This file only re-exports it so the Studio's per-project renderer route finds it.
export * from '/puppet.js';
