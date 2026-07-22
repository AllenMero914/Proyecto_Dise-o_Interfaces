package com.binasystem.profact.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class DashboardMetricasDTO {
    private BigDecimal ventasHoy;
    private BigDecimal ventasMes;
    private long comprasMes;
    private long productosStockBajo;
    private int actividadRecienteCount;
}
