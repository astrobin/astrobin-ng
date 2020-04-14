const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig.json");

module.exports = {
  verbose: true,
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setupJest.ts"],
  collectCoverageFrom: [
    "**/*.ts",
    "!main.ts",
    "!**/*.module.(t|j)s"
  ],
  coverageDirectory: "coverage",
  transformIgnorePatterns: ['^.+\\.js$'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" })
};
