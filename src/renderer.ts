import { JSDOM } from 'jsdom';

// データの型定義
export interface UserStats {
  totalBytes: number;
  level: number;
  rank: string;
  nextLevelExp: number;
}

// SVGのサイズ
const WIDTH = 400;
const HEIGHT = 180;

// スタイル定義
const STYLES = `
  .bg { fill: url(#bg-gradient); stroke: #44475a; stroke-width: 1.5; }
  .username { font-size: 16px; font-weight: 600; font-family: 'Segoe UI', Ubuntu, sans-serif; fill: #f8f8f2; }
  .level-label { font-size: 14px; font-family: 'Segoe UI', Ubuntu, sans-serif; fill: #bd93f9; }
  .level-value { font-size: 48px; font-weight: 800; font-family: 'Segoe UI', Ubuntu, sans-serif; fill: #f8f8f2; }
  .rank-label { font-size: 20px; font-weight: 700; font-family: 'Segoe UI', Ubuntu, sans-serif; fill: #50fa7b; }
  .exp-label { font-size: 12px; font-family: 'Segoe UI', Ubuntu, sans-serif; fill: #ffb86c; }
  .total-bytes { font-size: 11px; font-family: 'Segoe UI', Ubuntu, sans-serif; fill: #6272a4; }
`;

export function renderSvg(stats: UserStats, username: string): string {
  // JSDOMで環境を初期化
  const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
  const document = dom.window.document;

  // SVG要素を作成
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); // XML名前空間を付与
  svg.setAttribute('width', `${WIDTH}`);
  svg.setAttribute('height', `${HEIGHT}`);
  svg.setAttribute('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);

  // スタイルとグラデーションの定義
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = STYLES;
  
  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.setAttribute('id', 'bg-gradient');
  gradient.setAttribute('x1', '0%');
  gradient.setAttribute('y1', '0%');
  gradient.setAttribute('x2', '100%');
  gradient.setAttribute('y2', '100%');
  gradient.innerHTML = `
    <stop offset="0%" stop-color="#44475a" />
    <stop offset="100%" stop-color="#282a36" />
  `;
  
  defs.appendChild(style);
  defs.appendChild(gradient);
  svg.appendChild(defs);

  // 背景の描画
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', '100%');
  bgRect.setAttribute('height', '100%');
  bgRect.setAttribute('rx', '10');
  bgRect.setAttribute('class', 'bg');
  svg.appendChild(bgRect);

  const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // 1. Username
  const usernameText = createTextElement(document, 20, 35, username, 'username');
  textGroup.appendChild(usernameText);

  // 2. "Level" ラベル
  const levelLabel = createTextElement(document, WIDTH / 2, 65, 'Level', 'level-label');
  levelLabel.setAttribute('text-anchor', 'middle');
  textGroup.appendChild(levelLabel);

  // 3. レベル数値
  const levelValue = createTextElement(document, WIDTH / 2, 110, `${stats.level}`, 'level-value');
  levelValue.setAttribute('text-anchor', 'middle');
  textGroup.appendChild(levelValue);

  // 4. Rank (称号)
  const rankText = createTextElement(document, WIDTH / 2, 145, stats.rank, 'rank-label');
  rankText.setAttribute('text-anchor', 'middle');
  textGroup.appendChild(rankText);

  // 5. 総バイト数 (左下)
  const totalBytes = createTextElement(document, 20, HEIGHT - 15, `Total: ${stats.totalBytes.toLocaleString()} Bytes`, 'total-bytes');
  textGroup.appendChild(totalBytes);

  // 6. 次のレベルまでの経験値 (右下)
  const expLabel = createTextElement(document, WIDTH - 20, HEIGHT - 15, `Next Level in ${stats.nextLevelExp.toLocaleString()} Bytes`, 'exp-label');
  expLabel.setAttribute('text-anchor', 'end');
  textGroup.appendChild(expLabel);

  svg.appendChild(textGroup);

  return svg.outerHTML;
}

// ヘルパー関数: テキスト要素作成を簡略化
function createTextElement(doc: Document, x: number, y: number, content: string, className: string) {
  const text = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', `${x}`);
  text.setAttribute('y', `${y}`);
  text.setAttribute('class', className);
  text.textContent = content;
  return text;
}