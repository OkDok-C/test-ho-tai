import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {LiveFootage} from '../cinema/LiveFootage';
import {HEART, HeartKey, FONT_UI} from '../config/theme';
import {sec} from '../config/timeline';
import {BondLink} from '../fx/BondLink';
import {ParticleField} from '../fx/Particles';
import {clamp, envelope, SPRINGS, sp} from '../lib/anim';
import {MbtiCard} from '../ui/MbtiCard';
import {Spirit} from '../ui/Spirit';

/**
 * 場景三｜社群裂變與虛實互動（0:25 – 0:35，600f）
 * 0.0–2.8s  學生舉手機使用 IG / Threads AR 濾鏡，虛擬精靈「站」在真實環境中合影（快門閃光）
 * 2.8–6.3s  MBTI 專屬精靈圖鑑分析卡 3D 翻牌：「行動派綠色鬥士」
 * 6.3–10s   兩台手機靠近 → 「好友羈絆 buff」粒子連線
 */

/** AR 錨點：示意板中 4 位學生手機上方（實拍時替換為追蹤資料） */
const AR_ANCHORS: {x: number; y: number; k: HeartKey}[] = [
	{x: 900, y: 860, k: 'E'},
	{x: 1500, y: 900, k: 'H'},
	{x: 2300, y: 860, k: 'R'},
	{x: 2900, y: 900, k: 'T'},
];

const SHUTTER = sec(1.9);
const CARD_AT = sec(2.8);
const BOND_START = sec(6.3);

const ArSpirit: React.FC<{x: number; y: number; k: HeartKey; delay: number}> = ({x, y, k, delay}) => {
	const frame = useCurrentFrame();
	const s = sp(frame, delay, SPRINGS.pop);
	const hover = Math.sin((frame + delay * 3) / 20) * 24;
	const bracket = interpolate(frame - delay, [0, 16], [1.6, 1], clamp);
	return (
		<div style={{position: 'absolute', left: x - 200, top: y - 200 + hover, width: 400, height: 400}}>
			{/* AR 追蹤框 */}
			<div
				style={{
					position: 'absolute',
					inset: -40,
					transform: `scale(${bracket})`,
					opacity: s * 0.9,
					border: `4px solid ${HEART[k].color}`,
					borderRadius: 30,
					WebkitMaskImage: 'linear-gradient(90deg, black 18%, transparent 18% 82%, black 82%), linear-gradient(180deg, black 18%, transparent 18% 82%, black 82%)',
					maskImage: 'linear-gradient(90deg, black 18%, transparent 18% 82%, black 82%), linear-gradient(180deg, black 18%, transparent 18% 82%, black 82%)',
					WebkitMaskComposite: 'source-in',
					maskComposite: 'intersect',
				}}
			/>
			<div style={{transform: `scale(${s})`}}>
				<Spirit size={400} color={HEART[k].color} glow={HEART[k].glow} level={3} />
			</div>
			{/* 落地陰影：讓虛擬角色「站」在實景 */}
			<div style={{position: 'absolute', left: 90, top: 420 - hover, width: 220, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', filter: 'blur(10px)', opacity: s}} />
		</div>
	);
};

/** IG / Threads 限動 AR 濾鏡框 */
const StoryFrame: React.FC = () => {
	const frame = useCurrentFrame();
	const op = envelope(frame, 10, 30, CARD_AT - 10, CARD_AT + 10);
	return (
		<div style={{position: 'absolute', inset: '300px 300px', opacity: op, fontFamily: FONT_UI, color: '#fff'}}>
			<div style={{position: 'absolute', inset: 0, border: '5px solid rgba(255,255,255,0.85)', borderRadius: 60}} />
			<div style={{position: 'absolute', top: 40, left: 60, display: 'flex', gap: 20, alignItems: 'center', fontSize: 52, fontWeight: 800}}>
				<div style={{width: 90, height: 90, borderRadius: '50%', background: 'conic-gradient(#feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5, #feda75)', padding: 6}}>
					<div style={{width: '100%', height: '100%', borderRadius: '50%', background: HEART.E.color}} />
				</div>
				nanshan_heart ・ AR 濾鏡「永續小精靈」
			</div>
			<div style={{position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center', fontSize: 84, fontWeight: 900, textShadow: '0 4px 20px rgba(0,0,0,0.6)'}}>
				#南山永續小精靈
			</div>
			<div style={{position: 'absolute', bottom: 190, left: '50%', marginLeft: -80, width: 160, height: 160, borderRadius: '50%', border: '10px solid #fff', boxSizing: 'border-box'}} />
		</div>
	);
};

export const Scene3Social: React.FC = () => {
	const frame = useCurrentFrame();
	const flash = interpolate(frame, [SHUTTER, SHUTTER + 3, SHUTTER + 18], [0, 1, 0], clamp);
	const dim = interpolate(frame, [CARD_AT - 10, CARD_AT + 20, BOND_START, BOND_START + 30], [0, 0.45, 0.45, 0.65], clamp);
	const arOut = interpolate(frame, [CARD_AT + 20, CARD_AT + 50], [1, 0], clamp);

	return (
		<AbsoluteFill>
			<LiveFootage footage="s3Friends" grade="goldenDay" camera={{from: [0, 40, 1.1], to: [-120, 0, 1.24]}} />
			<AbsoluteFill style={{opacity: arOut}}>
				{AR_ANCHORS.map((a, i) => (
					<ArSpirit key={a.k} {...a} delay={20 + i * 8} />
				))}
				<StoryFrame />
			</AbsoluteFill>
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
			<AbsoluteFill style={{background: `rgba(2,10,8,${dim})`, backdropFilter: `blur(${dim * 20}px)`}} />

			{/* MBTI 精靈圖鑑：主卡 + 次卡 */}
			<AbsoluteFill style={{opacity: interpolate(frame, [BOND_START - 20, BOND_START], [1, 0], clamp)}}>
				<MbtiCard
					x={1960}
					y={330}
					enterAt={CARD_AT}
					title="行動派綠色鬥士"
					code="E-042"
					main="E"
					stats={{H: 72, E: 96, A: 64, R: 58, T: 70}}
					tagline="最常完成：自備環保杯・大眾運輸・淨灘"
				/>
				<div style={{position: 'absolute', left: 300, top: 640, transform: 'scale(0.72)', transformOrigin: 'left top', opacity: 0.9}}>
					<MbtiCard
						x={0}
						y={0}
						enterAt={CARD_AT + 24}
						title="防詐智力擔當"
						code="R-117"
						main="R"
						stats={{H: 55, E: 60, A: 62, R: 98, T: 74}}
						tagline="最常完成：假投資辨識・釣魚網站挑戰"
					/>
				</div>
			</AbsoluteFill>

			{frame >= BOND_START - 5 ? <BondLink start={BOND_START} linkAt={BOND_START + sec(1.4)} /> : null}
			<ParticleField seed="s3" count={30} colors={[HEART.E.color, HEART.R.color, '#fff']} speed={1.2} opacity={0.5} />
		</AbsoluteFill>
	);
};
