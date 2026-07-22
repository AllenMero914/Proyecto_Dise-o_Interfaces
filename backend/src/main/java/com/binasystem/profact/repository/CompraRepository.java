package com.binasystem.profact.repository;

import com.binasystem.profact.entity.Compra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {
    List<Compra> findByProveedorId(Long proveedorId);
    List<Compra> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin);
    List<Compra> findTop5ByOrderByFechaDesc();
    long countByFechaBetween(LocalDateTime inicio, LocalDateTime fin);

    @Query("SELECT COALESCE(SUM(c.total), 0) FROM Compra c WHERE c.fecha >= :inicio AND c.fecha < :fin")
    BigDecimal sumTotalByFechaBetween(@Param("inicio") LocalDateTime inicio,
                                      @Param("fin") LocalDateTime fin);

    // HU-008: Compras agrupadas por mes
    @Query("SELECT MONTH(c.fecha), SUM(c.total) FROM Compra c WHERE YEAR(c.fecha) = :anio GROUP BY MONTH(c.fecha)")
    List<Object[]> comprasMensualesPorAnio(@Param("anio") int anio);
}
