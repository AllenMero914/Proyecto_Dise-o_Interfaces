package com.binasystem.profact.service;

import com.binasystem.profact.dto.DetalleVentaDTO;
import com.binasystem.profact.dto.VentaRequestDTO;
import com.binasystem.profact.entity.Cliente;
import com.binasystem.profact.entity.Producto;
import com.binasystem.profact.entity.Usuario;
import com.binasystem.profact.entity.Venta;
import com.binasystem.profact.repository.ClienteRepository;
import com.binasystem.profact.exception.StockInsuficienteException;
import com.binasystem.profact.repository.ProductoRepository;
import com.binasystem.profact.repository.UsuarioRepository;
import com.binasystem.profact.repository.VentaRepository;
import org.junit.jupiter.api.BeforeEach;
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
class VentaServiceTest {

    @Mock private VentaRepository ventaRepository;
    @Mock private ProductoRepository productoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private ClienteRepository clienteRepository;
    @InjectMocks private VentaService ventaService;

    private Usuario vendedor;
    private Cliente cliente;

    @BeforeEach
    void setUp() {
        vendedor = new Usuario();
        vendedor.setId(1L);
        vendedor.setNombre("Vendedor");

        cliente = new Cliente();
        cliente.setId(1L);
        cliente.setNombre("Cliente Genérico");
    }

    @Test
    void registrarVenta_conStockSuficiente_actualizaStockYCalculaTotal() {
        Producto p1 = new Producto();
        p1.setId(1L);
        p1.setPrecio(new BigDecimal("89.99"));
        p1.setStock(15);

        VentaRequestDTO dto = new VentaRequestDTO(
            1L,
            List.of(new DetalleVentaDTO(1L, 3)),
            false
        );

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(vendedor));
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(productoRepository.findById(1L)).thenReturn(Optional.of(p1));
        Venta ventaGuardada = new Venta();
        ventaGuardada.setId(1L);
        when(ventaRepository.save(any())).thenReturn(ventaGuardada);

        var response = ventaService.registrarVenta(dto, 1L);

        assertEquals(12, p1.getStock());
        assertNotNull(response);
        verify(productoRepository, atLeastOnce()).save(p1);
    }

    @Test
    void registrarVenta_conStockInsuficiente_lanzaStockInsuficienteException() {
        Producto p1 = new Producto();
        p1.setId(1L);
        p1.setNombre("Taladro Bosch");
        p1.setPrecio(new BigDecimal("89.99"));
        p1.setStock(2);

        VentaRequestDTO dto = new VentaRequestDTO(
            1L,
            List.of(new DetalleVentaDTO(1L, 5)),
            false
        );

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(vendedor));
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(productoRepository.findById(1L)).thenReturn(Optional.of(p1));

        StockInsuficienteException ex = assertThrows(
            StockInsuficienteException.class,
            () -> ventaService.registrarVenta(dto, 1L)
        );
        assertTrue(ex.getMessage().contains("Taladro Bosch"));
        verify(ventaRepository, never()).save(any());
    }

    @Test
    void calcularTotalVenta_multiplesProductos_calculaCorrectamente() {
        Producto p1 = new Producto();
        p1.setId(1L); p1.setPrecio(new BigDecimal("89.99")); p1.setStock(20);
        Producto p2 = new Producto();
        p2.setId(2L); p2.setPrecio(new BigDecimal("25.50")); p2.setStock(20);

        VentaRequestDTO dto = new VentaRequestDTO(1L, List.of(
            new DetalleVentaDTO(1L, 3),
            new DetalleVentaDTO(2L, 2)
        ), false);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(vendedor));
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(productoRepository.findById(1L)).thenReturn(Optional.of(p1));
        when(productoRepository.findById(2L)).thenReturn(Optional.of(p2));
        when(ventaRepository.save(any())).thenReturn(new Venta());

        var response = ventaService.registrarVenta(dto, 1L);

        assertNotNull(response);
    }
}
