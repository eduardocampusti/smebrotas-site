# Checklist de validação da migration EJA

- [ ] Executar `transparencia_eja_setup.sql` no projeto Supabase `givdpxyabxuqhgglzxcs`.
- [ ] Executar `transparencia_eja_rpc_security_patch.sql` no projeto Supabase `givdpxyabxuqhgglzxcs` (sem recriar tabelas).
- [ ] Confirmar criação das tabelas `public.transparencia_eja_importacoes` e `public.transparencia_eja_linhas`.
- [ ] Confirmar criação das funções `salvar_transparencia_eja_importacao` e `publicar_transparencia_eja_importacao`.
- [ ] Validar RLS público: usuário anônimo só enxerga importação com `status_publicacao = 'publicado'`.
- [ ] Validar RLS admin: usuário com `profiles.role` em `admin` ou `super_admin` consegue salvar/editar/publicar.
- [ ] Validar que `salvar_transparencia_eja_importacao` sempre grava `status_publicacao = 'rascunho'`, mesmo que o JSON envie `publicado`.
- [ ] Validar que `publicar_transparencia_eja_importacao` rejeita UUID inexistente com erro "Importação EJA não encontrada.".
- [ ] Validar que, ao tentar publicar UUID inexistente, nenhuma publicação anterior é despublicada.
- [ ] Validar que publicação válida despublica a anterior e mantém somente uma importação publicada.
- [ ] No admin, preencher EJA manualmente e salvar.
- [ ] Publicar EJA e conferir aba pública `/transparencia`.
- [ ] Se necessário desfazer, executar `transparencia_eja_rollback.sql`.
