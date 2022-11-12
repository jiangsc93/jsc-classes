import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import autoExternal from 'rollup-plugin-auto-external';

export default {
    input: 'src/index.ts',
    output: [
        { dir: '.', format: 'cjs', entryFileNames: '[name].js', preserveModules: true, preserveModulesRoot: 'src' },
        { dir: '.', format: 'esm', entryFileNames: '[name].mjs', preserveModules: true, preserveModulesRoot: 'src' }
    ],
    plugins: [
        autoExternal(),
        commonjs(),
        json(),
        typescript({
            tsconfig: 'tsconfig.json',
            include: ['src/**/*.ts']
        })
    ]
};
