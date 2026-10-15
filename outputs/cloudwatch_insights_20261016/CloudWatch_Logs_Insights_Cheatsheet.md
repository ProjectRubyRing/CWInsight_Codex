# CloudWatch Logs Insights 実践チートシート

仕様確認日：2026-10-16。48クエリ。対象言語：**Logs Insights QL**。

Excel版の「01_コピー用」D列は、改行・タブ・二重引用符を含まないコピー用1行クエリです。こちらのMarkdownでは同じクエリを段階ごとに改行して掲載します。

## 使い方

### 対象と言語

CloudWatch Logs の Logs Insights QL 専用です。SQL、PPL、ログストリームの「ログイベントを検索」に貼り付けるフィルターパターンとは入力先が違います。基本の対象はStandardクラスのロググループです。Java/JBossの実ログ形式・EAPのバージョンは未指定のため、本文検索を中心にし、JSONなどの条件付き例には条件を明記しました。

### 1. 画面を開く

AWSコンソールでアカウントとリージョンを確認し、CloudWatchのLog Analyticsを開きます。旧表示では「ログのインサイト / Logs Insights」です。クエリ言語は「Logs Insights QL」を選びます。2026-06-15に統合画面の提供が発表されました。表示名は言語や画面設定で変わることがあります。

### 2. 対象を選ぶ

画面のロググループ選択欄で調べるグループを選びます。クエリ内の@logフィルターは、選択済みの範囲から結果を絞るものです。未選択のグループを追加できません。SOURCEはCLI/API用であり、このチートシートの実行クエリには含めていません。

### 3. 時間を選ぶ

右上などの時間範囲選択で、まず直近15分・1時間など必要な範囲にします。過去の障害なら絶対時刻を指定し、画面のUTC/ローカル表示も確認します。クエリに日時条件を書いても、画面の検索範囲外のログは戻りません。

### 4. コピーして実行

「01_コピー用」シートのD列にあるクエリのセルを1つだけ選んでコピーし、クエリエディターの既存内容を全選択して置き換え、「クエリを実行 / Run query」を押します。D列はセル内部に改行・タブ・二重引用符を持たない1行の文字列です。見た目の折り返しはコピー内容に入りません。

### 5. 結果を読む

実行が完了してから件数・表示列・@messageを確認します。多くの例は最新200件だけ表示します。200件は全件数とは限りません。すべての件数が必要なら集計クエリを使います。0件は「その対象・期間・条件で一致なし」であり、システム全体が正常という証明ではありません。

### 変更せず使う例

Q01～Q03、Q13～Q14、Q17、Q22～Q36、Q40～Q43、Q45～Q46などは、画面で対象と期間を選べば検索条件を変更せずに実行できます。JSON用・EAP用などは、その形式やメッセージが存在することが前提です。一致するログがなければ0件になるのが通常です。

### 値を合わせる例

グループ名、ストリーム名、requestId、日時、任意キーワードを狙う例は、実在する値に変更して使います。資料中の/example/eap/prod、server-01、req-demo-001は説明用の架空値です。構文はそのまま実行できますが、架空値のままでは普通は一致しません。各クエリの「変更する値」を参照してください。

### 引用符とコピーの補足

クエリでは半角の単一引用符を使います。全角の引用符やスマートクォートへ変換しないでください。貼り付け先やExcelのバージョンによって引用符が追加される場合は、F2または数式バーでセル内容だけを選択してコピーするか、Markdownのコードブロックを使ってください。Meiryo UIでは正規表現のバックスラッシュが円記号のように表示される場合があります。見た目で打ち直さず、セルの文字列をコピーしてください。

### 読み方

02～06の解説シートはクエリIDごとに、目的、たとえ、実行条件、処理の段階、架空の入力例、期待結果、歴史・背景、注意点を載せています。01のIDをクリックすると解説へ移動できます。07には全体の仕組み・歴史・用語・出典があります。

### 確認範囲

2026-10-16に参照したAWS・Red Hat・Oracle等の公式公開資料を基に作成しました。記載例は実データを使わない教育用の例です。クエリの構成、正規表現の代表例、時刻境界、Excel/Markdownの一致をローカル検証しています。AWSアカウント上での実行結果は未検証です。

### 取得元

画面操作はS28、現行画面はS14、SOURCEはS05、基本構文はS01を参照してください。出典IDのURLと確認日は07シート末尾にまとめています。

## クエリ索引

| ID | 分類 | 目的 | 実行条件 |
| --- | --- | --- | --- |
| [Q01](#q01) | 基本検索と文字列の除外 | まず最新ログを200件読む | 値の変更不要。画面でグループと期間を選ぶ。 |
| [Q02](#q02) | 基本検索と文字列の除外 | ERROR・FATAL・SEVEREという語を拾う | 値の変更不要。本文のレベル表記を探す汎用例。 |
| [Q03](#q03) | 基本検索と文字列の除外 | エラー・例外・失敗の候補を広く探す | 値の変更不要。文章・JSONどちらの本文にも使用可能。 |
| [Q04](#q04) | 基本検索と文字列の除外 | JSONのlevelで正確に絞る | JSON等からlevelが検出されているログ向け。 |
| [Q05](#q05) | 基本検索と文字列の除外 | level・logLevel・severityの違いをそろえる | level、logLevel、severityのいずれかが文字列としてあるログ向け。 |
| [Q06](#q06) | 基本検索と文字列の除外 | 二つの文字列を両方含むログ | 任意の本文。例では小文字timeoutとdatabaseを検索。 |
| [Q07](#q07) | 基本検索と文字列の除外 | どちらかの文字列を含むログ | 任意の本文。例の文字列は大文字小文字を区別。 |
| [Q08](#q08) | 基本検索と文字列の除外 | 本文全体が指定文字列と等しいログ | 本文が文字列そのものになっているログ向け。 |
| [Q09](#q09) | 基本検索と文字列の除外 | 指定した文字列を含むログを除外 | 任意の本文。healthcheckを含まない全レベルが対象。 |
| [Q10](#q10) | 基本検索と文字列の除外 | 複数の文字列をまとめて除外 | 任意の本文。二つとも含まないものが残る。 |
| [Q11](#q11) | 基本検索と文字列の除外 | 大文字小文字を無視して複数語を除外 | 任意の本文。正規表現で除外する例。 |
| [Q12](#q12) | 基本検索と文字列の除外 | 指定loggerNameだけを除外し、項目なしは残す | JSON等のloggerNameがあるログと、ないログが混在する場合。 |
| [Q13](#q13) | 時間範囲とログの出どころ | 実行開始時点から直近15分 | 値の変更不要。画面の期間にも直近15分を含める。 |
| [Q14](#q14) | 時間範囲とログの出どころ | 直近24時間のエラー候補 | 値の変更不要。画面でも直近24時間を選択。 |
| [Q15](#q15) | 時間範囲とログの出どころ | 固定時間をepochミリ秒で指定 | 例は2026-10-01 09:00以上10:00未満JST。画面の期間も合わせる。 |
| [Q16](#q16) | 時間範囲とログの出どころ | JSTの日時をparseDateで数値へ直して指定 | 現行公式関数表のparseDateを使用。画面にも同じ日時範囲を設定。 |
| [Q17](#q17) | 時間範囲とログの出どころ | 取り込みまで1分を超えたログ | 値の変更不要。イベント発生時刻で十分な範囲を選択。 |
| [Q18](#q18) | 時間範囲とログの出どころ | ロググループ名を完全一致で絞る | 対象グループを画面で選択済みであること。 |
| [Q19](#q19) | 時間範囲とログの出どころ | ロググループ名を文字列で絞る | 画面で選択済みのグループの識別子を部分一致検索。 |
| [Q20](#q20) | 時間範囲とログの出どころ | 複数のロググループ名を指定 | 指定するグループを画面でも選択。 |
| [Q21](#q21) | 時間範囲とログの出どころ | 一つのログストリームへ絞る | 対象グループを画面で選択済みであること。 |
| [Q22](#q22) | JBoss EAPのコードと起動 | WFLY・旧JBAS系コードを広く探す | 値の変更不要。典型的なWFLY・JBASコードの形を検索。 |
| [Q23](#q23) | JBoss EAPのコードと起動 | WFLYCTL0013をピンポイントで探す | 値の変更不要。EAPの管理操作失敗候補を検索。 |
| [Q24](#q24) | JBoss EAPのコードと起動 | デプロイ・サービス失敗の関連コードを探す | 値の変更不要。代表的な関連コードの候補検索。 |
| [Q25](#q25) | JBoss EAPのコードと起動 | IJ000453・IJ000655で接続確保の失敗を探す | 値の変更不要。IronJacamar系の接続管理メッセージ。 |
| [Q26](#q26) | JBoss EAPのコードと起動 | ARJUNAのタイムアウト・中断候補を探す | 値の変更不要。WARNを含めて検索。 |
| [Q27](#q27) | JBoss EAPのコードと起動 | UT005023でWebリクエストの例外を探す | 値の変更不要。Undertow系の該当メッセージを検索。 |
| [Q28](#q28) | JBoss EAPのコードと起動 | 最初のEAP関連コードを取り出して件数順に集計 | 値の変更不要。代表的なコード形式を対象にした集計。 |
| [Q29](#q29) | JBoss EAPのコードと起動 | 起動開始・正常起動・関連失敗を時刻順に読む | 値の変更不要。できれば1台の短い起動期間に絞る。 |
| [Q30](#q30) | Javaの例外と原因の読み方 | JavaのException・Errorクラス名を広く探す | 値の変更不要。パッケージ名付きの代表的なJava例外表記。 |
| [Q31](#q31) | Javaの例外と原因の読み方 | NullPointerExceptionを探す | 値の変更不要。完全修飾クラス名が本文にある場合。 |
| [Q32](#q32) | Javaの例外と原因の読み方 | メモリー確保・スタックの異常を探す | 値の変更不要。二つの異なるErrorを候補検索。 |
| [Q33](#q33) | Javaの例外と原因の読み方 | クラスやメソッドの読み込み・互換性の問題 | 値の変更不要。代表的な型名を候補検索。 |
| [Q34](#q34) | Javaの例外と原因の読み方 | 通信・タイムアウトの例外を探す | 値の変更不要。TimeoutExceptionは通信以外も含む候補。 |
| [Q35](#q35) | Javaの例外と原因の読み方 | SQL例外とSQLStateの手掛かりを探す | 値の変更不要。JDBC・一部のDBドライバーの代表表記。 |
| [Q36](#q36) | Javaの例外と原因の読み方 | 最初のCaused byのクラス名を取り出す | 本文にCaused by:とクラス名があるイベント。 |
| [Q37](#q37) | Javaの例外と原因の読み方 | 例外名と具体的なエラーメッセージで絞る | 二つの文字列が同じイベントに入っていること。 |
| [Q38](#q38) | Javaの例外と原因の読み方 | requestIdで一つの依頼を時系列に追う | 列挙したJSON項目のいずれかに相関IDがあること。関連グループを画面で選択。 |
| [Q39](#q39) | Javaの例外と原因の読み方 | 例外の前後を同じグループ・ストリームで読む | 例は2026-10-01 09:00以上09:05未満JST。画面も合わせる。 |
| [Q40](#q40) | 集計と現在の追加機能 | エラー候補を5分ごとに数える | 値の変更不要。画面で調査期間を選択。 |
| [Q41](#q41) | 集計と現在の追加機能 | ロググループごとのエラー候補件数 | 関連する複数ロググループを画面で選択。 |
| [Q42](#q42) | 集計と現在の追加機能 | 最初のJava例外クラス別に件数を数える | 値の変更不要。完全修飾された代表的な例外名がある本文。 |
| [Q43](#q43) | 集計と現在の追加機能 | 本文が完全に同じエラー候補を1件にまとめる | 値の変更不要。本文全体を重複判定のキーにする。 |
| [Q44](#q44) | 集計と現在の追加機能 | 直近15分・対象グループ・エラー・除外を組み合わせる | 画面で目的のグループと直近15分以上の期間を選択。 |
| [Q45](#q45) | 集計と現在の追加機能 | 新機能：一致サンプルを20件見つけて早期終了 | 現行公式仕様のlimit anyを使用。最新順は不要な用途。 |
| [Q46](#q46) | 集計と現在の追加機能 | 新機能：実検索前にスキャン量を見積もる | 現行公式仕様のestimateを使用。結果はログ本文ではなく概算量。 |
| [Q47](#q47) | 集計と現在の追加機能 | 新機能：logfmtのlevelで絞る | level=error msg=...のようなlogfmt形式向け。普通のEAP文章ログには不適合。 |
| [Q48](#q48) | 集計と現在の追加機能 | 新機能：ロググループ名の前方一致 | 現行公式関数表のstartsWithを使用。対象グループは画面で選ぶ。 |

## 基本検索と文字列の除外

<a id="q01"></a>
### Q01　まず最新ログを200件読む

**実行条件：** 値の変更不要。画面でグループと期間を選ぶ。

**変更する値：** 必要なら200を変更します。

```text
fields @timestamp, @log, @logStream, @message
| sort @timestamp desc
| limit 200
```

**何が分かるか**

ログが届いているか、本文が文章かJSONか、レベルやコードがどの位置にあるかを最初に確認します。検索式を複雑にする前の出発点です。

**身近なたとえ**

図書館の棚を決めて、その中の新しい記録を200枚だけ机へ並べます。どんな書き方の記録なのかを見てから、探し方を決めます。

**処理の段階**

1. fieldsは時刻・グループ・ストリーム・本文を表示項目にします。ここでは条件を付けていないため、情報レベルもエラーも対象です。
2. sort @timestamp descは新しい時刻を先へ並べます。同じ時刻同士の順番は、この指定だけでは一意に決まりません。
3. limit 200は並べた結果から最大200件を返します。検索対象全体を200件だけ読むという指定ではありません。

**入力例（架空）**

```text
09:00 INFO start
09:01 ERROR failed
09:02 INFO ready
```

**期待する結果：** 09:02、09:01、09:00の順に3件。行を開いて本文全体を読めます。

**歴史・背景**

ログ分析では、形式を知らないまま特定の項目を使うと0件の理由が分からなくなります。2018年登場のLogs Insightsは対話的な探索を目的としており、まず少数の実物を見てから条件を加える使い方と相性があります。

**注意点**

0件なら期間・グループ・リージョン・取り込み状態を確認します。200件出ても「全件200件」とは限りません。

**次に調べること：** エラー候補はQ02・Q03、JSONのlevelが見えたらQ04へ進みます。

根拠となる資料：[S01 Logs Insights QL 構文・コマンド一覧](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html)、[S08 limit / limit any](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Limit.html)、[S11 Logs Insights 一般提供開始](https://aws.amazon.com/about-aws/whats-new/2018/11/announcing-amazon-cloudwatch-logs-insights-fast-interactive-log-analytics/)。

<a id="q02"></a>
### Q02　ERROR・FATAL・SEVEREという語を拾う

**実行条件：** 値の変更不要。本文のレベル表記を探す汎用例。

**変更する値：** WARNも対象にしたければ正規表現の選択肢へ|WARNを追加します。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like /(?i)(^|[^A-Za-z])(ERROR|FATAL|SEVERE)([^A-Za-z]|$)/
| sort @timestamp desc
| limit 200
```

**何が分かるか**

ERROR、FATAL、SEVEREを大文字小文字に関係なく探します。errorCountのように英字が続く語をある程度避けたいときに使います。

**身近なたとえ**

「赤」という札を探すとき、「赤道」という別の言葉まで拾わないように、札の前後も見ます。

**処理の段階**

1. (?i)はerrorとERRORの違いを無視します。(ERROR|FATAL|SEVERE)は三つの語のどれかという条件です。
2. (^|[^A-Za-z])は先頭または英字以外、([^A-Za-z]|$)は英字以外または末尾です。左右が別の英字に続く場合を外します。
3. 条件に合うイベント全体が残り、その中の一致部分だけを切り出すわけではありません。最後に最新200件を表示します。

**入力例（架空）**

```text
ERROR request failed
error timeout
INFO errorCount=0
INFO previous ERROR cleared
```

**期待する結果：** 1、2、4番目が残り、errorCountの行は外れます。4番目はレベルがINFOでも本文にERRORがあるため残ります。

**歴史・背景**

ログレベルは緊急度を短いラベルで共有するために使われます。ただし文章ログではレベルと本文が同じ文字列に入ります。この検索は初動の候補集めであり、名前付き項目を持つ構造化ログならQ04の方が意味を絞れます。

**注意点**

これは厳密なレベル解析ではありません。ERROR123は数字が境界扱いになるため一致します。WARNで出るARJUNAなどは対象外です。

**次に調べること：** JSONならQ04。レベルのない例外継続行も探すならQ03・Q30。

根拠となる資料：[S02 filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)、[S17 JBoss EAP 8.1 ロギング](https://docs.redhat.com/en/documentation/red_hat_jboss_enterprise_application_platform/8.1/html/configuration_guide/logging-with-jboss-eap_default)。

<a id="q03"></a>
### Q03　エラー・例外・失敗の候補を広く探す

**実行条件：** 値の変更不要。文章・JSONどちらの本文にも使用可能。

**変更する値：** 製品固有の表現があれば選択肢へ追加します。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like /(?i)(error|exception|fatal|failed|failure|エラー|例外|失敗)/
| sort @timestamp desc
| limit 200
```

**何が分かるか**

決まったレベルがないログや、Java例外の継続行も含めて、問題らしい言葉を広めに集めます。

**身近なたとえ**

落とし物を探すとき、色や形を厳しく決めず、似ている物をまず集めます。候補は増えますが、その後に本物か見分けます。

**処理の段階**

1. 正規表現の選択肢を一つでも含むイベントを残します。単語境界を設けないためNullPointerExceptionやerrorCountにも一致します。
2. 大文字小文字の違いを無視します。日本語の三つの語も独立した選択肢です。翻訳や語義を理解しているわけではありません。
3. 元本文を表示するので、否定表現や過去のエラー説明だったかを読み直せます。

**入力例（架空）**

```text
java.lang.NullPointerException
処理に失敗しました
INFO no error detected
INFO startup complete
```

**期待する結果：** 最初の3件が残ります。「no error detected」も文字としてerrorを含むため残ります。

**歴史・背景**

異なる言語・ライブラリ・製品を同時に運用すると、同じ問題でも文面がそろいません。候補を広く集めてから狭める探索は、この表記差への対処です。自然言語の意味を判定する仕組みではなく、明示した文字列の一致を使っています。

**注意点**

一致件数をそのまま障害件数と呼ばないでください。Exceptionを含まない独自メッセージは見つかりません。

**次に調べること：** 誤検出の語が分かったらQ09～Q11で除外条件を追加します。

根拠となる資料：[S02 filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)、[S12 Logs Insights 登場の背景](https://aws.amazon.com/blogs/aws/new-amazon-cloudwatch-logs-insights-fast-interactive-log-analytics/)。

<a id="q04"></a>
### Q04　JSONのlevelで正確に絞る

**実行条件：** JSON等からlevelが検出されているログ向け。

**変更する値：** フィールド名と実際の値を確認し、必要なら変更します。

```text
fields @timestamp, level, @log, @logStream, @message
| filter level in ['ERROR', 'FATAL', 'SEVERE']
| sort @timestamp desc
| limit 200
```

**何が分かるか**

本文にerrorという語が出ただけのINFOログを避け、levelという項目そのものを比較します。

**身近なたとえ**

作文の中に「欠席」と書いてあるかではなく、出欠表の「出席・欠席」の欄を見ます。指定した欄を見るので意味を取り違えにくくなります。

**処理の段階**

1. levelは自動的にどんな文章からも作られる項目ではありません。JSONの同名キーなど、実際のログ構造が前提です。
2. inはリストのどれかと等しいかを調べます。部分一致ではなく、ここでは大文字のERROR等と比較します。
3. levelと元の@messageを両方表示し、判定と本文の関係を確認できるようにします。

**入力例（架空）**

```text
{"level":"ERROR","message":"payment failed"}
{"level":"INFO","message":"no error detected"}
{"level":"error","message":"timeout"}
```

**期待する結果：** 1件目だけが残ります。小文字errorはこのリストに含めていないので残りません。

**歴史・背景**

ログを機械で集計するには、自由な文面より名前付きの項目が扱いやすくなります。JSONはそのための代表的な形式です。EAPにもJSONフォーマッターがあり、レベルとメッセージを別々に持てます。

**注意点**

levelがないイベントはこの条件に一致しません。標準クラスのフィールド自動検出を前提にした例です。

**次に調べること：** 小文字や別名が混ざる場合はQ05へ進みます。

根拠となる資料：[S02 filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)、[S04 自動検出されるフィールド](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)、[S17 JBoss EAP 8.1 ロギング](https://docs.redhat.com/en/documentation/red_hat_jboss_enterprise_application_platform/8.1/html/configuration_guide/logging-with-jboss-eap_default)。

<a id="q05"></a>
### Q05　level・logLevel・severityの違いをそろえる

**実行条件：** level、logLevel、severityのいずれかが文字列としてあるログ向け。

**変更する値：** 現場のフィールド名をcoalesceの引数へ合わせます。

```text
fields @timestamp, @log, @logStream, @message
| fields toupper(coalesce(level, logLevel, severity)) as detectedLevel
| filter detectedLevel in ['ERROR', 'FATAL', 'SEVERE']
| sort @timestamp desc
| limit 200
```

**何が分かるか**

アプリごとにレベル項目の名前や大文字小文字が違う場合に、同じ条件で探します。

**身近なたとえ**

「なまえ」「氏名」「名前」という別の見出しを、調べるときだけ一つの「名前」欄へ写すようなものです。

**処理の段階**

1. coalesceは左から最初の非null値を選びます。複数の項目がある場合は全部を比べず、左側を優先します。
2. toupperで選んだ文字列を大文字にしてdetectedLevelという一時項目へ入れます。元の保存ログは変わりません。
3. そろえた値をERROR等のリストと比較します。fieldsで追加したdetectedLevelも結果から確認できます。

**入力例（架空）**

```text
{"logLevel":"error"}
{"severity":"Fatal"}
{"level":"INFO","severity":"ERROR"}
```

**期待する結果：** 1、2件目が残ります。3件目はlevelのINFOが先に選ばれるため外れます。

**歴史・背景**

複数チームのアプリを一緒に調べると、同じ意味の項目でも名前が異なります。こうした揺れを検索時に整えると、各サービスの保存形式をすぐ変更できない期間にも調査を進められます。

**注意点**

空文字は非nullなので後続候補へ進みません。数値のseverityや前後の空白を自動的に同じ意味へ変換する例でもありません。

**次に調べること：** 結果のdetectedLevelを確認し、項目の優先順が正しいか見直します。

根拠となる資料：[S03 演算子・日時・文字列・JSON関数](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html)、[S04 自動検出されるフィールド](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)。

<a id="q06"></a>
### Q06　二つの文字列を両方含むログ

**実行条件：** 任意の本文。例では小文字timeoutとdatabaseを検索。

**変更する値：** timeoutとdatabaseを探したい二つの文字列へ変更します。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like 'timeout' and @message like 'database'
| sort @timestamp desc
| limit 200
```

**何が分かるか**

timeout全般の中から、databaseにも言及するイベントだけへ狭めます。

**身近なたとえ**

赤いボールの中から丸いものを選ぶので、「赤い」と「丸い」の両方が必要です。別のボールの特徴を足し合わせることはできません。

**処理の段階**

1. 単一引用符の文字列は部分一致です。二つの語が離れた位置にあっても、同じイベント内にあれば一致します。
2. andで結ぶため、片方だけを含むイベントは外れます。大文字小文字は区別されます。
3. 二つのイベントをまたいで条件を満たすことはありません。ERROR行と原因行が分割されている場合に差が出ます。

**入力例（架空）**

```text
database timeout
timeout while calling api
database connected
Database Timeout
```

**期待する結果：** 1件目だけ。4件目は大文字小文字が違うため一致しません。

**歴史・背景**

同じtimeoutでも通信・DB・処理待ちなど対象が異なります。広い検索結果に対象名を追加すると、担当範囲の切り分けができます。ただし、単語が出たことは原因の証明ではありません。

**注意点**

「timeout is disabled for database」も一致します。英文の意味までは判定しません。

**次に調べること：** 片方だけでも拾うならQ07。大文字小文字を無視するならそれぞれを/(?i)timeout/等にします。

根拠となる資料：[S02 filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)。

<a id="q07"></a>
### Q07　どちらかの文字列を含むログ

**実行条件：** 任意の本文。例の文字列は大文字小文字を区別。

**変更する値：** 二つの文字列を調べたい症状へ変更します。

```text
fields @timestamp, @log, @logStream, @message
| filter (@message like 'timeout' or @message like 'connection refused')
| sort @timestamp desc
| limit 200
```

**何が分かるか**

待ち時間切れと接続拒否の両方を、一度の検索で候補にします。

**身近なたとえ**

りんごかみかんなら受け取る箱です。片方でも両方でも条件を満たします。

**処理の段階**

1. orは一方以上の条件が真なら残します。両方を含む1イベントも1件として残り、2件に増えません。
2. 括弧で二つの選択肢をひとまとまりにしています。後からandで環境名などを追加しても意図を読み取りやすくなります。
3. 引用符の中の空白も文字列の一部です。connection refusedはその並びを含む場合に一致します。

**入力例（架空）**

```text
socket timeout
connection refused
timeout then connection refused
connection established
```

**期待する結果：** 最初の3件が残ります。3件目を二重に表示することはありません。

**歴史・背景**

通信失敗は待ち続けた結果のtimeoutと、接続開始時に拒否される場合などに分かれます。初動で一つの文面しか探さないと、別の失敗形態を見落とすため、候補を並べて探します。

**注意点**

rejected、timed outなど別の表現は自動追加されません。候補語は実ログに合わせて増やします。

**次に調べること：** 除外条件を足すなら括弧の後にandを付けるか、別のfilterへ分けます。

根拠となる資料：[S02 filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)。

<a id="q08"></a>
### Q08　本文全体が指定文字列と等しいログ

**実行条件：** 本文が文字列そのものになっているログ向け。

**変更する値：** Connection refusedを実際の本文全体へ変更します。

```text
fields @timestamp, @log, @logStream, @message
| filter @message = 'Connection refused'
| sort @timestamp desc
| limit 200
```

**何が分かるか**

部分一致では広すぎる場合に、本文全体の完全一致を使います。

**身近なたとえ**

「たろう」を含む名前を探すのではなく、名札にちょうど「たろう」と書かれた人を探します。

**処理の段階**

1. =は値全体の等しさを調べます。前後に時刻、ERROR、空白、改行などがあれば同じ文字列ではありません。
2. @messageはJSONのmessageキーの値とは別で、取り込まれた本文全体です。JSONなら波括弧等も含みます。
3. 結果が0件ならまずQ01で実際の本文を確認し、比較対象のフィールドが適切かを調べます。

**入力例（架空）**

```text
Connection refused
ERROR Connection refused
{"message":"Connection refused"}
```

**期待する結果：** 1件目だけ。JSONの内部messageを完全一致で調べる場合は比較対象をmessageへ変更します。

**歴史・背景**

検索では「同じ語を含む」と「同じ値である」を区別する必要があります。固定の短いイベントを監視・整理する場合は完全一致が有効ですが、日時やIDを含む文章ログでは一致しにくくなります。

**注意点**

コピー時の末尾改行や空白にも注意します。見た目が似ていても全角・半角の違いは残ります。

**次に調べること：** 前後に何か付くログを拾いたければlikeを使うQ06・Q07へ戻ります。

根拠となる資料：[S02 filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)、[S04 自動検出されるフィールド](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)。

<a id="q09"></a>
### Q09　指定した文字列を含むログを除外

**実行条件：** 任意の本文。healthcheckを含まない全レベルが対象。

**変更する値：** healthcheckを除外したい文字列へ変更します。

```text
fields @timestamp, @log, @logStream, @message
| filter @message not like 'healthcheck'
| sort @timestamp desc
| limit 200
```

**何が分かるか**

定期確認など同じメッセージが大量に出て調査しにくいとき、表示対象から外します。

**身近なたとえ**

仕分けするカードのうち「定期点検」と書かれたカードを別の箱へ置き、残りを読みます。保管庫のカードを捨てる操作ではありません。

**処理の段階**

1. not likeは指定文字列を含まないイベントを残します。単一引用符なので文字列中のドットや角括弧も検索規則にはなりません。
2. 小文字healthcheckとの一致であり、HealthCheckなどはそのままでは除外されません。
3. このクエリにはエラーフィルターがありません。INFO等も含む残りの最新200件を返します。

**入力例（架空）**

```text
INFO healthcheck OK
ERROR healthcheck failed
ERROR payment failed
INFO HealthCheck OK
```

**期待する結果：** 3、4件目が残ります。healthcheckの本当の失敗である2件目も除外されます。

**歴史・背景**

運用では正常な定期記録が障害の手掛かりを埋めることがあります。ノイズを減らすため除外が必要になりますが、除外語のある失敗まで消えるので、除外前の検索も保持して比較する習慣が役立ちます。

**注意点**

元ログは削除されません。空文字を除外語にすると意図せずほぼ全部を外すため、空のまま使わないでください。

**次に調べること：** 複数語を外すならQ10、大文字小文字をそろえるならQ11。

根拠となる資料：[S02 filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)。

<a id="q10"></a>
### Q10　複数の文字列をまとめて除外

**実行条件：** 任意の本文。二つとも含まないものが残る。

**変更する値：** 二つの除外語を実際のノイズに合わせます。

```text
fields @timestamp, @log, @logStream, @message
| filter @message not like 'healthcheck' and @message not like 'heartbeat'
| sort @timestamp desc
| limit 200
```

**何が分かるか**

healthcheckとheartbeatのどちらも表示したくない場合に使います。

**身近なたとえ**

「泥が付いていない」かつ「穴が開いていない」靴だけを選ぶのと同じです。一方だけ満たせばよい条件ではありません。

**処理の段階**

1. 最初の条件でhealthcheckを含むイベントを外します。二つ目の条件でheartbeatを含むイベントを外します。
2. andなので、両方の「含まない」が成立する場合だけ残ります。別々のfilterを2行書いても同じ論理になります。
3. orへ変えると、healthcheckだけの行は「heartbeatではない」を満たして残ります。除外の組み合わせで多い誤りです。

**入力例（架空）**

```text
healthcheck OK
heartbeat OK
healthcheck heartbeat
payment failed
```

**期待する結果：** 4件目だけが残ります。どちらか一方でも除外語を含めば外れます。

**歴史・背景**

一種類の正常ログを除いても、別の定期ログが大量に残ることがあります。除外規則を積み重ねるときこそ、日常語の「AやBを除く」を論理式へ正しく直す必要があります。

**注意点**

候補語を増やすほど取りこぼしも増えます。除外条件の一覧を運用上の根拠と一緒に管理します。

**次に調べること：** 一つの正規表現にまとめ、大文字小文字も無視したい場合はQ11。

根拠となる資料：[S02 filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)。

<a id="q11"></a>
### Q11　大文字小文字を無視して複数語を除外

**実行条件：** 任意の本文。正規表現で除外する例。

**変更する値：** 括弧内の選択肢を変更。記号を含む語はエスケープを確認します。

```text
fields @timestamp, @log, @logStream, @message
| filter @message not like /(?i)(healthcheck|heartbeat)/
| sort @timestamp desc
| limit 200
```

**何が分かるか**

HealthCheck、HEARTBEATなどの表記差がある定期ログをまとめて外します。

**身近なたとえ**

大文字の名札も小文字の名札も同じ名前として扱い、指定の名前の人を候補から外します。

**処理の段階**

1. /(?i).../は大文字小文字を無視する正規表現です。|で並べたどれかが見つかるかを調べます。
2. not likeなので、選択肢のどれも見つからないイベントを残します。Q10の二つの否定をandで結ぶ考え方と対応します。
3. 正規表現の記号は意味を持ちます。例の語は英字だけですが、a.bをそのまま選択肢へ入れるとaxbにも一致します。

**入力例（架空）**

```text
HealthCheck OK
HEARTBEAT OK
ERROR payment failed
```

**期待する結果：** 3件目だけが残ります。

**歴史・背景**

ログの表記はライブラリや担当者で変わります。表記差への対処を個別条件で増やす代わりに、大小文字を無視する規則へまとめると意図を読みやすくできます。

**注意点**

普通の文字列を安全に探すだけならQ09・Q10が分かりやすい選択です。正規表現の機能を必要以上に使うと、除外範囲が広がることがあります。

**次に調べること：** 除外前の件数と比較し、実際の障害まで隠していないか本文を確認します。

根拠となる資料：[S02 filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)。

<a id="q12"></a>
### Q12　指定loggerNameだけを除外し、項目なしは残す

**実行条件：** JSON等のloggerNameがあるログと、ないログが混在する場合。

**変更する値：** com.example.HealthCheckを除外対象の完全な値へ変更します。

```text
fields @timestamp, @log, @logStream, @message
| filter (not ispresent(loggerName)) or loggerName != 'com.example.HealthCheck'
| sort @timestamp desc
| limit 200
```

**何が分かるか**

特定ロガーの記録だけを外し、loggerName項目のない文章ログまで調査対象から落とさないようにします。

**身近なたとえ**

名札のある人なら指定の名前を除き、名札を付けていない人は別途残します。「名前が違う人」だけでは、名前を読めない人の扱いが曖昧になります。

**処理の段階**

1. ispresentは項目が存在するかを調べます。notを付けた左側はloggerNameのないイベントを受け入れます。
2. 右側はloggerNameが指定値と等しくない場合を受け入れます。完全一致の除外なので、com.example.HealthCheckExtraは残ります。
3. orで二つを結び、項目なしも別名も残します。欠損値の比較だけに依存しない形です。

**入力例（架空）**

```text
{"loggerName":"com.example.HealthCheck"}
{"loggerName":"com.example.Payment"}
ERROR plain text
```

**期待する結果：** 2、3件目が残ります。空文字のloggerNameも指定値とは異なるので残ります。

**歴史・背景**

構造化ログへ一度に移行できず、新旧形式が混ざる期間があります。項目のある記録だけを前提にした除外は調査の母集団を変えるため、項目がない場合の扱いを式へ明示します。

**注意点**

JSONで明示的にnullを入れた場合も残したいなら、実データの扱いを確認し、coalesceなどで方針を明示します。この例の主眼は項目そのものがない場合です。

**次に調べること：** 本文にレベル語がある記録だけへ絞るなら、後ろにQ02のfilterを追加します。

根拠となる資料：[S03 演算子・日時・文字列・JSON関数](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html)、[S04 自動検出されるフィールド](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)。

## 時間範囲とログの出どころ

<a id="q13"></a>
### Q13　実行開始時点から直近15分

**実行条件：** 値の変更不要。画面の期間にも直近15分を含める。

**変更する値：** 15を必要な分数へ変更します。

```text
fields @timestamp, @log, @logStream, @message
| filter toMillis(@timestamp) >= (now() * 1000 - 15 * 60 * 1000) and toMillis(@timestamp) <= now() * 1000
| sort @timestamp desc
| limit 200
```

**何が分かるか**

毎回日時を書き換えず、実行した時点に近いログを探します。

**身近なたとえ**

今から15分前までの出来事だけをノートから探します。昨日のページを開いたままでは、今日の出来事は見つかりません。

**処理の段階**

1. now()はクエリ処理が始まった時刻をepoch秒で返します。1000倍してミリ秒へ直します。
2. 15×60×1000は15分に相当するミリ秒です。それを引いた時刻以上のイベントを残します。上限も付け、未来時刻の記録を除きます。
3. toMillis(@timestamp)もミリ秒なので単位がそろいます。画面の期間とこの条件の共通範囲が実際の対象です。

**入力例（架空）**

```text
実行開始を10:00:00と仮定
09:44:59.999 / 09:45:00.000 / 09:59:00.000 / 10:01:00.000
```

**期待する結果：** 09:45:00と09:59:00が残ります。10:00:00ちょうども上限に一致すれば残ります。

**歴史・背景**

繰り返す運用確認では、同じ問いを毎回「今」を基準に実行したいことがあります。相対時間は日時の手入力を減らせますが、後日同じ結果を再現するには固定期間の記録が必要です。

**注意点**

now()は画面で選んだ期間の終了時刻ではありません。過去の期間を選んだまま実行すると0件になり得ます。

**次に調べること：** 過去障害の再現はQ15・Q16を使います。

根拠となる資料：[S03 演算子・日時・文字列・JSON関数](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html)、[S28 コンソールでサンプルクエリを実行](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData_RunSampleQuery.html)。

<a id="q14"></a>
### Q14　直近24時間のエラー候補

**実行条件：** 値の変更不要。画面でも直近24時間を選択。

**変更する値：** 24を必要な時間数へ変更します。

```text
fields @timestamp, @log, @logStream, @message
| filter toMillis(@timestamp) >= (now() * 1000 - 24 * 60 * 60 * 1000) and toMillis(@timestamp) <= now() * 1000
| filter @message like /(?i)(^|[^A-Za-z])(ERROR|FATAL|SEVERE)([^A-Za-z]|$)/
| sort @timestamp desc
| limit 200
```

**何が分かるか**

夜間や前日の作業を含む一定時間のエラー候補をまとめて確認します。

**身近なたとえ**

今日の今の時刻から、時計を一周さかのぼった分の赤い札を探します。カレンダー上の「昨日1日」とは範囲が違います。

**処理の段階**

1. 24×60×60×1000は24時間分のミリ秒です。Q13と同じ比較を時間単位へ広げます。
2. 次のfilterでERROR等の語を持つイベントへさらに絞ります。時間条件だけを満たすINFOは残りません。
3. 新しい順で200件まで返すため、1日分の全件を示すわけではありません。総件数はstatsで別途数えます。

**入力例（架空）**

```text
実行開始10/16 10:00を仮定
10/15 09:59 ERROR
10/15 10:00 ERROR
10/16 09:00 INFO
10/16 09:30 ERROR
```

**期待する結果：** 10/15 10:00と10/16 09:30のERRORが候補になります。

**歴史・背景**

当番の引き継ぎでは、担当時間だけでなく前の担当時間に始まった異常も知る必要があります。移動する24時間窓は日々の確認に使えます。一方、日報で「JSTの昨日0時～24時」を集計するなら固定した暦日を選びます。

**注意点**

24時間と「今日」「昨日」は同じではありません。大量ログではまず時間と対象を絞ります。

**次に調べること：** 増加時刻を見るなら同じ時間条件にQ40の集計を組み合わせます。

根拠となる資料：[S03 演算子・日時・文字列・JSON関数](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html)、[S02 filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)、[S07 stats](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Stats.html)。

<a id="q15"></a>
### Q15　固定時間をepochミリ秒で指定

**実行条件：** 例は2026-10-01 09:00以上10:00未満JST。画面の期間も合わせる。

**変更する値：** 開始・終了のepochミリ秒を調査日時へ変更します。

```text
fields @timestamp, @log, @logStream, @message
| filter toMillis(@timestamp) >= 1790812800000 and toMillis(@timestamp) < 1790816400000
| sort @timestamp desc
| limit 200
```

**何が分かるか**

障害報告の時刻を固定し、後から同じ時間窓を再検索できるようにします。

**身近なたとえ**

ノートに付けるしおりを「今の少し前」ではなく「10月1日9時から10時まで」に固定します。

**処理の段階**

1. 1790812800000は2026-10-01 00:00 UTC、つまり09:00 JSTです。1790816400000はその1時間後です。
2. 開始は>=で含め、終了は<で含めません。隣の時間窓と接続しても境界を二重計上しない形です。
3. 13桁のミリ秒値を比較します。10桁のepoch秒を誤って入れると、意図する日付になりません。

**入力例（架空）**

```text
2026-10-01 JST
08:59:59.999 / 09:00:00.000 / 09:59:59.999 / 10:00:00.000
```

**期待する結果：** 09:00:00.000と09:59:59.999が残ります。10:00ちょうどは次の時間窓です。

**歴史・背景**

時刻文字列は時差や表示形式の解釈が問題になります。数値へそろえれば比較条件を明確にできます。固定期間は障害の再調査・担当者間の再現・検証前後の比較に向きます。

**注意点**

画面で直近1時間を選んだまま、この過去の条件だけを書いても検索できません。数値だけでは人が読みにくいので、元のJST日時も記録します。

**次に調べること：** 日時を読みやすく書きたい場合はQ16。

根拠となる資料：[S03 演算子・日時・文字列・JSON関数](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html)、[S28 コンソールでサンプルクエリを実行](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData_RunSampleQuery.html)。

<a id="q16"></a>
### Q16　JSTの日時をparseDateで数値へ直して指定

**実行条件：** 現行公式関数表のparseDateを使用。画面にも同じ日時範囲を設定。

**変更する値：** 二つの日時を変更。日本以外ならタイムゾーンも合わせます。

```text
fields @timestamp, @log, @logStream, @message
| filter toMillis(@timestamp) >= parseDate('2026-10-01 09:00:00', 'yyyy-MM-dd HH:mm:ss', 'Asia/Tokyo') and toMillis(@timestamp) < parseDate('2026-10-01 10:00:00', 'yyyy-MM-dd HH:mm:ss', 'Asia/Tokyo')
| sort @timestamp desc
| limit 200
```

**何が分かるか**

固定日時を人が読みやすい文字列で残しつつ、比較は数値で行います。

**身近なたとえ**

「午前9時」という言葉を計算用の時計の数字へ翻訳してから、前後を比べます。翻訳に使う地域も明記します。

**処理の段階**

1. parseDateは文字列を指定書式で解釈し、epochミリ秒を返します。ここではAsia/Tokyoを明示します。
2. yyyyは年、MMは月、ddは日、HHは24時間制の時、mmは分、ssは秒です。MMとmmを入れ替えると意味が変わります。
3. toMillis(@timestamp)と数値同士を比較します。@timestampをそのまま任意の日時文字列と比べる書き方は採用しません。

**入力例（架空）**

```text
Q15と同じ4つの境界時刻を入力したと仮定します。
```

**期待する結果：** Q15と同じ2件が残る意図のクエリです。開始・終了の数値はそれぞれ1790812800000、1790816400000です。

**歴史・背景**

読みやすさと機械的な比較を両立するための変換です。確認日現在のAWS公式表にparseDateが掲載されていますが、この資料では未確認の導入年月は付けません。

**注意点**

書式と文字列を一致させます。公式ページには人間向け日時の直接フィルターを非対応とする注意もありますが、この例は数値への明示変換を挟みます。利用環境で未対応ならQ15を使います。

**次に調べること：** 画面の表示タイムゾーンも確認し、同じ時間窓として読めるか確かめます。

根拠となる資料：[S03 演算子・日時・文字列・JSON関数](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html)。

<a id="q17"></a>
### Q17　取り込みまで1分を超えたログ

**実行条件：** 値の変更不要。イベント発生時刻で十分な範囲を選択。

**変更する値：** 60は秒のしきい値です。必要に応じて変更します。

```text
fields @timestamp, @log, @logStream, @message
| fields (toMillis(@ingestionTime) - toMillis(@timestamp)) / 1000 as ingestionLagSeconds
| filter ingestionLagSeconds > 60
| sort ingestionLagSeconds desc
| limit 200
```

**何が分かるか**

ログが遅れて届いていそうなイベントを調べます。障害時刻と画面に現れた時刻の食い違いを調べる入口です。

**身近なたとえ**

手紙を書いた時刻と、郵便局へ届いた時刻の差を測ります。長い差があっても、配達だけでなく出すまで待っていた可能性もあります。

**処理の段階**

1. 二つの時刻を同じミリ秒単位へ直し、到着時刻からイベント時刻を引きます。
2. 1000で割って秒にします。60より大きい値なので、ちょうど60秒は対象外、60.001秒は対象です。
3. sortは時刻ではなく差の大きい順です。遅延候補の大きなものを先に表示します。

**入力例（架空）**

```text
発生09:00:00・到着09:00:30
発生09:00:00・到着09:02:00
発生09:03:00・到着09:02:00
```

**期待する結果：** 2件目が120秒として残ります。3件目の負の差はこの条件には残りません。

**歴史・背景**

収集処理は送信をまとめたり再送したりするため、記録の時刻と受信時刻がずれることがあります。時刻の意味を分けると「今起きた問題」と「前の問題が今届いた」を混同しにくくなります。

**注意点**

ネットワーク遅延の確定値ではありません。時計ずれや収集時の日時解釈も含みます。画面の期間は@ingestionTimeを基準に自動変更されません。

**次に調べること：** 本文の日時、収集エージェントの設定、対象ホストの時計と合わせて確認します。

根拠となる資料：[S03 演算子・日時・文字列・JSON関数](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html)、[S04 自動検出されるフィールド](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)、[S16 CloudWatch Agent 設定](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-Configuration-File-Details.html)。

<a id="q18"></a>
### Q18　ロググループ名を完全一致で絞る

**実行条件：** 対象グループを画面で選択済みであること。

**変更する値：** /example/eap/prodを実在するグループ名へ変更します。

```text
fields @timestamp, @log, @logStream, @message
| parse @log /^[^:]+:(?<groupName>.*)$/
| filter groupName = '/example/eap/prod'
| sort @timestamp desc
| limit 200
```

**何が分かるか**

複数グループを選んだ検索から、特定名のグループだけを残します。

**身近なたとえ**

棚の札に「所有者番号:棚の名前」と書かれているので、コロンの後ろの名前を取り出して比べます。

**処理の段階**

1. @logは通常account-id:log-group-nameです。^[^:]+:で先頭から最初のコロンまでを読み飛ばします。
2. (?<groupName>.*)で残りをgroupNameという一時項目へ入れます。末尾$まで読むので名前全体です。
3. =でグループ名全体を比較します。/prod-oldのような別名は残りません。

**入力例（架空）**

```text
111122223333:/example/eap/prod
111122223333:/example/eap/prod-old
444455556666:/example/eap/prod
```

**期待する結果：** 画面で両アカウントが検索対象なら、1、3件目が残ります。アカウントを取り除いて名前だけを比べるためです。

**歴史・背景**

複数環境や複数アカウントをまとめて観測すると、同じ名前のグループが別の場所にも存在します。名前と所有者を分けて考えると、検索の意味が明確になります。

**注意点**

一つのアカウントだけを狙うなら、@log全体を実際の「アカウントID:グループ名」と完全一致で比較する方法もあります。フィルターは未選択グループを追加しません。

**次に調べること：** 名前の一部分で探す場合はQ19、複数の名前ならQ20。

根拠となる資料：[S04 自動検出されるフィールド](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)、[S05 SOURCE](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Source.html)、[S06 parse](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Parse.html)。

<a id="q19"></a>
### Q19　ロググループ名を文字列で絞る

**実行条件：** 画面で選択済みのグループの識別子を部分一致検索。

**変更する値：** :/example/eap/を目的のグループ名の並びへ変更します。

```text
fields @timestamp, @log, @logStream, @message
| filter @log like ':/example/eap/'
| sort @timestamp desc
| limit 200
```

**何が分かるか**

環境名などの共通部分を持つ複数グループを手早く残します。

**身近なたとえ**

棚の名前に共通の目印が付いているので、その目印がある棚のカードだけを使います。

**処理の段階**

1. likeの引用符付き文字列は部分一致です。スラッシュを正規表現の区切りと混同せず、文字として扱えます。
2. 先頭のコロンは@logのアカウントと名前の区切りを利用しています。この例では名前が/example/eap/で始まる並びを狙います。
3. 検索先を選ぶSOURCEの代用品ではありません。画面で選ばれた対象の中で、結果を絞る条件です。

**入力例（架空）**

```text
111122223333:/example/eap/prod
111122223333:/example/eap/test
111122223333:/example/api/prod
```

**期待する結果：** 最初の2グループのイベントが残ります。prodだけに限定する式ではありません。

**歴史・背景**

運用の命名規則に共通の接頭部分を付けると、関連システムをまとめて探しやすくなります。検索はその命名規則を利用するため、命名が揃っていないグループの見落としに注意します。

**注意点**

対象を減らしたいだけなら、まず画面で必要なグループだけを選ぶ方が検索範囲を明確にできます。

**次に調べること：** 明示的な前方一致の関数を使う例はQ48。

根拠となる資料：[S02 filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)、[S04 自動検出されるフィールド](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)、[S05 SOURCE](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Source.html)。

<a id="q20"></a>
### Q20　複数のロググループ名を指定

**実行条件：** 指定するグループを画面でも選択。

**変更する値：** リスト内の名前を実際のグループ名へ変更します。

```text
fields @timestamp, @log, @logStream, @message
| parse @log /^[^:]+:(?<groupName>.*)$/
| filter groupName in ['/example/eap/prod', '/example/api/prod']
| sort @timestamp desc
| limit 200
```

**何が分かるか**

EAPとAPIなど、関連する複数のサービスを同じ時間軸で調べます。

**身近なたとえ**

図書館の棚番号を二つ指定し、その二つの棚の記録を一枚の時刻順の一覧へ集めます。

**処理の段階**

1. Q18と同様に@logからグループ名を抽出します。
2. inのリストにある名前のどれかと完全一致するイベントを残します。部分一致のために*を入れる構文ではありません。
3. グループをまたいで時刻順に並べます。@logと@logStreamを表示しているため出どころを失いません。

**入力例（架空）**

```text
/example/eap/prod 09:01 ERROR
/example/api/prod 09:02 ERROR
/example/eap/test 09:03 ERROR
```

**期待する結果：** prodの2件が残ります。09:02のAPIが先、その次が09:01のEAPです。

**歴史・背景**

利用者の一つの依頼が複数サービスを通る構成では、一つのサーバーだけ見ても流れが分かりません。関連する出どころを並べて読むための入口です。

**注意点**

近い時刻というだけでは同じ依頼とは限りません。複数アカウントの同名グループも対象になるので、必要ならアカウント込みで絞ります。

**次に調べること：** 同じ依頼を正確に追うにはQ38で相関IDを使います。

根拠となる資料：[S02 filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)、[S04 自動検出されるフィールド](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)、[S06 parse](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Parse.html)。

<a id="q21"></a>
### Q21　一つのログストリームへ絞る

**実行条件：** 対象グループを画面で選択済みであること。

**変更する値：** server-01を結果に表示された実際のストリーム名へ変更します。

```text
fields @timestamp, @log, @logStream, @message
| filter @logStream = 'server-01'
| sort @timestamp desc
| limit 200
```

**何が分かるか**

複数台の中で特定のサーバーやコンテナ由来の記録を調べます。

**身近なたとえ**

同じ棚に複数のノートがあるとき、まず1冊を選んで読みます。

**処理の段階**

1. @logStreamの値を完全一致で比べます。名前の一部を使う場合は=からlikeへ変更します。
2. ストリーム名の形式は収集方法が決めます。必ずしもホスト名と等しいわけではありません。
3. 選んだストリームのイベントを新しい順に表示します。元のグループも結果に残して確認できます。

**入力例（架空）**

```text
server-01 09:00 ERROR
server-02 09:01 ERROR
server-01-old 09:02 ERROR
```

**期待する結果：** 1件目だけが残ります。

**歴史・背景**

同じアプリでも一部のインスタンスだけで失敗する場合があります。出どころを限定すると、その個体の起動時刻・設定・接続状態などと照らし合わせやすくなります。

**注意点**

別グループに同名ストリームがあればそれも残ります。単一の出どころを特定したいときはグループとストリームの両方で絞ります。

**次に調べること：** 例外の前後関係を読むならQ39。

根拠となる資料：[S02 filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)、[S04 自動検出されるフィールド](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)。

## JBoss EAPのコードと起動

<a id="q22"></a>
### Q22　WFLY・旧JBAS系コードを広く探す

**実行条件：** 値の変更不要。典型的なWFLY・JBASコードの形を検索。

**変更する値：** 特定コードが分かっていればQ23へ切り替えます。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like /(WFLY[A-Z]+[0-9]{4}|JBAS[0-9]{6}):/
| sort @timestamp desc
| limit 200
```

**何が分かるか**

EAP本体が出すメッセージの候補を、文章の言語に左右されにくいコードで探します。

**身近なたとえ**

説明文を全部読む前に、本の背表紙に付いた分類番号を探します。番号がある本すべてが問題の本というわけではありません。

**処理の段階**

1. WFLY[A-Z]+[0-9]{4}はWFLYに英大文字が続き、その後に数字4文字がある形を探します。WFLYSRV0025などが該当します。
2. JBAS[0-9]{6}は旧系統の代表的な数字6文字の形です。末尾のコロンも条件にし、文中の単なる説明語との差を付けます。
3. レベルは判定していません。起動・停止・警告・失敗などの候補が一緒に出ます。

**入力例（架空）**

```text
INFO WFLYSRV0025: server started
ERROR WFLYCTL0013: operation failed
ERROR JBAS014777: service example
WARN ARJUNA012117: transaction example
```

**期待する結果：** 最初の3件が残ります。ARJUNAはこの正規表現の対象外です。説明文は教育用に短縮しています。

**歴史・背景**

旧JBoss ASからWildFlyへ続く系統と製品版EAPの世代差により、運用ログには接頭辞の異なるメッセージが混在します。番号を軸にすると、同じ種類のメッセージを追いやすくなります。

**注意点**

EAPに含まれる全ライブラリのコードを網羅する式ではありません。コードの存在だけでエラーと判断しないでください。

**次に調べること：** 接続はQ25、トランザクションはQ26、Web処理はQ27を確認します。

根拠となる資料：[S17 JBoss EAP 8.1 ロギング](https://docs.redhat.com/en/documentation/red_hat_jboss_enterprise_application_platform/8.1/html/configuration_guide/logging-with-jboss-eap_default)、[S22 WildFly 公式サイトの2013年案内](https://www.wildfly.org/news/2013/11/15/Welcome-to-the-new-WildFly-ORG/)、[S06 parse](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Parse.html)。

<a id="q23"></a>
### Q23　WFLYCTL0013をピンポイントで探す

**実行条件：** 値の変更不要。EAPの管理操作失敗候補を検索。

**変更する値：** 別の既知コードを探すときはコロンまで含めて置き換えます。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like 'WFLYCTL0013:'
| sort @timestamp desc
| limit 200
```

**何が分かるか**

デプロイや設定変更などの操作が失敗した記録を探し、どの操作・対象だったかを読みます。

**身近なたとえ**

「申し込みを受け付けられませんでした」という整理番号の通知を集め、通知の詳細欄で失敗理由を調べます。

**処理の段階**

1. コード文字列とコロンの並びを含むイベントを残します。WFLYCTL00130のような長い数字の一部として拾いにくくします。
2. メッセージ本文に出る操作名、対象のaddress、failure descriptionなどを読みます。コード自体は原因を一つに決めません。
3. 同じ時刻近くにWFLYCTL0080やWFLYSRV0153、Java例外があれば関連候補としてたどります。

**入力例（架空）**

```text
ERROR WFLYCTL0013: deployment operation failed
INFO WFLYSRV0025: server started
```

**期待する結果：** 1件目が残ります。実ログの操作名や失敗説明は省略せず読んでください。

**歴史・背景**

管理操作は設定・依存サービス・デプロイ対象など多くの部品へ影響します。失敗を操作単位でまとめた外側の通知を探すと、利用者が実行した変更とログを対応させやすくなります。

**注意点**

「WFLYCTL0013があるからDB障害」などと原因を固定しないでください。同じコードでも内側の理由は異なります。

**次に調べること：** Q24で関連コードを一緒に探し、Q36でCaused byを確認します。

根拠となる資料：[S18 デプロイ失敗とClassNotFoundExceptionの例](https://access.redhat.com/solutions/3353921)、[S02 filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)。

<a id="q24"></a>
### Q24　デプロイ・サービス失敗の関連コードを探す

**実行条件：** 値の変更不要。代表的な関連コードの候補検索。

**変更する値：** 環境で確認した関連コードを追加できます。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like /(WFLYCTL0013|WFLYCTL0080|WFLYSRV0153):/
| sort @timestamp desc
| limit 200
```

**何が分かるか**

操作失敗、失敗サービスの一覧、デプロイ段階の失敗を横断して探します。

**身近なたとえ**

文化祭が開けないとき、「開催準備失敗」「会場準備失敗」「照明の取り付け失敗」という別の階層の連絡を集めるイメージです。

**処理の段階**

1. 三つのコードのいずれかを含むイベントを残します。1イベントに複数のコードがあっても、ここではイベントは1件のままです。
2. WFLYCTL0013は操作失敗、WFLYCTL0080は失敗サービス、WFLYSRV0153はデプロイ処理の段階に関する失敗の手掛かりです。
3. 本文にあるPARSE、STRUCTURE、POST_MODULEなどの段階名と、さらに内側の例外を確認します。

**入力例（架空）**

```text
ERROR WFLYCTL0013: failed; WFLYCTL0080: failed services; WFLYSRV0153: deployment phase failed
INFO WFLYSRV0025: server started
```

**期待する結果：** 1件目が1イベントとして残ります。コード3個だから失敗3回と数えるわけではありません。

**歴史・背景**

アプリの配置は一つの動作に見えても、読み込み・解析・依存関係の解決などの段階があります。外側と内側のメッセージが連なるため、関連するコードをまとめると調査が途切れにくくなります。

**注意点**

これらのコードは失敗の位置を示す手掛かりで、原因の種類を網羅した一覧ではありません。対象版の本文を必ず確認します。

**次に調べること：** クラス関係ならQ33、DB関係ならQ25・Q35、全文の前後関係はQ39。

根拠となる資料：[S18 デプロイ失敗とClassNotFoundExceptionの例](https://access.redhat.com/solutions/3353921)、[S06 parse](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Parse.html)。

<a id="q25"></a>
### Q25　IJ000453・IJ000655で接続確保の失敗を探す

**実行条件：** 値の変更不要。IronJacamar系の接続管理メッセージ。

**変更する値：** DB名等を加える場合は、同じイベントにあることを確認します。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like /(IJ000453|IJ000655):/
| sort @timestamp desc
| limit 200
```

**何が分かるか**

管理された接続を取得できなかった、または待ち時間内に接続が空かなかった記録を探します。

**身近なたとえ**

共有のはさみを借りようとしても全部貸し出し中で、待ち時間を過ぎた状況に似ています。ただし、はさみの保管場所自体が開かない場合もあります。

**処理の段階**

1. IJ000453とIJ000655のどちらかを含むイベントを残します。ERRORという単語を追加条件にしないので、例外の継続行も候補です。
2. 接続先のJNDI名や内側の例外を読み、どの資源を借りられなかったのかを確認します。
3. 件数が増えた時刻と、接続を返せているか、外部サービスの状態などを突き合わせます。

**入力例（架空）**

```text
IJ000453: connection allocation failed for example resource
IJ000655: waiting for a connection exceeded timeout
INFO connection acquired
```

**期待する結果：** 1、2件目が残ります。例文は意味を説明するための架空の短縮ログです。

**歴史・背景**

接続プールは接続を再利用して負荷を抑えます。その一方、借りた接続が返らない、処理が長い、接続先へ入れない場合には取得待ちが発生します。このコードは、その観測点を見つける手掛かりです。

**注意点**

プール不足や接続リークを断定するコードではありません。IJ000453はJMS資源でも現れるため、DB専用と決めつけません。

**次に調べること：** 内側のSQL例外はQ35。トランザクションの待ち時間はQ26も確認します。

根拠となる資料：[S19 接続プールの接続不足](https://access.redhat.com/solutions/17782)、[S29 JMSでも現れるIJ000453](https://access.redhat.com/solutions/3641261)。

<a id="q26"></a>
### Q26　ARJUNAのタイムアウト・中断候補を探す

**実行条件：** 値の変更不要。WARNを含めて検索。

**変更する値：** 対象版で確認した関連コードを追加できます。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like /(ARJUNA012117|ARJUNA012095|ARJUNA012108|ARJUNA012121):/
| sort @timestamp desc
| limit 200
```

**何が分かるか**

トランザクションが時間内に終わらず、中断や取り消しに進んだ痕跡を調べます。

**身近なたとえ**

給食の配膳を「全部そろってから完了」とする約束で、時間を過ぎてもそろわず、いったん取りやめる状況です。

**処理の段階**

1. 四つのコードをorで探します。レベルをERRORに限定しないためWARNの通知も残ります。
2. ARJUNA012117などの本文にあるトランザクションIDと、その後の中断・取り消し通知を対応させます。
3. 同じIDに対する複数メッセージが出ても、別々の業務トランザクションとは限りません。

**入力例（架空）**

```text
WARN ARJUNA012117: transaction check example
WARN ARJUNA012121: cancellation example
INFO business completed
```

**期待する結果：** 最初の2件が残ります。ERRORだけを検索するQ02では拾えない場合があります。

**歴史・背景**

複数の更新をまとめるトランザクションには、永遠に資源を占有しないよう期限が必要です。Red Hatの資料では、7.4.0より前と以後でARJUNA012117の文面が変わることも示されています。コードで探すと文面差に対応しやすくなります。

**注意点**

タイムアウト値を増やすだけで根本原因が直るとは限りません。DB待ち、外部呼び出し、スレッドの停滞などを調べます。

**次に調べること：** 関連する処理のID・時刻を使いQ38・Q39へ進みます。

根拠となる資料：[S20 トランザクション中断・タイムアウト](https://access.redhat.com/solutions/18425)。

<a id="q27"></a>
### Q27　UT005023でWebリクエストの例外を探す

**実行条件：** 値の変更不要。Undertow系の該当メッセージを検索。

**変更する値：** 特定URLも狙うなら同じイベントにある文字列条件を追加。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like 'UT005023:'
| sort @timestamp desc
| limit 200
```

**何が分かるか**

Webリクエストの処理中に例外が起きた記録を探します。利用者の「画面がエラーになった」とサーバー側の情報を結び付ける入口です。

**身近なたとえ**

窓口係が「この受付を処理できませんでした」と報告した札を集め、札の裏にある詳しい理由を読みます。

**処理の段階**

1. UT005023:という識別子のあるイベントを残します。URLの形が違ってもコードを軸に探せます。
2. 本文の対象パスや、その後のJava例外クラス名を読みます。UT005023自体から根本原因を一つに決めません。
3. 最新順で表示し、同じURL・同じ例外が集中していないかを確認します。

**入力例（架空）**

```text
ERROR UT005023: request example; java.lang.NullPointerException
INFO request completed
```

**期待する結果：** 1件目が残ります。入力例は実ログの引用ではなく、構造を示した短縮例です。

**歴史・背景**

Webサーバーは共通の入口として多種類のアプリ例外を受け取ります。入口のコードを探せば、アプリ側の例外名をまだ知らない段階でも候補を集められます。

**注意点**

HTTP 500のすべてがこのコードで記録されるとは限りません。アプリが例外を処理して別形式で記録する場合もあります。

**次に調べること：** 例外の種類はQ30～Q36、周辺の依頼はQ38。

根拠となる資料：[S21 Undertow リクエスト処理例外の例](https://access.redhat.com/solutions/3492841)、[S23 Java SE 25 Throwable](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html)。

<a id="q28"></a>
### Q28　最初のEAP関連コードを取り出して件数順に集計

**実行条件：** 値の変更不要。代表的なコード形式を対象にした集計。

**変更する値：** 必要な接頭辞を追加する場合は桁数と形式を確認します。

```text
fields @timestamp, @log, @logStream, @message
| parse @message /(?<eapCode>(WFLY[A-Z]+[0-9]{4}|JBAS[0-9]{6}|IJ[0-9]{6}|ARJUNA[0-9]{6}|UT[0-9]{6}|MSC[0-9]{6}|HHH[0-9]{6})):/
| filter ispresent(eapCode)
| stats count(*) as eventCount by eapCode
| sort eventCount desc
| limit 50
```

**何が分かるか**

どの種類のメッセージが多いかを一覧にして、調査の優先候補を見つけます。

**身近なたとえ**

整理番号付きカードを番号ごとの箱に入れ、箱の中の枚数を数えます。一枚に複数番号があれば、この例では最初の番号の箱へ入れます。

**処理の段階**

1. parseの(?<eapCode>...)は一致したコードを一時項目へ取り出します。WFLY、JBAS、IJ、ARJUNA、UT、MSC、HHHの代表形を並べています。
2. parseだけでは不一致イベントは消えません。ispresent(eapCode)で抽出できたイベントだけを残します。
3. stats count(*) by eapCodeでコード別イベント数に変換します。その後は個別本文ではなく集計表を並べ替えています。

**入力例（架空）**

```text
WFLYCTL0013: A
WFLYCTL0013: B; WFLYCTL0080: C
IJ000453: D
```

**期待する結果：** WFLYCTL0013が2、IJ000453が1。2件目の後ろのWFLYCTL0080はこの集計では数えません。

**歴史・背景**

同じメッセージの洪水を一件ずつ読むと全体像をつかめません。変化しにくいコードでまとめると、名前やIDなどの違いに邪魔されず頻度を見られます。

**注意点**

コード出現総数ではなく「最初に抽出したコード別のイベント数」です。正常コードも含まれます。全コード・全製品の形式を網羅していません。

**次に調べること：** 上位コードをQ23の文字列へ入れて本文を読みます。

根拠となる資料：[S06 parse](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Parse.html)、[S07 stats](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Stats.html)、[S17 JBoss EAP 8.1 ロギング](https://docs.redhat.com/en/documentation/red_hat_jboss_enterprise_application_platform/8.1/html/configuration_guide/logging-with-jboss-eap_default)。

<a id="q29"></a>
### Q29　起動開始・正常起動・関連失敗を時刻順に読む

**実行条件：** 値の変更不要。できれば1台の短い起動期間に絞る。

**変更する値：** 必要に応じてQ21のストリーム条件を追加します。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like /(WFLYSRV0049|WFLYSRV0025|WFLYCTL0013|WFLYSRV0153):/
| sort @timestamp asc
| limit 1000
```

**何が分かるか**

起動の開始、起動完了、設定やデプロイの失敗を流れとして読みます。

**身近なたとえ**

学校行事の「準備開始」「準備完了」「途中の問題」を時間順に並べ、どこで止まったかを探します。

**処理の段階**

1. WFLYSRV0049は起動開始の目印、WFLYSRV0025は正常起動メッセージの目印として使います。失敗コードも選択肢に含めます。
2. ascは古い時刻を先にします。通常の最新順とは逆にし、流れをたどりやすくしています。
3. 1000件を上限にするため、範囲が広いと後半が表示されない可能性があります。対象台数と期間を絞ります。

**入力例（架空）**

```text
09:00 WFLYSRV0049: starting example
09:01 WFLYSRV0153: deployment failed example
09:02 WFLYCTL0013: operation failed example
```

**期待する結果：** 09:00、09:01、09:02の順に表示されます。正常起動のメッセージがない理由は、期間外・取り込み漏れ等も含めて調べます。

**歴史・背景**

サーバーが動き始めるまでには複数の段階があります。Red Hatの手順でも起動開始の識別子を探す方法が示されており、エラーだけを抜き出すより前後関係を保ちやすくなります。

**注意点**

選んだコード以外の重要な記録は省かれています。完全な起動診断や正常性判定ではありません。複数回の起動が混じらないようにします。

**次に調べること：** 気になる区間をQ39でフィルターなしの本文一覧として読みます。

根拠となる資料：[S17 JBoss EAP 8.1 ロギング](https://docs.redhat.com/en/documentation/red_hat_jboss_enterprise_application_platform/8.1/html/configuration_guide/logging-with-jboss-eap_default)、[S18 デプロイ失敗とClassNotFoundExceptionの例](https://access.redhat.com/solutions/3353921)。

## Javaの例外と原因の読み方

<a id="q30"></a>
### Q30　JavaのException・Errorクラス名を広く探す

**実行条件：** 値の変更不要。パッケージ名付きの代表的なJava例外表記。

**変更する値：** 独自命名や省略名の例外は別の文字列条件を追加します。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like /[A-Za-z_$][A-Za-z0-9_$]*[.][A-Za-z0-9_$.]*(Exception|Error)\b/
| sort @timestamp desc
| limit 200
```

**何が分かるか**

ERRORというログレベルが付かない継続行からも、Javaの例外候補を見つけます。

**身近なたとえ**

文章の中から「住所付きの名前」を探します。住所と名前の形が分かれば、知らない人でも候補にできます。

**処理の段階**

1. 英字等で始まる識別子とドットを条件にし、java.langのようなパッケージを含む表記を探します。
2. 末尾がExceptionまたはErrorの形を狙います。最後の単語境界はErrorHandlerのようにさらに語が続く場合を抑えます。
3. 大文字小文字は区別します。Javaのクラス名の標準的な表記を想定し、イベント全体を返します。

**入力例（架空）**

```text
java.lang.NullPointerException: example
Caused by: java.sql.SQLException: example
java.lang.OutOfMemoryError: example
Exception occurred
```

**期待する結果：** 最初の3件が残ります。パッケージ名を持たない4件目は対象外です。

**歴史・背景**

Javaは失敗の種類をクラス名で表します。文章が変わっても型名を手掛かりにできます。アプリの層をまたぐと例外が包まれることがあるため、ログレベル行以外も調べる必要があります。

**注意点**

コード例や説明文の中のクラス名にも一致します。Throwableを直接継承して末尾がException/Errorでない独自クラス、Unicode名などをすべて拾う式ではありません。

**次に調べること：** NPEはQ31、メモリーはQ32、クラス読み込みはQ33。

根拠となる資料：[S23 Java SE 25 Throwable](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html)、[S06 parse](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Parse.html)。

<a id="q31"></a>
### Q31　NullPointerExceptionを探す

**実行条件：** 値の変更不要。完全修飾クラス名が本文にある場合。

**変更する値：** 省略形しか出ないログならNullPointerExceptionだけの検索も検討。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like 'java.lang.NullPointerException'
| sort @timestamp desc
| limit 200
```

**何が分かるか**

null参照を使った処理の失敗を探し、どのコード位置・入力で起きたかを調べます。

**身近なたとえ**

「この箱の中の本を開いて」と頼んだのに、箱そのものが用意されていないような状態です。

**処理の段階**

1. クラス名を普通の文字列として部分一致検索します。ドットが任意文字になる正規表現ではありません。
2. 文面が詳しい場合は、どの参照がnullだったかの情報を読みます。情報がない場合でもクラス名とスタックの位置を手掛かりにします。
3. 直前の入力や呼び出し元を見るために、requestIdや同じストリームの前後ログへ進みます。

**入力例（架空）**

```text
java.lang.NullPointerException: example at CheckoutService
java.lang.IllegalArgumentException: example
```

**期待する結果：** 1件目が残ります。どの値が未設定だったかを、この検索条件だけで確定することはできません。

**歴史・背景**

NullPointerExceptionは公式APIでJava 1.0から存在する例外です。現在のAPI説明には状況により詳細な参照説明が返る場合も記されていますが、固定の英文を検索条件にすると版や状況で漏れやすいため型名を使います。

**注意点**

メッセージの説明が常に付くとは限りません。またNPEが記録されたことと、その依頼が最終的に失敗したことは別に確認します。

**次に調べること：** 最初のアプリ側スタック位置とQ38の相関IDを確認します。

根拠となる資料：[S24 Java SE 25 NullPointerException](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/NullPointerException.html)、[S23 Java SE 25 Throwable](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html)。

<a id="q32"></a>
### Q32　メモリー確保・スタックの異常を探す

**実行条件：** 値の変更不要。二つの異なるErrorを候補検索。

**変更する値：** 片方だけ調べる場合は正規表現の選択肢を減らします。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like /(OutOfMemoryError|StackOverflowError)/
| sort @timestamp desc
| limit 200
```

**何が分かるか**

JVMのメモリー確保や呼び出しの深さに関係するエラーを見つけます。

**身近なたとえ**

OutOfMemoryErrorは作業机に必要な道具を置けない状態、StackOverflowErrorは「次に頼む」を何段も重ねすぎて順番のメモがあふれる状態にたとえられます。

**処理の段階**

1. 二つのクラス名のどちらかを本文に含むイベントを残します。短い名前でも拾えるようパッケージ名を必須にしていません。
2. OutOfMemoryErrorの詳細と、StackOverflowErrorの繰り返す呼び出し位置をそれぞれ確認します。二つを同じ原因と扱いません。
3. 時刻とインスタンスを特定し、GCログ、メモリー関連の観測値、直前の変更などと照合します。

**入力例（架空）**

```text
java.lang.OutOfMemoryError: example
java.lang.StackOverflowError
INFO memory usage recorded
```

**期待する結果：** 最初の2件が残ります。3件目はメモリーの話でもエラー名がないため外れます。

**歴史・背景**

Javaはメモリーを自動管理しますが、必要な領域を必ず確保できるとは限りません。また深すぎる再帰はスタックを使い切ることがあります。両クラスはJava初期からあり、同じErrorでも調べる資源が違います。

**注意点**

OSやコンテナに強制終了されると、この文字列を残せない場合があります。0件だからメモリー問題がないとは言えません。

**次に調べること：** 前後のログはQ39。原因調査ではJava以外のOS・コンテナ側の記録も照合します。

根拠となる資料：[S25 Java SE 25 OutOfMemoryError](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/OutOfMemoryError.html)、[S31 Java SE 25 StackOverflowError](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StackOverflowError.html)。

<a id="q33"></a>
### Q33　クラスやメソッドの読み込み・互換性の問題

**実行条件：** 値の変更不要。代表的な型名を候補検索。

**変更する値：** 特定のクラス名も絞りたい場合は別のfilterを追加。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like /(ClassNotFoundException|NoClassDefFoundError|NoSuchMethodError|AbstractMethodError|LinkageError)/
| sort @timestamp desc
| limit 200
```

**何が分かるか**

デプロイ後に部品が見つからない、期待したメソッドがないなどの手掛かりを集めます。

**身近なたとえ**

組み立て説明書が必要とする部品が箱にない、または同じ名前でも差し込み口の違う部品が入っていたような状態です。

**処理の段階**

1. 列挙した名前をorで探します。Javaの継承関係を解釈する条件ではないため、列挙していない派生型名まで自動的に一致するわけではありません。
2. ClassNotFoundExceptionは文字列名での読み込み失敗、NoClassDefFoundErrorは実行時に必要な定義を利用できない問題の手掛かりとして読み分けます。
3. 対象クラスやメソッド、ロード元、デプロイ直後かどうかを本文から確認します。

**入力例（架空）**

```text
java.lang.ClassNotFoundException: com.example.Driver
java.lang.NoClassDefFoundError: com/example/Helper
java.lang.NullPointerException
```

**期待する結果：** 最初の2件が残ります。

**歴史・背景**

Javaアプリは多くのライブラリを組み合わせて動きます。開発時と実行時の部品や見える範囲が違うと失敗が表れます。EAPのデプロイ失敗の外側のコードと、こうした内側の型名を結び付けると調査先を絞れます。

**注意点**

NoClassDefFoundErrorを見て、すぐにJARの欠落だけと断定しないでください。直前の初期化失敗などの関連情報も読みます。

**次に調べること：** Q24とQ39でデプロイ時の流れを調べます。

根拠となる資料：[S26 Java SE 25 NoClassDefFoundError](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/NoClassDefFoundError.html)、[S32 Java SE 25 ClassNotFoundException](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ClassNotFoundException.html)、[S18 デプロイ失敗とClassNotFoundExceptionの例](https://access.redhat.com/solutions/3353921)。

<a id="q34"></a>
### Q34　通信・タイムアウトの例外を探す

**実行条件：** 値の変更不要。TimeoutExceptionは通信以外も含む候補。

**変更する値：** 用途を限定したければ対象の例外名だけを残します。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like /(SocketTimeoutException|ConnectException|UnknownHostException|SSLHandshakeException|TimeoutException)/
| sort @timestamp desc
| limit 200
```

**何が分かるか**

待ち時間切れ、接続開始、名前解決、TLSの握手など、通信周辺の失敗候補を集めます。

**身近なたとえ**

電話をかけるときの「番号が分からない」「つながらない」「相手を確認できない」「返事が来ない」を分けて考えます。

**処理の段階**

1. 列挙した型名のどれかが本文にあれば残します。SocketTimeoutExceptionにはTimeoutExceptionという文字も含まれますが、結果は二重になりません。
2. 型名とメッセージを組み合わせて、どの段階で待ったのかを読みます。接続先や呼び出し元の情報も必要です。
3. 処理側の負荷、接続先の状態、設定された期限など、別の記録と突き合わせます。

**入力例（架空）**

```text
java.net.SocketTimeoutException: example
java.util.concurrent.TimeoutException: task example
INFO connected
```

**期待する結果：** 最初の2件が残ります。2件目は一般的な処理待ちの例で、通信障害とは限りません。

**歴史・背景**

ネットワークを使う処理では、待ち続けると他の処理の資源も占有します。期限を設けて失敗として返す仕組みが必要になり、その観測点として例外が残ります。

**注意点**

タイムアウトは遅かったという観測で、どちら側が悪いかを単独では証明しません。証明書検証を無効化するなどの対応をこの結果だけで決めません。

**次に調べること：** requestIdでQ38、直前のイベントでQ39を使います。

根拠となる資料：[S30 Java SE 25 SocketTimeoutException](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/net/SocketTimeoutException.html)、[S23 Java SE 25 Throwable](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html)。

<a id="q35"></a>
### Q35　SQL例外とSQLStateの手掛かりを探す

**実行条件：** 値の変更不要。JDBC・一部のDBドライバーの代表表記。

**変更する値：** 利用DBの独自例外名やコード表記を必要に応じて追加。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like /(java[.]sql[.][A-Za-z]*Exception|PSQLException|SQLServerException|SQLState|SQLSTATE|SQL Error)/
| sort @timestamp desc
| limit 200
```

**何が分かるか**

DBアクセスが失敗したとき、外側のEAPコードだけでなくDBに近い情報を探します。

**身近なたとえ**

窓口の「手続き失敗」という通知から、奥の担当部署が付けた「理由番号」を探していくイメージです。

**処理の段階**

1. java.sqlパッケージのException系や代表的なドライバー名、SQLStateという文字を候補にします。[.]は文字としてのドットです。
2. SQLState、ベンダー独自のエラー番号、説明文は別々の情報なので混同せず読みます。
3. 同じエラーに続く例外連鎖や、DB側の時刻・記録を対応させます。本文中に情報が出力されていなければ、この検索で作り出すことはできません。

**入力例（架空）**

```text
java.sql.SQLTransientConnectionException: example
org.postgresql.util.PSQLException: example
SQLState: 08001
INFO SQL query completed
```

**期待する結果：** 最初の3件が候補です。SQLStateの値の意味は利用ドライバーとDBの資料で確認します。

**歴史・背景**

JDBCは異なるDBへ共通のJava APIでアクセスする仕組みです。SQLExceptionはJava 1.1からあり、共通の状態コードと製品独自の番号を保持できるため、抽象的な失敗から具体的な原因へ降りる手掛かりになります。

**注意点**

SQLSTATEという語だけでエラー確定とはなりません。SQLWarningやINFOの説明文をどう扱うかは目的に合わせます。全ドライバーを網羅する式ではありません。

**次に調べること：** EAPの接続管理はQ25、内側の連鎖はQ36。

根拠となる資料：[S27 Java SE 25 SQLException](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/SQLException.html)、[S19 接続プールの接続不足](https://access.redhat.com/solutions/17782)。

<a id="q36"></a>
### Q36　最初のCaused byのクラス名を取り出す

**実行条件：** 本文にCaused by:とクラス名があるイベント。

**変更する値：** 通常は変更不要。異なる出力形式なら抽出規則を調整。

```text
fields @timestamp, @log, @logStream, @message
| parse @message /Caused by:\s+(?<causeClass>[A-Za-z_$][A-Za-z0-9_.$]*)/
| filter ispresent(causeClass)
| display @timestamp, causeClass, @log, @logStream, @message
| sort @timestamp desc
| limit 200
```

**何が分かるか**

例外連鎖に書かれた原因クラスを見やすい列へ取り出します。

**身近なたとえ**

「なぜなら」の後に書かれた理由の名前を別の欄へ写します。ただし理由の中にさらに理由が続くなら、最初の一つだけを写した状態です。

**処理の段階**

1. Caused by:の後で空白が1文字以上続く部分を読み、続くクラス名らしい文字をcauseClassへ取り出します。
2. 通常のparseなので、1イベント中の最初の一致を扱います。複数のCaused byをすべて別行にするクエリではありません。
3. ispresentで抽出できたイベントだけを残し、displayで抽出列と元本文を一緒に見ます。

**入力例（架空）**

```text
1イベントの本文:
java.lang.RuntimeException: outer
Caused by: java.sql.SQLException: middle
Caused by: java.net.ConnectException: inner
```

**期待する結果：** causeClassはjava.sql.SQLException。最深部のjava.net.ConnectExceptionを返す式ではありません。

**歴史・背景**

層の異なる処理が失敗を伝えるとき、説明を加えながら元の例外も保持する必要があります。ThrowableのgetCauseはJava 1.4からあり、Caused byはそのつながりを読む手掛かりです。

**注意点**

最初の原因クラスを「根本原因」と命名しないでください。Suppressedは別の関係です。分割収集なら継続イベントだけが残り、外側の行が一緒に返らない場合もあります。

**次に調べること：** 元本文の連鎖全体とQ39の周辺記録を読みます。

根拠となる資料：[S23 Java SE 25 Throwable](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html)、[S06 parse](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Parse.html)、[S16 CloudWatch Agent 設定](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-Configuration-File-Details.html)。

<a id="q37"></a>
### Q37　例外名と具体的なエラーメッセージで絞る

**実行条件：** 二つの文字列が同じイベントに入っていること。

**変更する値：** 例外名とメッセージを調べたい実際の値へ変更します。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like 'java.net.SocketTimeoutException' and @message like 'Read timed out'
| sort @timestamp desc
| limit 200
```

**何が分かるか**

同じ例外の中でも、既知の具体的な症状に一致するものだけを調べます。

**身近なたとえ**

「忘れ物」という大分類から、さらに「教科書」という説明がある連絡を選びます。

**処理の段階**

1. 二つの文字列をandで比較します。普通の文字列検索なので、クラス名のドットを特別扱いしません。
2. 大文字小文字、語の順序、空白は指定の文字列どおりです。Read timed outとread timed outはこの例では別です。
3. 二つが別イベントに分かれていると一致しません。Q30やQ34で広く探してから適用すると形式を確認できます。

**入力例（架空）**

```text
java.net.SocketTimeoutException: Read timed out
java.net.SocketTimeoutException: Accept timed out
Read timed out
```

**期待する結果：** 1件目だけが残ります。3件目は例外名がないため外れます。

**歴史・背景**

共通の例外型が複数の状態を表すことがあります。既知障害の再発確認では具体文面が便利ですが、版・設定・出力言語が変わると文面も変わるため、型名の検索と使い分けます。

**注意点**

「Read timed out」が全JDK・全ライブラリで必ず同じ英文になる保証として使わないでください。実ログで確認した値を指定します。

**次に調べること：** 広く戻したければQ34、同じ依頼の流れはQ38。

根拠となる資料：[S02 filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)、[S30 Java SE 25 SocketTimeoutException](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/net/SocketTimeoutException.html)。

<a id="q38"></a>
### Q38　requestIdで一つの依頼を時系列に追う

**実行条件：** 列挙したJSON項目のいずれかに相関IDがあること。関連グループを画面で選択。

**変更する値：** req-demo-001を実際のIDへ変更。項目名も確認。

```text
fields @timestamp, @log, @logStream, @message
| fields coalesce(requestId, request_id, correlationId, mdc.requestId) as rid
| filter rid = 'req-demo-001'
| sort @timestamp asc
| limit 1000
```

**何が分かるか**

一つの利用者リクエストについて、開始・処理・エラー・終了の流れを読みます。

**身近なたとえ**

学校の配達物に同じ伝票番号を付け、教室が変わっても同じ荷物として追いかけます。

**処理の段階**

1. 候補の項目名から最初の非null値をridへ入れます。mdc.requestIdはJSON内の入れ子の項目を指します。
2. IDを完全一致で比較します。エラーレベルの条件は付けないので、同じ依頼の正常な途中経過も残ります。
3. 古い時刻から並べます。複数サービスの時計がずれている場合、表示順だけでは厳密な因果順序が分からないことがあります。

**入力例（架空）**

```text
{"requestId":"req-demo-001","message":"start"}
{"mdc":{"requestId":"req-demo-001"},"message":"failed"}
{"requestId":"req-demo-002","message":"start"}
```

**期待する結果：** 1、2件目が時刻順に残ります。

**歴史・背景**

並行処理では同じ時刻に別々の依頼が動き、スレッドも再利用されます。相関IDを記録しておくと、時刻だけでは結び付けられないイベントを同じ依頼として探せます。

**注意点**

IDがログに出力されていなければ自動生成はできません。文字列本文しかない場合は実際のIDをlikeで探せますが、部分一致の衝突に注意します。

**次に調べること：** IDのない継続行も必要ならQ39で同じ出どころの周辺を読みます。

根拠となる資料：[S03 演算子・日時・文字列・JSON関数](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html)、[S04 自動検出されるフィールド](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)、[S17 JBoss EAP 8.1 ロギング](https://docs.redhat.com/en/documentation/red_hat_jboss_enterprise_application_platform/8.1/html/configuration_guide/logging-with-jboss-eap_default)。

<a id="q39"></a>
### Q39　例外の前後を同じグループ・ストリームで読む

**実行条件：** 例は2026-10-01 09:00以上09:05未満JST。画面も合わせる。

**変更する値：** グループ名・ストリーム名・開始終了のミリ秒値を実際の対象へ変更。

```text
fields @timestamp, @log, @logStream, @message
| parse @log /^[^:]+:(?<groupName>.*)$/
| filter groupName = '/example/eap/prod' and @logStream = 'server-01'
| filter toMillis(@timestamp) >= 1790812800000 and toMillis(@timestamp) < 1790813100000
| sort @timestamp asc
| limit 1000
```

**何が分かるか**

ERROR行だけでなく、直前のINFOや後ろのスタック行も含めて読みます。

**身近なたとえ**

事件の場面だけを切り抜かず、その前後の数ページを同じノートから読むようなものです。

**処理の段階**

1. まず出どころを絞り、別サーバーの同時刻の記録が混ざるのを減らします。複数アカウントの同名グループには別途注意します。
2. 5分の固定区間に絞ります。エラー語のfilterを置かないので、atで始まる継続行も対象にできます。
3. ascで時系列に並べます。分割された記録を一覧で読むもので、一つの例外オブジェクトへ自動結合する処理ではありません。

**入力例（架空）**

```text
09:01 INFO request start
09:02 ERROR request failed
09:02 Caused by: java.sql.SQLException
09:03 INFO cleanup
```

**期待する結果：** 同じグループ・ストリーム・期間にあるなら4件すべてが残ります。

**歴史・背景**

ログをエラー語だけで絞ると、原因や後片付けの情報を落とすことがあります。複数行例外が分割される収集方式では、周辺を読む操作が特に重要です。

**注意点**

同じストリームにも複数の依頼が並行して入ります。時刻が近いだけでは同じ依頼と断定できません。1000件へ到達したら時間窓をさらに狭めます。

**次に調べること：** 繰り返し分割が問題になる場合は、収集設定と相関IDの記録方法を別途見直します。

根拠となる資料：[S04 自動検出されるフィールド](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)、[S16 CloudWatch Agent 設定](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-Configuration-File-Details.html)、[S23 Java SE 25 Throwable](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html)。

## 集計と現在の追加機能

<a id="q40"></a>
### Q40　エラー候補を5分ごとに数える

**実行条件：** 値の変更不要。画面で調査期間を選択。

**変更する値：** 5mを必要な時間幅へ変更します。

```text
filter @message like /(?i)(^|[^A-Za-z])(ERROR|FATAL|SEVERE)([^A-Za-z]|$)/
| stats count(*) as errorEvents by bin(5m) as bucket
| sort bucket asc
```

**何が分かるか**

どの時間帯にエラー候補が増えたかを、個々の本文より先に把握します。

**身近なたとえ**

カードを時刻ごとの箱へ分け、箱の枚数を棒の高さとして比べます。山ができた時間を詳しく調べます。

**処理の段階**

1. 最初にERROR等の語を含むイベントだけを残します。候補の意味はQ02と同じです。
2. stats count(*)でイベント数を数え、bin(5m)の時間バケットごとにまとめます。bucketという列名を付けて時間順にします。
3. コンソールの可視化で時系列のグラフとして読めます。件数のない時間帯は、通常の集計では行自体がないことがあります。

**入力例（架空）**

```text
09:00:00 ERROR A
09:00:00 ERROR B
09:05:00 ERROR C
09:05:00 INFO D
```

**期待する結果：** 09:00側が2、09:05側が1。これはイベント数であり、異なる根本原因の数ではありません。

**歴史・背景**

一件ずつの記録では増加の形が見えにくいため、時間単位の集計が必要になります。リリースや負荷変化の時刻と重ねると調査仮説を作れますが、同時に起きたことだけで因果関係を断定しません。

**注意点**

bin(300s)で5分を表さないでください。AWSでは秒単位の上限が60なのでbin(5m)を使います。厳密な切り捨て境界が必要ならdatefloor(@timestamp, 5m)の利用を検討します。

**次に調べること：** 山のある時間を画面で狭め、Q02やQ39で本文へ戻ります。

根拠となる資料：[S07 stats](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Stats.html)、[S03 演算子・日時・文字列・JSON関数](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html)。

<a id="q41"></a>
### Q41　ロググループごとのエラー候補件数

**実行条件：** 関連する複数ロググループを画面で選択。

**変更する値：** 上位件数の50は必要に応じて変更。

```text
filter @message like /(?i)(^|[^A-Za-z])(ERROR|FATAL|SEVERE)([^A-Za-z]|$)/
| stats count(*) as errorEvents by @log
| sort errorEvents desc
| limit 50
```

**何が分かるか**

どのグループでエラー候補が多いかを比較し、調査先を決めます。

**身近なたとえ**

クラスごとの忘れ物カードを数え、どのクラスへ確認に行くかの目安にします。生徒数が違う点も忘れません。

**処理の段階**

1. 同じエラー候補条件を各グループのイベントへ適用します。
2. @logごとにcount(*)を計算します。アカウントIDを含む識別子を使うため、別アカウントの同名グループを区別できます。
3. 多い順に並べ、最大50グループを表示します。最後のlimitは元イベントを50件に制限してから数える処理ではありません。

**入力例（架空）**

```text
グループAにERROR3件とINFO7件
グループBにERROR1件とINFO1件
```

**期待する結果：** Aは3、Bは1です。エラー率は計算していません。

**歴史・背景**

分散したシステムでは「どこから調べるか」が重要です。出どころごとの件数は入口になりますが、アクセス量の大きいサービスほど絶対件数も増えやすくなります。

**注意点**

件数が多いことだけで最も故障率が高いとは言えません。ログ出力の重複や分割方法も比較に影響します。

**次に調べること：** 上位グループをQ18で絞り、Q40で増加時刻を調べます。

根拠となる資料：[S07 stats](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Stats.html)、[S04 自動検出されるフィールド](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)。

<a id="q42"></a>
### Q42　最初のJava例外クラス別に件数を数える

**実行条件：** 値の変更不要。完全修飾された代表的な例外名がある本文。

**変更する値：** 省略クラス名等を扱う場合は抽出規則を実ログに合わせる。

```text
fields @timestamp, @log, @logStream, @message
| parse @message /(?<exceptionClass>([A-Za-z_$][A-Za-z0-9_$]*[.])+[A-Za-z0-9_$]*(Exception|Error))\b/
| filter ispresent(exceptionClass)
| stats count(*) as eventCount by exceptionClass
| sort eventCount desc
| limit 50
```

**何が分かるか**

例外の種類ごとの多さを調べ、調査の焦点を決めます。

**身近なたとえ**

相談カードの先頭にある相談の種類ごとに箱へ入れ、どの相談が多いか数えます。

**処理の段階**

1. parseで最初のパッケージ付き例外クラスをexceptionClassへ取り出します。通常のparseは、この式では1イベントにつき一つの値を作ります。
2. 抽出できたものだけを残し、クラス名ごとにイベント数を数えます。
3. 外側がRuntimeExceptionなら、内側にSQLExceptionがあっても、そのイベントはRuntimeException側として数える可能性があります。

**入力例（架空）**

```text
java.lang.NullPointerException: A
java.lang.NullPointerException: B
java.lang.RuntimeException: C; Caused by: java.sql.SQLException: D
```

**期待する結果：** NullPointerExceptionが2、RuntimeExceptionが1。SQLExceptionを別途1件とは数えません。

**歴史・背景**

自由なメッセージはID等が毎回違いますが、例外型はまとめる軸として使えます。ただし例外連鎖のどの位置を集計したかで意味が変わるため、この例は「最初」と明示します。

**注意点**

根本原因のランキングではありません。元のログが分割されていると、同じ失敗が複数イベントとして数えられます。

**次に調べること：** 上位の例外名をQ31等の条件へ入れ、本文とCaused byを読みます。

根拠となる資料：[S06 parse](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Parse.html)、[S07 stats](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Stats.html)、[S23 Java SE 25 Throwable](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html)。

<a id="q43"></a>
### Q43　本文が完全に同じエラー候補を1件にまとめる

**実行条件：** 値の変更不要。本文全体を重複判定のキーにする。

**変更する値：** 別の重複単位にしたい場合は、確かなキー項目を選びます。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like /(?i)(^|[^A-Za-z])(ERROR|FATAL|SEVERE)([^A-Za-z]|$)/
| sort @timestamp desc
| dedup @message
| limit 200
```

**何が分かるか**

同じ文面が繰り返されて一覧を埋めるとき、種類を読みやすくします。

**身近なたとえ**

まったく同じ内容のプリントは一枚ずつ残し、違う内容のプリントを見つけやすくします。

**処理の段階**

1. 先に新しい順に並べます。dedupはその順序で最初の代表を残すので、各本文の新しいものが残ります。
2. 重複キーは@message全体です。本文中の日時、ID、空白が異なれば別の値になります。
3. dedupの後に使えるクエリコマンドはlimitのみという制約があるため、sortは前へ置きます。

**入力例（架空）**

```text
09:00 ERROR fixed failure
09:01 ERROR fixed failure
09:02 ERROR fixed failure request=2
```

**期待する結果：** 09:01の代表と09:02の別本文が残ります。09:00は重複として結果から省かれます。

**歴史・背景**

同一メッセージの連続は頻度の確認には有用でも、種類の調査を妨げることがあります。重複を省く用途と、頻度を数える用途を分けるための操作です。

**注意点**

発生回数はこの結果だけでは分かりません。また別グループの同じ本文もまとめられます。出どころを区別したければdedup @log, @messageのようにキーを増やします。

**次に調べること：** 回数も必要ならstats count(*) by @messageという集計へ切り替えます。

根拠となる資料：[S09 dedup](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Dedup.html)、[S07 stats](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Stats.html)。

<a id="q44"></a>
### Q44　直近15分・対象グループ・エラー・除外を組み合わせる

**実行条件：** 画面で目的のグループと直近15分以上の期間を選択。

**変更する値：** グループ名と除外語を実際の値へ変更します。

```text
fields @timestamp, @log, @logStream, @message
| parse @log /^[^:]+:(?<groupName>.*)$/
| filter groupName = '/example/eap/prod'
| filter toMillis(@timestamp) >= (now() * 1000 - 15 * 60 * 1000) and toMillis(@timestamp) <= now() * 1000
| filter @message like /(?i)(^|[^A-Za-z])(ERROR|FATAL|SEVERE)([^A-Za-z]|$)/
| filter @message not like 'healthcheck' and @message not like 'heartbeat'
| sort @timestamp desc
| limit 200
```

**何が分かるか**

基本部品を合わせ、日常の障害確認で使う一つのクエリにします。

**身近なたとえ**

棚を決め、時間を決め、赤い札だけ残し、定期点検の札を外すという四つのふるいを順番に通します。

**処理の段階**

1. @logから名前を取り出し、一つのグループへ絞ります。画面側の対象選択も必要です。
2. 実行開始から15分の条件を加え、その中からERROR等の語を探します。別々のfilterは両方満たす必要があります。
3. healthcheckとheartbeatのどちらも含まないものを残し、最新200件を表示します。条件を順に外せば、0件の理由を切り分けられます。

**入力例（架空）**

```text
対象グループ・5分前・ERROR payment failed
対象グループ・5分前・ERROR healthcheck failed
別グループ・5分前・ERROR payment failed
対象グループ・30分前・ERROR payment failed
```

**期待する結果：** 1件目だけが残ります。2件目も本当の失敗かもしれませんが、設定した除外規則により外れます。

**歴史・背景**

実際の調査では一つの条件だけでは対象が広すぎるため、小さな条件を組み合わせます。役割ごとにfilterを分けると、読み返したり一つずつ解除したりしやすくなります。

**注意点**

テンプレートの除外語を現場の判断なしで固定しないでください。複雑な条件を一度に足すより、Q01から段階的に確かめます。

**次に調べること：** 結果が少なすぎる場合は除外、エラー、時間、グループの順に条件を点検します。

根拠となる資料：[S02 filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)、[S03 演算子・日時・文字列・JSON関数](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html)、[S04 自動検出されるフィールド](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)。

<a id="q45"></a>
### Q45　新機能：一致サンプルを20件見つけて早期終了

**実行条件：** 現行公式仕様のlimit anyを使用。最新順は不要な用途。

**変更する値：** 20を必要なサンプル数へ変更します。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like /(?i)(^|[^A-Za-z])(ERROR|FATAL|SEVERE)([^A-Za-z]|$)/
| limit any 20
```

**何が分かるか**

エラー形式の見本を少し確認するため、必要な件数が見つかれば残りのスキャンを止めます。

**身近なたとえ**

箱の中に赤いカードがあるか知りたくて20枚集まったら探すのをやめます。いちばん新しい20枚を選び出したわけではありません。

**処理の段階**

1. ERROR等の条件を満たすイベントを探し、20件に達したら早期終了します。
2. 通常のlimitと区別するためanyが入ります。sortを付けず、どの時刻のサンプルになるかを保証しません。
3. 一致が20件未満なら、十分な件数を得られないため検索範囲全体を読む場合があります。

**入力例（架空）**

```text
期間内にエラー候補が100件あると仮定。
```

**期待する結果：** 最大20件の見本が返ります。時刻順や代表性、全体件数はこの結果では保証されません。

**歴史・背景**

以前からの表示件数制限と、処理を途中で終える目的は別です。現在の公式limit資料はlimit anyを説明しており、少数のサンプルだけ必要な探索を軽くする用途に使えます。導入日は本資料では特定していません。

**注意点**

最新のエラーや期間内の全件集計を知る用途には向きません。未対応の環境ではQ02の通常limitを使いますが、早期終了の効果は同じではありません。

**次に調べること：** 最新順はQ02、件数の山はQ40、事前見積もりはQ46。

根拠となる資料：[S08 limit / limit any](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Limit.html)。

<a id="q46"></a>
### Q46　新機能：実検索前にスキャン量を見積もる

**実行条件：** 現行公式仕様のestimateを使用。結果はログ本文ではなく概算量。

**変更する値：** 画面のグループと時間範囲を変えて見積もりを比較します。

```text
fields @timestamp, @log, @logStream, @message
| filter @message like /(?i)(^|[^A-Za-z])(ERROR|FATAL|SEVERE)([^A-Za-z]|$)/
| estimate
```

**何が分かるか**

大きな範囲を本検索する前に、読み取り対象の概算バイト数を確認します。

**身近なたとえ**

大きな本を全部読む前に、読む予定のページ量を見積もります。見積もりの紙に、本の中身そのものは載りません。

**処理の段階**

1. 調べたいクエリの最後にestimateを置きます。この例はエラー候補検索の見積もりです。
2. クエリを実際に実行してログ結果を返す代わりに、推定スキャン量を返します。estimateの後ろへsortやlimitを追加しません。
3. 量が大きければ対象グループや時間を見直します。本検索する場合はestimateを外し、Q02等のsort・limitを付けて実行します。

**入力例（架空）**

```text
同じグループを対象に1時間と24時間の二つの期間を選び、別々に見積もる例。
```

**期待する結果：** 概算バイト数を比較できます。常に期間比どおりの値になるとは限りません。実測した数値は本資料に載せていません。

**歴史・背景**

AWSの履歴では2026-07-22にestimate追加が記録されています。探索対象を広げる前に量を把握し、必要な期間と範囲を考えるための機能です。

**注意点**

値は概算であり実際のスキャン量と異なる場合があります。estimate自体にはLogs Insightsのクエリ料金が発生しないという公式説明ですが、その後の本検索は別です。

**次に調べること：** 検索を行う段階ではestimateを外します。結果0件の診断用として代用しません。

根拠となる資料：[S10 estimate](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Estimate.html)、[S13 CloudWatch Logs ドキュメント履歴](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/DocumentHistory_cwl.html)。

<a id="q47"></a>
### Q47　新機能：logfmtのlevelで絞る

**実行条件：** level=error msg=...のようなlogfmt形式向け。普通のEAP文章ログには不適合。

**変更する値：** level・msgのキー名や対象レベルを実際の形式へ変更。

```text
fields @timestamp, @log, @logStream, @message
| parse @message logfmt as lf
| filter toupper(lf.level) in ['ERROR', 'FATAL']
| display @timestamp, lf.level, lf.msg, @log, @logStream, @message
| sort @timestamp desc
| limit 200
```

**何が分かるか**

JSONではなくkey=valueの形で記録されたログを、項目単位で調べます。

**身近なたとえ**

「教室=1組 係=図書」という短い札を、項目名と値に分けて読む方法です。

**処理の段階**

1. parse @message logfmt as lfでlogfmtを読み、lfというマップに入れます。lf.levelはその中のlevelです。
2. levelを大文字化してERRORまたはFATALに一致するものを残します。本文中にerrorと書いてあるだけのINFOは対象外です。
3. 元本文も残すので、解析結果が思った項目になっているか照合できます。

**入力例（架空）**

```text
level=error msg="database timeout"
level=info msg="no error"
2026-10-01 ERROR plain-text-example
```

**期待する結果：** 1件目が意図した対象です。3件目のような普通の文章から、この式がlevelを推測して作るわけではありません。

**歴史・背景**

JSON以外にも、人にも読みやすいkey=valueのログ形式があります。2026年のAWS発表でparse logfmtの追加が説明され、独自の正規表現で毎回項目を分ける負担を減らせるようになりました。

**注意点**

パーサーに渡す本文の形式をまずQ01で確認します。未対応環境では形式に合うparseを別途書くか、Q02の本文検索を使います。

**次に調べること：** 項目の解析が確認できたらstatsでlf.level等を集計できます。

根拠となる資料：[S06 parse](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Parse.html)、[S15 新しいクエリコマンドと関数](https://aws.amazon.com/about-aws/whats-new/2026/06/amazon-cloudwatch-logs-insights/)。

<a id="q48"></a>
### Q48　新機能：ロググループ名の前方一致

**実行条件：** 現行公式関数表のstartsWithを使用。対象グループは画面で選ぶ。

**変更する値：** /example/eap/を目的の名前の接頭部分へ変更。

```text
fields @timestamp, @log, @logStream, @message
| parse @log /^[^:]+:(?<groupName>.*)$/
| filter startsWith(groupName, '/example/eap/') = 1
| sort @timestamp desc
| limit 200
```

**何が分かるか**

「名前のどこかに含む」ではなく「名前がその文字列で始まる」と明示します。

**身近なたとえ**

住所の途中に「東京」という語があるかではなく、住所の先頭が「東京都」かを調べます。

**処理の段階**

1. @logからアカウント部分を除き、グループ名だけを取り出します。
2. startsWithは指定文字列で始まると1、それ以外は0を返すため、= 1と比較します。大文字小文字は区別されます。
3. 末尾の/も文字列の一部なので、/example/eap-oldのような別名は一致しません。

**入力例（架空）**

```text
/example/eap/prod
/example/eap/test
/archive/example/eap/prod
/example/eap-old
```

**期待する結果：** 最初の2つの名前だけが一致します。

**歴史・背景**

前方一致は命名規則を使う探索で繰り返し必要になります。2026年の関数追加の発表にもこの用途が挙げられており、正規表現より意図を直接読める表現として使えます。

**注意点**

クエリが未選択グループを探しに行くことはありません。未対応環境ではQ19の識別子の部分一致、または抽出した名前への先頭固定の正規表現を使います。

**次に調べること：** 本番だけ等へ絞るならQ18・Q20と目的を比較します。

根拠となる資料：[S03 演算子・日時・文字列・JSON関数](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html)、[S15 新しいクエリコマンドと関数](https://aws.amazon.com/about-aws/whats-new/2026/06/amazon-cloudwatch-logs-insights/)、[S05 SOURCE](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Source.html)。

## 仕組みを理解する

### ログは出来事のカード

アプリは「いつ・どこで・何が起きたか」をログに残します。たとえば図書係の記録なら「10:00、1組、本を貸した」です。CloudWatch Logsでは一つの記録がログイベントです。Javaの長いスタックトレースが1イベントに入ることも、複数イベントへ分かれることもあります。「画面上の行」「元ファイルの行」「イベント」は必ずしも同じ単位ではありません。

### ロググループとストリーム

ロググループは記録を入れる棚、ログストリームは棚の中のノート、ログイベントはノートの記録にたとえられます。棚を画面で選び、期間を選び、その中からクエリでカードを探します。@logは通常「AWSアカウントID:ロググループ名」です。@logStreamはノート名に相当します。同じストリーム名が別グループにもあり得るので、周辺調査では両方を確かめます。[S04](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)

### クエリの処理の順番

fieldsで見たい項目や計算値を用意し、filterで条件に合うイベントを残し、parseで文から項目を取り出し、statsで数え、sortで並べ、limitで表示件数を決めます。縦棒 | は次の作業へ渡す印です。説明は理解用の論理的な順序です。AWS内部の物理的な実行順序や最適化そのものを表す設計図ではありません。[S01](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html)

### filterは消しゴムではない

filterもnot likeも検索結果を選ぶだけで、保存済みのログを削除しません。元の記録はそのままです。ノートから必要なページをコピーして机に並べるイメージです。ただし、除外しすぎると調査中の机から重要な手掛かりを外すことになります。除外前後を見比べ、除外した語が本当の障害にも含まれないか確かめます。

### 文字列と正規表現

like 'a.b' は文字列a.bの部分一致です。like /a.b/ の . は通常『改行以外の任意の1文字』という規則になります。そのためaxbまで一致します。ドット自体は /a[.]b/ と表せます。正規表現の | は『または』、[0-9]は数字1文字、+は1回以上、*は0回以上、^は先頭、$は末尾です。(?i)は大文字小文字を無視します。[S02](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)、[S06](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Parse.html)

### ANDとOR

A and Bは同じイベントでAもBも満たす条件、A or Bは少なくとも一方を満たす条件です。赤くて丸いボールだけならAND、赤いボールか丸いボールならORです。Aを含まない、かつBを含まない場合はnot A and not Bです。これをorで結ぶと、Aだけのログは「Bではない」ため残ってしまいます。混ぜるときは括弧を付け、意味を目で追えるようにします。

### 2つの時間の門

画面の期間が最初の門、filterの期間が次の門です。画面が09:00～10:00でクエリが09:30～10:30なら、共通する09:30～10:00の範囲だけを調べられます。先に外れた記録を後の条件で呼び戻せません。履歴を再現するときはnow()ではなく固定の期間を使います。now()の基準は実行開始時点であり、選んだ期間の末尾ではありません。[S03](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html)、[S28](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData_RunSampleQuery.html)

### UTC・JST・epoch

日本標準時JSTはUTCより9時間進みます。2026-10-01 09:00 JSTは2026-10-01 00:00 UTCです。epochはUTCの1970-01-01 00:00:00からの経過量を数値で表します。now()は秒、toMillis(@timestamp)はミリ秒なので1000倍して単位をそろえます。定規のメートルとミリメートルを混ぜないのと同じです。ログ本文の時刻と@timestampが同じになるかは収集設定にも依存します。[S03](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html)、[S16](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-Configuration-File-Details.html)

### 半開区間で重複を防ぐ

開始を>=、終了を<にすると、09:00～10:00と10:00～11:00を続けて集計しても、10:00ちょうどを二重に数えません。Q15とQ16はこの形です。終了を09:59:59に置き換えると、ミリ秒を持つ09:59:59.500を落とす場合があります。終了境界そのものを10:00として、それを含めない方が意図を表せます。

### 発生時刻と到着時刻

@timestampはイベントに付いた時刻、@ingestionTimeはCloudWatch Logsが受け取った時刻です。手紙を書いた時刻と郵便局に届いた時刻にたとえられます。差が大きくても通信だけが原因とは限りません。収集の待ち、再送、元時計のずれ、日時解釈も調べます。Q17は遅延の手掛かりを出す診断用で、遅延原因を自動判定するものではありません。[S04](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)

### JSONを使う理由

文章だけのログは「ERRORという語が説明文にある」のか「本当のレベルがERROR」なのか区別しづらいことがあります。JSONはlevel、message、loggerNameなどの名前付き箱へ値を入れる方式です。levelを比べれば本文の語に惑わされにくくなります。EAPもJSON出力を構成できます。ただし、この資料のクエリはサーバー設定を変えません。既に届いている形式に合う例を選びます。[S04](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)、[S17](https://docs.redhat.com/en/documentation/red_hat_jboss_enterprise_application_platform/8.1/html/configuration_guide/logging-with-jboss-eap_default)

### スタックトレースを読む

例外の先頭は起きた問題の名前、atで始まる行はプログラムが通った場所、Caused byは包み込まれた原因の例外です。Suppressedは主な例外と一緒に記録された別の例外で、同じ意味ではありません。道で転んだ理由を「遅刻した→走った→石につまずいた」とたどるイメージですが、一番下の行だけで業務上の根本原因まで確定できるとは限りません。[S23](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html)

### 複数行の取り込みが検索を変える

ERROR行とCaused by行が別イベントなら「ERRORかつCaused by」のANDでは両者を結合できません。同じメモの中だけを調べるためです。収集元で1例外を1イベントにまとめる方法にはCloudWatch Agentのmulti_line_start_patternなどがあります。既存の分割済みイベントを単純なfilterで自動復元することはできません。Q39で同じグループ・ストリーム・狭い時間の全文を読みます。[S16](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-Configuration-File-Details.html)

### EAPのコードとレベルを分ける

WFLYなどの接頭辞は主にどの部品のメッセージかを示し、番号はメッセージを識別する手掛かりです。郵便物の差出人と整理番号のようなもので、重大度そのものではありません。正常起動のWFLYSRV0025も存在します。逆にトランザクションのARJUNA012117はWARNで出る場合があり、ERRORだけでは拾えません。コード・レベル・本文・直前の変化を合わせて読みます。[S17](https://docs.redhat.com/en/documentation/red_hat_jboss_enterprise_application_platform/8.1/html/configuration_guide/logging-with-jboss-eap_default)、[S20](https://access.redhat.com/solutions/18425)

### 料金と表示上限

必要なグループと時間へ狭めると、読む対象を減らせます。普通のlimitは表示数の制限で、スキャン量の上限ではありません。新しいlimit anyは一致が十分に見つかると早期終了しますが、最新順を保証しません。estimateは概算の読み取りバイト数を返します。本文のlikeや正規表現がフィールドインデックスを使うと決めつけないでください。料金単価はリージョン等で異なるため本資料では固定していません。[S01](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html)、[S02](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)、[S08](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Limit.html)、[S10](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Estimate.html)

### 集計の単位を間違えない

stats count(*)は条件に合ったイベント数です。1回の障害が3つのイベントになれば3件です。同じ原因で100リクエストが失敗しても、原因は1個かもしれません。「ログ件数」「リクエスト失敗数」「障害原因の数」は別の量です。時間別の山は調査の入口として使い、requestIdなどで重複や関連を確かめます。[S07](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Stats.html)

### 0件のときの調べ方

Q01でそもそもログがあるかを確認し、アカウント・リージョン・選択グループ・時間を見直します。次にフィルターを1個ずつ外し、大文字小文字、JSONのフィールド名、架空の例示値が残っていないかを調べます。parse後の列が空ならログ形式の不一致を疑います。ERRORの絞り込みが原因でWARNや継続行を捨てていないかも確認します。

### 構文エラーのとき

言語がLogs Insights QLか、ログイベント検索の入力欄へ貼っていないか、クエリの前後にMarkdownの```やExcel由来の引用符が混じっていないかを確認します。半角の|と引用符を使います。新しい関数が使えないときは該当クエリに示した基本形へ切り替え、対象リージョンのサービス表示と公式資料を照合します。

### 検証の意味

この資料のローカル検証は、掲載内容の整合性、代表的な文字列条件の真偽、日時の数値変換、ファイルの体裁を確かめるものです。AWS側のクエリエンジン、利用者の権限、ログ収集設定、実際のデータを検証したことにはなりません。実行結果のサンプルはすべて説明用であり、実測値として扱わないでください。

## 歴史と必要になった背景

### Java初期から

NullPointerExceptionやOutOfMemoryErrorなど、問題の種類をクラス名で表す仕組みがあります。公式APIのSinceは1.0です。人が書く文面が違っても、クラス名を手掛かりに同じ種類を探せます。[S24](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/NullPointerException.html)、[S25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/OutOfMemoryError.html)

### Java 1.1 / 1.4

SQLExceptionは1.1から、Throwableの原因を扱うgetCauseは1.4からあります。アプリ・サーバー・DBなどの層を通る失敗では、外側の説明だけでなく内側の原因を残す必要がありました。Q35・Q36はこの情報を探すための例です。[S23](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html)、[S27](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/SQLException.html)

### 2013年のWildFly資料

公式サイトはWildFlyのリリースと旧JBoss ASの配布先を分け、商用JBoss EAPも案内しています。EAPとWildFlyは関連がありますが、製品版・構成部品・版数を同じものとして扱えません。古いJBAS系と新しいWFLY系が現場に混在するため、Q22では両系統を検索対象にしています。[S22](https://www.wildfly.org/news/2013/11/15/Welcome-to-the-new-WildFly-ORG/)

### 2014-07-10

AWSの履歴にCloudWatch Logsの追加が記録されています。複数の機械が出す記録を一か所へ集める土台です。集めることと、集まった大量の記録を分析することは異なる作業です。[S13](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/DocumentHistory_cwl.html)

### 2018-11-27

CloudWatch Logs Insightsが一般提供されました。ログ形式と量が増え、一つずつファイルを開いて探す方法では時間がかかるという背景がありました。フィルター・集計・可視化を対話的に行う仕組みにより、障害時に仮説を変えながら調べやすくなりました。[S11](https://aws.amazon.com/about-aws/whats-new/2018/11/announcing-amazon-cloudwatch-logs-insights-fast-interactive-log-analytics/)、[S12](https://aws.amazon.com/blogs/aws/new-amazon-cloudwatch-logs-insights-fast-interactive-log-analytics/)

### 2024-11-20

AWSの履歴ではフィールドインデックスの追加が記録されています。索引のある項目の等価条件などで、読まなくてよいイベントを飛ばすための仕組みです。本文をあいまいに探すことと、名前付き項目を等価条件で探すことの性能差を理解する背景になります。[S13](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/DocumentHistory_cwl.html)、[S02](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html)

### 2026-05-21

AWS発表ページの本文日付では、startswithなどの関数とparse logfmtなどの追加が示されています。URLは2026/06を含みますが、日付の説明は本文表記を採用しました。Q47・Q48は従来より分かりやすく書ける例を扱います。[S15](https://aws.amazon.com/about-aws/whats-new/2026/06/amazon-cloudwatch-logs-insights/)

### 2026-06-15

Log AnalyticsがLogs Insights・Live Tail・Contributor Insightsをまとめる画面として発表されました。そのため、古い手順の「Logs Insights」というメニュー名だけでは現行画面を見つけにくい場合があります。クエリ言語の選択は引き続き重要です。[S14](https://aws.amazon.com/about-aws/whats-new/2026/06/amazon-cloudwatch-log-analytics/)

### 2026-07-22

AWSのドキュメント履歴にestimate追加が記録されています。大きな範囲を読む前に概算量を知る用途です。Q46はログを返す検索とは出力の種類が違うので、見積もり専用と明記しています。[S13](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/DocumentHistory_cwl.html)、[S10](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Estimate.html)

### 確認日現在

公式関数表にはparseDate、formatDate、queryStartTimeなども掲載されています。関数表には人間向け日時の直接フィルターを非対応とする注意書きもあるため、Q16は文字列をparseDateで数値へ変換して比較します。個々の機能の初出日が確認できないものについて、導入年は推測で付けていません。[S03](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html)

### 各クエリの「背景」の位置付け

各例はこの資料で作成した組み合わせです。個々の検索式が歴史上いつ発明されたかを主張するものではありません。日付を付けた項目は一次資料の事実、日付のない「なぜ必要か」は運用上の課題を説明するための本資料の整理です。

## 用語辞典

### イベント

CloudWatch Logsに保存された1つの記録。元ファイルの1行とは限らない。

### @message

取り込まれたログ本文。JSONならJSON全体の文字列。

### message

JSON等の利用者側の項目名。@messageとは別。

### @timestamp

イベントに設定された時刻。画面の検索期間の基準。

### @ingestionTime

CloudWatch Logsが受け取った時刻。

### @log

通常はアカウントID:ロググループ名という識別子。

### @logStream

ログストリーム名。同名が別グループにあってもよい。

### fields / display

項目を用意・表示する。fieldsは計算した項目も作れる。displayで最終表示列を明示できる。

### filter / like / in

条件に合う記録を残す / 部分一致を探す / リストのいずれかに等しいか調べる。

### parse / alias

文字から項目を取り出す / asなどで付ける一時的な項目名。元データを書き換えない。

### stats / bin

集計する / 時刻を指定した幅のまとまりとして扱う。厳密な切り捨て開始時刻が必要ならdatefloorを検討する。

### sort / limit / dedup

並べる / 表示件数を制限する / 同じ値をまとめて代表を残す。

### 正規表現

「数字6文字」などの形を指定する検索ルール。普通の文字列検索より記号の意味が多い。

### クラス / JVM

Javaの部品の型 / Javaプログラムを実行する仕組み。

### スタックトレース

例外が起きたときに通っていた処理の場所を並べた情報。

### 接続プール

DBなどとの接続を毎回作り直さず、複数の処理で借りて返す仕組み。

### トランザクション

関連する更新をひとまとまりとして成功・取り消しする仕組み。

### 相関ID

一つの依頼を複数の処理・サーバーで追いかけるために付ける札。requestIdなど。

## 公式資料一覧

すべての資料の確認日：2026-10-16。サポート記事は公開部分を参照。Java SE 25の記載は基本仕様の確認に用いた参照版です。

| ID | 提供元・資料 | 確認した内容 |
| --- | --- | --- |
| S01 | [AWS：Logs Insights QL 構文・コマンド一覧](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html) | パイプ、コマンド、ログクラスの制約 |
| S02 | [AWS：filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html) | 等価・部分一致・正規表現・除外・インデックス |
| S03 | [AWS：演算子・日時・文字列・JSON関数](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html) | now、toMillis、parseDate、coalesce、startsWith |
| S04 | [AWS：自動検出されるフィールド](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html) | @log、@timestamp、@ingestionTime、JSON |
| S05 | [AWS：SOURCE](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Source.html) | コンソールではSOURCEを使わず画面で対象を選択 |
| S06 | [AWS：parse](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Parse.html) | 名前付き抽出、抽出失敗時、logfmt |
| S07 | [AWS：stats](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Stats.html) | 件数・グループ別・時間別の集計 |
| S08 | [AWS：limit / limit any](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Limit.html) | 表示件数と早期終了の違い |
| S09 | [AWS：dedup](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Dedup.html) | 重複除去、順序、後続コマンド制約 |
| S10 | [AWS：estimate](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Estimate.html) | 最後に置くスキャン量見積もりコマンド |
| S11 | [AWS：Logs Insights 一般提供開始](https://aws.amazon.com/about-aws/whats-new/2018/11/announcing-amazon-cloudwatch-logs-insights-fast-interactive-log-analytics/) | 2018-11-27の発表 |
| S12 | [AWS：Logs Insights 登場の背景](https://aws.amazon.com/blogs/aws/new-amazon-cloudwatch-logs-insights-fast-interactive-log-analytics/) | 多種類・大量ログを対話的に調べる必要性 |
| S13 | [AWS：CloudWatch Logs ドキュメント履歴](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/DocumentHistory_cwl.html) | 2014年Logs、2024年インデックス、2026年estimate |
| S14 | [AWS：Log Analytics 統合画面](https://aws.amazon.com/about-aws/whats-new/2026/06/amazon-cloudwatch-log-analytics/) | 2026-06-15の画面統合 |
| S15 | [AWS：新しいクエリコマンドと関数](https://aws.amazon.com/about-aws/whats-new/2026/06/amazon-cloudwatch-logs-insights/) | ページ記載の投稿日は2026-05-21。URLの06と区別 |
| S16 | [AWS：CloudWatch Agent 設定](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-Configuration-File-Details.html) | multi_line_start_patternと時刻の取り込み |
| S17 | [Red Hat：JBoss EAP 8.1 ロギング](https://docs.redhat.com/en/documentation/red_hat_jboss_enterprise_application_platform/8.1/html/configuration_guide/logging-with-jboss-eap_default) | ログレベル、起動ログ、JSONフォーマッター |
| S18 | [Red Hat：デプロイ失敗とClassNotFoundExceptionの例](https://access.redhat.com/solutions/3353921) | WFLYCTL0013・WFLYCTL0080・WFLYSRV0153の関連 |
| S19 | [Red Hat：接続プールの接続不足](https://access.redhat.com/solutions/17782) | IJ000453とIJ000655 |
| S20 | [Red Hat：トランザクション中断・タイムアウト](https://access.redhat.com/solutions/18425) | ARJUNA012117のWARN、7.4前後の文面差 |
| S21 | [Red Hat：Undertow リクエスト処理例外の例](https://access.redhat.com/solutions/3492841) | UT005023と内側の例外。公開Issue部分を参照 |
| S22 | [WildFly：WildFly 公式サイトの2013年案内](https://www.wildfly.org/news/2013/11/15/Welcome-to-the-new-WildFly-ORG/) | 旧JBoss AS、WildFly、商用JBoss EAPの関係 |
| S23 | [Oracle：Java SE 25 Throwable](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html) | 例外連鎖、Caused by、Suppressed、getCauseは1.4から |
| S24 | [Oracle：Java SE 25 NullPointerException](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/NullPointerException.html) | null参照、詳細メッセージ、1.0から存在 |
| S25 | [Oracle：Java SE 25 OutOfMemoryError](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/OutOfMemoryError.html) | JVMで必要なメモリーを確保できない状態 |
| S26 | [Oracle：Java SE 25 NoClassDefFoundError](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/NoClassDefFoundError.html) | 実行時のクラス定義の読み込み失敗 |
| S27 | [Oracle：Java SE 25 SQLException](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/SQLException.html) | SQLState、ベンダーコード、連鎖、1.1から存在 |
| S28 | [AWS：コンソールでサンプルクエリを実行](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData_RunSampleQuery.html) | 対象・期間を指定してクエリを実行 |
| S29 | [Red Hat：JMSでも現れるIJ000453](https://access.redhat.com/solutions/3641261) | IJ000453をDBだけのエラーと決めつけない |
| S30 | [Oracle：Java SE 25 SocketTimeoutException](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/net/SocketTimeoutException.html) | ソケットのread・acceptでのタイムアウト |
| S31 | [Oracle：Java SE 25 StackOverflowError](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StackOverflowError.html) | 深すぎる再帰とスタック |
| S32 | [Oracle：Java SE 25 ClassNotFoundException](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ClassNotFoundException.html) | 名前を使うクラス読み込みで定義が見つからない |
