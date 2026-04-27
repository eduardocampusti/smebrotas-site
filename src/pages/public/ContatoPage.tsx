import { useEffect, useState, type FormEvent } from 'react'
import {
  AtSign,
  Briefcase,
  Bus,
  Clock,
  Globe,
  LoaderCircle,
  Mail,
  Map,
  MapPin,
  Phone,
  PlayCircle,
  Send,
  UserPlus,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import { supabase } from '../../config/supabase'
import type { ContatoInfo, Faq, Setor } from '../../types'
import { toast } from 'sonner'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const FORM_ASSUNTOS = [
  'Matrícula',
  'Transporte',
  'Alimentação',
  'Educação Especial',
  'Dúvida Geral',
  'Reclamação',
  'Sugestão',
] as const

const MAP_EMBED_URL =
  'https://maps.google.com/maps?q=Brotas+de+Macaubas+Bahia&output=embed'
const MAP_EXTERNAL_URL =
  'https://www.google.com/maps/search/?api=1&query=Brotas+de+Maca%C3%Babas%2C+Bahia%2C+Brasil'

const SEDE_ENDERECO = 'Av. da Educação, s/n - Centro'
const SEDE_CEP = '46880-000'
const SEDE_HORARIO = 'Segunda a Sexta, 08h às 17h'
const SEDE_TELEFONE = '(74) 3621-8400'
const SEDE_EMAIL = 'sme@brotasdemacaubas.ba.gov.br'

const FAQ_EDUCACAO_ESPECIAL: Pick<Faq, 'id' | 'pergunta' | 'resposta'>[] = [
  {
    id: 'faq-aee',
    pergunta: 'Como funciona o Atendimento Educacional Especializado (AEE)?',
    resposta:
      'O AEE oferece apoio complementar aos estudantes com deficiência, transtornos globais do desenvolvimento ou altas habilidades, em horários contratados à proposta pedagógica da escola. Há salas de recursos com profissionais especializados, planejamento individualizado e articulação com a sala comum. A indicação ao serviço segue avaliação da equipe escolar e do Núcleo de Educação Especial, respeitando critérios legais e laudos quando aplicáveis, com acompanhamento periódico do percurso do estudante.',
  },
  {
    id: 'faq-direitos-def',
    pergunta: 'Quais são os direitos dos alunos com deficiência na rede municipal?',
    resposta:
      'A rede municipal assegura matrícula, permanência e progressão na escola mais próxima de domicílio, sempre que possível na classe comum (educação inclusiva), com apoio pedagógico e avaliação acessível. São previstas adaptações curriculares, materiais e recursos de tecnologia assistiva, transporte e alimentação quando necessários, além de participação da família. Laudos e relatórios médicos ou multiprofissionais, quando existentes, ajudam a planejar o atendimento, sem substituir o direito à matrícula e ao acompanhamento educacional.',
  },
]

const FAKE_TELEFONE = /\(00\)\s*3333-000\d*/i

function normalizeContato(data: ContatoInfo): ContatoInfo {
  return {
    ...data,
    setores: Array.isArray(data.setores) ? data.setores : [],
    formulario_assuntos: Array.isArray(data.formulario_assuntos) ? data.formulario_assuntos : [],
    links_uteis: Array.isArray(data.links_uteis) ? data.links_uteis : [],
    redes_sociais: data.redes_sociais && typeof data.redes_sociais === 'object' ? data.redes_sociais : {},
    sede_titulo: data.sede_titulo || 'Sede da Secretaria',
    endereco_label: data.endereco_label || 'Endereço Principal',
    telefone_label: data.telefone_label || 'Telefone Geral',
    whatsapp_label: data.whatsapp_label || 'WhatsApp',
    email_label: data.email_label || 'E-mail Institucional',
    mapa_botao_texto: data.mapa_botao_texto || 'Abrir no Google Maps',
    formulario_titulo: data.formulario_titulo || 'Envie sua Mensagem',
    formulario_placeholder_mensagem: data.formulario_placeholder_mensagem || 'Descreva sua solicitação com detalhes...',
    formulario_botao_texto: data.formulario_botao_texto || 'Enviar Mensagem',
    formulario_mensagem_sucesso: data.formulario_mensagem_sucesso || 'Mensagem enviada com sucesso! Em breve retornaremos o contato.',
    faq_titulo: data.faq_titulo || 'Dúvidas Frequentes',
    faq_subtitulo: data.faq_subtitulo || 'Encontre respostas rápidas para as solicitações mais comuns.',
  }
}

function getSetorVisual(nome: string) {
  const n = nome.toLowerCase()
  if (n.includes('matr'))
    return { Icon: UserPlus, iconWrap: 'bg-[#DBEAFE]', iconClass: 'text-[#1D4ED8]' }
  if (n.includes('transport'))
    return { Icon: Bus, iconWrap: 'bg-[#D1FAE5]', iconClass: 'text-[#065F46]' }
  if (n.includes('aliment'))
    return { Icon: UtensilsCrossed, iconWrap: 'bg-[#FEF3C7]', iconClass: 'text-[#92400E]' }
  if (n.includes('human') || n.includes('rh') || n.includes('recurso human'))
    return { Icon: Users, iconWrap: 'bg-[#EDE9FE]', iconClass: 'text-[#7C3AED]' }
  return { Icon: Users, iconWrap: 'bg-slate-100', iconClass: 'text-slate-600' }
}

function formatSetorTelefone(telefone: string | undefined) {
  if (!telefone?.trim()) return null
  if (FAKE_TELEFONE.test(telefone)) return null
  return telefone
}

export default function ContatoPage() {
  const [contato, setContato] = useState<ContatoInfo | null>(null)
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [assunto, setAssunto] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [faqOpen, setFaqOpen] = useState<string[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [contatoRes, faqRes] = await Promise.all([
          supabase.from('contato_info').select('*').single(),
          supabase.from('faq').select('*').eq('ativo', true).order('ordem', { ascending: true }),
        ])

        if (contatoRes.data) setContato(normalizeContato(contatoRes.data as ContatoInfo))
        if (faqRes.data) setFaqs(faqRes.data as Faq[])
      } catch (error) {
        console.error('Erro ao carregar dados de contato:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!assunto) {
      toast.error('Selecione um assunto.')
      return
    }
    const form = e.currentTarget
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    toast.success(contato?.formulario_mensagem_sucesso || 'Mensagem enviada com sucesso! Em breve retornaremos o contato.')
    form.reset()
    setAssunto('')
    setIsSubmitting(false)
  }

  if (loading || !contato) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const setoresAtivos = contato.setores.filter((setor) => setor.ativo !== false)
  const redesEntries = Object.entries(contato.redes_sociais).filter(([, url]) => Boolean(url))
  const faqsExibicao: Pick<Faq, 'id' | 'pergunta' | 'resposta'>[] = [...faqs, ...FAQ_EDUCACAO_ESPECIAL]

  const fieldClass =
    'h-12 rounded-lg border-2 border-slate-200 bg-white px-4 text-base placeholder:text-slate-400 focus-visible:border-[#0B4F8A] focus-visible:ring-2 focus-visible:ring-[#0B4F8A]/20 md:text-sm dark:border-slate-700 dark:bg-slate-900'

  return (
    <>
      <div className="flex animate-in flex-col gap-3 duration-700 fade-in slide-in-from-bottom-4">
        <Badge className="w-fit gap-1.5 border-0 bg-[#D1FAE5] px-3 py-1.5 text-sm font-medium text-[#065F46] hover:bg-[#D1FAE5]">
          <Clock className="size-4 shrink-0" aria-hidden />
          Atendimento Seg-Sex, 08h às 17h
        </Badge>
        <h1 className="text-4xl leading-tight font-extrabold tracking-[-0.033em] text-[#0B2545] dark:text-white">
          {contato.titulo_pagina}
        </h1>
        <p className="max-w-2xl text-lg font-normal text-slate-500 dark:text-slate-400">{contato.subtitulo_pagina}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Card className="gap-0 rounded-2xl border border-slate-100 py-0 shadow-lg dark:border-slate-800">
            <CardContent className="p-8">
              <div className="mb-6 flex items-center gap-2">
                <Mail className="size-6 shrink-0 text-[#0B4F8A]" aria-hidden />
                <h2 className="text-xl font-bold text-[#0B2545] dark:text-white">{contato.formulario_titulo}</h2>
              </div>
              <Separator className="mb-8" />
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex w-full flex-col">
                    <label htmlFor="contato-nome" className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                      Nome Completo *
                    </label>
                    <Input
                      id="contato-nome"
                      name="nome"
                      className={fieldClass}
                      placeholder="Seu nome"
                      required
                      type="text"
                    />
                  </div>
                  <div className="flex w-full flex-col">
                    <label htmlFor="contato-email" className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                      E-mail *
                    </label>
                    <Input
                      id="contato-email"
                      name="email"
                      className={fieldClass}
                      placeholder="seu.email@exemplo.com"
                      required
                      type="email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex w-full flex-col">
                    <label htmlFor="contato-telefone" className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                      Telefone (Opcional)
                    </label>
                    <Input
                      id="contato-telefone"
                      name="telefone"
                      className={fieldClass}
                      placeholder="(00) 00000-0000"
                      type="tel"
                    />
                  </div>
                  <div className="flex w-full flex-col">
                    <span className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Assunto *</span>
                    <Select value={assunto || undefined} onValueChange={(v) => setAssunto(v ?? '')}>
                      <SelectTrigger
                        className={cn(
                          fieldClass,
                          'h-12 w-full min-w-0 justify-between py-0 data-placeholder:text-slate-400',
                        )}
                        aria-label="Assunto da mensagem"
                      >
                        <SelectValue placeholder="Selecione um assunto" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORM_ASSUNTOS.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex w-full flex-col">
                  <label htmlFor="contato-mensagem" className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Mensagem *
                  </label>
                  <Textarea
                    id="contato-mensagem"
                    name="mensagem"
                    className="min-h-[120px] resize-none rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-base placeholder:text-slate-400 focus-visible:border-[#0B4F8A] focus-visible:ring-2 focus-visible:ring-[#0B4F8A]/20 md:text-sm dark:border-slate-700 dark:bg-slate-900"
                    placeholder={contato.formulario_placeholder_mensagem}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full gap-2 bg-[#0B4F8A] font-semibold text-white hover:bg-[#0a3f72] dark:bg-[#0B4F8A] dark:hover:bg-[#0a3f72]"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" aria-hidden />
                      Enviando…
                    </>
                  ) : (
                    <>
                      {contato.formulario_botao_texto}
                      <Send className="size-4" aria-hidden />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="flex animate-in flex-col gap-6 duration-700 fade-in slide-in-from-right-4 lg:col-span-5">
          <Card className="gap-0 rounded-2xl border border-slate-100 py-0 shadow-lg dark:border-slate-800">
            <CardContent className="space-y-0 p-6">
              <h3 className="mb-5 text-xl font-bold text-[#0B2545] dark:text-white">{contato.sede_titulo}</h3>

              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#DBEAFE] p-2">
                  <MapPin className="size-5 text-[#1D4ED8]" aria-hidden />
                </div>
                <div>
                  <p className="font-semibold text-[#0B2545] dark:text-slate-100">{contato.endereco_label}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {SEDE_ENDERECO}
                    <br />
                    CEP {SEDE_CEP}
                    <br />
                    Horário: {SEDE_HORARIO}
                  </p>
                </div>
              </div>

              <Separator className="my-5" />

              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#D1FAE5] p-2">
                  <Phone className="size-5 text-[#065F46]" aria-hidden />
                </div>
                <div>
                  <p className="font-semibold text-[#0B2545] dark:text-slate-100">{contato.telefone_label}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{SEDE_TELEFONE}</p>
                </div>
              </div>

              <Separator className="my-5" />

              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#EDE9FE] p-2">
                  <Mail className="size-5 text-[#7C3AED]" aria-hidden />
                </div>
                <div>
                  <p className="font-semibold text-[#0B2545] dark:text-slate-100">{contato.email_label}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{SEDE_EMAIL}</p>
                </div>
              </div>

              {contato.whatsapp && (
                <>
                  <Separator className="my-5" />
                  <a
                    href={`https://wa.me/55${contato.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 transition-opacity hover:opacity-80"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-100 p-2 dark:bg-green-950/40">
                      <Phone className="size-5 text-green-600 dark:text-green-400" aria-hidden />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0B2545] dark:text-slate-100">{contato.whatsapp_label}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{contato.whatsapp}</p>
                    </div>
                  </a>
                </>
              )}

              {redesEntries.length > 0 && (
                <>
                  <Separator className="my-5" />
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {redesEntries.map(([key, url]) => {
                      const k = key.toLowerCase()
                      const IconComp =
                        k === 'instagram'
                          ? AtSign
                          : k === 'facebook'
                            ? Globe
                            : k === 'youtube'
                              ? PlayCircle
                              : k === 'linkedin'
                                ? Briefcase
                                : null
                      return (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-[#0B4F8A] shadow-sm transition-all hover:bg-[#0B4F8A] hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-[#0B4F8A]"
                          title={key.charAt(0).toUpperCase() + key.slice(1)}
                        >
                          {IconComp ? (
                            <IconComp className="size-[18px]" aria-hidden />
                          ) : (
                            <span className="text-xs font-semibold uppercase">{key.slice(0, 2)}</span>
                          )}
                        </a>
                      )
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {setoresAtivos.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {setoresAtivos.map((setor: Setor, i: number) => {
                const { Icon, iconWrap, iconClass } = getSetorVisual(setor.nome)
                const tel = formatSetorTelefone(setor.telefone)
                return (
                  <Card
                    key={`${setor.nome}-${i}`}
                    className="border border-slate-100 shadow-md transition-all duration-300 hover:-translate-y-[3px] hover:border-[#0B4F8A]/20 hover:shadow-xl dark:border-slate-800"
                  >
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', iconWrap)}>
                          <Icon className={cn('size-5', iconClass)} aria-hidden />
                        </div>
                        <h4 className="text-sm font-bold text-[#0B2545] dark:text-white">{setor.nome}</h4>
                      </div>
                      {tel ? (
                        <p className="text-sm text-slate-600 dark:text-slate-400">{tel}</p>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Em breve</p>
                      )}
                      {setor.email ? (
                        <p className="mt-1 truncate text-xs text-slate-500" title={setor.email}>
                          {setor.email}
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-[#E2E8F0] dark:border-slate-700">
            <iframe
              title="Mapa — Brotas de Macaúbas, Bahia"
              src={MAP_EMBED_URL}
              className="block h-[220px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <Button variant="outline" className="w-full gap-2 border-slate-200" asChild>
            <a href={contato.mapa_url || MAP_EXTERNAL_URL} target="_blank" rel="noopener noreferrer">
              <Map className="size-4" aria-hidden />
              {contato.mapa_botao_texto}
            </a>
          </Button>
        </div>
      </div>

      {faqsExibicao.length > 0 && (
        <div className="mx-auto mt-12 w-full max-w-3xl border-t border-slate-200 pt-10 dark:border-slate-800">
          <div className="mb-10 flex flex-col items-center text-center">
            <Badge className="mb-3 border-0 bg-[#EFF6FF] px-3 py-1 text-sm font-medium text-[#0B4F8A] hover:bg-[#EFF6FF]">
              Perguntas Frequentes
            </Badge>
            <h2 className="text-3xl font-bold text-[#0B2545] dark:text-white">{contato.faq_titulo}</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{contato.faq_subtitulo}</p>
          </div>

          <Accordion multiple={false} value={faqOpen} onValueChange={setFaqOpen}>
            {faqsExibicao.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="mb-3 rounded-xl border border-slate-200 px-0 not-last:border-b-0 data-open:border-l-4 data-open:border-[#0B4F8A] dark:border-slate-700"
              >
                <AccordionTrigger
                  className={cn(
                    'px-4 py-4 font-semibold text-[#0B2545] hover:text-[#0B4F8A] hover:no-underline dark:text-white dark:hover:text-[#0B4F8A]',
                    '[&>svg:nth-last-child(2)]:!block [&>svg:nth-last-child(2)]:transition-transform [&>svg:nth-last-child(2)]:duration-300',
                    'group-aria-expanded/accordion-trigger:[&>svg:nth-last-child(2)]:rotate-180',
                    '[&>svg:last-child]:!hidden',
                  )}
                >
                  {faq.pergunta}
                </AccordionTrigger>
                <AccordionContent className="border-0 px-4 pb-4 text-sm leading-relaxed text-slate-600 data-open:bg-slate-50/50 dark:text-slate-400 dark:data-open:bg-slate-900/40">
                  <p>{faq.resposta}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </>
  )
}
