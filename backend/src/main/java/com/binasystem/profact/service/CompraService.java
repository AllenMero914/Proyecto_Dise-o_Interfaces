package com.binasystem.profact.service;

import com.binasystem.profact.dto.CompraRequestDTO;
import com.binasystem.profact.dto.CompraResponseDTO;
import com.binasystem.profact.entity.*;
import com.binasystem.profact.exception.RecursoNoEncontradoException;
import com.binasystem.profact.exception.ValidacionException;
import com.binasystem.profact.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompraService {

    private final CompraRepository compraRepository;
    private final ProductoRepository productoRepository;
    private final ProveedorRepository proveedorRepository;
    private final UsuarioRepository usuarioRepository;
    private final ParametroService parametroService;

    public CompraService(CompraRepository compraRepository,
                         ProductoRepository productoRepository,
                         ProveedorRepository proveedorRepository,
                         UsuarioRepository usuarioRepository,
                         ParametroService parametroService) {
        this.compraRepository = compraRepository;
        this.productoRepository = productoRepository;
        this.proveedorRepository = proveedorRepository;
        this.usuarioRepository = usuarioRepository;
        this.parametroService = parametroService;
    }

    public List<CompraResponseDTO> listar() {
        return compraRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public CompraResponseDTO obtenerPorId(Long id) {
        return mapToDTO(compraRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Compra", id)));
    }

    @Transactional
    public CompraResponseDTO registrarCompra(CompraRequestDTO dto, Long usuarioId) {
        Proveedor proveedor = proveedorRepository.findById(dto.getProveedorId())
            .orElseThrow(() -> new RecursoNoEncontradoException("Proveedor", dto.getProveedorId()));
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RecursoNoEncontradoException("Usuario", usuarioId));

        Compra compra = new Compra();
        compra.setProveedor(proveedor);
        compra.setUsuario(usuario);

        BigDecimal subtotalGeneral = BigDecimal.ZERO;
        List<DetalleCompra> detalles = new ArrayList<>();

        for (var item : dto.getDetalles()) {
            Producto producto = productoRepository.findById(item.getProductoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto", item.getProductoId()));

            // CA-006.2: Aumentar stock al comprar
            producto.setStock(producto.getStock() + item.getCantidad());
            producto.setPrecioCompra(item.getPrecioUnitario());
            if (item.getPrecioVenta() != null) {
                producto.setPrecio(item.getPrecioVenta());
            }
            productoRepository.save(producto);

            BigDecimal subtotal = item.getPrecioUnitario()
                .multiply(BigDecimal.valueOf(item.getCantidad()));
            subtotalGeneral = subtotalGeneral.add(subtotal);

            DetalleCompra detalle = new DetalleCompra();
            detalle.setCompra(compra);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(item.getPrecioUnitario());
            detalle.setSubtotal(subtotal);
            detalles.add(detalle);
        }

        BigDecimal ivaAmount = BigDecimal.ZERO;
        if (dto.isAplicarIva()) {
            String ivaStr = parametroService.obtenerValor("IVA", "0");
            BigDecimal ivaPorcentaje = new BigDecimal(ivaStr).divide(new BigDecimal("100"));
            ivaAmount = subtotalGeneral.multiply(ivaPorcentaje);
        }

        BigDecimal total = subtotalGeneral.add(ivaAmount);

        compra.setSubtotal(subtotalGeneral);
        compra.setIva(ivaAmount);
        compra.setTotal(total);
        compra.setDetalles(detalles);

        return mapToDTO(compraRepository.save(compra));
    }

    @Transactional
    public CompraResponseDTO editarCompra(Long id, CompraRequestDTO dto, Long usuarioId) {
        Compra compra = compraRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Compra", id));

        Proveedor proveedor = proveedorRepository.findById(dto.getProveedorId())
            .orElseThrow(() -> new RecursoNoEncontradoException("Proveedor", dto.getProveedorId()));
        compra.setProveedor(proveedor);

        // 1. Revertir stock
        for (DetalleCompra d : compra.getDetalles()) {
            Producto p = d.getProducto();
            int stockRevertido = p.getStock() - d.getCantidad();
            if (stockRevertido < 0) {
                throw new ValidacionException("No se puede editar la compra. El producto '" + p.getNombre() + "' ya fue vendido y su stock quedaría en negativo al revertir.");
            }
            p.setStock(stockRevertido);
            productoRepository.save(p);
        }

        compra.getDetalles().clear();

        BigDecimal subtotalGeneral = BigDecimal.ZERO;
        
        for (var item : dto.getDetalles()) {
            Producto producto = productoRepository.findById(item.getProductoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto", item.getProductoId()));

            producto.setStock(producto.getStock() + item.getCantidad());
            producto.setPrecioCompra(item.getPrecioUnitario());
            if (item.getPrecioVenta() != null) {
                producto.setPrecio(item.getPrecioVenta());
            }
            productoRepository.save(producto);

            BigDecimal subtotal = item.getPrecioUnitario()
                .multiply(BigDecimal.valueOf(item.getCantidad()));
            subtotalGeneral = subtotalGeneral.add(subtotal);

            DetalleCompra detalle = new DetalleCompra();
            detalle.setCompra(compra);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(item.getPrecioUnitario());
            detalle.setSubtotal(subtotal);
            compra.getDetalles().add(detalle);
        }

        BigDecimal ivaAmount = BigDecimal.ZERO;
        if (dto.isAplicarIva()) {
            String ivaStr = parametroService.obtenerValor("IVA", "0");
            BigDecimal ivaPorcentaje = new BigDecimal(ivaStr).divide(new BigDecimal("100"));
            ivaAmount = subtotalGeneral.multiply(ivaPorcentaje);
        }

        BigDecimal total = subtotalGeneral.add(ivaAmount);

        compra.setSubtotal(subtotalGeneral);
        compra.setIva(ivaAmount);
        compra.setTotal(total);

        return mapToDTO(compraRepository.save(compra));
    }

    private CompraResponseDTO mapToDTO(Compra c) {
        String prov = c.getProveedor() != null ? c.getProveedor().getNombre() : "N/A";
        Long provId = c.getProveedor() != null ? c.getProveedor().getId() : null;
        
        List<CompraResponseDTO.DetalleCompraResponseDTO> detallesDtos = c.getDetalles().stream()
            .map(d -> new CompraResponseDTO.DetalleCompraResponseDTO(
                d.getProducto().getId(),
                d.getProducto().getNombre(),
                d.getCantidad(),
                d.getPrecioUnitario(),
                d.getSubtotal()
            )).collect(Collectors.toList());

        return new CompraResponseDTO(c.getId(), c.getFecha(), c.getSubtotal(), c.getIva(), c.getTotal(), prov, provId, detallesDtos);
    }
}
