# PlanMP - Sistema de Planejamento Estratégico

## Sobre
Sistema para gestão do planejamento estratégico, permitindo o acompanhamento de metas, ações e iniciativas.

## Estrutura
- Ciclos de 6 anos
- Metas anuais e de ciclo
- Ações estratégicas
- Iniciativas anuais
- Indicadores de desempenho

## Instalação
1. Clone o repositório
2. Configure o arquivo `.env`
3. Execute `docker-compose up -d`
4. Verifique a instalação:
   ```bash
   ./scripts/verify-install.sh
   ```

## Documentação
- [Banco de Dados](docs/database.md)
- [Arquitetura](docs/architecture.md)
- [Implantação](docs/deployment.md)

# Sistema de Planejamento Estratégico para Órgãos Públicos

Sistema completo para gestão do planejamento estratégico em órgãos públicos, com foco em eficiência, transparência e resultados.

## Características Principais

- Gestão completa do ciclo de planejamento estratégico
- Alinhamento com PPA, LDO e LOA
- Monitoramento em tempo real de indicadores
- Gestão de riscos e conformidade
- Integração com sistemas governamentais (SIAFI, SEI, etc.)
- Dashboards e relatórios avançados
- Auditoria completa de ações

## Requisitos do Sistema

- Node.js 18.x ou superior
- SQL Server 2019 ou superior
- Redis (para cache e sessões)
- Certificado SSL para ambientes de produção e staging

## Configuração dos Ambientes

### Desenvolvimento

1. Clone o repositório:
```bash
git clone https://github.com/seu-orgao/planmp.git
cd planmp
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (crie um arquivo .env.development):
```env
# API e App
DEV_API_URL=http://localhost:3000/api
USE_MOCK_DATA=true

# Banco de Dados
DEV_DB_HOST=localhost
DEV_DB_PORT=1433
DEV_DB_NAME=strategic_planning_dev
DEV_DB_USER=sa
DEV_DB_PASSWORD=Dev123!@#

# Monitoramento
DEV_SENTRY_DSN=

# Autenticação
DEV_AZURE_TENANT_ID=
DEV_AZURE_CLIENT_ID=
DEV_AZURE_CLIENT_SECRET=
DEV_REDIRECT_URI=http://localhost:3000/auth/callback

# Integrações
ENABLE_SIAFI=false
DEV_SIAFI_URL=http://localhost:3002/siafi
DEV_SIAFI_TOKEN=dev-token

ENABLE_SEI=false
DEV_SEI_URL=http://localhost:3003/sei
DEV_SEI_TOKEN=dev-token

ENABLE_TRANSPARENCY=false
DEV_TRANSPARENCY_URL=http://localhost:3004/transparency
DEV_TRANSPARENCY_TOKEN=dev-token

# Mock Data
MOCK_DELAY=500
MOCK_ERROR_RATE=0.1
MOCK_DATA_PATH=./src/data/mock
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

### Staging

1. Configure as variáveis de ambiente (crie um arquivo .env.staging):
```env
# API e App
STAGING_API_URL=https://staging-api.planmp.org.br

# Banco de Dados
STAGING_DB_HOST=staging-db.planmp.org.br
STAGING_DB_PORT=1433
STAGING_DB_NAME=strategic_planning_staging
STAGING_DB_USER=app_user
STAGING_DB_PASSWORD=

# Monitoramento
STAGING_SENTRY_DSN=

# Autenticação
STAGING_AZURE_TENANT_ID=
STAGING_AZURE_CLIENT_ID=
STAGING_AZURE_CLIENT_SECRET=
STAGING_REDIRECT_URI=https://staging.planmp.org.br/auth/callback

# Integrações
STAGING_SIAFI_URL=https://siafi-homologacao.tesouro.gov.br
STAGING_SIAFI_TOKEN=

STAGING_SEI_URL=https://sei-homologacao.planmp.org.br
STAGING_SEI_TOKEN=

STAGING_TRANSPARENCY_URL=https://transparencia-homologacao.planmp.org.br
STAGING_TRANSPARENCY_TOKEN=
```

2. Build e inicie o servidor:
```bash
npm run build
npm run start:staging
```

### Produção

1. Configure as variáveis de ambiente (crie um arquivo .env.production):
```env
# API e App
API_URL=https://api.planmp.org.br

# Banco de Dados
DB_HOST=db.planmp.org.br
DB_PORT=1433
DB_NAME=strategic_planning
DB_USER=app_user
DB_PASSWORD=

# Monitoramento
SENTRY_DSN=

# Autenticação
AZURE_TENANT_ID=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
REDIRECT_URI=https://planmp.org.br/auth/callback

# Integrações
SIAFI_URL=https://api.siafi.tesouro.gov.br
SIAFI_TOKEN=

SEI_URL=https://sei.planmp.org.br
SEI_TOKEN=

TRANSPARENCY_URL=https://transparencia.planmp.org.br
TRANSPARENCY_TOKEN=
```

2. Build e inicie o servidor:
```bash
npm run build
npm run start:prod
```

## Estrutura do Sistema

```
src/
├── components/        # Componentes React
├── config/           # Configurações de ambiente
├── data/            # Dados mockados e fixtures
├── pages/           # Páginas da aplicação
├── services/        # Serviços de negócio
├── styles/          # Estilos globais
└── types/           # Definições de tipos
```

## Funcionalidades Principais

### Planejamento Estratégico
- Definição de objetivos estratégicos
- Indicadores e metas
- Alinhamento com planejamento governamental
- Gestão de iniciativas e ações

### Monitoramento
- Dashboard em tempo real
- Indicadores de desempenho
- Alertas e notificações
- Relatórios gerenciais

### Gestão de Riscos
- Identificação e análise de riscos
- Planos de mitigação
- Monitoramento contínuo
- Relatórios de conformidade

### Integrações
- SIAFI (Sistema Integrado de Administração Financeira)
- SEI (Sistema Eletrônico de Informações)
- Portal da Transparência
- Outros sistemas governamentais

## Segurança

O sistema implementa as seguintes medidas de segurança:

- Autenticação via Azure AD
- SSL/TLS em todos os ambientes
- Rate limiting para proteção contra ataques
- Auditoria completa de ações
- Backup automático de dados
- Conformidade com LGPD

## Suporte

Para suporte técnico, entre em contato:
- Email: suporte@planmp.org.br
- Telefone: (XX) XXXX-XXXX

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

## Versão

Versão atual: 1.0.0
