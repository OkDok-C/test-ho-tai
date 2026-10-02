// HEART 五大永續面向 — 色彩與文案依企劃書 STEP 2 定義
export type HeartKey = 'H' | 'E' | 'A' | 'R' | 'T';

export const HEART: Record<
	HeartKey,
	{en: string; zh: string; pillar: string; color: string; glow: string; task: string}
> = {
	H: {en: 'Health', zh: '健康紅', pillar: '健康促進', color: '#FF4D5E', glow: 'rgba(255,77,94,0.85)', task: '每日步數・運動・睡眠'},
	E: {en: 'Earth', zh: '地球綠', pillar: '地球守護', color: '#2EE59D', glow: 'rgba(46,229,157,0.85)', task: '大眾運輸・減塑・自備環保杯'},
	A: {en: 'Action for Good', zh: '公益紫', pillar: '關懷行動', color: '#A86BFF', glow: 'rgba(168,107,255,0.85)', task: '志工・淨灘・長者陪伴'},
	R: {en: 'Reliability', zh: '防詐藍', pillar: '信賴承諾', color: '#3AA8FF', glow: 'rgba(58,168,255,0.85)', task: '辨識假投資・釣魚網站'},
	T: {en: 'Talent', zh: '賦能黃', pillar: '人才賦能', color: '#FFC83A', glow: 'rgba(255,200,58,0.85)', task: '南山大學職涯・領導課程'},
};

export const HEART_ORDER: HeartKey[] = ['H', 'E', 'A', 'R', 'T'];

export const BRAND = {
	nanshanGreen: '#00843D',
	deepForest: '#04140D',
	night: '#050813',
	gold: '#E9C46A',
	white: '#F7FBF8',
};

// 字體：優先載入 public/fonts 下的 Noto Sans TC（見 fonts.ts），否則退回系統字體
export const FONT_DISPLAY = `'NanshanDisplay', 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', 'WenQuanYi Zen Hei', sans-serif`;
export const FONT_UI = `'NanshanUI', 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', 'WenQuanYi Zen Hei', sans-serif`;
export const FONT_MONO = `'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace`;

export const SLOGAN = '一山還有一山高，南山幫你守錢包';
export const FILM_TITLE_A = '永續小精靈大作戰';
export const FILM_TITLE_B = '南山 HEART 綠色夥伴計畫';
