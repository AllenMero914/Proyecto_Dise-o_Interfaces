package com.binasystem.profact.controller;

import com.binasystem.profact.dto.DashboardMetricasDTO;
import com.binasystem.profact.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // CA-007.1 a CA-007.4
    @GetMapping("/metricas")
    public ResponseEntity<DashboardMetricasDTO> metricas() {
        return ResponseEntity.ok(dashboardService.obtenerMetricas());
    }
}
