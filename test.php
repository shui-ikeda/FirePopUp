<?php

header('Content-Type: application/json');
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
    die("接続失敗: " . pg_last_error());
}

// SELECT文で必要なカラムを指定
$sql = "SELECT content, detail_contents FROM sotuken"; // your_table_name を実際のテーブル名に置き換え

// クエリを実行
$result = pg_query($conn, $sql);

// クエリ結果の確認
if (!$result) {
    die("クエリ実行失敗: " . pg_last_error());
}

// データが存在する場合
if (pg_num_rows($result) > 0) {
    // データをHTMLテーブル形式で表示
    echo "<table border='1'>";
    echo "<tr><th>Content</th><th>Detail Contents</th></tr>";

    while ($row = pg_fetch_assoc($result)) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($row["content"]) . "</td>";
        echo "<td>" . htmlspecialchars($row["detail_contents"]) . "</td>";
        echo "</tr>";
    }

    echo "</table>";
} else {
    echo "データがありません。";
}

error_reporting(E_ALL);
ini_set('display_errors', 1);


// 接続を閉じる
pg_close($conn);
?>
