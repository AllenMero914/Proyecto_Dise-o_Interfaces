package com.binasystem.profact.controller;

import com.binasystem.profact.dto.CompraRequestDTO;
import com.binasystem.profact.dto.CompraResponseDTO;
import com.binasystem.profact.repository.UsuarioRepository;
import com.binasystem.profact.service.CompraService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compras")
public class CompraController {

    private final CompraService compraService;
    private final UsuarioRepository usuarioRepository;

    public CompraController(CompraService compraService, UsuarioRepository usuarioRepository) {
        this.compraService = compraService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public ResponseEntity<List<CompraResponseDTO>> listar() {
        return ResponseEntity.ok(compraService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompraResponseDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<CompraResponseDTO> registrar(
            @Valid @RequestBody CompraRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = usuarioRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado")).getId();
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(compraService.registrarCompra(dto, usuarioId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompraResponseDTO> editar(
            @PathVariable Long id,
            @Valid @RequestBody CompraRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = usuarioRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado")).getId();
        return ResponseEntity.ok(compraService.editarCompra(id, dto, usuarioId));
    }
}
