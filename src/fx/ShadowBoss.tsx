import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, shake} from '../lib/anim';

/**
 * 「詐騙黑影」Boss
 * ─ 黑色流體體塊：feTurbulence + feDisplacementMap 讓輪廓如煙霧蠕動
 * ─ 紅色雙眼 + 紫色邊緣光；被光束擊中時白閃並後退
 * ─ hp 越低體積越小、越不穩定
 */
export const ShadowBoss: React.FC<{enterAt: number; hitFlashes: number[]; hp: number; vanishAt: number}> = ({enterAt, hitFlashes, hp, vanishAt}) => {
	const frame = useCurrentFrame();
	const appear = interpolate(frame, [enterAt, enterAt + 90], [0, 1], clamp);
	const vanish = interpolate(frame, [vanishAt - 6, vanishAt], [1, 0], clamp);
	const hit = hitFlashes.reduce((a, h) => a + interpolate(frame - h, [0, 2, 12], [0, 1, 0], clamp), 0);
	const scale = (0.75 + 0.25 * (hp / 100)) * (0.8 + appear * 0.2);
	const instability = 20 + (100 - hp) * 0.9;
	if (appear <= 0 || vanish <= 0) return null;
	return (
		<AbsoluteFill style={{opacity: appear * vanish}}>
			<svg width="100%" height="100%" viewBox="0 0 3840 2160">
				<defs>
					<filter id="smoke" x="-30%" y="-30%" width="160%" height="160%">
						<feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={3} seed={Math.floor(frame / 2)} />
						<feDisplacementMap in="SourceGraphic" scale={140 + instability} xChannelSelector="R" yChannelSelector="B" />
						<feGaussianBlur stdDeviation={6} />
					</filter>
					<radialGradient id="hit-flash">
						<stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
						<stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
					</radialGradient>
					<radialGradient id="shadow-core" cx="50%" cy="45%" r="55%">
						<stop offset="0%" stopColor="#000" />
						<stop offset="70%" stopColor="#120020" />
						<stop offset="100%" stopColor="#5a0d8c" stopOpacity={0} />
					</radialGradient>
				</defs>
				<g transform={`translate(${1920 + shake(frame, 30 * hit)}, ${880 - hit * 30}) scale(${scale})`}>
					<g filter="url(#smoke)">
						<ellipse rx={1100} ry={560} fill="url(#shadow-core)" />
						<path d="M-900,-100 C -1300,-500 -700,-700 -500,-450 L -300,-650 L -100,-420 L 100,-700 L 300,-420 L 520,-640 L 650,-420 C 900,-700 1350,-450 900,-60 Z" fill="#05000c" />
					</g>
					{/* 雙眼 */}
					{[-260, 260].map((ex) => (
						<g key={ex}>
							<ellipse cx={ex} cy={-80} rx={130} ry={46} fill="#ff1744" opacity={0.35} filter="url(#smoke)" />
							<path d={`M${ex - 120},-90 Q${ex},-150 ${ex + 120},-70 Q${ex},-40 ${ex - 120},-90 Z`} fill="#ff2d55" style={{filter: 'drop-shadow(0 0 30px #ff0040)'}} />
						</g>
					))}
					{/* 被擊中白閃 */}
					<ellipse rx={1000} ry={500} fill="url(#hit-flash)" opacity={hit * 0.6} />
				</g>
			</svg>
			{/* 黑影籠罩：畫面上半壓暗 */}
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(40,0,60,0.55), transparent 60%)', opacity: hp / 100}} />
		</AbsoluteFill>
	);
};
