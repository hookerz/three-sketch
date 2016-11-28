import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import noderesolve from 'rollup-plugin-node-resolve';

export default {

  dest: 'out/three-sketch.js',
  entry: 'src/three-sketch.js',
  format: 'cjs',

  external: [ 'three' ],

  plugins: [

    buble(),
    commonjs(),
    noderesolve({ jsnext: true }),

  ]

}
