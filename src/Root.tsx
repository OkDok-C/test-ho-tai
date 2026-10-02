import React from 'react';
import {Composition} from 'remotion';
import {FilmProps, NanshanHeartFilm} from './NanshanHeartFilm';
import {DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH} from './config/timeline';

const defaultProps: FilmProps = {letterbox: true, debugOverlay: false};

export const RemotionRoot: React.FC = () => (
	<>
		{/* 主片：Cinematic 4K UHD 3840×2160 / 60 FPS / 60 秒 */}
		<Composition
			id="NanshanHeartFilm"
			component={NanshanHeartFilm}
			durationInFrames={DURATION_IN_FRAMES}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={defaultProps}
		/>
		{/* 導演審片版：含安全框與時間碼 */}
		<Composition
			id="NanshanHeartFilm-Review"
			component={NanshanHeartFilm}
			durationInFrames={DURATION_IN_FRAMES}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={{letterbox: true, debugOverlay: true}}
		/>
	</>
);
