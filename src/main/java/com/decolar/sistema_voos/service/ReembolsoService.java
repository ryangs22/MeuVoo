/*
 * ReembolsoService.java
 *
 * Serviço responsável pelo cálculo de reembolso em caso de cancelamento.
 * Agora utiliza o padrão TEMPLATE METHOD delegado na hierarquia de CancelPolicy.
 */

package com.decolar.sistema_voos.service;

// 1. IMPORTANTE: Nova importação do DTO que criamos na pasta dto
import com.decolar.sistema_voos.dto.ReembolsoResult;
import com.decolar.sistema_voos.policy.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class ReembolsoService {

    /**
     * Determina a política de cancelamento adequada com base na data do voo.
     * POLIMORFISMO: retorna uma referência de CancelPolicy (superclasse), mas a instância
     * concreta varia conforme a regra de negócio.
     */
    public CancelPolicy determinarPolitica(LocalDate dataVoo) {
        LocalDate hoje = LocalDate.now();
        long diasAteVoo = ChronoUnit.DAYS.between(hoje, dataVoo);

        if (dataVoo.isBefore(hoje)) {
            return new VooJaOcorridoPolicy();
        } else if (diasAteVoo >= 7) {
            return new Antecedencia7DiasPolicy();
        } else if (diasAteVoo >= 2) {
            return new Antecedencia2DiasPolicy();
        } else {
            return new Antecedencia0DiasPolicy();
        }
    }

    /**
     * Calcula o valor do reembolso aplicando a política determinada.
     * TEMPLATE METHOD: Delega a execução para a "receita de bolo" definida em CancelPolicy.
     */
    public ReembolsoResult calcularReembolso(LocalDate dataVoo, BigDecimal valorTotal) {
        CancelPolicy politica = determinarPolitica(dataVoo);

        // Executa a regra do Template Method para obter o cálculo
        ReembolsoResult resultado = politica.processarCancelamento(valorTotal);

        // =========================================================================
        // PLUG DO ADAPTER DE REEMBOLSO (BANCO LEGADO) AQUI
        // Se o cálculo resultou em algum valor maior que zero para devolver,
        // nós acionamos o adaptador para fingir a transferência bancária externa.
        // =========================================================================
        if (resultado.getValorReembolso() != null && resultado.getValorReembolso().compareTo(BigDecimal.ZERO) > 0) {

            com.decolar.sistema_voos.adapter.ProvedorPagamento provedorBancario =
                    new com.decolar.sistema_voos.adapter.BancoLegadoAdapter();

            // Simula uma conta corrente fictícia de destino do passageiro
            String contaClienteFicticia = "CC-99432-8";

            // O adaptador faz a mágica de traduzir e enviar para o banco legado
            provedorBancario.enviarEstorno(resultado.getValorReembolso(), contaClienteFicticia);
        }

        return resultado;
    }
    // A antiga classe interna 'static class ReembolsoResult' FOI REMOVIDA daqui,
    // pois agora ela é um arquivo separado dentro da pasta 'dto'.
}