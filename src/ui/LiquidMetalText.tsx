import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {clamp, EASE, SPRINGS, sp} from '../lib/anim';
import {FONT_DISPLAY} from '../config/theme';

type Props = {
	text: string;
	fontSize: number;
	enterAt: number;
	/** 'chrome' 流體鉻銀 / 'gold' 香檳金 / 'emerald' 南山綠金屬 */
	tone?: 'chrome' | 'gold' | 'emerald';
	letterSpacing?: number;
	stagger?: number;
	style?: React.CSSProperties;
	id: string;
};

const TONES = {
	chrome: ['#5b6670', '#f5f9ff', '#9aa6b2', '#ffffff', '#3c444c', '#dfe7ef', '#7d8893'],
	gold: ['#7a5a1c', '#fff2c4', '#c79a3b', '#fffbe8', '#5e4413', '#f1d27a', '#a37b2c'],
	emerald: ['#0a4d2a', '#d8ffe9', '#2ea866', '#ffffff', '#063a1f', '#9ff0c4', '#1f7a48'],
};

/**
 * 流體金屬光澤字
 * ─ 多段金屬漸層 + background-clip:text
 * ─ background-position 隨 frame 流動（液態高光掃過）
 * ─ SVG feTurbulence + feDisplacementMap：進場時字形由液態扭曲「凝固」成形
 * ─ 逐字 spring 錯位進場 + 動態模糊
 */
export const LiquidMetalText: React.FC<Props> = ({text, fontSize, enterAt, tone = 'chrome', letterSpacing = 0.04, stagger = 3, style, id}) => {
	const frame = useCurrentFrame();
	const c = TONES[tone];
	const local = frame - enterAt;
	// 扭曲強度：進場 0→40 frame 由 60 衰減到 0，之後保留極微液態呼吸
	const distort = interpolate(local, [0, 40], [60, 0], {...clamp, easing: EASE.out}) + 1.5 + Math.sin(frame / 20) * 1.2;
	// 高光帶每 2.5 秒掃過一次（background-position 100% → 0%）
	const sheen = 100 - ((frame * 0.67) % 150);
	const chars = Array.from(text);

	return (
		<div style={{position: 'relative', display: 'inline-block', ...style}}>
			<svg width="0" height="0" style={{position: 'absolute'}}>
				<filter id={`liquid-${id}`} x="-10%" y="-30%" width="120%" height="160%">
					<feTurbulence type="fractalNoise" baseFrequency="0.008 0.02" numOctaves={2} seed={Math.floor(frame / 3)} result="n" />
					<feDisplacementMap in="SourceGraphic" in2="n" scale={distort} xChannelSelector="R" yChannelSelector="G" />
				</filter>
			</svg>
			<div
				style={{
					fontFamily: FONT_DISPLAY,
					fontWeight: 900,
					fontSize,
					letterSpacing: `${letterSpacing}em`,
					whiteSpace: 'nowrap',
					filter: `url(#liquid-${id}) drop-shadow(0 ${fontSize * 0.04}px ${fontSize * 0.08}px rgba(0,0,0,0.55))`,
				}}
			>
				{chars.map((ch, i) => {
					const s = sp(frame, enterAt + i * stagger, SPRINGS.title);
					return (
						<span
							key={i}
							style={{
								display: 'inline-block',
								opacity: s,
								transform: `translateY(${(1 - s) * fontSize * 0.6}px) scale(${0.85 + 0.15 * s})`,
								filter: `blur(${(1 - s) * 18}px)`,
								backgroundImage: `linear-gradient(175deg, ${c[0]} 0%, ${c[1]} 18%, ${c[2]} 34%, ${c[3]} 48%, ${c[4]} 60%, ${c[5]} 78%, ${c[6]} 100%), linear-gradient(105deg, transparent 42%, rgba(255,255,255,0.95) 50%, transparent 58%)`,
								backgroundBlendMode: 'screen',
								backgroundSize: '100% 100%, 300% 100%',
								backgroundPosition: `0 0, ${sheen + i * 9}% 0`, // 逐字相位差 → 高光如液面波浪掃過
								WebkitBackgroundClip: 'text',
								backgroundClip: 'text',
								color: 'transparent',
								WebkitTextStroke: `${Math.max(1, fontSize * 0.008)}px rgba(255,255,255,0.35)`,
							}}
						>
							{ch === ' ' ? ' ' : ch}
						</span>
					);
				})}
			</div>
		</div>
	);
};
