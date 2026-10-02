import React from 'react';
import {useCurrentFrame} from 'remotion';

/**
 * 永續小精靈（SVG 角色）
 * 種子造型身體 + 頭頂嫩芽，顏色對應 HEART 屬性；含呼吸、眨眼、嫩芽擺動。
 */
export const Spirit: React.FC<{size: number; color: string; glow?: string; level?: number; style?: React.CSSProperties}> = ({
	size,
	color,
	glow,
	level = 1,
	style,
}) => {
	const frame = useCurrentFrame();
	const breathe = 1 + Math.sin(frame / 18) * 0.03;
	const blink = frame % 150 > 144 ? 0.1 : 1;
	const sway = Math.sin(frame / 22) * 8;
	const leafScale = 0.8 + Math.min(level, 5) * 0.12;
	return (
		<svg width={size} height={size} viewBox="-120 -170 240 290" style={{overflow: 'visible', filter: `drop-shadow(0 0 ${size * 0.08}px ${glow ?? color})`, ...style}}>
			<defs>
				<radialGradient id={`body-${color.replace("#", "")}`} cx="35%" cy="30%" r="80%">
					<stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
					<stop offset="35%" stopColor={color} />
					<stop offset="100%" stopColor={color} stopOpacity={0.75} />
				</radialGradient>
			</defs>
			<g transform={`rotate(${sway}, 0, -70)`}>
				<path d="M0,-70 C 0,-110 0,-120 0,-130" stroke="#3fae5a" strokeWidth={10} strokeLinecap="round" />
				<g transform={`translate(0,-130) scale(${leafScale})`}>
					<path d="M0,0 C -50,-10 -70,-50 -60,-70 C -30,-65 -5,-40 0,0 Z" fill="#5ad07a" />
					<path d="M0,0 C 50,-10 70,-50 60,-70 C 30,-65 5,-40 0,0 Z" fill="#3fae5a" />
				</g>
			</g>
			<g transform={`scale(${breathe}, ${2 - breathe})`}>
				<path d="M0,-80 C 70,-80 100,-10 95,40 C 90,95 50,110 0,110 C -50,110 -90,95 -95,40 C -100,-10 -70,-80 0,-80 Z" fill={`url(#body-${color.replace("#", "")})`} />
				<ellipse cx={-34} cy={10} rx={14} ry={20 * blink} fill="#1a1a2e" />
				<ellipse cx={34} cy={10} rx={14} ry={20 * blink} fill="#1a1a2e" />
				<circle cx={-29} cy={2} r={5} fill="#fff" opacity={blink} />
				<circle cx={39} cy={2} r={5} fill="#fff" opacity={blink} />
				<ellipse cx={-58} cy={42} rx={16} ry={9} fill="#ff8fa3" opacity={0.6} />
				<ellipse cx={58} cy={42} rx={16} ry={9} fill="#ff8fa3" opacity={0.6} />
				<path d="M-14,44 Q0,58 14,44" stroke="#1a1a2e" strokeWidth={6} fill="none" strokeLinecap="round" />
			</g>
		</svg>
	);
};
