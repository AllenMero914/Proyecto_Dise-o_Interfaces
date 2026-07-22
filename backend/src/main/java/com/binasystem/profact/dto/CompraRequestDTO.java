package com.binasystem.profact.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CompraRequestDTO {
    @NotNull
    private Long proveedorId;
    @NotEmpty(message = "La compra debe tener al menos un producto")
    @Valid
    private List<DetalleCompraDTO> detalles;

    private boolean aplicarIva = false;

    @Data
    public static class DetalleCompraDTO {
        @NotNull private Long productoId;
        @Min(1) private int cantidad;
        @NotNull private BigDecimal precioUnitario; // Este actúa como precio de compra
        private BigDecimal precioVenta; // El precio de venta a actualizar
    }
}
