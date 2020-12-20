const entrada = require('readline-sync')
const fs = require('fs')


//Função para escrever dados nos arquivos
function escreveArquivo(arquivo, dados){
    fs.writeFileSync(`./contas/0001-${arquivo}.txt`, JSON.stringify(dados)),(err) => {
        if(err) console.log(err)
    }
}

function lerArquivo(arquivo){
    let data = JSON.parse(fs.readFileSync(`./contas/0001-${arquivo}.txt`))
    return data
}

//Função utilizada para criar uma nova conta bancaria
function abrirConta(){
    let numConta = Math.round(Math.random()*10000)
    let nome = entrada.question("Digite seu nome completo: ")
    let dataNasc = entrada.question("Digite sua data de nascimento: ")
    let cpf = parseInt(entrada.question("Digite o numero do seu CPF: "))
    let senha = parseInt(entrada.question("Digite uma senha numérica de 6 digitos: "))

    let dados = [{
        conta: numConta,
        nome: nome,
        datanasc: dataNasc,
        cpf: cpf,
        senha: senha
    },[]]
    // Trecho pra validar se o arquivos(conta) já existe para evitar erros de escrita no diretório
    const diretorio = fs.readdirSync('./contas')
    let verificaConta = `0001-${numConta}.txt`
    if (diretorio.includes (verificaConta)){
        let dados = {
        //Cria um novo numero de conta para inserir no diretório
        ...dados, conta: "0001-"+Math.round(Math.random()*10000)+".txt"
        }
        escreveArquivo(numConta, dados)
    } else {
        escreveArquivo(numConta, dados)
    }
    
    console.log(`Sua conta ${numConta}, foi criada com sucesso. Obrigado por utilizar nossos serviços`)
}


function alterarSenha(conta){
    //let numConta = entrada.question("Digite o numero da conta: ")
    const dados = lerArquivo(conta)
    let senhaAtual = parseInt(entrada.question("Digite sua senha atual: "))
        if(senhaAtual === dados[0].senha){
            let novaSenha = parseInt(entrada.question(`Digite a nova senha: `))
            let alterar = [{...dados[0], senha: novaSenha}]
            escreveArquivo(conta, alterar)
            console.log("Dados alterados com sucesso")
        } else {
            console.log(dados.senha)
            console.log(senhaAtual)
            console.log("Senha incorreta, comece novamente.")
            alterarSenha()
        }
}

function realizarDeposito(conta, valor){
    let consultaConta = lerArquivo(conta)
    let valorDeposito = valor || parseFloat(entrada.question("Digite o valor depositado: "))
    let dadosDeposito = {
        transacao: "deposito",
        valor: valorDeposito
    }
    consultaConta[1].push(dadosDeposito)
    escreveArquivo(conta,consultaConta)
}

function realizarRetirada(conta, valor){
    let consultaConta = lerArquivo(conta)
    let valorRetirada = valor || parseFloat(entrada.question("Digite o valor para sacar: "))
    let dadosRetirada = {
        transacao: "saque",
        valor: -valorRetirada
    }
    consultaConta[1].push(dadosRetirada)
    escreveArquivo(conta,consultaConta)
}

function realizarTransferencia(conta){
    let saldo = consultarExtrato(conta).valor
    console.log(saldo)
    const valorSaida = parseFloat(entrada.question("Digite o valor que será transferido: "))
    if(valorSaida > saldo){
        console.log("Desculpe, seu saldo é insuficiente.")
    } else {
        const contaDestino = entrada.question("Digite o número da conta de destino: ")
        realizarRetirada(conta, valorSaida)
        realizarDeposito(contaDestino, valorSaida)
    }
}

function consultarExtrato(conta){
    let consultaConta = lerArquivo(conta)
    //console.log(consultaConta[1])
    const extrato = consultaConta[1].reduce((saldoFinal, valorTransacao) => {
        return saldoFinal = saldoFinal + valorTransacao.valor
    },0)
    //console.log(`\nSeu saldo atual é de: ${extrato}`)
    return {historico: consultaConta[1], valor: extrato}
}


function menuInicial(){
    console.log(`
    Olá, bem vindo ao Banco do Código.

    Você já é nosso cliente?
    `)
    let opcaoInicial = entrada.question("Digite s para sim ou n para não: ").toLocaleLowerCase()
    if(opcaoInicial === 's'){
        let conta = entrada.question("Digite o número da sua conta: ")
        const dados = lerArquivo(conta)
        console.log(`\nOlá ${dados[0].nome}`)

        let option

        while (option !=0) {
            console.log(`

            Escolha uma das opções abaixo:

            1 - Consultar Saldo
            2 - Fazer um depósito
            3 - Realizar um saque
            4 - Realizar uma tranferência
            5 - Solicitar empréstimo
            6 - Gerente (temporário)
            7 - Alterar senha
            9 - Encerrar a conta
            0 - Finalizar sessão.
            `)
            option = entrada.question("Digite a opção desejada: ")
            if(option === '1'){
                let consultaSaldo = Math.round((consultarExtrato(conta).valor),2)
                console.log(`\nSeu saldo atual é de ${consultaSaldo}`)
            }
            else if(option === '2') {
                realizarDeposito(conta)
            }
            else if(option === '3') {
                realizarRetirada(conta)
            }
            else if(option === '4') {
                realizarTransferencia(conta)
            }
            else if(option === '6'){
                let diretorio = fs.readdirSync('./contas')
                let diretorioFuncao = diretorio.map((x) => {
                    let split1 = x.split('-')
                    let split2 = split1[1].split('.')
                    return split2[0]
                })
                let clientes = diretorioFuncao.map((x) => {
                    let listaClientes =  lerArquivo(x)
                    return {nome: listaClientes[0].nome, conta: listaClientes[0].conta}
                })
                console.log('\n')
                for(let i in clientes){
                    console.log(`Cliente: ${clientes[i].nome}, Conta: ${clientes[i].conta}`)
                }
            }
            else if(option === '7'){
                alterarSenha(conta)
            }
            else if(option === '3'){
                let conta = entrada.question("Digite um numer de conta para verificar: ")
                teste(conta)
            }
        } 

        } else {
            console.log(`
                Vamos abrir uma conta então.
            `)
            abrirConta()
    }
}

menuInicial()