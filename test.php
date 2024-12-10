<?php

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

// データベース接続情報
$host = "sotuken.cqke3dopx7qu.us-east-1.rds.amazonaws.com";
$port = "5432"; // PostgreSQLのデフォルトポート
$dbname = "sotukenDB"; // データベース名
$user = "ikeda"; // ユーザー名
$password = "shirokuma123"; // パスワード

// 接続文字列を作成
$conn_string = "host=$host port=$port dbname=$dbname user=$user password=$password";

// PostgreSQLに接続
$conn = pg_connect($conn_string);

// 接続エラーの確認
if (!$conn) {
    echo json_encode(["error" => "データベース接続に失敗しました", "message" => pg_last_error()]);
    exit;
}

// ランダムに1行のデータを取得するSQL
$sql = "SELECT content, details_contents FROM sotuken ORDER BY RANDOM() LIMIT 1";

// クエリを実行
$result = pg_query($conn, $sql);

// クエリ結果の確認
if (!$result) {
    echo json_encode(["error" => "クエリ実行に失敗しました", "message" => pg_last_error()]);
    exit;
}

// データが存在する場合
if (pg_num_rows($result) > 0) {
    $row = pg_fetch_assoc($result);
    $content = htmlspecialchars($row['content'], ENT_QUOTES, 'UTF-8');
    $details_contents = htmlspecialchars($row['details_contents'], ENT_QUOTES, 'UTF-8');

    // JSON形式で結果を返す
    echo json_encode([
        'content' => $content,
        'details_contents' => $details_contents
    ]);
} else {
    echo json_encode([
        'content' => '該当するコンテンツはありません',
        'details_contents' => '該当する詳細情報がありません'
    ]);
}

// 接続を閉じる
pg_close($conn);
?>
