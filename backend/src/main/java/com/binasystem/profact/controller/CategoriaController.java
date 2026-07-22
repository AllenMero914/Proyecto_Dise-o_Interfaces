package com.binasystem.profact.controller;

import com.binasystem.profact.dto.CategoriaRequestDTO;
import com.binasystem.profact.dto.CategoriaResponseDTO;
import com.binasystem.profact.service.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    // CA-003.4: Endpoint público (con JWT) para dropdowns
    @GetMapping
    public ResponseEntity<List<CategoriaResponseDTO>> listar(
            @RequestParam(defaultValue = "false") boolean todas) {
        if (todas) return ResponseEntity.ok(categoriaService.listarTodas());
        return ResponseEntity.ok(categoriaService.listarActivas());
    }

    @PostMapping  // PF-003
    public ResponseEntity<CategoriaResponseDTO> crear(@Valid @RequestBody CategoriaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaService.crearCategoria(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponseDTO> actualizar(@PathVariable Long id,
                                                            @Valid @RequestBody CategoriaRequestDTO dto) {
        return ResponseEntity.ok(categoriaService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")  // CA-003.3: Soft delete
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        categoriaService.eliminarCategoria(id);
        return ResponseEntity.noContent().build();
    }
}
