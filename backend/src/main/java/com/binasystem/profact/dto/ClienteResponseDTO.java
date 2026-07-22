package com.binasystem.profact.dto;

import lombok.Data;

@Data
public class ClienteResponseDTO {
    private Long id;
    private String identificacion;
    private String nombre;
    private String telefono;
    private String direccion;
    private String email;
    private boolean activo;
}
