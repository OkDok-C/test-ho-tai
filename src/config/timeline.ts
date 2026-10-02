// ─────────────────────────────────────────────────────────────
// 時間軸：60 秒 × 60 FPS = 3600 frames，3840×2160（DCI-ish UHD 4K）
// ─────────────────────────────────────────────────────────────
export const FPS = 60;
export const WIDTH = 3840;
export const HEIGHT = 2160;
export const DURATION_IN_FRAMES = 60 * FPS;

/** 秒 → frame */
export const sec = (s: number) => Math.round(s * FPS);

/** 場景交叉溶接長度（下一場景淡入時，上一場景延長墊底） */
export const XFADE = sec(0.3);

export type SceneKey = 's1' | 's2' | 's3' | 's4' | 's5';

export const SCENES: Record<SceneKey, {from: number; duration: number; title: string}> = {
	s1: {from: sec(0), duration: sec(10), title: '破題與校園快閃'},
	s2: {from: sec(10), duration: sec(15), title: 'HEART 五大屬性融入日常'},
	s3: {from: sec(25), duration: sec(10), title: '社群裂變與虛實互動'},
	s4: {from: sec(35), duration: sec(15), title: '全區共鬥與永續森林'},
	s5: {from: sec(50), duration: sec(10), title: '品牌價值定格'},
};
