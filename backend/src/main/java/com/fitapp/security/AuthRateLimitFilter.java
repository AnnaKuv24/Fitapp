package com.fitapp.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Простий захист від брутфорсу: обмежує кількість запитів на /auth/login,
 * /auth/register і /auth/refresh з одного IP протягом ковзного вікна.
 */
@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {
    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_MS = 60_000;

    private final ConcurrentHashMap<String, Window> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String uri = request.getRequestURI();
        if (!isRateLimited(uri)) {
            chain.doFilter(request, response);
            return;
        }

        String key = clientIp(request) + "|" + uri;
        long now = System.currentTimeMillis();
        Window window = buckets.compute(key, (k, existing) -> {
            if (existing == null || now - existing.windowStart > WINDOW_MS) {
                return new Window(now);
            }
            return existing;
        });

        if (window.count.incrementAndGet() > MAX_REQUESTS) {
            response.setStatus(429);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"message\":\"Забагато спроб. Спробуйте пізніше.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private boolean isRateLimited(String uri) {
        return uri.endsWith("/auth/login") || uri.endsWith("/auth/register") || uri.endsWith("/auth/refresh");
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static final class Window {
        final long windowStart;
        final AtomicInteger count = new AtomicInteger(0);
        Window(long windowStart) { this.windowStart = windowStart; }
    }
}
