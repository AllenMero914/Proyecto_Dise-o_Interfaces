package com.binasystem.profact.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductoRequestDTO {
    @NotBlank
    private String nombre;
    private String descripcion;
    @NotNull @DecimalMin("0.01")
    private BigDecimal precio;
    private BigDecimal precioCompra;
    @Min(0)
    private int stock;
    @Min(0)
    private int stockMinimo;
    @NotNull
    private Long categoriaId;
}
