import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as pc from 'playcanvas';

function PlayCanvasCube() {
  const { gl } = useThree();
  const appRef = useRef<pc.Application>();
  const boxRef = useRef<pc.Entity>();

  useEffect(() => {
    const canvas = gl.domElement as HTMLCanvasElement;
    const context = gl.getContext();
    const app = new pc.Application(canvas, {
      graphicsDeviceOptions: { gl: context },
    });
    app.autoRender = false;
    app.setCanvasFillMode(pc.FILLMODE_NONE);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    app.start();

    const camera = new pc.Entity('pc-camera');
    camera.addComponent('camera', {
      clearColorBuffer: false,
      clearDepthBuffer: false,
    });
    camera.setLocalPosition(0, 0, 10);
    camera.lookAt(pc.Vec3.ZERO);
    app.root.addChild(camera);

    const box = new pc.Entity('pc-box');
    box.addComponent('render', { type: 'box' });
    app.root.addChild(box);
    appRef.current = app;
    boxRef.current = box;

    return () => app.destroy();
  }, [gl]);

  useFrame((state, delta) => {
    const app = appRef.current;
    const box = boxRef.current;
    if (app && box) {
      box.rotate(30 * delta, 60 * delta, 0);
      // Reset Three.js state before and after PlayCanvas renders so both
      // engines do not interfere with each other's WebGL state tracking.
      state.gl.resetState();
      app.render();
      state.gl.resetState();
    }
  });

  return null;
}

export default function R3FPlayCanvasDemo() {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [0, 0, 10] }}
    >
      <ambientLight />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial />
      </mesh>
      <PlayCanvasCube />
    </Canvas>
  );
}
