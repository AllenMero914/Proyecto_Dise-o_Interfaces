package com.binasystem.profact.controller;

import com.binasystem.profact.dto.VentaRequestDTO;
import com.binasystem.profact.dto.VentaResponseDTO;
import com.binasystem.profact.repository.UsuarioRepository;
import com.binasystem.profact.service.VentaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    private final VentaService ventaService;
    private final UsuarioRepository usuarioRepository;

    public VentaController(VentaService ventaService, UsuarioRepository usuarioRepository) {
        this.ventaService = ventaService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public ResponseEntity<List<VentaResponseDTO>> listar() {
        return ResponseEntity.ok(ventaService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VentaResponseDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.obtenerPorId(id));
    }

    // CA-005: Registro de venta con múltiples productos
    @PostMapping
    public ResponseEntity<VentaResponseDTO> registrar(
            @Valid @RequestBody VentaRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = usuarioRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado")).getId();
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ventaService.registrarVenta(dto, usuarioId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VentaResponseDTO> editar(
            @PathVariable Long id,
            @Valid @RequestBody VentaRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = usuarioRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado")).getId();
        return ResponseEntity.ok(ventaService.editarVenta(id, dto, usuarioId));
    }
}
