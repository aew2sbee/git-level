import { Octokit } from '@octokit/rest';
import { RepoInfo, GitHubRepo } from './types'; // 型定義をインポート

// GitHub APIから指定されたユーザーのリポジトリ一覧と各リポジリの言語使用状況を取得する
export async function fetchUserReposAndLanguages(
  username: string,
  token?: string // 認証トークン（オプション）
): Promise<RepoInfo[]> { // 戻り値の型を RepoInfo[] に変更
  const octokit = new Octokit({ auth: token });

  let allRepos: GitHubRepo[] = []; // 型を GitHubRepo[] に変更
  let page = 1;
  const perPage = 100; // 1ページあたりの最大リポジリ数

  while (true) {
    const response = await octokit.repos.listForUser({
      username,
      type: 'owner', // ユーザーが所有するリポジリのみ
      sort: 'updated',
      direction: 'desc',
      per_page: perPage,
      page,
    });

    if (response.data.length === 0) {
      break; // 取得できるリポジリがなくなったら終了
    }

    allRepos = allRepos.concat(response.data as GitHubRepo[]); // 型アサーションを追加
    page++;

    // レートリミットを考慮して、必要であれば待機処理を入れる
    // Octokitが自動でレートリミットをある程度処理してくれるが、
    // 大量のリクエストを連続して送る場合は注意が必要
  }

  const reposWithLanguages = await Promise.all(allRepos.map(async (repo: GitHubRepo) => { // 型を GitHubRepo に変更
    // プライベートリポジリやフォークは対象外とする
    if (repo.private || repo.fork) {
      return null;
    }

    // 言語情報の取得
    const languagesResponse = await octokit.repos.listLanguages({
      owner: repo.owner.login,
      repo: repo.name,
    });
    const languages = languagesResponse.data;

    return {
      name: repo.name,
      full_name: repo.full_name,
      languages,
    } as RepoInfo; // 型アサーションを追加
  }));

  // null（プライベートリポジリやフォーク）を除外
  return reposWithLanguages.filter(Boolean) as RepoInfo[]; // 型アサーションを追加
}
