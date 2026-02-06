import '@jest/globals';
import { analyzeUserStats } from '../src/analyzer';
import { RepoInfo } from '../src/types'; // UserStats は analyzeUserStats の戻り値の型として推論されるため不要

// analyzer.ts の RepoInfo と同じ構造のダミーデータを作成するヘルパー
const createMockRepo = (languages: { [key: string]: number }, name = 'mock-repo', full_name = 'user/mock-repo'): RepoInfo => ({
  name,
  full_name,
  languages,
});

describe('analyzeUserStats', () => {
  it('should correctly calculate totalBytes, level, and title, and nextLevelExp', () => {
    const mockRepos = [
      createMockRepo({
        TypeScript: 10000,
        JavaScript: 5000,
        Markdown: 1000 // 防御力に寄与
      }, 'repo1', 'user/repo1'),
      createMockRepo({
        Python: 20000,
        Markdown: 500 // 防御力に寄与
      }, 'repo2', 'user/repo2'),
      createMockRepo({
        HTML: 2000,
        CSS: 1000
      }, 'repo3', 'user/repo3'),
    ];

    const stats = analyzeUserStats(mockRepos);

    // 総バイト数 = 10000 + 5000 + 1000 + 20000 + 500 + 2000 + 1000 = 39500
    expect(stats.totalBytes).toBe(39500);

    // レベル計算のテスト (calculateLevel のロジックに依存)
    // 39500バイトの場合、level = 4 (23750 <= 39500 < 40625)
    expect(stats.level).toBe(4);

    // 称号計算のテスト (calculateTitle のロジックに依存)
    // 39500バイトの場合、10,000以上50,000未満なので「駆け出しデベロッパー」
    expect(stats.rank).toBe('駆け出しデベロッパー'); // stats.title から stats.rank に変更

    // nextLevelExp のテスト
    // 現在のレベル4に必要な累積経験値は23750。次のレベル5に必要な経験値は40625。
    // その差分は 40625 - 39500 = 1125
    expect(stats.nextLevelExp).toBe(1125); // レベル4の39500バイトからレベル5の40625バイトまでの差分
  });

  it('should handle empty repository list', () => {
    const mockRepos: RepoInfo[] = []; // このままでOK、空配列はRepoInfo[]にアサイン可能
    const stats = analyzeUserStats(mockRepos);

    expect(stats.totalBytes).toBe(0);
    expect(stats.level).toBe(1); // 最低レベルは1
    expect(stats.rank).toBe('Hello Worldの住人'); // 最初の称号 // stats.title から stats.rank に変更
    expect(stats.nextLevelExp).toBe(5000); // 0バイトの場合、次のレベル（レベル2）に必要な経験値
  });

  it('should calculate level and nextLevelExp correctly for various byte counts', () => {
    // calculateLevel のロジックに基づくテスト
    // level 1: totalBytes < 5000 (0〜4999)
    // level 2: 5000 <= totalBytes < 12500 (5000〜12499)
    // level 3: 12500 <= totalBytes < 23750 (12500〜23749)
    // level 4: 23750 <= totalBytes < 40625 (23750〜40624)
    // level 5: 40625 <= totalBytes < 64062.5 (40625〜64062)
    // level 6: 64062.5 <= totalBytes < 100000 (64063〜99999)

    expect(analyzeUserStats([createMockRepo({ JS: 0 })]).level).toBe(1); // 0バイト
    expect(analyzeUserStats([createMockRepo({ JS: 4999 })]).level).toBe(1); // 5000未満 (Level 1)
    expect(analyzeUserStats([createMockRepo({ JS: 5000 })]).level).toBe(2); // 5000の場合 (Level 2)
    expect(analyzeUserStats([createMockRepo({ JS: 12499 })]).level).toBe(2); // 12499の場合 (Level 2)
    expect(analyzeUserStats([createMockRepo({ JS: 12500 })]).level).toBe(3); // 12500の場合 (Level 3)
    expect(analyzeUserStats([createMockRepo({ JS: 23749 })]).level).toBe(3); // 23749の場合 (Level 3)
    expect(analyzeUserStats([createMockRepo({ JS: 23750 })]).level).toBe(4); // 23750の場合 (Level 4)
    expect(analyzeUserStats([createMockRepo({ JS: 39500 })]).level).toBe(4); // 39500の場合 (Level 4) - initial test case value for totalBytes
    expect(analyzeUserStats([createMockRepo({ JS: 100_000_000 })]).level).toBe(23); // 高バイト数 (再計算済み)

    // calculateNextLevelExp のロジックに基づくテスト
    expect(analyzeUserStats([createMockRepo({ JS: 0 })]).nextLevelExp).toBe(5000); // Level 1 (0バイト) -> Level 2 (5000バイト)
    expect(analyzeUserStats([createMockRepo({ JS: 4999 })]).nextLevelExp).toBe(1); // Level 1 (4999バイト) -> Level 2 (5000バイト)
    expect(analyzeUserStats([createMockRepo({ JS: 5000 })]).nextLevelExp).toBe(7500); // Level 2 (5000バイト) -> Level 3 (12500バイト, 5000+7500)
    expect(analyzeUserStats([createMockRepo({ JS: 12499 })]).nextLevelExp).toBe(1); // Level 2 (12499バイト) -> Level 3 (12500バイト)
    expect(analyzeUserStats([createMockRepo({ JS: 23750 })]).nextLevelExp).toBe(16875); // Level 4 (23750バイト) -> Level 5 (40625バイト, 23750+16875)
    expect(analyzeUserStats([createMockRepo({ JS: 100_000_000 })]).nextLevelExp).toBeCloseTo(12217414.64, 2); // 高バイト数 (レベル23から24へ)
  });

  it('should calculate title correctly for various byte counts', () => {
    // calculateTitle のロジックに基づくテスト
    // step = 10_000_000 (10M)
    expect(analyzeUserStats([createMockRepo({ JS: 0 })]).rank).toBe('Hello Worldの住人'); // stats.title から stats.rank に変更
    expect(analyzeUserStats([createMockRepo({ JS: 9_999 })]).rank).toBe('Hello Worldの住人'); // stats.title から stats.rank に変更
    expect(analyzeUserStats([createMockRepo({ JS: 10_000 })]).rank).toBe('駆け出しデベロッパー'); // stats.title から stats.rank に変更
    expect(analyzeUserStats([createMockRepo({ JS: 49_999 })]).rank).toBe('駆け出しデベロッパー'); // stats.title から stats.rank に変更
    expect(analyzeUserStats([createMockRepo({ JS: 50_000 })]).rank).toBe('写経の修行者'); // stats.title から stats.rank に変更
    expect(analyzeUserStats([createMockRepo({ JS: 99_999 })]).rank).toBe('写経の修行者'); // 99,999バイトは写経の修行者 (50,000以上100,000未満) // stats.title から stats.rank に変更
    expect(analyzeUserStats([createMockRepo({ JS: 100_000 })]).rank).toBe('不具合を狩る者'); // stats.title から stats.rank に変更
    expect(analyzeUserStats([createMockRepo({ JS: 10_000_000 })]).rank).toBe('バイナリの神'); // stats.title から stats.rank に変更
    expect(analyzeUserStats([createMockRepo({ JS: 100_000_000 })]).rank).toBe('バイナリの神'); // 最大閾値を超えても最後の称号 // stats.title から stats.rank に変更
  });
});
