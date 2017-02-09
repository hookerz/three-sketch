# three-sketch

Set up a basic render loop for a fullscreen three.js sketch.

## Example

```javascript
import { Sketch } from '../../src/three-sketch';
import { BoxBufferGeometry, MeshBasicMaterial, Mesh } from 'three';

window.onload = function () {

  const sketch = Sketch();

  document.body.appendChild(sketch.canvas);

  sketch.camera.fov = 60;
  sketch.camera.position.z = 5;
  sketch.camera.updateProjectionMatrix();

  const geo = new BoxBufferGeometry(1, 1, 1);
  const mat = new MeshBasicMaterial({ color: 0xff0000 });
  const box = new Mesh(geo, mat);
  sketch.scene.add(box);

  sketch.addEventListener('update', (event) => {

    box.rotation.x = (event.time * 0.1) % 360;
    box.rotation.y = (event.time * 0.2) % 360;
    box.rotation.z = (event.time * 0.3) % 360;

  });

  sketch.addEventListener('resize', (event) => {

    const { width, height } = event;

    // three-sketch automatically adjusts the renderer size

    console.log('size', width, height);

  });

  sketch.addEventListener('mousemove', (event) => {

    const { mouse } = event;

    // mouse coordinates are in range [-1, 1] relative to the window

    sketch.camera.position.x = -mouse.x;
    sketch.camera.position.y = -mouse.y;
    sketch.camera.lookAt(box.position);

    console.log('mouse', mouse.x, mouse.y);

  });

  sketch.start();

};
```

## Events and Overwriting Event Handlers

The sketch emits `update`, `resize`, and `mousemove` events at the times you
would expect. Most of the time, the default render/resize/mousemove event
handlers will do everything you need. If you need to do something in addition,
you can use the events to create side effects. If you need to do something
completely different, you can overwrite some of the key handlers:

```javascript
sketch.render = function (dt, time) {
  
  sketch.renderer.render(sketch.scene, sketch.camera, someRenderTarget);
  
}
```
