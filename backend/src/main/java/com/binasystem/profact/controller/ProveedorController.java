package com.binasystem.profact.controller;

import com.binasystem.profact.dto.ProveedorRequestDTO;
import com.binasystem.profact.dto.ProveedorResponseDTO;
import com.binasystem.profact.entity.Proveedor;
import com.binasystem.profact.repository.ProveedorRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController {

    private final ProveedorRepository proveedorRepository;

    public ProveedorController(ProveedorRepository proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }

    @GetMapping
    public ResponseEntity<List<ProveedorResponseDTO>> listar() {
        return ResponseEntity.ok(
            proveedorRepository.findByActivoTrue().stream()
                .map(p -> new ProveedorResponseDTO(p.getId(), p.getNombre(), p.getEmail(), p.getTelefono()))
                .collect(Collectors.toList())
        );
    }

    @PostMapping
    public ResponseEntity<ProveedorResponseDTO> crear(@Valid @RequestBody ProveedorRequestDTO dto) {
        Proveedor p = new Proveedor();
        p.setNombre(dto.getNombre());
        p.setEmail(dto.getEmail());
        p.setTelefono(dto.getTelefono());
        p.setDireccion(dto.getDireccion());
        p = proveedorRepository.save(p);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ProveedorResponseDTO(p.getId(), p.getNombre(), p.getEmail(), p.getTelefono()));
    }
}
