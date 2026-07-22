package com.binasystem.profact.service;

import com.binasystem.profact.dto.CategoriaRequestDTO;
import com.binasystem.profact.dto.CategoriaResponseDTO;
import com.binasystem.profact.entity.Categoria;
import com.binasystem.profact.exception.NombreDuplicadoException;
import com.binasystem.profact.repository.CategoriaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoriaServiceTest {

    @Mock private CategoriaRepository categoriaRepository;
    @InjectMocks private CategoriaService categoriaService;

    // =========================================================
    // PF-003: Creación exitosa de categoría
    // =========================================================
    @Test
    void crearCategoria_conNombreNuevo_retornaCategoriaCreada() {
        // Arrange
        CategoriaRequestDTO dto = new CategoriaRequestDTO(
            "Herramientas Eléctricas",
            "Taladros, sierras y accesorios eléctricos."
        );
        when(categoriaRepository.findByNombreIgnoreCase("Herramientas Eléctricas"))
                .thenReturn(Optional.empty());
        Categoria guardada = new Categoria();
        guardada.setId(1L);
        guardada.setNombre("Herramientas Eléctricas");
        guardada.setDescripcion("Taladros, sierras y accesorios eléctricos.");
        guardada.setActivo(true);
        when(categoriaRepository.save(any(Categoria.class))).thenReturn(guardada);

        // Act
        CategoriaResponseDTO response = categoriaService.crearCategoria(dto);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Herramientas Eléctricas", response.getNombre());
        assertTrue(response.isActivo());
    }

    // =========================================================
    // PV-004: Rechazo de nombre duplicado
    // =========================================================
    @Test
    void crearCategoria_conNombreDuplicado_lanzaNombreDuplicadoException() {
        // Arrange
        CategoriaRequestDTO dto = new CategoriaRequestDTO(
            "Herramientas Eléctricas", "Descripción cualquiera"
        );
        Categoria existente = new Categoria();
        existente.setNombre("Herramientas Eléctricas");
        when(categoriaRepository.findByNombreIgnoreCase("Herramientas Eléctricas"))
                .thenReturn(Optional.of(existente));

        // Act & Assert
        NombreDuplicadoException ex = assertThrows(
            NombreDuplicadoException.class,
            () -> categoriaService.crearCategoria(dto)
        );
        assertEquals("El nombre de la categoría ya existe", ex.getMessage());
        verify(categoriaRepository, never()).save(any());
    }

    @Test
    void eliminarCategoria_usaSoftDelete_noEliminaFisicamente() {
        // CA-003.3: Soft delete para no afectar productos existentes
        Categoria categoria = new Categoria();
        categoria.setId(1L);
        categoria.setActivo(true);
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));

        categoriaService.eliminarCategoria(1L);

        assertFalse(categoria.isActivo());
        verify(categoriaRepository, times(1)).save(categoria);
        verify(categoriaRepository, never()).delete(any());
    }
}
