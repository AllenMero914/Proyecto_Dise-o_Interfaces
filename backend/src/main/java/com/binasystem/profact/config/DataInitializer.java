package com.binasystem.profact.config;

import com.binasystem.profact.entity.Usuario;
import com.binasystem.profact.enums.Rol;
import com.binasystem.profact.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.jdbc.core.JdbcTemplate;

import com.binasystem.profact.entity.Parametro;
import com.binasystem.profact.repository.ParametroRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(
            UsuarioRepository usuarioRepo,
            ParametroRepository parametroRepo,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate) {

        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE usuarios ALTER COLUMN rol VARCHAR(255)");
            } catch (Exception e) {
                // Ignore if it fails or already altered
            }
            if (usuarioRepo.findByEmail("admin@profact.com").isEmpty()) {
                Usuario admin = new Usuario();
                admin.setNombre("Administrador");
                admin.setEmail("admin@profact.com");
                admin.setContrasenaHash(passwordEncoder.encode("12345"));
                admin.setRol(Rol.ADMIN);
                admin.setActivo(true);
                usuarioRepo.save(admin);

                Usuario root = new Usuario();
                root.setNombre("Administrador");
                root.setEmail("root");
                root.setContrasenaHash(passwordEncoder.encode("12345"));
                root.setRol(Rol.ADMIN);
                root.setActivo(true);
                usuarioRepo.save(root);
            }
            
            if (parametroRepo.findByClave("IVA").isEmpty()) {
                Parametro p = new Parametro();
                p.setClave("IVA");
                p.setValor("15");
                p.setDescripcion("Porcentaje de Impuesto al Valor Agregado");
                parametroRepo.save(p);
            }
        };
    }
}
