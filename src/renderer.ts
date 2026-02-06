import { JSDOM } from 'jsdom';
import { UserStats } from './types';

// SVGのサイズ
const WIDTH = 300;
const HEIGHT = 180; // テキスト追加に伴い、少し高さを調整

// スタイル定義
const STYLES = `
  .bg { fill: #282a36; rx: 15; }
  .main-color { fill: #f8f8f2; font-family: 'Segoe UI', system-ui, sans-serif; }
  .username { font-size: 14px; font-weight: 400; opacity: 0.8; }
  .level-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .level-value { font-size: 56px; font-weight: 900; }
  .rank-label { font-size: 18px; font-weight: 600; font-style: italic; }
  .stat-sub { font-size: 11px; opacity: 0.7; }
  .progress-bg { fill: #44475a; rx: 4; }
  .progress-fill { fill: #f8f8f2; rx: 4; }
`;

export function renderSvg(stats: UserStats, username: string): string {
  const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
  const document = dom.window.document;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', `${WIDTH}`);
  svg.setAttribute('height', `${HEIGHT}`);
  svg.setAttribute('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = STYLES;
  defs.appendChild(style);
  svg.appendChild(defs);

  // 背景
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', '100%');
  bgRect.setAttribute('height', '100%');
  bgRect.setAttribute('class', 'bg');
  svg.appendChild(bgRect);

  // --- 計算ロジック ---
  const currentVal = stats.totalBytes;
  const targetVal = stats.totalBytes + stats.nextLevelExp;
  const progressRatio = Math.min(currentVal / targetVal, 1);

  // --- レイアウト ---
  // 1. ユーザー名 (左上)
  svg.appendChild(createTextElement(document, 25, 30, `@${username}`, 'main-color username'));

  // 2. レベル数値 (中央)
  const levelValue = createTextElement(document, WIDTH / 2, 85, `${stats.level}`, 'main-color level-value');
  levelValue.setAttribute('text-anchor', 'middle');
  svg.appendChild(levelValue);

  // 3. "LV" ラベル (数値の左横)
  const lvLabel = createTextElement(document, WIDTH / 2 - 45, 85, 'LV', 'main-color level-label');
  lvLabel.setAttribute('text-anchor', 'end');
  svg.appendChild(lvLabel);

  // 4. Rank (数値の下)
  const rankText = createTextElement(document, WIDTH / 2, 115, stats.rank, 'main-color rank-label');
  rankText.setAttribute('text-anchor', 'middle');
  svg.appendChild(rankText);

  // 5. プログレスバー
  const barMaxWidth = 240;
  const barX = (WIDTH - barMaxWidth) / 2;
  const barY = 135;

  const progressBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  progressBg.setAttribute('x', `${barX}`);
  progressBg.setAttribute('y', `${barY}`);
  progressBg.setAttribute('width', `${barMaxWidth}`);
  progressBg.setAttribute('height', '8');
  progressBg.setAttribute('class', 'progress-bg');
  svg.appendChild(progressBg);

  const progressFill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  progressFill.setAttribute('x', `${barX}`);
  progressFill.setAttribute('y', `${barY}`);
  progressFill.setAttribute('width', `${barMaxWidth * progressRatio}`);
  progressFill.setAttribute('height', '8');
  progressFill.setAttribute('class', 'progress-fill');
  svg.appendChild(progressFill);

  // 6. プログレスバー下部のテキスト (Next: 現在値/目標値)
  const progressText = `Next: ${currentVal.toLocaleString()} / ${targetVal.toLocaleString()} Bytes`;
  const progressLabel = createTextElement(
    document,
    WIDTH / 2,
    barY + 22,
    progressText,
    'main-color stat-sub'
  );
  progressLabel.setAttribute('text-anchor', 'middle');
  svg.appendChild(progressLabel);

  return svg.outerHTML;
}

function createTextElement(doc: Document, x: number, y: number, content: string, className: string) {
  const text = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', `${x}`);
  text.setAttribute('y', `${y}`);
  text.setAttribute('class', className);
  text.textContent = content;
  return text;
}