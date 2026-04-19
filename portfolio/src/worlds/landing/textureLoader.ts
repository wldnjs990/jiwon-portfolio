import { LoadingManager } from "three";

// DefaultLoadingManager와 격리 — useProgress(drei)에 영향 없음
// TextureLoader 사용 시 반드시 이 매니저를 주입할 것
export const isolatedManager = new LoadingManager();
