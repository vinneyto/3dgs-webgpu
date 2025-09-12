import React from 'react';
import { Application, Entity } from '@playcanvas/react';
import { Camera, GSplat, Script } from '@playcanvas/react/components';
import { useSplat } from '@playcanvas/react/hooks';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

interface Props {
  url?: string;
}

function SplatEntity({ url }: { url: string }) {
  const { asset } = useSplat(url);
  if (!asset) return null;
  return (
    <Entity>
      <GSplat asset={asset} />
    </Entity>
  );
}

const GaussianSplatViewer: React.FC<Props> = ({ url = '/point_cloud_mobile (2).ksplat' }) => (
  <Application
    style={{ width: '100%', height: '100%' }}
    graphicsDeviceOptions={{ antialias: false }}
  >
    <Entity name="Camera" position={[0, 0, 2.5]}>
      <Camera />
      <Script script={CameraControls} />
    </Entity>
    <SplatEntity url={url} />
  </Application>
);

export default GaussianSplatViewer;
