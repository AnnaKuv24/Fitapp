package com.fitapp.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${app.jwt.secret}")
    private String secret;
    @Value("${app.jwt.access-expiration-ms}")
    private long accessExpMs;
    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpMs;

    private Key key() { return Keys.hmacShaKeyFor(secret.getBytes()); }

    public String generateAccess(String email, String role) {
        return Jwts.builder().setSubject(email)
            .claim("role", role)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + accessExpMs))
            .signWith(key(), SignatureAlgorithm.HS256).compact();
    }

    public String generateRefresh(String email) {
        return Jwts.builder().setSubject(email)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + refreshExpMs))
            .signWith(key(), SignatureAlgorithm.HS256).compact();
    }

    public String extractEmail(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
            .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateToken(String token) {
        try { Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token); return true; }
        catch (JwtException | IllegalArgumentException e) { return false; }
    }
}