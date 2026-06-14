/*
 * Antecedencia7DiasPolicy.java
 *
 * Política de cancelamento para voos com antecedência igual ou superior a 7 dias.
 * O passageiro tem direito a 90% de reembolso do valor total.
 */

package com.decolar.sistema_voos.policy;
import java.math.BigDecimal;

public class Antecedencia7DiasPolicy extends CancelPolicy {
    @Override
    protected BigDecimal getPercentualReembolso() {
        return new BigDecimal("0.90");
    }
    @Override
    protected String getDescricao() {
        return "Cancelamento com mais de 7 dias de antecedência: 90% de reembolso.";
    }
}