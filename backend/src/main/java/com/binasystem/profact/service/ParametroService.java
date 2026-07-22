package com.binasystem.profact.service;

import com.binasystem.profact.dto.ParametroDTO;
import com.binasystem.profact.entity.Parametro;
import com.binasystem.profact.exception.RecursoNoEncontradoException;
import com.binasystem.profact.repository.ParametroRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParametroService {

    private final ParametroRepository parametroRepository;

    public ParametroService(ParametroRepository parametroRepository) {
        this.parametroRepository = parametroRepository;
    }

    public List<ParametroDTO> listar() {
        return parametroRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ParametroDTO obtenerPorClave(String clave) {
        Parametro p = parametroRepository.findByClave(clave)
                .orElseThrow(() -> new RecursoNoEncontradoException("Parametro", 0L));
        return mapToDTO(p);
    }
    
    public String obtenerValor(String clave, String valorPorDefecto) {
        return parametroRepository.findByClave(clave)
                .map(Parametro::getValor)
                .orElse(valorPorDefecto);
    }

    public ParametroDTO actualizar(String clave, ParametroDTO dto) {
        Parametro p = parametroRepository.findByClave(clave)
                .orElseThrow(() -> new RecursoNoEncontradoException("Parametro", 0L));
        
        p.setValor(dto.getValor());
        p.setDescripcion(dto.getDescripcion());
        
        return mapToDTO(parametroRepository.save(p));
    }

    private ParametroDTO mapToDTO(Parametro p) {
        ParametroDTO dto = new ParametroDTO();
        dto.setId(p.getId());
        dto.setClave(p.getClave());
        dto.setValor(p.getValor());
        dto.setDescripcion(p.getDescripcion());
        return dto;
    }
}
