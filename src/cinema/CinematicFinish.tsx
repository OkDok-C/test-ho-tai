import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp} from '../lib/anim';

/**
 * 電影感後製層（全片最上層）：
 * 1. 2.39:1 Letterbox（可動畫開合）
 * 2. Film grain（SVG feTurbulence，seed 逐格變化 → 真實顆粒閃動）
 * 3. Vignette 暗角
 * 4. Halation（高光暈染）以 screen 疊加暖色
 */
export const CinematicFinish: React.FC<{letterbox?: number}> = ({letterbox = 1}) => {
	const frame = useCurrentFrame();
	// 3840 / 2.39 ≈ 1607 → 上下各約 276px
	const bar = 276 * letterbox;
	const seed = frame % 24;

	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{/* Halation */}
			<AbsoluteFill
				style={{
					background: 'radial-gradient(ellipse at 50% 40%, rgba(255,170,90,0.10), transparent 60%)',
					mixBlendMode: 'screen',
				}}
			/>
			{/* Vignette */}
			<AbsoluteFill
				style={{
					background: 'radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.55) 100%)',
				}}
			/>
			{/* Film grain：以 1920×1080 產生後放大 2 倍，顆粒尺寸接近 35mm 掃描 */}
			<AbsoluteFill style={{opacity: 0.09, mixBlendMode: 'overlay'}}>
				<svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="none">
					<filter id={`grain-${seed}`}>
						<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
						<feColorMatrix type="saturate" values="0" />
					</filter>
					<rect width="1920" height="1080" filter={`url(#grain-${seed})`} />
				</svg>
			</AbsoluteFill>
			{/* Letterbox */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bar, background: '#000'}} />
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bar, background: '#000'}} />
		</AbsoluteFill>
	);
};

/** 場景淡入（交叉溶接用） */
export const SceneFade: React.FC<{children: React.ReactNode; fadeIn?: number; fadeOutAt?: number; fadeOut?: number}> = ({
	children,
	fadeIn = 0,
	fadeOutAt,
	fadeOut = 0,
}) => {
	const frame = useCurrentFrame();
	const a = fadeIn > 0 ? interpolate(frame, [0, fadeIn], [0, 1], clamp) : 1;
	const b = fadeOutAt !== undefined && fadeOut > 0 ? interpolate(frame, [fadeOutAt, fadeOutAt + fadeOut], [1, 0], clamp) : 1;
	return <AbsoluteFill style={{opacity: a * b}}>{children}</AbsoluteFill>;
};

/** 變形鏡頭橫向光斑（Anamorphic flare） */
export const LensFlare: React.FC<{x: number; y: number; intensity?: number; color?: string}> = ({
	x,
	y,
	intensity = 1,
	color = '255,214,150',
}) => {
	const frame = useCurrentFrame();
	const flicker = 0.9 + Math.sin(frame * 0.35) * 0.05 + Math.sin(frame * 1.3) * 0.05;
	const k = intensity * flicker;
	return (
		<AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
			<div
				style={{
					position: 'absolute',
					left: x - 1900,
					top: y - 9,
					width: 3800,
					height: 18,
					borderRadius: 9,
					background: `linear-gradient(90deg, transparent, rgba(${color},${0.55 * k}) 45%, rgba(255,255,255,${0.9 * k}) 50%, rgba(${color},${0.55 * k}) 55%, transparent)`,
					filter: 'blur(6px)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: x - 260,
					top: y - 260,
					width: 520,
					height: 520,
					borderRadius: '50%',
					background: `radial-gradient(circle, rgba(255,255,255,${0.85 * k}), rgba(${color},${0.35 * k}) 30%, transparent 70%)`,
				}}
			/>
			{[0.35, 0.6, 1.25].map((t, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: x + (1920 - x) * t * 2 - 70 - i * 30,
						top: y + (1080 - y) * t * 2 - 70 - i * 30,
						width: 140 + i * 60,
						height: 140 + i * 60,
						borderRadius: '50%',
						border: `3px solid rgba(${color},${0.18 * k})`,
						background: `radial-gradient(circle, rgba(${color},${0.08 * k}), transparent 70%)`,
					}}
				/>
			))}
		</AbsoluteFill>
	);
};
