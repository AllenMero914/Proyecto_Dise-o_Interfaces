package com.binasystem.profact.repository;

import com.binasystem.profact.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

    // HU-007: Ventas del día actual
    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v WHERE v.fecha >= :inicio AND v.fecha < :fin")
    BigDecimal sumTotalByFechaBetween(@Param("inicio") LocalDateTime inicio,
                                      @Param("fin") LocalDateTime fin);

    // HU-008: Ventas agrupadas por mes
    @Query("SELECT MONTH(v.fecha), SUM(v.total) FROM Venta v WHERE YEAR(v.fecha) = :anio GROUP BY MONTH(v.fecha)")
    List<Object[]> ventasMensualesPorAnio(@Param("anio") int anio);

    // HU-007: Últimas ventas para actividad reciente
    List<Venta> findTop5ByOrderByFechaDesc();

    long countByFechaBetween(LocalDateTime inicio, LocalDateTime fin);
}
