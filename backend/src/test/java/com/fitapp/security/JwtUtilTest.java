package com.fitapp.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "test-only-secret-key-256-bits-minimum-length-required-here-ok");
        ReflectionTestUtils.setField(jwtUtil, "accessExpMs", 900_000L);
        ReflectionTestUtils.setField(jwtUtil, "refreshExpMs", 604_800_000L);
    }

    @Test
    void generatesAndValidatesAccessToken() {
        String token = jwtUtil.generateAccess("user@example.com", "USER");

        assertThat(jwtUtil.validateToken(token)).isTrue();
        assertThat(jwtUtil.extractEmail(token)).isEqualTo("user@example.com");
    }

    @Test
    void rejectsTamperedToken() {
        String token = jwtUtil.generateAccess("user@example.com", "USER");

        assertThat(jwtUtil.validateToken(token + "tampered")).isFalse();
    }

    @Test
    void rejectsGarbageToken() {
        assertThat(jwtUtil.validateToken("not-a-real-token")).isFalse();
    }
}
