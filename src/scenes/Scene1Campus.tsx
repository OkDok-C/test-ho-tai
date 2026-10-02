import React from 'react';
import {AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {LensFlare} from '../cinema/CinematicFinish';
import {LiveFootage} from '../cinema/LiveFootage';
import {footageSource, hasStaticAsset} from '../config/footage';
import {HEART, FONT_UI, SLOGAN} from '../config/theme';
import {sec, XFADE} from '../config/timeline';
import {Burst, ParticleField} from '../fx/Particles';
import {clamp, EASE, envelope, progress, SPRINGS, sp} from '../lib/anim';
import {LiquidMetalText} from '../ui/LiquidMetalText';
import {Spirit} from '../ui/Spirit';

/**
 * 場景一｜破題與校園快閃（0:00 – 0:10，600f）
 * Shot 1A 0–5.5s  斯坦尼康平移（Pan L→R）帶出木構「永續精靈補給站」+ AR 地標 + 參與流程晶片
 * Shot 1B 5.5–10s 扭蛋機特寫：膠囊彈出 → 精靈誕生 → 種子盆栽 → 流體金屬主標語
 */
const CUT_1B = sec(5.5);
const POP = CUT_1B + sec(0.9);
const SLOGAN_AT = CUT_1B + sec(2.1);

const FlowChip: React.FC<{label: string; color: string; at: number; i: number; photo?: string}> = ({label, color, at, i, photo}) => {
	const frame = useCurrentFrame();
	const s = sp(frame, at, SPRINGS.holo);
	const showPhoto = photo && hasStaticAsset(photo);
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24}}>
			{showPhoto ? (
				<div
					style={{
						width: 600,
						height: 420,
						borderRadius: 32,
						overflow: 'hidden',
						border: `4px solid ${color}`,
						boxShadow: `0 0 50px ${color}99, 0 30px 60px rgba(0,0,0,0.45)`,
						transform: `translateY(${(1 - s) * 120}px) rotateY(-18deg) scale(${0.7 + 0.3 * s})`,
						opacity: s,
					}}
				>
					<Img src={staticFile(photo)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.08 - 0.08 * s})`}} />
				</div>
			) : null}
		<div
			style={{
				transform: `translateY(${(1 - s) * 60}px) rotateY(-18deg)`,
				opacity: s,
				padding: '26px 54px',
				borderRadius: 999,
				border: `3px solid ${color}`,
				background: 'rgba(8,20,14,0.45)',
				backdropFilter: 'blur(18px)',
				boxShadow: `0 0 40px ${color}88`,
				color: '#fff',
				fontFamily: FONT_UI,
				fontSize: 58,
				fontWeight: 800,
				whiteSpace: 'nowrap',
			}}
		>
			<span style={{color, marginRight: 18, fontFamily: 'monospace'}}>0{i + 1}</span>
			{label}
		</div>
		</div>
	);
};

export const Scene1Campus: React.FC = () => {
	const frame = useCurrentFrame();
	const tag = sp(frame, sec(1.4), SPRINGS.holo);
	const capsuleDrop = interpolate(frame, [CUT_1B + 10, POP], [-900, 0], {...clamp, easing: EASE.in});
	const capsuleOpen = interpolate(frame, [POP, POP + 14], [0, 1], clamp);
	const spirit = sp(frame, POP + 4, SPRINGS.pop);
	const pot = sp(frame, POP + sec(0.6), SPRINGS.holo);
	const dim = interpolate(frame, [SLOGAN_AT - 20, SLOGAN_AT + 30], [0, 0.55], clamp);
	// AR 地標追蹤：與 LiveFootage 數位運鏡使用相同曲線（實拍時改用 After Effects / Mocha 追蹤資料）
	const panT = progress(frame, 0, CUT_1B);
	const panX = 300 - 600 * panT;
	const panY = 20 - 30 * panT;
	const panS = 1.14 + 0.04 * panT;
	// 錨點（素材畫面座標）：企劃書實景圖 → 扭蛋機招牌頂；示意板 → 補給站招牌
	const usingStill = footageSource('s1Campus') === 'still';
	const anchor = usingStill ? {x: 1965, y: 727, label: '永續精靈扭蛋機・轉出你的永續夥伴'} : {x: 2050, y: 670, label: '📍 永續精靈補給站 POP-UP'};
	const tagX = 1920 + (anchor.x - 1920) * panS + panX;
	const tagY = 1080 + (anchor.y - 1080) * panS + panY - 370;
	// 1B 推近目標：實景圖中扭蛋機球艙中心 (1965,1132)；示意板中扭蛋機 (1670,1160)
	const gachaCam = usingStill
		? {from: [-90, -104, 1.9] as [number, number, number], to: [-100, -125, 2.08] as [number, number, number]}
		: {from: [520, -120, 1.9] as [number, number, number], to: [470, -160, 2.05] as [number, number, number]};

	return (
		<AbsoluteFill style={{background: '#000'}}>
			{/* Shot 1A：平移運鏡 */}
			<Sequence durationInFrames={CUT_1B} name="1A Campus Pan" layout="none">
				<LiveFootage footage="s1Campus" grade="goldenDay" camera={{from: [300, 20, 1.14], to: [-300, -10, 1.18]}} />
				<LensFlare x={interpolate(frame, [0, CUT_1B], [700, 400])} y={300} intensity={0.9} />
				{/* AR 地標：示意板 → 垂直釘在招牌上方；實景圖 → 水平引線指向扭蛋機（避免遮住實景招牌） */}
				{usingStill ? (
					<div
						style={{
							position: 'absolute',
							left: tagX + 260 * panS,
							top: tagY + 370,
							transform: `scale(${tag})`,
							transformOrigin: 'left center',
							opacity: tag,
							display: 'flex',
							alignItems: 'center',
							fontFamily: FONT_UI,
							color: '#fff',
						}}
					>
						<div style={{width: 26, height: 26, borderRadius: '50%', background: '#9ff0c4', boxShadow: '0 0 30px #2EE59D'}} />
						<div style={{width: 160, height: 4, background: 'linear-gradient(90deg, #9ff0c4, rgba(159,240,196,0.4))'}} />
						<div style={{fontSize: 60, fontWeight: 900, padding: '18px 44px', borderRadius: 30, background: 'rgba(0,132,61,0.8)', border: '3px solid #9ff0c4', boxShadow: '0 0 50px rgba(46,229,157,0.8)', whiteSpace: 'nowrap'}}>
							{anchor.label}
						</div>
					</div>
				) : (
					<div
						style={{
							position: 'absolute',
							left: tagX,
							top: Math.max(290, tagY),
							transform: `translate(-50%, 0) scale(${tag})`,
							opacity: tag,
							fontFamily: FONT_UI,
							color: '#fff',
							textAlign: 'center',
						}}
					>
						<div style={{fontSize: 64, fontWeight: 900, padding: '20px 50px', borderRadius: 30, background: 'rgba(0,132,61,0.75)', border: '3px solid #9ff0c4', boxShadow: '0 0 50px rgba(46,229,157,0.8)'}}>
							{anchor.label}
						</div>
						<div style={{width: 4, height: 220, margin: '0 auto', background: 'linear-gradient(#9ff0c4, transparent)'}} />
					</div>
				)}
				{/* 參與流程：企劃書 STEP 1 */}
				<div style={{position: 'absolute', left: 260, bottom: 340, display: 'flex', gap: 60, alignItems: 'flex-end', perspective: 2000}}>
					<FlowChip i={0} label="1 分鐘防詐挑戰" color={HEART.R.color} at={sec(2.2)} photo="images/detail_antifraud.jpg" />
					<FlowChip i={1} label="HEART 屬性測驗" color={HEART.T.color} at={sec(2.6)} photo="images/detail_heart_quiz.jpg" />
					<FlowChip i={2} label="領取初始精靈" color={HEART.E.color} at={sec(3.0)} photo="images/detail_gacha.jpg" />
				</div>
			</Sequence>

			{/* Shot 1B：扭蛋機特寫（升格素材 / 示意板推近） */}
			<Sequence from={CUT_1B} durationInFrames={sec(10) - CUT_1B + XFADE} name="1B Gacha Close-up">
				<LiveFootage footage="s1Gacha" grade="goldenDay" camera={{...gachaCam, duration: sec(4.5)}} />
			</Sequence>

			{frame >= CUT_1B ? (
				<AbsoluteFill>
					{/* 扭蛋膠囊（CSS 3D 雙半球） */}
					<div style={{position: 'absolute', left: 1920 - 170, top: 1080 - 170 + capsuleDrop, width: 340, height: 340, opacity: 1 - capsuleOpen}}>
						<div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', transform: `rotate(${frame * 4}deg)`, boxShadow: '0 30px 80px rgba(0,0,0,0.4)'}}>
							<div style={{height: '50%', background: `linear-gradient(180deg, #ff8a95, ${HEART.H.color})`}} />
							<div style={{height: '50%', background: 'linear-gradient(180deg, #ffffff, #d8e2ea)'}} />
						</div>
					</div>
					<Burst x={1920} y={1080} at={POP} seed="gacha" colors={[HEART.E.color, HEART.T.color, '#ffffff', HEART.H.color]} count={90} power={1300} />
					<div style={{position: 'absolute', left: 1920 - 380, top: 1080 - 520, transform: `scale(${spirit}) translateY(${(1 - spirit) * 200}px)`, opacity: Math.min(1, spirit * 2) * (1 - dim * 1.4)}}>
						<Spirit size={760} color={HEART.E.color} glow={HEART.E.glow} level={1} />
					</div>
					{/* 精靈種子盆栽 UI 標籤 */}
					<div
						style={{
							position: 'absolute',
							left: 2650,
							top: 860,
							transform: `scale(${pot})`,
							opacity: pot * (1 - dim * 1.4),
							padding: '30px 50px',
							borderRadius: 40,
							background: 'rgba(255,255,255,0.14)',
							backdropFilter: 'blur(20px)',
							border: `3px solid ${HEART.E.color}`,
							color: '#fff',
							fontFamily: FONT_UI,
							fontSize: 56,
							fontWeight: 800,
							boxShadow: `0 0 50px ${HEART.E.glow}`,
						}}
					>
						{hasStaticAsset('images/detail_seed_pots.jpg') ? (
							<Img src={staticFile('images/detail_seed_pots.jpg')} style={{display: 'block', width: 560, height: 370, objectFit: 'cover', borderRadius: 24, marginBottom: 24}} />
						) : null}
						🌱 精靈種子盆栽 ×1
						<div style={{fontSize: 40, opacity: 0.8, fontWeight: 500}}>LINE 綁定・30 天一起長大</div>
					</div>
					<ParticleField seed="s1" count={50} colors={['#fff4c9', HEART.E.color]} speed={1.5} opacity={envelope(frame, POP, POP + 30, 9999, 10000)} />
				</AbsoluteFill>
			) : null}

			{/* 主視覺標語：流體金屬 */}
			<AbsoluteFill style={{background: `radial-gradient(ellipse at center, rgba(0,0,0,${dim}), rgba(0,0,0,${dim * 0.4}) 70%)`}} />
			{frame >= SLOGAN_AT - 2 ? (
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
					<LiquidMetalText id="slogan" text={SLOGAN} fontSize={200} enterAt={SLOGAN_AT} tone="chrome" stagger={4} />
					<div
						style={{
							marginTop: 50,
							fontFamily: FONT_UI,
							fontSize: 68,
							letterSpacing: '0.4em',
							color: '#e9fff3',
							opacity: interpolate(frame, [SLOGAN_AT + 60, SLOGAN_AT + 100], [0, 1], clamp),
						}}
					>
						南山 HEART × 30 天永續精靈養成挑戰
					</div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};
