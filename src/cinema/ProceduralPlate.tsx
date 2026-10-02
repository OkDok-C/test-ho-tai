import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import type {PlateKind} from '../config/footage';
import {FONT_DISPLAY} from '../config/theme';

/**
 * 示意實景板（Pre-viz plate）
 * ─ 在實拍素材到位前，以程序化 SVG 模擬各場景的光線、景深與構圖，
 *   讓導演/剪輯可先確認 3D UI 疊加位置與節奏（等同 animatic）。
 * ─ 實拍素材放入 public/footage/ 後自動被 <LiveFootage> 取代。
 */
export const ProceduralPlate: React.FC<{kind: PlateKind}> = ({kind}) => {
	switch (kind) {
		case 'campus-day':
			return <CampusDay />;
		case 'cafe':
			return <Cafe />;
		case 'track':
			return <Track />;
		case 'classroom':
			return <Classroom />;
		case 'friends':
			return <Friends />;
		case 'night-campus':
			return <NightCampus />;
		default:
			return null;
	}
};

const W = 3840;
const H = 2160;

const Svg: React.FC<{children: React.ReactNode; blur?: number}> = ({children, blur = 0}) => (
	<svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', filter: blur ? `blur(${blur}px)` : undefined}}>
		{children}
	</svg>
);

/** 淺景深光斑 */
const Bokeh: React.FC<{seed: string; count: number; color: string; opacity?: number}> = ({seed, count, color, opacity = 0.35}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{mixBlendMode: 'screen'}}>
			{new Array(count).fill(0).map((_, i) => {
				const r = 40 + random(`${seed}-r-${i}`) * 140;
				const x = random(`${seed}-x-${i}`) * W + Math.sin(frame / 90 + i) * 30;
				const y = random(`${seed}-y-${i}`) * H - frame * (0.2 + random(`${seed}-v-${i}`) * 0.4);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x - r,
							top: ((y % H) + H) % H - r,
							width: r * 2,
							height: r * 2,
							borderRadius: '50%',
							background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
							opacity: opacity * (0.4 + random(`${seed}-o-${i}`) * 0.6),
							filter: 'blur(4px)',
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

/** 人物剪影 */
const Person: React.FC<{x: number; y: number; s?: number; fill?: string; phone?: string; bob?: number}> = ({x, y, s = 1, fill = '#1b2a22', phone, bob = 0}) => (
	<g transform={`translate(${x}, ${y + bob}) scale(${s})`}>
		<circle cx={0} cy={-520} r={70} fill={fill} />
		<rect x={-110} y={-440} width={220} height={420} rx={90} fill={fill} />
		<rect x={-80} y={-40} width={70} height={300} rx={30} fill={fill} />
		<rect x={10} y={-40} width={70} height={300} rx={30} fill={fill} />
		{phone ? (
			<g>
				<rect x={60} y={-380} width={60} height={110} rx={10} fill={phone} />
				<circle cx={90} cy={-325} r={160} fill={phone} opacity={0.18} />
			</g>
		) : null}
	</g>
);

/** 陽光 God rays */
const GodRays: React.FC<{x: number; y: number; color?: string}> = ({x, y, color = 'rgba(255,230,170,0.22)'}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				mixBlendMode: 'screen',
				background: `repeating-conic-gradient(from ${frame * 0.03}deg at ${(x / W) * 100}% ${(y / H) * 100}%, ${color} 0deg 3deg, transparent 3deg 9deg)`,
				WebkitMaskImage: `radial-gradient(circle at ${(x / W) * 100}% ${(y / H) * 100}%, black 0%, transparent 65%)`,
				maskImage: `radial-gradient(circle at ${(x / W) * 100}% ${(y / H) * 100}%, black 0%, transparent 65%)`,
				filter: 'blur(10px)',
			}}
		/>
	);
};

const Trees: React.FC<{y: number; seed: string; count: number; color: string; scale?: number}> = ({y, seed, count, color, scale = 1}) => (
	<g>
		{new Array(count).fill(0).map((_, i) => {
			const x = (i / count) * W + random(`${seed}${i}`) * 200;
			const r = (180 + random(`${seed}r${i}`) * 160) * scale;
			return (
				<g key={i}>
					<rect x={x - 18 * scale} y={y - r * 0.4} width={36 * scale} height={r * 1.2} fill="#2b1d12" />
					<circle cx={x} cy={y - r} r={r} fill={color} />
					<circle cx={x - r * 0.6} cy={y - r * 0.7} r={r * 0.7} fill={color} />
					<circle cx={x + r * 0.6} cy={y - r * 0.75} r={r * 0.65} fill={color} />
				</g>
			);
		})}
	</g>
);

/** 場景一：南部校園 + 木質「永續精靈補給站」快閃店 */
const CampusDay: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, #9fd3ff 0%, #ffe3b0 55%, #f3c98a 100%)'}} />
			<Svg blur={8}>
				{/* 遠景校舍 */}
				{[0, 1, 2, 3, 4].map((i) => (
					<g key={i}>
						<rect x={i * 820 - 100} y={620 + (i % 2) * 60} width={760} height={700} fill="#d8c3a5" />
						{new Array(18).fill(0).map((_, j) => (
							<rect key={j} x={i * 820 - 60 + (j % 6) * 120} y={700 + (i % 2) * 60 + Math.floor(j / 6) * 170} width={70} height={100} fill="#8fb4c9" opacity={0.7} />
						))}
					</g>
				))}
				<Trees y={1350} seed="far" count={11} color="#3f8a4f" />
			</Svg>
			<GodRays x={520} y={260} />
			<Svg blur={2}>
				{/* 草地與步道 */}
				<rect x={0} y={1400} width={W} height={760} fill="#6fae56" />
				<polygon points={`1500,1400 2300,1400 3400,${H} 400,${H}`} fill="#e8d6b5" />
				{/* 永續精靈補給站：木構快閃店 */}
				<g transform="translate(2050, 1500)">
					<rect x={-760} y={-760} width={1520} height={760} fill="#b07a45" />
					{new Array(14).fill(0).map((_, i) => (
						<rect key={i} x={-760 + i * 110} y={-760} width={8} height={760} fill="#8a5a2e" />
					))}
					<polygon points="-880,-760 880,-760 760,-940 -760,-940" fill="#2f7d4a" />
					<rect x={-560} y={-900} width={1120} height={120} rx={20} fill="#f6efe2" />
					<text x={0} y={-818} textAnchor="middle" fontSize={80} fontWeight={900} fill="#1f5e37" fontFamily={FONT_DISPLAY}>
						永續精靈補給站
					</text>
					{/* 植栽牆 */}
					{new Array(10).fill(0).map((_, i) => (
						<circle key={i} cx={-700 + i * 155} cy={-700} r={70} fill={i % 2 ? '#3fa35b' : '#58c26f'} />
					))}
					{/* 扭蛋機 */}
					<g transform="translate(-380, -40)">
						<rect x={-150} y={-260} width={300} height={260} rx={30} fill="#e94f5f" />
						<circle cx={0} cy={-420} r={200} fill="rgba(220,245,255,0.75)" stroke="#fff" strokeWidth={12} />
						{['#FF4D5E', '#2EE59D', '#A86BFF', '#3AA8FF', '#FFC83A', '#2EE59D', '#FFC83A'].map((c, i) => (
							<circle key={i} cx={-110 + (i % 4) * 70 + (i > 3 ? 35 : 0)} cy={-360 - (i > 3 ? 80 : 0)} r={40} fill={c} />
						))}
						<circle cx={0} cy={-150} r={50} fill="#ffd166" />
					</g>
					{/* 種子盆栽陳列 */}
					{new Array(6).fill(0).map((_, i) => (
						<g key={i} transform={`translate(${100 + i * 110}, -60)`}>
							<polygon points="-40,0 40,0 30,-80 -30,-80" fill="#c46d3a" />
							<path d={`M0,-80 C -30,-150 -60,-140 -70,-170 M0,-80 C 30,-150 60,-140 70,-170`} stroke="#3fa35b" strokeWidth={14} fill="none" />
						</g>
					))}
				</g>
				{/* 前景學生 */}
				<Person x={1150} y={1880} s={1.2} fill="#24342b" bob={Math.sin(frame / 14) * 6} />
				<Person x={1420} y={1900} s={1.15} fill="#2d3d34" bob={Math.sin(frame / 16 + 1) * 6} />
				<Person x={3150} y={1960} s={1.35} fill="#1c2a22" phone="#9ff" />
			</Svg>
			<Bokeh seed="campus" count={26} color="rgba(255,236,190,0.9)" />
		</AbsoluteFill>
	);
};

const Cafe: React.FC = () => (
	<AbsoluteFill>
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #3a2618 0%, #7a4f2c 60%, #c99561 100%)'}} />
		<Bokeh seed="cafe" count={40} color="rgba(255,200,120,1)" opacity={0.55} />
		<Svg blur={1}>
			<rect x={0} y={1450} width={W} height={710} fill="#5a3a22" />
			<rect x={0} y={1420} width={W} height={50} fill="#8b6040" />
			{/* 自備環保杯（Earth 綠） */}
			<g transform="translate(1920, 1430)">
				<path d="M-210,-620 L210,-620 L170,0 L-170,0 Z" fill="#f2efe6" />
				<rect x={-200} y={-400} width={390} height={180} fill="#2EE59D" />
				<rect x={-230} y={-680} width={460} height={70} rx={20} fill="#3b3b3b" />
			</g>
			<Person x={2700} y={1900} s={1.4} fill="#2a1d14" />
		</Svg>
	</AbsoluteFill>
);

const Track: React.FC = () => {
	const frame = useCurrentFrame();
	const run = (frame * 9) % (W + 800);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, #ffb36b 0%, #ffd8a8 45%, #f6e7c8 70%)'}} />
			<GodRays x={3300} y={500} color="rgba(255,210,150,0.25)" />
			<Svg blur={1}>
				<Trees y={1150} seed="trk" count={9} color="#4d8b4a" scale={0.8} />
				<polygon points={`0,1150 ${W},1150 ${W},${H} 0,${H}`} fill="#c2473a" />
				{new Array(7).fill(0).map((_, i) => (
					<line key={i} x1={i * 640 - 200} y1={1150} x2={i * 1100 - 1400} y2={H} stroke="#f4efe7" strokeWidth={12} />
				))}
				<Person x={run - 400} y={1820} s={1.6} fill="#1e1612" bob={Math.abs(Math.sin(frame / 5)) * -40} />
			</Svg>
			<Bokeh seed="track" count={16} color="rgba(255,220,160,1)" />
		</AbsoluteFill>
	);
};

const Classroom: React.FC = () => (
	<AbsoluteFill>
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #f0ece4 0%, #d9d2c4 100%)'}} />
		<Svg blur={3}>
			{[0, 1, 2].map((i) => (
				<rect key={i} x={2500 + i * 420} y={300} width={360} height={900} fill="#fff7e0" />
			))}
			<rect x={300} y={360} width={1700} height={820} fill="#1f3b2d" />
			<text x={1150} y={720} textAnchor="middle" fontSize={130} fill="#e9f5ec" fontWeight={900} fontFamily={FONT_DISPLAY}>
				南山大學
			</text>
			<text x={1150} y={900} textAnchor="middle" fontSize={80} fill="#FFC83A" fontFamily={FONT_DISPLAY}>
				精靈升級副本・領導力工作坊
			</text>
		</Svg>
		<GodRays x={3000} y={500} color="rgba(255,240,200,0.3)" />
		<Svg>
			<rect x={0} y={1550} width={W} height={610} fill="#9c7b55" />
			<Person x={900} y={1800} s={1.3} fill="#2c2a28" />
			<Person x={1500} y={1820} s={1.35} fill="#36302a" />
			<Person x={2400} y={1780} s={1.25} fill="#2a2622" />
			<Person x={3000} y={1840} s={1.4} fill="#302a24" />
		</Svg>
	</AbsoluteFill>
);

const Friends: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, #ffcf99 0%, #f7a96b 50%, #5b8f6a 100%)'}} />
			<Svg blur={10}>
				<Trees y={1300} seed="fr" count={10} color="#3e7d4c" />
			</Svg>
			<GodRays x={700} y={350} />
			<Svg blur={1}>
				<rect x={0} y={1500} width={W} height={660} fill="#d9c6a3" />
				{[900, 1500, 2300, 2900].map((x, i) => (
					<Person key={i} x={x} y={1900 + (i % 2) * 40} s={1.5} fill={['#2b2420', '#33281f', '#2a221d', '#3a2d22'][i]} phone="#bff" bob={Math.sin(frame / 18 + i) * 8} />
				))}
			</Svg>
			<Bokeh seed="friends" count={22} color="rgba(255,225,170,1)" />
		</AbsoluteFill>
	);
};

const NightCampus: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, #02030a 0%, #0b1433 55%, #101a2e 100%)'}} />
			<Svg blur={4}>
				{[0, 1, 2, 3, 4, 5].map((i) => (
					<g key={i}>
						<rect x={i * 680 - 100} y={700 + (i % 3) * 80} width={600} height={900} fill="#070b18" />
						{new Array(20).fill(0).map((_, j) => (
							<rect key={j} x={i * 680 - 60 + (j % 5) * 110} y={760 + (i % 3) * 80 + Math.floor(j / 5) * 180} width={60} height={90} fill="#ffd27a" opacity={random(`w${i}${j}`) > 0.55 ? 0.7 : 0.05} />
						))}
					</g>
				))}
			</Svg>
			<Svg>
				<rect x={0} y={1600} width={W} height={560} fill="#05070f" />
				{new Array(9).fill(0).map((_, i) => (
					<Person key={i} x={250 + i * 420} y={1950 + (i % 2) * 60} s={1.1 + (i % 3) * 0.12} fill="#03050b" phone="#7fd4ff" bob={Math.sin(frame / 20 + i) * 5} />
				))}
			</Svg>
			{/* 低處霧氣 */}
			<AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(90,120,200,0.25), transparent 40%)', filter: 'blur(20px)'}} />
		</AbsoluteFill>
	);
};
