/*
 * assentos.js
 *
 * Lógica da página de seleção de assentos. Carrega o mapa de assentos do voo
 * a partir da API, permite que o usuário escolha um lugar para cada passageiro
 * e envia a reserva temporária dos assentos selecionados ao backend.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // ---------- CONFIGURAÇÕES INICIAIS ----------
    // ALTERAÇÃO AQUI: URL Dinâmica para funcionar localmente e no Render de forma automática
    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8080/api'
        : '/api';

    // ---------- OBTENÇÃO DO ITEM DO CARRINHO ----------
    const urlParams = new URLSearchParams(window.location.search);
    const itemIndex = urlParams.get('item');
    if (itemIndex === null) {
        alert('Item não especificado.');
        window.location.href = 'carrinho.html';
        return;
    }

    const carrinho = JSON.parse(localStorage.getItem('carrinhoMeuVoo')) || [];
    const item = carrinho[parseInt(itemIndex)];
    if (!item) {
        alert('Item não encontrado no carrinho.');
        window.location.href = 'carrinho.html';
        return;
    }

    console.log('Item do carrinho:', item);

    // ---------- MAPEAMENTO DE CIDADES ----------
    const siglaParaCidade = {
        'GRU': 'São Paulo', 'CGH': 'São Paulo (Congonhas)', 'VCP': 'Campinas',
        'GIG': 'Rio de Janeiro', 'SDU': 'Rio de Janeiro (Santos Dumont)',
        'BSB': 'Brasília', 'SSA': 'Salvador', 'REC': 'Recife', 'FOR': 'Fortaleza',
        'CNF': 'Belo Horizonte', 'CWB': 'Curitiba', 'POA': 'Porto Alegre',
        'MAO': 'Manaus', 'SCL': 'Santiago', 'EZE': 'Buenos Aires', 'MIA': 'Miami',
        'JFK': 'Nova York', 'LIS': 'Lisboa', 'LHR': 'Londres', 'CDG': 'Paris'
    };
    const obterNomeCidade = (sigla) => siglaParaCidade[sigla] || sigla;

    // ---------- EXIBIÇÃO DO RESUMO DO VOO ----------
    document.getElementById('vooInfo').innerHTML = `
        <strong>${obterNomeCidade(item.from)} → ${obterNomeCidade(item.to)}</strong><br>
        ${item.date} • ${item.airline} • ${item.flightClass === 'ECONOMICA' ? 'Econômica' : 'Executiva'}
    `;

    // ---------- CRIAÇÃO DAS TABS DE PASSAGEIROS ----------
    const passageiros = item.passengers;
    let passageiroAtivo = 0;

    const tabsDiv = document.getElementById('passageirosTabs');
    passageiros.forEach((p, i) => {
        const btn = document.createElement('button');
        btn.classList.add('tab-passageiro');
        if (i === 0) btn.classList.add('ativo');
        btn.textContent = `Passageiro ${i + 1}`;
        btn.dataset.index = i;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-passageiro').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            passageiroAtivo = i;
            renderizarMapa();
        });
        tabsDiv.appendChild(btn);
    });

    // ---------- CARREGAMENTO DOS ASSENTOS VIA API ----------
    let seats = [];
    try {
        const response = await fetch(`${API_BASE}/seats/${item.flightId}`);
        if (!response.ok) throw new Error('Erro ao buscar assentos');
        seats = await response.json();
        console.log('Assentos recebidos:', seats);
    } catch (error) {
        console.error(error);
        alert('Erro ao carregar mapa de assentos. Verifique o console.');
        return;
    }

    // ---------- ESTADO DOS ASSENTOS SELECIONADOS ----------
    const assentosSelecionados = passageiros.map(p => p.seat || null);
    console.log('Assentos pré-selecionados:', assentosSelecionados);

    const mapaDiv = document.getElementById('mapaAssentos');

    // ---------- RENDERIZAÇÃO DO MAPA DE ASSENTOS ----------
    function renderizarMapa() {
        mapaDiv.innerHTML = '';
        if (seats.length === 0) {
            mapaDiv.innerHTML = '<p>Nenhum assento disponível para este voo.</p>';
            return;
        }

        // Agrupa assentos por fileira para organização visual
        const assentosPorFileira = {};
        seats.forEach(seat => {
            const numero = seat.seatNumber.match(/\d+/)[0];
            if (!assentosPorFileira[numero]) assentosPorFileira[numero] = [];
            assentosPorFileira[numero].push(seat);
        });

        const fileiras = Object.keys(assentosPorFileira).sort((a, b) => parseInt(a) - parseInt(b));

        fileiras.forEach(fileira => {
            const assentosFileira = assentosPorFileira[fileira].sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));
            assentosFileira.forEach(seat => {
                const seatDiv = document.createElement('div');
                seatDiv.classList.add('assento');
                seatDiv.textContent = seat.seatNumber;

                // Define a classe CSS conforme o estado do assento
                if (!seat.available) {
                    seatDiv.classList.add('ocupado');
                } else {
                    seatDiv.classList.add('disponivel');
                }

                // Destaca o assento selecionado pelo passageiro ativo
                if (assentosSelecionados[passageiroAtivo] === seat.seatNumber) {
                    seatDiv.classList.add('selecionado');
                    seatDiv.classList.remove('disponivel');
                }

                // Destaca se o assento foi escolhido por outro passageiro
                const outroIdx = assentosSelecionados.findIndex(s => s === seat.seatNumber);
                if (outroIdx !== -1 && outroIdx !== passageiroAtivo) {
                    seatDiv.classList.add('selecionado-outro');
                    seatDiv.classList.remove('disponivel');
                }

                // Lógica de seleção de assento
                seatDiv.addEventListener('click', () => {
                    if (!seat.available) {
                        alert('Este assento já está ocupado.');
                        return;
                    }

                    const outroPassageiro = assentosSelecionados.findIndex(s => s === seat.seatNumber);
                    if (outroPassageiro !== -1 && outroPassageiro !== passageiroAtivo) {
                        alert(`Este assento já foi selecionado pelo Passageiro ${outroPassageiro + 1}.`);
                        return;
                    }

                    const anterior = assentosSelecionados[passageiroAtivo];
                    if (anterior) {
                        assentosSelecionados[passageiroAtivo] = null;
                    }

                    assentosSelecionados[passageiroAtivo] = seat.seatNumber;
                    renderizarMapa();
                });

                mapaDiv.appendChild(seatDiv);
            });
        });
    }

    renderizarMapa();

    // ---------- CONFIRMAÇÃO DOS ASSENTOS ----------
    document.getElementById('btnConfirmar').addEventListener('click', async () => {
        const faltando = assentosSelecionados.some(s => !s);
        if (faltando) {
            alert('Todos os passageiros devem ter um assento selecionado.');
            return;
        }

        const seatNumbers = assentosSelecionados.filter(s => s);
        try {
            const response = await fetch(`${API_BASE}/seats/reserve?flightId=${item.flightId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(seatNumbers)
            });
            if (response.ok) {
                item.passengers.forEach((p, i) => p.seat = assentosSelecionados[i]);
                localStorage.setItem('carrinhoMeuVoo', JSON.stringify(carrinho));
                alert('Assentos reservados com sucesso!');
                window.location.href = 'carrinho.html';
            } else {
                const msg = await response.text();
                alert('Erro ao reservar: ' + msg);
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão ao reservar assentos.');
        }
    });

    // ---------- CANCELAMENTO ----------
    document.getElementById('btnCancelar').addEventListener('click', () => {
        window.location.href = 'carrinho.html';
    });
});