import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {FONT_DISPLAY, FONT_MONO} from '../config/theme';
import {clamp, shake, SPRINGS, sp} from '../lib/anim';

/**
 * 巨型 Boss HP 血條（畫面上方）
 * ─ 主血條（即時）+ 延遲白條（受擊殘影，落後 18 frame）
 * ─ 受擊時整條震動 + 紅光閃爍；HP < 25% 進入狂暴脈動
 */
export const BossHpBar: React.FC<{enterAt: number; hp: (f: number) => number; hits: number[]; name: string}> = ({enterAt, hp, hits, name}) => {
	const frame = useCurrentFrame();
	const enter = sp(frame, enterAt, SPRINGS.title);
	const cur = hp(frame);
	const lag = hp(frame - 18);
	const hitAmt = hits.reduce((a, h) => a + interpolate(frame - h, [0, 3, 16], [0, 1, 0], clamp), 0);
	const rage = cur < 25 ? 0.5 + Math.sin(frame / 3) * 0.5 : 0;
	const sx = shake(frame, 22 * hitAmt, 3);
	const sy = shake(frame + 50, 10 * hitAmt, 7);

	return (
		<div
			style={{
				position: 'absolute',
				left: 340,
				right: 340,
				top: 330,
				transform: `translate(${sx}px, ${sy - (1 - enter) * 300}px)`,
				opacity: enter,
			}}
		>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20}}>
				<div style={{fontFamily: FONT_DISPLAY, fontSize: 110, fontWeight: 900, color: '#fff', letterSpacing: '0.08em', textShadow: '0 0 40px rgba(170,40,255,0.9), 0 0 6px #000'}}>
					⚠ {name}
				</div>
				<div style={{fontFamily: FONT_MONO, fontSize: 72, color: '#ffb3c1', textShadow: '0 0 20px #f0f'}}>
					BOSS HP {Math.max(0, cur).toFixed(1)}%
				</div>
			</div>
			<div
				style={{
					height: 110,
					borderRadius: 18,
					border: '6px solid rgba(255,255,255,0.85)',
					background: 'rgba(10,0,20,0.75)',
					overflow: 'hidden',
					position: 'relative',
					boxShadow: `0 0 ${60 + hitAmt * 80 + rage * 60}px rgba(200,30,120,${0.6 + hitAmt * 0.4})`,
					clipPath: 'polygon(2% 0, 100% 0, 98% 100%, 0 100%)',
				}}
			>
				<div style={{position: 'absolute', inset: 0, width: `${Math.max(0, lag)}%`, background: 'rgba(255,255,255,0.85)'}} />
				<div
					style={{
						position: 'absolute',
						inset: 0,
						width: `${Math.max(0, cur)}%`,
						background: 'linear-gradient(180deg, #ff5f8f 0%, #b0124a 55%, #5c0430 100%)',
						filter: `brightness(${1 + hitAmt * 0.8 + rage * 0.4})`,
					}}
				/>
				{/* 刻度 */}
				<div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, transparent 0 9.8%, rgba(0,0,0,0.5) 9.8% 10%)'}} />
			</div>
		</div>
	);
};
