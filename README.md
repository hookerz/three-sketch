# three-sketch

## Events and Overwriting Event Handlers

The sketch emits `update`, `resize`, and `mousemove` events at the times you
would expect. Most of the time, the default render/resize/mousemove event
handlers will do everything you need. If you need to do something in addition,
you can use the events to create side effects. If you need to do something
completely different, you can overwrite some of the key handlers:

```javascript

sketch.on('update', delta => {
  
  camera.rotation.y = sketch.time * 0.0001 % 360;
  
});

sketch.render = function (delta) {
  
  // The default render loop doesn't render to a texture. But now it will!
  sketch.renderer.render(sketch.scene, sketch.camera, someRenderTarget);
  
}
```

## Example

```javascript
import { Sketch } from '../src';
import { BoxBufferGeometry, MeshBasicMaterial, Mesh } from 'three';

window.onload = function () {

  const sketch = Sketch();
  
  document.body.appendChild(sketch.canvas);

  const geo = new BoxBufferGeometry(1, 1, 1);
  const mat = new MeshBasicMaterial({ color: 0xff0000 });
  const box = new Mesh(geo, mat);

  sketch.scene.add(box);

  sketch.camera.fov = 60;
  sketch.camera.position.z = 5;
  sketch.camera.updateProjectionMatrix();
  
  sketch.on('update', delta => {
    
    box.rotation.x = sketch.time * 0.0001 % 360;
    box.rotation.y = sketch.time * 0.0002 % 360;
    
  });
  
  sketch.on('resize', size => {
    
    // three-sketch takes care of everything
    
  });

  sketch.on('mousemove', mouse => {
    
    // mouse coorodinates are in range [-1, 1]
    sketch.camera.position.x = mouse.x;
    sketch.camera.position.y = mouse.y;
    sketch.camera.lookAt(box.position);
    
  });
  
  sketch.start();

};
```
