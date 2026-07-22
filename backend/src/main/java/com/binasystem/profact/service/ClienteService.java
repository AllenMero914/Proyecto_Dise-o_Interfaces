package com.binasystem.profact.service;

import com.binasystem.profact.dto.ClienteRequestDTO;
import com.binasystem.profact.dto.ClienteResponseDTO;
import com.binasystem.profact.entity.Cliente;
import com.binasystem.profact.repository.ClienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<ClienteResponseDTO> listarActivos() {
        return clienteRepository.findByActivoTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ClienteResponseDTO crearCliente(ClienteRequestDTO dto) {
        Cliente cliente = new Cliente();
        cliente.setIdentificacion(dto.getIdentificacion());
        cliente.setNombre(dto.getNombre());
        cliente.setTelefono(dto.getTelefono());
        cliente.setDireccion(dto.getDireccion());
        cliente.setEmail(dto.getEmail());
        cliente.setActivo(true);
        return mapToDTO(clienteRepository.save(cliente));
    }

    public ClienteResponseDTO actualizar(Long id, ClienteRequestDTO dto) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        cliente.setIdentificacion(dto.getIdentificacion());
        cliente.setNombre(dto.getNombre());
        cliente.setTelefono(dto.getTelefono());
        cliente.setDireccion(dto.getDireccion());
        cliente.setEmail(dto.getEmail());
        return mapToDTO(clienteRepository.save(cliente));
    }

    public void eliminar(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        cliente.setActivo(false);
        clienteRepository.save(cliente);
    }

    private ClienteResponseDTO mapToDTO(Cliente cliente) {
        ClienteResponseDTO dto = new ClienteResponseDTO();
        dto.setId(cliente.getId());
        dto.setIdentificacion(cliente.getIdentificacion());
        dto.setNombre(cliente.getNombre());
        dto.setTelefono(cliente.getTelefono());
        dto.setDireccion(cliente.getDireccion());
        dto.setEmail(cliente.getEmail());
        dto.setActivo(cliente.isActivo());
        return dto;
    }
}
