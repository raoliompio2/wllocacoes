// Utilitário para eventos do Google Analytics 4
// Específico para o sistema WL Locações de equipamentos

declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: any) => void;
  }
}

// Tipos para os eventos
export interface Equipment {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  brand?: string;
  model?: string;
}

export interface BudgetRequest {
  id: string;
  equipment: Equipment;
  startDate: string;
  endDate: string;
  totalValue: number;
  clientName?: string;
  clientPhone?: string;
}

export interface ContactInfo {
  method: 'whatsapp' | 'email' | 'phone' | 'form';
  equipmentId?: string;
  equipmentName?: string;
  page?: string;
}

// Função auxiliar para verificar se o gtag está disponível
const isGtagAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Eventos de Navegação
export const trackPageView = (pagePath: string, pageTitle: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag!('config', 'G-LGH00T8FJS', {
    page_path: pagePath,
    page_title: pageTitle,
  });
};

export const trackEquipmentView = (equipment: Equipment) => {
  if (!isGtagAvailable()) return;
  
  window.gtag!('event', 'view_item', {
    currency: 'BRL',
    value: equipment.price,
    items: [{
      item_id: equipment.id,
      item_name: equipment.name,
      item_category: equipment.category,
      item_category2: equipment.subcategory,
      item_brand: equipment.brand || 'WL Locações',
      item_variant: equipment.model,
      price: equipment.price,
      quantity: 1
    }]
  });
};

export const trackSearch = (searchTerm: string, resultsCount: number, category?: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag!('event', 'search', {
    search_term: searchTerm,
    search_results: resultsCount,
    search_category: category
  });
};

export const trackCategoryView = (category: string, itemsCount: number) => {
  if (!isGtagAvailable()) return;
  
  window.gtag!('event', 'view_item_list', {
    item_list_id: category.toLowerCase().replace(/\s+/g, '_'),
    item_list_name: category,
    items_count: itemsCount
  });
};

// Eventos de Interesse Comercial
export const trackBudgetRequest = (budgetRequest: BudgetRequest) => {
  if (!isGtagAvailable()) return;
  
  window.gtag!('event', 'generate_lead', {
    currency: 'BRL',
    value: budgetRequest.totalValue,
    lead_type: 'budget_request',
    equipment_category: budgetRequest.equipment.category,
    equipment_id: budgetRequest.equipment.id,
    equipment_name: budgetRequest.equipment.name,
    rental_days: calculateDays(budgetRequest.startDate, budgetRequest.endDate)
  });
};

export const trackContact = (contactInfo: ContactInfo) => {
  if (!isGtagAvailable()) return;
  
  window.gtag!('event', 'contact', {
    method: contactInfo.method,
    equipment_id: contactInfo.equipmentId,
    equipment_name: contactInfo.equipmentName,
    page_location: contactInfo.page || window.location.pathname
  });
};

export const trackWhatsAppClick = (equipmentId?: string, equipmentName?: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag!('event', 'contact_whatsapp', {
    method: 'whatsapp',
    equipment_id: equipmentId,
    equipment_name: equipmentName,
    page_location: window.location.pathname
  });
};

export const trackEmailClick = (equipmentId?: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag!('event', 'contact_email', {
    method: 'email',
    equipment_id: equipmentId,
    page_location: window.location.pathname
  });
};

// Eventos de Conversão
export const trackBookingComplete = (budgetRequest: BudgetRequest) => {
  if (!isGtagAvailable()) return;
  
  window.gtag!('event', 'purchase', {
    transaction_id: budgetRequest.id,
    currency: 'BRL',
    value: budgetRequest.totalValue,
    items: [{
      item_id: budgetRequest.equipment.id,
      item_name: budgetRequest.equipment.name,
      item_category: budgetRequest.equipment.category,
      item_brand: budgetRequest.equipment.brand || 'WL Locações',
      price: budgetRequest.equipment.price,
      quantity: 1
    }]
  });
};

export const trackReviewSubmission = (equipmentId: string, rating: number, reviewType: 'equipment' | 'service' = 'equipment') => {
  if (!isGtagAvailable()) return;
  
  window.gtag!('event', 'review_submitted', {
    rating: rating,
    equipment_id: equipmentId,
    review_type: reviewType,
    engagement_score: rating >= 4 ? 'high' : rating >= 3 ? 'medium' : 'low'
  });
};

// Eventos de Engajamento
export const trackFileDownload = (fileName: string, fileType: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag!('event', 'file_download', {
    file_name: fileName,
    file_extension: fileType,
    link_url: window.location.href
  });
};

export const trackVideoPlay = (videoName: string, equipmentId?: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag!('event', 'video_play', {
    video_title: videoName,
    equipment_id: equipmentId,
    page_location: window.location.pathname
  });
};

export const trackImageView = (imageName: string, equipmentId: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag!('event', 'image_view', {
    image_name: imageName,
    equipment_id: equipmentId,
    page_location: window.location.pathname
  });
};

// Eventos de Navegação Específicos
export const trackFilterUsage = (filterType: string, filterValue: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag!('event', 'filter_used', {
    filter_type: filterType,
    filter_value: filterValue,
    page_location: window.location.pathname
  });
};

export const trackSortUsage = (sortType: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag!('event', 'sort_used', {
    sort_type: sortType,
    page_location: window.location.pathname
  });
};

// Eventos de Erro
export const trackError = (errorType: string, errorMessage: string, page?: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag!('event', 'exception', {
    description: errorMessage,
    error_type: errorType,
    page_location: page || window.location.pathname,
    fatal: false
  });
};

// Eventos de Performance
export const trackLoadTime = (pageName: string, loadTime: number) => {
  if (!isGtagAvailable()) return;
  
  window.gtag!('event', 'page_load_time', {
    page_name: pageName,
    load_time: loadTime,
    custom_parameter: 'performance_tracking'
  });
};

// Funções auxiliares
const calculateDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Configuração avançada
export const setUserProperties = (userId: string, userType: 'client' | 'owner', city?: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag!('config', 'G-LGH00T8FJS', {
    user_id: userId,
    custom_map: {
      'user_type': userType,
      'user_city': city || 'Ponta Porã'
    }
  });
};

// Exportar todas as funções para uso em componentes
export const Analytics = {
  // Navegação
  trackPageView,
  trackEquipmentView,
  trackSearch,
  trackCategoryView,
  
  // Interesse comercial
  trackBudgetRequest,
  trackContact,
  trackWhatsAppClick,
  trackEmailClick,
  
  // Conversão
  trackBookingComplete,
  trackReviewSubmission,
  
  // Engajamento
  trackFileDownload,
  trackVideoPlay,
  trackImageView,
  trackFilterUsage,
  trackSortUsage,
  
  // Sistema
  trackError,
  trackLoadTime,
  setUserProperties
};

// ===================================================================
// GOOGLE ADS CONVERSION TRACKING
// ===================================================================

// Evento de conversão: Solicitação de Orçamento
export const trackGoogleAdsConversion = (conversionLabel: string, value?: number) => {
  if (!isGtagAvailable()) return;
  
  try {
    window.gtag!('event', 'conversion', {
      'send_to': `AW-17362713475/${conversionLabel}`,
      'value': value || 0,
      'currency': 'BRL'
    });
    
    console.log('🎯 Google Ads - Conversão rastreada:', conversionLabel, value);
  } catch (error) {
    console.error('❌ Erro ao rastrear conversão Google Ads:', error);
  }
};

// Evento de conversão: WhatsApp Contact
export const trackWhatsAppConversion = (equipmentName?: string, value?: number) => {
  trackGoogleAdsConversion('WhatsApp_Contact', value);
  
  // Também manter o evento do GA4
  trackWhatsAppClick('conversion', equipmentName);
};

// Evento de conversão: Budget Request
export const trackBudgetConversion = (budgetValue: number, equipmentName?: string) => {
  trackGoogleAdsConversion('Budget_Request', budgetValue);
  
  // Também manter o evento do GA4 
  trackBudgetRequest({
    id: Date.now().toString(),
    equipment: {
      id: 'conversion',
      name: equipmentName || 'Não especificado',
      category: 'conversion',
      price: budgetValue
    },
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    totalValue: budgetValue
  });
};

// Evento de conversão: Phone Call
export const trackPhoneConversion = () => {
  trackGoogleAdsConversion('Phone_Call');
  
  // Também rastrear no GA4
  trackContact({
    method: 'phone',
    page: window.location.pathname
  });
};

// Evento de conversão: Form Submission
export const trackFormConversion = (formType: string, value?: number) => {
  trackGoogleAdsConversion('Form_Submission', value);
  
  console.log('📋 Google Ads - Formulário enviado:', formType);
};