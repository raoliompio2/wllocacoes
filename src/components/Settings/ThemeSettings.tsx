import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { Palette } from 'lucide-react';
import { FormControlLabel, Switch, Typography, Box, Slider, Button, Divider } from '@mui/material';
import ColorPicker from './ColorPicker';

const ThemeSettings: React.FC = () => {
  const { themePreferences, updateThemePreferences, isOwner } = useTheme();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  
  // Clone as cores para estado local para edição
  const [lightColors, setLightColors] = useState({ ...themePreferences.lightColors });
  const [darkColors, setDarkColors] = useState({ ...themePreferences.darkColors });
  const [borderRadius, setBorderRadius] = useState(themePreferences.borderRadius);
  const [spacing, setSpacing] = useState(themePreferences.spacing);
  
  // Resetar as cores locais quando as preferências do tema mudarem
  useEffect(() => {
    setLightColors({ ...themePreferences.lightColors });
    setDarkColors({ ...themePreferences.darkColors });
    setBorderRadius(themePreferences.borderRadius);
    setSpacing(themePreferences.spacing);
  }, [themePreferences]);
  
  const saveThemeSettings = async () => {
    if (!isOwner) {
      showNotification('error', 'Apenas o proprietário pode alterar as configurações de tema');
      return;
    }
    
    setLoading(true);
    try {
      await updateThemePreferences({
        lightColors,
        darkColors,
        borderRadius,
        spacing
      });
      showNotification('success', 'Configurações de tema salvas com sucesso');
    } catch (err) {
      console.error('Erro ao salvar configurações de tema:', err);
      showNotification('error', 'Erro ao salvar configurações de tema');
    } finally {
      setLoading(false);
    }
  };
  
  const resetThemeToDefaults = () => {
    if (!isOwner) {
      showNotification('error', 'Apenas o proprietário pode redefinir o tema');
      return;
    }
    
    const confirmReset = window.confirm('Tem certeza que deseja redefinir todas as configurações de tema para os valores padrão?');
    if (confirmReset) {
      setLightColors({
        primary: '#1976d2',
        secondary: '#dc004e',
        background: '#ffffff',
        surface: '#f5f5f5',
        text: '#1a1a1a',
        menuText: '#1a1a1a'
      });
      
      setDarkColors({
        primary: '#90caf9',
        secondary: '#f48fb1',
        background: '#121212',
        surface: '#1e1e1e',
        text: '#ffffff',
        menuText: '#ffffff'
      });
      
      setBorderRadius(8);
      setSpacing(8);
    }
  };
  
  if (!isOwner) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <Typography variant="h6">Configurações de Tema</Typography>
        <Typography variant="body1" className="mt-4">
          Apenas o proprietário pode alterar as configurações de tema.
        </Typography>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <Palette className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-semibold">Cores do Tema - Modo Claro</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ColorPicker
            color={lightColors.primary}
            onChange={(color) => setLightColors({ ...lightColors, primary: color })}
            label="Cor Primária"
          />
          
          <ColorPicker
            color={lightColors.secondary}
            onChange={(color) => setLightColors({ ...lightColors, secondary: color })}
            label="Cor Secundária"
          />
          
          <ColorPicker
            color={lightColors.background}
            onChange={(color) => setLightColors({ ...lightColors, background: color })}
            label="Fundo"
          />
          
          <ColorPicker
            color={lightColors.surface}
            onChange={(color) => setLightColors({ ...lightColors, surface: color })}
            label="Superfície"
          />
          
          <ColorPicker
            color={lightColors.text}
            onChange={(color) => setLightColors({ ...lightColors, text: color })}
            label="Texto"
          />
          
          <ColorPicker
            color={lightColors.menuText}
            onChange={(color) => setLightColors({ ...lightColors, menuText: color })}
            label="Texto do Menu"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <Palette className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-semibold">Cores do Tema - Modo Escuro</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ColorPicker
            color={darkColors.primary}
            onChange={(color) => setDarkColors({ ...darkColors, primary: color })}
            label="Cor Primária"
          />
          
          <ColorPicker
            color={darkColors.secondary}
            onChange={(color) => setDarkColors({ ...darkColors, secondary: color })}
            label="Cor Secundária"
          />
          
          <ColorPicker
            color={darkColors.background}
            onChange={(color) => setDarkColors({ ...darkColors, background: color })}
            label="Fundo"
          />
          
          <ColorPicker
            color={darkColors.surface}
            onChange={(color) => setDarkColors({ ...darkColors, surface: color })}
            label="Superfície"
          />
          
          <ColorPicker
            color={darkColors.text}
            onChange={(color) => setDarkColors({ ...darkColors, text: color })}
            label="Texto"
          />
          
          <ColorPicker
            color={darkColors.menuText}
            onChange={(color) => setDarkColors({ ...darkColors, menuText: color })}
            label="Texto do Menu"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-semibold">Outras Configurações</h3>
        </div>
        
        <div className="space-y-6">
          <div>
            <Typography id="border-radius-slider" gutterBottom>
              Raio da Borda: {borderRadius}px
            </Typography>
            <Slider
              value={borderRadius}
              onChange={(_, newValue) => setBorderRadius(newValue as number)}
              aria-labelledby="border-radius-slider"
              min={0}
              max={24}
              step={1}
            />
          </div>
          
          <div>
            <Typography id="spacing-slider" gutterBottom>
              Espaçamento: {spacing}px
            </Typography>
            <Slider
              value={spacing}
              onChange={(_, newValue) => setSpacing(newValue as number)}
              aria-labelledby="spacing-slider"
              min={4}
              max={16}
              step={1}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="outlined"
          color="error"
          onClick={resetThemeToDefaults}
        >
          Restaurar Padrões
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={saveThemeSettings}
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
};

export default ThemeSettings; 