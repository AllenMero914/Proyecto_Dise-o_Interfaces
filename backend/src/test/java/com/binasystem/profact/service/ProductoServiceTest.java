package com.binasystem.profact.service;

import com.binasystem.profact.dto.ProductoRequestDTO;
import com.binasystem.profact.entity.Categoria;
import com.binasystem.profact.entity.Producto;
import com.binasystem.profact.exception.ValidacionException;
import com.binasystem.profact.repository.CategoriaRepository;
import com.binasystem.profact.repository.ProductoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock private ProductoRepository productoRepository;
    @Mock private CategoriaRepository categoriaRepository;
    @InjectMocks private ProductoService productoService;

    @Test
    void crearProducto_conDatosValidos_retornaProductoCreado() {
        ProductoRequestDTO dto = new ProductoRequestDTO(
            "Taladro Bosch", "Taladro percutor 750W",
            new BigDecimal("89.99"), new BigDecimal("60.00"), 15, 3, 1L
        );
        Categoria cat = new Categoria();
        cat.setId(1L);
        cat.setNombre("Herramientas Eléctricas");
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(cat));
        Producto guardado = new Producto();
        guardado.setId(1L);
        guardado.setNombre("Taladro Bosch");
        guardado.setPrecio(new BigDecimal("89.99"));
        guardado.setStock(15);
        guardado.setStockMinimo(3);
        when(productoRepository.save(any())).thenReturn(guardado);

        var response = productoService.crearProducto(dto);

        assertNotNull(response);
        assertEquals("Taladro Bosch", response.getNombre());
    }

    @Test
    void crearProducto_conPrecioNegativo_lanzaValidacionException() {
        ProductoRequestDTO dto = new ProductoRequestDTO(
            "Producto Malo", "Desc",
            new BigDecimal("-10.00"), null, 5, 1, 1L
        );

        assertThrows(ValidacionException.class, () -> productoService.crearProducto(dto));
    }

    @Test
    void crearProducto_conStockNegativo_lanzaValidacionException() {
        ProductoRequestDTO dto = new ProductoRequestDTO(
            "Producto Malo", "Desc",
            new BigDecimal("10.00"), null, -1, 1, 1L
        );

        assertThrows(ValidacionException.class, () -> productoService.crearProducto(dto));
    }

    @Test
    void obtenerProductosConStockBajo_retornaSoloProductosCriticos() {
        Producto p1 = new Producto(); p1.setNombre("P1"); p1.setStock(2); p1.setStockMinimo(5);
        Producto p2 = new Producto(); p2.setNombre("P2"); p2.setStock(10); p2.setStockMinimo(3);
        when(productoRepository.findByStockLessThanEqualStockMinimo()).thenReturn(List.of(p1));

        var resultado = productoService.obtenerStockBajo();

        assertEquals(1, resultado.size());
        assertEquals("P1", resultado.get(0).getNombre());
    }
}
