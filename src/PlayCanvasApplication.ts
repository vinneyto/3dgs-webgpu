import {
  Application,
  Asset,
  AssetListLoader,
  Entity,
  FILLMODE_FILL_WINDOW,
  RESOLUTION_AUTO,
} from "playcanvas";

export class PlayCanvasApplication {
  private app: any;

  constructor() {
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);

    this.app = new Application(canvas, {
      graphicsDeviceOptions: {
        antialias: false,
      },
    });

    this.app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
    this.app.setCanvasResolution(RESOLUTION_AUTO);
    this.app.start();

    window.addEventListener("resize", () => this.app.resizeCanvas());
  }

  async init(): Promise<void> {
    const assets = [
      new Asset("camera-controls", "script", {
        url: "https://cdn.jsdelivr.net/npm/playcanvas/scripts/esm/camera-controls.mjs",
      }),
      new Asset("toy", "gsplat", {
        url: "https://developer.playcanvas.com/assets/toy-cat.sog",
      }),
    ];

    const loader = new AssetListLoader(assets, this.app.assets);
    await new Promise((resolve) => loader.load(resolve));

    const camera = new Entity("Camera");
    camera.setPosition(0, 0, 2.5);
    camera.addComponent("camera");
    camera.addComponent("script");
    // @ts-expect-error
    camera.script.create("cameraControls");
    this.app.root.addChild(camera);

    const splat = new Entity("Toy Cat");
    splat.setPosition(0, -0.7, 0);
    splat.setEulerAngles(0, 0, 180);
    splat.addComponent("gsplat", { asset: assets[1] });
    this.app.root.addChild(splat);
  }
}
