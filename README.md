# 🌸 Veratine - E-commerce de Flores e Plantas

Uma aplicação full-stack desenvolvida para comercializar flores e plantas online, com interface responsiva, autenticação moderna e experiência de usuário otimizada.

**Projeto Acadêmico** - Disciplina: Software Product: Analysis, Specification, Project & Implementation
**Desenvolvedor:** Alanis Ribeiro

---

## 📋 Visão Geral

**Veratine**

- ✅ Autenticação com JWT e Google OAuth
- ✅ Catálogo de 11 categorias com 15+ produtos
- ✅ Carrinho de compras 
- ✅ Sistema de favoritos
- ✅ Busca e filtros

---

## 🛠️ Stack Tecnológico

### 🎨 Frontend
| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| React | 18+ | Biblioteca UI |
| React Router | v6 | Roteamento |
| Axios | - | Cliente HTTP |
| Vite | - | Build tool |
| CSS Puro | - | Estilização |

### ⚙️ Backend
| Tecnologia | Propósito |
|-----------|----------|
| Node.js + Express | Servidor web |
| SQLite (better-sqlite3) | Banco de dados |
| JWT | Autenticação |
| bcryptjs | Hash de senhas |
| CORS | Compartilhamento de recursos |

---

## 🎯 Funcionalidades (AC1 - 15/03/2026)

### 🔐 Autenticação
- Login com email e senha
- Cadastro de novos usuários
- Google OAuth 2.0 integrado
- Modo visitante (guest)
- Persistência de sessão com JWT

### 📦 Catálogo
- 11 categorias (Girassóis, Orquídeas, Rosas, Suculentas, etc.)
- 15+ produtos com imagens, descrição e avaliação
- Carrossel de ofertas especiais
- Filtro por categoria
- Busca dinâmica de produtos

### 🛒 Carrinho
- Adicionar/remover produtos
- Ajustar quantidades
- Cálculo automático de subtotal
- Persistência em localStorage
- Interface intuitiva com indicadores visuais

### ❤️ Favoritos
- Marcar/desmarcar como favorito
- Página dedicada de favoritos
- Sincronização com backend (quando logado)

---
🎯 Funcionalidades (AC2 - 12/04/2026)

## 🔍 Busca Avançada e Filtros
- Busca por nome de produto em tempo real
- Filtro por categoria com seleção múltipla
- Filtro por faixa de preço (min/max)
- Ordenação (relevância, preço, avaliação)
- Página de resultados dinâmica
- Paginação com limite de itens por página
- Interface intuitiva com contador de resultados
  
## 📱 Responsividade Mobile
- Breakpoints otimizados: 360px, 480px, 600px, 768px, 1024px+
- Layout adaptativo para todos os dispositivos
- Carrossel mobile edge-to-edge (categorias)
- Botões e inputs com min 44px para touch
- Font-size 16px+ em inputs (evita zoom iOS)
- BottomNav flutuante para navegação mobile
- Grid de produtos responsivo (1-4 colunas)
- Imagens otimizadas com srcset
  
## 🌙 Modo Dark e Acessibilidade
- Toggle dark/light theme persistente
- Paleta de cores adaptada para cada tema
- Alto contraste em modo dark
- Suporte a prefers-color-scheme do navegador
- Variáveis CSS para fácil manutenção
- Animações reduzidas em prefers-reduced-motion
- Labels acessíveis e ARIA attributes
- Navegação via teclado (tab, enter, escape)
  
## 🌸 Alma das Flores (Detalhes Completos)
- Página dedicada por produto com:
- Nome, preço e avaliação média
- Descrição detalhada
- Origem e características (espécie, habitat, período de floração)
- Cuidados específicos (água, luz, temperatura, umidade)
- Significado simbólico (mensagem da flor)
- Galeria de imagens
- Disponibilidade e stock
- Reviews/avaliações de clientes
- Botão comprar integrado com carrinho

## 💳 Meios de Pagamento
- PIX com QR Code gerado automaticamente
- Cartão de Crédito com validação de campos
- Integração com MercadoPago (modo simulação)
- Cálculo de parcelamento (até 12x)
- Histórico de transações
- Status de pagamento em tempo real
- Suporte a cupons de desconto no checkout
- Confirmação visual de pagamento bem-sucedido
  
## 👤 Gerenciamento de Usuário

Perfil do Usuário:
- Avatar com iniciais como fallback
- Nome, email, data de cadastro
- Edição de nome (email protegido)
  
Alterar Senha:

- Validação de senha atual
- Confirmação de nova senha
- Feedback visual de força da senha
- Histórico de Pedidos:
- Lista completa de todas as compras
- Status de cada pedido (pending, paid, shipped, delivered)
- Rastreamento em tempo real
- Recompra rápida de itens anteriores
  
Gerenciar Endereços:

- CRUD de endereços (máx 5)
- Definir endereço padrão
- Editar/deletar endereços
- Validação de campos
- Persistência em localStorage e backend
  
Notificações:

- Toggle para notificações por email
- Controle de frequência (diária/semanal)
- Preferências de tipo (pedidos, promoções, newsletter)
- Status salvo em localStorage



## 📊 Checklist AC1

- [x] Autenticação (Email + Google OAuth)
- [x] Catálogo de Produtos
- [x] Carrinho de Compras
- [x] Favoritos
- [x] Busca
- [x] Filtros por Categoria

## 📊 Checklist AC2

- [x] Busca e filtros
- [x] Responsividade Mobile
- [x] Modo dark - Acessibilidade
- [x] Alma das flores - Sobre / Cuidados / Significado
- [x] Meio de pagamento - PIX / Cartão
- [x] Usuário - Editar / Endereço / Pedidos / Notificações


**Desenvolvido por Alanis Ribeiro**
