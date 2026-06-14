/*
 * Antecedencia0DiasPolicy.java
 *
 * Política de cancelamento para voos com menos de 2 dias de antecedência.
 * Nenhum valor é reembolsado.
 */

package com.decolar.sistema_voos.policy;
import java.math.BigDecimal;

public class Antecedencia0DiasPolicy extends CancelPolicy {
    @Override
    protected BigDecimal getPercentualReembolso() {
        return BigDecimal.ZERO;
    }
    @Override
    protected String getDescricao() {
        return "Cancelamento com menos de 2 dias de antecedência: sem reembolso.";
    }
}