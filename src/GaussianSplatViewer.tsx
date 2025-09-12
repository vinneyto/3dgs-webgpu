import React, { useRef, useEffect } from 'react';
import * as pc from 'playcanvas';

interface Props {
  url?: string;
}

const GaussianSplatViewer: React.FC<Props> = ({ url = '/point_cloud_mobile (2).ksplat' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const app = new pc.Application(canvas, {
      mouse: new pc.Mouse(canvas),
      touch: new pc.TouchDevice(canvas)
    });

    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    const resize = () => app.resizeCanvas(canvas.width, canvas.height);
    window.addEventListener('resize', resize);
    app.start();

    // camera with simple orbit controls
    const OrbitCamera = pc.createScript('orbitCamera') as any;
    OrbitCamera.prototype.initialize = function () {
      this.yaw = 0;
      this.pitch = 0;
      this.distance = 3;
      this.target = new pc.Vec3(0, 0, 0);
      this.app.mouse.on('mousemove', this.onMouseMove, this);
    };
    OrbitCamera.prototype.onMouseMove = function (e: any) {
      if (e.buttons[pc.MOUSEBUTTON_LEFT]) {
        this.yaw -= e.dx * 0.2;
        this.pitch -= e.dy * 0.2;
        this.pitch = pc.math.clamp(this.pitch, -89, 89);
      }
    };
    OrbitCamera.prototype.update = function () {
      const yawRad = this.yaw * pc.math.DEG_TO_RAD;
      const pitchRad = this.pitch * pc.math.DEG_TO_RAD;
      const x = this.target.x + this.distance * Math.sin(yawRad) * Math.cos(pitchRad);
      const y = this.target.y + this.distance * Math.sin(pitchRad);
      const z = this.target.z + this.distance * Math.cos(yawRad) * Math.cos(pitchRad);
      this.entity.setPosition(x, y, z);
      this.entity.lookAt(this.target);
    };

    const camera = new pc.Entity('camera');
    camera.addComponent('camera', { clearColor: new pc.Color(0.05, 0.05, 0.05) });
    camera.addComponent('script');
    camera.script!.create('orbitCamera');
    app.root.addChild(camera);

    fetch(url)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const view = new DataView(buffer);
        const count = view.getUint32(0, true);
        const floats = new Float32Array(buffer, 4);
        const vertexData = new Float32Array(count * 6);
        for (let i = 0; i < count; i++) {
          vertexData.set(floats.subarray(i * 6, i * 6 + 6), i * 6);
        }

        const vertexFormat = new pc.VertexFormat(app.graphicsDevice, [
          { semantic: pc.SEMANTIC_POSITION, components: 3, type: pc.TYPE_FLOAT32 },
          { semantic: pc.SEMANTIC_COLOR, components: 3, type: pc.TYPE_FLOAT32 }
        ]);
        const vertexBuffer = new pc.VertexBuffer(app.graphicsDevice, vertexFormat, count, { data: vertexData });

        const mesh = new pc.Mesh(app.graphicsDevice);
        mesh.vertexBuffer = vertexBuffer;
        mesh.primitive[0].type = pc.PRIMITIVE_POINTS;
        mesh.primitive[0].base = 0;
        mesh.primitive[0].count = count;
        mesh.primitive[0].indexed = false;

        const shaderDefinition = {
          attributes: {
            aPosition: pc.SEMANTIC_POSITION,
            aColor: pc.SEMANTIC_COLOR
          },
          vshader: `
            attribute vec3 aPosition;
            attribute vec3 aColor;
            varying vec3 vColor;
            uniform mat4 matrix_model;
            uniform mat4 matrix_viewProjection;
            void main(void){
              gl_Position = matrix_viewProjection * matrix_model * vec4(aPosition,1.0);
              vColor = aColor;
              gl_PointSize = 6.0;
            }
          `,
          fshader: `
            precision mediump float;
            varying vec3 vColor;
            void main(void){
              vec2 c = gl_PointCoord - vec2(0.5);
              float d = dot(c,c);
              float a = exp(-d*4.0);
              gl_FragColor = vec4(vColor, a);
            }
          `
        } as any;

        const shader = new pc.Shader(app.graphicsDevice, shaderDefinition);
        const material = new pc.Material();
        (material as any).shader = shader;
        material.blendType = pc.BLEND_NORMAL;

        const entity = new pc.Entity('splats');
        entity.addComponent('render', { mesh, material });
        app.root.addChild(entity);
      });

    return () => {
      window.removeEventListener('resize', resize);
      app.destroy();
    };
  }, [url]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
};

export default GaussianSplatViewer;
