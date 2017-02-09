import { insertCSS } from './insert-css';
import { EventDispatcher, WebGLRenderer, PerspectiveCamera, Scene, Clock, Vector2 } from 'three';

// When the module is loaded, make sure there is some CSS to allow a fullscreen
// borderless canvas without scrollbars.
insertCSS('html, body { margin: 0px; width: 100%; height: 100%; overflow: hidden; }');

const requestAnimationFrame = window.requestAnimationFrame ||
                              window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame;

if (requestAnimationFrame === undefined) {

  throw new Error('window.requestAnimationFrame is missing');

}

const cancelAnimationFrame = window.cancelAnimationFrame ||
                             window.mozCancelAnimationFrame ||
                             window.webkitCancelAnimationFrame;

if (cancelAnimationFrame === undefined) {

  throw new Error('window.cancelAnimationFrame is missing');

}

/**
 * Create a three.js sketch.
 */
export function Sketch() {

  const renderer = new WebGLRenderer({ antialias: true });
  const camera = new PerspectiveCamera(45, 1, 0.1, 1000);
  const scene = new Scene();
  const mouse = new Vector2(0, 0);
  const clock = new Clock(false);

  let rafID = null; // the return value of requestAnimationFrame

  const sketch = Object.create(EventDispatcher.prototype, {

    renderer: {
      value: renderer,
      writable: false,
    },

    canvas: {
      value: renderer.domElement,
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
      get: () => clock.getElapsedTime(),
      set: () => { throw new Error('The "time" property is readonly.') },
    }

  });

  // Make some event flyweights so we aren't allocating objects every frame.

  const updateEventFlyweight = { type: 'update' };
  const resizeEventFlyweight = { type: 'resize' };
  const mouseEventFlyweight  = { type: 'mousemove' };

  // Set the default camera as a property of the scene. The camera property on
  // the scene will be used to render the scene, so if the user wants to use a
  // different camera they can just replace this property.

  scene.camera = camera;

  /**
   * Start running the sketch.
   *
   * @param {Function} [raf] - A function to request the next animation frame.
   * `window.requestAnimationFrame` is used by default, but you might want to
   * use a different function (like when using WebVR).
   */
  sketch.start = function(raf = requestAnimationFrame) {

    if (rafID !== null) throw new Error("The sketch is already running.");

    clock.start();

    sketch.onResize();

    window.addEventListener('resize', sketch.onResize);
    window.addEventListener('mousemove', sketch.onMousemove);

    function loop() {

      const dt = updateEventFlyweight.dt = clock.getDelta();
      const time = updateEventFlyweight.time = clock.getElapsedTime();

      // update before rendering
      sketch.dispatchEvent(updateEventFlyweight);
      sketch.render(dt, time);

      rafID = raf(loop);

    }

    rafID = raf(loop);

    sketch.dispatchEvent({ type: 'start' });

  };

  /**
   * Stop running the sketch.
   */
  sketch.stop = function () {

    if (rafID === null) return;

    clock.stop();

    window.removeEventListener('resize', sketch.onResize);
    window.removeEventListener('mousemove', sketch.onMousemove);

    cancelAnimationFrame(rafID);

    rafID = null;

    sketch.dispatchEvent({ type: 'stop' });

  };

  /**
   * Called on each animation frame.
   *
   * @param {Number} dt - The fractional seconds since the last render.
   * @param {Number} time - The fractional seconds since the sketch started.
   */
  sketch.render = function (dt, time) {

    if (!scene.camera || !scene.camera.isCamera) {

      console.warn("A custom camera was assigned to `scene.camera` but it isn't a recognizable three.js camera object. Falling back to the default camera.");
      scene.camera = camera;

    }

    renderer.render(scene, scene.camera);

  };

  /**
   * Called when the window resizes.
   */
  sketch.onResize = function () {

    const width = window.innerWidth;
    const height = window.innerHeight;
    const pratio = window.devicePixelRatio || 1;

    renderer.setPixelRatio(pratio);
    renderer.setSize(width, height, true);

    if (scene.camera === camera) {

      // update the default camera if it hasn't been overwritten

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

    }

    resizeEventFlyweight.width = width;
    resizeEventFlyweight.height = height;

    sketch.dispatchEvent(resizeEventFlyweight);

  };

  /**
   * Called when the mouse moves.
   */
  sketch.onMousemove = function (event) {

    const width = window.innerWidth;
    const height = window.innerHeight;

    // normalize the mouse coordinate to [-1, 1]
    const normalizedX = 2 * (event.clientX / width) - 1;
    const normalizedY = 2 * (1 - event.clientY / height) - 1;

    mouse.set(normalizedX, normalizedY);

    mouseEventFlyweight.mouse = mouse;

    sketch.dispatchEvent(mouseEventFlyweight);

  };

  return sketch;

}
