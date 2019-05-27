import sourcemaps from 'rollup-plugin-sourcemaps';

export default [{
    input: './dist/es2015/livingsdk.js',
    output: {
        file: './dist/cjs/livingsdk.js',
        format: 'cjs',
        name: 'livingsdk',
        sourcemap: true,
    },
    external: [
        'axios',
        '@livinglogic/ul4',
        '@livinglogic/livingapi',
        'https'
    ],
    plugins: [
        sourcemaps(),
    ]
},
{
    input: './dist/es2015/livingsdk.test.js',
    output: {
        file: './dist/cjs/livingsdk.test.js',
        format: 'cjs',
        name: 'livingsdk',
        sourcemap: true,
    },
    external: [
        'axios',
        '@livinglogic/ul4',
        '@livinglogic/livingapi',
        'https',
        'chai',
        'process'
    ],
    plugins: [
        sourcemaps(),
    ]
}]