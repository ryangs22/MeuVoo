package com.decolar.sistema_voos.dto;

import java.math.BigDecimal;

public class ReembolsoResult {
    private final BigDecimal valorReembolso;
    private final String descricao;
    private final BigDecimal percentual;

    public ReembolsoResult(BigDecimal valorReembolso, String descricao, BigDecimal percentual) {
        this.valorReembolso = valorReembolso;
        this.descricao = descricao;
        this.percentual = percentual;
    }

    public BigDecimal getValorReembolso() { return valorReembolso; }
    public String getDescricao() { return descricao; }
    public BigDecimal getPercentual() { return percentual; }
}