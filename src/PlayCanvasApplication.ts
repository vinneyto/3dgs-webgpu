import {
  Application,
  Asset,
  AssetListLoader,
  Entity,
  FILLMODE_FILL_WINDOW,
  RESOLUTION_AUTO,
} from "playcanvas";
import { PCSCameraControl } from "./PCSCameraControl";

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
      new Asset("toy", "gsplat", {
        url: "/unit3.sog",
      }),
    ];

    const loader = new AssetListLoader(assets, this.app.assets);
    await new Promise((resolve) => loader.load(resolve));

    const camera = new Entity("Camera");
    camera.setPosition(0, 0, 2.5);
    camera.addComponent("camera");
    camera.addComponent("script");
    this.app.root.addChild(camera);

    const splat = new Entity("Toy Cat");
    splat.setPosition(0, -0.7, 0);
    splat.setEulerAngles(0, 0, 180);
    splat.addComponent("gsplat", { asset: assets[0] });
    this.app.root.addChild(splat);
  }
}
