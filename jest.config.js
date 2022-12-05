const { pathsToModuleNameMapper } = require("ts-jest/dist/config");
const { compilerOptions } = require("./tsconfig.json");

const esModules = ["@angular", "@ngrx", "rxjs"];

module.exports = {
  verbose: true,
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setupJest.ts"],
  collectCoverageFrom: ["**/*.ts", "!main.ts", "!**/*.module.(t|j)s", "!**/*mock.ts", "!**/*routing.ts"],
  transform: {
    "^.+\\.(ts|js|mjs|html|svg)$": "jest-preset-angular",
  },
  transformIgnorePatterns: [`<rootDir>/node_modules/(?!.*\\.mjs$|${esModules.join("|")})`],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
  modulePathIgnorePatterns: ["<rootDir>/cypress"],
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/src/tsconfig.spec.json",
    },
  },
};
