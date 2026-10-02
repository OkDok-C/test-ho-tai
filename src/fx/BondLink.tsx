import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {HEART, FONT_DISPLAY, FONT_MONO, FONT_UI} from '../config/theme';
import {clamp, EASE, SPRINGS, sp} from '../lib/anim';
import {Spirit} from '../ui/Spirit';
import {Burst} from './Particles';

const Phone: React.FC<{x: number; y: number; rot: number; color: string; name: string; glow: number}> = ({x, y, rot, color, name, glow}) => (
	<div
		style={{
			position: 'absolute',
			left: x - 260,
			top: y - 520,
			width: 520,
			height: 1040,
			borderRadius: 80,
			background: '#0b0f14',
			border: '14px solid #2a2f36',
			transform: `rotate(${rot}deg) perspective(2000px) rotateY(${rot * -1.2}deg)`,
			boxShadow: `0 0 ${40 + glow * 120}px ${color}, 0 50px 100px rgba(0,0,0,0.5)`,
			overflow: 'hidden',
			fontFamily: FONT_UI,
		}}
	>
		<div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 40%, ${color}55, transparent 70%)`}} />
		<div style={{position: 'absolute', top: 160, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
			<Spirit size={300} color={color} />
		</div>
		<div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center', color: '#fff', fontSize: 48, fontWeight: 800}}>{name}</div>
		<div style={{position: 'absolute', top: 640, width: '100%', textAlign: 'center', color, fontSize: 36, letterSpacing: '0.2em'}}>LINK READY</div>
	</div>
);

/**
 * 「好友羈絆 buff」：兩台手機靠近 → 粒子連線發光
 * ─ 手機以 EASE.out 由兩側滑入，距離 < 臨界值（linkAt）觸發連線
 * ─ 連線 = 正弦波上流動的光點串（雙股螺旋，HEART 雙色）
 * ─ 觸發瞬間 Burst 爆發 + Buff 字卡 spring 彈出
 */
export const BondLink: React.FC<{start: number; linkAt: number}> = ({start, linkAt}) => {
	const frame = useCurrentFrame();
	const approach = interpolate(frame, [start, linkAt], [0, 1], {...clamp, easing: EASE.out});
	const lx = 700 + approach * 650;
	const rx = 3140 - approach * 650;
	const cy = 1300;
	const linked = frame >= linkAt;
	const link = interpolate(frame, [linkAt, linkAt + 20], [0, 1], clamp);
	const buff = sp(frame, linkAt + 10, SPRINGS.badge);
	const a = HEART.E.color;
	const b = HEART.R.color;

	const N = 70;
	const dots = linked
		? new Array(N).fill(0).map((_, i) => {
				const t = (i / N + frame * 0.012) % 1;
				if (t > link) return null;
				const x = lx + 200 + (rx - lx - 400) * t;
				const amp = 120 * Math.sin(t * Math.PI);
				const strand = i % 2 === 0 ? 1 : -1;
				const y = cy - 200 + Math.sin(t * Math.PI * 4 - frame * 0.15) * amp * strand;
				const c = strand > 0 ? a : b;
				const r = 10 + Math.sin(t * Math.PI) * 14;
				return <div key={i} style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: c, boxShadow: `0 0 ${r * 3}px ${c}`}} />;
			})
		: null;

	return (
		<AbsoluteFill>
			<Phone x={lx} y={cy} rot={-8 + approach * 4} color={a} name="小綠 Lv.4" glow={link} />
			<Phone x={rx} y={cy} rot={8 - approach * 4} color={b} name="小藍 Lv.3" glow={link} />
			<AbsoluteFill style={{mixBlendMode: 'screen'}}>
				{dots}
				{linked ? (
					<div
						style={{
							position: 'absolute',
							left: lx + 200,
							width: rx - lx - 400,
							top: cy - 210,
							height: 20,
							background: `linear-gradient(90deg, ${a}, #fff, ${b})`,
							filter: 'blur(10px)',
							opacity: link * (0.6 + Math.sin(frame / 5) * 0.2),
							transform: `scaleX(${link})`,
						}}
					/>
				) : null}
			</AbsoluteFill>
			<Burst x={1920} y={cy - 200} at={linkAt} seed="bond" colors={[a, b, '#fff']} count={80} power={1100} />
			{linked ? (
				<div
					style={{
						position: 'absolute',
						left: 1920,
						top: 330,
						transform: `translate(-50%, 0) scale(${buff})`,
						textAlign: 'center',
						color: '#fff',
						fontFamily: FONT_DISPLAY,
						whiteSpace: 'nowrap',
					}}
				>
					<div style={{fontSize: 120, fontWeight: 900, textShadow: `0 0 40px ${a}, 0 0 80px ${b}`}}>好友羈絆 BUFF 啟動！</div>
					<div style={{fontFamily: FONT_MONO, fontSize: 84, color: HEART.T.color, marginTop: 10}}>HEART Energy ×1.2 ・ 7 DAYS</div>
				</div>
			) : null}
		</AbsoluteFill>
	);
};
