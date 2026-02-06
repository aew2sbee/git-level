import '@jest/globals';
import { Octokit } from '@octokit/rest';
import { fetchUserReposAndLanguages } from '../src/fetcher';
import { GitHubRepo } from '../src/types'; // 型定義をインポート

// Octokit のインスタンスとメソッドをモック化するための変数
const mockListForUser = jest.fn();
const mockListLanguages = jest.fn();

// Octokit クラス全体をモック化
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn(() => ({
      // モック化したメソッドを Octokit インスタンスの repos プロパティに割り当てる
      repos: {
        listForUser: mockListForUser,
        listLanguages: mockListLanguages,
      },
    })),
  };
});

describe('fetchUserReposAndLanguages', () => {
  beforeEach(() => {
    // 各テストの前にモックの状態をリセット
    mockListForUser.mockReset();
    mockListLanguages.mockReset();
  });

  it('should fetch public repos and their languages, excluding private and forked ones', async () => {
    // mockListForUser のモックレスポンス
    mockListForUser.mockResolvedValueOnce({
      data: [
        { name: 'repo1', full_name: 'testuser/repo1', private: false, fork: false, owner: { login: 'testuser' }, languages_url: 'https://api.github.com/repos/testuser/repo1/languages' },
        { name: 'repo2', full_name: 'testuser/repo2', private: true, fork: false, owner: { login: 'testuser' }, languages_url: 'https://api.github.com/repos/testuser/repo2/languages' }, // private
        { name: 'repo3', full_name: 'testuser/repo3', private: false, fork: true, owner: { login: 'testuser' }, languages_url: 'https://api.github.com/repos/testuser/repo3/languages' }, // fork
        { name: 'repo4', full_name: 'testuser/repo4', private: false, fork: false, owner: { login: 'testuser' }, languages_url: 'https://api.github.com/repos/testuser/repo4/languages' },
      ] as GitHubRepo[], // 型アサーションを追加
    }).mockResolvedValueOnce({ data: [] }); // ページネーション終了

    // mockListLanguages のモックレスポンス
    mockListLanguages.mockResolvedValueOnce({ data: { TypeScript: 10000, JavaScript: 5000 } }); // repo1
    mockListLanguages.mockResolvedValueOnce({ data: { Python: 20000 } }); // repo4

    const username = 'testuser';
    const repos = await fetchUserReposAndLanguages(username);

    expect(repos).toHaveLength(2);
    expect(repos[0].name).toBe('repo1');
    expect(repos[0].languages).toEqual({ TypeScript: 10000, JavaScript: 5000 });
    expect(repos[1].name).toBe('repo4');
    expect(repos[1].languages).toEqual({ Python: 20000 });

    // listForUser が2回（初回とページネーション終了）呼ばれることを確認
    expect(mockListForUser).toHaveBeenCalledTimes(2);
    // listLanguages が公開リポジリの数だけ呼ばれることを確認
    expect(mockListLanguages).toHaveBeenCalledTimes(2);
  });

  it('should handle non-existent user or API error', async () => {
    // mockListForUser がエラーを返すように設定
    mockListForUser.mockRejectedValueOnce(new Error('User not found'));

    const username = 'nonexistentuser';
    await expect(fetchUserReposAndLanguages(username)).rejects.toThrow('User not found');
    expect(mockListForUser).toHaveBeenCalledTimes(1);
    expect(mockListLanguages).not.toHaveBeenCalled(); // エラー発生時は言語取得が呼ばれないことを確認
  });
});
