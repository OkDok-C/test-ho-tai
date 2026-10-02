import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {clamp, SPRINGS, sp} from '../lib/anim';
import {FONT_UI} from '../config/theme';

type Props = {
	x: number;
	y: number;
	width: number;
	height: number;
	/** 進場 frame（相對於所在 Sequence） */
	enterAt: number;
	exitAt?: number;
	accent: string;
	/** 3D 姿態：rotateY / rotateX（度） */
	rotY?: number;
	rotX?: number;
	children: React.ReactNode;
};

/**
 * 3D AR 懸浮全息投影面板
 * ─ perspective + rotateX/Y 營造懸浮在實景空間中的透視
 * ─ spring(holo) 由 0 展開（scaleY 先行 → 內容後行，模擬全息投影「掃描成形」）
 * ─ 玻璃擬態 backdrop-filter + 掃描線 + 邊緣輝光 + 浮動呼吸
 */
export const HoloPanel: React.FC<Props> = ({x, y, width, height, enterAt, exitAt, accent, rotY = -14, rotX = 6, children}) => {
	const frame = useCurrentFrame();
	const open = sp(frame, enterAt, SPRINGS.holo);
	const close = exitAt !== undefined ? sp(frame, exitAt, {damping: 200, stiffness: 160}) : 0;
	const vis = open * (1 - close);
	const scan = interpolate(frame - enterAt, [0, 24], [0, 1], clamp);
	const float = Math.sin((frame - enterAt) / 40) * 14;
	const flicker = frame - enterAt < 10 ? (Math.floor(frame / 2) % 2 ? 0.55 : 1) : 1;

	if (vis <= 0.001) return null;

	return (
		<div style={{position: 'absolute', left: x, top: y, width, height, perspective: 2400}}>
			<div
				style={{
					width: '100%',
					height: '100%',
					transformStyle: 'preserve-3d',
					transform: `translateY(${float}px) rotateY(${rotY * vis}deg) rotateX(${rotX}deg) scale(${0.6 + 0.4 * vis}, ${vis})`,
					opacity: vis * flicker,
					borderRadius: 48,
					position: 'relative',
					overflow: 'hidden',
					background: `linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03) 40%, ${accent}22), rgba(4,12,16,0.62)`,
					backdropFilter: 'blur(28px) saturate(1.4)',
					border: `3px solid ${accent}`,
					boxShadow: `0 0 40px ${accent}aa, 0 0 140px ${accent}55, inset 0 0 60px ${accent}33`,
					fontFamily: FONT_UI,
					color: '#fff',
				}}
			>
				{/* 掃描線 */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 8px)',
						mixBlendMode: 'screen',
					}}
				/>
				{/* 成形掃描光帶 */}
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: `${scan * 100}%`,
						height: 40,
						background: `linear-gradient(180deg, transparent, ${accent}, transparent)`,
						opacity: 1 - scan * 0.8,
						filter: 'blur(6px)',
					}}
				/>
				<div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 ${(1 - scan) * 100}% 0)`}}>{children}</div>
			</div>
			{/* 投影錐：從下方手機投射出的光錐 */}
			<div
				style={{
					position: 'absolute',
					left: width * 0.3,
					top: height,
					width: width * 0.4,
					height: 420,
					background: `linear-gradient(0deg, transparent, ${accent}55)`,
					clipPath: 'polygon(0 0, 100% 0, 60% 100%, 40% 100%)',
					opacity: vis * 0.7,
					filter: 'blur(8px)',
					mixBlendMode: 'screen',
				}}
			/>
		</div>
	);
};
