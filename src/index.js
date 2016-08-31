import Emitter from 'component-emitter';
import { WebGLRenderer, PerspectiveCamera, Scene, Vector2 } from 'three';

import { insertCSS } from './insert-css';

// When the module is loaded, make sure there is some CSS to allow a fullscreen
// borderless canvas without scrollbars.
insertCSS('html, body { margin: 0px; width: 100%; height: 100%; overflow: hidden; }');

/**
 * Create a three.js sketch.
 */
export function Sketch() {

  // Initialize some three.js objects.
  const renderer = new WebGLRenderer({ antialias: true });
  const canvas   = renderer.domElement;
  const scene    = new Scene();
  const camera   = new PerspectiveCamera(45, 1, 0.1, 1000);
  const mouse    = new Vector2(0, 0);
  
  let time = 0;
  
  // Set the default camera as a property of the scene. The camera property on
  // the scene will be used to render the scene, so if the user wants to use a
  // different camera they can just replace this property.
  scene.camera = camera;

  const sketch = Object.create(Emitter.prototype, {

    renderer: {
      value: renderer,
      writable: false,
    },
    
    canvas: {
      value: canvas,
      writable: false,
    },

    width: {
      get: () => renderer.getSize().width,
      set: () => { throw new Error('The "width" property is readonly') },
    },

    height: {
      get: () => renderer.getSize().height,
      set: () => { throw new Error('The "height" property is readonly') },
    },

    scene: {
      value: scene,
      writable: false,
    },
    
    camera: {
      value: camera,
      writable: false,
    },

    mouse: {
      value: mouse,
      writable: false,
    },
    
    time: {
      get: () => time,
      set: () => { throw new Error('The "time" property is readonly.') },
    }

  });

  // A mutable boolean that we can use to break the render loop.
  let running = false;

  /**
   * Start running the sketch.
   */
  sketch.start = function() {

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMousemove);

    running = true;

    // Resize the renderer/camera before emitting the start event, so that any
    // initialization is done at the correct resolution.
    onResize();

    sketch.emit('start', sketch);

    // Start the render loop.
    render();

  };

  /**
   * Stop running the sketch.
   */
  sketch.stop = function () {

    running = false;

  };

  const render = function (currentTime) {

    if (!running) return;

    // Derive the time passed since the last frame.
    const previousTime = time;
    const deltaTime = previousTime - currentTime;

    // Update the world time.
    time = currentTime;

    // Update the scene.
    sketch.emit('update', deltaTime, sketch);

    if (!scene.camera || !scene.camera.isCamera) {
      
      console.warn("A custom camera was assigned to `scene.camera` but it isn't a recognizable three.js camera object. Falling back to the default camera.");
      renderer.render(scene, camera);
      
    } else {

      renderer.render(scene, scene.camera);

    }
    
    requestAnimationFrame(render);

  };

  const onResize = function () {
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    const density = window.devicePixelRatio || 1;

    renderer.setPixelRatio(density);
    renderer.setSize(width, height, true);

    // Update the default camera if it is still being used to render the scene.

    if (scene.camera === camera) {

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

    }

    sketch.emit('resize', { width, height }, sketch);

  };

  const onMousemove = function (event) {

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const density = window.devicePixelRatio || 1;

    // Normalize the mouse coordinate to [-1, 1].
    const normalizedX = 2 * (event.clientX / width) - 1;
    const normalizedY = 2 * (1 - event.clientY / height) - 1;

    mouse.set(normalizedX, normalizedY);

    sketch.emit('mousemove', mouse, sketch);

  };
  
  return sketch;
  
}
