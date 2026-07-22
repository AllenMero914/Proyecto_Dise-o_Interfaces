package com.binasystem.profact.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class ProductoResponseDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private BigDecimal precioCompra;
    private int stock;
    private int stockMinimo;
    private boolean stockBajo;        // true si stock <= stockMinimo
    private String categoriaNombre;
    private Long categoriaId;
    private boolean activo;
}
