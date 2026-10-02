import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {HEART, HEART_ORDER, FONT_DISPLAY, FONT_UI} from '../config/theme';
import {clamp, EASE, SPRINGS, sp} from '../lib/anim';

/**
 * HEART 五大永續面向核心圖騰
 * ─ 五瓣以 72° 環繞中心，構成「花 × 盾」的守護意象
 * ─ 每瓣：描線（stroke-dashoffset）→ 填色 → 外圈標籤，依序 12 frame 錯位
 * ─ 中央 HEART 字標 + 緩慢自轉的金屬細環
 */
export const HeartTotem: React.FC<{enterAt: number; size: number}> = ({enterAt, size}) => {
	const frame = useCurrentFrame();
	const local = frame - enterAt;
	const R = 300;
	const petal = 'M0,0 C 120,-80 150,-240 0,-360 C -150,-240 -120,-80 0,0 Z';
	const PETAL_LEN = 1100;

	return (
		<div style={{position: 'relative', width: size, height: size}}>
			<svg width={size} height={size} viewBox="-700 -700 1400 1400" style={{overflow: 'visible'}}>
				<defs>
					{HEART_ORDER.map((k) => (
						<linearGradient key={k} id={`petal-${k}`} x1="0" y1="0" x2="0" y2="-1" gradientUnits="objectBoundingBox">
							<stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
							<stop offset="45%" stopColor={HEART[k].color} />
							<stop offset="100%" stopColor={HEART[k].color} stopOpacity={0.6} />
						</linearGradient>
					))}
					<linearGradient id="ring-metal" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stopColor="#7a5a1c" />
						<stop offset="30%" stopColor="#fff2c4" />
						<stop offset="55%" stopColor="#c79a3b" />
						<stop offset="80%" stopColor="#fffbe8" />
						<stop offset="100%" stopColor="#7a5a1c" />
					</linearGradient>
				</defs>
				<g transform={`rotate(${local * 0.15})`} opacity={interpolate(local, [0, 30], [0, 1], clamp)}>
					<circle r={R + 330} fill="none" stroke="url(#ring-metal)" strokeWidth={4} strokeDasharray="6 18" />
					<circle r={R + 360} fill="none" stroke="url(#ring-metal)" strokeWidth={2} />
				</g>
				{HEART_ORDER.map((k, i) => {
					const d = 10 + i * 12;
					const draw = interpolate(local, [d, d + 40], [PETAL_LEN, 0], {...clamp, easing: EASE.cine});
					const fill = interpolate(local, [d + 30, d + 60], [0, 1], clamp);
					const pop = sp(frame, enterAt + d + 30, SPRINGS.badge);
					const angle = i * 72;
					return (
						<g key={k} transform={`rotate(${angle}) scale(${0.9 + 0.1 * pop})`}>
							<path d={petal} transform="translate(0,-40)" fill={`url(#petal-${k})`} fillOpacity={fill} stroke={HEART[k].color} strokeWidth={8} strokeDasharray={PETAL_LEN} strokeDashoffset={draw} style={{filter: `drop-shadow(0 0 ${20 + fill * 30}px ${HEART[k].glow})`}} />
							<text
								x={0}
								y={-250}
								textAnchor="middle"
								fontSize={120}
								fontWeight={900}
								fill="#fff"
								fontFamily={FONT_DISPLAY}
								transform={`rotate(${-angle}, 0, -210)`}
								opacity={fill}
							>
								{k}
							</text>
						</g>
					);
				})}
				<circle r={110} fill="#061a10" stroke="url(#ring-metal)" strokeWidth={10} opacity={interpolate(local, [60, 90], [0, 1], clamp)} />
				<text y={30} textAnchor="middle" fontSize={64} fontWeight={900} fill="url(#ring-metal)" fontFamily={FONT_DISPLAY} letterSpacing={4} opacity={interpolate(local, [70, 100], [0, 1], clamp)}>
					南山
				</text>
			</svg>
			{/* 外圈中文標籤（不旋轉，保持可讀） */}
			{HEART_ORDER.map((k, i) => {
				const a = ((i * 72 - 90) * Math.PI) / 180;
				const dist = size * 0.58;
				const op = interpolate(local, [50 + i * 12, 80 + i * 12], [0, 1], clamp);
				return (
					<div
						key={k}
						style={{
							position: 'absolute',
							left: size / 2 + Math.cos(a) * dist,
							top: size / 2 + Math.sin(a) * dist,
							transform: `translate(-50%, -50%) translateY(${(1 - op) * 30}px)`,
							opacity: op,
							textAlign: 'center',
							fontFamily: FONT_UI,
							whiteSpace: 'nowrap',
						}}
					>
						<div style={{fontSize: 74, fontWeight: 900, color: HEART[k].color, textShadow: `0 0 30px ${HEART[k].glow}`}}>{HEART[k].pillar}</div>
						<div style={{fontSize: 40, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.75)'}}>{HEART[k].en.toUpperCase()}</div>
					</div>
				);
			})}
		</div>
	);
};
