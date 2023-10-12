// jest.config.js
// Sync object
module.exports = {
    preset: "jest-expo",
    transform: {
        "^.+\\.tsx?$": ["ts-jest", {
            tsconfig: {
                jsx: "react"
            }
        }]
    },
    testMatch: [
        "**/?(*.)+(spec|test).ts?(x)",
        "**/__test__/**"
    ],
    collectCoverageFrom: [
        "**/*.{ts,tsx}",
        "!**/coverage/**",
        "!**/node_modules/**",
        "!**/babel.config.js",
        "!**/jest.setup.js"
    ],
    moduleFileExtensions: [
        "js",
        "ts",
        "tsx"
    ],
    transformIgnorePatterns: [
        "node_modules/(?!(jest-)?react-native|@react-native|react=native|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|sentry-expo|native-base|crypto-es)"
    ],
    coverageReporters: [
        "json-summary",
        "text",
        "lcov"
    ],
    setupFiles: [
        "./jest.setup.js"
    ]
};