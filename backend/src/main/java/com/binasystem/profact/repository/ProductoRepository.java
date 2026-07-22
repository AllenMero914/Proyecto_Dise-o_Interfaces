package com.binasystem.profact.repository;

import com.binasystem.profact.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByActivoTrue();

    // CA-004.5: Productos con stock menor o igual al mínimo
    @Query("SELECT p FROM Producto p WHERE p.activo = true AND p.stock <= p.stockMinimo")
    List<Producto> findByStockLessThanEqualStockMinimo();

    // RNF-013: Consulta indexada por categoría
    List<Producto> findByCategoriaIdAndActivoTrue(Long categoriaId);
}
