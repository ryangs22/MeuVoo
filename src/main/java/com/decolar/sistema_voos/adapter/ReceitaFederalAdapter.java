package com.decolar.sistema_voos.adapter;

public class ReceitaFederalAdapter implements ValidadorDocumento {

    private ApiReceitaFederalLegada apiReceita = new ApiReceitaFederalLegada();

    @Override
    public boolean verificarDocumento(String cpf) {
        // Limpa pontos e traços do CPF se houver
        String cpfLimpo = cpf.replaceAll("[^0-9]", "");

        // Traduz para o formato esquisito que a API da Receita exige: "CPF=12345678900"
        String payloadExigido = "CPF=" + cpfLimpo;

        // Faz a chamada no sistema antigo e captura o código de retorno
        int codigoRetorno = apiReceita.consultarCpfNaBaseGovernamental(payloadExigido);

        // Traduz o "código 0" deles para o "true" (válido) que o nosso sistema entende
        return codigoRetorno == 0;
    }
}