import { PageLayout } from "../../shared/ui/PageLayout";

export const HelpPage = (): JSX.Element => {
  return (
    <PageLayout title="ヘルプ">
      <div className="card">
        <h3>使い方</h3>
        <ol>
          <li>対象選択で採点相手を選びます。</li>
          <li>点数入力で各項目の重要度と満足度を保存します。</li>
          <li>メイン画面で最新総合点と5角形を確認します。</li>
          <li>履歴カレンダーで過去の記録を見返します。</li>
        </ol>
      </div>
      <div className="card">
        <h3>計算式</h3>
        <p>総合点 = Σ(重要度 × 満足度) / Σ(重要度)</p>
      </div>
    </PageLayout>
  );
};
