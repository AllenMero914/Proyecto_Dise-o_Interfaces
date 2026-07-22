package com.binasystem.profact.dto;

import com.binasystem.profact.enums.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioRequestDTO {
    @NotBlank
    private String nombre;
    @Email @NotBlank
    private String email;
    @NotBlank
    private String contrasena;
    @NotNull
    private Rol rol;
}
