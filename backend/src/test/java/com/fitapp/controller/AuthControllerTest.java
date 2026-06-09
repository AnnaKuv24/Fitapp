package com.fitapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitapp.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper mapper;
    @Autowired private UserRepository userRepo;

    @Test
    void registerThenLogin_persistsGoalAndReturnsTokens() throws Exception {
        var registerBody = Map.of(
            "name", "Test User",
            "email", "test.user@example.com",
            "password", "password123",
            "goal", "MUSCLE_GAIN"
        );

        mvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(registerBody)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.user.email").value("test.user@example.com"))
            .andExpect(jsonPath("$.user.goal").value("MUSCLE_GAIN"));

        var savedUser = userRepo.findByEmail("test.user@example.com").orElseThrow();
        assertThat(savedUser.getGoal()).isEqualTo(com.fitapp.model.User.Goal.MUSCLE_GAIN);

        var loginBody = Map.of("email", "test.user@example.com", "password", "password123");
        mvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(loginBody)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.user.goal").value("MUSCLE_GAIN"));
    }

    @Test
    void register_rejectsDuplicateEmail() throws Exception {
        var body = Map.of(
            "name", "Dup User",
            "email", "dup.user@example.com",
            "password", "password123"
        );

        mvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isCreated());

        mvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void login_rejectsWrongPassword() throws Exception {
        var body = Map.of(
            "name", "Wrong Pass",
            "email", "wrong.pass@example.com",
            "password", "password123"
        );
        mvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isCreated());

        var loginBody = Map.of("email", "wrong.pass@example.com", "password", "wrongpassword");
        mvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(loginBody)))
            .andExpect(status().isUnauthorized());
    }
}
