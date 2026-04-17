export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valor);
}

export function sanitizePhone(input: string): string {
  return input.replace(/\D/g, "");
}

export function criarMensagemWhatsApp(data: {
  nome: string;
  endereco: string;
  telefone: string;
  modeloCarro: string;
}): string {
  return `Novo agendamento Farolfix:

Nome: ${data.nome}
Endereço: ${data.endereco}
Telefone: ${data.telefone}
Carro: ${data.modeloCarro}`;
}

export function percentualConversao(acessos: number, agendamentos: number): number {
  if (acessos === 0) return 0;
  return Number(((agendamentos / acessos) * 100).toFixed(2));
}
