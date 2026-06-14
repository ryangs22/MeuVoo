/*
 * index.js
 *
 * Lógica da página inicial de busca de passagens. Oferece dois modos de pesquisa:
 * por rota (origem/destino/data) e por orçamento (recomendação baseada em preço).
 * Gerencia a exibição dos resultados, a seleção de voos e a adição ao carrinho.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ---------- MAPEAMENTOS DE CIDADES ----------
// ---------- MAPEAMENTOS DE CIDADES ----------
    const cidadeParaSigla = {
        'são paulo': 'GRU', 'sao paulo': 'GRU', 'sp': 'GRU', 'guarulhos': 'GRU', 'congonhas': 'CGH', 'campinas': 'VCP',
        'rio de janeiro': 'GIG', 'rio': 'GIG', 'galeão': 'GIG', 'santos dumont': 'SDU',
        'brasília': 'BSB', 'brasilia': 'BSB', 'salvador': 'SSA', 'recife': 'REC', 'fortaleza': 'FOR',
        'belo horizonte': 'CNF', 'confins': 'CNF', 'pampulha': 'PLU',
        'curitiba': 'CWB', 'porto alegre': 'POA', 'manaus': 'MAO', 'maceió': 'MCZ', 'maceio': 'MCZ',
        'florianópolis': 'FLN', 'florianopolis': 'FLN', 'belém': 'BEL', 'belem': 'BEL', 'vitória': 'VIX', 'vitoria': 'VIX',
        'santiago': 'SCL', 'buenos aires': 'EZE', 'miami': 'MIA', 'nova york': 'JFK',
        'lisboa': 'LIS', 'londres': 'LHR', 'paris': 'CDG', 'lima': 'LIM', 'roma': 'FCO', 'madri': 'MAD',
        'amsterdã': 'AMS', 'amsterda': 'AMS', 'frankfurt': 'FRA', 'milão': 'MXP', 'milao': 'MXP',
        'zurique': 'ZRH', 'istambul': 'IST', 'viena': 'VIE', 'munique': 'MUC', 'atenas': 'ATH', 'barcelona': 'BCN',
        'dubai': 'DXB', 'doha': 'DOH', 'tóquio': 'NRT', 'toquio': 'NRT', 'seul': 'ICN', 'singapura': 'SIN',
        'pequim': 'PEK', 'xangai': 'PVG', 'hong kong': 'HKG', 'bangkok': 'BKK', 'nova delhi': 'DEL',
        'taipé': 'TPE', 'taipe': 'TPE', 'kuala lumpur': 'KUL'
    };

    const siglaParaCidade = {
        'GRU': 'São Paulo', 'CGH': 'São Paulo (Congonhas)', 'VCP': 'Campinas',
        'GIG': 'Rio de Janeiro', 'SDU': 'Rio de Janeiro', 'BSB': 'Brasília',
        'SSA': 'Salvador', 'REC': 'Recife', 'FOR': 'Fortaleza', 'CNF': 'Belo Horizonte',
        'PLU': 'Belo Horizonte', 'CWB': 'Curitiba', 'POA': 'Porto Alegre',
        'MAO': 'Manaus', 'MCZ': 'Maceió', 'FLN': 'Florianópolis', 'BEL': 'Belém',
        'VIX': 'Vitória', 'SCL': 'Santiago', 'EZE': 'Buenos Aires', 'MIA': 'Miami',
        'JFK': 'Nova York', 'LIS': 'Lisboa', 'LHR': 'Londres', 'CDG': 'Paris',
        'LIM': 'Lima', 'FCO': 'Roma', 'MAD': 'Madri', 'AMS': 'Amsterdã',
        'FRA': 'Frankfurt', 'MXP': 'Milão', 'ZRH': 'Zurique', 'IST': 'Istambul',
        'VIE': 'Viena', 'MUC': 'Munique', 'ATH': 'Atenas', 'BCN': 'Barcelona',
        'DXB': 'Dubai', 'DOH': 'Doha', 'NRT': 'Tóquio', 'ICN': 'Seul',
        'SIN': 'Singapura', 'PEK': 'Pequim', 'PVG': 'Xangai', 'HKG': 'Hong Kong',
        'BKK': 'Bangkok', 'DEL': 'Nova Delhi', 'TPE': 'Taipé', 'KUL': 'Kuala Lumpur'
    };

    function obterNomeCidade(sigla) {
        return siglaParaCidade[sigla] || sigla;
    }

    function converterParaSigla(valor) {
        if (!valor) return '';
        const limpo = valor.trim();
        if (/^[A-Z]{3}$/.test(limpo)) return limpo;
        const chave = limpo.toLowerCase();
        return cidadeParaSigla[chave] || '';
    }

    // ---------- ELEMENTOS DA INTERFACE ----------
    const swapBtn = document.querySelector('.swap-btn');
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    const priceFromInput = document.getElementById('priceFrom');

    // Modos de busca
    const modeBtns = document.querySelectorAll('.mode-btn');
    const routeFields = document.getElementById('routeFields');
    const priceFields = document.getElementById('priceFields');
    const searchBtn = document.getElementById('searchButton');
    const form = document.getElementById('flightSearchForm');

    // Componentes do modo Rota
    const trigger = document.getElementById('passengersTrigger');
    const dropdown = document.getElementById('passengersDropdown');
    const displaySpan = document.getElementById('passengersDisplay');
    const adultsSpan = document.getElementById('adultsCount');
    const decrementBtn = document.querySelector('[data-action="decrement"]');
    const incrementBtn = document.querySelector('[data-action="increment"]');
    const classRadios = document.querySelectorAll('input[name="flightClass"]');
    const applyBtn = document.getElementById('applyPassengers');

    // Componentes do modo Preço
    const priceTrigger = document.getElementById('pricePassengersTrigger');
    const priceDropdown = document.getElementById('pricePassengersDropdown');
    const priceDisplaySpan = document.getElementById('pricePassengersDisplay');
    const priceAdultsSpan = document.getElementById('priceAdultsCount');
    const priceDecrement = document.querySelector('[data-action="decrement-price"]');
    const priceIncrement = document.querySelector('[data-action="increment-price"]');
    const priceApply = document.getElementById('applyPricePassengers');

    // Resultados da busca
    const resultadosDiv = document.getElementById('resultadosBusca');
    const listaVoos = document.getElementById('listaVoos');
    const qtdResultados = document.getElementById('quantidadeResultados');

    // ---------- ESTADOS ----------
    let adults = 1;
    let selectedClass = 'ECONOMICA';
    let priceAdults = 1;
    let currentMode = 'route';
    let ultimosVoosExibidos = [];

    // Detecta se o site está rodando localmente ou no Render e ajusta a URL automaticamente
    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8080/api/flights'
        : '/api/flights';

    // ---------- FUNÇÕES AUXILIARES DE EXIBIÇÃO ----------
    function updateRouteDisplay() {
        const plural = adults > 1 ? 'passageiros' : 'passageiro';
        const classeExib = selectedClass === 'ECONOMICA' ? 'Econômica' : 'Executiva';
        displaySpan.textContent = `${adults} ${plural}, ${classeExib}`;
    }

    function updatePriceDisplay() {
        const plural = priceAdults > 1 ? 'adultos' : 'adulto';
        priceDisplaySpan.textContent = `${priceAdults} ${plural}`;
    }

    // ---------- INVERTER ORIGEM/DESTINO ----------
    if (swapBtn) {
        swapBtn.addEventListener('click', () => {
            const temp = fromInput.value;
            fromInput.value = toInput.value;
            toInput.value = temp;
        });
    }

    // ---------- DROPDOWN PASSAGEIROS (MODO ROTA) ----------
    if (trigger && dropdown) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
            trigger.querySelector('.arrow').style.transform = dropdown.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0)';
        });

        document.addEventListener('click', (e) => {
            if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
                trigger.querySelector('.arrow').style.transform = 'rotate(0)';
            }
        });

        decrementBtn.addEventListener('click', () => {
            if (adults > 1) adults--;
            adultsSpan.textContent = adults;
        });

        incrementBtn.addEventListener('click', () => {
            if (adults < 9) adults++;
            adultsSpan.textContent = adults;
        });

        applyBtn.addEventListener('click', () => {
            classRadios.forEach(radio => {
                if (radio.checked) {
                    selectedClass = radio.value === 'Econômica' ? 'ECONOMICA' : 'EXECUTIVA';
                }
            });
            updateRouteDisplay();
            dropdown.classList.remove('show');
            trigger.querySelector('.arrow').style.transform = 'rotate(0)';
        });

        updateRouteDisplay();
    }

    // ---------- DROPDOWN PASSAGEIROS (MODO PREÇO) ----------
    if (priceTrigger && priceDropdown) {
        priceTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            priceDropdown.classList.toggle('show');
            priceTrigger.querySelector('.arrow').style.transform = priceDropdown.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0)';
        });

        document.addEventListener('click', (e) => {
            if (!priceTrigger.contains(e.target) && !priceDropdown.contains(e.target)) {
                priceDropdown.classList.remove('show');
                priceTrigger.querySelector('.arrow').style.transform = 'rotate(0)';
            }
        });

        priceDecrement.addEventListener('click', () => {
            if (priceAdults > 1) priceAdults--;
            priceAdultsSpan.textContent = priceAdults;
        });

        priceIncrement.addEventListener('click', () => {
            if (priceAdults < 9) priceAdults++;
            priceAdultsSpan.textContent = priceAdults;
        });

        priceApply.addEventListener('click', () => {
            updatePriceDisplay();
            priceDropdown.classList.remove('show');
            priceTrigger.querySelector('.arrow').style.transform = 'rotate(0)';
        });

        updatePriceDisplay();
    }

    // ---------- ALTERNAR ENTRE MODOS DE BUSCA ----------
    function setMode(mode) {
        currentMode = mode;
        if (mode === 'route') {
            routeFields.style.display = 'flex';
            priceFields.style.display = 'none';
            searchBtn.textContent = 'Buscar voos';
            document.getElementById('maxPrice').required = false;
            if (priceFromInput) priceFromInput.required = false;
            fromInput.required = true;
            toInput.required = true;
            document.getElementById('date').required = true;
        } else {
            routeFields.style.display = 'none';
            priceFields.style.display = 'flex';
            searchBtn.textContent = 'Recomendar destinos';
            document.getElementById('maxPrice').required = true;
            if (priceFromInput) priceFromInput.required = true;
            fromInput.required = false;
            toInput.required = false;
            document.getElementById('date').required = false;
        }
        modeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) btn.classList.add('active');
        });
        resultadosDiv.style.display = 'none';
    }

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    // ---------- EXIBIÇÃO DOS RESULTADOS ----------
    function exibirVoos(voos) {
        ultimosVoosExibidos = voos;
        if (!voos || voos.length === 0) {
            qtdResultados.textContent = 'Nenhum voo encontrado';
            listaVoos.innerHTML = '<p class="sem-resultados">😕 Nenhum voo encontrado para os critérios informados.</p>';
        } else {
            qtdResultados.textContent = `${voos.length} voos encontrados`;
            let html = '';
            voos.forEach(voo => {
                const dataFormatada = new Date(voo.date).toLocaleDateString('pt-BR');
                const precoFormatado = Number(voo.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                const classeFormatada = voo.flightClass === 'ECONOMICA' ? 'Econômica' : 'Executiva';
                html += `
                    <div class="voo-card">
                        <div class="voo-info">
                            <div class="voo-rota">
                                <span class="origem">${obterNomeCidade(voo.from)}</span>
                                <span class="seta">→</span>
                                <span class="destino">${obterNomeCidade(voo.to)}</span>
                            </div>
                            <div class="voo-detalhes">
                                <span>${dataFormatada} • ${voo.departure || 'Horário não informado'}</span>
                                <span>${voo.airline} • ${classeFormatada}</span>
                            </div>
                        </div>
                        <div class="voo-preco">
                            <span class="preco">${precoFormatado} <span class="por-pessoa">/ pessoa</span></span>
                            <span class="assentos">${voo.availableSeats} assentos</span>
                        </div>
                        <button class="btn-selecionar" data-id="${voo.id}">Selecionar</button>
                    </div>
                `;
            });
            listaVoos.innerHTML = html;
        }
        resultadosDiv.style.display = 'block';
    }

    // ---------- SUBMISSÃO DO FORMULÁRIO (BUSCA) ----------
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        resultadosDiv.style.display = 'none';

        try {
            if (currentMode === 'route') {
                const fromRaw = fromInput.value.trim();
                const toRaw = toInput.value.trim();
                const date = document.getElementById('date').value;

                if (!fromRaw || !toRaw || !date) {
                    alert('Preencha origem, destino e data.');
                    return;
                }

                const fromSigla = converterParaSigla(fromRaw);
                const toSigla = converterParaSigla(toRaw);

                if (!fromSigla || !toSigla) {
                    alert('Não foi possível identificar a sigla do aeroporto. Use o nome da cidade ou a sigla IATA (ex: GRU).');
                    return;
                }

                const url = `${API_BASE}/search?from=${fromSigla}&to=${toSigla}&date=${date}&passengers=${adults}&flightClass=${selectedClass}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error('Erro na busca');
                const voos = await response.json();
                exibirVoos(voos);
            } else {
                const fromRaw = priceFromInput ? priceFromInput.value.trim() : '';
                const maxPrice = document.getElementById('maxPrice').value;

                if (!fromRaw || !maxPrice || maxPrice <= 0) {
                    alert('Preencha a cidade de origem e um valor máximo válido.');
                    return;
                }

                const fromSigla = converterParaSigla(fromRaw);
                if (!fromSigla) {
                    alert('Cidade de origem não reconhecida. Use o nome da cidade ou a sigla IATA (ex: GRU).');
                    return;
                }

                const url = `${API_BASE}/recommend?from=${fromSigla}&maxPrice=${maxPrice}&passengers=${priceAdults}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error('Erro na recomendação');
                const voos = await response.json();
                exibirVoos(voos);
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao buscar voos. Verifique se o servidor está rodando.');
        }
    });

    // ---------- ADICIONAR VOO AO CARRINHO ----------
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-selecionar');
        if (!btn) return;

        const vooId = btn.dataset.id;
        const vooSelecionado = ultimosVoosExibidos.find(v => v.id === vooId);
        if (!vooSelecionado) {
            alert('Voo não encontrado.');
            return;
        }

        let passageiros, classe;
        if (currentMode === 'route') {
            passageiros = adults;
            classe = selectedClass;
        } else {
            passageiros = priceAdults;
            classe = 'ECONOMICA';
        }

        const itemCarrinho = {
            flightId: vooSelecionado.id,
            from: vooSelecionado.from,
            to: vooSelecionado.to,
            date: vooSelecionado.date,
            departure: vooSelecionado.departure,
            airline: vooSelecionado.airline,
            flightClass: vooSelecionado.flightClass,
            basePrice: vooSelecionado.price,
            passengers: Array.from({ length: passageiros }, () => ({
                name: '',
                seat: null,
                baggage: { hand: true, checked15: false, checked23: false },
                specialRequests: []
            })),
            totalPrice: vooSelecionado.price * passageiros
        };

        let carrinho = JSON.parse(localStorage.getItem('carrinhoMeuVoo')) || [];
        carrinho.push(itemCarrinho);
        localStorage.setItem('carrinhoMeuVoo', JSON.stringify(carrinho));

        alert(`Voo ${obterNomeCidade(itemCarrinho.from)} → ${obterNomeCidade(itemCarrinho.to)} adicionado ao carrinho!`);
    });

    // ---------- CARREGAMENTO DINÂMICO DE CIDADES PARA O DATALIST ----------
    async function carregarCidades() {
        try {
            const response = await fetch(`${API_BASE}/origins`);
            const cidades = await response.json();
            const datalist = document.getElementById('cidadesList');
            datalist.innerHTML = cidades.map(cidade => `<option value="${cidade}">`).join('');
        } catch (error) {
            console.error('Erro ao carregar cidades:', error);
        }
    }

    // ---------- INICIALIZAÇÃO ----------
    setMode('route');
});