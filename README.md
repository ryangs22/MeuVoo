# ✈️ MeuVoo – Sistema de Passagens Aéreas

Sistema completo para busca, reserva e gestão de passagens aéreas, desenvolvido como projeto da disciplina de **Projeto de Software**.

Site: https://meuvoo.onrender.com/

## 🛠️ Tecnologias Utilizadas

- **Backend:** Java 25 + Spring Boot 3 + Spring Data JPA
- **Banco de Dados:** PostgreSQL
- **Frontend:** HTML5, CSS3, JavaScript (ES6) puro
- **Gerenciador de dependências:** Maven (wrapper incluso)
- **Deploy:** Render

## 📋 Pré‑requisitos

| Ferramenta | Versão Mínima | Onde Baixar |
|------------|---------------|-------------|
| IDE Java   | Qualquer uma  | IntelliJ IDEA (recomendado), Eclipse, VS Code |

> ✅ **O projeto já contém o Java embutido na IDE?**  
> Não, mas ao abrir o projeto no **IntelliJ IDEA**, a IDE automaticamente reconhece e baixa o JDK 25 necessário (ou usa um já configurado). Nenhuma instalação manual de Java é necessária se você estiver usando uma IDE moderna.

## 🚀 Como Executar o Projeto

A maneira mais simples é abrir o projeto no **IntelliJ IDEA**.

### 🔹 Passo a passo (IntelliJ IDEA)

1. **Abra o IntelliJ IDEA**.
   
2. **Crie uma pasta vazia** no seu computador (ex: `MeuVoo`).]
   
3. **Abra essa pasta no terminal** (clique com botão direito dentro da pasta e selecione "Abrir no Terminal" ou "Git Bash Here").
   
4. **Clone o repositório** com o comando:
   
   ```bash
   git clone https://github.com/iancarlosct/MeuVoo_PS
   
5. **Aguarde o IntelliJ carregar o projeto e baixar as dependências automaticamente** (isso pode levar alguns minutos).

6. Navegue até o arquivo: `src/main/java/com/decolar/sistema_voos/SistemaVoosApplication.java`

7. Clique com o botão direito sobre esse arquivo e selecione `Run 'SistemaVoosApplication main()'`.

8. Aparecerá um console com o servidor rodando. Por fim, será aberto automaticamente o navegador com a página inicial da aplicação.

### 🔹 Acesso Manual

Caso o navegador não abra automaticamente, navegue até `src\main\resources\static\index.html`, clique o o "botão direito" e selecione `Open in: Browser` (Google Chrome recomendado)

## ✨ Funcionalidades Implementadas

1. **Busca de Voos por Rota** – Pesquisa de passagens informando origem, destino e data, com fallback automático para datas próximas quando não há resultados exatos.
2. **Busca por Orçamento** – Ferramenta de recomendação onde o usuário informa apenas o valor máximo que deseja gastar e o sistema sugere até três destinos diferentes.
3. **Autenticação e Perfil de Usuário** – Cadastro e login com validação de e‑mail, CPF e senha com hash SHA‑256. A sessão é gerenciada dinamicamente no cabeçalho.
4. **Carrinho de Compras** – Adição de múltiplos voos com cálculo automático do total, incluindo taxas.
5. **Seleção de Assentos** – Mapa visual interativo das poltronas do avião, com escolha individual por passageiro e verificação de disponibilidade.
6. **Gestão de Bagagens** – Adição de franquias de 15kg e 23kg por passageiro, com recálculo instantâneo do preço final da reserva.
7. **Solicitações Especiais** – Registro de necessidades de acessibilidade e restrições alimentares para cada passageiro.
8. **Painel Minhas Viagens** – Histórico completo de reservas do usuário, com status, localizador e ações como check‑in, simulação de reembolso e cancelamento.
9. **Check‑in Online** – Confirmação de presença no voo e geração de cartão de embarque visual para todos os passageiros.
10. **Simulador de Reembolso** – Cálculo automático do valor a ser devolvido em caso de cancelamento, baseado em políticas de antecedência (90%, 50% ou 0%).

## 🧬 Orientação a Objetos no Projeto

O projeto foi estruturado para demonstrar de forma clara e aplicada os quatro pilares da **Orientação a Objetos**:

### 🔒 Encapsulamento
- **Onde está:** Em todas as entidades JPA (`Flight`, `Seat`, `User`) e nas classes de política (`CancelPolicy` e subclasses).
- **Exemplo:** Atributos privados com getters e setters públicos (`private String from; public String getFrom()`).

### 🎭 Abstração
- **Onde está:** Na classe abstrata `CancelPolicy`.
- **Exemplo:** Define os métodos `getPercentualReembolso()` e `getDescricao()` sem implementá‑los, forçando as subclasses a fornecerem a lógica concreta.

### 🧬 Herança
- **Onde está:** Na hierarquia de políticas de cancelamento.
- **Exemplo:** `Antecedencia7DiasPolicy`, `Antecedencia2DiasPolicy`, `Antecedencia0DiasPolicy` e `VooJaOcorridoPolicy` herdam de `CancelPolicy`, reutilizando sua estrutura.

### 🔄 Polimorfismo
- **Onde está:** No serviço `ReembolsoService` e no frontend (`carrinho.js`).
- **Exemplo no backend:** O método `determinarPolitica()` retorna uma referência de `CancelPolicy`, mas o objeto real é uma das subclasses. A chamada `politica.getPercentualReembolso()` executa o método da subclasse correta.
- **Exemplo no frontend:** O objeto `acoesCarrinho` mapeia diferentes ações (assentos, bagagens, solicitações) para funções que são chamadas de forma polimórfica.

## Padrões de Projeto Implementados

### Padrão Builder (Criacional):
- **Problema:** Um Voo contém vários atributos (id, origem, destino, data, classe do voo, quantidade de assentos para aquele voo específico). Assim, usando um construtor tradicional, o `new Flight()` conteria parâmetros extensos podendo causar inversão dos dados (principalmente dos atributos origem e destino, que são 2 strings idênticas, ou seja, ao invés (em caso de erro de atribuição) de um voo ter o trajeto X -> Y, ele seria Y -> X). Outro procedimento seria usando `voo.setMetodo()`, porém isso quebraria o encapsulamento, deixando o código muito verboso.
- **Criação do Padrão:** Dentro do arquivo `Flight.java`, criamos a classe interna `FlightBuilder`. Assim cada método altera o atributo específico com um `return this`. O método final `build` valida e entrega o objeto pronto (passa o builder para o construtor privado de Flight).
- **Onde é chamado:** Dentro do `FlightService` no método `populateSampleData`

### Padrão Template Method (Comportamental):
- **Problema:** Na política de cancelamento e reembolso, a depender da quantidade de dias, o cliente tem uma porcentagem X, Y ou Z de reembolso. Como o procedimento de reembolso é idêntico (calcula os dias, aplica a porcentagem, força o arredondamento, gera o texto e envelopa tudo num DTO pro front-end) para todas as situações, se eu não utilizasse o padrão, poderia acontecer 2 coisas: O `reembolsoService` teria blocos enormes de if/else ou então teria classes separadas duplicando as fórmulas de cálculo em todas elas.
- **Criação do Padrão:** Dentro do arquivo `CancelPolicy.java`, criamos a classe abstrata `CancelPolicy`. O método `processarCancelamento` é marcado como `final` para impedir a alteração da ordem dos passos financeiros (dita a regra a ser seguida, mas deixa ganchos abstratos `getPercentualReembolso` e `getDescricao` para as regras específicas implementarem. Assim, os arquivos de política de cancelamento contém as subclasses que são obrigadas a responder as primitivas `getPercentualReembolso()` e `getDescricao()`
- **Onde é chamado:** Dentro do `reembolsoService`, ele retorna a filha polimorficamente e roda o Template Method

### Padrão Adapter (Estrutural):
- **Problema:** O sistema de Voos precisa 'dialogar' com sistemas externos, como o de validação do CPF (sistema do governo) e o de processamento do reembolso (banco monetário). Como ambos utilizam interfaces antigas, as APIs exigem um certo formato de String definida para verificação e aprovação dos dados. Assim, se eu colocasse uma formatação errada de String dentro do `AuthService` ou do `ReembolsoService`, haveria incommpatibilidade entre as estruturas pré-definidas.
- **Criação do Padrão:** Dentro da pasta `Adapter`, criamos 2 interfaces (uma para o Validador de CPF e outra para o Banco: `ValidadorDocumento` e `ProvedorPagamento`). Ambas injetam as APIs, tratam os dados formatando para o estilo esperado (tradução) e com isso chamamos os sistemas deles.
- **Onde é chamado:** Dentro do `AuthService` (para validar o CPF) e `reembolsoService` (adaptador de pagamentos).

### Relatório:
- O relatório contendo as 10 avaliações reais a respeito do site estão no arquivo `RELATÓRIO PROJETO DE SOFTWARE.pdf`

## 📞 Suporte

Em caso de dúvidas, entre em contato com o desenvolvedor:  

**Ian Tenório**:

[iancarlosct@gmail.com] - Pessoal

[icct@ic.ufal.br] - Acadêmico
