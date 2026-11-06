package com.erp.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    private Key getSigningKey() {
        String secret = jwtProperties.getSecret();
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UserDetails userDetails) {
        String tenantId = (userDetails instanceof com.erp.auth.model.UserPrincipal up) ? up.getTenantId() : null;
        return generateAccessToken(userDetails, tenantId);
    }

    public String generateAccessToken(UserDetails userDetails, String tenantId) {
        Map<String, Object> extraClaims = new HashMap<>();
        List<String> authorities = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
                
        extraClaims.put("authorities", authorities);
        extraClaims.put("token_type", "ACCESS");
        if (tenantId != null && !tenantId.isBlank()) {
            extraClaims.put("tenant_id", tenantId.trim());
        }

        return buildToken(extraClaims, userDetails.getUsername(), jwtProperties.getAccessTokenExpiration());
    }

    public String generateAccessToken(com.erp.auth.entity.AppUser user) {
        Map<String, Object> extraClaims = new HashMap<>();
        if (user.getRole() != null) {
            extraClaims.put("authorities", Collections.singletonList(user.getRole().getAuthority()));
        }
        extraClaims.put("token_type", "ACCESS");
        if (user.getTenantId() != null && !user.getTenantId().isBlank()) {
            extraClaims.put("tenant_id", user.getTenantId().trim());
        }

        return buildToken(extraClaims, user.getUsername(), jwtProperties.getAccessTokenExpiration());
    }

    public String generateRefreshToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("token_type", "REFRESH");
        if (userDetails instanceof com.erp.auth.model.UserPrincipal up && up.getTenantId() != null) {
            extraClaims.put("tenant_id", up.getTenantId().trim());
        }

        return buildToken(extraClaims, userDetails.getUsername(), jwtProperties.getRefreshTokenExpiration());
    }

    private String buildToken(Map<String, Object> extraClaims, String subject, long expiration) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setId(UUID.randomUUID().toString())
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractTenantId(String token) {
        return extractClaim(token, claims -> claims.get("tenant_id", String.class));
    }

    public String extractTokenId(String token) {
        return extractClaim(token, Claims::getId);
    }

    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("token_type", String.class));
    }

    @SuppressWarnings("unchecked")
    public List<String> extractAuthorities(String token) {
        return extractClaim(token, claims -> claims.get("authorities", List.class));
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenValid(String token, String username) {
        final String extractedUser = extractUsername(token);
        return (extractedUser.equals(username) && !isTokenExpired(token));
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
}
