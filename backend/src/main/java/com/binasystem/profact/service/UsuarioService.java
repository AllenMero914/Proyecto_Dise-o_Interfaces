package com.binasystem.profact.service;

import com.binasystem.profact.dto.UsuarioRequestDTO;
import com.binasystem.profact.dto.UsuarioResponseDTO;
import com.binasystem.profact.entity.Usuario;
import com.binasystem.profact.exception.EmailDuplicadoException;
import com.binasystem.profact.exception.RecursoNoEncontradoException;
import com.binasystem.profact.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public UsuarioResponseDTO obtenerPorId(Long id) {
        Usuario u = usuarioRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Usuario", id));
        return mapToDTO(u);
    }

    @Transactional
    public UsuarioResponseDTO crearUsuario(UsuarioRequestDTO dto) {
        // PV-003: Verificar email duplicado
        if (usuarioRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new EmailDuplicadoException();
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(dto.getNombre());
        usuario.setEmail(dto.getEmail());
        // RNF-001: Hash bcrypt factor 10
        usuario.setContrasenaHash(passwordEncoder.encode(dto.getContrasena()));
        usuario.setRol(dto.getRol());
        usuario.setActivo(true);

        return mapToDTO(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponseDTO actualizarUsuario(Long id, UsuarioRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Usuario", id));

        // Verificar email duplicado (excluyendo el mismo usuario)
        usuarioRepository.findByEmail(dto.getEmail())
            .filter(u -> !u.getId().equals(id))
            .ifPresent(u -> { throw new EmailDuplicadoException(); });

        usuario.setNombre(dto.getNombre());
        usuario.setEmail(dto.getEmail());
        if (dto.getContrasena() != null && !dto.getContrasena().isBlank()) {
            usuario.setContrasenaHash(passwordEncoder.encode(dto.getContrasena()));
        }
        usuario.setRol(dto.getRol());

        return mapToDTO(usuarioRepository.save(usuario));
    }

    // CA-002.4: Soft deactivation
    @Transactional
    public void cambiarEstado(Long id, boolean activo) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Usuario", id));
        usuario.setActivo(activo);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Usuario", id);
        }
        usuarioRepository.deleteById(id);
    }

    private UsuarioResponseDTO mapToDTO(Usuario u) {
        // RNF-001: NUNCA exponer contrasenaHash
        return new UsuarioResponseDTO(u.getId(), u.getNombre(), u.getEmail(), u.getRol(), u.isActivo());
    }
}
