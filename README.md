# CloudWatch Logs Insights チートシート

日本語の詳細解説と、AWSコンソールのLogs Insights QLへ貼り付ける48個のクエリを収録します。

成果物は `outputs/cloudwatch_insights_20261016/` のExcelとMarkdownです。ExcelはMeiryo UI、モノトーン、コピー専用の1行クエリ、解説へのリンクを備えます。仕様確認日は2026年10月16日です。

クエリの利用時はアカウント・リージョン・ロググループ・時間範囲を画面で選んでください。環境固有の名前を使う例は、各説明に従って値を変更します。

## 構成

- `tools/content.mjs`: 使い方、仕組み、歴史、用語、一次資料。
- `tools/queries.mjs`: クエリと個別の解説。
- `tools/build_cheatsheet.mjs`: 同一内容からExcelとMarkdownを生成。
- `tools/finalize_workbook.py`: Excelの印刷設定・内部リンク等のOpen XML調整。
- `tools/verify_cheatsheet.py`: 成果物の整合性と重要な検索例のローカル検証。

## 再生成

Windows PowerShellで、`@oai/artifact-tool`が利用できるNode.js環境を使用します。この環境では`tools/node_modules`を提供ランタイムの依存フォルダーへ接続しています。依存フォルダーの内容は変更しません。

```powershell
node .\tools\build_cheatsheet.mjs
python .\tools\finalize_workbook.py
python .\tools\verify_cheatsheet.py
```

ローカル検証はAWS側の構文受理や実ログでの動作を代替しません。AWSへの実行・ログ送信・環境設定変更は、この成果物の作成では行っていません。
