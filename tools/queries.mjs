import {add, base, recent, errors, codes} from './content.mjs';

add('Q01', 'basic', 'まず最新ログを200件読む', [base, ...recent], {
  ready: '値の変更不要。画面でグループと期間を選ぶ。', change: '必要なら200を変更します。',
  purpose: 'ログが届いているか、本文が文章かJSONか、レベルやコードがどの位置にあるかを最初に確認します。検索式を複雑にする前の出発点です。',
  analogy: '図書館の棚を決めて、その中の新しい記録を200枚だけ机へ並べます。どんな書き方の記録なのかを見てから、探し方を決めます。',
  steps: ['fieldsは時刻・グループ・ストリーム・本文を表示項目にします。ここでは条件を付けていないため、情報レベルもエラーも対象です。', 'sort @timestamp descは新しい時刻を先へ並べます。同じ時刻同士の順番は、この指定だけでは一意に決まりません。', 'limit 200は並べた結果から最大200件を返します。検索対象全体を200件だけ読むという指定ではありません。'],
  sample: '09:00 INFO start\n09:01 ERROR failed\n09:02 INFO ready', expected: '09:02、09:01、09:00の順に3件。行を開いて本文全体を読めます。',
  background: 'ログ分析では、形式を知らないまま特定の項目を使うと0件の理由が分からなくなります。2018年登場のLogs Insightsは対話的な探索を目的としており、まず少数の実物を見てから条件を加える使い方と相性があります。',
  caution: '0件なら期間・グループ・リージョン・取り込み状態を確認します。200件出ても「全件200件」とは限りません。', next: 'エラー候補はQ02・Q03、JSONのlevelが見えたらQ04へ進みます。', refs: ['S01','S08','S11']
});
add('Q02', 'basic', 'ERROR・FATAL・SEVEREという語を拾う', [base, errors, ...recent], {
  ready: '値の変更不要。本文のレベル表記を探す汎用例。', change: 'WARNも対象にしたければ正規表現の選択肢へ|WARNを追加します。',
  purpose: 'ERROR、FATAL、SEVEREを大文字小文字に関係なく探します。errorCountのように英字が続く語をある程度避けたいときに使います。',
  analogy: '「赤」という札を探すとき、「赤道」という別の言葉まで拾わないように、札の前後も見ます。',
  steps: ['(?i)はerrorとERRORの違いを無視します。(ERROR|FATAL|SEVERE)は三つの語のどれかという条件です。', '(^|[^A-Za-z])は先頭または英字以外、([^A-Za-z]|$)は英字以外または末尾です。左右が別の英字に続く場合を外します。', '条件に合うイベント全体が残り、その中の一致部分だけを切り出すわけではありません。最後に最新200件を表示します。'],
  sample: 'ERROR request failed\nerror timeout\nINFO errorCount=0\nINFO previous ERROR cleared', expected: '1、2、4番目が残り、errorCountの行は外れます。4番目はレベルがINFOでも本文にERRORがあるため残ります。',
  background: 'ログレベルは緊急度を短いラベルで共有するために使われます。ただし文章ログではレベルと本文が同じ文字列に入ります。この検索は初動の候補集めであり、名前付き項目を持つ構造化ログならQ04の方が意味を絞れます。',
  caution: 'これは厳密なレベル解析ではありません。ERROR123は数字が境界扱いになるため一致します。WARNで出るARJUNAなどは対象外です。', next: 'JSONならQ04。レベルのない例外継続行も探すならQ03・Q30。', refs: ['S02','S17']
});
add('Q03', 'basic', 'エラー・例外・失敗の候補を広く探す', [base, 'filter @message like /(?i)(error|exception|fatal|failed|failure|エラー|例外|失敗)/', ...recent], {
  ready: '値の変更不要。文章・JSONどちらの本文にも使用可能。', change: '製品固有の表現があれば選択肢へ追加します。',
  purpose: '決まったレベルがないログや、Java例外の継続行も含めて、問題らしい言葉を広めに集めます。',
  analogy: '落とし物を探すとき、色や形を厳しく決めず、似ている物をまず集めます。候補は増えますが、その後に本物か見分けます。',
  steps: ['正規表現の選択肢を一つでも含むイベントを残します。単語境界を設けないためNullPointerExceptionやerrorCountにも一致します。', '大文字小文字の違いを無視します。日本語の三つの語も独立した選択肢です。翻訳や語義を理解しているわけではありません。', '元本文を表示するので、否定表現や過去のエラー説明だったかを読み直せます。'],
  sample: 'java.lang.NullPointerException\n処理に失敗しました\nINFO no error detected\nINFO startup complete', expected: '最初の3件が残ります。「no error detected」も文字としてerrorを含むため残ります。',
  background: '異なる言語・ライブラリ・製品を同時に運用すると、同じ問題でも文面がそろいません。候補を広く集めてから狭める探索は、この表記差への対処です。自然言語の意味を判定する仕組みではなく、明示した文字列の一致を使っています。',
  caution: '一致件数をそのまま障害件数と呼ばないでください。Exceptionを含まない独自メッセージは見つかりません。', next: '誤検出の語が分かったらQ09～Q11で除外条件を追加します。', refs: ['S02','S12']
});
add('Q04', 'basic', 'JSONのlevelで正確に絞る', ['fields @timestamp, level, @log, @logStream, @message', "filter level in ['ERROR', 'FATAL', 'SEVERE']", ...recent], {
  ready: 'JSON等からlevelが検出されているログ向け。', change: 'フィールド名と実際の値を確認し、必要なら変更します。',
  purpose: '本文にerrorという語が出ただけのINFOログを避け、levelという項目そのものを比較します。',
  analogy: '作文の中に「欠席」と書いてあるかではなく、出欠表の「出席・欠席」の欄を見ます。指定した欄を見るので意味を取り違えにくくなります。',
  steps: ['levelは自動的にどんな文章からも作られる項目ではありません。JSONの同名キーなど、実際のログ構造が前提です。', 'inはリストのどれかと等しいかを調べます。部分一致ではなく、ここでは大文字のERROR等と比較します。', 'levelと元の@messageを両方表示し、判定と本文の関係を確認できるようにします。'],
  sample: '{"level":"ERROR","message":"payment failed"}\n{"level":"INFO","message":"no error detected"}\n{"level":"error","message":"timeout"}', expected: '1件目だけが残ります。小文字errorはこのリストに含めていないので残りません。',
  background: 'ログを機械で集計するには、自由な文面より名前付きの項目が扱いやすくなります。JSONはそのための代表的な形式です。EAPにもJSONフォーマッターがあり、レベルとメッセージを別々に持てます。',
  caution: 'levelがないイベントはこの条件に一致しません。標準クラスのフィールド自動検出を前提にした例です。', next: '小文字や別名が混ざる場合はQ05へ進みます。', refs: ['S02','S04','S17']
});
add('Q05', 'basic', 'level・logLevel・severityの違いをそろえる', [base, 'fields toupper(coalesce(level, logLevel, severity)) as detectedLevel', "filter detectedLevel in ['ERROR', 'FATAL', 'SEVERE']", ...recent], {
  ready: 'level、logLevel、severityのいずれかが文字列としてあるログ向け。', change: '現場のフィールド名をcoalesceの引数へ合わせます。',
  purpose: 'アプリごとにレベル項目の名前や大文字小文字が違う場合に、同じ条件で探します。',
  analogy: '「なまえ」「氏名」「名前」という別の見出しを、調べるときだけ一つの「名前」欄へ写すようなものです。',
  steps: ['coalesceは左から最初の非null値を選びます。複数の項目がある場合は全部を比べず、左側を優先します。', 'toupperで選んだ文字列を大文字にしてdetectedLevelという一時項目へ入れます。元の保存ログは変わりません。', 'そろえた値をERROR等のリストと比較します。fieldsで追加したdetectedLevelも結果から確認できます。'],
  sample: '{"logLevel":"error"}\n{"severity":"Fatal"}\n{"level":"INFO","severity":"ERROR"}', expected: '1、2件目が残ります。3件目はlevelのINFOが先に選ばれるため外れます。',
  background: '複数チームのアプリを一緒に調べると、同じ意味の項目でも名前が異なります。こうした揺れを検索時に整えると、各サービスの保存形式をすぐ変更できない期間にも調査を進められます。',
  caution: '空文字は非nullなので後続候補へ進みません。数値のseverityや前後の空白を自動的に同じ意味へ変換する例でもありません。', next: '結果のdetectedLevelを確認し、項目の優先順が正しいか見直します。', refs: ['S03','S04']
});
add('Q06', 'basic', '二つの文字列を両方含むログ', [base, "filter @message like 'timeout' and @message like 'database'", ...recent], {
  ready: '任意の本文。例では小文字timeoutとdatabaseを検索。', change: 'timeoutとdatabaseを探したい二つの文字列へ変更します。',
  purpose: 'timeout全般の中から、databaseにも言及するイベントだけへ狭めます。',
  analogy: '赤いボールの中から丸いものを選ぶので、「赤い」と「丸い」の両方が必要です。別のボールの特徴を足し合わせることはできません。',
  steps: ['単一引用符の文字列は部分一致です。二つの語が離れた位置にあっても、同じイベント内にあれば一致します。', 'andで結ぶため、片方だけを含むイベントは外れます。大文字小文字は区別されます。', '二つのイベントをまたいで条件を満たすことはありません。ERROR行と原因行が分割されている場合に差が出ます。'],
  sample: 'database timeout\ntimeout while calling api\ndatabase connected\nDatabase Timeout', expected: '1件目だけ。4件目は大文字小文字が違うため一致しません。',
  background: '同じtimeoutでも通信・DB・処理待ちなど対象が異なります。広い検索結果に対象名を追加すると、担当範囲の切り分けができます。ただし、単語が出たことは原因の証明ではありません。',
  caution: '「timeout is disabled for database」も一致します。英文の意味までは判定しません。', next: '片方だけでも拾うならQ07。大文字小文字を無視するならそれぞれを/(?i)timeout/等にします。', refs: ['S02']
});
add('Q07', 'basic', 'どちらかの文字列を含むログ', [base, "filter (@message like 'timeout' or @message like 'connection refused')", ...recent], {
  ready: '任意の本文。例の文字列は大文字小文字を区別。', change: '二つの文字列を調べたい症状へ変更します。',
  purpose: '待ち時間切れと接続拒否の両方を、一度の検索で候補にします。',
  analogy: 'りんごかみかんなら受け取る箱です。片方でも両方でも条件を満たします。',
  steps: ['orは一方以上の条件が真なら残します。両方を含む1イベントも1件として残り、2件に増えません。', '括弧で二つの選択肢をひとまとまりにしています。後からandで環境名などを追加しても意図を読み取りやすくなります。', '引用符の中の空白も文字列の一部です。connection refusedはその並びを含む場合に一致します。'],
  sample: 'socket timeout\nconnection refused\ntimeout then connection refused\nconnection established', expected: '最初の3件が残ります。3件目を二重に表示することはありません。',
  background: '通信失敗は待ち続けた結果のtimeoutと、接続開始時に拒否される場合などに分かれます。初動で一つの文面しか探さないと、別の失敗形態を見落とすため、候補を並べて探します。',
  caution: 'rejected、timed outなど別の表現は自動追加されません。候補語は実ログに合わせて増やします。', next: '除外条件を足すなら括弧の後にandを付けるか、別のfilterへ分けます。', refs: ['S02']
});
add('Q08', 'basic', '本文全体が指定文字列と等しいログ', [base, "filter @message = 'Connection refused'", ...recent], {
  ready: '本文が文字列そのものになっているログ向け。', change: 'Connection refusedを実際の本文全体へ変更します。',
  purpose: '部分一致では広すぎる場合に、本文全体の完全一致を使います。',
  analogy: '「たろう」を含む名前を探すのではなく、名札にちょうど「たろう」と書かれた人を探します。',
  steps: ['=は値全体の等しさを調べます。前後に時刻、ERROR、空白、改行などがあれば同じ文字列ではありません。', '@messageはJSONのmessageキーの値とは別で、取り込まれた本文全体です。JSONなら波括弧等も含みます。', '結果が0件ならまずQ01で実際の本文を確認し、比較対象のフィールドが適切かを調べます。'],
  sample: 'Connection refused\nERROR Connection refused\n{"message":"Connection refused"}', expected: '1件目だけ。JSONの内部messageを完全一致で調べる場合は比較対象をmessageへ変更します。',
  background: '検索では「同じ語を含む」と「同じ値である」を区別する必要があります。固定の短いイベントを監視・整理する場合は完全一致が有効ですが、日時やIDを含む文章ログでは一致しにくくなります。',
  caution: 'コピー時の末尾改行や空白にも注意します。見た目が似ていても全角・半角の違いは残ります。', next: '前後に何か付くログを拾いたければlikeを使うQ06・Q07へ戻ります。', refs: ['S02','S04']
});
add('Q09', 'basic', '指定した文字列を含むログを除外', [base, "filter @message not like 'healthcheck'", ...recent], {
  ready: '任意の本文。healthcheckを含まない全レベルが対象。', change: 'healthcheckを除外したい文字列へ変更します。',
  purpose: '定期確認など同じメッセージが大量に出て調査しにくいとき、表示対象から外します。',
  analogy: '仕分けするカードのうち「定期点検」と書かれたカードを別の箱へ置き、残りを読みます。保管庫のカードを捨てる操作ではありません。',
  steps: ['not likeは指定文字列を含まないイベントを残します。単一引用符なので文字列中のドットや角括弧も検索規則にはなりません。', '小文字healthcheckとの一致であり、HealthCheckなどはそのままでは除外されません。', 'このクエリにはエラーフィルターがありません。INFO等も含む残りの最新200件を返します。'],
  sample: 'INFO healthcheck OK\nERROR healthcheck failed\nERROR payment failed\nINFO HealthCheck OK', expected: '3、4件目が残ります。healthcheckの本当の失敗である2件目も除外されます。',
  background: '運用では正常な定期記録が障害の手掛かりを埋めることがあります。ノイズを減らすため除外が必要になりますが、除外語のある失敗まで消えるので、除外前の検索も保持して比較する習慣が役立ちます。',
  caution: '元ログは削除されません。空文字を除外語にすると意図せずほぼ全部を外すため、空のまま使わないでください。', next: '複数語を外すならQ10、大文字小文字をそろえるならQ11。', refs: ['S02']
});
add('Q10', 'basic', '複数の文字列をまとめて除外', [base, "filter @message not like 'healthcheck' and @message not like 'heartbeat'", ...recent], {
  ready: '任意の本文。二つとも含まないものが残る。', change: '二つの除外語を実際のノイズに合わせます。',
  purpose: 'healthcheckとheartbeatのどちらも表示したくない場合に使います。',
  analogy: '「泥が付いていない」かつ「穴が開いていない」靴だけを選ぶのと同じです。一方だけ満たせばよい条件ではありません。',
  steps: ['最初の条件でhealthcheckを含むイベントを外します。二つ目の条件でheartbeatを含むイベントを外します。', 'andなので、両方の「含まない」が成立する場合だけ残ります。別々のfilterを2行書いても同じ論理になります。', 'orへ変えると、healthcheckだけの行は「heartbeatではない」を満たして残ります。除外の組み合わせで多い誤りです。'],
  sample: 'healthcheck OK\nheartbeat OK\nhealthcheck heartbeat\npayment failed', expected: '4件目だけが残ります。どちらか一方でも除外語を含めば外れます。',
  background: '一種類の正常ログを除いても、別の定期ログが大量に残ることがあります。除外規則を積み重ねるときこそ、日常語の「AやBを除く」を論理式へ正しく直す必要があります。',
  caution: '候補語を増やすほど取りこぼしも増えます。除外条件の一覧を運用上の根拠と一緒に管理します。', next: '一つの正規表現にまとめ、大文字小文字も無視したい場合はQ11。', refs: ['S02']
});
add('Q11', 'basic', '大文字小文字を無視して複数語を除外', [base, 'filter @message not like /(?i)(healthcheck|heartbeat)/', ...recent], {
  ready: '任意の本文。正規表現で除外する例。', change: '括弧内の選択肢を変更。記号を含む語はエスケープを確認します。',
  purpose: 'HealthCheck、HEARTBEATなどの表記差がある定期ログをまとめて外します。',
  analogy: '大文字の名札も小文字の名札も同じ名前として扱い、指定の名前の人を候補から外します。',
  steps: ['/(?i).../は大文字小文字を無視する正規表現です。|で並べたどれかが見つかるかを調べます。', 'not likeなので、選択肢のどれも見つからないイベントを残します。Q10の二つの否定をandで結ぶ考え方と対応します。', '正規表現の記号は意味を持ちます。例の語は英字だけですが、a.bをそのまま選択肢へ入れるとaxbにも一致します。'],
  sample: 'HealthCheck OK\nHEARTBEAT OK\nERROR payment failed', expected: '3件目だけが残ります。',
  background: 'ログの表記はライブラリや担当者で変わります。表記差への対処を個別条件で増やす代わりに、大小文字を無視する規則へまとめると意図を読みやすくできます。',
  caution: '普通の文字列を安全に探すだけならQ09・Q10が分かりやすい選択です。正規表現の機能を必要以上に使うと、除外範囲が広がることがあります。', next: '除外前の件数と比較し、実際の障害まで隠していないか本文を確認します。', refs: ['S02']
});
add('Q12', 'basic', '指定loggerNameだけを除外し、項目なしは残す', [base, "filter (not ispresent(loggerName)) or loggerName != 'com.example.HealthCheck'", ...recent], {
  ready: 'JSON等のloggerNameがあるログと、ないログが混在する場合。', change: 'com.example.HealthCheckを除外対象の完全な値へ変更します。',
  purpose: '特定ロガーの記録だけを外し、loggerName項目のない文章ログまで調査対象から落とさないようにします。',
  analogy: '名札のある人なら指定の名前を除き、名札を付けていない人は別途残します。「名前が違う人」だけでは、名前を読めない人の扱いが曖昧になります。',
  steps: ['ispresentは項目が存在するかを調べます。notを付けた左側はloggerNameのないイベントを受け入れます。', '右側はloggerNameが指定値と等しくない場合を受け入れます。完全一致の除外なので、com.example.HealthCheckExtraは残ります。', 'orで二つを結び、項目なしも別名も残します。欠損値の比較だけに依存しない形です。'],
  sample: '{"loggerName":"com.example.HealthCheck"}\n{"loggerName":"com.example.Payment"}\nERROR plain text', expected: '2、3件目が残ります。空文字のloggerNameも指定値とは異なるので残ります。',
  background: '構造化ログへ一度に移行できず、新旧形式が混ざる期間があります。項目のある記録だけを前提にした除外は調査の母集団を変えるため、項目がない場合の扱いを式へ明示します。',
  caution: 'JSONで明示的にnullを入れた場合も残したいなら、実データの扱いを確認し、coalesceなどで方針を明示します。この例の主眼は項目そのものがない場合です。', next: '本文にレベル語がある記録だけへ絞るなら、後ろにQ02のfilterを追加します。', refs: ['S03','S04']
});

add('Q13', 'scope', '実行開始時点から直近15分', [base, 'filter toMillis(@timestamp) >= (now() * 1000 - 15 * 60 * 1000) and toMillis(@timestamp) <= now() * 1000', ...recent], {
  ready: '値の変更不要。画面の期間にも直近15分を含める。', change: '15を必要な分数へ変更します。',
  purpose: '毎回日時を書き換えず、実行した時点に近いログを探します。',
  analogy: '今から15分前までの出来事だけをノートから探します。昨日のページを開いたままでは、今日の出来事は見つかりません。',
  steps: ['now()はクエリ処理が始まった時刻をepoch秒で返します。1000倍してミリ秒へ直します。', '15×60×1000は15分に相当するミリ秒です。それを引いた時刻以上のイベントを残します。上限も付け、未来時刻の記録を除きます。', 'toMillis(@timestamp)もミリ秒なので単位がそろいます。画面の期間とこの条件の共通範囲が実際の対象です。'],
  sample: '実行開始を10:00:00と仮定\n09:44:59.999 / 09:45:00.000 / 09:59:00.000 / 10:01:00.000', expected: '09:45:00と09:59:00が残ります。10:00:00ちょうども上限に一致すれば残ります。',
  background: '繰り返す運用確認では、同じ問いを毎回「今」を基準に実行したいことがあります。相対時間は日時の手入力を減らせますが、後日同じ結果を再現するには固定期間の記録が必要です。',
  caution: 'now()は画面で選んだ期間の終了時刻ではありません。過去の期間を選んだまま実行すると0件になり得ます。', next: '過去障害の再現はQ15・Q16を使います。', refs: ['S03','S28']
});
add('Q14', 'scope', '直近24時間のエラー候補', [base, 'filter toMillis(@timestamp) >= (now() * 1000 - 24 * 60 * 60 * 1000) and toMillis(@timestamp) <= now() * 1000', errors, ...recent], {
  ready: '値の変更不要。画面でも直近24時間を選択。', change: '24を必要な時間数へ変更します。',
  purpose: '夜間や前日の作業を含む一定時間のエラー候補をまとめて確認します。',
  analogy: '今日の今の時刻から、時計を一周さかのぼった分の赤い札を探します。カレンダー上の「昨日1日」とは範囲が違います。',
  steps: ['24×60×60×1000は24時間分のミリ秒です。Q13と同じ比較を時間単位へ広げます。', '次のfilterでERROR等の語を持つイベントへさらに絞ります。時間条件だけを満たすINFOは残りません。', '新しい順で200件まで返すため、1日分の全件を示すわけではありません。総件数はstatsで別途数えます。'],
  sample: '実行開始10/16 10:00を仮定\n10/15 09:59 ERROR\n10/15 10:00 ERROR\n10/16 09:00 INFO\n10/16 09:30 ERROR', expected: '10/15 10:00と10/16 09:30のERRORが候補になります。',
  background: '当番の引き継ぎでは、担当時間だけでなく前の担当時間に始まった異常も知る必要があります。移動する24時間窓は日々の確認に使えます。一方、日報で「JSTの昨日0時～24時」を集計するなら固定した暦日を選びます。',
  caution: '24時間と「今日」「昨日」は同じではありません。大量ログではまず時間と対象を絞ります。', next: '増加時刻を見るなら同じ時間条件にQ40の集計を組み合わせます。', refs: ['S03','S02','S07']
});
add('Q15', 'scope', '固定時間をepochミリ秒で指定', [base, 'filter toMillis(@timestamp) >= 1790812800000 and toMillis(@timestamp) < 1790816400000', ...recent], {
  ready: '例は2026-10-01 09:00以上10:00未満JST。画面の期間も合わせる。', change: '開始・終了のepochミリ秒を調査日時へ変更します。',
  purpose: '障害報告の時刻を固定し、後から同じ時間窓を再検索できるようにします。',
  analogy: 'ノートに付けるしおりを「今の少し前」ではなく「10月1日9時から10時まで」に固定します。',
  steps: ['1790812800000は2026-10-01 00:00 UTC、つまり09:00 JSTです。1790816400000はその1時間後です。', '開始は>=で含め、終了は<で含めません。隣の時間窓と接続しても境界を二重計上しない形です。', '13桁のミリ秒値を比較します。10桁のepoch秒を誤って入れると、意図する日付になりません。'],
  sample: '2026-10-01 JST\n08:59:59.999 / 09:00:00.000 / 09:59:59.999 / 10:00:00.000', expected: '09:00:00.000と09:59:59.999が残ります。10:00ちょうどは次の時間窓です。',
  background: '時刻文字列は時差や表示形式の解釈が問題になります。数値へそろえれば比較条件を明確にできます。固定期間は障害の再調査・担当者間の再現・検証前後の比較に向きます。',
  caution: '画面で直近1時間を選んだまま、この過去の条件だけを書いても検索できません。数値だけでは人が読みにくいので、元のJST日時も記録します。', next: '日時を読みやすく書きたい場合はQ16。', refs: ['S03','S28']
});
add('Q16', 'scope', 'JSTの日時をparseDateで数値へ直して指定', [base, "filter toMillis(@timestamp) >= parseDate('2026-10-01 09:00:00', 'yyyy-MM-dd HH:mm:ss', 'Asia/Tokyo') and toMillis(@timestamp) < parseDate('2026-10-01 10:00:00', 'yyyy-MM-dd HH:mm:ss', 'Asia/Tokyo')", ...recent], {
  ready: '現行公式関数表のparseDateを使用。画面にも同じ日時範囲を設定。', change: '二つの日時を変更。日本以外ならタイムゾーンも合わせます。',
  purpose: '固定日時を人が読みやすい文字列で残しつつ、比較は数値で行います。',
  analogy: '「午前9時」という言葉を計算用の時計の数字へ翻訳してから、前後を比べます。翻訳に使う地域も明記します。',
  steps: ['parseDateは文字列を指定書式で解釈し、epochミリ秒を返します。ここではAsia/Tokyoを明示します。', 'yyyyは年、MMは月、ddは日、HHは24時間制の時、mmは分、ssは秒です。MMとmmを入れ替えると意味が変わります。', 'toMillis(@timestamp)と数値同士を比較します。@timestampをそのまま任意の日時文字列と比べる書き方は採用しません。'],
  sample: 'Q15と同じ4つの境界時刻を入力したと仮定します。', expected: 'Q15と同じ2件が残る意図のクエリです。開始・終了の数値はそれぞれ1790812800000、1790816400000です。',
  background: '読みやすさと機械的な比較を両立するための変換です。確認日現在のAWS公式表にparseDateが掲載されていますが、この資料では未確認の導入年月は付けません。',
  caution: '書式と文字列を一致させます。公式ページには人間向け日時の直接フィルターを非対応とする注意もありますが、この例は数値への明示変換を挟みます。利用環境で未対応ならQ15を使います。', next: '画面の表示タイムゾーンも確認し、同じ時間窓として読めるか確かめます。', refs: ['S03']
});
add('Q17', 'scope', '取り込みまで1分を超えたログ', [base, 'fields (toMillis(@ingestionTime) - toMillis(@timestamp)) / 1000 as ingestionLagSeconds', 'filter ingestionLagSeconds > 60', 'sort ingestionLagSeconds desc', 'limit 200'], {
  ready: '値の変更不要。イベント発生時刻で十分な範囲を選択。', change: '60は秒のしきい値です。必要に応じて変更します。',
  purpose: 'ログが遅れて届いていそうなイベントを調べます。障害時刻と画面に現れた時刻の食い違いを調べる入口です。',
  analogy: '手紙を書いた時刻と、郵便局へ届いた時刻の差を測ります。長い差があっても、配達だけでなく出すまで待っていた可能性もあります。',
  steps: ['二つの時刻を同じミリ秒単位へ直し、到着時刻からイベント時刻を引きます。', '1000で割って秒にします。60より大きい値なので、ちょうど60秒は対象外、60.001秒は対象です。', 'sortは時刻ではなく差の大きい順です。遅延候補の大きなものを先に表示します。'],
  sample: '発生09:00:00・到着09:00:30\n発生09:00:00・到着09:02:00\n発生09:03:00・到着09:02:00', expected: '2件目が120秒として残ります。3件目の負の差はこの条件には残りません。',
  background: '収集処理は送信をまとめたり再送したりするため、記録の時刻と受信時刻がずれることがあります。時刻の意味を分けると「今起きた問題」と「前の問題が今届いた」を混同しにくくなります。',
  caution: 'ネットワーク遅延の確定値ではありません。時計ずれや収集時の日時解釈も含みます。画面の期間は@ingestionTimeを基準に自動変更されません。', next: '本文の日時、収集エージェントの設定、対象ホストの時計と合わせて確認します。', refs: ['S03','S04','S16']
});
add('Q18', 'scope', 'ロググループ名を完全一致で絞る', [base, 'parse @log /^[^:]+:(?<groupName>.*)$/', "filter groupName = '/example/eap/prod'", ...recent], {
  ready: '対象グループを画面で選択済みであること。', change: '/example/eap/prodを実在するグループ名へ変更します。',
  purpose: '複数グループを選んだ検索から、特定名のグループだけを残します。',
  analogy: '棚の札に「所有者番号:棚の名前」と書かれているので、コロンの後ろの名前を取り出して比べます。',
  steps: ['@logは通常account-id:log-group-nameです。^[^:]+:で先頭から最初のコロンまでを読み飛ばします。', '(?<groupName>.*)で残りをgroupNameという一時項目へ入れます。末尾$まで読むので名前全体です。', '=でグループ名全体を比較します。/prod-oldのような別名は残りません。'],
  sample: '111122223333:/example/eap/prod\n111122223333:/example/eap/prod-old\n444455556666:/example/eap/prod', expected: '画面で両アカウントが検索対象なら、1、3件目が残ります。アカウントを取り除いて名前だけを比べるためです。',
  background: '複数環境や複数アカウントをまとめて観測すると、同じ名前のグループが別の場所にも存在します。名前と所有者を分けて考えると、検索の意味が明確になります。',
  caution: '一つのアカウントだけを狙うなら、@log全体を実際の「アカウントID:グループ名」と完全一致で比較する方法もあります。フィルターは未選択グループを追加しません。', next: '名前の一部分で探す場合はQ19、複数の名前ならQ20。', refs: ['S04','S05','S06']
});
add('Q19', 'scope', 'ロググループ名を文字列で絞る', [base, "filter @log like ':/example/eap/'", ...recent], {
  ready: '画面で選択済みのグループの識別子を部分一致検索。', change: ':/example/eap/を目的のグループ名の並びへ変更します。',
  purpose: '環境名などの共通部分を持つ複数グループを手早く残します。',
  analogy: '棚の名前に共通の目印が付いているので、その目印がある棚のカードだけを使います。',
  steps: ['likeの引用符付き文字列は部分一致です。スラッシュを正規表現の区切りと混同せず、文字として扱えます。', '先頭のコロンは@logのアカウントと名前の区切りを利用しています。この例では名前が/example/eap/で始まる並びを狙います。', '検索先を選ぶSOURCEの代用品ではありません。画面で選ばれた対象の中で、結果を絞る条件です。'],
  sample: '111122223333:/example/eap/prod\n111122223333:/example/eap/test\n111122223333:/example/api/prod', expected: '最初の2グループのイベントが残ります。prodだけに限定する式ではありません。',
  background: '運用の命名規則に共通の接頭部分を付けると、関連システムをまとめて探しやすくなります。検索はその命名規則を利用するため、命名が揃っていないグループの見落としに注意します。',
  caution: '対象を減らしたいだけなら、まず画面で必要なグループだけを選ぶ方が検索範囲を明確にできます。', next: '明示的な前方一致の関数を使う例はQ48。', refs: ['S02','S04','S05']
});
add('Q20', 'scope', '複数のロググループ名を指定', [base, 'parse @log /^[^:]+:(?<groupName>.*)$/', "filter groupName in ['/example/eap/prod', '/example/api/prod']", ...recent], {
  ready: '指定するグループを画面でも選択。', change: 'リスト内の名前を実際のグループ名へ変更します。',
  purpose: 'EAPとAPIなど、関連する複数のサービスを同じ時間軸で調べます。',
  analogy: '図書館の棚番号を二つ指定し、その二つの棚の記録を一枚の時刻順の一覧へ集めます。',
  steps: ['Q18と同様に@logからグループ名を抽出します。', 'inのリストにある名前のどれかと完全一致するイベントを残します。部分一致のために*を入れる構文ではありません。', 'グループをまたいで時刻順に並べます。@logと@logStreamを表示しているため出どころを失いません。'],
  sample: '/example/eap/prod 09:01 ERROR\n/example/api/prod 09:02 ERROR\n/example/eap/test 09:03 ERROR', expected: 'prodの2件が残ります。09:02のAPIが先、その次が09:01のEAPです。',
  background: '利用者の一つの依頼が複数サービスを通る構成では、一つのサーバーだけ見ても流れが分かりません。関連する出どころを並べて読むための入口です。',
  caution: '近い時刻というだけでは同じ依頼とは限りません。複数アカウントの同名グループも対象になるので、必要ならアカウント込みで絞ります。', next: '同じ依頼を正確に追うにはQ38で相関IDを使います。', refs: ['S02','S04','S06']
});
add('Q21', 'scope', '一つのログストリームへ絞る', [base, "filter @logStream = 'server-01'", ...recent], {
  ready: '対象グループを画面で選択済みであること。', change: 'server-01を結果に表示された実際のストリーム名へ変更します。',
  purpose: '複数台の中で特定のサーバーやコンテナ由来の記録を調べます。',
  analogy: '同じ棚に複数のノートがあるとき、まず1冊を選んで読みます。',
  steps: ['@logStreamの値を完全一致で比べます。名前の一部を使う場合は=からlikeへ変更します。', 'ストリーム名の形式は収集方法が決めます。必ずしもホスト名と等しいわけではありません。', '選んだストリームのイベントを新しい順に表示します。元のグループも結果に残して確認できます。'],
  sample: 'server-01 09:00 ERROR\nserver-02 09:01 ERROR\nserver-01-old 09:02 ERROR', expected: '1件目だけが残ります。',
  background: '同じアプリでも一部のインスタンスだけで失敗する場合があります。出どころを限定すると、その個体の起動時刻・設定・接続状態などと照らし合わせやすくなります。',
  caution: '別グループに同名ストリームがあればそれも残ります。単一の出どころを特定したいときはグループとストリームの両方で絞ります。', next: '例外の前後関係を読むならQ39。', refs: ['S02','S04']
});

add('Q22', 'eap', 'WFLY・旧JBAS系コードを広く探す', [base, 'filter @message like /(WFLY[A-Z]+[0-9]{4}|JBAS[0-9]{6}):/', ...recent], {
  ready: '値の変更不要。典型的なWFLY・JBASコードの形を検索。', change: '特定コードが分かっていればQ23へ切り替えます。',
  purpose: 'EAP本体が出すメッセージの候補を、文章の言語に左右されにくいコードで探します。',
  analogy: '説明文を全部読む前に、本の背表紙に付いた分類番号を探します。番号がある本すべてが問題の本というわけではありません。',
  steps: ['WFLY[A-Z]+[0-9]{4}はWFLYに英大文字が続き、その後に数字4文字がある形を探します。WFLYSRV0025などが該当します。', 'JBAS[0-9]{6}は旧系統の代表的な数字6文字の形です。末尾のコロンも条件にし、文中の単なる説明語との差を付けます。', 'レベルは判定していません。起動・停止・警告・失敗などの候補が一緒に出ます。'],
  sample: 'INFO WFLYSRV0025: server started\nERROR WFLYCTL0013: operation failed\nERROR JBAS014777: service example\nWARN ARJUNA012117: transaction example', expected: '最初の3件が残ります。ARJUNAはこの正規表現の対象外です。説明文は教育用に短縮しています。',
  background: '旧JBoss ASからWildFlyへ続く系統と製品版EAPの世代差により、運用ログには接頭辞の異なるメッセージが混在します。番号を軸にすると、同じ種類のメッセージを追いやすくなります。',
  caution: 'EAPに含まれる全ライブラリのコードを網羅する式ではありません。コードの存在だけでエラーと判断しないでください。', next: '接続はQ25、トランザクションはQ26、Web処理はQ27を確認します。', refs: ['S17','S22','S06']
});
add('Q23', 'eap', 'WFLYCTL0013をピンポイントで探す', [base, "filter @message like 'WFLYCTL0013:'", ...recent], {
  ready: '値の変更不要。EAPの管理操作失敗候補を検索。', change: '別の既知コードを探すときはコロンまで含めて置き換えます。',
  purpose: 'デプロイや設定変更などの操作が失敗した記録を探し、どの操作・対象だったかを読みます。',
  analogy: '「申し込みを受け付けられませんでした」という整理番号の通知を集め、通知の詳細欄で失敗理由を調べます。',
  steps: ['コード文字列とコロンの並びを含むイベントを残します。WFLYCTL00130のような長い数字の一部として拾いにくくします。', 'メッセージ本文に出る操作名、対象のaddress、failure descriptionなどを読みます。コード自体は原因を一つに決めません。', '同じ時刻近くにWFLYCTL0080やWFLYSRV0153、Java例外があれば関連候補としてたどります。'],
  sample: 'ERROR WFLYCTL0013: deployment operation failed\nINFO WFLYSRV0025: server started', expected: '1件目が残ります。実ログの操作名や失敗説明は省略せず読んでください。',
  background: '管理操作は設定・依存サービス・デプロイ対象など多くの部品へ影響します。失敗を操作単位でまとめた外側の通知を探すと、利用者が実行した変更とログを対応させやすくなります。',
  caution: '「WFLYCTL0013があるからDB障害」などと原因を固定しないでください。同じコードでも内側の理由は異なります。', next: 'Q24で関連コードを一緒に探し、Q36でCaused byを確認します。', refs: ['S18','S02']
});
add('Q24', 'eap', 'デプロイ・サービス失敗の関連コードを探す', [base, 'filter @message like /(WFLYCTL0013|WFLYCTL0080|WFLYSRV0153):/', ...recent], {
  ready: '値の変更不要。代表的な関連コードの候補検索。', change: '環境で確認した関連コードを追加できます。',
  purpose: '操作失敗、失敗サービスの一覧、デプロイ段階の失敗を横断して探します。',
  analogy: '文化祭が開けないとき、「開催準備失敗」「会場準備失敗」「照明の取り付け失敗」という別の階層の連絡を集めるイメージです。',
  steps: ['三つのコードのいずれかを含むイベントを残します。1イベントに複数のコードがあっても、ここではイベントは1件のままです。', 'WFLYCTL0013は操作失敗、WFLYCTL0080は失敗サービス、WFLYSRV0153はデプロイ処理の段階に関する失敗の手掛かりです。', '本文にあるPARSE、STRUCTURE、POST_MODULEなどの段階名と、さらに内側の例外を確認します。'],
  sample: 'ERROR WFLYCTL0013: failed; WFLYCTL0080: failed services; WFLYSRV0153: deployment phase failed\nINFO WFLYSRV0025: server started', expected: '1件目が1イベントとして残ります。コード3個だから失敗3回と数えるわけではありません。',
  background: 'アプリの配置は一つの動作に見えても、読み込み・解析・依存関係の解決などの段階があります。外側と内側のメッセージが連なるため、関連するコードをまとめると調査が途切れにくくなります。',
  caution: 'これらのコードは失敗の位置を示す手掛かりで、原因の種類を網羅した一覧ではありません。対象版の本文を必ず確認します。', next: 'クラス関係ならQ33、DB関係ならQ25・Q35、全文の前後関係はQ39。', refs: ['S18','S06']
});
add('Q25', 'eap', 'IJ000453・IJ000655で接続確保の失敗を探す', [base, 'filter @message like /(IJ000453|IJ000655):/', ...recent], {
  ready: '値の変更不要。IronJacamar系の接続管理メッセージ。', change: 'DB名等を加える場合は、同じイベントにあることを確認します。',
  purpose: '管理された接続を取得できなかった、または待ち時間内に接続が空かなかった記録を探します。',
  analogy: '共有のはさみを借りようとしても全部貸し出し中で、待ち時間を過ぎた状況に似ています。ただし、はさみの保管場所自体が開かない場合もあります。',
  steps: ['IJ000453とIJ000655のどちらかを含むイベントを残します。ERRORという単語を追加条件にしないので、例外の継続行も候補です。', '接続先のJNDI名や内側の例外を読み、どの資源を借りられなかったのかを確認します。', '件数が増えた時刻と、接続を返せているか、外部サービスの状態などを突き合わせます。'],
  sample: 'IJ000453: connection allocation failed for example resource\nIJ000655: waiting for a connection exceeded timeout\nINFO connection acquired', expected: '1、2件目が残ります。例文は意味を説明するための架空の短縮ログです。',
  background: '接続プールは接続を再利用して負荷を抑えます。その一方、借りた接続が返らない、処理が長い、接続先へ入れない場合には取得待ちが発生します。このコードは、その観測点を見つける手掛かりです。',
  caution: 'プール不足や接続リークを断定するコードではありません。IJ000453はJMS資源でも現れるため、DB専用と決めつけません。', next: '内側のSQL例外はQ35。トランザクションの待ち時間はQ26も確認します。', refs: ['S19','S29']
});
add('Q26', 'eap', 'ARJUNAのタイムアウト・中断候補を探す', [base, 'filter @message like /(ARJUNA012117|ARJUNA012095|ARJUNA012108|ARJUNA012121):/', ...recent], {
  ready: '値の変更不要。WARNを含めて検索。', change: '対象版で確認した関連コードを追加できます。',
  purpose: 'トランザクションが時間内に終わらず、中断や取り消しに進んだ痕跡を調べます。',
  analogy: '給食の配膳を「全部そろってから完了」とする約束で、時間を過ぎてもそろわず、いったん取りやめる状況です。',
  steps: ['四つのコードをorで探します。レベルをERRORに限定しないためWARNの通知も残ります。', 'ARJUNA012117などの本文にあるトランザクションIDと、その後の中断・取り消し通知を対応させます。', '同じIDに対する複数メッセージが出ても、別々の業務トランザクションとは限りません。'],
  sample: 'WARN ARJUNA012117: transaction check example\nWARN ARJUNA012121: cancellation example\nINFO business completed', expected: '最初の2件が残ります。ERRORだけを検索するQ02では拾えない場合があります。',
  background: '複数の更新をまとめるトランザクションには、永遠に資源を占有しないよう期限が必要です。Red Hatの資料では、7.4.0より前と以後でARJUNA012117の文面が変わることも示されています。コードで探すと文面差に対応しやすくなります。',
  caution: 'タイムアウト値を増やすだけで根本原因が直るとは限りません。DB待ち、外部呼び出し、スレッドの停滞などを調べます。', next: '関連する処理のID・時刻を使いQ38・Q39へ進みます。', refs: ['S20']
});

add('Q27', 'eap', 'UT005023でWebリクエストの例外を探す', [base, "filter @message like 'UT005023:'", ...recent], {
  ready: '値の変更不要。Undertow系の該当メッセージを検索。', change: '特定URLも狙うなら同じイベントにある文字列条件を追加。',
  purpose: 'Webリクエストの処理中に例外が起きた記録を探します。利用者の「画面がエラーになった」とサーバー側の情報を結び付ける入口です。',
  analogy: '窓口係が「この受付を処理できませんでした」と報告した札を集め、札の裏にある詳しい理由を読みます。',
  steps: ['UT005023:という識別子のあるイベントを残します。URLの形が違ってもコードを軸に探せます。', '本文の対象パスや、その後のJava例外クラス名を読みます。UT005023自体から根本原因を一つに決めません。', '最新順で表示し、同じURL・同じ例外が集中していないかを確認します。'],
  sample: 'ERROR UT005023: request example; java.lang.NullPointerException\nINFO request completed', expected: '1件目が残ります。入力例は実ログの引用ではなく、構造を示した短縮例です。',
  background: 'Webサーバーは共通の入口として多種類のアプリ例外を受け取ります。入口のコードを探せば、アプリ側の例外名をまだ知らない段階でも候補を集められます。',
  caution: 'HTTP 500のすべてがこのコードで記録されるとは限りません。アプリが例外を処理して別形式で記録する場合もあります。', next: '例外の種類はQ30～Q36、周辺の依頼はQ38。', refs: ['S21','S23']
});
add('Q28', 'eap', '最初のEAP関連コードを取り出して件数順に集計', [base, `parse @message /${codes}/`, 'filter ispresent(eapCode)', 'stats count(*) as eventCount by eapCode', 'sort eventCount desc', 'limit 50'], {
  ready: '値の変更不要。代表的なコード形式を対象にした集計。', change: '必要な接頭辞を追加する場合は桁数と形式を確認します。',
  purpose: 'どの種類のメッセージが多いかを一覧にして、調査の優先候補を見つけます。',
  analogy: '整理番号付きカードを番号ごとの箱に入れ、箱の中の枚数を数えます。一枚に複数番号があれば、この例では最初の番号の箱へ入れます。',
  steps: ['parseの(?<eapCode>...)は一致したコードを一時項目へ取り出します。WFLY、JBAS、IJ、ARJUNA、UT、MSC、HHHの代表形を並べています。', 'parseだけでは不一致イベントは消えません。ispresent(eapCode)で抽出できたイベントだけを残します。', 'stats count(*) by eapCodeでコード別イベント数に変換します。その後は個別本文ではなく集計表を並べ替えています。'],
  sample: 'WFLYCTL0013: A\nWFLYCTL0013: B; WFLYCTL0080: C\nIJ000453: D', expected: 'WFLYCTL0013が2、IJ000453が1。2件目の後ろのWFLYCTL0080はこの集計では数えません。',
  background: '同じメッセージの洪水を一件ずつ読むと全体像をつかめません。変化しにくいコードでまとめると、名前やIDなどの違いに邪魔されず頻度を見られます。',
  caution: 'コード出現総数ではなく「最初に抽出したコード別のイベント数」です。正常コードも含まれます。全コード・全製品の形式を網羅していません。', next: '上位コードをQ23の文字列へ入れて本文を読みます。', refs: ['S06','S07','S17']
});
add('Q29', 'eap', '起動開始・正常起動・関連失敗を時刻順に読む', [base, 'filter @message like /(WFLYSRV0049|WFLYSRV0025|WFLYCTL0013|WFLYSRV0153):/', 'sort @timestamp asc', 'limit 1000'], {
  ready: '値の変更不要。できれば1台の短い起動期間に絞る。', change: '必要に応じてQ21のストリーム条件を追加します。',
  purpose: '起動の開始、起動完了、設定やデプロイの失敗を流れとして読みます。',
  analogy: '学校行事の「準備開始」「準備完了」「途中の問題」を時間順に並べ、どこで止まったかを探します。',
  steps: ['WFLYSRV0049は起動開始の目印、WFLYSRV0025は正常起動メッセージの目印として使います。失敗コードも選択肢に含めます。', 'ascは古い時刻を先にします。通常の最新順とは逆にし、流れをたどりやすくしています。', '1000件を上限にするため、範囲が広いと後半が表示されない可能性があります。対象台数と期間を絞ります。'],
  sample: '09:00 WFLYSRV0049: starting example\n09:01 WFLYSRV0153: deployment failed example\n09:02 WFLYCTL0013: operation failed example', expected: '09:00、09:01、09:02の順に表示されます。正常起動のメッセージがない理由は、期間外・取り込み漏れ等も含めて調べます。',
  background: 'サーバーが動き始めるまでには複数の段階があります。Red Hatの手順でも起動開始の識別子を探す方法が示されており、エラーだけを抜き出すより前後関係を保ちやすくなります。',
  caution: '選んだコード以外の重要な記録は省かれています。完全な起動診断や正常性判定ではありません。複数回の起動が混じらないようにします。', next: '気になる区間をQ39でフィルターなしの本文一覧として読みます。', refs: ['S17','S18']
});
add('Q30', 'java', 'JavaのException・Errorクラス名を広く探す', [base, String.raw`filter @message like /[A-Za-z_$][A-Za-z0-9_$]*[.][A-Za-z0-9_$.]*(Exception|Error)\b/`, ...recent], {
  ready: '値の変更不要。パッケージ名付きの代表的なJava例外表記。', change: '独自命名や省略名の例外は別の文字列条件を追加します。',
  purpose: 'ERRORというログレベルが付かない継続行からも、Javaの例外候補を見つけます。',
  analogy: '文章の中から「住所付きの名前」を探します。住所と名前の形が分かれば、知らない人でも候補にできます。',
  steps: ['英字等で始まる識別子とドットを条件にし、java.langのようなパッケージを含む表記を探します。', '末尾がExceptionまたはErrorの形を狙います。最後の単語境界はErrorHandlerのようにさらに語が続く場合を抑えます。', '大文字小文字は区別します。Javaのクラス名の標準的な表記を想定し、イベント全体を返します。'],
  sample: 'java.lang.NullPointerException: example\nCaused by: java.sql.SQLException: example\njava.lang.OutOfMemoryError: example\nException occurred', expected: '最初の3件が残ります。パッケージ名を持たない4件目は対象外です。',
  background: 'Javaは失敗の種類をクラス名で表します。文章が変わっても型名を手掛かりにできます。アプリの層をまたぐと例外が包まれることがあるため、ログレベル行以外も調べる必要があります。',
  caution: 'コード例や説明文の中のクラス名にも一致します。Throwableを直接継承して末尾がException/Errorでない独自クラス、Unicode名などをすべて拾う式ではありません。', next: 'NPEはQ31、メモリーはQ32、クラス読み込みはQ33。', refs: ['S23','S06']
});
add('Q31', 'java', 'NullPointerExceptionを探す', [base, "filter @message like 'java.lang.NullPointerException'", ...recent], {
  ready: '値の変更不要。完全修飾クラス名が本文にある場合。', change: '省略形しか出ないログならNullPointerExceptionだけの検索も検討。',
  purpose: 'null参照を使った処理の失敗を探し、どのコード位置・入力で起きたかを調べます。',
  analogy: '「この箱の中の本を開いて」と頼んだのに、箱そのものが用意されていないような状態です。',
  steps: ['クラス名を普通の文字列として部分一致検索します。ドットが任意文字になる正規表現ではありません。', '文面が詳しい場合は、どの参照がnullだったかの情報を読みます。情報がない場合でもクラス名とスタックの位置を手掛かりにします。', '直前の入力や呼び出し元を見るために、requestIdや同じストリームの前後ログへ進みます。'],
  sample: 'java.lang.NullPointerException: example at CheckoutService\njava.lang.IllegalArgumentException: example', expected: '1件目が残ります。どの値が未設定だったかを、この検索条件だけで確定することはできません。',
  background: 'NullPointerExceptionは公式APIでJava 1.0から存在する例外です。現在のAPI説明には状況により詳細な参照説明が返る場合も記されていますが、固定の英文を検索条件にすると版や状況で漏れやすいため型名を使います。',
  caution: 'メッセージの説明が常に付くとは限りません。またNPEが記録されたことと、その依頼が最終的に失敗したことは別に確認します。', next: '最初のアプリ側スタック位置とQ38の相関IDを確認します。', refs: ['S24','S23']
});
add('Q32', 'java', 'メモリー確保・スタックの異常を探す', [base, 'filter @message like /(OutOfMemoryError|StackOverflowError)/', ...recent], {
  ready: '値の変更不要。二つの異なるErrorを候補検索。', change: '片方だけ調べる場合は正規表現の選択肢を減らします。',
  purpose: 'JVMのメモリー確保や呼び出しの深さに関係するエラーを見つけます。',
  analogy: 'OutOfMemoryErrorは作業机に必要な道具を置けない状態、StackOverflowErrorは「次に頼む」を何段も重ねすぎて順番のメモがあふれる状態にたとえられます。',
  steps: ['二つのクラス名のどちらかを本文に含むイベントを残します。短い名前でも拾えるようパッケージ名を必須にしていません。', 'OutOfMemoryErrorの詳細と、StackOverflowErrorの繰り返す呼び出し位置をそれぞれ確認します。二つを同じ原因と扱いません。', '時刻とインスタンスを特定し、GCログ、メモリー関連の観測値、直前の変更などと照合します。'],
  sample: 'java.lang.OutOfMemoryError: example\njava.lang.StackOverflowError\nINFO memory usage recorded', expected: '最初の2件が残ります。3件目はメモリーの話でもエラー名がないため外れます。',
  background: 'Javaはメモリーを自動管理しますが、必要な領域を必ず確保できるとは限りません。また深すぎる再帰はスタックを使い切ることがあります。両クラスはJava初期からあり、同じErrorでも調べる資源が違います。',
  caution: 'OSやコンテナに強制終了されると、この文字列を残せない場合があります。0件だからメモリー問題がないとは言えません。', next: '前後のログはQ39。原因調査ではJava以外のOS・コンテナ側の記録も照合します。', refs: ['S25','S31']
});
add('Q33', 'java', 'クラスやメソッドの読み込み・互換性の問題', [base, 'filter @message like /(ClassNotFoundException|NoClassDefFoundError|NoSuchMethodError|AbstractMethodError|LinkageError)/', ...recent], {
  ready: '値の変更不要。代表的な型名を候補検索。', change: '特定のクラス名も絞りたい場合は別のfilterを追加。',
  purpose: 'デプロイ後に部品が見つからない、期待したメソッドがないなどの手掛かりを集めます。',
  analogy: '組み立て説明書が必要とする部品が箱にない、または同じ名前でも差し込み口の違う部品が入っていたような状態です。',
  steps: ['列挙した名前をorで探します。Javaの継承関係を解釈する条件ではないため、列挙していない派生型名まで自動的に一致するわけではありません。', 'ClassNotFoundExceptionは文字列名での読み込み失敗、NoClassDefFoundErrorは実行時に必要な定義を利用できない問題の手掛かりとして読み分けます。', '対象クラスやメソッド、ロード元、デプロイ直後かどうかを本文から確認します。'],
  sample: 'java.lang.ClassNotFoundException: com.example.Driver\njava.lang.NoClassDefFoundError: com/example/Helper\njava.lang.NullPointerException', expected: '最初の2件が残ります。',
  background: 'Javaアプリは多くのライブラリを組み合わせて動きます。開発時と実行時の部品や見える範囲が違うと失敗が表れます。EAPのデプロイ失敗の外側のコードと、こうした内側の型名を結び付けると調査先を絞れます。',
  caution: 'NoClassDefFoundErrorを見て、すぐにJARの欠落だけと断定しないでください。直前の初期化失敗などの関連情報も読みます。', next: 'Q24とQ39でデプロイ時の流れを調べます。', refs: ['S26','S32','S18']
});
add('Q34', 'java', '通信・タイムアウトの例外を探す', [base, 'filter @message like /(SocketTimeoutException|ConnectException|UnknownHostException|SSLHandshakeException|TimeoutException)/', ...recent], {
  ready: '値の変更不要。TimeoutExceptionは通信以外も含む候補。', change: '用途を限定したければ対象の例外名だけを残します。',
  purpose: '待ち時間切れ、接続開始、名前解決、TLSの握手など、通信周辺の失敗候補を集めます。',
  analogy: '電話をかけるときの「番号が分からない」「つながらない」「相手を確認できない」「返事が来ない」を分けて考えます。',
  steps: ['列挙した型名のどれかが本文にあれば残します。SocketTimeoutExceptionにはTimeoutExceptionという文字も含まれますが、結果は二重になりません。', '型名とメッセージを組み合わせて、どの段階で待ったのかを読みます。接続先や呼び出し元の情報も必要です。', '処理側の負荷、接続先の状態、設定された期限など、別の記録と突き合わせます。'],
  sample: 'java.net.SocketTimeoutException: example\njava.util.concurrent.TimeoutException: task example\nINFO connected', expected: '最初の2件が残ります。2件目は一般的な処理待ちの例で、通信障害とは限りません。',
  background: 'ネットワークを使う処理では、待ち続けると他の処理の資源も占有します。期限を設けて失敗として返す仕組みが必要になり、その観測点として例外が残ります。',
  caution: 'タイムアウトは遅かったという観測で、どちら側が悪いかを単独では証明しません。証明書検証を無効化するなどの対応をこの結果だけで決めません。', next: 'requestIdでQ38、直前のイベントでQ39を使います。', refs: ['S30','S23']
});

add('Q35', 'java', 'SQL例外とSQLStateの手掛かりを探す', [base, 'filter @message like /(java[.]sql[.][A-Za-z]*Exception|PSQLException|SQLServerException|SQLState|SQLSTATE|SQL Error)/', ...recent], {
  ready: '値の変更不要。JDBC・一部のDBドライバーの代表表記。', change: '利用DBの独自例外名やコード表記を必要に応じて追加。',
  purpose: 'DBアクセスが失敗したとき、外側のEAPコードだけでなくDBに近い情報を探します。',
  analogy: '窓口の「手続き失敗」という通知から、奥の担当部署が付けた「理由番号」を探していくイメージです。',
  steps: ['java.sqlパッケージのException系や代表的なドライバー名、SQLStateという文字を候補にします。[.]は文字としてのドットです。', 'SQLState、ベンダー独自のエラー番号、説明文は別々の情報なので混同せず読みます。', '同じエラーに続く例外連鎖や、DB側の時刻・記録を対応させます。本文中に情報が出力されていなければ、この検索で作り出すことはできません。'],
  sample: 'java.sql.SQLTransientConnectionException: example\norg.postgresql.util.PSQLException: example\nSQLState: 08001\nINFO SQL query completed', expected: '最初の3件が候補です。SQLStateの値の意味は利用ドライバーとDBの資料で確認します。',
  background: 'JDBCは異なるDBへ共通のJava APIでアクセスする仕組みです。SQLExceptionはJava 1.1からあり、共通の状態コードと製品独自の番号を保持できるため、抽象的な失敗から具体的な原因へ降りる手掛かりになります。',
  caution: 'SQLSTATEという語だけでエラー確定とはなりません。SQLWarningやINFOの説明文をどう扱うかは目的に合わせます。全ドライバーを網羅する式ではありません。', next: 'EAPの接続管理はQ25、内側の連鎖はQ36。', refs: ['S27','S19']
});
add('Q36', 'java', '最初のCaused byのクラス名を取り出す', [base, String.raw`parse @message /Caused by:\s+(?<causeClass>[A-Za-z_$][A-Za-z0-9_.$]*)/`, 'filter ispresent(causeClass)', 'display @timestamp, causeClass, @log, @logStream, @message', ...recent], {
  ready: '本文にCaused by:とクラス名があるイベント。', change: '通常は変更不要。異なる出力形式なら抽出規則を調整。',
  purpose: '例外連鎖に書かれた原因クラスを見やすい列へ取り出します。',
  analogy: '「なぜなら」の後に書かれた理由の名前を別の欄へ写します。ただし理由の中にさらに理由が続くなら、最初の一つだけを写した状態です。',
  steps: ['Caused by:の後で空白が1文字以上続く部分を読み、続くクラス名らしい文字をcauseClassへ取り出します。', '通常のparseなので、1イベント中の最初の一致を扱います。複数のCaused byをすべて別行にするクエリではありません。', 'ispresentで抽出できたイベントだけを残し、displayで抽出列と元本文を一緒に見ます。'],
  sample: '1イベントの本文:\njava.lang.RuntimeException: outer\nCaused by: java.sql.SQLException: middle\nCaused by: java.net.ConnectException: inner', expected: 'causeClassはjava.sql.SQLException。最深部のjava.net.ConnectExceptionを返す式ではありません。',
  background: '層の異なる処理が失敗を伝えるとき、説明を加えながら元の例外も保持する必要があります。ThrowableのgetCauseはJava 1.4からあり、Caused byはそのつながりを読む手掛かりです。',
  caution: '最初の原因クラスを「根本原因」と命名しないでください。Suppressedは別の関係です。分割収集なら継続イベントだけが残り、外側の行が一緒に返らない場合もあります。', next: '元本文の連鎖全体とQ39の周辺記録を読みます。', refs: ['S23','S06','S16']
});
add('Q37', 'java', '例外名と具体的なエラーメッセージで絞る', [base, "filter @message like 'java.net.SocketTimeoutException' and @message like 'Read timed out'", ...recent], {
  ready: '二つの文字列が同じイベントに入っていること。', change: '例外名とメッセージを調べたい実際の値へ変更します。',
  purpose: '同じ例外の中でも、既知の具体的な症状に一致するものだけを調べます。',
  analogy: '「忘れ物」という大分類から、さらに「教科書」という説明がある連絡を選びます。',
  steps: ['二つの文字列をandで比較します。普通の文字列検索なので、クラス名のドットを特別扱いしません。', '大文字小文字、語の順序、空白は指定の文字列どおりです。Read timed outとread timed outはこの例では別です。', '二つが別イベントに分かれていると一致しません。Q30やQ34で広く探してから適用すると形式を確認できます。'],
  sample: 'java.net.SocketTimeoutException: Read timed out\njava.net.SocketTimeoutException: Accept timed out\nRead timed out', expected: '1件目だけが残ります。3件目は例外名がないため外れます。',
  background: '共通の例外型が複数の状態を表すことがあります。既知障害の再発確認では具体文面が便利ですが、版・設定・出力言語が変わると文面も変わるため、型名の検索と使い分けます。',
  caution: '「Read timed out」が全JDK・全ライブラリで必ず同じ英文になる保証として使わないでください。実ログで確認した値を指定します。', next: '広く戻したければQ34、同じ依頼の流れはQ38。', refs: ['S02','S30']
});
add('Q38', 'java', 'requestIdで一つの依頼を時系列に追う', [base, 'fields coalesce(requestId, request_id, correlationId, mdc.requestId) as rid', "filter rid = 'req-demo-001'", 'sort @timestamp asc', 'limit 1000'], {
  ready: '列挙したJSON項目のいずれかに相関IDがあること。関連グループを画面で選択。', change: 'req-demo-001を実際のIDへ変更。項目名も確認。',
  purpose: '一つの利用者リクエストについて、開始・処理・エラー・終了の流れを読みます。',
  analogy: '学校の配達物に同じ伝票番号を付け、教室が変わっても同じ荷物として追いかけます。',
  steps: ['候補の項目名から最初の非null値をridへ入れます。mdc.requestIdはJSON内の入れ子の項目を指します。', 'IDを完全一致で比較します。エラーレベルの条件は付けないので、同じ依頼の正常な途中経過も残ります。', '古い時刻から並べます。複数サービスの時計がずれている場合、表示順だけでは厳密な因果順序が分からないことがあります。'],
  sample: '{"requestId":"req-demo-001","message":"start"}\n{"mdc":{"requestId":"req-demo-001"},"message":"failed"}\n{"requestId":"req-demo-002","message":"start"}', expected: '1、2件目が時刻順に残ります。',
  background: '並行処理では同じ時刻に別々の依頼が動き、スレッドも再利用されます。相関IDを記録しておくと、時刻だけでは結び付けられないイベントを同じ依頼として探せます。',
  caution: 'IDがログに出力されていなければ自動生成はできません。文字列本文しかない場合は実際のIDをlikeで探せますが、部分一致の衝突に注意します。', next: 'IDのない継続行も必要ならQ39で同じ出どころの周辺を読みます。', refs: ['S03','S04','S17']
});
add('Q39', 'java', '例外の前後を同じグループ・ストリームで読む', [base, 'parse @log /^[^:]+:(?<groupName>.*)$/', "filter groupName = '/example/eap/prod' and @logStream = 'server-01'", 'filter toMillis(@timestamp) >= 1790812800000 and toMillis(@timestamp) < 1790813100000', 'sort @timestamp asc', 'limit 1000'], {
  ready: '例は2026-10-01 09:00以上09:05未満JST。画面も合わせる。', change: 'グループ名・ストリーム名・開始終了のミリ秒値を実際の対象へ変更。',
  purpose: 'ERROR行だけでなく、直前のINFOや後ろのスタック行も含めて読みます。',
  analogy: '事件の場面だけを切り抜かず、その前後の数ページを同じノートから読むようなものです。',
  steps: ['まず出どころを絞り、別サーバーの同時刻の記録が混ざるのを減らします。複数アカウントの同名グループには別途注意します。', '5分の固定区間に絞ります。エラー語のfilterを置かないので、atで始まる継続行も対象にできます。', 'ascで時系列に並べます。分割された記録を一覧で読むもので、一つの例外オブジェクトへ自動結合する処理ではありません。'],
  sample: '09:01 INFO request start\n09:02 ERROR request failed\n09:02 Caused by: java.sql.SQLException\n09:03 INFO cleanup', expected: '同じグループ・ストリーム・期間にあるなら4件すべてが残ります。',
  background: 'ログをエラー語だけで絞ると、原因や後片付けの情報を落とすことがあります。複数行例外が分割される収集方式では、周辺を読む操作が特に重要です。',
  caution: '同じストリームにも複数の依頼が並行して入ります。時刻が近いだけでは同じ依頼と断定できません。1000件へ到達したら時間窓をさらに狭めます。', next: '繰り返し分割が問題になる場合は、収集設定と相関IDの記録方法を別途見直します。', refs: ['S04','S16','S23']
});
add('Q40', 'analysis', 'エラー候補を5分ごとに数える', [errors, 'stats count(*) as errorEvents by bin(5m) as bucket', 'sort bucket asc'], {
  ready: '値の変更不要。画面で調査期間を選択。', change: '5mを必要な時間幅へ変更します。',
  purpose: 'どの時間帯にエラー候補が増えたかを、個々の本文より先に把握します。',
  analogy: 'カードを時刻ごとの箱へ分け、箱の枚数を棒の高さとして比べます。山ができた時間を詳しく調べます。',
  steps: ['最初にERROR等の語を含むイベントだけを残します。候補の意味はQ02と同じです。', 'stats count(*)でイベント数を数え、bin(5m)の時間バケットごとにまとめます。bucketという列名を付けて時間順にします。', 'コンソールの可視化で時系列のグラフとして読めます。件数のない時間帯は、通常の集計では行自体がないことがあります。'],
  sample: '09:00:00 ERROR A\n09:00:00 ERROR B\n09:05:00 ERROR C\n09:05:00 INFO D', expected: '09:00側が2、09:05側が1。これはイベント数であり、異なる根本原因の数ではありません。',
  background: '一件ずつの記録では増加の形が見えにくいため、時間単位の集計が必要になります。リリースや負荷変化の時刻と重ねると調査仮説を作れますが、同時に起きたことだけで因果関係を断定しません。',
  caution: 'bin(300s)で5分を表さないでください。AWSでは秒単位の上限が60なのでbin(5m)を使います。厳密な切り捨て境界が必要ならdatefloor(@timestamp, 5m)の利用を検討します。', next: '山のある時間を画面で狭め、Q02やQ39で本文へ戻ります。', refs: ['S07','S03']
});
add('Q41', 'analysis', 'ロググループごとのエラー候補件数', [errors, 'stats count(*) as errorEvents by @log', 'sort errorEvents desc', 'limit 50'], {
  ready: '関連する複数ロググループを画面で選択。', change: '上位件数の50は必要に応じて変更。',
  purpose: 'どのグループでエラー候補が多いかを比較し、調査先を決めます。',
  analogy: 'クラスごとの忘れ物カードを数え、どのクラスへ確認に行くかの目安にします。生徒数が違う点も忘れません。',
  steps: ['同じエラー候補条件を各グループのイベントへ適用します。', '@logごとにcount(*)を計算します。アカウントIDを含む識別子を使うため、別アカウントの同名グループを区別できます。', '多い順に並べ、最大50グループを表示します。最後のlimitは元イベントを50件に制限してから数える処理ではありません。'],
  sample: 'グループAにERROR3件とINFO7件\nグループBにERROR1件とINFO1件', expected: 'Aは3、Bは1です。エラー率は計算していません。',
  background: '分散したシステムでは「どこから調べるか」が重要です。出どころごとの件数は入口になりますが、アクセス量の大きいサービスほど絶対件数も増えやすくなります。',
  caution: '件数が多いことだけで最も故障率が高いとは言えません。ログ出力の重複や分割方法も比較に影響します。', next: '上位グループをQ18で絞り、Q40で増加時刻を調べます。', refs: ['S07','S04']
});
add('Q42', 'analysis', '最初のJava例外クラス別に件数を数える', [base, String.raw`parse @message /(?<exceptionClass>([A-Za-z_$][A-Za-z0-9_$]*[.])+[A-Za-z0-9_$]*(Exception|Error))\b/`, 'filter ispresent(exceptionClass)', 'stats count(*) as eventCount by exceptionClass', 'sort eventCount desc', 'limit 50'], {
  ready: '値の変更不要。完全修飾された代表的な例外名がある本文。', change: '省略クラス名等を扱う場合は抽出規則を実ログに合わせる。',
  purpose: '例外の種類ごとの多さを調べ、調査の焦点を決めます。',
  analogy: '相談カードの先頭にある相談の種類ごとに箱へ入れ、どの相談が多いか数えます。',
  steps: ['parseで最初のパッケージ付き例外クラスをexceptionClassへ取り出します。通常のparseは、この式では1イベントにつき一つの値を作ります。', '抽出できたものだけを残し、クラス名ごとにイベント数を数えます。', '外側がRuntimeExceptionなら、内側にSQLExceptionがあっても、そのイベントはRuntimeException側として数える可能性があります。'],
  sample: 'java.lang.NullPointerException: A\njava.lang.NullPointerException: B\njava.lang.RuntimeException: C; Caused by: java.sql.SQLException: D', expected: 'NullPointerExceptionが2、RuntimeExceptionが1。SQLExceptionを別途1件とは数えません。',
  background: '自由なメッセージはID等が毎回違いますが、例外型はまとめる軸として使えます。ただし例外連鎖のどの位置を集計したかで意味が変わるため、この例は「最初」と明示します。',
  caution: '根本原因のランキングではありません。元のログが分割されていると、同じ失敗が複数イベントとして数えられます。', next: '上位の例外名をQ31等の条件へ入れ、本文とCaused byを読みます。', refs: ['S06','S07','S23']
});
add('Q43', 'analysis', '本文が完全に同じエラー候補を1件にまとめる', [base, errors, 'sort @timestamp desc', 'dedup @message', 'limit 200'], {
  ready: '値の変更不要。本文全体を重複判定のキーにする。', change: '別の重複単位にしたい場合は、確かなキー項目を選びます。',
  purpose: '同じ文面が繰り返されて一覧を埋めるとき、種類を読みやすくします。',
  analogy: 'まったく同じ内容のプリントは一枚ずつ残し、違う内容のプリントを見つけやすくします。',
  steps: ['先に新しい順に並べます。dedupはその順序で最初の代表を残すので、各本文の新しいものが残ります。', '重複キーは@message全体です。本文中の日時、ID、空白が異なれば別の値になります。', 'dedupの後に使えるクエリコマンドはlimitのみという制約があるため、sortは前へ置きます。'],
  sample: '09:00 ERROR fixed failure\n09:01 ERROR fixed failure\n09:02 ERROR fixed failure request=2', expected: '09:01の代表と09:02の別本文が残ります。09:00は重複として結果から省かれます。',
  background: '同一メッセージの連続は頻度の確認には有用でも、種類の調査を妨げることがあります。重複を省く用途と、頻度を数える用途を分けるための操作です。',
  caution: '発生回数はこの結果だけでは分かりません。また別グループの同じ本文もまとめられます。出どころを区別したければdedup @log, @messageのようにキーを増やします。', next: '回数も必要ならstats count(*) by @messageという集計へ切り替えます。', refs: ['S09','S07']
});

add('Q44', 'analysis', '直近15分・対象グループ・エラー・除外を組み合わせる', [base, 'parse @log /^[^:]+:(?<groupName>.*)$/', "filter groupName = '/example/eap/prod'", 'filter toMillis(@timestamp) >= (now() * 1000 - 15 * 60 * 1000) and toMillis(@timestamp) <= now() * 1000', errors, "filter @message not like 'healthcheck' and @message not like 'heartbeat'", ...recent], {
  ready: '画面で目的のグループと直近15分以上の期間を選択。', change: 'グループ名と除外語を実際の値へ変更します。',
  purpose: '基本部品を合わせ、日常の障害確認で使う一つのクエリにします。',
  analogy: '棚を決め、時間を決め、赤い札だけ残し、定期点検の札を外すという四つのふるいを順番に通します。',
  steps: ['@logから名前を取り出し、一つのグループへ絞ります。画面側の対象選択も必要です。', '実行開始から15分の条件を加え、その中からERROR等の語を探します。別々のfilterは両方満たす必要があります。', 'healthcheckとheartbeatのどちらも含まないものを残し、最新200件を表示します。条件を順に外せば、0件の理由を切り分けられます。'],
  sample: '対象グループ・5分前・ERROR payment failed\n対象グループ・5分前・ERROR healthcheck failed\n別グループ・5分前・ERROR payment failed\n対象グループ・30分前・ERROR payment failed', expected: '1件目だけが残ります。2件目も本当の失敗かもしれませんが、設定した除外規則により外れます。',
  background: '実際の調査では一つの条件だけでは対象が広すぎるため、小さな条件を組み合わせます。役割ごとにfilterを分けると、読み返したり一つずつ解除したりしやすくなります。',
  caution: 'テンプレートの除外語を現場の判断なしで固定しないでください。複雑な条件を一度に足すより、Q01から段階的に確かめます。', next: '結果が少なすぎる場合は除外、エラー、時間、グループの順に条件を点検します。', refs: ['S02','S03','S04']
});
add('Q45', 'analysis', '新機能：一致サンプルを20件見つけて早期終了', [base, errors, 'limit any 20'], {
  ready: '現行公式仕様のlimit anyを使用。最新順は不要な用途。', change: '20を必要なサンプル数へ変更します。',
  purpose: 'エラー形式の見本を少し確認するため、必要な件数が見つかれば残りのスキャンを止めます。',
  analogy: '箱の中に赤いカードがあるか知りたくて20枚集まったら探すのをやめます。いちばん新しい20枚を選び出したわけではありません。',
  steps: ['ERROR等の条件を満たすイベントを探し、20件に達したら早期終了します。', '通常のlimitと区別するためanyが入ります。sortを付けず、どの時刻のサンプルになるかを保証しません。', '一致が20件未満なら、十分な件数を得られないため検索範囲全体を読む場合があります。'],
  sample: '期間内にエラー候補が100件あると仮定。', expected: '最大20件の見本が返ります。時刻順や代表性、全体件数はこの結果では保証されません。',
  background: '以前からの表示件数制限と、処理を途中で終える目的は別です。現在の公式limit資料はlimit anyを説明しており、少数のサンプルだけ必要な探索を軽くする用途に使えます。導入日は本資料では特定していません。',
  caution: '最新のエラーや期間内の全件集計を知る用途には向きません。未対応の環境ではQ02の通常limitを使いますが、早期終了の効果は同じではありません。', next: '最新順はQ02、件数の山はQ40、事前見積もりはQ46。', refs: ['S08']
});
add('Q46', 'analysis', '新機能：実検索前にスキャン量を見積もる', [base, errors, 'estimate'], {
  ready: '現行公式仕様のestimateを使用。結果はログ本文ではなく概算量。', change: '画面のグループと時間範囲を変えて見積もりを比較します。',
  purpose: '大きな範囲を本検索する前に、読み取り対象の概算バイト数を確認します。',
  analogy: '大きな本を全部読む前に、読む予定のページ量を見積もります。見積もりの紙に、本の中身そのものは載りません。',
  steps: ['調べたいクエリの最後にestimateを置きます。この例はエラー候補検索の見積もりです。', 'クエリを実際に実行してログ結果を返す代わりに、推定スキャン量を返します。estimateの後ろへsortやlimitを追加しません。', '量が大きければ対象グループや時間を見直します。本検索する場合はestimateを外し、Q02等のsort・limitを付けて実行します。'],
  sample: '同じグループを対象に1時間と24時間の二つの期間を選び、別々に見積もる例。', expected: '概算バイト数を比較できます。常に期間比どおりの値になるとは限りません。実測した数値は本資料に載せていません。',
  background: 'AWSの履歴では2026-07-22にestimate追加が記録されています。探索対象を広げる前に量を把握し、必要な期間と範囲を考えるための機能です。',
  caution: '値は概算であり実際のスキャン量と異なる場合があります。estimate自体にはLogs Insightsのクエリ料金が発生しないという公式説明ですが、その後の本検索は別です。', next: '検索を行う段階ではestimateを外します。結果0件の診断用として代用しません。', refs: ['S10','S13']
});
add('Q47', 'analysis', '新機能：logfmtのlevelで絞る', [base, 'parse @message logfmt as lf', "filter toupper(lf.level) in ['ERROR', 'FATAL']", 'display @timestamp, lf.level, lf.msg, @log, @logStream, @message', ...recent], {
  ready: 'level=error msg=...のようなlogfmt形式向け。普通のEAP文章ログには不適合。', change: 'level・msgのキー名や対象レベルを実際の形式へ変更。',
  purpose: 'JSONではなくkey=valueの形で記録されたログを、項目単位で調べます。',
  analogy: '「教室=1組 係=図書」という短い札を、項目名と値に分けて読む方法です。',
  steps: ['parse @message logfmt as lfでlogfmtを読み、lfというマップに入れます。lf.levelはその中のlevelです。', 'levelを大文字化してERRORまたはFATALに一致するものを残します。本文中にerrorと書いてあるだけのINFOは対象外です。', '元本文も残すので、解析結果が思った項目になっているか照合できます。'],
  sample: 'level=error msg="database timeout"\nlevel=info msg="no error"\n2026-10-01 ERROR plain-text-example', expected: '1件目が意図した対象です。3件目のような普通の文章から、この式がlevelを推測して作るわけではありません。',
  background: 'JSON以外にも、人にも読みやすいkey=valueのログ形式があります。2026年のAWS発表でparse logfmtの追加が説明され、独自の正規表現で毎回項目を分ける負担を減らせるようになりました。',
  caution: 'パーサーに渡す本文の形式をまずQ01で確認します。未対応環境では形式に合うparseを別途書くか、Q02の本文検索を使います。', next: '項目の解析が確認できたらstatsでlf.level等を集計できます。', refs: ['S06','S15']
});
add('Q48', 'analysis', '新機能：ロググループ名の前方一致', [base, 'parse @log /^[^:]+:(?<groupName>.*)$/', "filter startsWith(groupName, '/example/eap/') = 1", ...recent], {
  ready: '現行公式関数表のstartsWithを使用。対象グループは画面で選ぶ。', change: '/example/eap/を目的の名前の接頭部分へ変更。',
  purpose: '「名前のどこかに含む」ではなく「名前がその文字列で始まる」と明示します。',
  analogy: '住所の途中に「東京」という語があるかではなく、住所の先頭が「東京都」かを調べます。',
  steps: ['@logからアカウント部分を除き、グループ名だけを取り出します。', 'startsWithは指定文字列で始まると1、それ以外は0を返すため、= 1と比較します。大文字小文字は区別されます。', '末尾の/も文字列の一部なので、/example/eap-oldのような別名は一致しません。'],
  sample: '/example/eap/prod\n/example/eap/test\n/archive/example/eap/prod\n/example/eap-old', expected: '最初の2つの名前だけが一致します。',
  background: '前方一致は命名規則を使う探索で繰り返し必要になります。2026年の関数追加の発表にもこの用途が挙げられており、正規表現より意図を直接読める表現として使えます。',
  caution: 'クエリが未選択グループを探しに行くことはありません。未対応環境ではQ19の識別子の部分一致、または抽出した名前への先頭固定の正規表現を使います。', next: '本番だけ等へ絞るならQ18・Q20と目的を比較します。', refs: ['S03','S15','S05']
});
