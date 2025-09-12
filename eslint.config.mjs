// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
    {
        ignores: ['eslint.config.mjs'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            ecmaVersion: 5,
            sourceType: 'module',
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // Set maximum line length to 120 characters for better readability (applies globally)
            // Rationale: 120 characters provides optimal balance between:
            // - Code readability and maintainability
            // - Modern screen real estate (most developers use wide monitors)
            // - Side-by-side code review and comparison workflows
            // - Avoiding excessive line wrapping that reduces code clarity
            'max-len': [
                'warn',
                {
                    code: 120, // 120 characters provides good balance between readability and screen space
                    ignoreUrls: true, // URLs can be long and breaking them makes them unreadable
                    ignoreStrings: true, // Long strings (SQL queries, JSON) should not be broken
                    ignoreTemplateLiterals: true, // Template literals often contain long content that shouldn't be split
                    ignoreComments: true, // Comments can be long explanations that shouldn't be broken
                    ignoreRegExpLiterals: true, // Regular expressions can be long and breaking them breaks functionality
                },
            ],
        },
    },
    // --------------------------------------------------------------------------------------
    // Production Code Configuration: Balanced TypeScript Rules
    // --------------------------------------------------------------------------------------
    // Production code requires a balance between type safety and practical development:
    // 1. Allow 'any' type when necessary (legacy code, third-party libraries, complex scenarios)
    // 2. Warn on floating promises (potential memory leaks, unhandled rejections)
    // 3. Warn on unsafe arguments (type mismatches that could cause runtime errors)
    //
    // These rules provide guidance without being overly restrictive for real-world development.
    {
        rules: {
            // Allow explicit 'any' type when necessary (legacy code, complex scenarios)
            '@typescript-eslint/no-explicit-any': 'off',
            // Warn on floating promises (potential memory leaks and unhandled rejections)
            '@typescript-eslint/no-floating-promises': 'warn',
            // Warn on unsafe arguments (type mismatches that could cause runtime errors)
            '@typescript-eslint/no-unsafe-argument': 'warn',
            // Warn on missing explicit function return types (improves code clarity and maintainability)
            '@typescript-eslint/explicit-function-return-type': 'warn',
            // Warn on missing explicit module boundary types (improves API clarity)
            '@typescript-eslint/explicit-module-boundary-types': 'warn',
        },
    },
    // --------------------------------------------------------------------------------------
    // Test Files Configuration: Relaxed TypeScript Rules for Testing
    // --------------------------------------------------------------------------------------
    // Test files often require more flexible type handling than production code:
    // 1. Mock objects and test data may not have complete type definitions
    // 2. Testing frameworks (Jest, Supertest) often use dynamic typing
    // 3. Test utilities and fixtures may bypass strict type checking
    // 4. Focus on test logic rather than type safety in test files
    //
    // This configuration applies to all test files (*.spec.ts, *.e2e-spec.ts, *.test.ts)
    // and disables strict TypeScript rules that would be overly restrictive in test context.
    {
        files: ['**/*.spec.ts', '**/*.e2e-spec.ts', '**/*.test.ts'],
        rules: {
            // Allow unsafe assignments (common with mock data and test fixtures)
            '@typescript-eslint/no-unsafe-assignment': 'off',
            // Allow unsafe member access (testing frameworks often use dynamic properties)
            '@typescript-eslint/no-unsafe-member-access': 'off',
            // Allow unsafe function calls (mocks and test utilities)
            '@typescript-eslint/no-unsafe-call': 'off',
            // Allow unsafe returns (test helpers may return any type)
            '@typescript-eslint/no-unsafe-return': 'off',
            // Allow unsafe arguments (test data may not match exact types)
            '@typescript-eslint/no-unsafe-argument': 'off',
            // Allow unbound methods (Jest mocks and test utilities)
            '@typescript-eslint/unbound-method': 'off',
            // Allow async functions without await (test setup/teardown)
            '@typescript-eslint/require-await': 'off',
            // Allow floating promises (test assertions and cleanup)
            '@typescript-eslint/no-floating-promises': 'off',
        },
    },
];
