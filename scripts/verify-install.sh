#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Verificando instalação do PlanMP...${NC}"

# Verifica Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado${NC}"
    echo "Por favor, instale o Docker:"
    echo "  Windows/macOS: https://www.docker.com/products/docker-desktop"
    echo "  Linux: curl -fsSL https://get.docker.com | sh"
    exit 1
fi
echo -e "${GREEN}✅ Docker instalado${NC}"

# Verifica Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não encontrado${NC}"
    echo "Por favor, instale o Docker Compose:"
    echo "  https://docs.docker.com/compose/install/"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose instalado${NC}"

# Verifica se o .env existe
if [ ! -f "docker/.env" ]; then
    echo -e "${RED}❌ Arquivo docker/.env não encontrado${NC}"
    echo "Por favor, copie o arquivo de exemplo:"
    echo "  cp docker/.env.example docker/.env"
    exit 1
fi
echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"

# Verifica container
if ! docker-compose ps | grep -q "db.*running"; then
    echo -e "${RED}❌ Container não está rodando${NC}"
    echo "Tente iniciar com: docker-compose up -d"
    exit 1
fi
echo -e "${GREEN}✅ Container rodando${NC}"

# Testa conexão com banco
echo -e "${YELLOW}Testando conexão com o banco...${NC}"
if ! docker exec planmp-db /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U sa -P YourStrong@Passw0rd \
    -Q "SELECT @@VERSION" &> /dev/null; then
    echo -e "${RED}❌ Não foi possível conectar ao banco${NC}"
    echo "Verifique:"
    echo "  1. Se a senha no .env está correta"
    echo "  2. Se a porta 1433 está livre"
    echo "  3. docker-compose logs db"
    exit 1
fi
echo -e "${GREEN}✅ Conexão com banco OK${NC}"

# Verifica objetos do banco
echo -e "${YELLOW}Verificando objetos do banco...${NC}"

# Função para contar objetos
check_objects() {
    local query="$1"
    local name="$2"
    local count=$(docker exec planmp-db /opt/mssql-tools/bin/sqlcmd \
        -S localhost -U sa -P YourStrong@Passw0rd \
        -Q "$query" -h-1 | tr -d '[:space:]')
    
    if [ "$count" -gt 0 ]; then
        echo -e "${GREEN}✅ $name: $count${NC}"
        return 0
    else
        echo -e "${RED}❌ Nenhum $name encontrado${NC}"
        return 1
    fi
}

# Verifica tabelas
check_objects "USE PlanMP; SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';" "Tabelas"

# Verifica views
check_objects "USE PlanMP; SELECT COUNT(*) FROM INFORMATION_SCHEMA.VIEWS;" "Views"

# Verifica stored procedures
check_objects "USE PlanMP; SELECT COUNT(*) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE';" "Stored Procedures"

# Verifica triggers
check_objects "USE PlanMP; SELECT COUNT(*) FROM sys.triggers;" "Triggers"

# Verifica índices
check_objects "USE PlanMP; SELECT COUNT(*) FROM sys.indexes WHERE index_id > 0;" "Índices"

echo -e "\n${GREEN}✅ Verificação concluída!${NC}"
echo -e "\nPróximos passos:"
echo "1. Conecte ao banco usando:"
echo "   - Host: localhost"
echo "   - Porta: 1433"
echo "   - Usuário: sa"
echo "   - Senha: YourStrong@Passw0rd"
echo "   - Banco: PlanMP"
echo "2. Explore a documentação em docs/"
echo "3. Execute queries de teste"

# Permissões de execução
chmod +x scripts/verify-install.sh 