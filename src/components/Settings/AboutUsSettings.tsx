import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Info, Plus, Trash2, Upload, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';

interface AboutUsSection {
  id: string;
  company_id: string;
  title: string;
  content: string;
  image_url: string | null;
  image_alt: string | null;
  section_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

const AboutUsSettings: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [sections, setSections] = useState<AboutUsSection[]>([]);
  const [previewImageUrls, setPreviewImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      loadCompanyInfo();
    }
  }, [user]);

  useEffect(() => {
    if (companyId) {
      loadSections();
    }
  }, [companyId]);

  const loadCompanyInfo = async () => {
    try {
      // @ts-ignore - Ignorando erros de tipo do Supabase temporariamente
      const { data, error } = await supabase
        .from('company_info')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setCompanyId(data.id);
      }
    } catch (err) {
      console.error('Erro ao carregar informações da empresa:', err);
      showNotification('error', 'Erro ao carregar informações da empresa');
    }
  };

  const loadSections = async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      // @ts-ignore - Ignorando erros de tipo do Supabase temporariamente
      const { data, error } = await supabase
        .from('about_us')
        .select('*')
        .eq('company_id', companyId)
        .order('section_order', { ascending: true });

      if (error) throw error;
      
      setSections(data || []);
    } catch (err) {
      console.error('Erro ao carregar seções:', err);
      showNotification('error', 'Erro ao carregar seções da página Sobre Nós');
    } finally {
      setLoading(false);
    }
  };

  const addSection = async () => {
    if (!companyId) return;
    
    const newOrder = sections.length > 0 
      ? Math.max(...sections.map(s => s.section_order)) + 1 
      : 1;
    
    try {
      // @ts-ignore - Ignorando erros de tipo do Supabase temporariamente
      const { data, error } = await supabase
        .from('about_us')
        .insert({
          company_id: companyId,
          title: 'Nova Seção',
          content: 'Adicione o conteúdo aqui...',
          section_order: newOrder,
          is_visible: true
        })
        .select()
        .single();

      if (error) throw error;
      
      setSections([...sections, data]);
      showNotification('success', 'Nova seção adicionada com sucesso');
    } catch (err) {
      console.error('Erro ao adicionar seção:', err);
      showNotification('error', 'Erro ao adicionar nova seção');
    }
  };

  const updateSection = async (updatedSection: AboutUsSection) => {
    try {
      // @ts-ignore - Ignorando erros de tipo do Supabase temporariamente
      const { error } = await supabase
        .from('about_us')
        .update(updatedSection)
        .eq('id', updatedSection.id);

      if (error) throw error;
      
      setSections(sections.map(section => 
        section.id === updatedSection.id ? updatedSection : section
      ));
      
      showNotification('success', 'Seção atualizada com sucesso');
    } catch (err) {
      console.error('Erro ao atualizar seção:', err);
      showNotification('error', 'Erro ao atualizar seção');
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta seção? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      // @ts-ignore - Ignorando erros de tipo do Supabase temporariamente
      const { error } = await supabase
        .from('about_us')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;
      
      setSections(sections.filter(section => section.id !== sectionId));
      showNotification('success', 'Seção excluída com sucesso');
    } catch (err) {
      console.error('Erro ao excluir seção:', err);
      showNotification('error', 'Erro ao excluir seção');
    }
  };

  const moveSection = async (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    
    // Atualiza localmente
    const updatedSections = [...sections];
    const currentOrder = updatedSections[currentIndex].section_order;
    const targetOrder = updatedSections[newIndex].section_order;
    
    updatedSections[currentIndex].section_order = targetOrder;
    updatedSections[newIndex].section_order = currentOrder;
    
    // Reordena a lista
    updatedSections.sort((a, b) => a.section_order - b.section_order);
    setSections(updatedSections);
    
    // Salva no banco de dados
    try {
      // @ts-ignore - Ignorando erros de tipo do Supabase temporariamente
      const { error: error1 } = await supabase
        .from('about_us')
        .update({ section_order: targetOrder })
        .eq('id', sectionId);
      
      // @ts-ignore - Ignorando erros de tipo do Supabase temporariamente
      const { error: error2 } = await supabase
        .from('about_us')
        .update({ section_order: currentOrder })
        .eq('id', updatedSections[newIndex].id);

      if (error1 || error2) throw error1 || error2;
      
      showNotification('success', 'Ordem das seções atualizada');
    } catch (err) {
      console.error('Erro ao reordenar seções:', err);
      showNotification('error', 'Erro ao reordenar seções');
      loadSections(); // Recarrega para garantir consistência
    }
  };

  const toggleVisibility = async (section: AboutUsSection) => {
    const updatedSection = { ...section, is_visible: !section.is_visible };
    updateSection(updatedSection);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionId: string) => {
    const file = e.target.files?.[0];
    if (!file || !companyId) return;

    setUploadingImage(sectionId);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${sectionId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // @ts-ignore - Ignorando erros de tipo do Supabase temporariamente
      const { error: uploadError } = await supabase.storage
        .from('company-about-us')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // @ts-ignore - Ignorando erros de tipo do Supabase temporariamente
      const { data: { publicUrl } } = supabase.storage
        .from('company-about-us')
        .getPublicUrl(filePath);

      // Adicionar URL à pré-visualização temporária
      setPreviewImageUrls(prev => ({
        ...prev,
        [sectionId]: publicUrl
      }));
      
      // Atualizar a seção com a nova URL da imagem
      const sectionToUpdate = sections.find(s => s.id === sectionId);
      if (sectionToUpdate) {
        updateSection({
          ...sectionToUpdate,
          image_url: publicUrl
        });
      }
      
      showNotification('success', 'Imagem carregada com sucesso');
    } catch (err) {
      console.error('Erro ao fazer upload da imagem:', err);
      showNotification('error', 'Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-semibold">Página Sobre Nós</h3>
          </div>
          <button
            onClick={addSection}
            disabled={!companyId || loading}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova Seção
          </button>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center">
            <p>Carregando...</p>
          </div>
        ) : sections.length === 0 ? (
          <div className="py-8 text-center">
            <p>Nenhuma seção encontrada. Clique em "Nova Seção" para começar.</p>
            <p className="text-sm text-gray-500 mt-2">
              A página "Sobre Nós" pode conter várias seções que apresentam sua empresa aos clientes.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div 
                key={section.id} 
                className={`border rounded-lg p-5 transition-all ${!section.is_visible ? 'bg-gray-50 opacity-70' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection({ ...section, title: e.target.value })}
                    className="text-xl font-medium bg-transparent border-none focus:ring-0 w-full"
                    placeholder="Título da Seção"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleVisibility(section)}
                      className="text-gray-500 hover:text-gray-700"
                      title={section.is_visible ? "Tornar invisível" : "Tornar visível"}
                    >
                      {section.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    
                    <button
                      onClick={() => moveSection(section.id, 'up')}
                      disabled={index === 0}
                      className="text-gray-500 hover:text-gray-700 disabled:opacity-30"
                      title="Mover para cima"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => moveSection(section.id, 'down')}
                      disabled={index === sections.length - 1}
                      className="text-gray-500 hover:text-gray-700 disabled:opacity-30"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Excluir seção"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conteúdo da Seção
                    </label>
                    <textarea
                      value={section.content}
                      onChange={(e) => updateSection({ ...section, content: e.target.value })}
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Descreva sua empresa, serviços e valores..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Esse texto aparecerá na página Sobre Nós do seu site. Você pode usar parágrafos para separar o conteúdo.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagem
                    </label>
                    <div className="mb-4">
                      {(previewImageUrls[section.id] || section.image_url) ? (
                        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={previewImageUrls[section.id] || section.image_url || ''}
                            alt={section.image_alt || 'Imagem da seção'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <p className="text-gray-400">Sem imagem</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, section.id)}
                          className="hidden"
                          id={`image-upload-${section.id}`}
                          disabled={uploadingImage === section.id}
                        />
                        <label
                          htmlFor={`image-upload-${section.id}`}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingImage === section.id ? 'Enviando...' : 'Escolher Imagem'}
                        </label>
                      </div>
                      
                      {(section.image_url || previewImageUrls[section.id]) && (
                        <button
                          onClick={() => updateSection({ ...section, image_url: null, image_alt: null })}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remover Imagem
                        </button>
                      )}
                    </div>
                    
                    {(section.image_url || previewImageUrls[section.id]) && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Texto Alternativo (para acessibilidade)
                        </label>
                        <input
                          type="text"
                          value={section.image_alt || ''}
                          onChange={(e) => updateSection({ ...section, image_alt: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Descreva a imagem para pessoas com deficiência visual"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutUsSettings; 