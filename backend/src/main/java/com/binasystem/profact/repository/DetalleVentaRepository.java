package com.binasystem.profact.repository;

import com.binasystem.profact.entity.DetalleVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Long> {

    // CA-008.3: Top 5 productos más vendidos
    @Query("SELECT dv.producto.id, dv.producto.nombre, SUM(dv.cantidad), SUM(dv.subtotal) " +
           "FROM DetalleVenta dv GROUP BY dv.producto.id, dv.producto.nombre " +
           "ORDER BY SUM(dv.cantidad) DESC")
    List<Object[]> findTopProductosVendidos();
}
