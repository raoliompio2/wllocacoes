# 📊 Google Analytics 4 - Guia de Eventos da WL Locações

Este documento detalha todos os eventos de analytics configurados para o sistema WL Locações e como usá-los.

## 🚀 Eventos Implementados

### 1. **Eventos de Navegação**

#### Visualização de Equipamento
```typescript
import { trackEquipmentView } from '../utils/analytics';

// Quando o usuário visualiza um equipamento
trackEquipmentView({
  id: 'betoneira-123',
  name: 'Betoneira 400L',
  category: 'Betoneiras',
  subcategory: 'Equipamentos de Concreto',
  price: 150.00,
  brand: 'WL Locações',
  model: 'BET-400L'
});
```

#### Busca de Equipamentos
```typescript
import { trackSearch } from '../utils/analytics';

// Quando o usuário faz uma busca
trackSearch('betoneira', 12, 'Equipamentos de Concreto');
```

#### Visualização de Categoria
```typescript
import { trackCategoryView } from '../utils/analytics';

// Quando o usuário visualiza uma categoria
trackCategoryView('Compactadores', 8);
```

### 2. **Eventos de Interesse Comercial**

#### Solicitação de Orçamento
```typescript
import { trackBudgetRequest } from '../utils/analytics';

// Quando o usuário solicita um orçamento
trackBudgetRequest({
  id: 'ORC-2024-001',
  equipment: {
    id: 'compactador-456',
    name: 'Compactador de Solo',
    category: 'Compactadores',
    price: 200.00
  },
  startDate: '2024-01-15',
  endDate: '2024-01-20',
  totalValue: 1000.00,
  clientName: 'João Silva'
});
```

#### Contato via WhatsApp
```typescript
import { trackWhatsAppClick } from '../utils/analytics';

// Quando o usuário clica no WhatsApp
trackWhatsAppClick('gerador-789', 'Gerador 15kVA');
```

#### Contato via Email
```typescript
import { trackEmailClick } from '../utils/analytics';

// Quando o usuário clica no email
trackEmailClick('andaime-321');
```

### 3. **Eventos de Conversão**

#### Reserva Confirmada
```typescript
import { trackBookingComplete } from '../utils/analytics';

// Quando uma reserva é confirmada
trackBookingComplete({
  id: 'RES-2024-001',
  equipment: {
    id: 'escavadeira-999',
    name: 'Escavadeira Hidráulica',
    category: 'Escavadeiras',
    price: 800.00
  },
  startDate: '2024-01-20',
  endDate: '2024-01-25',
  totalValue: 4000.00,
  clientName: 'Maria Santos'
});
```

#### Avaliação Enviada
```typescript
import { trackReviewSubmission } from '../utils/analytics';

// Quando o usuário envia uma avaliação
trackReviewSubmission('betoneira-123', 5, 'equipment');
```

### 4. **Eventos de Engajamento**

#### Download de Arquivo
```typescript
import { trackFileDownload } from '../utils/analytics';

// Quando o usuário baixa um arquivo
trackFileDownload('manual-betoneira.pdf', 'pdf');
```

#### Reprodução de Vídeo
```typescript
import { trackVideoPlay } from '../utils/analytics';

// Quando o usuário reproduz um vídeo
trackVideoPlay('Como usar betoneira', 'betoneira-123');
```

#### Visualização de Imagem
```typescript
import { trackImageView } from '../utils/analytics';

// Quando o usuário visualiza uma imagem
trackImageView('betoneira-frontal.jpg', 'betoneira-123');
```

### 5. **Eventos de Navegação Específicos**

#### Uso de Filtros
```typescript
import { trackFilterUsage } from '../utils/analytics';

// Quando o usuário usa um filtro
trackFilterUsage('categoria', 'Compactadores');
trackFilterUsage('preco', '100-500');
trackFilterUsage('localizacao', 'Ponta Porã');
```

#### Uso de Ordenação
```typescript
import { trackSortUsage } from '../utils/analytics';

// Quando o usuário ordena os resultados
trackSortUsage('preco_menor');
trackSortUsage('preco_maior');
trackSortUsage('mais_avaliados');
```

### 6. **Eventos de Sistema**

#### Erro de Sistema
```typescript
import { trackError } from '../utils/analytics';

// Quando ocorre um erro
trackError('api_error', 'Erro ao carregar equipamentos', '/equipamentos');
```

#### Tempo de Carregamento
```typescript
import { trackLoadTime } from '../utils/analytics';

// Para medir performance
trackLoadTime('homepage', 2300); // 2.3 segundos
```

## 🎯 **Implementação Prática nos Componentes**

### Exemplo: Página de Equipamentos
```typescript
// src/components/public/EquipmentPage.tsx
import React, { useEffect } from 'react';
import { trackCategoryView, trackSearch, trackFilterUsage } from '../../utils/analytics';

const EquipmentPage = () => {
  const [equipments, setEquipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Rastrear visualização de categoria
  useEffect(() => {
    if (selectedCategory) {
      trackCategoryView(selectedCategory, equipments.length);
    }
  }, [selectedCategory, equipments.length]);

  // Rastrear busca
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    trackSearch(term, equipments.length, selectedCategory);
  };

  // Rastrear uso de filtro
  const handleFilter = (filterType: string, value: string) => {
    trackFilterUsage(filterType, value);
  };

  return (
    // JSX do componente
  );
};
```

### Exemplo: Card de Equipamento
```typescript
// src/components/public/EquipmentCard.tsx
import React from 'react';
import { trackEquipmentView, trackWhatsAppClick } from '../../utils/analytics';

const EquipmentCard = ({ equipment }) => {
  const handleViewClick = () => {
    trackEquipmentView({
      id: equipment.id,
      name: equipment.name,
      category: equipment.category,
      price: equipment.daily_rate
    });
  };

  const handleWhatsAppClick = () => {
    trackWhatsAppClick(equipment.id, equipment.name);
  };

  return (
    <div onClick={handleViewClick}>
      {/* Conteúdo do card */}
      <button onClick={handleWhatsAppClick}>
        WhatsApp
      </button>
    </div>
  );
};
```

## 📈 **Relatórios no Google Analytics**

### Principais Métricas a Acompanhar:

1. **Funil de Conversão**
   - Visualizações de equipamentos
   - Solicitações de orçamento
   - Reservas confirmadas

2. **Comportamento do Usuário**
   - Termos de busca mais populares
   - Categorias mais visitadas
   - Filtros mais utilizados

3. **Canais de Contato**
   - Cliques no WhatsApp
   - Cliques no email
   - Formulários enviados

4. **Performance**
   - Tempo de carregamento das páginas
   - Erros de sistema
   - Taxa de engajamento

## 🔧 **Configuração Avançada**

### Propriedades do Usuário
```typescript
import { setUserProperties } from '../utils/analytics';

// Configurar propriedades do usuário
setUserProperties('user123', 'client', 'Ponta Porã');
```

### Eventos Personalizados
```typescript
// Para eventos específicos do seu negócio
gtag('event', 'equipment_favorite', {
  equipment_id: 'betoneira-123',
  equipment_name: 'Betoneira 400L',
  user_type: 'client'
});
```

## 🚨 **Boas Práticas**

1. **Não rastrear dados sensíveis** (senhas, dados pessoais)
2. **Usar valores consistentes** para categorias e IDs
3. **Testar eventos** antes de fazer deploy
4. **Documentar eventos customizados**
5. **Revisar regularmente** os dados coletados

## 🧪 **Testes**

### Verificar se os eventos estão funcionando:
1. Abrir Developer Tools do navegador
2. Ir para a aba "Network"
3. Filtrar por "collect"
4. Executar ações no site
5. Verificar se as requisições para o GA4 estão sendo enviadas

### Usar o Google Analytics DebugView:
1. Instalar a extensão "Google Analytics Debugger"
2. Ativar o modo debug
3. Verificar eventos em tempo real no GA4

---

**🎉 Pronto! Agora você tem um sistema completo de tracking para a WL Locações!** 