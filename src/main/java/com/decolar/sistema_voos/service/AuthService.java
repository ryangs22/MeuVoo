/*
 * AuthService.java
 *
 * Serviço responsável pela lógica de autenticação e cadastro de usuários.
 * Realiza validações de unicidade de e‑mail e CPF, aplica hash SHA‑256 nas senhas
 * e retorna os dados públicos do usuário em caso de sucesso.
 */

package com.decolar.sistema_voos.service;

import com.decolar.sistema_voos.dto.LoginRequest;
import com.decolar.sistema_voos.dto.RegisterRequest;
import com.decolar.sistema_voos.dto.UserResponse;
import com.decolar.sistema_voos.entity.User;
import com.decolar.sistema_voos.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Gera um hash SHA-256 da senha codificado em Base64.
     */
    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erro ao gerar hash da senha.", e);
        }
    }

    /**
     * Verifica se a senha fornecida corresponde ao hash armazenado.
     */
    private boolean verifyPassword(String rawPassword, String storedHash) {
        String hashed = hashPassword(rawPassword);
        return hashed.equals(storedHash);
    }

    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("E-mail já cadastrado.");
        }
        if (userRepository.existsByCpf(request.getCpf())) {
            throw new RuntimeException("CPF já cadastrado.");
        }

        // =========================================================================
        // PLUG DO ADAPTER DO CPF (RECEITA FEDERAL) AQUI
        // Validamos o CPF do novo usuário no sistema externo antes de salvar
        // =========================================================================
        com.decolar.sistema_voos.adapter.ValidadorDocumento validadorCpf =
                new com.decolar.sistema_voos.adapter.ReceitaFederalAdapter();

        boolean isCpfValidoNaReceita = validadorCpf.verificarDocumento(request.getCpf());

        if (!isCpfValidoNaReceita) {
            // Se o adapter retornasse false, nós barraríamos o cadastro aqui
            throw new RuntimeException("CPF inválido perante a Receita Federal.");
        }

        System.out.println(">>> [Sistema] CPF verificado e aprovado pelo Adapter da Receita Federal!");
        // =========================================================================

        User user = new User();
        user.setNome(request.getNome());
        user.setEmail(request.getEmail());
        user.setCpf(request.getCpf());
        user.setPassword(hashPassword(request.getPassword()));

        user = userRepository.save(user);
        return new UserResponse(user.getId(), user.getNome(), user.getEmail());
    }

    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Credenciais inválidas."));

        if (!verifyPassword(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Credenciais inválidas.");
        }
        return new UserResponse(user.getId(), user.getNome(), user.getEmail());
    }
}