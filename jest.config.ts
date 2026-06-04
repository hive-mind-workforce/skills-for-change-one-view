import type { Config } from "jest"

const config: Config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^driver\\.js$": "<rootDir>/src/__mocks__/driver.mock.ts",
    "^driver\\.js/dist/driver\\.css$": "<rootDir>/src/__mocks__/empty.ts",
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/tests/e2e/"],
}

export default config
