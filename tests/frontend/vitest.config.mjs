import path from "node:path";

export default {
  root: path.resolve(import.meta.dirname, "../../front-end"),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "../../front-end/src"),
      "@testing-library/react": path.resolve(
        import.meta.dirname,
        "../../front-end/node_modules/@testing-library/react/dist/@testing-library/react.esm.js",
      ),
    },
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["../tests/frontend/**/*.test.{js,jsx,ts,tsx}"],
    setupFiles: [path.resolve(import.meta.dirname, "./setup.js")],
  },
};
