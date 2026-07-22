package com.binasystem.profact.controller;

import com.binasystem.profact.service.ReporteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final ReporteService reporteService;

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    @GetMapping("/ventas-mensuales")
    public ResponseEntity<List<Map<String, Object>>> ventasMensuales(
            @RequestParam(required = false) Integer anio) {
        if (anio == null) anio = LocalDate.now().getYear();
        return ResponseEntity.ok(reporteService.ventasMensuales(anio));
    }

    @GetMapping("/compras-mensuales")
    public ResponseEntity<List<Map<String, Object>>> comprasMensuales(
            @RequestParam(required = false) Integer anio) {
        if (anio == null) anio = LocalDate.now().getYear();
        return ResponseEntity.ok(reporteService.comprasMensuales(anio));
    }

    @GetMapping("/productos-mas-vendidos")
    public ResponseEntity<List<Map<String, Object>>> productosMasVendidos() {
        return ResponseEntity.ok(reporteService.productosMasVendidos());
    }

    @GetMapping("/resumen-financiero")
    public ResponseEntity<Map<String, Object>> resumenFinanciero(
            @RequestParam String inicio,
            @RequestParam String fin) {
        return ResponseEntity.ok(reporteService.resumenFinanciero(inicio, fin));
    }
}
