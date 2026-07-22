package com.binasystem.profact.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "productos", indexes = {
    // RNF-013: Índices explícitos para consultas frecuentes
    @Index(name = "idx_producto_categoria", columnList = "categoria_id"),
    @Index(name = "idx_producto_activo", columnList = "activo")
})
@Data
@NoArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(precision = 10, scale = 2)
    private BigDecimal precioCompra;

    @Column(nullable = false)
    private int stock = 0;

    // CA-004.2: Stock mínimo para alertas
    @Column(nullable = false)
    private int stockMinimo = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @Column(nullable = false)
    private boolean activo = true;
}
