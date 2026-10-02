import {getStaticFiles, staticFile} from 'remotion';

/**
 * 實拍素材清單（放在 public/footage/）。
 * 若檔案不存在，<LiveFootage> 會自動改用程序化的「示意實景板」(ProceduralPlate)，
 * 因此專案在拍攝素材到位前即可完整預覽與算圖。
 */
export type PlateKind =
	| 'campus-day'
	| 'cafe'
	| 'track'
	| 'classroom'
	| 'friends'
	| 'night-campus';

export type FootageSpec = {
	file: string;
	plate: PlateKind;
	/** 從素材第幾格開始（素材 fps 換算後的 composition frame） */
	trimBefore?: number;
	/** 素材建議規格，供拍攝團隊參考 */
	note: string;
	/** 影片缺漏時，優先使用的實景靜態圖（取自企劃書「現場佈置概念圖」），做 Ken Burns 運鏡 */
	still?: string;
};

export const FOOTAGE = {
	s1Campus: {file: 'footage/s1_campus_booth_pan.mp4', plate: 'campus-day', still: 'images/booth_main.jpg', note: '4K60 Log, 35mm, 斯坦尼康左→右平移，逆光 10:00 斜射'},
	s1Gacha: {file: 'footage/s1_gacha_closeup.mp4', plate: 'campus-day', still: 'images/booth_main.jpg', note: '4K120 升格, 85mm 特寫扭蛋機轉鈕與種子盆栽交付'},
	s2Earth: {file: 'footage/s2_earth_ecocup.mp4', plate: 'cafe', note: '結盟商圈咖啡廳，自備環保杯結帳，50mm 手持'},
	s2Health: {file: 'footage/s2_health_track.mp4', plate: 'track', note: '操場跑步，低角度 24mm 跟拍 + 汗水逆光'},
	s2Talent: {file: 'footage/s2_talent_class.mp4', plate: 'classroom', note: '南山大學實體課程，小組討論，滑軌推軌'},
	s3Friends: {file: 'footage/s3_friends_ar.mp4', plate: 'friends', note: '學生群聚舉手機拍 AR 濾鏡，手機螢幕須留綠幕或追蹤點'},
	s4Night: {file: 'footage/s4_night_boss.mp4', plate: 'night-campus', note: '黃昏藍調時刻 low-key，學生仰望手機，螢幕光打臉'},
} satisfies Record<string, FootageSpec>;

export type FootageKey = keyof typeof FOOTAGE;

let cache: Set<string> | null = null;
export const hasStaticAsset = (name: string): boolean => {
	if (!cache) {
		try {
			cache = new Set(getStaticFiles().map((f) => f.name));
		} catch {
			cache = new Set();
		}
	}
	return cache.has(name);
};

/** 素材來源判定：實拍影片 > 企劃書實景圖 > 程序化示意板 */
export const footageSource = (key: FootageKey): 'video' | 'still' | 'plate' => {
	const spec: FootageSpec = FOOTAGE[key];
	if (hasStaticAsset(spec.file)) return 'video';
	if (spec.still && hasStaticAsset(spec.still)) return 'still';
	return 'plate';
};

export const footageSrc = (key: FootageKey) => staticFile(FOOTAGE[key].file);

export const BGM_FILE = 'audio/bgm_cinematic_60s.mp3';
