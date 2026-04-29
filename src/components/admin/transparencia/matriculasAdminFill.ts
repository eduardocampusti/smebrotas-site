import type { MatriculasAutoFillResult } from './matriculasCsv'
import type { MatriculasDataBlock } from './types'

/** Monta o bloco de Matrículas do admin a partir do autofill (mesma lógica do fluxo pós-validação de CSV). */
export function buildMatriculasDataBlockFromAutoFill(
  currentMatriculas: MatriculasDataBlock | undefined,
  autoFill: MatriculasAutoFillResult,
): MatriculasDataBlock {
  const current = currentMatriculas
  return {
    resumo: [
      {
        id: current?.resumo[0]?.id || crypto.randomUUID(),
        label: 'Total geral importado',
        valor: autoFill.resumo.totalGeralImportado,
      },
      {
        id: current?.resumo[1]?.id || crypto.randomUUID(),
        label: 'Total Infantil e Fundamental',
        valor: autoFill.resumo.totalInfantilFundamental,
      },
      { id: current?.resumo[2]?.id || crypto.randomUUID(), label: 'Total EJA', valor: autoFill.resumo.totalEja },
      {
        id: current?.resumo[3]?.id || crypto.randomUUID(),
        label: 'Total AEE / Educação Especial',
        valor: autoFill.resumo.totalAeeEducacaoEspecial,
      },
      { id: current?.resumo[4]?.id || crypto.randomUUID(), label: 'Vagas disponíveis', valor: 'Não informado' },
      { id: current?.resumo[5]?.id || crypto.randomUUID(), label: 'Taxa de ocupação', valor: 'Não informado' },
      {
        id: current?.resumo[6]?.id || crypto.randomUUID(),
        label: 'Ano de referência',
        valor: autoFill.resumo.anoReferencia,
      },
      { id: current?.resumo[7]?.id || crypto.randomUUID(), label: 'Fonte dos dados', valor: autoFill.resumo.fonteDados },
      {
        id: current?.resumo[8]?.id || crypto.randomUUID(),
        label: 'Data de atualização',
        valor: autoFill.resumo.dataAtualizacao,
      },
    ],
    etapas: [
      { id: current?.etapas[0]?.id || crypto.randomUUID(), label: 'Creche', valor: autoFill.etapas.creche },
      { id: current?.etapas[1]?.id || crypto.randomUUID(), label: 'Pré-escola', valor: autoFill.etapas.preEscola },
      { id: current?.etapas[2]?.id || crypto.randomUUID(), label: 'Anos Iniciais', valor: autoFill.etapas.anosIniciais },
      { id: current?.etapas[3]?.id || crypto.randomUUID(), label: 'Anos Finais', valor: autoFill.etapas.anosFinais },
      { id: current?.etapas[4]?.id || crypto.randomUUID(), label: 'EJA', valor: autoFill.etapas.eja },
      {
        id: current?.etapas[5]?.id || crypto.randomUUID(),
        label: 'Educação Especial',
        valor: autoFill.etapas.educacaoEspecial,
      },
    ],
    evolucao:
      autoFill.evolucao.length > 0
        ? autoFill.evolucao.map((item, index) => ({
            id: current?.evolucao[index]?.id || crypto.randomUUID(),
            label: item.ano,
            valor: item.total,
          }))
        : [{ id: current?.evolucao[0]?.id || crypto.randomUUID(), label: 'Ano', valor: 'Não informado' }],
    evolucaoManual:
      current?.evolucaoManual && current.evolucaoManual.length > 0
        ? current.evolucaoManual
        : autoFill.evolucao.map((item, index) => ({
            id: crypto.randomUUID(),
            ano: item.ano,
            urbana: index === 0 ? autoFill.localizacao.urbana : '0',
            rural: index === 0 ? autoFill.localizacao.rural : '0',
            educacaoEspecial: autoFill.etapas.educacaoEspecial,
          })),
    localizacao: [
      { id: current?.localizacao[0]?.id || crypto.randomUUID(), label: 'Urbana', valor: autoFill.localizacao.urbana },
      { id: current?.localizacao[1]?.id || crypto.randomUUID(), label: 'Rural', valor: autoFill.localizacao.rural },
    ],
    fonte: {
      fonte: autoFill.fonte.fonte,
      anoReferencia: autoFill.fonte.anoReferencia,
      dataAtualizacao: autoFill.fonte.dataAtualizacao,
      link: autoFill.fonte.link,
    },
  }
}
