export const checkedOn = '2026-10-16';
export const title = 'CloudWatch Logs Insights 実践チートシート';

export const sources = [
  ['S01', 'AWS', 'Logs Insights QL 構文・コマンド一覧', 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html', 'パイプ、コマンド、ログクラスの制約'],
  ['S02', 'AWS', 'filter', 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html', '等価・部分一致・正規表現・除外・インデックス'],
  ['S03', 'AWS', '演算子・日時・文字列・JSON関数', 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html', 'now、toMillis、parseDate、coalesce、startsWith'],
  ['S04', 'AWS', '自動検出されるフィールド', 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html', '@log、@timestamp、@ingestionTime、JSON'],
  ['S05', 'AWS', 'SOURCE', 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Source.html', 'コンソールではSOURCEを使わず画面で対象を選択'],
  ['S06', 'AWS', 'parse', 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Parse.html', '名前付き抽出、抽出失敗時、logfmt'],
  ['S07', 'AWS', 'stats', 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Stats.html', '件数・グループ別・時間別の集計'],
  ['S08', 'AWS', 'limit / limit any', 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Limit.html', '表示件数と早期終了の違い'],
  ['S09', 'AWS', 'dedup', 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Dedup.html', '重複除去、順序、後続コマンド制約'],
  ['S10', 'AWS', 'estimate', 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Estimate.html', '最後に置くスキャン量見積もりコマンド'],
  ['S11', 'AWS', 'Logs Insights 一般提供開始', 'https://aws.amazon.com/about-aws/whats-new/2018/11/announcing-amazon-cloudwatch-logs-insights-fast-interactive-log-analytics/', '2018-11-27の発表'],
  ['S12', 'AWS', 'Logs Insights 登場の背景', 'https://aws.amazon.com/blogs/aws/new-amazon-cloudwatch-logs-insights-fast-interactive-log-analytics/', '多種類・大量ログを対話的に調べる必要性'],
  ['S13', 'AWS', 'CloudWatch Logs ドキュメント履歴', 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/DocumentHistory_cwl.html', '2014年Logs、2024年インデックス、2026年estimate'],
  ['S14', 'AWS', 'Log Analytics 統合画面', 'https://aws.amazon.com/about-aws/whats-new/2026/06/amazon-cloudwatch-log-analytics/', '2026-06-15の画面統合'],
  ['S15', 'AWS', '新しいクエリコマンドと関数', 'https://aws.amazon.com/about-aws/whats-new/2026/06/amazon-cloudwatch-logs-insights/', 'ページ記載の投稿日は2026-05-21。URLの06と区別'],
  ['S16', 'AWS', 'CloudWatch Agent 設定', 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-Configuration-File-Details.html', 'multi_line_start_patternと時刻の取り込み'],
  ['S17', 'Red Hat', 'JBoss EAP 8.1 ロギング', 'https://docs.redhat.com/en/documentation/red_hat_jboss_enterprise_application_platform/8.1/html/configuration_guide/logging-with-jboss-eap_default', 'ログレベル、起動ログ、JSONフォーマッター'],
  ['S18', 'Red Hat', 'デプロイ失敗とClassNotFoundExceptionの例', 'https://access.redhat.com/solutions/3353921', 'WFLYCTL0013・WFLYCTL0080・WFLYSRV0153の関連'],
  ['S19', 'Red Hat', '接続プールの接続不足', 'https://access.redhat.com/solutions/17782', 'IJ000453とIJ000655'],
  ['S20', 'Red Hat', 'トランザクション中断・タイムアウト', 'https://access.redhat.com/solutions/18425', 'ARJUNA012117のWARN、7.4前後の文面差'],
  ['S21', 'Red Hat', 'Undertow リクエスト処理例外の例', 'https://access.redhat.com/solutions/3492841', 'UT005023と内側の例外。公開Issue部分を参照'],
  ['S22', 'WildFly', 'WildFly 公式サイトの2013年案内', 'https://www.wildfly.org/news/2013/11/15/Welcome-to-the-new-WildFly-ORG/', '旧JBoss AS、WildFly、商用JBoss EAPの関係'],
  ['S23', 'Oracle', 'Java SE 25 Throwable', 'https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html', '例外連鎖、Caused by、Suppressed、getCauseは1.4から'],
  ['S24', 'Oracle', 'Java SE 25 NullPointerException', 'https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/NullPointerException.html', 'null参照、詳細メッセージ、1.0から存在'],
  ['S25', 'Oracle', 'Java SE 25 OutOfMemoryError', 'https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/OutOfMemoryError.html', 'JVMで必要なメモリーを確保できない状態'],
  ['S26', 'Oracle', 'Java SE 25 NoClassDefFoundError', 'https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/NoClassDefFoundError.html', '実行時のクラス定義の読み込み失敗'],
  ['S27', 'Oracle', 'Java SE 25 SQLException', 'https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/SQLException.html', 'SQLState、ベンダーコード、連鎖、1.1から存在'],
  ['S28', 'AWS', 'コンソールでサンプルクエリを実行', 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData_RunSampleQuery.html', '対象・期間を指定してクエリを実行'],
  ['S29', 'Red Hat', 'JMSでも現れるIJ000453', 'https://access.redhat.com/solutions/3641261', 'IJ000453をDBだけのエラーと決めつけない'],
  ['S30', 'Oracle', 'Java SE 25 SocketTimeoutException', 'https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/net/SocketTimeoutException.html', 'ソケットのread・acceptでのタイムアウト'],
  ['S31', 'Oracle', 'Java SE 25 StackOverflowError', 'https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StackOverflowError.html', '深すぎる再帰とスタック'],
  ['S32', 'Oracle', 'Java SE 25 ClassNotFoundException', 'https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ClassNotFoundException.html', '名前を使うクラス読み込みで定義が見つからない'],
];

export const guide = [
 ['対象と言語', 'CloudWatch Logs の Logs Insights QL 専用です。SQL、PPL、ログストリームの「ログイベントを検索」に貼り付けるフィルターパターンとは入力先が違います。基本の対象はStandardクラスのロググループです。Java/JBossの実ログ形式・EAPのバージョンは未指定のため、本文検索を中心にし、JSONなどの条件付き例には条件を明記しました。'],
 ['1. 画面を開く', 'AWSコンソールでアカウントとリージョンを確認し、CloudWatchのLog Analyticsを開きます。旧表示では「ログのインサイト / Logs Insights」です。クエリ言語は「Logs Insights QL」を選びます。2026-06-15に統合画面の提供が発表されました。表示名は言語や画面設定で変わることがあります。'],
 ['2. 対象を選ぶ', '画面のロググループ選択欄で調べるグループを選びます。クエリ内の@logフィルターは、選択済みの範囲から結果を絞るものです。未選択のグループを追加できません。SOURCEはCLI/API用であり、このチートシートの実行クエリには含めていません。'],
 ['3. 時間を選ぶ', '右上などの時間範囲選択で、まず直近15分・1時間など必要な範囲にします。過去の障害なら絶対時刻を指定し、画面のUTC/ローカル表示も確認します。クエリに日時条件を書いても、画面の検索範囲外のログは戻りません。'],
 ['4. コピーして実行', '「01_コピー用」シートのD列にあるクエリのセルを1つだけ選んでコピーし、クエリエディターの既存内容を全選択して置き換え、「クエリを実行 / Run query」を押します。D列はセル内部に改行・タブ・二重引用符を持たない1行の文字列です。見た目の折り返しはコピー内容に入りません。'],
 ['5. 結果を読む', '実行が完了してから件数・表示列・@messageを確認します。多くの例は最新200件だけ表示します。200件は全件数とは限りません。すべての件数が必要なら集計クエリを使います。0件は「その対象・期間・条件で一致なし」であり、システム全体が正常という証明ではありません。'],
 ['変更せず使う例', 'Q01～Q03、Q13～Q14、Q17、Q22～Q36、Q40～Q43、Q45～Q46などは、画面で対象と期間を選べば検索条件を変更せずに実行できます。JSON用・EAP用などは、その形式やメッセージが存在することが前提です。一致するログがなければ0件になるのが通常です。'],
 ['値を合わせる例', 'グループ名、ストリーム名、requestId、日時、任意キーワードを狙う例は、実在する値に変更して使います。資料中の/example/eap/prod、server-01、req-demo-001は説明用の架空値です。構文はそのまま実行できますが、架空値のままでは普通は一致しません。各クエリの「変更する値」を参照してください。'],
 ['引用符とコピーの補足', 'クエリでは半角の単一引用符を使います。全角の引用符やスマートクォートへ変換しないでください。貼り付け先やExcelのバージョンによって引用符が追加される場合は、F2または数式バーでセル内容だけを選択してコピーするか、Markdownのコードブロックを使ってください。Meiryo UIでは正規表現のバックスラッシュが円記号のように表示される場合があります。見た目で打ち直さず、セルの文字列をコピーしてください。'],
 ['読み方', '02～06の解説シートはクエリIDごとに、目的、たとえ、実行条件、処理の段階、架空の入力例、期待結果、歴史・背景、注意点を載せています。01のIDをクリックすると解説へ移動できます。07には全体の仕組み・歴史・用語・出典があります。'],
 ['確認範囲', '2026-10-16に参照したAWS・Red Hat・Oracle等の公式公開資料を基に作成しました。記載例は実データを使わない教育用の例です。クエリの構成、正規表現の代表例、時刻境界、Excel/Markdownの一致をローカル検証しています。AWSアカウント上での実行結果は未検証です。'],
 ['取得元', '画面操作はS28、現行画面はS14、SOURCEはS05、基本構文はS01を参照してください。出典IDのURLと確認日は07シート末尾にまとめています。'],
];

export const fundamentals = [
 ['ログは出来事のカード', 'アプリは「いつ・どこで・何が起きたか」をログに残します。たとえば図書係の記録なら「10:00、1組、本を貸した」です。CloudWatch Logsでは一つの記録がログイベントです。Javaの長いスタックトレースが1イベントに入ることも、複数イベントへ分かれることもあります。「画面上の行」「元ファイルの行」「イベント」は必ずしも同じ単位ではありません。'],
 ['ロググループとストリーム', 'ロググループは記録を入れる棚、ログストリームは棚の中のノート、ログイベントはノートの記録にたとえられます。棚を画面で選び、期間を選び、その中からクエリでカードを探します。@logは通常「AWSアカウントID:ロググループ名」です。@logStreamはノート名に相当します。同じストリーム名が別グループにもあり得るので、周辺調査では両方を確かめます。〔S04〕'],
 ['クエリの処理の順番', 'fieldsで見たい項目や計算値を用意し、filterで条件に合うイベントを残し、parseで文から項目を取り出し、statsで数え、sortで並べ、limitで表示件数を決めます。縦棒 | は次の作業へ渡す印です。説明は理解用の論理的な順序です。AWS内部の物理的な実行順序や最適化そのものを表す設計図ではありません。〔S01〕'],
 ['filterは消しゴムではない', 'filterもnot likeも検索結果を選ぶだけで、保存済みのログを削除しません。元の記録はそのままです。ノートから必要なページをコピーして机に並べるイメージです。ただし、除外しすぎると調査中の机から重要な手掛かりを外すことになります。除外前後を見比べ、除外した語が本当の障害にも含まれないか確かめます。'],
 ['文字列と正規表現', "like 'a.b' は文字列a.bの部分一致です。like /a.b/ の . は通常『改行以外の任意の1文字』という規則になります。そのためaxbまで一致します。ドット自体は /a[.]b/ と表せます。正規表現の | は『または』、[0-9]は数字1文字、+は1回以上、*は0回以上、^は先頭、$は末尾です。(?i)は大文字小文字を無視します。〔S02、S06〕"],
 ['ANDとOR', 'A and Bは同じイベントでAもBも満たす条件、A or Bは少なくとも一方を満たす条件です。赤くて丸いボールだけならAND、赤いボールか丸いボールならORです。Aを含まない、かつBを含まない場合はnot A and not Bです。これをorで結ぶと、Aだけのログは「Bではない」ため残ってしまいます。混ぜるときは括弧を付け、意味を目で追えるようにします。'],
 ['2つの時間の門', '画面の期間が最初の門、filterの期間が次の門です。画面が09:00～10:00でクエリが09:30～10:30なら、共通する09:30～10:00の範囲だけを調べられます。先に外れた記録を後の条件で呼び戻せません。履歴を再現するときはnow()ではなく固定の期間を使います。now()の基準は実行開始時点であり、選んだ期間の末尾ではありません。〔S03、S28〕'],
 ['UTC・JST・epoch', '日本標準時JSTはUTCより9時間進みます。2026-10-01 09:00 JSTは2026-10-01 00:00 UTCです。epochはUTCの1970-01-01 00:00:00からの経過量を数値で表します。now()は秒、toMillis(@timestamp)はミリ秒なので1000倍して単位をそろえます。定規のメートルとミリメートルを混ぜないのと同じです。ログ本文の時刻と@timestampが同じになるかは収集設定にも依存します。〔S03、S16〕'],
 ['半開区間で重複を防ぐ', '開始を>=、終了を<にすると、09:00～10:00と10:00～11:00を続けて集計しても、10:00ちょうどを二重に数えません。Q15とQ16はこの形です。終了を09:59:59に置き換えると、ミリ秒を持つ09:59:59.500を落とす場合があります。終了境界そのものを10:00として、それを含めない方が意図を表せます。'],
 ['発生時刻と到着時刻', '@timestampはイベントに付いた時刻、@ingestionTimeはCloudWatch Logsが受け取った時刻です。手紙を書いた時刻と郵便局に届いた時刻にたとえられます。差が大きくても通信だけが原因とは限りません。収集の待ち、再送、元時計のずれ、日時解釈も調べます。Q17は遅延の手掛かりを出す診断用で、遅延原因を自動判定するものではありません。〔S04〕'],
 ['JSONを使う理由', '文章だけのログは「ERRORという語が説明文にある」のか「本当のレベルがERROR」なのか区別しづらいことがあります。JSONはlevel、message、loggerNameなどの名前付き箱へ値を入れる方式です。levelを比べれば本文の語に惑わされにくくなります。EAPもJSON出力を構成できます。ただし、この資料のクエリはサーバー設定を変えません。既に届いている形式に合う例を選びます。〔S04、S17〕'],
 ['スタックトレースを読む', '例外の先頭は起きた問題の名前、atで始まる行はプログラムが通った場所、Caused byは包み込まれた原因の例外です。Suppressedは主な例外と一緒に記録された別の例外で、同じ意味ではありません。道で転んだ理由を「遅刻した→走った→石につまずいた」とたどるイメージですが、一番下の行だけで業務上の根本原因まで確定できるとは限りません。〔S23〕'],
 ['複数行の取り込みが検索を変える', 'ERROR行とCaused by行が別イベントなら「ERRORかつCaused by」のANDでは両者を結合できません。同じメモの中だけを調べるためです。収集元で1例外を1イベントにまとめる方法にはCloudWatch Agentのmulti_line_start_patternなどがあります。既存の分割済みイベントを単純なfilterで自動復元することはできません。Q39で同じグループ・ストリーム・狭い時間の全文を読みます。〔S16〕'],
 ['EAPのコードとレベルを分ける', 'WFLYなどの接頭辞は主にどの部品のメッセージかを示し、番号はメッセージを識別する手掛かりです。郵便物の差出人と整理番号のようなもので、重大度そのものではありません。正常起動のWFLYSRV0025も存在します。逆にトランザクションのARJUNA012117はWARNで出る場合があり、ERRORだけでは拾えません。コード・レベル・本文・直前の変化を合わせて読みます。〔S17、S20〕'],
 ['料金と表示上限', '必要なグループと時間へ狭めると、読む対象を減らせます。普通のlimitは表示数の制限で、スキャン量の上限ではありません。新しいlimit anyは一致が十分に見つかると早期終了しますが、最新順を保証しません。estimateは概算の読み取りバイト数を返します。本文のlikeや正規表現がフィールドインデックスを使うと決めつけないでください。料金単価はリージョン等で異なるため本資料では固定していません。〔S01、S02、S08、S10〕'],
 ['集計の単位を間違えない', 'stats count(*)は条件に合ったイベント数です。1回の障害が3つのイベントになれば3件です。同じ原因で100リクエストが失敗しても、原因は1個かもしれません。「ログ件数」「リクエスト失敗数」「障害原因の数」は別の量です。時間別の山は調査の入口として使い、requestIdなどで重複や関連を確かめます。〔S07〕'],
 ['0件のときの調べ方', 'Q01でそもそもログがあるかを確認し、アカウント・リージョン・選択グループ・時間を見直します。次にフィルターを1個ずつ外し、大文字小文字、JSONのフィールド名、架空の例示値が残っていないかを調べます。parse後の列が空ならログ形式の不一致を疑います。ERRORの絞り込みが原因でWARNや継続行を捨てていないかも確認します。'],
 ['構文エラーのとき', '言語がLogs Insights QLか、ログイベント検索の入力欄へ貼っていないか、クエリの前後にMarkdownの```やExcel由来の引用符が混じっていないかを確認します。半角の|と引用符を使います。新しい関数が使えないときは該当クエリに示した基本形へ切り替え、対象リージョンのサービス表示と公式資料を照合します。'],
 ['検証の意味', 'この資料のローカル検証は、掲載内容の整合性、代表的な文字列条件の真偽、日時の数値変換、ファイルの体裁を確かめるものです。AWS側のクエリエンジン、利用者の権限、ログ収集設定、実際のデータを検証したことにはなりません。実行結果のサンプルはすべて説明用であり、実測値として扱わないでください。'],
];

export const history = [
 ['Java初期から', 'NullPointerExceptionやOutOfMemoryErrorなど、問題の種類をクラス名で表す仕組みがあります。公式APIのSinceは1.0です。人が書く文面が違っても、クラス名を手掛かりに同じ種類を探せます。〔S24、S25〕'],
 ['Java 1.1 / 1.4', 'SQLExceptionは1.1から、Throwableの原因を扱うgetCauseは1.4からあります。アプリ・サーバー・DBなどの層を通る失敗では、外側の説明だけでなく内側の原因を残す必要がありました。Q35・Q36はこの情報を探すための例です。〔S23、S27〕'],
 ['2013年のWildFly資料', '公式サイトはWildFlyのリリースと旧JBoss ASの配布先を分け、商用JBoss EAPも案内しています。EAPとWildFlyは関連がありますが、製品版・構成部品・版数を同じものとして扱えません。古いJBAS系と新しいWFLY系が現場に混在するため、Q22では両系統を検索対象にしています。〔S22〕'],
 ['2014-07-10', 'AWSの履歴にCloudWatch Logsの追加が記録されています。複数の機械が出す記録を一か所へ集める土台です。集めることと、集まった大量の記録を分析することは異なる作業です。〔S13〕'],
 ['2018-11-27', 'CloudWatch Logs Insightsが一般提供されました。ログ形式と量が増え、一つずつファイルを開いて探す方法では時間がかかるという背景がありました。フィルター・集計・可視化を対話的に行う仕組みにより、障害時に仮説を変えながら調べやすくなりました。〔S11、S12〕'],
 ['2024-11-20', 'AWSの履歴ではフィールドインデックスの追加が記録されています。索引のある項目の等価条件などで、読まなくてよいイベントを飛ばすための仕組みです。本文をあいまいに探すことと、名前付き項目を等価条件で探すことの性能差を理解する背景になります。〔S13、S02〕'],
 ['2026-05-21', 'AWS発表ページの本文日付では、startswithなどの関数とparse logfmtなどの追加が示されています。URLは2026/06を含みますが、日付の説明は本文表記を採用しました。Q47・Q48は従来より分かりやすく書ける例を扱います。〔S15〕'],
 ['2026-06-15', 'Log AnalyticsがLogs Insights・Live Tail・Contributor Insightsをまとめる画面として発表されました。そのため、古い手順の「Logs Insights」というメニュー名だけでは現行画面を見つけにくい場合があります。クエリ言語の選択は引き続き重要です。〔S14〕'],
 ['2026-07-22', 'AWSのドキュメント履歴にestimate追加が記録されています。大きな範囲を読む前に概算量を知る用途です。Q46はログを返す検索とは出力の種類が違うので、見積もり専用と明記しています。〔S13、S10〕'],
 ['確認日現在', '公式関数表にはparseDate、formatDate、queryStartTimeなども掲載されています。関数表には人間向け日時の直接フィルターを非対応とする注意書きもあるため、Q16は文字列をparseDateで数値へ変換して比較します。個々の機能の初出日が確認できないものについて、導入年は推測で付けていません。〔S03〕'],
 ['各クエリの「背景」の位置付け', '各例はこの資料で作成した組み合わせです。個々の検索式が歴史上いつ発明されたかを主張するものではありません。日付を付けた項目は一次資料の事実、日付のない「なぜ必要か」は運用上の課題を説明するための本資料の整理です。'],
];

export const glossary = [
 ['イベント', 'CloudWatch Logsに保存された1つの記録。元ファイルの1行とは限らない。'],
 ['@message', '取り込まれたログ本文。JSONならJSON全体の文字列。'],
 ['message', 'JSON等の利用者側の項目名。@messageとは別。'],
 ['@timestamp', 'イベントに設定された時刻。画面の検索期間の基準。'],
 ['@ingestionTime', 'CloudWatch Logsが受け取った時刻。'],
 ['@log', '通常はアカウントID:ロググループ名という識別子。'],
 ['@logStream', 'ログストリーム名。同名が別グループにあってもよい。'],
 ['fields / display', '項目を用意・表示する。fieldsは計算した項目も作れる。displayで最終表示列を明示できる。'],
 ['filter / like / in', '条件に合う記録を残す / 部分一致を探す / リストのいずれかに等しいか調べる。'],
 ['parse / alias', '文字から項目を取り出す / asなどで付ける一時的な項目名。元データを書き換えない。'],
 ['stats / bin', '集計する / 時刻を指定した幅のまとまりとして扱う。厳密な切り捨て開始時刻が必要ならdatefloorを検討する。'],
 ['sort / limit / dedup', '並べる / 表示件数を制限する / 同じ値をまとめて代表を残す。'],
 ['正規表現', '「数字6文字」などの形を指定する検索ルール。普通の文字列検索より記号の意味が多い。'],
 ['クラス / JVM', 'Javaの部品の型 / Javaプログラムを実行する仕組み。'],
 ['スタックトレース', '例外が起きたときに通っていた処理の場所を並べた情報。'],
 ['接続プール', 'DBなどとの接続を毎回作り直さず、複数の処理で借りて返す仕組み。'],
 ['トランザクション', '関連する更新をひとまとまりとして成功・取り消しする仕組み。'],
 ['相関ID', '一つの依頼を複数の処理・サーバーで追いかけるために付ける札。requestIdなど。'],
];

export const groups = [
 ['basic', '02_基本と除外', '基本検索と文字列の除外'],
 ['scope', '03_時間と対象', '時間範囲とログの出どころ'],
 ['eap', '04_JBoss_EAP', 'JBoss EAPのコードと起動'],
 ['java', '05_Java例外', 'Javaの例外と原因の読み方'],
 ['analysis', '06_集計と新機能', '集計と現在の追加機能'],
];

export const queries = [];
export function add(id, group, name, lines, data) {
  queries.push({id, group, name, lines, ...data});
}
export const base = 'fields @timestamp, @log, @logStream, @message';
export const recent = ['sort @timestamp desc', 'limit 200'];
export const errorToken = String.raw`(?i)(^|[^A-Za-z])(ERROR|FATAL|SEVERE)([^A-Za-z]|$)`;
export const errors = `filter @message like /${errorToken}/`;
export const codes = String.raw`(?<eapCode>(WFLY[A-Z]+[0-9]{4}|JBAS[0-9]{6}|IJ[0-9]{6}|ARJUNA[0-9]{6}|UT[0-9]{6}|MSC[0-9]{6}|HHH[0-9]{6})):`;
