package com.binasystem.profact.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "clientes")
@Getter
@Setter
public class Cliente {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String identificacion;

    @Column(nullable = false)
    private String nombre;

    private String telefono;
    
    private String direccion;
    
    private String email;

    @Column(nullable = false)
    private boolean activo = true;
}
