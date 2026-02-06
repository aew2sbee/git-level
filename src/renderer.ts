import { JSDOM } from 'jsdom';
import { UserStats } from './types';

// SVGのサイズ
const WIDTH = 430;
const HEIGHT = 304;

// スタイル定義
const STYLES = `
  .bg { fill: #282a36; rx: 16; } /* 角を少し丸くするとモダンになります */
  .main-color { fill: #f8f8f2; font-family: 'Segoe UI', system-ui, sans-serif; }
  .username { font-size: 18px; font-weight: 400; opacity: 0.8; }
  .level-label { font-size: 16px; font-weight: 700; letter-spacing: 1px; }
  .level-value { font-size: 84px; font-weight: 900; }

  /* Rank全体のスタイル定義を微調整 */
  .rank-container { font-size: 22px; font-weight: 600; }
  .rank-label-text { font-style: normal; } /* Rank: の部分はイタリックなし */
  .rank-value-text { font-style: italic; }              /* 称号の部分だけイタリック */

  .stat-sub { font-size: 12px; opacity: 0.7; }
  .progress-bg { fill: #44475a; rx: 6; }
  .progress-fill { fill: #f8f8f2; rx: 6; }
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

  // 背景 (rxを追加して角を少し丸くしています)
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', '100%');
  bgRect.setAttribute('height', '100%');
  bgRect.setAttribute('class', 'bg');
  svg.appendChild(bgRect);

  // --- 計算ロジック ---
  const currentVal = stats.totalBytes;
  const targetVal = stats.totalBytes + stats.nextLevelExp;
  const progressRatio = Math.min(currentVal / targetVal, 1);

  // --- レイアウト調整 (HEIGHT=304に基づいた配置) ---
  // 1. ユーザー名 (上部)
  svg.appendChild(createTextElement(document, 30, 45, `@${username}`, 'main-color username'));

  // 2. レベル数値 (中央やや上)
  const levelCenterY = 145;
  const levelValue = createTextElement(document, WIDTH / 2, levelCenterY, `${stats.level}`, 'main-color level-value');
  levelValue.setAttribute('text-anchor', 'middle');
  svg.appendChild(levelValue);

  // 3. "LV" ラベル (数値の左側)
  const lvLabel = createTextElement(document, WIDTH / 2 - 65, levelCenterY - 5, 'Lv.', 'main-color level-label');
  lvLabel.setAttribute('text-anchor', 'end');
  svg.appendChild(lvLabel);

  // 4. Rank
  const rankText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  rankText.setAttribute('x', `${WIDTH / 2}`);
  rankText.setAttribute('y', '190');
  rankText.setAttribute('class', 'main-color rank-container');
  rankText.setAttribute('text-anchor', 'middle');

  // "Rank: " の部分 (非イタリック)
  const labelSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
  labelSpan.setAttribute('class', 'rank-label-text');
  labelSpan.textContent = 'Rank: ';

  // 称号の部分 (イタリック)
  const valueSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
  valueSpan.setAttribute('class', 'rank-value-text');
  valueSpan.textContent = stats.rank;

  rankText.appendChild(labelSpan);
  rankText.appendChild(valueSpan);
  svg.appendChild(rankText);

  // 5. プログレスバー (下部)
  const barMaxWidth = 300; // 幅を少し広げました
  const barX = (WIDTH - barMaxWidth) / 2;
  const barY = 210;

  const progressBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  progressBg.setAttribute('x', `${barX}`);
  progressBg.setAttribute('y', `${barY}`);
  progressBg.setAttribute('width', `${barMaxWidth}`);
  progressBg.setAttribute('height', '12'); // 少し太くしました
  progressBg.setAttribute('class', 'progress-bg');
  svg.appendChild(progressBg);

  const progressFill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  progressFill.setAttribute('x', `${barX}`);
  progressFill.setAttribute('y', `${barY}`);
  progressFill.setAttribute('width', `${barMaxWidth * progressRatio}`);
  progressFill.setAttribute('height', '12');
  progressFill.setAttribute('class', 'progress-fill');
  svg.appendChild(progressFill);

  // 6. プログレスバー下部のテキスト
  const progressText = `Next: ${currentVal.toLocaleString()} / ${targetVal.toLocaleString()} Bytes`;
  const progressLabel = createTextElement(
    document,
    WIDTH / 2,
    barY + 35,
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