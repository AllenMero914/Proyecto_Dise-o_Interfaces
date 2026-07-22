package com.binasystem.profact.config;

import com.binasystem.profact.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// RNF-001: BCrypt factor 10 | RNF-002: JWT HS256 | Stateless session
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configure(http))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // RNF-002: Rutas públicas (sin token)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                // CA-002.5: Solo ADMIN puede gestionar usuarios
                .requestMatchers("/api/usuarios/**").hasRole("ADMIN")
                // Categorias: GET para todos, POST/PUT/DELETE para ADMIN
                .requestMatchers(HttpMethod.GET, "/api/categorias/**").authenticated()
                .requestMatchers("/api/categorias/**").hasRole("ADMIN")
                // Productos: GET para todos, POST/PUT/DELETE para ADMIN
                .requestMatchers(HttpMethod.GET, "/api/productos/**").authenticated()
                .requestMatchers("/api/productos/**").hasRole("ADMIN")
                // Edición de transacciones (Ventas y Compras) protegidas para ADMIN
                .requestMatchers(HttpMethod.PUT, "/api/ventas/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/compras/**").hasRole("ADMIN")
                // Proveedores y Reportes para ADMIN
                .requestMatchers("/api/proveedores/**").hasRole("ADMIN")
                .requestMatchers("/api/reportes/**").hasRole("ADMIN")
                // Todas las demás rutas requieren autenticación
                .anyRequest().authenticated()
            )
            // H2 console headers
            .headers(h -> h.frameOptions(f -> f.sameOrigin()))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    // RNF-001: BCrypt con factor de trabajo 10 (mínimo requerido)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
