const { pathsToModuleNameMapper } = require("ts-jest/dist/config");
const { compilerOptions } = require("./tsconfig.json");

const esModules = [
  "@angular",
  "@ngrx",
  "rxjs",
  "ngx-lightbox",
  "ngx-timeago"
];

module.exports = {
  verbose: true,
  maxWorkers: 1,
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setupJest.ts"],
  collectCoverageFrom: ["**/*.ts", "!main.ts", "!**/*.module.(t|j)s", "!**/*mock.ts", "!**/*routing.ts"],
  transform: {
    '^.+\\.(ts|js|mjs|html)$': ['jest-preset-angular', {
      tsconfig: "<rootDir>/src/tsconfig.spec.json",
      stringifyContentPathRegex: '\\.(html|svg)$',
    }],
  },
  transformIgnorePatterns: [`<rootDir>/node_modules/(?!.*\\.mjs$|${esModules.join("|")})`],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
  modulePathIgnorePatterns: ["<rootDir>/cypress"]
};
