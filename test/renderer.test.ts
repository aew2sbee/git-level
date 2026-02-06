import '@jest/globals';
import { renderSvg } from '../src/renderer';
import { UserStats } from '../src/types';

describe('renderSvg', () => {
  it('should render a complete SVG card with user stats', () => {
    const mockStats: UserStats = {
      totalBytes: 39500,
      level: 4,
      rank: '駆け出しデベロッパー', // title から rank に変更
      nextLevelExp: 1125,
    };
    const username = 'testuser';

    const svg = renderSvg(mockStats, username);

    // スナップショットテスト
    expect(svg).toMatchSnapshot();

    // 部分的な内容のチェック
    expect(svg).toContain('<svg width="400" height="180"');
    expect(svg).toContain(username);
    expect(svg).toContain('>4</');
    expect(svg).toContain('>駆け出しデベロッパー</'); // rankとして表示される
    expect(svg).toContain(`Next Level in ${mockStats.nextLevelExp.toLocaleString()} B`);
  });

  it('should render correctly for a new user with zero stats', () => {
    const mockStats: UserStats = {
      totalBytes: 0,
      level: 1,
      rank: 'Hello Worldの住人', // title から rank に変更
      nextLevelExp: 5000,
    };
    const username = 'newbie';

    const svg = renderSvg(mockStats, username);

    // スナップショットテスト
    expect(svg).toMatchSnapshot();
    
    // 部分的な内容のチェック
    expect(svg).toContain(username);
    expect(svg).toContain('>1</');
    expect(svg).toContain('>Hello Worldの住人</'); // rankとして表示される
    expect(svg).toContain(`Next Level in ${mockStats.nextLevelExp.toLocaleString()} B`);
  });
});
