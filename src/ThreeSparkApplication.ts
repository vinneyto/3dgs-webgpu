import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SplatMesh, SplatFileType } from "@sparkjsdev/spark";
import {
  WebGLRenderer,
  PerspectiveCamera,
  Vector3,
  MathUtils,
  Scene,
} from "three";

export class ThreeSparkApplication {
  private renderer: WebGLRenderer;
  private scene: Scene;
  private camera: PerspectiveCamera;
  private controls: OrbitControls;
  private canvas: HTMLCanvasElement;
  private raf: number | null = null;

  // те же настройки и URL, что в PlayCanvas
  //   private MODEL_URL = "https://developer.playcanvas.com/assets/toy-cat.sog";
  private MODEL_URL = "/unit3.zip"; // локальный прокси (vite dev server)
  private MODEL_POS = new Vector3(0, -0.7, 0);
  private MODEL_ROT_Z_DEG = 180;

  constructor() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: false, // как в PC-примере
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 1); // фон чёрный
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new Scene();

    this.camera = new PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    this.camera.position.set(0, 0, 2.5);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.copy(this.MODEL_POS);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    window.addEventListener("resize", this.onResize);
  }

  async init(modelUrl?: string): Promise<void> {
    if (modelUrl) this.MODEL_URL = modelUrl;

    const splat = await this.loadSplat(this.MODEL_URL);
    if (splat) {
      splat.position.copy(this.MODEL_POS);
      splat.rotation.z = MathUtils.degToRad(this.MODEL_ROT_Z_DEG);
      this.scene.add(splat);
    }

    this.loop();
  }

  private async fetchBytes(url: string): Promise<Uint8Array> {
    const res = await fetch(url, { mode: "cors" }); // если CORS открыт; иначе — свой прокси
    if (!res.ok) {
      throw new Error(
        `Failed to fetch ${url}: ${res.status} ${res.statusText}`
      );
    }
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  }

  private async loadSplat(url: string): Promise<SplatMesh | null> {
    // убираем query/fragment, чтоб корректно матчить расширение
    const path = url.split("?")[0].split("#")[0].toLowerCase();

    // PlayCanvas SOG/SOGS
    // ---- ваш кейс: только ZIP-ы (в т.ч. *.sog.zip / *.sogs.zip) ----
    if (
      path.endsWith(".zip") ||
      path.endsWith(".sog") ||
      path.endsWith(".sogs")
    ) {
      const fileBytes = await this.fetchBytes(url);
      return new SplatMesh({
        fileBytes,
        fileType: SplatFileType.PCSOGSZIP, // SOGS_ZIP сам определит внутри, SOGS не умеет
      });
    }
    // Остальные поддерживаемые Spark форматы
    if (path.endsWith(".ksplat")) {
      return new SplatMesh({ url, fileType: SplatFileType.KSPLAT });
    }
    if (path.endsWith(".splat")) {
      return new SplatMesh({ url, fileType: SplatFileType.SPLAT });
    }
    if (path.endsWith(".spz") || path.endsWith(".ply")) {
      // для .spz/.ply Spark сам автоопределит
      return new SplatMesh({ url });
    }

    console.warn(
      `[ThreeSparkApplication] Unknown/unsupported splat format: ${url}`
    );
    return null;
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private onResize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  };

  public dispose(): void {
    window.removeEventListener("resize", this.onResize);
    if (this.raf != null) cancelAnimationFrame(this.raf);
    this.controls.dispose();
    this.renderer.dispose();
    this.scene.traverse((obj) => {
      const anyObj = obj as any;
      anyObj.geometry?.dispose?.();
      if (Array.isArray(anyObj.material))
        anyObj.material.forEach((m: any) => m?.dispose?.());
      else anyObj.material?.dispose?.();
    });
    this.canvas.remove();
  }
}
