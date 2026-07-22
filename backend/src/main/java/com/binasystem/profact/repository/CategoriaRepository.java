package com.binasystem.profact.repository;

import com.binasystem.profact.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    Optional<Categoria> findByNombreIgnoreCase(String nombre);
    // CA-003.4: Solo categorías activas para dropdowns
    List<Categoria> findByActivoTrue();
}
