# Guia de Troubleshooting - PlanMP

## Problemas Comuns e Soluções

### 1. Docker não Inicia

#### Sintomas
- Erro ao executar `docker-compose up`
- Container não aparece em `docker ps`

#### Soluções
1. **Verifique o serviço Docker**
```bash
# Windows
net start com.docker.service

# Linux
sudo systemctl status docker
sudo systemctl restart docker

# macOS
killall Docker && open /Applications/Docker.app
```

2. **Verifique portas em uso**
```bash
# Windows
netstat -ano | findstr :1433

# Linux/macOS
lsof -i :1433
```

3. **Limpe recursos Docker**
```bash
docker system prune -a
docker volume prune
```

### 2. Erro de Conexão com SQL Server

#### Sintomas
- "Connection refused"
- "Login failed for user 'sa'"
- Timeout na conexão

#### Soluções
1. **Verifique se o container está rodando**
```bash
docker-compose ps
docker-compose logs db
```

2. **Teste a conexão direta**
```bash
docker exec -it planmp-db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrong@Passw0rd \
  -Q "SELECT @@VERSION"
```

3. **Verifique as variáveis de ambiente**
```bash
cat docker/.env
docker-compose config
```

### 3. Objetos do Banco não Criados

#### Sintomas
- Tabelas não aparecem
- Views não existem
- Erro em stored procedures

#### Soluções
1. **Verifique logs de inicialização**
```bash
docker-compose logs db | grep -i error
```

2. **Execute scripts manualmente**
```bash
# Conecte ao container
docker exec -it planmp-db bash

# Execute scripts
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -i /docker-entrypoint-initdb.d/01-schema.sql
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -i /docker-entrypoint-initdb.d/02-indexes.sql
```

3. **Verifique permissões**
```sql
SELECT * FROM sys.fn_my_permissions(NULL, 'DATABASE');
```

### 4. Problemas de Performance

#### Sintomas
- Queries lentas
- Alto uso de CPU/memória
- Timeouts frequentes

#### Soluções
1. **Verifique recursos do sistema**
```bash
docker stats planmp-db
```

2. **Analise queries lentas**
```sql
SELECT TOP 10 
    qs.total_elapsed_time/qs.execution_count as avg_elapsed_time,
    SUBSTRING(qt.text,qs.statement_start_offset/2, 
        (CASE WHEN qs.statement_end_offset = -1 
            THEN LEN(CONVERT(NVARCHAR(MAX), qt.text)) * 2 
            ELSE qs.statement_end_offset END - qs.statement_start_offset)/2) as query_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
ORDER BY avg_elapsed_time DESC;
```

3. **Verifique índices fragmentados**
```sql
SELECT 
    OBJECT_NAME(ind.OBJECT_ID) AS TableName,
    ind.name AS IndexName,
    indexstats.avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, NULL) indexstats
INNER JOIN sys.indexes ind ON ind.object_id = indexstats.object_id
WHERE indexstats.avg_fragmentation_in_percent > 30
ORDER BY indexstats.avg_fragmentation_in_percent DESC;
```

### 5. Problemas de Permissão

#### Sintomas
- "Permission denied"
- Erro ao criar/modificar objetos
- Acesso negado a views

#### Soluções
1. **Verifique permissões do usuário**
```sql
SELECT * FROM fn_my_permissions(NULL, 'DATABASE');
SELECT * FROM fn_my_permissions('dbo.Users', 'OBJECT');
```

2. **Recrie o usuário SA**
```sql
ALTER LOGIN sa ENABLE;
ALTER LOGIN sa WITH PASSWORD = 'YourStrong@Passw0rd';
```

3. **Verifique ownership das databases**
```sql
SELECT name, suser_sname(owner_sid) FROM sys.databases;
```

## Coleta de Logs para Suporte

### 1. Logs do Container
```bash
# Todos os logs
docker-compose logs > docker_logs.txt

# Apenas logs do banco
docker-compose logs db > db_logs.txt
```

### 2. Logs do SQL Server
```sql
-- Últimos logs de erro
EXEC sp_readerrorlog;

-- Configurações atuais
EXEC sp_configure;

-- Estado das databases
SELECT name, state_desc FROM sys.databases;
```

### 3. Informações do Sistema
```bash
# Versão do Docker
docker version > system_info.txt
docker-compose version >> system_info.txt

# Recursos do sistema
docker stats --no-stream >> system_info.txt
```

## Contato Suporte

Se o problema persistir:

1. Colete todos os logs mencionados acima
2. Descreva o problema detalhadamente
3. Entre em contato:
   - Email: suporte@planmp.org.br
   - GitHub Issues: [Criar Issue](https://github.com/seu-orgao/planmp/issues)
   - Documentação: [docs.planmp.org.br](https://docs.planmp.org.br) 