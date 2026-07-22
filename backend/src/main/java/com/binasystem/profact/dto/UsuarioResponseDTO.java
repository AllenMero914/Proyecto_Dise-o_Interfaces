package com.binasystem.profact.dto;

import com.binasystem.profact.enums.Rol;
import lombok.Data;

// RNF-001: Sin campo de contraseña en la respuesta
@Data
public class UsuarioResponseDTO {
    private Long id;
    private String nombre;
    private String email;
    private Rol rol;
    private boolean activo;
    // NUNCA incluir contrasenaHash
    private String contrasenaHash; // siempre null — campo para tests

    public UsuarioResponseDTO(Long id, String nombre, String email, Rol rol, boolean activo) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.rol = rol;
        this.activo = activo;
        this.contrasenaHash = null; // Garantizar que nunca se expone
    }
}
