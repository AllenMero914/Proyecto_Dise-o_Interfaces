package com.binasystem.profact.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class VentaResponseDTO {
    private Long id;
    private LocalDateTime fecha;
    private BigDecimal subtotal;
    private BigDecimal iva;
    private BigDecimal total;
    private String vendedor;
    private Long clienteId;
    private String clienteNombre;
    private String clienteIdentificacion;
    private List<DetalleVentaResponseDTO> detalles;

    @Data
    @AllArgsConstructor
    public static class DetalleVentaResponseDTO {
        private Long productoId;
        private String productoNombre;
        private int cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}
