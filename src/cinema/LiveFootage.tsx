import React from 'react';
import {AbsoluteFill, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, Video} from 'remotion';
import {FOOTAGE, FootageKey, FootageSpec, footageSource, footageSrc} from '../config/footage';
import {clamp, EASE} from '../lib/anim';
import {ProceduralPlate} from './ProceduralPlate';

/** 調色 LUT 近似（CSS filter + 色彩疊層），對 Log 素材做一級調色 */
export const GRADES = {
	/** 暖陽校園：金黃高光、青綠陰影 */
	goldenDay: {filter: 'contrast(1.12) saturate(1.18) brightness(1.04) sepia(0.08)', tint: 'linear-gradient(180deg, rgba(255,190,110,0.18), rgba(0,120,110,0.12))', blend: 'soft-light'},
	/** 蒙太奇：Teal & Orange 商業片色調 */
	tealOrange: {filter: 'contrast(1.18) saturate(1.25)', tint: 'linear-gradient(135deg, rgba(255,140,60,0.20), rgba(0,140,160,0.22))', blend: 'soft-light'},
	/** Boss 戰：低光度冷調 */
	lowKey: {filter: 'contrast(1.3) saturate(0.75) brightness(0.55) hue-rotate(-8deg)', tint: 'linear-gradient(180deg, rgba(20,30,90,0.55), rgba(0,0,0,0.6))', blend: 'multiply'},
	neutral: {filter: 'none', tint: 'transparent', blend: 'normal'},
} as const;

export type GradeKey = keyof typeof GRADES;

export type CameraMove = {
	/** [translateX(px), translateY(px), scale] 起訖 — 在素材上再疊一層數位運鏡 */
	from: [number, number, number];
	to: [number, number, number];
	/** 運鏡持續 frame 數（預設 = Sequence 長度） */
	duration?: number;
};

type Props = {
	footage: FootageKey;
	grade?: GradeKey;
	camera?: CameraMove;
	/** CSS mask-image：用於實景與 3D UI 的遮罩合成（例如只露出手機螢幕區） */
	mask?: string;
	playbackRate?: number;
	/** 預設 OffthreadVideo（算圖逐格精準）；設 'html5' 改用 <Video>（Studio 預覽較流暢） */
	engine?: 'offthread' | 'html5';
	/** 強制使用示意實景板 */
	forcePlate?: boolean;
	style?: React.CSSProperties;
};

/**
 * 實景素材層：<Video>/<OffthreadVideo> + 數位運鏡 + 調色 + 遮罩。
 * 素材缺漏時自動退回 ProceduralPlate，保證專案可直接編譯算圖。
 */
export const LiveFootage: React.FC<Props> = ({
	footage,
	grade = 'goldenDay',
	camera,
	mask,
	playbackRate = 1,
	engine = 'offthread',
	forcePlate = false,
	style,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const spec: FootageSpec = FOOTAGE[footage];
	const source = forcePlate ? 'plate' : footageSource(footage);
	const g = GRADES[grade];

	const d = camera?.duration ?? durationInFrames;
	const t = interpolate(frame, [0, d], [0, 1], {...clamp, easing: EASE.cine});
	const [x, y, s] = camera
		? ([0, 1, 2] as const).map((i) => camera.from[i] + (camera.to[i] - camera.from[i]) * t)
		: [0, 0, 1];

	const maskStyle: React.CSSProperties = mask ? {WebkitMaskImage: mask, maskImage: mask} : {};
	const videoStyle: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', filter: g.filter};
	const trimBefore = spec.trimBefore;

	return (
		<AbsoluteFill style={{overflow: 'hidden', ...maskStyle, ...style}}>
			<AbsoluteFill style={{transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: '50% 50%'}}>
				{source === 'plate' ? (
					<AbsoluteFill style={{filter: g.filter}}>
						<ProceduralPlate kind={spec.plate} />
					</AbsoluteFill>
				) : source === 'still' && spec.still ? (
					<Img src={staticFile(spec.still)} style={videoStyle} />
				) : engine === 'offthread' ? (
					<OffthreadVideo src={footageSrc(footage)} muted trimBefore={trimBefore} playbackRate={playbackRate} style={videoStyle} />
				) : (
					<Video src={footageSrc(footage)} muted trimBefore={trimBefore} playbackRate={playbackRate} style={videoStyle} />
				)}
			</AbsoluteFill>
			{/* 調色疊層 */}
			<AbsoluteFill style={{background: g.tint, mixBlendMode: g.blend as React.CSSProperties['mixBlendMode']}} />
		</AbsoluteFill>
	);
};
