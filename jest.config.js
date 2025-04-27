// at project root, next to package.json
module.exports = {
    // 1) where to look for your tests
    testMatch: ['/_tests_//*.test.[jt]s?(x)'],

    // 2) how to transform your files
    transform: {
        '^.+\\.[tj]sx?$': 'babel-jest'
    },

    // 3) which setup file(s) to run before tests
    setupFiles: ['<rootDir>/jest.setup.js'],

    // 4) run in node (no DOM)
    testEnvironment: 'node'
};