/*
 * Antecedencia2DiasPolicy.java
 *
 * Política de cancelamento para voos com antecedência entre 2 e 6 dias.
 * O passageiro tem direito a 50% de reembolso do valor total.
 */

package com.decolar.sistema_voos.policy;
import java.math.BigDecimal;

public class Antecedencia2DiasPolicy extends CancelPolicy {
    @Override
    protected BigDecimal getPercentualReembolso() {
        return new BigDecimal("0.50");
    }
    @Override
    protected String getDescricao() {
        return "Cancelamento entre 2 e 7 dias de antecedência: 50% de reembolso.";
    }
}