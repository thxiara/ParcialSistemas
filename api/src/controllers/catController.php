<?php

namespace app\controllers;

use app\models\catModel;
use app\utils\response;

class catController {
	private catModel $cats;

	public function __construct($db) {
		$this->cats = new catModel($db);
	}

	# GET /api/cat
	public function getAll(): void {
		$cats = $this->cats->getAll();
		Response::json(true, 'Gatos obtenidos.', ['cats' => $cats, 'total' => count($cats)]);
	}

	# GET /api/cat/:id
	public function get(string $id): void {
		$cat = $this->cats->get((int) $id);
		if (!$cat) {
			Response::json(false, 'No se encontró el gato.', [], 404);
		}
		Response::json(true, 'Gato obtenido.', ['cat' => $cat]);
	}

	# POST /api/cat
	public function add(): void {
		$id = $this->cats->add($this->validate());
		Response::json(true, 'Gato creado.', ['cat' => $this->cats->get($id)], 201);
	}

	# PUT /api/cat/:id
	public function update(string $id): void {
		$catId = (int) $id;
		if (!$this->cats->get($catId)) {
			Response::json(false, 'No se encontró el gato que intentas editar.', [], 404);
		}
		$this->cats->update($catId, $this->validate());
		Response::json(true, 'Gato actualizado.', ['cat' => $this->cats->get($catId)]);
	}

	# DELETE /api/cat/:id
	public function remove(string $id): void {
		try {
			$borrado = $this->cats->remove((int) $id);
		}
		catch (\PDOException $e) {
			error_log($e->getMessage());
			Response::json(false, 'No se pudo eliminar el gato.', [], 500);
		}

		if (!$borrado) {
			Response::json(false, 'No se encontró el gato que intentas eliminar.', [], 404);
		}

		Response::json(true, 'Gato eliminado correctamente.');
	}

	private function validate(): array {
		$data = json_decode(file_get_contents('php://input'), true);
		$data = is_array($data) ? $data : [];

		$nombre = trim((string) ($data['name'] ?? ''));
		$raza = trim((string) ($data['breed'] ?? ''));
		$edad = $data['age'] ?? null;

		if ($nombre === '' || mb_strlen($nombre) > 40) {
			Response::json(false, 'El nombre tiene que tener entre 1 y 40 caracteres.', [], 400);
		}
		if ($raza === '' || mb_strlen($raza) > 40) {
			Response::json(false, 'La raza tiene que tener entre 1 y 40 caracteres.', [], 400);
		}
		if (!is_numeric($edad) || $edad < 0 || $edad > 40) {
			Response::json(false, 'La edad debe ser un número entre 0 y 40', [], 400);
		}

		return [
			'name' => $nombre,
			'breed' => $raza,
			'age' => $edad,
		];
	}
}
