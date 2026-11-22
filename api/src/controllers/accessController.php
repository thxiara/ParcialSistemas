<?php

namespace app\controllers;

use app\utils\response;

class accessController {
	private $db;
	private const pageDir = __DIR__ . '/../../../front/dist/pages/';

	public function __construct($db) {
		$this->db = $db;
	}

	public function landing(): void { $this->sendHtml('index.html'); }
	public function listCat(): void { $this->sendHtml('listCat.html'); }
	public function addCat(): void { $this->sendHtml('addCat.html'); }
	public function editCat(): void { $this->sendHtml('editCat.html'); }

	public function sendHtml(string $archivo): void {
		http_response_code(200);
		header('Content-Type: text/html; charset=UTF-8');
		echo file_get_contents(self::pageDir . $archivo);
		exit();
	}

	private function getRequestData(): array {
		$contentType = $_SERVER['CONTENT_TYPE'] ?? '';

		if (str_contains($contentType, 'application/json')) {
			$raw = file_get_contents('php://input');
			$decoded = json_decode($raw, true);

			return is_array($decoded) ? $decoded : [];
		}

		return $_POST;
	}
}
