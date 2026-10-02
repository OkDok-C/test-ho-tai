import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {CinematicFinish, SceneFade} from './cinema/CinematicFinish';
import {BGM_FILE, hasStaticAsset} from './config/footage';
import {DURATION_IN_FRAMES, SCENES, SceneKey, XFADE, sec} from './config/timeline';
import {Scene1Campus} from './scenes/Scene1Campus';
import {Scene2Montage} from './scenes/Scene2Montage';
import {Scene3Social} from './scenes/Scene3Social';
import {Scene4BossForest} from './scenes/Scene4BossForest';
import {Scene5Brand} from './scenes/Scene5Brand';
import {clamp} from './lib/anim';
import {useFonts} from './fonts';

export type FilmProps = {
	/** 是否顯示 2.39:1 遮幅 */
	letterbox: boolean;
	/** 是否顯示安全框/場景標籤（導演審片用） */
	debugOverlay: boolean;
};

const ORDER: {key: SceneKey; Comp: React.FC}[] = [
	{key: 's1', Comp: Scene1Campus},
	{key: 's2', Comp: Scene2Montage},
	{key: 's3', Comp: Scene3Social},
	{key: 's4', Comp: Scene4BossForest},
	{key: 's5', Comp: Scene5Brand},
];

/**
 * 主時間軸
 * ─ 每個場景 Sequence 尾端延長 XFADE 格墊在下一場景之下，下一場景以 SceneFade 淡入 → 無黑幀交叉溶接
 * ─ 場景四→五依腳本「實景畫面漸暗」：場景五淡入時間加長為 1 秒
 * ─ 最上層 CinematicFinish：遮幅、顆粒、暗角、halation
 */
export const NanshanHeartFilm: React.FC<FilmProps> = ({letterbox, debugOverlay}) => {
	const frame = useCurrentFrame();
	useFonts();
	// 片頭由黑淡入、片尾最後 0.5 秒保持定格（不淡出，方便剪輯接 end card）
	const head = interpolate(frame, [0, sec(0.6)], [0, 1], clamp);
	const bgm = hasStaticAsset(BGM_FILE);

	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{opacity: head}}>
				{ORDER.map(({key, Comp}, i) => {
					const sc = SCENES[key];
					const isLast = i === ORDER.length - 1;
					const fadeIn = i === 0 ? 0 : key === 's5' ? sec(1) : XFADE;
					return (
						<Sequence key={key} from={sc.from} durationInFrames={sc.duration + (isLast ? 0 : XFADE)} name={`${key} ${sc.title}`}>
							<SceneFade fadeIn={fadeIn}>
								<Comp />
							</SceneFade>
						</Sequence>
					);
				})}
			</AbsoluteFill>

			<CinematicFinish letterbox={letterbox ? 1 : 0} />

			{bgm ? (
				<Audio
					src={staticFile(BGM_FILE)}
					volume={(f) => interpolate(f, [0, sec(1), DURATION_IN_FRAMES - sec(2), DURATION_IN_FRAMES], [0, 0.9, 0.9, 0], clamp)}
				/>
			) : null}

			{debugOverlay ? <DebugOverlay /> : null}
		</AbsoluteFill>
	);
};

const DebugOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const cur = ORDER.find(({key}) => frame >= SCENES[key].from && frame < SCENES[key].from + SCENES[key].duration);
	const t = frame / 60;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div style={{position: 'absolute', inset: '5% 5%', border: '3px dashed rgba(255,255,0,0.6)'}} />
			<div style={{position: 'absolute', left: 60, top: 60, color: '#ff0', fontSize: 48, fontFamily: 'monospace', background: 'rgba(0,0,0,0.6)', padding: 16}}>
				{cur ? `${cur.key.toUpperCase()} ${SCENES[cur.key].title}` : ''} ｜ {Math.floor(t / 60)}:{(t % 60).toFixed(2).padStart(5, '0')} ｜ f{frame}
			</div>
		</AbsoluteFill>
	);
};
