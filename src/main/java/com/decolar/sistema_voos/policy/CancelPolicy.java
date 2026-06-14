/*
 * CancelPolicy.java
 *
 * Classe abstrata que define o contrato para políticas de cancelamento.
 * Cada subclasse concreta implementa o percentual de reembolso e uma
 * descrição legível da regra aplicada (ex.: "90% de reembolso").
 */

package com.decolar.sistema_voos.policy;

import com.decolar.sistema_voos.dto.ReembolsoResult;
import java.math.BigDecimal;
import java.math.RoundingMode;

public abstract class CancelPolicy {

    // ==========================================================
    // TEMPLATE METHOD: A "receita de bolo" do cancelamento.
    // O 'final' impede que as subclasses alterem este esqueleto.
    // ==========================================================
    public final ReembolsoResult processarCancelamento(BigDecimal valorTotal) {
        // Passo 1: Obter a porcentagem de multa (definido pelas filhas)
        BigDecimal percentual = getPercentualReembolso();

        // Passo 2: Calcular o valor final (regra comum)
        BigDecimal valorReembolso = valorTotal.multiply(percentual).setScale(2, RoundingMode.HALF_UP);

        // Passo 3: Obter a descrição da regra (definido pelas filhas)
        String descricao = getDescricao();

        // Passo 4: Montar e devolver o comprovante/resultado (regra comum)
        return new ReembolsoResult(valorReembolso, descricao, percentual);
    }

    // Primitivas do Template Method: As filhas são OBRIGADAS a implementar.
    // Usamos 'protected' para que apenas a classe mãe e as filhas acessem.
    protected abstract BigDecimal getPercentualReembolso();

    protected abstract String getDescricao();
}