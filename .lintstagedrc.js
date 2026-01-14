module.exports = {
    '*.{js,jsx,ts,tsx}': ['eslint --fix'],
    '**/*.{ts,tsx}': () => 'npm run type-check',
};
