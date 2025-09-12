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
    app.start();

    const box = new pc.Entity('pc-box');
    box.addComponent('render', { type: 'box' });
    app.root.addChild(box);
    appRef.current = app;
    boxRef.current = box;

    return () => app.destroy();
  }, [gl]);

  useFrame((_, delta) => {
    const app = appRef.current;
    const box = boxRef.current;
    if (app && box) {
      box.rotate(30 * delta, 60 * delta, 0);
      app.render();
    }
  });

  return null;
}

export default function R3FPlayCanvasDemo() {
  return (
    <Canvas>
      <ambientLight />
      <mesh position={[-2, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial />
      </mesh>
      <PlayCanvasCube />
    </Canvas>
  );
}
