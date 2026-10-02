import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {HEART, HEART_ORDER, HeartKey, FONT_MONO, FONT_UI} from '../config/theme';
import {clamp, EASE, SPRINGS, sp} from '../lib/anim';

/** HEART Energy 累積計數器（數字滾動 + 能量條 + 粒子吸入） */
export const EnergyCounter: React.FC<{x: number; y: number; keyframes: [number, number][]; accent: string}> = ({x, y, keyframes, accent}) => {
	const frame = useCurrentFrame();
	const value = Math.round(
		interpolate(
			frame,
			keyframes.map((k) => k[0]),
			keyframes.map((k) => k[1]),
			{...clamp, easing: EASE.out},
		),
	);
	const max = keyframes[keyframes.length - 1][1];
	// 數值剛跳動時的脈衝
	const pulse = keyframes.reduce((acc, [f]) => acc + Math.max(0, 1 - Math.abs(frame - f - 10) / 14), 0);
	return (
		<div style={{position: 'absolute', left: x, top: y, fontFamily: FONT_UI, color: '#fff', textShadow: '0 4px 24px rgba(0,0,0,0.6)', transform: `scale(${1 + pulse * 0.06})`, transformOrigin: 'left center'}}>
			<div style={{fontSize: 54, letterSpacing: '0.3em', opacity: 0.8}}>HEART ENERGY</div>
			<div style={{fontFamily: FONT_MONO, fontSize: 190, fontWeight: 800, lineHeight: 1, textShadow: `0 0 ${30 + pulse * 60}px ${accent}`}}>
				{value.toLocaleString('en-US')}
				<span style={{fontSize: 80, marginLeft: 20, color: accent}}>⚡</span>
			</div>
			<div style={{marginTop: 24, width: 1100, height: 26, borderRadius: 13, background: 'rgba(255,255,255,0.12)', overflow: 'hidden'}}>
				<div
					style={{
						width: `${(value / max) * 100}%`,
						height: '100%',
						background: `linear-gradient(90deg, ${HEART.H.color}, ${HEART.E.color}, ${HEART.A.color}, ${HEART.R.color}, ${HEART.T.color})`,
						boxShadow: `0 0 30px ${accent}`,
					}}
				/>
			</div>
		</div>
	);
};

/** 解鎖徽章：spring 回彈 + 放射光芒 + 光環擴散 */
export const Badge: React.FC<{k: HeartKey; unlockAt: number; size?: number; label?: boolean}> = ({k, unlockAt, size = 260, label = true}) => {
	const frame = useCurrentFrame();
	const h = HEART[k];
	const s = sp(frame, unlockAt, SPRINGS.badge);
	const unlocked = frame >= unlockAt;
	const ring = interpolate(frame - unlockAt, [0, 40], [0, 1], clamp);
	const rays = interpolate(frame - unlockAt, [0, 12, 50], [0, 1, 0.25], clamp);
	return (
		<div style={{position: 'relative', width: size, height: size + (label ? 90 : 0), fontFamily: FONT_UI}}>
			{/* 光芒 */}
			<div
				style={{
					position: 'absolute',
					left: -size * 0.5,
					top: -size * 0.5,
					width: size * 2,
					height: size * 2,
					background: `repeating-conic-gradient(from ${frame * 0.8}deg, ${h.glow} 0deg 6deg, transparent 6deg 24deg)`,
					WebkitMaskImage: 'radial-gradient(circle, black 20%, transparent 65%)',
					maskImage: 'radial-gradient(circle, black 20%, transparent 65%)',
					opacity: unlocked ? rays : 0,
					mixBlendMode: 'screen',
				}}
			/>
			{/* 擴散光環 */}
			<div
				style={{
					position: 'absolute',
					left: size / 2 - (size * (0.5 + ring)) ,
					top: size / 2 - (size * (0.5 + ring)),
					width: size * (1 + ring * 2),
					height: size * (1 + ring * 2),
					borderRadius: '50%',
					border: `${6 * (1 - ring)}px solid ${h.color}`,
					opacity: unlocked ? 1 - ring : 0,
				}}
			/>
			<div
				style={{
					width: size,
					height: size,
					borderRadius: '50%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					transform: unlocked ? `scale(${0.6 + 0.4 * s}) rotateY(${(1 - s) * 180}deg)` : 'scale(0.85)',
					background: unlocked
						? `radial-gradient(circle at 35% 30%, #fff, ${h.color} 45%, ${h.color}99 100%)`
						: 'radial-gradient(circle, rgba(255,255,255,0.10), rgba(255,255,255,0.03))',
					border: `6px solid ${unlocked ? '#fff' : 'rgba(255,255,255,0.25)'}`,
					boxShadow: unlocked ? `0 0 60px ${h.glow}, inset 0 -10px 30px rgba(0,0,0,0.25)` : 'none',
					fontSize: size * 0.42,
					fontWeight: 900,
					color: unlocked ? '#fff' : 'rgba(255,255,255,0.3)',
					textShadow: '0 4px 14px rgba(0,0,0,0.35)',
				}}
			>
				{k}
			</div>
			{label ? (
				<div style={{textAlign: 'center', marginTop: 16, fontSize: 46, color: unlocked ? h.color : 'rgba(255,255,255,0.35)', fontWeight: 800, whiteSpace: 'nowrap'}}>
					{h.zh}
				</div>
			) : null}
		</div>
	);
};

export const BadgeRow: React.FC<{x: number; y: number; unlocks: Partial<Record<HeartKey, number>>; size?: number}> = ({x, y, unlocks, size = 220}) => (
	<div style={{position: 'absolute', left: x, top: y, display: 'flex', gap: 70}}>
		{HEART_ORDER.map((k) => (
			<Badge key={k} k={k} unlockAt={unlocks[k] ?? 1e9} size={size} />
		))}
	</div>
);
