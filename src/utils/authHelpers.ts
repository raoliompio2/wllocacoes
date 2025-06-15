import { supabase } from './supabaseClient';

/**
 * Verifica se o usuário atual é um proprietário
 * @returns Promise<boolean> Verdadeiro se o usuário for proprietário
 */
export const isUserOwner = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    return profile?.role === 'proprietario';
  } catch (error) {
    console.error('Erro ao verificar papel do usuário:', error);
    return false;
  }
};

/**
 * Verifica se o usuário atual tem permissão para editar um equipamento específico
 * @param equipmentId ID do equipamento a ser verificado
 * @returns Promise<boolean> Verdadeiro se o usuário tiver permissão
 */
export const canUserEditEquipment = async (equipmentId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const { data: equipment } = await supabase
      .from('equipment')
      .select('user_id')
      .eq('id', equipmentId)
      .single();
      
    if (!equipment) return false;
    
    return equipment.user_id === user.id;
  } catch (error) {
    console.error('Erro ao verificar permissão do usuário para o equipamento:', error);
    return false;
  }
};

/**
 * Busca o usuário atual e verifica se ele está autenticado
 * @returns Promise com o usuário atual ou null se não estiver autenticado
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}; 