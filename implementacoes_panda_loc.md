# Implementações no Sistema Panda Loc

Este documento detalha todas as implementações e correções realizadas no sistema Panda Loc para melhorar o processo de solicitação de orçamentos e envio de emails.

## 1. Sistema de Emails

### 1.1 Correção da Tabela de Logs de Email

Adicionamos as colunas necessárias à tabela `email_logs`:

```sql
ALTER TABLE email_logs 
ADD COLUMN body TEXT,
ADD COLUMN email_from VARCHAR(255);
```

### 1.2 Implementação do Campo de Email de Notificação

Adicionamos um campo para configurar o email destinatário padrão:

```sql
ALTER TABLE smtp_settings 
ADD COLUMN notification_email VARCHAR(255);
```

## 2. Integração com EmailJS

### 2.1 Instalação e Configuração

```bash
npm install @emailjs/browser
```

### 2.2 Configuração no Frontend

```typescript
// src/utils/emailService.ts
import emailjs from '@emailjs/browser';

export const sendEmail = async (templateParams: any) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  
  try {
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );
    return { success: true, response };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error };
  }
};
```

### 2.3 Configuração de Variáveis de Ambiente

```
VITE_EMAILJS_SERVICE_ID=seu_service_id
VITE_EMAILJS_TEMPLATE_ID=seu_template_id
VITE_EMAILJS_PUBLIC_KEY=sua_public_key
```

### 2.4 Template de Email Profissional

Criamos um template HTML responsivo com as cores da marca (verde #458500) e o domínio correto (pandalocacoes.com.br).

## 3. Solução para Registro de Orçamentos via WhatsApp

### 3.1 Adição da Coluna Contact Method

```sql
ALTER TABLE budget_requests 
ADD COLUMN contact_method VARCHAR(50);
```

### 3.2 Otimização do Botão de WhatsApp

Modificamos a função `handleWhatsAppClick` para abrir o WhatsApp imediatamente e registrar o orçamento em segundo plano:

```typescript
// src/components/public/EquipmentDetailPage.tsx
const handleWhatsAppClick = () => {
  // Preparar a URL do WhatsApp
  const message = `Olá! Estou interessado em alugar ${equipment?.name}. Poderia me enviar mais informações?`;
  const whatsappUrl = `https://wa.me/${ownerWhatsapp}?text=${encodeURIComponent(message)}`;
  
  // Abrir o WhatsApp imediatamente
  window.open(whatsappUrl, '_blank');
  
  // Registrar o orçamento em segundo plano
  setTimeout(async () => {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      // Buscar o ID do proprietário do equipamento
      const { data: equipData, error: equipError } = await supabase
        .from('equipment')
        .select('user_id')
        .eq('id', equipment?.id)
        .single();
        
      if (equipError) {
        console.error('Erro ao buscar proprietário do equipamento:', equipError);
        return;
      }
      
      // Registrar a solicitação de orçamento no banco de dados
      const { error } = await supabase.from('budget_requests').insert({
        equipment_id: equipment?.id,
        client_id: user?.id || null,
        owner_id: equipData?.user_id,
        status: 'pending',
        created_at: new Date().toISOString(),
        contact_method: 'whatsapp',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        client_name: user?.user_metadata?.name || 'Cliente WhatsApp',
        client_email: user?.email || null,
        client_phone: null,
        client_type: user ? 'user' : 'guest',
      });
      
      if (error) {
        console.error('Erro ao registrar solicitação de orçamento:', error);
      }
    } catch (error) {
      console.error('Erro ao processar solicitação de orçamento:', error);
    }
  }, 100);
};
```

### 3.3 Correção do Tipo de Cliente

Verificamos que a constraint `budget_requests_client_type_check` permite apenas os valores 'user' ou 'guest', então corrigimos o código:

```typescript
client_type: user ? 'user' : 'guest', // Antes estava 'registered'
```

## 4. Correção do Dashboard de Orçamentos

### 4.1 Atualização do Componente OwnerBudgetsDashboard

Modificamos o componente para lidar corretamente com orçamentos via WhatsApp que não têm client_id:

```typescript
// src/components/Dashboard/OwnerBudgetsDashboard.tsx
try {
  // Buscar informações do equipamento
  const { data: equipmentData } = await supabase
    .from('equipment')
    .select('id, name, image, category')
    .eq('id', budget.equipment_id)
    .single();
  
  // Verificar se existe client_id antes de buscar dados do cliente
  let clientData = null;
  if (budget.client_id) {
    const { data: clientResponse } = await supabase
      .from('profiles')
      .select('id, name, email, phone, avatar_url')
      .eq('id', budget.client_id)
      .single();
    clientData = clientResponse;
  }
  
  // Retornar o orçamento processado com informações relacionadas
  return {
    ...budget,
    equipment: equipmentData || null,
    client: clientData || {
      name: budget.client_name || 'Cliente WhatsApp',
      email: budget.client_email || 'Via WhatsApp',
      phone: budget.client_phone || 'N/A'
    }
  };
} catch (error) {
  console.error('Erro ao processar orçamento:', error);
  return budget;
}
```

### 4.2 Atualização do Componente BudgetDetailsDialog

Modificamos o componente para exibir corretamente os orçamentos via WhatsApp:

```typescript
// src/components/Budgets/BudgetDetailsDialog.tsx
<Box display="flex" alignItems="flex-start" mb={2}>
  <Avatar 
    src={budget.client?.avatar_url || ''} 
    sx={{ width: 48, height: 48, mr: 2, mt: 0.5 }}
  >
    {(budget.client?.name || budget.client_name || 'C')[0]}
  </Avatar>
  <Box>
    <Typography variant="body1" fontWeight={500}>
      {budget.client?.name || budget.client_name || 'Cliente via WhatsApp'}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
      <MessageSquare size={14} style={{ marginRight: 6 }} />
      {budget.client?.email || budget.client_email || 'Contato via WhatsApp'}
    </Typography>
    {(budget.client?.phone || budget.client_phone || budget.contact_method === 'whatsapp') && (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
          <Phone size={14} style={{ marginRight: 6 }} />
          {budget.client?.phone || budget.client_phone || 'Contato via WhatsApp'}
        </Typography>
        {budget.contact_method === 'whatsapp' && (
          <Chip 
            size="small" 
            color="success" 
            label="Via WhatsApp" 
            icon={<MessageSquare size={12} />} 
            sx={{ mt: 1 }} 
          />
        )}
      </Box>
    )}
  </Box>
</Box>
```

### 4.3 Atualização da Interface BudgetRequest

Atualizamos a interface para refletir os novos campos:

```typescript
// src/types/types.ts
interface BudgetRequest {
  id: string;
  equipment_id: string;
  client_id: string | null;
  owner_id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number | null;
  special_requirements: string | null;
  delivery_address: string | null;
  created_at: string;
  updated_at: string;
  equipment?: Equipment | any;
  client?: {
    id: string;
    name: string | null;
    email: string | null;
    avatar_url?: string | null;
    phone?: string | null;
  } | null;
  ownerName?: string | null;
  ownerWhatsapp?: string | null;
  ownerAddress?: string | null;
  contact_method?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_type: 'user' | 'guest';
}
```

## 5. Correção de Problemas no CompanyContext

Corrigimos problemas com hooks React no componente CompanyProvider para garantir que o contexto funcione corretamente.

## Conclusão

Todas essas implementações melhoraram significativamente o sistema Panda Loc, permitindo:

1. Registro de orçamentos via WhatsApp sem necessidade de preenchimento de formulário
2. Envio de emails profissionais usando EmailJS
3. Visualização correta de todos os orçamentos no dashboard do proprietário
4. Melhor experiência do usuário com redirecionamento imediato para o WhatsApp

Essas melhorias podem ser facilmente adaptadas para outras aplicações que utilizem o mesmo schema e código base. 