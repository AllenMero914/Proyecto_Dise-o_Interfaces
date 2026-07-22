package com.binasystem.profact.service;

import com.binasystem.profact.dto.ProductoRequestDTO;
import com.binasystem.profact.dto.ProductoResponseDTO;
import com.binasystem.profact.entity.Categoria;
import com.binasystem.profact.entity.Producto;
import com.binasystem.profact.exception.RecursoNoEncontradoException;
import com.binasystem.profact.exception.ValidacionException;
import com.binasystem.profact.repository.CategoriaRepository;
import com.binasystem.profact.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoService(ProductoRepository productoRepository,
                           CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public List<ProductoResponseDTO> listarActivos() {
        return productoRepository.findByActivoTrue().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public ProductoResponseDTO obtenerPorId(Long id) {
        return mapToDTO(productoRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Producto", id)));
    }

    // CA-004.5: Solo productos con stock crítico
    public List<ProductoResponseDTO> obtenerStockBajo() {
        return productoRepository.findByStockLessThanEqualStockMinimo().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public ProductoResponseDTO crearProducto(ProductoRequestDTO dto) {
        validar(dto);

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
            .orElseThrow(() -> new RecursoNoEncontradoException("Categoría", dto.getCategoriaId()));

        Producto producto = new Producto();
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setPrecioCompra(dto.getPrecioCompra());
        producto.setStock(dto.getStock());
        producto.setStockMinimo(dto.getStockMinimo());
        producto.setCategoria(categoria);
        producto.setActivo(true);

        return mapToDTO(productoRepository.save(producto));
    }

    @Transactional
    public ProductoResponseDTO actualizar(Long id, ProductoRequestDTO dto) {
        validar(dto);
        Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Producto", id));

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
            .orElseThrow(() -> new RecursoNoEncontradoException("Categoría", dto.getCategoriaId()));

        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setPrecioCompra(dto.getPrecioCompra());
        producto.setStock(dto.getStock());
        producto.setStockMinimo(dto.getStockMinimo());
        producto.setCategoria(categoria);

        return mapToDTO(productoRepository.save(producto));
    }

    @Transactional
    public void eliminar(Long id) {
        Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Producto", id));
        producto.setActivo(false);
        productoRepository.save(producto);
    }

    // CA-004.4: Precio y stock no pueden ser negativos
    private void validar(ProductoRequestDTO dto) {
        if (dto.getPrecio() != null && dto.getPrecio().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidacionException("El precio debe ser mayor a cero");
        }
        if (dto.getPrecioCompra() != null && dto.getPrecioCompra().compareTo(BigDecimal.ZERO) < 0) {
            throw new ValidacionException("El precio de compra no puede ser negativo");
        }
        if (dto.getStock() < 0) {
            throw new ValidacionException("El stock no puede ser negativo");
        }
    }

    private ProductoResponseDTO mapToDTO(Producto p) {
        boolean stockBajo = p.getStock() <= p.getStockMinimo();
        String catNombre = p.getCategoria() != null ? p.getCategoria().getNombre() : null;
        Long catId = p.getCategoria() != null ? p.getCategoria().getId() : null;
        return new ProductoResponseDTO(
            p.getId(), p.getNombre(), p.getDescripcion(),
            p.getPrecio(), p.getPrecioCompra(), p.getStock(), p.getStockMinimo(),
            stockBajo, catNombre, catId, p.isActivo()
        );
    }
}
