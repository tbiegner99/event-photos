module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    plugins: ['@typescript-eslint'],
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        },
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
    },
    plugins: ['@typescript-eslint', 'react', 'jsx-a11y', 'prettier', 'promise'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'airbnb',
        'airbnb/hooks',
        'plugin:jsx-a11y/recommended',
        'plugin:import/typescript',
        'plugin:node/recommended',
        'prettier',
        'prettier/@typescript-eslint',
        'plugin:promise/recommended'
    ],
    env: {
        browser: true,
        node: true,
        jest: true,
        'jest/globals': true
    },
    settings: {
        react: {
            version: 'detect'
        },
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx']
            }
        }
    }
};
