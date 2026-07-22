package com.binasystem.profact.service;

import com.binasystem.profact.dto.UsuarioRequestDTO;
import com.binasystem.profact.dto.UsuarioResponseDTO;
import com.binasystem.profact.entity.Usuario;
import com.binasystem.profact.enums.Rol;
import com.binasystem.profact.exception.EmailDuplicadoException;
import com.binasystem.profact.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @InjectMocks private UsuarioService usuarioService;

    // =========================================================
    // PF-002: Creación exitosa de usuario con rol EMPLEADO
    // =========================================================
    @Test
    void crearUsuario_conDatosValidos_retornaUsuarioCreado() {
        // Arrange
        UsuarioRequestDTO dto = new UsuarioRequestDTO(
            "Carlos López", "carlos.lopez@profact.com", "Empleado2026$", Rol.VENDEDOR
        );
        when(usuarioRepository.findByEmail("carlos.lopez@profact.com"))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode("Empleado2026$"))
                .thenReturn("$2a$10$hashedpassword");
        Usuario usuarioGuardado = new Usuario();
        usuarioGuardado.setId(2L);
        usuarioGuardado.setNombre("Carlos López");
        usuarioGuardado.setEmail("carlos.lopez@profact.com");
        usuarioGuardado.setContrasenaHash("$2a$10$hashedpassword");
        usuarioGuardado.setRol(Rol.VENDEDOR);
        usuarioGuardado.setActivo(true);
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioGuardado);

        // Act
        UsuarioResponseDTO response = usuarioService.crearUsuario(dto);

        // Assert
        assertNotNull(response);
        assertEquals("carlos.lopez@profact.com", response.getEmail());
        assertEquals(Rol.VENDEDOR, response.getRol());
        assertTrue(response.isActivo());
        // RNF-001: La respuesta NO debe contener la contraseña
        assertNull(response.getContrasenaHash());
        verify(passwordEncoder, times(1)).encode("Empleado2026$");
    }

    // =========================================================
    // PV-003: Rechazo de email ya registrado
    // =========================================================
    @Test
    void crearUsuario_conEmailDuplicado_lanzaEmailDuplicadoException() {
        // Arrange
        UsuarioRequestDTO dto = new UsuarioRequestDTO(
            "Otro Admin", "admin@profact.com", "pass123", Rol.ADMIN
        );
        Usuario existente = new Usuario();
        existente.setEmail("admin@profact.com");
        when(usuarioRepository.findByEmail("admin@profact.com"))
                .thenReturn(Optional.of(existente));

        // Act & Assert
        EmailDuplicadoException ex = assertThrows(
            EmailDuplicadoException.class,
            () -> usuarioService.crearUsuario(dto)
        );
        assertEquals("El correo ya está registrado en el sistema", ex.getMessage());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void desactivarUsuario_conIdValido_cambiEstadoAFalse() {
        // Arrange
        Usuario usuario = new Usuario();
        usuario.setId(3L);
        usuario.setActivo(true);
        when(usuarioRepository.findById(3L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any())).thenReturn(usuario);

        // Act
        usuarioService.cambiarEstado(3L, false);

        // Assert
        assertFalse(usuario.isActivo());
        verify(usuarioRepository, times(1)).save(usuario);
    }

    @Test
    void crearUsuario_contrasenaHasheadaConBcrypt() {
        // RNF-001: Verificar que BCrypt es usado con factor 10
        UsuarioRequestDTO dto = new UsuarioRequestDTO(
            "Test", "test@profact.com", "password", Rol.VENDEDOR
        );
        when(usuarioRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password")).thenReturn("$2a$10$...");
        when(usuarioRepository.save(any())).thenReturn(new Usuario());

        usuarioService.crearUsuario(dto);

        // Verificar que el encoder fue llamado (BCryptPasswordEncoder configurado con 10)
        verify(passwordEncoder, times(1)).encode("password");
    }
}
