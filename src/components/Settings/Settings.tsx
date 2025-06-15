import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { Settings as SettingsIcon, Building2, Palette, Info } from 'lucide-react';
import GeneralSettings from './GeneralSettings';
import CompanySettings from './CompanySettings';
import ThemeSettings from './ThemeSettings';
import AboutUsSettings from './AboutUsSettings';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';

const Settings: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const { user } = useAuth();
  const [isOwner, setIsOwner] = useState(false);

  React.useEffect(() => {
    const checkRole = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      setIsOwner(data?.role === 'proprietario');
    };
    
    checkRole();
  }, [user]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <SettingsIcon className="h-6 w-6 mr-2" />
        <h2 className="text-2xl font-semibold">Configurações</h2>
      </div>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab
            icon={<SettingsIcon className="h-4 w-4" />}
            iconPosition="start"
            label="Geral"
          />
          {isOwner && (
            <Tab
              icon={<Building2 className="h-4 w-4" />}
              iconPosition="start"
              label="Empresa"
            />
          )}
          {isOwner && (
            <Tab
              icon={<Palette className="h-4 w-4" />}
              iconPosition="start"
              label="Tema"
            />
          )}
          {isOwner && (
            <Tab
              icon={<Info className="h-4 w-4" />}
              iconPosition="start"
              label="Sobre Nós"
            />
          )}
        </Tabs>
      </Box>

      {currentTab === 0 && <GeneralSettings />}
      {currentTab === 1 && isOwner && <CompanySettings />}
      {currentTab === 2 && isOwner && <ThemeSettings />}
      {currentTab === 3 && isOwner && <AboutUsSettings />}
    </div>
  );
};

export default Settings;