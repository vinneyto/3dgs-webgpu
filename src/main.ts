import { PlayCanvasApplication } from "./PlayCanvasApplication";
// @ts-expect-error: imported for quick switching during development
import { ThreeSparkApplication } from "./ThreeSparkApplication";

const app = new PlayCanvasApplication();
// const app = new ThreeSparkApplication();
await app.init();
