import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Building2, Phone, Mail, MapPin, Plus, Trash2, Upload, Building, Facebook, Instagram, Linkedin, Youtube, Twitter, Clock, Search } from 'lucide-react';

interface CompanyInfo {
  id: string;
  name: string;
  logo_url: string | null;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  twitter_url: string;
  business_hours: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface Branch {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  is_main: boolean;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

const CompanySettings: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [searchingCep, setSearchingCep] = useState(false);

  useEffect(() => {
    loadCompanyInfo();
  }, [user]);

  const loadCompanyInfo = async () => {
    if (!user) return;

    try {
      const { data: companyData, error: companyError } = await supabase
        .from('company_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (companyError) throw companyError;

      if (companyData) {
        const addressParts = companyData.address ? parseAddressField(companyData.address) : {
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: ''
        };
        
        setCompanyInfo({
          ...companyData,
          ...addressParts
        });

        const { data: branchesData, error: branchesError } = await supabase
          .from('company_branches')
          .select('*')
          .eq('company_id', companyData.id)
          .order('is_main', { ascending: false });

        if (branchesError) throw branchesError;
        
        const processedBranches = (branchesData || []).map(branch => {
          const branchAddressParts = branch.address ? parseAddressField(branch.address) : {
            cep: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: ''
          };
          return {
            ...branch,
            ...branchAddressParts
          };
        });
        
        setBranches(processedBranches);
      } else {
        setCompanyInfo({
          id: '',
          name: '',
          logo_url: null,
          phone: '',
          whatsapp: '',
          email: '',
          address: '',
          facebook_url: '',
          instagram_url: '',
          linkedin_url: '',
          youtube_url: '',
          twitter_url: '',
          business_hours: '',
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: ''
        });
        setBranches([]);
      }
    } catch (err) {
      console.error('Error loading company info:', err);
      showNotification('error', 'Erro ao carregar informações da empresa');
    }
  };
  
  const parseAddressField = (address: string) => {
    try {
      let cep = '', logradouro = '', numero = '', complemento = '', bairro = '', cidade = '', estado = '';
      
      const cepMatch = address.match(/\d{5}-\d{3}/);
      if (cepMatch) cep = cepMatch[0];
      
      return { cep, logradouro, numero, complemento, bairro, cidade, estado };
    } catch (e) {
      return { 
        cep: '', 
        logradouro: '', 
        numero: '', 
        complemento: '', 
        bairro: '', 
        cidade: '', 
        estado: '' 
      };
    }
  };
  
  const fetchAddressByCep = async (cep: string, isBranch = false, branchIndex?: number) => {
    if (!cep || cep.length !== 9) return;
    
    setSearchingCep(true);
    try {
      const cleanCep = cep.replace('-', '');
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        showNotification('error', 'CEP não encontrado');
        return;
      }
      
      if (isBranch && branchIndex !== undefined) {
        const updatedBranches = [...branches];
        updatedBranches[branchIndex] = {
          ...updatedBranches[branchIndex],
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
        };
        setBranches(updatedBranches);
      } else {
        if (companyInfo) {
          setCompanyInfo({
            ...companyInfo,
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || '',
          });
        }
      }
      
      showNotification('success', 'Endereço encontrado com sucesso');
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
      showNotification('error', 'Erro ao buscar o CEP');
    } finally {
      setSearchingCep(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedLogo(file);
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  const uploadLogo = async () => {
    if (!selectedLogo || !companyInfo) return;

    try {
      const fileExt = selectedLogo.name.split('.').pop();
      const fileName = `${companyInfo.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, selectedLogo);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      await supabase
        .from('company_info')
        .update({ logo_url: publicUrl })
        .eq('id', companyInfo.id);

      setCompanyInfo({ ...companyInfo, logo_url: publicUrl });
      setSelectedLogo(null);
      showNotification('success', 'Logo atualizada com sucesso');
    } catch (err) {
      console.error('Error uploading logo:', err);
      showNotification('error', 'Erro ao fazer upload da logo');
    }
  };

  const saveCompanyInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !companyInfo) return;

    setLoading(true);
    try {
      // Montar o endereço completo a partir dos campos detalhados
      const fullAddress = composeFullAddress(companyInfo);

      if (companyInfo.id) {
        // @ts-ignore - Ignorando erros de tipo do Supabase temporariamente
        const { error } = await supabase
          .from('company_info')
          .update({
            name: companyInfo.name,
            phone: companyInfo.phone,
            whatsapp: companyInfo.whatsapp,
            email: companyInfo.email,
            address: fullAddress,
            facebook_url: companyInfo.facebook_url,
            instagram_url: companyInfo.instagram_url,
            linkedin_url: companyInfo.linkedin_url,
            youtube_url: companyInfo.youtube_url,
            twitter_url: companyInfo.twitter_url,
            business_hours: companyInfo.business_hours,
            updated_at: new Date().toISOString()
          })
          .eq('id', companyInfo.id);

        if (error) throw error;
        showNotification('success', 'Informações da empresa atualizadas com sucesso');
      } else {
        // @ts-ignore - Ignorando erros de tipo do Supabase temporariamente
        const { data, error } = await supabase
          .from('company_info')
          .insert({
            user_id: user.id,
            name: companyInfo.name,
            phone: companyInfo.phone,
            whatsapp: companyInfo.whatsapp,
            email: companyInfo.email,
            address: fullAddress,
            facebook_url: companyInfo.facebook_url,
            instagram_url: companyInfo.instagram_url,
            linkedin_url: companyInfo.linkedin_url,
            youtube_url: companyInfo.youtube_url,
            twitter_url: companyInfo.twitter_url,
            business_hours: companyInfo.business_hours
          })
          .select()
          .single();

        if (error) throw error;
        
        // @ts-ignore - Ignorando erros de tipo temporariamente
        setCompanyInfo({
          ...data,
          cep: companyInfo.cep,
          logradouro: companyInfo.logradouro,
          numero: companyInfo.numero,
          complemento: companyInfo.complemento,
          bairro: companyInfo.bairro,
          cidade: companyInfo.cidade,
          estado: companyInfo.estado
        });
        
        showNotification('success', 'Empresa cadastrada com sucesso');
      }

      if (selectedLogo) {
        await uploadLogo();
      }
    } catch (err) {
      console.error('Error saving company info:', err);
      showNotification('error', 'Erro ao salvar informações da empresa');
    } finally {
      setLoading(false);
    }
  };
  
  // Função para compor o endereço completo
  const composeFullAddress = (info: CompanyInfo): string => {
    const parts = [];
    
    if (info.cep) parts.push(`CEP: ${info.cep}`);
    if (info.logradouro) parts.push(info.logradouro);
    if (info.numero) parts.push(info.numero);
    if (info.complemento) parts.push(info.complemento);
    if (info.bairro) parts.push(info.bairro);
    if (info.cidade && info.estado) parts.push(`${info.cidade} - ${info.estado}`);
    
    return parts.join(', ');
  };

  const addBranch = async () => {
    if (!companyInfo?.id) return;

    try {
      const { data, error } = await supabase
        .from('company_branches')
        .insert({
          company_id: companyInfo.id,
          name: 'Nova Filial',
          is_main: branches.length === 0
        })
        .select()
        .single();

      if (error) throw error;
      setBranches([...branches, data]);
      showNotification('success', 'Filial adicionada com sucesso');
    } catch (err) {
      console.error('Error adding branch:', err);
      showNotification('error', 'Erro ao adicionar filial');
    }
  };

  const updateBranch = async (branch: Branch) => {
    try {
      // Compor o endereço completo a partir dos campos detalhados
      const fullAddress = composeBranchAddress(branch);
      
      // Crie uma cópia do objeto sem os campos detalhados de endereço
      const { cep, logradouro, numero, complemento, bairro, cidade, estado, ...branchData } = branch;
      const updatedBranch = {
        ...branchData,
        address: fullAddress
      };
      
      // @ts-ignore - Ignorando erros de tipo do Supabase temporariamente
      const { error } = await supabase
        .from('company_branches')
        .update(updatedBranch)
        .eq('id', branch.id);

      if (error) throw error;

      setBranches(branches.map(b => b.id === branch.id ? branch : b));
      showNotification('success', 'Filial atualizada com sucesso');
    } catch (err) {
      console.error('Error updating branch:', err);
      showNotification('error', 'Erro ao atualizar filial');
    }
  };
  
  // Função para compor o endereço completo da filial
  const composeBranchAddress = (branch: Branch): string => {
    const parts = [];
    
    if (branch.cep) parts.push(`CEP: ${branch.cep}`);
    if (branch.logradouro) parts.push(branch.logradouro);
    if (branch.numero) parts.push(branch.numero);
    if (branch.complemento) parts.push(branch.complemento);
    if (branch.bairro) parts.push(branch.bairro);
    if (branch.cidade && branch.estado) parts.push(`${branch.cidade} - ${branch.estado}`);
    
    return parts.join(', ');
  };

  const deleteBranch = async (branchId: string) => {
    try {
      const { error } = await supabase
        .from('company_branches')
        .delete()
        .eq('id', branchId);

      if (error) throw error;

      setBranches(branches.filter(b => b.id !== branchId));
      showNotification('success', 'Filial removida com sucesso');
    } catch (err) {
      console.error('Error deleting branch:', err);
      showNotification('error', 'Erro ao remover filial');
    }
  };

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <Building2 className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-semibold">Informações da Empresa</h3>
        </div>

        <form onSubmit={saveCompanyInfo} className="space-y-6">
          {/* Logo Upload */}
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 relative">
              {(previewLogo || companyInfo?.logo_url) ? (
                <img
                  src={previewLogo || companyInfo?.logo_url}
                  alt="Company Logo"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo da Empresa
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Escolher Logo
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Empresa
              </label>
              <input
                type="text"
                value={companyInfo?.name || ''}
                onChange={(e) => setCompanyInfo(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                value={companyInfo?.phone || ''}
                onChange={(e) => setCompanyInfo(prev => prev ? { ...prev, phone: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <input
                type="tel"
                value={companyInfo?.whatsapp || ''}
                onChange={(e) => setCompanyInfo(prev => prev ? { ...prev, whatsapp: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={companyInfo?.email || ''}
                onChange={(e) => setCompanyInfo(prev => prev ? { ...prev, email: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="md:col-span-2">
              <h4 className="font-medium mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                Endereço
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={companyInfo?.cep || ''}
                      onChange={(e) => {
                        const cep = e.target.value;
                        const formatted = cep
                          .replace(/\D/g, '')
                          .replace(/(\d{5})(\d)/, '$1-$2')
                          .substring(0, 9);
                        setCompanyInfo(prev => prev ? { ...prev, cep: formatted } : null);
                      }}
                      onBlur={(e) => {
                        if (e.target.value.length === 9) {
                          fetchAddressByCep(e.target.value);
                        }
                      }}
                      placeholder="00000-000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-l-md"
                    />
                    <button
                      type="button"
                      onClick={() => fetchAddressByCep(companyInfo?.cep || '')}
                      disabled={searchingCep || !companyInfo?.cep || companyInfo.cep.length !== 9}
                      className="px-3 py-2 bg-blue-600 text-white rounded-r-md disabled:bg-blue-300"
                    >
                      {searchingCep ? "..." : <Search className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Digite o CEP para buscar o endereço</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logradouro
                  </label>
                  <input
                    type="text"
                    value={companyInfo?.logradouro || ''}
                    onChange={(e) => setCompanyInfo(prev => prev ? { ...prev, logradouro: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Nome da rua, avenida, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número
                  </label>
                  <input
                    type="text"
                    value={companyInfo?.numero || ''}
                    onChange={(e) => setCompanyInfo(prev => prev ? { ...prev, numero: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Nº"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={companyInfo?.complemento || ''}
                    onChange={(e) => setCompanyInfo(prev => prev ? { ...prev, complemento: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Apto, sala, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={companyInfo?.bairro || ''}
                    onChange={(e) => setCompanyInfo(prev => prev ? { ...prev, bairro: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Bairro"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={companyInfo?.cidade || ''}
                    onChange={(e) => setCompanyInfo(prev => prev ? { ...prev, cidade: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Cidade"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={companyInfo?.estado || ''}
                    onChange={(e) => setCompanyInfo(prev => prev ? { ...prev, estado: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-5 w-5 mr-2 text-gray-500" />
                Horário de Atendimento
              </label>
              <textarea
                value={companyInfo?.business_hours || ''}
                onChange={(e) => setCompanyInfo(prev => prev ? { ...prev, business_hours: e.target.value } : null)}
                placeholder="Ex: Segunda a Sexta: 8h às 18h, Sábado: 8h às 12h"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">Informe os horários em que sua empresa atende os clientes. Estas informações serão exibidas no rodapé do site.</p>
            </div>
            
            <div className="md:col-span-2">
              <h4 className="text-md font-medium mb-3 border-b pb-2">Redes Sociais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <Facebook className="h-5 w-5 mr-2 text-blue-600" />
                  <input
                    type="url"
                    placeholder="URL do Facebook"
                    value={companyInfo?.facebook_url || ''}
                    onChange={(e) => setCompanyInfo(prev => prev ? { ...prev, facebook_url: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="flex items-center">
                  <Instagram className="h-5 w-5 mr-2 text-pink-600" />
                  <input
                    type="url"
                    placeholder="URL do Instagram"
                    value={companyInfo?.instagram_url || ''}
                    onChange={(e) => setCompanyInfo(prev => prev ? { ...prev, instagram_url: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="flex items-center">
                  <Linkedin className="h-5 w-5 mr-2 text-blue-700" />
                  <input
                    type="url"
                    placeholder="URL do LinkedIn"
                    value={companyInfo?.linkedin_url || ''}
                    onChange={(e) => setCompanyInfo(prev => prev ? { ...prev, linkedin_url: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="flex items-center">
                  <Youtube className="h-5 w-5 mr-2 text-red-600" />
                  <input
                    type="url"
                    placeholder="URL do YouTube"
                    value={companyInfo?.youtube_url || ''}
                    onChange={(e) => setCompanyInfo(prev => prev ? { ...prev, youtube_url: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="flex items-center">
                  <Twitter className="h-5 w-5 mr-2 text-blue-400" />
                  <input
                    type="url"
                    placeholder="URL do Twitter/X"
                    value={companyInfo?.twitter_url || ''}
                    onChange={(e) => setCompanyInfo(prev => prev ? { ...prev, twitter_url: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>

      {/* Branches */}
      {companyInfo?.id && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              <h3 className="text-lg font-semibold">Filiais</h3>
            </div>
            <button
              onClick={addBranch}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nova Filial
            </button>
          </div>

          <div className="space-y-6">
            {branches.map((branch) => (
              <div key={branch.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <input
                    type="text"
                    value={branch.name}
                    onChange={(e) => updateBranch({ ...branch, name: e.target.value })}
                    className="text-lg font-medium bg-transparent border-none focus:ring-0"
                  />
                  <button
                    onClick={() => deleteBranch(branch.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={branch.phone || ''}
                      onChange={(e) => updateBranch({ ...branch, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={branch.whatsapp || ''}
                      onChange={(e) => updateBranch({ ...branch, whatsapp: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={branch.email || ''}
                      onChange={(e) => updateBranch({ ...branch, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="border-t pt-3 mt-3">
                  <h5 className="font-medium mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    Endereço
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CEP
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={branch.cep || ''}
                          onChange={(e) => {
                            const cep = e.target.value;
                            const formatted = cep
                              .replace(/\D/g, '')
                              .replace(/(\d{5})(\d)/, '$1-$2')
                              .substring(0, 9);
                            updateBranch({ ...branch, cep: formatted });
                          }}
                          onBlur={(e) => {
                            if (e.target.value.length === 9) {
                              const branchIndex = branches.findIndex(b => b.id === branch.id);
                              if (branchIndex !== -1) {
                                fetchAddressByCep(e.target.value, true, branchIndex);
                              }
                            }
                          }}
                          placeholder="00000-000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-l-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const branchIndex = branches.findIndex(b => b.id === branch.id);
                            if (branchIndex !== -1 && branch.cep && branch.cep.length === 9) {
                              fetchAddressByCep(branch.cep, true, branchIndex);
                            }
                          }}
                          disabled={searchingCep || !branch.cep || branch.cep.length !== 9}
                          className="px-3 py-2 bg-blue-600 text-white rounded-r-md disabled:bg-blue-300"
                        >
                          {searchingCep ? "..." : <Search className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logradouro
                      </label>
                      <input
                        type="text"
                        value={branch.logradouro || ''}
                        onChange={(e) => updateBranch({ ...branch, logradouro: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Rua, Avenida, etc."
                      />
                    </div>
                    
                    <div className="md:col-span-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Número
                          </label>
                          <input
                            type="text"
                            value={branch.numero || ''}
                            onChange={(e) => updateBranch({ ...branch, numero: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Nº"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bairro
                          </label>
                          <input
                            type="text"
                            value={branch.bairro || ''}
                            onChange={(e) => updateBranch({ ...branch, bairro: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Bairro"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Complemento
                      </label>
                      <input
                        type="text"
                        value={branch.complemento || ''}
                        onChange={(e) => updateBranch({ ...branch, complemento: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Apto, Sala, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={branch.cidade || ''}
                        onChange={(e) => updateBranch({ ...branch, cidade: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Cidade"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <input
                        type="text"
                        value={branch.estado || ''}
                        onChange={(e) => updateBranch({ ...branch, estado: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="UF"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySettings;