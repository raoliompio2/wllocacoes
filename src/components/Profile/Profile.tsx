import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../theme/ThemeContext';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Bell,
  Shield,
  Lock,
  Trash2,
  AlertCircle,
  CheckCircle,
  Settings as SettingsIcon,
  Search,
} from 'lucide-react';

interface ProfileData {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  avatar_url: string | null;
  role: string | null;
  notification_settings: {
    email_notifications: boolean;
    push_notifications: boolean;
    booking_reminders: boolean;
    maintenance_alerts: boolean;
  };
  privacy_settings: {
    show_profile: boolean;
    show_contact: boolean;
    show_reviews: boolean;
  };
}

interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { themePreferences } = useTheme();
  const colors = themePreferences.mode === 'light' ? themePreferences.lightColors : themePreferences.darkColors;
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    avatar_url: null,
    role: '',
    notification_settings: {
      email_notifications: true,
      push_notifications: true,
      booking_reminders: true,
      maintenance_alerts: true,
    },
    privacy_settings: {
      show_profile: true,
      show_contact: true,
      show_reviews: true,
    },
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordDialog, setPasswordDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        // Montar os dados do perfil
        const profileUpdates: any = {
          id: data.id || '',
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          avatar_url: data.avatar_url || null,
          role: data.role || '',
          notification_settings: data.notification_settings || profileData.notification_settings,
          privacy_settings: data.privacy_settings || profileData.privacy_settings,
        };

        // Adicionar campos de endereço, se disponíveis
        if (data.cep) profileUpdates.cep = data.cep;
        if (data.logradouro) profileUpdates.logradouro = data.logradouro;
        if (data.numero) profileUpdates.numero = data.numero;
        if (data.complemento) profileUpdates.complemento = data.complemento;
        if (data.bairro) profileUpdates.bairro = data.bairro;
        if (data.cidade) profileUpdates.cidade = data.cidade;
        if (data.estado) profileUpdates.estado = data.estado;

        // Se os campos de endereço detalhado não existirem, tentar extrair do endereço completo
        if (data.address && (!data.logradouro || !data.bairro)) {
          try {
            // Tentativa simples de extrair informações do endereço
            const addressParts = data.address.split(',');
            if (addressParts.length >= 3) {
              if (!profileUpdates.logradouro) profileUpdates.logradouro = addressParts[0]?.trim() || '';
              if (!profileUpdates.numero) profileUpdates.numero = addressParts[1]?.trim() || '';
              
              const bairroParts = addressParts[2]?.split('-');
              if (!profileUpdates.bairro) profileUpdates.bairro = bairroParts[0]?.trim() || '';
              
              if (bairroParts.length > 1 && !profileUpdates.cidade) {
                const cidadeEstado = bairroParts[1]?.trim().split(' ');
                if (cidadeEstado.length > 0) {
                  profileUpdates.cidade = cidadeEstado.slice(0, -1).join(' ').trim();
                  profileUpdates.estado = cidadeEstado[cidadeEstado.length - 1]?.trim();
                }
              }
            }
          } catch (e) {
            console.log('Erro ao extrair endereço completo:', e);
          }
        }

        setProfileData(profileUpdates);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      showNotification('error', 'Falha ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length || !user?.id) return;
    
    const file = event.target.files[0];
    setAvatarFile(file);

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      // Excluir avatar antigo se existir
      if (profileData.avatar_url) {
        const oldFileName = profileData.avatar_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldFileName}`]);
        }
      }

      // Upload do novo avatar
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Atualizar perfil com nova URL do avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfileData(prev => ({ ...prev, avatar_url: publicUrl }));
      showNotification('success', 'Foto de perfil atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      showNotification('error', 'Falha ao atualizar foto de perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCepSearch = async () => {
    const cep = profileData.cep?.replace(/\D/g, '');
    
    if (!cep || cep.length !== 8) {
      showNotification('error', 'Digite um CEP válido');
      return;
    }
    
    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: CepResponse = await response.json();
      
      if (data.erro) {
        showNotification('error', 'CEP não encontrado');
        return;
      }
      
      setProfileData(prev => ({
        ...prev,
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
        complemento: data.complemento || prev.complemento,
      }));
      
      showNotification('success', 'Endereço encontrado com sucesso');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      showNotification('error', 'Erro ao buscar CEP');
    } finally {
      setLoadingCep(false);
    }
  };

  const formatCep = (value: string) => {
    const cep = value.replace(/\D/g, '');
    if (cep.length <= 5) {
      return cep;
    }
    return `${cep.slice(0, 5)}-${cep.slice(5, 8)}`;
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCep = formatCep(e.target.value);
    setProfileData({ ...profileData, cep: formattedCep });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Construir endereço completo
    const fullAddress = `${profileData.logradouro || ''}, ${profileData.numero || ''}, ${profileData.complemento ? profileData.complemento + ', ' : ''}${profileData.bairro || ''}, ${profileData.cidade || ''} - ${profileData.estado || ''}, ${profileData.cep || ''}`;

    setLoading(true);
    try {
      // Dados a serem atualizados
      const updateData: any = {
        name: profileData.name,
        phone: profileData.phone,
        address: fullAddress,
        notification_settings: profileData.notification_settings,
        privacy_settings: profileData.privacy_settings,
        updated_at: new Date().toISOString(),
      };

      // A migração para adicionar os novos campos pode não ter sido aplicada ainda
      // Verificamos se os campos existem antes de incluí-los na atualização
      const { data: columns, error: columnsError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (!columnsError && columns && columns.length > 0) {
        const columnSample = columns[0];
        
        // Verificamos se cada campo existe no objeto retornado
        if ('cep' in columnSample) updateData.cep = profileData.cep;
        if ('logradouro' in columnSample) updateData.logradouro = profileData.logradouro;
        if ('numero' in columnSample) updateData.numero = profileData.numero;
        if ('complemento' in columnSample) updateData.complemento = profileData.complemento;
        if ('bairro' in columnSample) updateData.bairro = profileData.bairro;
        if ('cidade' in columnSample) updateData.cidade = profileData.cidade;
        if ('estado' in columnSample) updateData.estado = profileData.estado;
      }

      // Atualizar o perfil com os dados validados
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;
      showNotification('success', 'Perfil atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      showNotification('error', 'Falha ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('error', 'As novas senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      showNotification('success', 'Senha atualizada com sucesso');
      setPasswordDialog(false);
      setPasswordData({
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      showNotification('error', 'Falha ao atualizar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmation !== user.email) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      showNotification('success', 'Conta excluída com sucesso');
      // Aqui você pode adicionar a lógica para redirecionar o usuário após a exclusão
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      showNotification('error', 'Falha ao excluir conta');
    } finally {
      setLoading(false);
      setDeleteDialog(false);
    }
  };

  if (loading && !profileData.id) {
    return (
      <Box 
        className="flex items-center justify-center min-h-screen" 
        sx={{ bgcolor: colors.background }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Profile Overview Card */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: colors.surface, position: 'relative', overflow: 'visible' }}>
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '120px',
                  background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                  borderTopLeftRadius: 'inherit',
                  borderTopRightRadius: 'inherit',
                }}
              />
              <CardContent sx={{ position: 'relative', pt: 15, pb: 3 }}>
                <Box className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar
                      src={profileData.avatar_url || undefined}
                      alt={profileData.name || ''}
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        border: `4px solid ${colors.surface}`,
                        boxShadow: 2 
                      }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      id="avatar-upload"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <label htmlFor="avatar-upload">
                      <IconButton
                        component="span"
                        sx={{ 
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          bgcolor: colors.surface,
                          '&:hover': {
                            bgcolor: colors.surface,
                            opacity: 0.9
                          }
                        }}
                        size="small"
                      >
                        <Camera className="h-4 w-4" />
                      </IconButton>
                    </label>
                  </div>
                  <Typography variant="h5" sx={{ mt: 2, color: colors.text }}>
                    {profileData.name || 'Seu Nome'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, color: colors.text }}>
                    {profileData.role === 'proprietario' ? 'Proprietário de Equipamento' : 'Cliente'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Personal Information */}
          <Grid item xs={12} md={8}>
            <Card sx={{ bgcolor: colors.surface }}>
              <CardContent>
                <Typography variant="h6" className="flex items-center mb-4">
                  <User className="h-5 w-5 mr-2" />
                  Informações Pessoais
                </Typography>
                <form onSubmit={handleProfileUpdate}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Nome Completo"
                        value={profileData.name || ''}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        InputProps={{
                          startAdornment: <User className="h-5 w-5 text-gray-400 mr-2" />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={profileData.email || ''}
                        disabled
                        InputProps={{
                          startAdornment: <Mail className="h-5 w-5 text-gray-400 mr-2" />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Telefone"
                        value={profileData.phone || ''}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        InputProps={{
                          startAdornment: <Phone className="h-5 w-5 text-gray-400 mr-2" />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Endereço
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={8} sm={4}>
                          <TextField
                            fullWidth
                            label="CEP"
                            value={profileData.cep || ''}
                            onChange={handleCepChange}
                            InputProps={{
                              endAdornment: (
                                <IconButton 
                                  onClick={handleCepSearch}
                                  disabled={loadingCep}
                                >
                                  {loadingCep ? <CircularProgress size={20} /> : <Search className="h-5 w-5" />}
                                </IconButton>
                              ),
                            }}
                            placeholder="00000-000"
                            inputProps={{ maxLength: 9 }}
                          />
                        </Grid>
                      </Grid>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={8}>
                          <TextField
                            fullWidth
                            label="Logradouro"
                            value={profileData.logradouro || ''}
                            onChange={(e) => setProfileData({ ...profileData, logradouro: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Número"
                            value={profileData.numero || ''}
                            onChange={(e) => setProfileData({ ...profileData, numero: e.target.value })}
                          />
                        </Grid>
                      </Grid>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Complemento"
                            value={profileData.complemento || ''}
                            onChange={(e) => setProfileData({ ...profileData, complemento: e.target.value })}
                            placeholder="Apto, Bloco, etc."
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Bairro"
                            value={profileData.bairro || ''}
                            onChange={(e) => setProfileData({ ...profileData, bairro: e.target.value })}
                          />
                        </Grid>
                      </Grid>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={8}>
                          <TextField
                            fullWidth
                            label="Cidade"
                            value={profileData.cidade || ''}
                            onChange={(e) => setProfileData({ ...profileData, cidade: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Estado"
                            value={profileData.estado || ''}
                            onChange={(e) => setProfileData({ ...profileData, estado: e.target.value })}
                            placeholder="UF"
                            inputProps={{ maxLength: 2 }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={<CheckCircle />}
                      >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Settings Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Security Settings */}
            <Card sx={{ bgcolor: colors.surface, mb: 2 }}>
              <CardContent>
                <Typography variant="h6" className="flex items-center mb-4">
                  <Lock className="h-5 w-5 mr-2" />
                  Segurança
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setPasswordDialog(true)}
                  className="mb-3"
                >
                  Alterar Senha
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<Trash2 />}
                  onClick={() => setDeleteDialog(true)}
                >
                  Excluir Conta
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card sx={{ bgcolor: colors.surface, mb: 2 }}>
              <CardContent>
                <Typography variant="h6" className="flex items-center mb-4">
                  <Bell className="h-5 w-5 mr-2" />
                  Notificações
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profileData.notification_settings.email_notifications}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        notification_settings: {
                          ...profileData.notification_settings,
                          email_notifications: e.target.checked,
                        },
                      })}
                    />
                  }
                  label="Notificações por Email"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={profileData.notification_settings.push_notifications}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        notification_settings: {
                          ...profileData.notification_settings,
                          push_notifications: e.target.checked,
                        },
                      })}
                    />
                  }
                  label="Notificações Push"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={profileData.notification_settings.booking_reminders}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        notification_settings: {
                          ...profileData.notification_settings,
                          booking_reminders: e.target.checked,
                        },
                      })}
                    />
                  }
                  label="Lembretes de Reservas"
                />
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card sx={{ bgcolor: colors.surface }}>
              <CardContent>
                <Typography variant="h6" className="flex items-center mb-4">
                  <Shield className="h-5 w-5 mr-2" />
                  Privacidade
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profileData.privacy_settings.show_profile}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        privacy_settings: {
                          ...profileData.privacy_settings,
                          show_profile: e.target.checked,
                        },
                      })}
                    />
                  }
                  label="Mostrar Perfil"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={profileData.privacy_settings.show_contact}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        privacy_settings: {
                          ...profileData.privacy_settings,
                          show_contact: e.target.checked,
                        },
                      })}
                    />
                  }
                  label="Mostrar Informações de Contato"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={profileData.privacy_settings.show_reviews}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        privacy_settings: {
                          ...profileData.privacy_settings,
                          show_reviews: e.target.checked,
                        },
                      })}
                    />
                  }
                  label="Mostrar Avaliações"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Password Change Dialog */}
        <Dialog
          open={passwordDialog}
          onClose={() => setPasswordDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { bgcolor: colors.surface }
          }}
        >
          <DialogTitle>Alterar Senha</DialogTitle>
          <form onSubmit={handlePasswordChange}>
            <DialogContent>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Digite sua nova senha para atualizar. Não é necessário informar sua senha atual.
              </Typography>
              <TextField
                fullWidth
                type="password"
                label="Nova Senha"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                type="password"
                label="Confirmar Nova Senha"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                margin="normal"
                required
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPasswordDialog(false)}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={loading}>
                Atualizar Senha
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog
          open={deleteDialog}
          onClose={() => setDeleteDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { bgcolor: colors.surface }
          }}
        >
          <DialogTitle className="text-red-600 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Excluir Conta
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá seus dados de nossos servidores.
            </Typography>
            <Typography variant="body2" className="mt-4">
              Por favor, digite <strong>{user?.email}</strong> para confirmar.
            </Typography>
            <TextField
              fullWidth
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleDeleteAccount}
              color="error"
              disabled={deleteConfirmation !== user?.email}
            >
              Excluir Conta
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Profile;