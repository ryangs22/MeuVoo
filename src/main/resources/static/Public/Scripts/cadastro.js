/*
 * cadastro.js
 *
 * Lógica da página de cadastro de novo usuário. Captura os dados do formulário,
 * valida a confirmação de senha e envia a requisição para o endpoint de registro.
 * Em caso de sucesso, redireciona para a página de login.
 */

document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // ---------- CAPTURA DOS DADOS DO FORMULÁRIO ----------
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const cpf = document.getElementById('cpf').value.replace(/\D/g, ''); // Remove caracteres não numéricos
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const mensagemDiv = document.getElementById('mensagem');

    // ---------- VALIDAÇÃO DE SENHA ----------
    if (password !== confirmPassword) {
        mensagemDiv.textContent = 'As senhas não coincidem.';
        return;
    }

    // ALTERAÇÃO AQUI: Endpoint dinâmico para rodar localmente ou no Render automaticamente
    const urlCadastro = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8080/api/auth/register'
        : '/api/auth/register';

    // ---------- ENVIO DA REQUISIÇÃO PARA O BACKEND ----------
    try {
        const response = await fetch(urlCadastro, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, cpf, password })
        });

        if (response.ok) {
            alert('Cadastro realizado com sucesso! Faça login.');
            window.location.href = 'login.html';
        } else {
            const erro = await response.text();
            mensagemDiv.textContent = erro || 'Erro ao cadastrar.';
        }
    } catch (error) {
        mensagemDiv.textContent = 'Erro de conexão. Tente novamente.';
    }
});