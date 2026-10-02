import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {clamp} from '../lib/anim';

export type BeamOrigin = {x: number; y: number};

/**
 * 全校光束齊射：防詐答題（藍）× 健康步數（綠）
 * ─ 每道光束 = SVG path（手機 → 天空 Boss），stroke-dasharray 做「光彈」飛行
 * ─ 三層描邊：外暈（blur 寬）+ 主光（色）+ 核心（白），screen 疊加 → 真實光能量感
 * ─ 發射時間以 seed 錯開，形成持續的光雨
 */
export const BeamStorm: React.FC<{
	origins: BeamOrigin[];
	target: {x: number; y: number};
	start: number;
	end: number;
	colors: [string, string];
	perOrigin?: number;
}> = ({origins, target, start, end, colors, perOrigin = 6}) => {
	const frame = useCurrentFrame();
	const FLIGHT = 34;
	const beams: React.ReactNode[] = [];

	origins.forEach((o, oi) => {
		for (let b = 0; b < perOrigin; b++) {
			const fire = start + random(`beam-${oi}-${b}`) * (end - start - FLIGHT);
			const t = interpolate(frame, [fire, fire + FLIGHT], [0, 1], clamp);
			if (frame < fire || frame > fire + FLIGHT + 20) continue;
			const c = (oi + b) % 2 === 0 ? colors[0] : colors[1];
			// 帶弧度的軌跡（控制點往外偏）
			const bend = (random(`bend-${oi}-${b}`) - 0.5) * 900;
			const tx = target.x + (random(`tx-${oi}-${b}`) - 0.5) * 700;
			const ty = target.y + (random(`ty-${oi}-${b}`) - 0.5) * 220;
			const d = `M${o.x},${o.y} Q${(o.x + tx) / 2 + bend},${(o.y + ty) / 2} ${tx},${ty}`;
			const L = 2600;
			const head = t * L;
			const tail = 900;
			const fade = interpolate(frame, [fire + FLIGHT, fire + FLIGHT + 20], [1, 0], clamp);
			const dash = `${tail} ${L * 2}`;
			const offset = tail - head;
			beams.push(
				<g key={`${oi}-${b}`} opacity={fade}>
					<path d={d} stroke={c} strokeWidth={60} fill="none" strokeLinecap="round" strokeDasharray={dash} strokeDashoffset={offset} opacity={0.35} filter="url(#beam-blur)" pathLength={L} />
					<path d={d} stroke={c} strokeWidth={18} fill="none" strokeLinecap="round" strokeDasharray={dash} strokeDashoffset={offset} pathLength={L} />
					<path d={d} stroke="#ffffff" strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={dash} strokeDashoffset={offset} pathLength={L} />
				</g>,
			);
		}
	});

	// 手機發射口的光暈
	const active = frame >= start && frame <= end;
	return (
		<AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
			<svg width="100%" height="100%" viewBox="0 0 3840 2160">
				<defs>
					<filter id="beam-blur" x="-20%" y="-20%" width="140%" height="140%">
						<feGaussianBlur stdDeviation={18} />
					</filter>
				</defs>
				{beams}
				{active
					? origins.map((o, i) => (
							<circle key={i} cx={o.x} cy={o.y} r={70 + Math.sin(frame / 4 + i) * 20} fill={i % 2 ? colors[1] : colors[0]} opacity={0.45} filter="url(#beam-blur)" />
						))
					: null}
			</svg>
		</AbsoluteFill>
	);
};
