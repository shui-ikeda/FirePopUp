<?php
// エラーデバッグの有効化
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// JSONレスポンスを明示的に指定
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

// データベース接続情報
$host = "sotuken.cqke3dopx7qu.us-east-1.rds.amazonaws.com";
$port = "5432";
$dbname = "sotukenDB";
$user = "ikeda";
$password = "shirokuma123";

// 接続文字列を作成
$conn_string = "host=$host port=$port dbname=$dbname user=$user password=$password";

// PostgreSQLに接続
$conn = pg_connect($conn_string);

// 接続エラーの確認
if (!$conn) {
    echo json_encode(["success" => false, "error" => "データベース接続に失敗しました", "message" => pg_last_error()]);
    exit;
}

// POSTデータを取得
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['content_id'])) {
    $content_id = intval($_POST['content_id']); // 安全のため整数に変換

    // likesカウントをインクリメントするSQL
    $sql = "UPDATE sotuken SET likes = likes + 1 WHERE id = $1";
    $result = pg_query_params($conn, $sql, [$content_id]);

    if ($result) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => pg_last_error()]);
    }
    pg_close($conn);
    exit;
} else {
    echo json_encode(["success" => false, "error" => "無効なリクエストです"]);
}
?>
