import {useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {hasStaticAsset} from './config/footage';

/**
 * 可選：將 Noto Sans TC（SIL OFL）放到 public/fonts/ 以取得一致的電影字體。
 *   public/fonts/NotoSansTC-Black.otf   → 'NanshanDisplay'
 *   public/fonts/NotoSansTC-Medium.otf  → 'NanshanUI'
 * 未放置時退回系統字體（PingFang TC / 微軟正黑體 / 文泉驛），不影響算圖。
 */
const FONTS = [
	{family: 'NanshanDisplay', file: 'fonts/NotoSansTC-Black.otf', weight: '900'},
	{family: 'NanshanUI', file: 'fonts/NotoSansTC-Medium.otf', weight: '100 900'},
];

let loading: Promise<unknown> | null = null;

export const useFonts = () => {
	useState(() => {
		const todo = FONTS.filter((f) => hasStaticAsset(f.file));
		if (todo.length === 0 || loading || typeof document === 'undefined') return null;
		const handle = delayRender('Loading Noto Sans TC');
		loading = Promise.all(
			todo.map(async (f) => {
				const face = new FontFace(f.family, `url(${staticFile(f.file)})`, {weight: f.weight});
				await face.load();
				document.fonts.add(face);
			}),
		)
			.catch((err) => console.warn('Font load failed, using system fallback', err))
			.finally(() => continueRender(handle));
		return null;
	});
};
