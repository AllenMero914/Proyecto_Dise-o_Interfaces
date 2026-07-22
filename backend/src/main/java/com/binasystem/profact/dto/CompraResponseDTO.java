package com.binasystem.profact.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class CompraResponseDTO {
    private Long id;
    private LocalDateTime fecha;
    private BigDecimal subtotal;
    private BigDecimal iva;
    private BigDecimal total;
    private String proveedorNombre;
    private Long proveedorId;
    private List<DetalleCompraResponseDTO> detalles;

    @Data
    @AllArgsConstructor
    public static class DetalleCompraResponseDTO {
        private Long productoId;
        private String productoNombre;
        private int cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}
