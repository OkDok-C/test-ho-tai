import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {HEART, HEART_ORDER, HeartKey, FONT_MONO, FONT_UI} from '../config/theme';
import {clamp, EASE, SPRINGS, sp} from '../lib/anim';
import {Spirit} from './Spirit';

type Props = {
	x: number;
	y: number;
	enterAt: number;
	title: string;
	code: string;
	main: HeartKey;
	stats: Record<HeartKey, number>;
	tagline: string;
};

/**
 * MBTI 專屬精靈圖鑑・性格分析卡
 * ─ 3D 翻牌進場（rotateY 180→0）+ 全息虹彩箔（conic-gradient 隨角度流動）
 * ─ 稱號逐字解碼（亂碼 → 正確文字）
 * ─ HEART 五維能力條依序充填
 */
export const MbtiCard: React.FC<Props> = ({x, y, enterAt, title, code, main, stats, tagline}) => {
	const frame = useCurrentFrame();
	const local = frame - enterAt;
	const flip = sp(frame, enterAt, SPRINGS.holo);
	const tilt = Math.sin(local / 35) * 6;
	const h = HEART[main];
	const GLYPHS = '永續精靈守護防詐地球健康#@%&∆Ω';
	const decoded = Array.from(title)
		.map((ch, i) => (local > 30 + i * 5 ? ch : GLYPHS[(frame + i * 7) % GLYPHS.length]))
		.join('');

	if (local < 0) return null;

	return (
		<div style={{position: 'absolute', left: x, top: y, width: 1250, height: 1500, perspective: 3000}}>
			<div
				style={{
					width: '100%',
					height: '100%',
					transform: `rotateY(${(1 - flip) * 180 + tilt}deg) rotateX(${4 + tilt * 0.4}deg)`,
					transformStyle: 'preserve-3d',
					borderRadius: 60,
					position: 'relative',
					overflow: 'hidden',
					background: 'linear-gradient(160deg, rgba(14,24,32,0.92), rgba(6,12,18,0.95))',
					border: `4px solid ${h.color}`,
					boxShadow: `0 0 80px ${h.glow}, 0 60px 120px rgba(0,0,0,0.5)`,
					fontFamily: FONT_UI,
					color: '#fff',
					backfaceVisibility: 'hidden',
				}}
			>
				{/* 全息虹彩箔 */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: `conic-gradient(from ${tilt * 12 + local}deg at 70% 20%, #ff4d5e33, #ffc83a33, #2ee59d33, #3aa8ff33, #a86bff33, #ff4d5e33)`,
						mixBlendMode: 'screen',
					}}
				/>
				<div style={{position: 'absolute', top: 70, left: 80, fontSize: 44, letterSpacing: '0.35em', opacity: 0.75}}>
					SPIRIT DEX ・ 精靈圖鑑 No.{code}
				</div>
				<div style={{position: 'absolute', top: 250, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
					<Spirit size={460} color={h.color} glow={h.glow} level={4} />
				</div>
				<div style={{position: 'absolute', top: 720, left: 80, right: 80}}>
					<div style={{fontSize: 52, color: h.color, letterSpacing: '0.2em'}}>{h.en.toUpperCase()} TYPE</div>
					<div style={{fontSize: 128, fontWeight: 900, lineHeight: 1.15, textShadow: `0 0 40px ${h.glow}`}}>{decoded}</div>
					<div style={{fontSize: 46, opacity: 0.8, marginTop: 10}}>{tagline}</div>
				</div>
				<div style={{position: 'absolute', top: 1060, left: 80, right: 80}}>
					{HEART_ORDER.map((k, i) => {
						const fill = interpolate(local, [60 + i * 8, 110 + i * 8], [0, stats[k]], {...clamp, easing: EASE.out});
						return (
							<div key={k} style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 22}}>
								<div style={{width: 60, fontFamily: FONT_MONO, fontSize: 48, fontWeight: 800, color: HEART[k].color}}>{k}</div>
								<div style={{flex: 1, height: 26, borderRadius: 13, background: 'rgba(255,255,255,0.1)', overflow: 'hidden'}}>
									<div style={{width: `${fill}%`, height: '100%', background: HEART[k].color, boxShadow: `0 0 20px ${HEART[k].glow}`}} />
								</div>
								<div style={{width: 110, textAlign: 'right', fontFamily: FONT_MONO, fontSize: 44}}>{Math.round(fill)}</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};
