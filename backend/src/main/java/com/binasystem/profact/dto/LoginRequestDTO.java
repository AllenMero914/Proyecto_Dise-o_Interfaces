package com.binasystem.profact.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequestDTO {
    @NotBlank(message = "El email es obligatorio")
    private String email;
    @NotBlank(message = "La contraseña es obligatoria")
    private String contrasena;
}
