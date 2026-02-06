// GitHub APIから取得するリポジリ情報の型定義（必要なプロパティのみ抜粋）
export interface GitHubRepo {
  name: string;
  full_name: string;
  private: boolean;
  fork: boolean;
  owner: {
    login: string;
  };
  languages_url: string; // 言語取得のためのURL
}

// 処理後のリポジリ情報の型定義
// analyzeUserStats に渡される形式
export interface RepoInfo {
  name: string;
  full_name: string;
  languages: { [key: string]: number }; // 言語名: バイト数
}

// ユーザーの統計情報の型定義
export interface UserStats {
  totalBytes: number;
  level: number;
  rank: string; // title から rank に変更
  nextLevelExp: number; // 次のレベルアップに必要な経験値（バイト数）
}