/**
 * `?raw`-Importe sind ein Vite-Feature und werden ausschließlich in den Vitest-Tests
 * genutzt (die weiterhin über Vite laufen — siehe vitest.config.ts). Next.js selbst
 * kennt sie nicht; ohne diese Deklaration meldet `tsc --noEmit` sie als fehlende Module.
 */
declare module "*?raw" {
  const content: string;
  export default content;
}
