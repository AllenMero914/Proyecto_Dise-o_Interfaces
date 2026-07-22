package com.binasystem.profact.security;

import com.binasystem.profact.entity.Usuario;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

// RNF-002: JWT firmado con HS256
@Component
public class JwtUtil {

    @Value("${jwt.secret:dGhpc2lzYXN1cGVyc2VjcmV0a2V5dGhhdGlzdXNlZGZvcmp3dHRva2Vucw==}")
    private String secretString;

    @Value("${jwt.expiration-hours:8}")
    private int expirationHours;

    // CA-009.1: Lista negra de tokens invalidados (en memoria)
    private final Set<String> tokensInvalidados = Collections.synchronizedSet(new HashSet<>());

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secretString.getBytes(StandardCharsets.UTF_8));
    }

    public String generarToken(Usuario usuario) {
        return Jwts.builder()
            .subject(usuario.getEmail())
            .claim("id", usuario.getId())
            .claim("nombre", usuario.getNombre())
            .claim("rol", usuario.getRol().name())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expirationHours * 3600_000L))
            .signWith(getKey(), Jwts.SIG.HS256)
            .compact();
    }

    public Claims extraerClaims(String token) {
        return Jwts.parser()
            .verifyWith(getKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public String extraerEmail(String token) {
        return extraerClaims(token).getSubject();
    }

    public boolean esValido(String token) {
        try {
            // CA-009.3: Token en lista negra → inválido
            if (tokensInvalidados.contains(token)) return false;
            Claims claims = extraerClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // PF-004: Invalidar token al hacer logout
    public void invalidarToken(String token) {
        tokensInvalidados.add(token);
    }
}
