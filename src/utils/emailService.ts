import { supabase } from './supabaseClient';
import emailjs from '@emailjs/browser';

interface EmailConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  notification_email?: string;
  service_id?: string;  // EmailJS service ID
  template_id?: string; // EmailJS template ID
  user_id?: string;     // EmailJS user ID (public key)
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  params?: Record<string, string>;
}

/**
 * Busca as configurações SMTP do banco de dados
 * @returns Configurações de SMTP ou null se não encontradas
 */
export const getEmailConfig = async (): Promise<EmailConfig | null> => {
  try {
    const { data, error } = await supabase
      .from('smtp_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('Erro ao buscar configurações SMTP:', error);
      return null;
    }

    return {
      host: data.host,
      port: data.port,
      username: data.username,
      password: data.password,
      from_email: data.from_email,
      from_name: data.from_name,
      notification_email: data.notification_email,
      service_id: data.service_id,
      template_id: data.template_id,
      user_id: data.user_id
    };
  } catch (err) {
    console.error('Erro ao buscar configurações SMTP:', err);
    return null;
  }
};

/**
 * Envia um email usando EmailJS e registra no banco de dados
 * @param emailData Dados do email a ser enviado
 * @returns true se enviado com sucesso, false caso contrário
 */
export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    // Buscar configurações SMTP
    const config = await getEmailConfig();
    
    if (!config) {
      console.error('Configurações SMTP não encontradas');
      return false;
    }

    // Registrar o email no banco de dados para backup/histórico
    const { error } = await supabase.from('email_logs').insert({
      email_to: emailData.to,
      email_from: `${config.from_name} <${config.from_email}>`,
      subject: emailData.subject,
      body: emailData.html,
      type: 'pending_smtp',
      sent_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Erro ao registrar email no histórico:', error);
      // Continua tentando enviar mesmo com erro no registro
    }

    // Verificar se as configurações do EmailJS estão disponíveis
    if (!config.service_id || !config.template_id || !config.user_id) {
      console.error('Configurações do EmailJS não encontradas');
      return false;
    }

    // Inicializar o EmailJS
    emailjs.init(config.user_id);

    console.log("Enviando para email:", emailData.to);

    // Preparar os dados para o template - incluindo várias possíveis variações do campo de email
    const templateParams = {
      to_email: emailData.to,
      to: emailData.to,
      email: emailData.to,
      recipient: emailData.to,
      destination: emailData.to,
      from_name: config.from_name,
      from_email: config.from_email,
      subject: emailData.subject,
      message_html: emailData.html,
      message: emailData.html,
      content: emailData.html,
      html: emailData.html,
      reply_to: config.from_email,
      // Extrair quaisquer parâmetros extras passados no html
      ...(emailData.params || {})
    };

    // Enviar email usando EmailJS
    const response = await emailjs.send(
      config.service_id,
      config.template_id,
      templateParams
    );

    if (response.status === 200) {
      console.log('Email enviado com sucesso!', response);
      
      // Atualizar status na tabela email_logs
      await supabase
        .from('email_logs')
        .update({ type: 'sent' })
        .eq('email_to', emailData.to)
        .eq('subject', emailData.subject)
        .order('created_at', { ascending: false })
        .limit(1);
        
      return true;
    } else {
      console.error('Falha ao enviar email:', response);
      return false;
    }
  } catch (err) {
    console.error('Erro ao enviar email:', err);
    return false;
  }
};

/**
 * Busca um template de email do banco de dados
 * @param type Tipo do template
 * @returns Template de email ou null se não encontrado
 */
export const getEmailTemplate = async (type: string): Promise<{ subject: string, body: string } | null> => {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('subject, body')
      .eq('type', type)
      .single();

    if (error || !data) {
      console.error('Erro ao buscar template de email:', error);
      return null;
    }

    return {
      subject: data.subject,
      body: data.body,
    };
  } catch (err) {
    console.error('Erro ao buscar template de email:', err);
    return null;
  }
};

/**
 * Envia um email de orçamento
 * @param equipmentName Nome do equipamento
 * @param clientName Nome do cliente (opcional)
 * @param equipmentImageUrl URL da imagem do equipamento (opcional)
 * @returns true se enviado com sucesso, false caso contrário
 */
export const sendBudgetRequestEmail = async (equipmentName: string, clientName?: string, equipmentImageUrl?: string): Promise<boolean> => {
  try {
    // Buscar template
    const template = await getEmailTemplate('budget_request');
    
    if (!template) {
      console.error('Template de email não encontrado');
      return false;
    }

    // Buscar configurações SMTP para obter o email de notificação
    const config = await getEmailConfig();
    
    if (!config) {
      console.error('Configurações SMTP não encontradas');
      return false;
    }
    
    // Usar o email de notificação se disponível, caso contrário usar o email de origem
    const destinationEmail = config.notification_email || config.from_email;
    
    if (!destinationEmail) {
      console.error('Email de destino não configurado');
      return false;
    }

    // Obter a data formatada corretamente
    const now = new Date();
    // Formatação da data no padrão brasileiro: DD/MM/YYYY HH:MM
    const currentDate = now.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Obter URL da imagem do equipamento ou usar um placeholder
    const imageUrl = equipmentImageUrl || 'equipamento-placeholder.png';
    
    // Normalizar o nome do equipamento para possível uso em URL de imagem
    const normalizedEquipmentName = equipmentName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');

    // Substituir variáveis no template
    const html = template.body
      .replace(/\{\{equipment_name\}\}/g, equipmentName)
      .replace(/\{\{client_name\}\}/g, clientName || 'Cliente via WhatsApp')
      .replace(/\{\{date_time\}\}/g, currentDate)
      .replace(/\{\{equipment_image_url\}\}/g, imageUrl);

    const subject = template.subject
      .replace(/\{\{equipment_name\}\}/g, equipmentName);

    // Registrar email para envio com parâmetros explícitos para o EmailJS
    return await sendEmail({
      to: destinationEmail,
      subject: subject,
      html: html,
      params: {
        equipment_name: equipmentName,
        client_name: clientName || 'Cliente via WhatsApp',
        date_time: currentDate,
        equipment_image_url: imageUrl,
        normalized_equipment_name: normalizedEquipmentName
      }
    });
  } catch (err) {
    console.error('Erro ao enviar email de orçamento:', err);
    return false;
  }
}; 