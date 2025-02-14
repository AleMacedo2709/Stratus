# Guia Rápido - PlanMP

## Pré-requisitos

### Requisitos de Hardware
- CPU: 4+ cores
- RAM: 8GB+
- Disco: 100GB+ (SSD recomendado)
- Portas livres: 1433 (SQL Server)

### Windows
1. **Docker Desktop**
   - Download: [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop)
   - Requisitos:
     - Windows 10/11 Pro, Enterprise ou Education
     - WSL2 habilitado
     - Virtualização habilitada no BIOS
     - Memória para WSL2: mínimo 4GB (Settings -> Resources -> WSL2)

2. **SQL Server Management Studio (SSMS)**
   - Download: [SSMS](https://aka.ms/ssmsfullsetup)
   - Ou Azure Data Studio: [Download](https://docs.microsoft.com/sql/azure-data-studio/download)

3. **Git**
   - Download: [Git para Windows](https://git-scm.com/download/win)

### Linux
```bash
# Requisitos
sudo apt-get update
sudo apt-get install -y git curl

# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# IMPORTANTE: Faça logout e login para aplicar as mudanças de grupo

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Azure Data Studio
# Baixe do site oficial: https://docs.microsoft.com/sql/azure-data-studio/download
```

### macOS
1. **Docker Desktop**
   - Download: [Docker Desktop para Mac](https://www.docker.com/products/docker-desktop)
   - Suporta Intel e Apple Silicon
   - Requisitos:
     - macOS 11+ (Big Sur ou superior)
     - Mínimo 4GB RAM alocados para Docker

2. **Azure Data Studio**
   - Download: [Azure Data Studio](https://docs.microsoft.com/sql/azure-data-studio/download)

3. **Git**
   ```bash
   # Via Homebrew
   brew install git
   # OU baixe do site: https://git-scm.com/download/mac
   ```

## Instalação Rápida

1. **Clone o Repositório**
```bash
git clone https://github.com/seu-orgao/planmp.git
cd planmp
```

2. **Configure o Ambiente**
```bash
# Copie o arquivo de exemplo
cp docker/.env.example docker/.env

# Verifique se as portas necessárias estão livres
# Windows
netstat -ano | findstr :1433
# Linux/macOS
lsof -i :1433
```

3. **Inicie o Ambiente**
```bash
# Inicie os containers
docker-compose up -d

# Verifique a instalação
./scripts/verify-install.sh

# Se houver problemas, verifique os logs
docker-compose logs db
```

## Conectando ao Banco

### Credenciais Padrão
- Host: localhost
- Porta: 1433
- Usuário: sa
- Senha: YourStrong@Passw0rd
- Banco: PlanMP

### Usando SSMS
1. Abra o SQL Server Management Studio
2. Configure a conexão:
   - Server: `localhost,1433`
   - Authentication: SQL Server Authentication
   - Login: `sa`
   - Password: `YourStrong@Passw0rd`

### Usando Azure Data Studio
1. Nova Conexão:
   - Connection Type: Microsoft SQL Server
   - Server: `localhost,1433`
   - Authentication Type: SQL Login
   - User name: `sa`
   - Password: `YourStrong@Passw0rd`

### Usando linha de comando
```bash
# Dentro do container
docker exec -it planmp-db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrong@Passw0rd
```

## Estrutura do Banco

### Principais Tabelas
- `StrategicPlanningCycles`: Ciclos de planejamento
- `StrategicPerspectives`: Perspectivas estratégicas
- `StrategicObjectives`: Objetivos estratégicos
- `StrategicActions`: Ações estratégicas
- `OrganizationalUnits`: Unidades organizacionais
- `AnnualInitiatives`: Iniciativas anuais
- `Tasks`: Tarefas
- `Indicators`: Indicadores

### Views Importantes
- `vw_CycleOverallProgress`: Progresso geral do ciclo
- `vw_UnitProgress`: Progresso por unidade
- `vw_PerspectiveProgress`: Progresso por perspectiva
- `vw_UnitHierarchy`: Hierarquia de unidades
- `vw_GoalsRelationship`: Relacionamento entre metas

## Queries Úteis

```sql
-- Progresso geral
SELECT * FROM vw_CycleOverallProgress;

-- Iniciativas por unidade
SELECT * FROM vw_UnitProgress;

-- Metas e indicadores
SELECT * FROM vw_GoalsProgress;

-- Hierarquia de unidades
SELECT * FROM vw_UnitHierarchy;

-- Relacionamento entre metas
SELECT * FROM vw_GoalsRelationship;
```

## Próximos Passos

1. Explore a documentação completa em `docs/`
2. Verifique exemplos em `examples/`
3. Configure seu ambiente de desenvolvimento
4. Execute queries de teste

## Suporte

- Documentação: `docs/`
- Issues: GitHub Issues
- Email: suporte@planmp.org.br 