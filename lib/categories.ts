export const categories = [
  {
    slug: 'estrategia',
    name: 'Estratégia',
    questions: [
      'A empresa possui plano de negócio atualizado?',
      'As metas mensais estão claras?',
      'A proposta de valor está bem definida?',
      'Os processos principais estão documentados?',
    ],
    actions: [
      'Criar um plano de negócio enxuto com público, oferta, canais, metas e indicadores.',
      'Definir três indicadores semanais para acompanhar vendas, operação e crescimento.',
    ],
  },
  {
    slug: 'financeiro',
    name: 'Financeiro',
    questions: [
      'O fluxo de caixa é atualizado semanalmente?',
      'Custos fixos e variáveis estão mapeados?',
      'A precificação considera margem, impostos e custos reais?',
      'Dívidas, parcelas e obrigações estão controladas?',
    ],
    actions: [
      'Organizar uma rotina semanal de fluxo de caixa com entradas, saídas, dívidas e saldo projetado.',
      'Revisar a precificação dos principais produtos considerando margem real e custos fixos.',
    ],
  },
  {
    slug: 'regularizacao',
    name: 'Regularização',
    questions: [
      'Documentos do CNPJ estão organizados?',
      'Declarações obrigatórias estão em dia?',
      'Alvarás e licenças foram conferidos?',
      'Pendências fiscais possuem responsável e prazo?',
    ],
    actions: [
      'Mapear pendências documentais e classificar por urgência, custo e risco.',
      'Criar uma agenda mensal de declarações, vencimentos e responsabilidades.',
    ],
  },
  {
    slug: 'esg',
    name: 'ESG',
    questions: [
      'Práticas ambientais são acompanhadas?',
      'Fornecedores seguem critérios éticos?',
      'A empresa mede impacto social local?',
      'Governança e responsabilidades estão claras?',
    ],
    actions: [
      'Criar checklist ESG básico com resíduos, fornecedores, equipe e comunidade.',
      'Registrar evidências de boas práticas para usar em vendas, parcerias e relatórios.',
    ],
  },
  {
    slug: 'energia',
    name: 'Energia',
    questions: [
      'A conta de energia é analisada mensalmente?',
      'Equipamentos de maior consumo foram identificados?',
      'Há plano para reduzir desperdícios?',
      'Opções renováveis já foram avaliadas?',
    ],
    actions: [
      'Mapear os principais pontos de consumo e definir medidas de redução imediata.',
      'Avaliar viabilidade de energia renovável, eficiência energética ou compra compartilhada.',
    ],
  },
  {
    slug: 'mercado',
    name: 'Mercado',
    questions: [
      'Clientes ideais estão bem definidos?',
      'Canais de venda são medidos?',
      'Parcerias comerciais foram mapeadas?',
      'A empresa possui narrativa de sustentabilidade?',
    ],
    actions: [
      'Definir o perfil de cliente ideal e ajustar a oferta para esse público.',
      'Mapear canais, parceiros e compradores com maior potencial comercial.',
    ],
  },
]

export type Category = (typeof categories)[number]
