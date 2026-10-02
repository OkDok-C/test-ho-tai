import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {HEART, BRAND, FILM_TITLE_A, FILM_TITLE_B, FONT_UI, SLOGAN} from '../config/theme';
import {sec} from '../config/timeline';
import {ParticleField} from '../fx/Particles';
import {clamp, EASE, SPRINGS, sp} from '../lib/anim';
import {HeartTotem} from '../ui/HeartTotem';
import {LiquidMetalText} from '../ui/LiquidMetalText';

/**
 * 場景五｜品牌價值定格（0:50 – 1:00，600f）
 * 0.0–1.0s  實景漸暗至深森林黑
 * 0.5–4.5s  HEART 五大永續面向核心圖騰：五瓣依序描線 → 填色 → 標籤
 * 4.5–6.0s  圖騰上移縮小，讓位給標題
 * 5.0–10s   金屬質感企劃名稱定格 + 隊名副標 + 高光掃過
 */
const TOTEM_AT = sec(0.5);
const MOVE_AT = sec(4.5);
const TITLE_AT = sec(5.2);

export const Scene5Brand: React.FC = () => {
	const frame = useCurrentFrame();
	const move = interpolate(frame, [MOVE_AT, MOVE_AT + 70], [0, 1], {...clamp, easing: EASE.cine});
	const sub = sp(frame, TITLE_AT + 80, SPRINGS.title);
	const rule = interpolate(frame, [TITLE_AT + 50, TITLE_AT + 110], [0, 1], {...clamp, easing: EASE.out});
	// 最後 1.5 秒：整體高光掃過（定格前的 "glint"）
	const glint = interpolate(frame, [sec(8.2), sec(9.2)], [-30, 130], clamp);

	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #0b2a1b 0%, ${BRAND.deepForest} 55%, #000 100%)`}}>
			<ParticleField seed="s5" count={70} colors={[HEART.H.color, HEART.E.color, HEART.A.color, HEART.R.color, HEART.T.color]} speed={0.6} size={[4, 12]} opacity={0.55} />

			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div
					style={{
						transform: `translateY(${-move * 360}px) scale(${1 - move * 0.5})`,
					}}
				>
					<HeartTotem enterAt={TOTEM_AT} size={1180} />
				</div>
			</AbsoluteFill>

			{frame >= TITLE_AT - 2 ? (
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 640}}>
					<LiquidMetalText id="titleA" text={FILM_TITLE_A} fontSize={230} enterAt={TITLE_AT} tone="gold" stagger={4} letterSpacing={0.1} />
					<div style={{height: 10}} />
					<LiquidMetalText id="titleB" text={FILM_TITLE_B} fontSize={170} enterAt={TITLE_AT + 22} tone="chrome" stagger={3} letterSpacing={0.06} />
					<div style={{marginTop: 50, width: 1800 * rule, height: 4, background: `linear-gradient(90deg, transparent, ${BRAND.gold}, transparent)`}} />
					<div
						style={{
							marginTop: 40,
							fontFamily: FONT_UI,
							fontSize: 62,
							letterSpacing: '0.3em',
							color: '#e9fff3',
							opacity: sub,
							transform: `translateY(${(1 - sub) * 30}px)`,
						}}
					>
						{SLOGAN}
					</div>
				</AbsoluteFill>
			) : null}

			{/* 定格高光 glint */}
			<AbsoluteFill
				style={{
					background: `linear-gradient(110deg, transparent ${glint - 12}%, rgba(255,245,220,0.22) ${glint}%, transparent ${glint + 12}%)`,
					mixBlendMode: 'screen',
				}}
			/>
		</AbsoluteFill>
	);
};
