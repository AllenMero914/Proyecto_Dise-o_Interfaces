package com.binasystem.profact.service;

import com.binasystem.profact.dto.DashboardMetricasDTO;
import com.binasystem.profact.repository.CompraRepository;
import com.binasystem.profact.repository.ProductoRepository;
import com.binasystem.profact.repository.VentaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class DashboardService {

    private final VentaRepository ventaRepository;
    private final CompraRepository compraRepository;
    private final ProductoRepository productoRepository;

    public DashboardService(VentaRepository ventaRepository,
                            CompraRepository compraRepository,
                            ProductoRepository productoRepository) {
        this.ventaRepository = ventaRepository;
        this.compraRepository = compraRepository;
        this.productoRepository = productoRepository;
    }

    public DashboardMetricasDTO obtenerMetricas() {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime finDia = inicioDia.plusDays(1);
        LocalDateTime inicioMes = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        // CA-007.1
        BigDecimal ventasHoy = ventaRepository.sumTotalByFechaBetween(inicioDia, finDia);
        BigDecimal ventasMes = ventaRepository.sumTotalByFechaBetween(inicioMes, finDia);

        // CA-007.2
        long comprasMes = compraRepository.countByFechaBetween(inicioMes, finDia);

        // CA-007.3
        long productosStockBajo = productoRepository.findByStockLessThanEqualStockMinimo().size();

        // CA-007.4
        var actividadReciente = ventaRepository.findTop5ByOrderByFechaDesc();

        return new DashboardMetricasDTO(
            ventasHoy,
            ventasMes,
            comprasMes,
            productosStockBajo,
            actividadReciente.size()
        );
    }
}
