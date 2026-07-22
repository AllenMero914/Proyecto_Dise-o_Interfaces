package com.binasystem.profact.service;

import com.binasystem.profact.dto.CategoriaRequestDTO;
import com.binasystem.profact.dto.CategoriaResponseDTO;
import com.binasystem.profact.entity.Categoria;
import com.binasystem.profact.exception.NombreDuplicadoException;
import com.binasystem.profact.exception.RecursoNoEncontradoException;
import com.binasystem.profact.repository.CategoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public List<CategoriaResponseDTO> listarActivas() {
        // CA-003.4: Solo activas para dropdowns
        return categoriaRepository.findByActivoTrue().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public List<CategoriaResponseDTO> listarTodas() {
        return categoriaRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public CategoriaResponseDTO crearCategoria(CategoriaRequestDTO dto) {
        // PV-004: Verificar nombre duplicado (insensible a mayúsculas)
        categoriaRepository.findByNombreIgnoreCase(dto.getNombre())
            .ifPresent(c -> { throw new NombreDuplicadoException("categoría"); });

        Categoria categoria = new Categoria();
        categoria.setNombre(dto.getNombre());
        categoria.setDescripcion(dto.getDescripcion());
        categoria.setActivo(true);

        return mapToDTO(categoriaRepository.save(categoria));
    }

    @Transactional
    public CategoriaResponseDTO actualizar(Long id, CategoriaRequestDTO dto) {
        Categoria categoria = categoriaRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Categoría", id));

        categoriaRepository.findByNombreIgnoreCase(dto.getNombre())
            .filter(c -> !c.getId().equals(id))
            .ifPresent(c -> { throw new NombreDuplicadoException("categoría"); });

        categoria.setNombre(dto.getNombre());
        categoria.setDescripcion(dto.getDescripcion());

        return mapToDTO(categoriaRepository.save(categoria));
    }

    // CA-003.3: Soft delete - no elimina registros físicamente
    @Transactional
    public void eliminarCategoria(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Categoría", id));
        categoria.setActivo(false);
        categoriaRepository.save(categoria);
    }

    private CategoriaResponseDTO mapToDTO(Categoria c) {
        return new CategoriaResponseDTO(c.getId(), c.getNombre(), c.getDescripcion(), c.isActivo());
    }
}
