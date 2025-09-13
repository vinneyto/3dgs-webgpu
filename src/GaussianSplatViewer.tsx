import React, { useEffect, useRef } from 'react';
import * as pc from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

interface Props {
  url?: string;
}

const GaussianSplatViewer: React.FC<Props> = ({ url = '/point_cloud_mobile (2).ksplat' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const app = new pc.Application(canvas, {
      graphicsDeviceOptions: { antialias: false }
    });

    // register GSplat support
    app.loader.addHandler('gsplat', new pc.GSplatHandler(app));
    app.systems.add(new pc.GSplatComponentSystem(app));

    app.start();
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);

    const resize = () => app.resizeCanvas();
    window.addEventListener('resize', resize);

    // camera with orbit controls
    const camera = new pc.Entity('Camera');
    camera.addComponent('camera', { clearColor: new pc.Color(0, 0, 0, 1) });
    camera.setLocalPosition(0, 0, 2.5);
    camera.lookAt(pc.Vec3.ZERO);
    app.root.addChild(camera);

    app.scripts.add(CameraControls);
    camera.addComponent('script');
    camera.script!.create('cameraControls');

    // load Gaussian splat
    const asset = new pc.Asset('splat', 'gsplat', { url });
    app.assets.add(asset);
    asset.ready(() => {
      const splat = new pc.Entity('Splat');
      splat.addComponent('gsplat', { asset });
      app.root.addChild(splat);
    });
    app.assets.load(asset);

    return () => {
      window.removeEventListener('resize', resize);
      app.destroy();
    };
  }, [url]);

  return <canvas ref={canvasRef} />;
};

export default GaussianSplatViewer;
