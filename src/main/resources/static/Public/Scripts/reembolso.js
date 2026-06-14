/*
 * reembolso.js
 *
 * Lógica da página de simulação de reembolso. Recebe o localizador da reserva,
 * consulta o backend para calcular o valor estimado de reembolso com base nas
 * políticas de cancelamento (polimorfismo no backend) e permite confirmar o
 * cancelamento da reserva.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // ---------- OBTENÇÃO DO LOCALIZADOR DA URL ----------
    const urlParams = new URLSearchParams(window.location.search);
    const localizador = urlParams.get('localizador');
    if (!localizador) {
        alert('Localizador não informado.');
        window.location.href = 'minhas-viagens.html';
        return;
    }

    // ---------- VERIFICAÇÃO DE AUTENTICAÇÃO ----------
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioMeuVoo'));
    if (!usuarioLogado) {
        alert('Faça login para acessar o simulador.');
        window.location.href = 'login.html';
        return;
    }

    // ---------- CARREGAMENTO DO HISTÓRICO E BUSCA DA RESERVA ----------
    const chaveHistorico = `historicoReservas_${usuarioLogado.id}`;
    const historico = JSON.parse(localStorage.getItem(chaveHistorico)) || [];
    const reserva = historico.find(r => r.localizador === localizador);
    if (!reserva) {
        alert('Reserva não encontrada.');
        window.location.href = 'minhas-viagens.html';
        return;
    }

    if (reserva.status !== 'Confirmada') {
        alert('Esta reserva não está mais confirmada e não pode ser reembolsada.');
        window.location.href = 'minhas-viagens.html';
        return;
    }

    // ---------- MAPEAMENTO DE CIDADES ----------
    const siglaParaCidade = {
        'GRU': 'São Paulo', 'CGH': 'São Paulo (Congonhas)', 'GIG': 'Rio de Janeiro',
        'BSB': 'Brasília', 'SSA': 'Salvador', 'REC': 'Recife', 'FOR': 'Fortaleza',
        'CNF': 'Belo Horizonte', 'CWB': 'Curitiba', 'POA': 'Porto Alegre',
        'MAO': 'Manaus', 'SCL': 'Santiago', 'EZE': 'Buenos Aires', 'MIA': 'Miami',
        'JFK': 'Nova York', 'LIS': 'Lisboa', 'LHR': 'Londres', 'CDG': 'Paris'
    };
    const obterNomeCidade = sigla => siglaParaCidade[sigla] || sigla;

    // ---------- EXIBIÇÃO DOS DETALHES DA RESERVA ----------
    const detalhesDiv = document.getElementById('detalhesReserva');
    detalhesDiv.innerHTML = `
        <h3>Reserva ${reserva.localizador}</h3>
        <p><strong>${obterNomeCidade(reserva.from)} → ${obterNomeCidade(reserva.to)}</strong><br>
        ${new Date(reserva.date).toLocaleDateString('pt-BR')} • ${reserva.airline} • ${reserva.flightClass === 'ECONOMICA' ? 'Econômica' : 'Executiva'}<br>
        Valor total pago: ${reserva.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
    `;

    // ALTERAÇÃO AQUI: Base URL dinâmica para o cálculo do reembolso (Local vs Render)
    const baseUrlReembolso = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8080'
        : '';

    // ---------- CONSULTA À API DE REEMBOLSO (POLIMORFISMO NO BACKEND) ----------
    try {
        const response = await fetch(`${baseUrlReembolso}/api/reembolso/calcular?dataVoo=${reserva.date}&valorTotal=${reserva.totalPrice}`);
        if (!response.ok) throw new Error('Erro ao calcular reembolso');
        const data = await response.json();

        document.getElementById('valorReembolso').textContent = data.valorReembolso.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById('detalheCalculo').textContent = `${data.descricao} (${(data.percentual * 100).toFixed(0)}% do valor total)`;
        document.getElementById('simulacaoReembolso').style.display = 'block';
    } catch (error) {
        console.error(error);
        alert('Erro ao calcular reembolso. Tente novamente.');
    }

    // ---------- CANCELAR OPERAÇÃO ----------
    document.getElementById('btnCancelarReembolso').addEventListener('click', () => {
        window.location.href = 'minhas-viagens.html';
    });

    // ---------- CONFIRMAR CANCELAMENTO E REEMBOLSO ----------
    document.getElementById('btnConfirmarReembolso').addEventListener('click', () => {
        if (confirm(`Confirmar cancelamento e reembolso?`)) {
            reserva.status = 'Cancelada';
            localStorage.setItem(chaveHistorico, JSON.stringify(historico));
            alert('Reserva cancelada com sucesso. O valor será estornado em até 7 dias úteis.');
            window.location.href = 'minhas-viagens.html';
        }
    });
});