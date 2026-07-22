package com.binasystem.profact.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClienteRequestDTO {
    @NotBlank(message = "La identificacion es obligatoria")
    private String identificacion;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private String telefono;
    private String direccion;
    private String email;
}
