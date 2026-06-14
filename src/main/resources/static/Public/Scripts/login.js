/*
 * login.js
 *
 * Lógica da página de login. Captura as credenciais do usuário, envia para o
 * endpoint de autenticação e, em caso de sucesso, armazena os dados do usuário
 * no localStorage e redireciona para a página inicial.
 */

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // ---------- CAPTURA DOS DADOS DO FORMULÁRIO ----------
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const mensagemDiv = document.getElementById('mensagem');

    const urlLogin = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8080/api/auth/login'
        : '/api/auth/login';

    // ---------- ENVIO DA REQUISIÇÃO PARA O BACKEND ----------
    try {
        const response = await fetch(urlLogin, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('usuarioMeuVoo', JSON.stringify(data));
            window.location.href = '../index.html';
        } else {
            const erro = await response.text();
            mensagemDiv.textContent = erro || 'Credenciais inválidas.';
        }
    } catch (error) {
        mensagemDiv.textContent = 'Erro de conexão. Tente novamente.';
    }
});