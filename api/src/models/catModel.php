<?php
namespace app\models;

class catModel {
    private $db;

    private const COLUMNS = "id_cat AS id, name, breed, age";

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAll(): array {
        $filas = $this->db->query("SELECT " . self::COLUMNS . " FROM Cat ORDER BY id_cat DESC")
                          ->fetchAll(\PDO::FETCH_ASSOC);
        return array_map([$this, 'format'], $filas);
    }

    public function get(int $id): ?array {
        $stmt = $this->db->prepare("SELECT " . self::COLUMNS . " FROM Cat WHERE id_cat = :id");
        $stmt->execute(['id' => $id]);
        $fila = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $fila ? $this->format($fila) : null;
    }

    public function add(array $p): int {
        $stmt = $this->db->prepare(
            "INSERT INTO Cat (name, breed, age)
             VALUES (:name, :breed, :age)"
        );
        $stmt->execute($p);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $p): bool {
        $stmt = $this->db->prepare(
            "UPDATE Cat SET name = :name, breed = :breed, age = :age
              WHERE id_cat = :id"
        );
        return $stmt->execute($p + ['id' => $id]);
    }

    public function remove(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM Cat WHERE id_cat = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;
    }

    private function format(array $fila): array {
        $fila['id'] = (int) $fila['id'];
        $fila['age'] = (int) $fila['age'];
        return $fila;
    }
}
