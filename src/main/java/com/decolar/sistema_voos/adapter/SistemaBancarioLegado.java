package com.decolar.sistema_voos.adapter;

public class SistemaBancarioLegado {
    // O banco antigo exige uma String única com um formato rígido separado por ponto e vírgula
    public void executarTransferenciaAntiga(String dadosFormatados) {
        System.out.println("\n>>> [ADAPTER REEMBOLSO] Conectando ao Banco Legado...");
        System.out.println(">>> [BANCO LEGADO] Lendo string de dados: \"" + dadosFormatados + "\"");
        System.out.println(">>> [BANCO LEGADO] Transferência realizada com sucesso para o cliente!");
    }
}