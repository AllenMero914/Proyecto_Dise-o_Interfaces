package com.binasystem.profact.controller;

import com.binasystem.profact.dto.ParametroDTO;
import com.binasystem.profact.service.ParametroService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parametros")
@CrossOrigin(origins = "*")
public class ParametroController {

    private final ParametroService parametroService;

    public ParametroController(ParametroService parametroService) {
        this.parametroService = parametroService;
    }

    @GetMapping
    public ResponseEntity<List<ParametroDTO>> listar() {
        return ResponseEntity.ok(parametroService.listar());
    }

    @GetMapping("/{clave}")
    public ResponseEntity<ParametroDTO> obtenerPorClave(@PathVariable String clave) {
        return ResponseEntity.ok(parametroService.obtenerPorClave(clave));
    }

    @PutMapping("/{clave}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParametroDTO> actualizar(@PathVariable String clave, @Valid @RequestBody ParametroDTO dto) {
        return ResponseEntity.ok(parametroService.actualizar(clave, dto));
    }
}
