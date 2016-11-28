import commonjs from 'rollup-plugin-commonjs';
import noderesolve from 'rollup-plugin-node-resolve';

export default {

  dest: 'out/index.js',
  entry: 'src/index.js',
  format: 'iife',

  plugins: [

    noderesolve({ main: true, jsnext: true, browser: true }),
    commonjs(),

  ]

}
