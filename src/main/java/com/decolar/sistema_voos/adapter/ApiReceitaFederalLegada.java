package com.decolar.sistema_voos.adapter;

public class ApiReceitaFederalLegada {
    // A API do governo é antiga, exige um formato "CPF=12345678900" e retorna o código 0 para VÁLIDO
    public int consultarCpfNaBaseGovernamental(String parametroChaveValor) {
        System.out.println("\n>>> [ADAPTER CPF] Consultando API da Receita Federal...");
        System.out.println(">>> [RECEITA FEDERAL] Requisição recebida: \"" + parametroChaveValor + "\"");

        // Simulação: se não estiver vazio, consideramos válido e retornamos 0
        return 0;
    }
}