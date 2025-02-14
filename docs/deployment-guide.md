# Guia de Implantação - PlanMP

## Requisitos

### Software
- Docker 20.10+
- Docker Compose 2.0+
- SQL Server Management Studio (SSMS) ou Azure Data Studio (opcional)

### Hardware Recomendado
- CPU: 4+ cores
- RAM: 8GB+
- Disco: 100GB+ (SSD recomendado)

## Instalação

1. **Clone o Repositório**
```bash
git clone https://github.com/seu-orgao/planmp.git
cd planmp
```

2. **Configure as Variáveis de Ambiente**
```bash
cp docker/.env.example docker/.env
```

Edite o arquivo `docker/.env` com suas configurações:
```env
# SQL Server
ACCEPT_EULA=Y
MSSQL_SA_PASSWORD=SuaSenhaForte@123
MSSQL_PID=Express
```

3. **Inicie o Container**
```bash
docker-compose up -d
```

4. **Verifique a Instalação**
```bash
docker-compose ps
docker-compose logs db
```

## Ambientes

### Desenvolvimento
- Porta padrão: 1433
- Senha padrão: YourStrong@Passw0rd
- Dados de exemplo incluídos

### Produção
- Alterar senha no arquivo .env
- Configurar backup
- Configurar monitoramento
- Configurar firewall

## Backup e Recuperação

### Backup Automático
1. Configure o diretório de backup:
```bash
docker exec -it planmp-db mkdir /var/opt/mssql/backup
```

2. Configure o job de backup:
```sql
USE PlanMP;
GO

BACKUP DATABASE PlanMP
TO DISK = '/var/opt/mssql/backup/planmp_full.bak'
WITH FORMAT;
GO
```

### Recuperação
```sql
USE master;
GO

RESTORE DATABASE PlanMP
FROM DISK = '/var/opt/mssql/backup/planmp_full.bak'
WITH REPLACE;
GO
```

## Monitoramento

### Healthcheck
O container inclui healthcheck configurado:
```yaml
healthcheck:
  test: /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P ${SA_PASSWORD} -Q "SELECT 1"
  interval: 10s
  timeout: 3s
  retries: 10
  start_period: 10s
```

### Logs
```bash
# Visualizar logs
docker-compose logs -f db

# Exportar logs
docker-compose logs db > db_logs.txt
```

## Segurança

### Firewall
```bash
# Permitir apenas IPs específicos
ufw allow from 192.168.1.0/24 to any port 1433
```

### Senhas
- Altere a senha padrão
- Use senhas fortes (12+ caracteres)
- Rotacione periodicamente

### TLS/SSL
1. Gere certificados:
```bash
openssl req -x509 -nodes -newkey rsa:2048 -keyout mssql.key -out mssql.crt
```

2. Configure no SQL Server:
```sql
CREATE CERTIFICATE SSL_Cert
FROM FILE = '/var/opt/mssql/certs/mssql.crt'
WITH PRIVATE KEY
(
    FILE = '/var/opt/mssql/certs/mssql.key'
);
```

## Manutenção

### Atualização
```bash
# Atualizar imagem
docker-compose pull db

# Reiniciar serviço
docker-compose up -d --force-recreate db
```

### Limpeza
```bash
# Remover dados antigos
docker-compose down -v

# Limpar backups antigos
find /path/to/backup -name "*.bak" -mtime +30 -delete
```

## Troubleshooting

### Problemas Comuns

1. **Container não inicia**
```bash
# Verificar logs
docker-compose logs db

# Verificar recursos
docker stats
```

2. **Erro de conexão**
```bash
# Testar conexão
sqlcmd -S localhost,1433 -U sa -P YourStrong@Passw0rd -Q "SELECT @@VERSION"
```

3. **Problemas de Performance**
```sql
-- Verificar queries lentas
SELECT * FROM sys.dm_exec_query_stats
CROSS APPLY sys.dm_exec_sql_text(sql_handle)
ORDER BY total_elapsed_time DESC;
```

### Suporte

Para suporte técnico:
- Email: suporte@planmp.org.br
- Documentação: https://docs.planmp.org.br
- GitHub Issues: https://github.com/seu-orgao/planmp/issues 