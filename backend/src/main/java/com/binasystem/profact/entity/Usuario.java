package com.binasystem.profact.entity;

import com.binasystem.profact.enums.Rol;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    // Usamos email como identificador principal de login
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String contrasenaHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol;

    @Column(nullable = false)
    private boolean activo = true;

    // RNF-003: Contador de intentos fallidos para bloqueo
    @Column(nullable = false)
    private int intentosFallidos = 0;

    // RNF-003: Timestamp de bloqueo (null = no bloqueado)
    private LocalDateTime bloqueadoHasta;

    @Column(updatable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();
}
