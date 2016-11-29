import Emitter from 'component-emitter';
import { insertCSS } from './insert-css';
import { WebGLRenderer, PerspectiveCamera, Scene, Vector2 } from 'three';

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
      set: () => { throw new Error('The "width" property is readonly.') },
    },

    height: {
      get: () => renderer.getSize().height,
      set: () => { throw new Error('The "height" property is readonly.') },
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
   *
   * @param {Function} [requestAnimationFrame] - A function to request the next
   *   animation frame. `window.requestAnimationFrame` is used by default, but
   *   you might want to use a different function (like when using WebVR).
   */
  sketch.start = function(requestAnimationFrame = window.requestAnimationFrame) {

    if (running) {

      throw new Error("The sketch is already running.");

    }

    running = true;

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMousemove);

    // Resize the renderer/camera before emitting the start event, so that any
    // initialization is done at the correct resolution.
    onResize();

    sketch.emit('start', sketch);

    const loop = function (currentTime) {

      if (!running) return;

      // Update the delta and current time.
      const deltaTime = time - currentTime;
      time = currentTime;

      // Emit an update event for any side effects, then render the scene.
      sketch.emit('update', deltaTime, sketch);
      sketch.render(deltaTime);

      requestAnimationFrame(loop);

    };

    // Start the render loop.
    requestAnimationFrame(loop);

  };

  /**
   * Stop running the sketch.
   */
  sketch.stop = function () {

    window.removeEventListener('resize', onResize);
    window.removeEventListener('mousemove', onMousemove);

    running = false;

  };

  sketch.render = function () {

    if (!scene.camera || !scene.camera.isCamera) {

      console.warn("A custom camera was assigned to `scene.camera` but it isn't a recognizable three.js camera object. Falling back to the default camera.");
      renderer.render(scene, camera);

    } else {

      renderer.render(scene, scene.camera);

    }

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
