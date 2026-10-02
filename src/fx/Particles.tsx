import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';

/** 決定性粒子場（以 remotion random(seed) 保證逐格一致，可多執行緒算圖） */
export const ParticleField: React.FC<{
	seed: string;
	count: number;
	colors: string[];
	/** 粒子上升速度 px/frame */
	speed?: number;
	size?: [number, number];
	opacity?: number;
	area?: {x: number; y: number; w: number; h: number};
}> = ({seed, count, colors, speed = 2, size = [6, 22], opacity = 0.9, area = {x: 0, y: 0, w: 3840, h: 2160}}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
			{new Array(count).fill(0).map((_, i) => {
				const r = size[0] + random(`${seed}s${i}`) * (size[1] - size[0]);
				const v = speed * (0.4 + random(`${seed}v${i}`));
				const yy = area.y + ((((random(`${seed}y${i}`) * area.h - frame * v) % area.h) + area.h) % area.h);
				const xx = area.x + random(`${seed}x${i}`) * area.w + Math.sin(frame / 30 + i) * 20;
				const tw = 0.5 + 0.5 * Math.sin(frame / (6 + (i % 7)) + i);
				const c = colors[i % colors.length];
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: xx,
							top: yy,
							width: r,
							height: r,
							borderRadius: '50%',
							background: c,
							boxShadow: `0 0 ${r * 2}px ${c}`,
							opacity: opacity * tw,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

/** 放射爆發粒子（扭蛋開啟、徽章解鎖、Boss 擊破） */
export const Burst: React.FC<{x: number; y: number; at: number; seed: string; count?: number; colors: string[]; power?: number}> = ({
	x,
	y,
	at,
	seed,
	count = 60,
	colors,
	power = 900,
}) => {
	const frame = useCurrentFrame();
	const t = frame - at;
	if (t < 0 || t > 90) return null;
	return (
		<AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
			{new Array(count).fill(0).map((_, i) => {
				const a = random(`${seed}a${i}`) * Math.PI * 2;
				const sp = power * (0.3 + random(`${seed}p${i}`) * 0.7);
				const k = 1 - Math.pow(1 - Math.min(t / 60, 1), 3);
				const px = x + Math.cos(a) * sp * k;
				const py = y + Math.sin(a) * sp * k + t * t * 0.08;
				const r = 8 + random(`${seed}r${i}`) * 18;
				const c = colors[i % colors.length];
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: px - r / 2,
							top: py - r / 2,
							width: r,
							height: r,
							borderRadius: '50%',
							background: c,
							boxShadow: `0 0 ${r * 3}px ${c}`,
							opacity: 1 - t / 90,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};
