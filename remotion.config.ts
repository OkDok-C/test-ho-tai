import {Config} from '@remotion/cli/config';

// 4K / 60fps 母帶輸出設定
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setConcurrency('50%');
// 4K 幀含大量 SVG 濾鏡，延長單幀逾時
Config.setDelayRenderTimeoutInMilliseconds(120000);
Config.setChromiumOpenGlRenderer('angle');
