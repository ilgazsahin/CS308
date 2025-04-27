// at project root, next to package.json
module.exports = {
    // 1) where to look for your tests
    testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],

    // 2) how to transform your files
    transform: {
        '^.+\\.[tj]sx?$': 'babel-jest'
    },

    // 3) which setup file(s) to run before tests
    setupFiles: ['<rootDir>/jest.setup.js'],

    // 4) run in node (no DOM)
<<<<<<< HEAD
    testEnvironment: 'node'
};
=======
    testEnvironment: 'node'
};
>>>>>>> 2e33bb2e9cd1b0023e99a8482cf83b13cdcebc28
