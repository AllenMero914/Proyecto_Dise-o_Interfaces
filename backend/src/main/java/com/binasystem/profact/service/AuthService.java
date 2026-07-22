package com.binasystem.profact.service;

import com.binasystem.profact.dto.LoginRequestDTO;
import com.binasystem.profact.dto.LoginResponseDTO;
import com.binasystem.profact.entity.Usuario;
import com.binasystem.profact.exception.CredencialesInvalidasException;
import com.binasystem.profact.exception.CuentaBloqueadaException;
import com.binasystem.profact.repository.UsuarioRepository;
import com.binasystem.profact.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private static final int MAX_INTENTOS = 3;
    private static final int MINUTOS_BLOQUEO = 10;

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public LoginResponseDTO login(LoginRequestDTO request) {
        // PV-001: Misma excepción para usuario inexistente y contraseña incorrecta
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
            .orElseThrow(CredencialesInvalidasException::new);

        // PV-002: Verificar si la cuenta está bloqueada
        if (usuario.getBloqueadoHasta() != null &&
            usuario.getBloqueadoHasta().isAfter(LocalDateTime.now())) {
            throw new CuentaBloqueadaException();
        }

        // Restablecer bloqueo expirado
        if (usuario.getBloqueadoHasta() != null &&
            usuario.getBloqueadoHasta().isBefore(LocalDateTime.now())) {
            usuario.setIntentosFallidos(0);
            usuario.setBloqueadoHasta(null);
        }

        // Validar contraseña
        if (!passwordEncoder.matches(request.getContrasena(), usuario.getContrasenaHash())) {
            usuario.setIntentosFallidos(usuario.getIntentosFallidos() + 1);

            // PV-002: Bloquear tras MAX_INTENTOS fallos
            if (usuario.getIntentosFallidos() >= MAX_INTENTOS) {
                usuario.setBloqueadoHasta(LocalDateTime.now().plusMinutes(MINUTOS_BLOQUEO));
            }
            usuarioRepository.save(usuario);
            // PV-001: Mismo mensaje genérico
            throw new CredencialesInvalidasException();
        }

        // Login exitoso: restablecer contador
        usuario.setIntentosFallidos(0);
        usuario.setBloqueadoHasta(null);
        usuarioRepository.save(usuario);

        String token = jwtUtil.generarToken(usuario);

        return new LoginResponseDTO(
            token,
            usuario.getId(),
            usuario.getNombre(),
            usuario.getEmail(),
            usuario.getRol()
        );
    }

    // PF-004: Logout invalida el token
    public void logout(String token) {
        jwtUtil.invalidarToken(token);
    }
}
