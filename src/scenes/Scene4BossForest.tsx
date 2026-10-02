import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {LiveFootage} from '../cinema/LiveFootage';
import {HEART, FONT_DISPLAY, FONT_MONO, FONT_UI} from '../config/theme';
import {sec} from '../config/timeline';
import {BeamStorm} from '../fx/BeamStorm';
import {Burst, ParticleField} from '../fx/Particles';
import {ShadowBoss} from '../fx/ShadowBoss';
import {ShatterForest} from '../fx/ShatterForest';
import {clamp, EASE, envelope, progress, shake} from '../lib/anim';
import {BossHpBar} from '../ui/BossHpBar';
import {LiquidMetalText} from '../ui/LiquidMetalText';

/**
 * 場景四｜全區共鬥與永續森林（0:35 – 0:50，900f）
 * 0.0–2.0s   低光度史詩場景，全校學生緊盯手機；警報字卡「詐騙黑影來襲！」（RGB 分離 glitch）
 * 0.5–3.3s   黑影 Boss 從天幕凝聚，巨大 HP 血條自上方砸入
 * 3.3–10.0s  防詐答題（藍）× 健康步數（綠）光束從實景手機螢幕沖天，HP 階梯式下降
 * 10.2s      HP 歸零 → 黑影碎裂（白閃 + 碎片爆散轉綠）
 * 11.5–15s   光種落地 → 分形「南山永續森林」綻放；畫面調色由冷轉暖（黎明）
 */
const ALERT = 0;
const BOSS_IN = sec(0.5);
const BEAM_START = sec(3.3);
const BEAM_END = sec(10);
const SHATTER = sec(10.2);
const BLOOM = sec(11.5);

const HITS = new Array(18).fill(0).map((_, i) => Math.round(BEAM_START + 30 + i * ((BEAM_END - BEAM_START - 40) / 17)));
const hpAt = (f: number) => {
	const n = HITS.filter((h) => f >= h).length;
	const prev = 100 - (n - 1) * (100 / HITS.length);
	const next = 100 - n * (100 / HITS.length);
	if (n === 0) return 100;
	// 受擊後 8 frame 內緩降到下一階
	const k = interpolate(f - HITS[n - 1], [0, 8], [0, 1], {...clamp, easing: EASE.out});
	return prev + (next - prev) * k;
};

/** 實景手機螢幕座標（示意板中學生手機位置；實拍以 Mocha / AE 追蹤點替換） */
const PHONES_PLATE = new Array(9).fill(0).map((_, i) => {
	const s = 1.1 + (i % 3) * 0.12;
	return {x: 250 + i * 420 + 90 * s, y: 1950 + (i % 2) * 60 - 325 * s};
});
const CAM = {from: [0, 120, 1.08], to: [0, -60, 1.16]} as const;
/** 將素材座標映射到畫面座標（與 LiveFootage 數位運鏡同一條曲線），光束起點才會黏在手機螢幕上 */
const phonesOnScreen = (frame: number) => {
	const t = progress(frame, 0, SHATTER);
	const ty = CAM.from[1] + (CAM.to[1] - CAM.from[1]) * t;
	const sc = CAM.from[2] + (CAM.to[2] - CAM.from[2]) * t;
	return PHONES_PLATE.map((p) => ({x: 1920 + (p.x - 1920) * sc, y: 1080 + (p.y - 1080) * sc + ty}));
};

const GlitchTitle: React.FC = () => {
	const frame = useCurrentFrame();
	const op = envelope(frame, ALERT + 6, ALERT + 16, sec(2.3), sec(2.8));
	const j = frame % 9 < 2 ? 1 : 0;
	const off = 14 + j * 30;
	const base: React.CSSProperties = {position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 300, letterSpacing: '0.06em'};
	if (op <= 0) return null;
	return (
		<AbsoluteFill style={{opacity: op}}>
			<div style={{...base, color: '#ff0050', transform: `translate(${-off}px, ${j * 8}px)`, mixBlendMode: 'screen'}}>詐騙黑影來襲！</div>
			<div style={{...base, color: '#00e5ff', transform: `translate(${off}px, ${-j * 8}px)`, mixBlendMode: 'screen'}}>詐騙黑影來襲！</div>
			<div style={{...base, color: '#fff', clipPath: j ? 'inset(30% 0 45% 0)' : 'none', transform: j ? 'translateX(40px)' : 'none'}}>詐騙黑影來襲！</div>
			<div style={{position: 'absolute', top: 1380, width: '100%', textAlign: 'center', fontFamily: FONT_UI, fontSize: 72, letterSpacing: '0.5em', color: '#ffb3c1'}}>
				LIMITED-TIME RAID ・ 全區共鬥
			</div>
		</AbsoluteFill>
	);
};

const RaidStats: React.FC = () => {
	const frame = useCurrentFrame();
	const k = interpolate(frame, [BEAM_START, BEAM_END], [0, 1], {...clamp, easing: EASE.cine});
	const op = envelope(frame, BEAM_START - 20, BEAM_START, SHATTER, SHATTER + 20);
	const row = (label: string, value: string, color: string) => (
		<div style={{display: 'flex', alignItems: 'baseline', gap: 30}}>
			<span style={{fontSize: 50, color: 'rgba(255,255,255,0.8)'}}>{label}</span>
			<span style={{fontFamily: FONT_MONO, fontSize: 96, fontWeight: 800, color, textShadow: `0 0 30px ${color}`}}>{value}</span>
		</div>
	);
	return (
		<div style={{position: 'absolute', left: 340, top: 720, opacity: op, fontFamily: FONT_UI, display: 'flex', flexDirection: 'column', gap: 10}}>
			{row('防詐答題', Math.round(12486 * k).toLocaleString('en-US'), HEART.R.color)}
			{row('健康步數', Math.round(3820559 * k).toLocaleString('en-US'), HEART.E.color)}
			{row('參戰學生', Math.round(4362 * Math.min(1, k * 3)).toLocaleString('en-US'), '#ffffff')}
		</div>
	);
};

export const Scene4BossForest: React.FC = () => {
	const frame = useCurrentFrame();
	const hp = hpAt(frame);
	const hitAmt = HITS.reduce((a, h) => a + interpolate(frame - h, [0, 2, 10], [0, 1, 0], clamp), 0);
	const camShake = shake(frame, 10 * hitAmt + (frame > SHATTER && frame < SHATTER + 30 ? 30 : 0), 9);
	// 黎明調色：碎裂後由冷轉暖
	const dawn = interpolate(frame, [SHATTER, BLOOM + 120], [0, 1], {...clamp, easing: EASE.cine});
	const footageOut = interpolate(frame, [SHATTER + 20, BLOOM + 60], [1, 0.35], clamp);

	return (
		<AbsoluteFill style={{background: '#000', transform: `translate(${camShake}px, ${camShake * 0.6}px)`}}>
			<AbsoluteFill style={{opacity: footageOut}}>
				<LiveFootage footage="s4Night" grade="lowKey" camera={{from: [...CAM.from], to: [...CAM.to], duration: SHATTER}} />
			</AbsoluteFill>
			{/* 黎明天光 */}
			<AbsoluteFill
				style={{
					background: 'linear-gradient(180deg, #0c2b3a 0%, #2a6f6a 40%, #f2c27a 85%, #ffe3b0 100%)',
					opacity: dawn * 0.85,
					mixBlendMode: 'screen',
				}}
			/>
			{/* 手機螢幕光打臉（實景 mask 疊加：僅在下方人群區） */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse at 50% 85%, rgba(90,190,255,${0.25 + hitAmt * 0.2}), transparent 55%)`,
					mixBlendMode: 'screen',
					WebkitMaskImage: 'linear-gradient(0deg, black 30%, transparent 55%)',
					maskImage: 'linear-gradient(0deg, black 30%, transparent 55%)',
					opacity: 1 - dawn,
				}}
			/>

			<ShadowBoss enterAt={BOSS_IN} hitFlashes={HITS} hp={hp} vanishAt={SHATTER} />
			<BeamStorm origins={phonesOnScreen(frame)} target={{x: 1920, y: 860}} start={BEAM_START} end={BEAM_END} colors={[HEART.R.color, HEART.E.color]} perOrigin={7} />
			{HITS.map((h, i) => (
				<Burst key={h} x={1920 + (i % 2 ? 1 : -1) * (120 + (i % 5) * 60)} y={860 + ((i % 3) - 1) * 100} at={h} seed={`hit${i}`} colors={[i % 2 ? HEART.E.color : HEART.R.color, '#fff']} count={24} power={420} />
			))}

			<ShatterForest shatterAt={SHATTER} bloomAt={BLOOM} />

			{frame < SHATTER + 30 ? (
				<AbsoluteFill style={{opacity: interpolate(frame, [SHATTER, SHATTER + 30], [1, 0], clamp)}}>
					<BossHpBar enterAt={BOSS_IN + 40} hp={hpAt} hits={HITS} name="詐騙黑影" />
				</AbsoluteFill>
			) : null}
			<RaidStats />
			<GlitchTitle />

			{frame >= BLOOM + 40 ? (
				<AbsoluteFill style={{alignItems: 'center', paddingTop: 330}}>
					<LiquidMetalText id="forest" text="南山永續森林" fontSize={250} enterAt={BLOOM + 50} tone="emerald" stagger={5} letterSpacing={0.18} />
					<div style={{marginTop: 20, fontFamily: FONT_UI, fontSize: 64, letterSpacing: '0.35em', color: '#fff', opacity: interpolate(frame, [BLOOM + 110, BLOOM + 150], [0, 1], clamp), textShadow: '0 0 20px rgba(0,0,0,0.6)'}}>
						全校行動 ・ 化為真實種下的每一棵樹
					</div>
				</AbsoluteFill>
			) : null}
			<ParticleField seed="s4f" count={60} colors={['#c8ffd9', HEART.T.color, HEART.E.color]} speed={1} opacity={dawn * 0.8} area={{x: 0, y: 600, w: 3840, h: 1400}} />
		</AbsoluteFill>
	);
};
