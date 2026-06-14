package com.decolar.sistema_voos.adapter;

import java.math.BigDecimal;

public interface ProvedorPagamento {
    boolean enviarEstorno(BigDecimal valor, String contaDestino);
}