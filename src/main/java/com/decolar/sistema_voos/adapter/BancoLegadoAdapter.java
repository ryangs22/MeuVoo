package com.decolar.sistema_voos.adapter;

import java.math.BigDecimal;

public class BancoLegadoAdapter implements ProvedorPagamento {

    private SistemaBancarioLegado bancoLegado = new SistemaBancarioLegado();

    @Override
    public boolean enviarEstorno(BigDecimal valor, String contaDestino) {
        // Traduz o formato moderno (BigDecimal, String) para a String "VALOR;CONTA" que o banco velho exige
        String textoFormatadoProBanco = valor.toString() + ";" + contaDestino;

        // Envia para o sistema antigo
        bancoLegado.executarTransferenciaAntiga(textoFormatadoProBanco);

        return true;
    }
}