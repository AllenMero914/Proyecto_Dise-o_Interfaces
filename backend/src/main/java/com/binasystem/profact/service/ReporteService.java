package com.binasystem.profact.service;

import com.binasystem.profact.repository.CompraRepository;
import com.binasystem.profact.repository.DetalleVentaRepository;
import com.binasystem.profact.repository.VentaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ReporteService {

    private final VentaRepository ventaRepository;
    private final CompraRepository compraRepository;
    private final DetalleVentaRepository detalleVentaRepository;

    public ReporteService(VentaRepository ventaRepository,
                          CompraRepository compraRepository,
                          DetalleVentaRepository detalleVentaRepository) {
        this.ventaRepository = ventaRepository;
        this.compraRepository = compraRepository;
        this.detalleVentaRepository = detalleVentaRepository;
    }

    public List<Map<String, Object>> ventasMensuales(int anio) {
        List<Object[]> resultados = ventaRepository.ventasMensualesPorAnio(anio);
        List<Map<String, Object>> lista = new ArrayList<>();
        for (Object[] row : resultados) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("mes", row[0]);
            item.put("total", row[1]);
            lista.add(item);
        }
        return lista;
    }

    public List<Map<String, Object>> comprasMensuales(int anio) {
        List<Object[]> resultados = compraRepository.comprasMensualesPorAnio(anio);
        List<Map<String, Object>> lista = new ArrayList<>();
        for (Object[] row : resultados) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("mes", row[0]);
            item.put("total", row[1]);
            lista.add(item);
        }
        return lista;
    }

    public List<Map<String, Object>> productosMasVendidos() {
        List<Object[]> resultados = detalleVentaRepository.findTopProductosVendidos();
        List<Map<String, Object>> lista = new ArrayList<>();
        for (Object[] row : resultados) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("productoId", row[0]);
            item.put("productoNombre", row[1]);
            item.put("cantidadVendida", row[2]);
            item.put("totalIngresos", row[3]);
            lista.add(item);
        }
        return lista;
    }

    public Map<String, Object> resumenFinanciero(String inicio, String fin) {
        LocalDateTime inicioDt = LocalDate.parse(inicio).atStartOfDay();
        LocalDateTime finDt = LocalDate.parse(fin).plusDays(1).atStartOfDay();

        BigDecimal ventas = ventaRepository.sumTotalByFechaBetween(inicioDt, finDt);
        BigDecimal compras = compraRepository.sumTotalByFechaBetween(inicioDt, finDt);

        Map<String, Object> resumen = new LinkedHashMap<>();
        resumen.put("inicio", inicio);
        resumen.put("fin", fin);
        resumen.put("totalVentas", ventas);
        resumen.put("totalCompras", compras);
        resumen.put("balance", ventas.subtract(compras));
        return resumen;
    }
}
