import * as fs from 'fs';
import * as path from 'path';
import { fetchUserReposAndLanguages } from './fetcher';
import { analyzeUserStats } from './analyzer';
import { renderSvg } from './renderer';
import 'dotenv/config'; // dotenvをロード

async function main() {
  // コマンドライン引数を解析
  // 例: pnpm start <github_username>
  const args = process.argv.slice(2); // node と index.js を除外

  if (args.length === 0) {
    console.error('Usage: pnpm start <github_username>');
    process.exit(1);
  }

  const username = args[0];
  // 環境変数からトークンを取得する
  // ローカル環境では .env.local から、GitHub Actions では secrets から読み込まれることを想定
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.warn('Warning: GITHUB_TOKEN environment variable is not set. API rate limits may apply.');
  }

  console.log(`Fetching data for GitHub user: ${username}...`);

  try {
    const repos = await fetchUserReposAndLanguages(username, token);
    const stats = analyzeUserStats(repos);
    console.log(stats);

    // テキスト出力を維持
    console.log('\n--- Your Wizard Stats ---');
    console.log(`Total Bytes: ${stats.totalBytes} B`);
    console.log(`Level: ${stats.level}`);
    console.log(`Rank: ${stats.rank}`);
    console.log(`Next Level Exp: ${stats.nextLevelExp} B`);

    // SVGを生成
    const svgContent = renderSvg(stats, username);

    // outputディレクトリを作成
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // SVGファイルに保存
    const outputPath = path.join(outputDir, 'git-level.svg');
    fs.writeFileSync(outputPath, svgContent);
    console.log(`\nSVG stats card saved to: ${outputPath}`);

  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
