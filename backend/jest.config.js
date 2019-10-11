const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
    verbose: true,
    preset: "ts-jest",
    moduleFileExtensions: [
        "js",
        "json",
        "ts"
    ],
    rootDir: ".",
    testRegex: ".spec.ts$",
    transform: {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    collectCoverageFrom: [
        "**/*.(t|j)s",
        "!main.ts",
        "!**/*.module.(t|j)s"
    ],
    coverageDirectory: "coverage",
    testEnvironment: "node",
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" })
};
