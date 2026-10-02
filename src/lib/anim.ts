import {Easing, interpolate, spring, SpringConfig} from 'remotion';
import {FPS} from '../config/timeline';

/** Spring 參數庫 — 統一全片的「物理手感」 */
export const SPRINGS = {
	/** 3D 全息面板彈出：輕微過衝，帶科技感 */
	holo: {damping: 14, stiffness: 120, mass: 0.9} satisfies Partial<SpringConfig>,
	/** 徽章解鎖：明顯回彈 */
	badge: {damping: 9, stiffness: 180, mass: 0.6} satisfies Partial<SpringConfig>,
	/** 大標題：沉穩、無過衝的電影感 */
	title: {damping: 200, stiffness: 60, mass: 1.4} satisfies Partial<SpringConfig>,
	/** 扭蛋彈出 */
	pop: {damping: 11, stiffness: 220, mass: 0.7} satisfies Partial<SpringConfig>,
	/** 森林生長：緩起緩停 */
	grow: {damping: 26, stiffness: 40, mass: 1.6} satisfies Partial<SpringConfig>,
};

export const sp = (frame: number, delay: number, config: Partial<SpringConfig>, durationInFrames?: number) =>
	spring({frame: frame - delay, fps: FPS, config, durationInFrames});

/** 電影級 easing */
export const EASE = {
	cine: Easing.bezier(0.65, 0, 0.35, 1),
	out: Easing.bezier(0.16, 1, 0.3, 1),
	in: Easing.bezier(0.7, 0, 0.84, 0),
	whip: Easing.bezier(0.87, 0, 0.13, 1),
};

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 區段 0→1 進度 */
export const progress = (frame: number, start: number, end: number, ease = EASE.cine) =>
	interpolate(frame, [start, end], [0, 1], {...clamp, easing: ease});

/** 淡入 + 淡出包絡 */
export const envelope = (frame: number, inStart: number, inEnd: number, outStart: number, outEnd: number) =>
	interpolate(frame, [inStart, inEnd, outStart, outEnd], [0, 1, 1, 0], clamp);

/** 決定性雜訊（camera shake 用），避免 Math.random 破壞逐格算圖一致性 */
export const shake = (frame: number, amp: number, seed = 1) =>
	(Math.sin(frame * 1.7 + seed) * 0.6 + Math.sin(frame * 3.1 + seed * 2.3) * 0.4) * amp;
