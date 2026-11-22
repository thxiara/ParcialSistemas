<?php

namespace app\utils;

class response {
    public static function json(bool $success, string $message, array $extra = [], int $statusCode = 200, array $valores = []): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');

	foreach ($valores as $key => $value) {
            $message = str_replace('{' . $key . '}', (string) $value, $message);
        }

        echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));

        exit();
    }
}
