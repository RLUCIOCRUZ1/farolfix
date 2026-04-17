export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valor);
}

/** DDD padrão quando o cliente não informa (ex.: Goiás). Sobrescreva com NEXT_PUBLIC_DEFAULT_PHONE_DDD na Vercel. */
export function getDefaultPhoneDdd(): string {
  const raw =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_DEFAULT_PHONE_DDD : undefined;
  const d = (raw ?? "62").replace(/\D/g, "").slice(0, 2);
  return d.length === 2 ? d : "62";
}

/**
 * Normaliza para dígitos no padrão internacional BR: 55 + DDD + número.
 * - Com DDD (10 ou 11 dígitos nacionais, sem 55): preserva o DDD informado.
 * - Só número local (8 ou 9 dígitos): insere o DDD padrão (62 por padrão).
 * - Já com 55 e 10–11 dígitos após o país: mantém.
 * - Já com 55 e só 8–9 dígitos após o país: insere DDD padrão entre 55 e o número.
 */
export function normalizeBrazilPhone(input: string): string {
  const d = input.replace(/\D/g, "");
  if (!d) return "";

  const ddd = getDefaultPhoneDdd();

  if (d.startsWith("55")) {
    const rest = d.slice(2);
    if (!rest) return "";
    if (rest.length === 10 || rest.length === 11) {
      return `55${rest}`;
    }
    if (rest.length === 8 || rest.length === 9) {
      return `55${ddd}${rest}`;
    }
    if (rest.length > 11) {
      return `55${rest.slice(0, 11)}`;
    }
    return `55${ddd}${rest}`;
  }

  if (d.length === 10 || d.length === 11) {
    return `55${d}`;
  }
  if (d.length === 8 || d.length === 9) {
    return `55${ddd}${d}`;
  }
  if (d.length > 11) {
    return `55${d.slice(0, 11)}`;
  }
  return `55${ddd}${d}`;
}

/** Telefone apenas dígitos no formato internacional BR (mesma regra que normalizeBrazilPhone). */
export function sanitizePhone(input: string): string {
  return normalizeBrazilPhone(input);
}

export function criarMensagemWhatsApp(data: {
  nome: string;
  telefone: string;
  modeloCarro: string;
}): string {
  return `Novo agendamento Farolfix:

Nome: ${data.nome}
Telefone: ${data.telefone}
Carro: ${data.modeloCarro}`;
}

export function percentualConversao(acessos: number, agendamentos: number): number {
  if (acessos === 0) return 0;
  return Number(((agendamentos / acessos) * 100).toFixed(2));
}
