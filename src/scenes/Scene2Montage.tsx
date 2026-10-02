import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {CameraMove, GradeKey, LiveFootage} from '../cinema/LiveFootage';
import {FootageKey} from '../config/footage';
import {HEART, HeartKey, FONT_MONO, FONT_UI} from '../config/theme';
import {sec, XFADE} from '../config/timeline';
import {Burst, ParticleField} from '../fx/Particles';
import {clamp, EASE} from '../lib/anim';
import {BadgeRow, EnergyCounter} from '../ui/EnergyHUD';
import {HoloPanel} from '../ui/HoloPanel';
import {Spirit} from '../ui/Spirit';

/**
 * 場景二｜HEART 五大屬性融入日常（0:10 – 0:25，900f）
 * 快節奏蒙太奇：每個屬性 2 個鏡位（寬→緊），以甩鏡（whip pan）切換。
 *   E 地球守護   0.0–4.3s  結盟商圈・自備環保杯
 *   H 健康促進   4.3–8.8s  操場夜跑・步數
 *   T 人才賦能   8.8–13.2s 南山大學實體課程
 *   A / R 閃切  13.2–15s  淨灘志工 / 防詐辨識（節奏收尾，五徽章全亮）
 * HUD：LINE 任務介面 → 3D AR 全息投影；HEART Energy 持續累積、徽章逐一解鎖。
 */

type Shot = {
	key: HeartKey;
	footage: FootageKey;
	from: number;
	dur: number;
	grade: GradeKey;
	cams: [CameraMove, CameraMove];
	task: string;
	detail: string;
	reward: number;
	extra?: React.ReactNode;
};

const SHOTS: Shot[] = [
	{
		key: 'E',
		footage: 's2Earth',
		from: 0,
		dur: sec(4.3),
		grade: 'tealOrange',
		cams: [
			{from: [0, 0, 1.05], to: [-80, 0, 1.12]},
			{from: [0, -120, 1.6], to: [0, -160, 1.75]},
		],
		task: '自備環保杯・結盟商圈消費',
		detail: '南山精靈優惠已套用 ✔',
		reward: 120,
	},
	{
		key: 'H',
		footage: 's2Health',
		from: sec(4.3),
		dur: sec(4.5),
		grade: 'tealOrange',
		cams: [
			{from: [0, 0, 1.08], to: [120, -40, 1.16]},
			{from: [200, -200, 1.5], to: [260, -220, 1.62]},
		],
		task: '今日步數 8,452 / 8,000',
		detail: '連續達標 7 天 🔥',
		reward: 150,
	},
	{
		key: 'T',
		footage: 's2Talent',
		from: sec(8.8),
		dur: sec(4.4),
		grade: 'goldenDay',
		cams: [
			{from: [-60, 0, 1.06], to: [60, 0, 1.1]},
			{from: [600, 120, 1.55], to: [560, 100, 1.65]},
		],
		task: '南山大學・精靈升級副本',
		detail: '領導力工作坊 通關 ✔',
		reward: 200,
	},
	{
		key: 'A',
		footage: 's3Friends',
		from: sec(13.2),
		dur: sec(0.9),
		grade: 'tealOrange',
		cams: [
			{from: [0, 0, 1.2], to: [-60, 0, 1.25]},
			{from: [0, 0, 1.25], to: [0, 0, 1.25]},
		],
		task: '淨灘志工 2 小時',
		detail: '關懷行動 ✔',
		reward: 180,
	},
	{
		key: 'R',
		footage: 's4Night',
		from: sec(14.1),
		dur: sec(0.9),
		grade: 'tealOrange',
		cams: [
			{from: [0, 0, 1.3], to: [60, 0, 1.35]},
			{from: [0, 0, 1.35], to: [0, 0, 1.35]},
		],
		task: '辨識假投資・釣魚網站',
		detail: '防詐答題 10/10 ✔',
		reward: 160,
	},
];

/** 甩鏡轉場：方向性動態模糊 + 亮帶 */
const WhipPan: React.FC<{at: number}> = ({at}) => {
	const frame = useCurrentFrame();
	const t = interpolate(frame, [at - 7, at + 7], [0, 1], clamp);
	if (t <= 0 || t >= 1) return null;
	const k = Math.sin(t * Math.PI);
	return (
		<AbsoluteFill
			style={{
				background: `linear-gradient(90deg, transparent ${t * 100 - 40}%, rgba(255,255,255,${0.75 * k}) ${t * 100}%, transparent ${t * 100 + 40}%)`,
				backdropFilter: `blur(${k * 40}px)`,
				mixBlendMode: 'screen',
			}}
		/>
	);
};

const TaskCard: React.FC<{shot: Shot; total: number}> = ({shot, total}) => {
	const h = HEART[shot.key];
	const short = shot.dur < sec(2);
	const frame = useCurrentFrame();
	const check = interpolate(frame, [shot.from + 40, shot.from + 60], [0, 1], clamp);
	return (
		<HoloPanel
			x={short ? 2280 : 2240}
			y={380}
			width={1300}
			height={short ? 520 : 760}
			enterAt={shot.from + (short ? 2 : 12)}
			exitAt={shot.from + shot.dur - 10}
			accent={h.color}
			rotY={-16}
		>
			<div style={{padding: '56px 70px'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 26, fontSize: 46, letterSpacing: '0.18em', opacity: 0.85}}>
					<span style={{background: '#06C755', color: '#fff', borderRadius: 14, padding: '6px 18px', fontWeight: 900, letterSpacing: 0}}>LINE</span>
					HEART 任務 ・ DAY {Math.min(30, 3 + Math.round(total / 120))}
				</div>
				<div style={{marginTop: 30, fontSize: 64, color: h.color, fontWeight: 900}}>
					{shot.key} ｜ {h.en} {h.pillar}
				</div>
				<div style={{marginTop: 18, fontSize: 82, fontWeight: 900, lineHeight: 1.15}}>{shot.task}</div>
				{!short ? (
					<>
						<div style={{marginTop: 26, fontSize: 52, opacity: 0.85}}>{shot.detail}</div>
						<div style={{marginTop: 40, display: 'flex', alignItems: 'center', gap: 30}}>
							<div
								style={{
									width: 96,
									height: 96,
									borderRadius: '50%',
									background: check > 0.5 ? h.color : 'transparent',
									border: `6px solid ${h.color}`,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: 64,
									transform: `scale(${1 + Math.sin(check * Math.PI) * 0.3})`,
								}}
							>
								{check > 0.5 ? '✓' : ''}
							</div>
							<div style={{fontFamily: FONT_MONO, fontSize: 88, fontWeight: 800, color: HEART.T.color, opacity: check}}>+{shot.reward} ⚡</div>
						</div>
					</>
				) : (
					<div style={{marginTop: 22, fontFamily: FONT_MONO, fontSize: 70, color: HEART.T.color}}>+{shot.reward} ⚡</div>
				)}
			</div>
		</HoloPanel>
	);
};

export const Scene2Montage: React.FC = () => {
	const frame = useCurrentFrame();

	// 能量累積關鍵格：每個任務打勾後 +reward
	let acc = 860;
	const energyKeys: [number, number][] = [[0, acc]];
	SHOTS.forEach((s) => {
		const done = s.from + (s.dur < sec(2) ? 20 : 50);
		energyKeys.push([done, acc]);
		acc += s.reward;
		energyKeys.push([done + 30, acc]);
	});
	const unlocks = Object.fromEntries(SHOTS.map((s) => [s.key, s.from + (s.dur < sec(2) ? 24 : 60)])) as Record<HeartKey, number>;
	const current = [...SHOTS].reverse().find((s) => frame >= s.from) ?? SHOTS[0];
	const unlockedCount = SHOTS.filter((s) => frame >= unlocks[s.key]).length;
	const totalNow = interpolate(frame, energyKeys.map((k) => k[0]), energyKeys.map((k) => k[1]), clamp);

	return (
		<AbsoluteFill style={{background: '#000'}}>
			{SHOTS.map((s, i) => {
				const half = Math.round(s.dur / 2);
				const isLast = i === SHOTS.length - 1;
				return (
					<React.Fragment key={s.key}>
						<Sequence from={s.from} durationInFrames={half} name={`${s.key} wide`}>
							<LiveFootage footage={s.footage} grade={s.grade} camera={s.cams[0]} />
						</Sequence>
						<Sequence from={s.from + half} durationInFrames={s.dur - half + (isLast ? XFADE : 0)} name={`${s.key} tight`}>
							<LiveFootage footage={s.footage} grade={s.grade} camera={s.cams[1]} />
						</Sequence>
					</React.Fragment>
				);
			})}

			{/* 屬性色光暈：每次切到新屬性時，邊框染色 */}
			<AbsoluteFill
				style={{
					boxShadow: `inset 0 0 ${260 + Math.sin(frame / 6) * 40}px ${HEART[current.key].glow}`,
					opacity: 0.45,
				}}
			/>

			{SHOTS.slice(1).map((s) => (
				<WhipPan key={s.key} at={s.from} />
			))}

			{SHOTS.map((s) => (
				<React.Fragment key={s.key}>
					<TaskCard shot={s} total={totalNow} />
					<Burst x={2900} y={1000} at={unlocks[s.key]} seed={`b2${s.key}`} colors={[HEART[s.key].color, '#fff']} count={40} power={700} />
				</React.Fragment>
			))}

			{/* 左下：HEART Energy + 進化中的精靈 */}
			<div style={{position: 'absolute', left: 240, top: 1310}}>
				<Spirit size={420} color={HEART[current.key].color} glow={HEART[current.key].glow} level={1 + unlockedCount} />
			</div>
			<EnergyCounter x={700} y={1360} keyframes={energyKeys} accent={HEART[current.key].color} />

			{/* 右下：徽章列 */}
			<div style={{position: 'absolute', left: 1980, top: 1500, transform: 'scale(0.82)', transformOrigin: 'left top'}}>
				<BadgeRow x={0} y={0} unlocks={unlocks} size={210} />
			</div>

			{/* 精靈升級提示 */}
			{SHOTS.map((s) => {
				const t = interpolate(frame, [unlocks[s.key] + 10, unlocks[s.key] + 25, unlocks[s.key] + 55, unlocks[s.key] + 70], [0, 1, 1, 0], {...clamp, easing: EASE.out});
				if (t <= 0) return null;
				return (
					<div key={s.key} style={{position: 'absolute', left: 300, top: 1180 - t * 40, opacity: t, fontFamily: FONT_UI, fontSize: 64, fontWeight: 900, color: HEART[s.key].color, textShadow: `0 0 30px ${HEART[s.key].glow}, 0 4px 16px rgba(0,0,0,0.7)`}}>
						LEVEL UP ▲ {HEART[s.key].zh}徽章解鎖
					</div>
				);
			})}

			<ParticleField seed="s2" count={40} colors={[HEART[current.key].color, '#ffffff']} speed={3} size={[4, 14]} opacity={0.6} />
		</AbsoluteFill>
	);
};
