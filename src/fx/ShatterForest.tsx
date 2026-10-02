import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {HEART} from '../config/theme';
import {clamp, EASE, progress} from '../lib/anim';

const CX = 1920;
const CY = 880;
const GROUND = 1880;

type Shard = {pts: [number, number][]; cx: number; cy: number; seed: string; landX: number};

/** 以網格切三角形，近似 Boss 輪廓（橢圓內） */
const SHARDS: Shard[] = (() => {
	const cols = 10;
	const rows = 6;
	const w = 2200 / cols;
	const h = 1120 / rows;
	const out: Shard[] = [];
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const x0 = CX - 1100 + c * w;
			const y0 = CY - 560 + r * h;
			const j = (k: string) => (random(`j${r}${c}${k}`) - 0.5) * 40;
			const p = [
				[x0 + j('a'), y0 + j('b')],
				[x0 + w + j('c'), y0 + j('d')],
				[x0 + w + j('e'), y0 + h + j('f')],
				[x0 + j('g'), y0 + h + j('h')],
			] as [number, number][];
			const tris = [
				[p[0], p[1], p[2]],
				[p[0], p[2], p[3]],
			];
			tris.forEach((t, ti) => {
				const cx = (t[0][0] + t[1][0] + t[2][0]) / 3;
				const cy = (t[0][1] + t[1][1] + t[2][1]) / 3;
				const inside = ((cx - CX) / 1100) ** 2 + ((cy - CY) / 560) ** 2 < 1;
				if (!inside) return;
				const seed = `s${r}-${c}-${ti}`;
				out.push({pts: t, cx, cy, seed, landX: 200 + random(`${seed}land`) * 3440});
			});
		}
	}
	return out;
})();

type Seg = {x1: number; y1: number; x2: number; y2: number; w: number; depth: number};

/** 決定性分形樹 */
const buildTree = (seed: string, x: number, y: number, len: number, maxDepth: number): Seg[] => {
	const segs: Seg[] = [];
	const rec = (x1: number, y1: number, ang: number, l: number, d: number) => {
		const x2 = x1 + Math.cos(ang) * l;
		const y2 = y1 + Math.sin(ang) * l;
		segs.push({x1, y1, x2, y2, w: Math.max(3, (maxDepth - d) * len * 0.028), depth: d});
		if (d >= maxDepth) return;
		const n = 2 + (random(`${seed}n${d}${segs.length}`) > 0.6 ? 1 : 0);
		for (let i = 0; i < n; i++) {
			const spread = 0.42 + random(`${seed}sp${segs.length}${i}`) * 0.25;
			const na = ang + (i - (n - 1) / 2) * spread + (random(`${seed}a${segs.length}${i}`) - 0.5) * 0.3;
			rec(x2, y2, na, l * (0.68 + random(`${seed}l${segs.length}${i}`) * 0.12), d + 1);
		}
	};
	rec(x, y, -Math.PI / 2, len, 0);
	return segs;
};

const TREES = [
	{x: CX, len: 420, depth: 7, delay: 0, seed: 'giant'},
	...new Array(12).fill(0).map((_, i) => ({
		x: 160 + i * 320 + (random(`tx${i}`) - 0.5) * 120,
		len: 150 + random(`tl${i}`) * 110,
		depth: 5,
		delay: 6 + Math.abs(i - 5.5) * 5,
		seed: `t${i}`,
	})),
].map((t) => ({...t, segs: buildTree(t.seed, t.x, GROUND, t.len, t.depth)}));

const LEAF_COLORS = ['#2EE59D', '#5ad07a', '#9ff0c4', HEART.E.color, '#3fae5a', HEART.T.color];

/**
 * 黑影碎裂 → 光種墜地 → 永續森林綻放（無縫連續）
 * Phase A（shatterAt → +40）：三角碎片爆散旋轉，色彩由深紫轉翡翠綠光
 * Phase B（+40 → +80）：碎片收斂為光種，拋物線落向地面
 * Phase C（bloomAt →）：光種落點生長分形樹，枝幹依深度 spring 生長，末端綻放 HEART 色光葉
 */
export const ShatterForest: React.FC<{shatterAt: number; bloomAt: number}> = ({shatterAt, bloomAt}) => {
	const frame = useCurrentFrame();
	const t = frame - shatterAt;
	if (t < 0) return null;

	const flash = interpolate(t, [0, 4, 30], [0, 1, 0], clamp);
	const grow = interpolate(frame, [bloomAt, bloomAt + 200], [0, 1], {...clamp, easing: EASE.out});
	const groundGlow = progress(frame, bloomAt - 10, bloomAt + 60);

	return (
		<AbsoluteFill>
			{/* 森林底光 */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse at 50% 100%, rgba(46,229,157,${0.55 * groundGlow}), rgba(0,132,61,${0.25 * groundGlow}) 35%, transparent 70%)`,
				}}
			/>
			<svg width="100%" height="100%" viewBox="0 0 3840 2160" style={{position: 'absolute', overflow: 'visible'}}>
				<defs>
					<filter id="leaf-glow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation={10} result="b" />
						<feMerge>
							<feMergeNode in="b" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				{/* Phase A/B：碎片 */}
				{SHARDS.map((s) => {
					const a = Math.atan2(s.cy - CY, s.cx - CX) + (random(`${s.seed}da`) - 0.5) * 0.6;
					const pw = 500 + random(`${s.seed}pw`) * 900;
					const kA = interpolate(t, [0, 40], [0, 1], {...clamp, easing: EASE.out});
					const kB = interpolate(t, [40, 80], [0, 1], {...clamp, easing: EASE.in});
					const ex = s.cx + Math.cos(a) * pw * kA;
					const ey = s.cy + Math.sin(a) * pw * kA * 0.7;
					const px = ex + (s.landX - ex) * kB;
					const py = ey + (GROUND - ey) * kB - Math.sin(kB * Math.PI) * 300;
					const rot = (random(`${s.seed}rot`) - 0.5) * 720 * kA;
					const shrink = 1 - kB * 0.92;
					const green = kA;
					const fill = `rgb(${Math.round(18 + green * 28)}, ${Math.round(0 + green * 229)}, ${Math.round(32 + green * 125)})`;
					if (t > 86) return null;
					return (
						<g key={s.seed} transform={`translate(${px}, ${py}) rotate(${rot}) scale(${shrink})`} opacity={interpolate(t, [80, 86], [1, 0], clamp)}>
							<polygon
								points={s.pts.map(([x, y]) => `${x - s.cx},${y - s.cy}`).join(' ')}
								fill={fill}
								stroke={green > 0.3 ? '#d8ffe9' : '#5a0d8c'}
								strokeWidth={4}
								filter="url(#leaf-glow)"
							/>
						</g>
					);
				})}

				{/* Phase C：分形森林 */}
				{TREES.map((tree) => {
					const g = interpolate(frame, [bloomAt + tree.delay, bloomAt + tree.delay + 150], [0, 1], {...clamp, easing: EASE.out});
					if (g <= 0) return null;
					const level = g * (tree.depth + 1);
					return (
						<g key={tree.seed}>
							{tree.segs.map((sg, i) => {
								const k = Math.min(1, Math.max(0, level - sg.depth));
								if (k <= 0) return null;
								const x2 = sg.x1 + (sg.x2 - sg.x1) * k;
								const y2 = sg.y1 + (sg.y2 - sg.y1) * k;
								const isTip = sg.depth >= tree.depth - 1;
								const leafK = Math.min(1, Math.max(0, level - tree.depth));
								return (
									<g key={i}>
										<line x1={sg.x1} y1={sg.y1} x2={x2} y2={y2} stroke={sg.depth < 2 ? '#3b2a1a' : '#5a7a3a'} strokeWidth={sg.w} strokeLinecap="round" />
										{isTip && leafK > 0 ? (
											<circle
												cx={sg.x2}
												cy={sg.y2 + Math.sin(frame / 25 + i) * 6}
												r={(tree.depth === 7 ? 46 : 30) * leafK}
												fill={LEAF_COLORS[i % LEAF_COLORS.length]}
												opacity={0.9}
												filter="url(#leaf-glow)"
											/>
										) : null}
									</g>
								);
							})}
						</g>
					);
				})}
			</svg>
			{/* 碎裂瞬間白閃 */}
			<AbsoluteFill style={{background: '#e9fff3', opacity: flash * 0.8, mixBlendMode: 'screen'}} />
			{/* 生長整體輝光 */}
			<AbsoluteFill style={{background: `radial-gradient(circle at 50% 55%, rgba(200,255,220,${0.18 * grow}), transparent 60%)`, mixBlendMode: 'screen'}} />
		</AbsoluteFill>
	);
};
