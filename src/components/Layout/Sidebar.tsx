import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, ShoppingCart, FileText, Package, MessageSquare, Home, Search, UserRound, Star, FileArchive } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  to: string;
  isActive: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, to, isActive }) => {
  // Implementação real do MenuItem
  return (
    <a 
      href={to} 
      className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
        isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="ml-3">{title}</span>
    </a>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>('client'); // Default to client
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      try {
        // Verificar se é o usuário específico que deve ter acesso a tudo
        const isTargetUser = user.id === 'c78aafc8-6734-4e6b-8944-29cffa6424f1';
        
        // Se for o usuário específico, consideramos como proprietário
        if (isTargetUser) {
          setIsOwner(true);
          setUserRole('proprietario');
          return;
        }
        
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        const role = data?.role || 'client';
        setUserRole(role);
        
        // Verificar se é proprietário/owner com qualquer uma das variações possíveis
        setIsOwner(
          role === 'proprietario' || 
          role === 'owner' || 
          role === 'admin' || 
          role === 'dono'
        );
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
      }
    };
    
    fetchUserRole();
  }, [user]);

  return (
    <div className="flex flex-col space-y-2 py-2">
      {/* Logo do Panda no topo do menu lateral */}
      <div className="flex justify-center mb-4 px-2">
        <img 
          src="/images/Logo Panda.png" 
          alt="Panda Locações" 
          className="h-16 w-auto" 
        />
      </div>

      {/* Menu para clientes */}
      {userRole === 'client' && (
        <>
          <MenuItem 
            icon={<Home className="h-5 w-5" />} 
            title="Home" 
            to="/" 
            isActive={pathname === '/'} 
          />
          <MenuItem 
            icon={<Search className="h-5 w-5" />} 
            title="Buscar" 
            to="/search" 
            isActive={pathname === '/search'} 
          />
          <MenuItem 
            icon={<Package className="h-5 w-5" />} 
            title="Equipamentos" 
            to="/equipments" 
            isActive={pathname.startsWith('/equipments')} 
          />
          <MenuItem 
            icon={<FileArchive className="h-5 w-5" />} 
            title="Locações" 
            to="/rentals" 
            isActive={pathname.startsWith('/rentals')} 
          />
          <MenuItem 
            icon={<ShoppingCart className="h-5 w-5" />} 
            title="Reservas" 
            to="/bookings" 
            isActive={pathname === '/bookings'} 
          />
          <MenuItem 
            icon={<FileSpreadsheet className="h-5 w-5" />} 
            title="Orçamentos" 
            to="/budget-requests" 
            isActive={pathname === '/budget-requests'} 
          />
          <MenuItem 
            icon={<Star className="h-5 w-5" />} 
            title="Avaliações" 
            to="/reviews" 
            isActive={pathname === '/reviews'} 
          />
          <MenuItem 
            icon={<UserRound className="h-5 w-5" />} 
            title="Clientes" 
            to="/clients" 
            isActive={pathname === '/clients'} 
          />
        </>
      )}

      {/* Menu para proprietários - agora usando isOwner que é mais inclusivo */}
      {isOwner && (
        <>
          <MenuItem 
            icon={<Home className="h-5 w-5" />} 
            title="Home" 
            to="/owner" 
            isActive={pathname === '/owner'} 
          />
          <MenuItem 
            icon={<Search className="h-5 w-5" />} 
            title="Buscar" 
            to="/owner/search" 
            isActive={pathname === '/owner/search'} 
          />
          <MenuItem 
            icon={<Package className="h-5 w-5" />} 
            title="Equipamentos" 
            to="/owner/equipments" 
            isActive={pathname.startsWith('/owner/equipments')} 
          />
          <MenuItem 
            icon={<FileArchive className="h-5 w-5" />} 
            title="Locações" 
            to="/owner/rentals" 
            isActive={pathname.startsWith('/owner/rentals')} 
          />
          <MenuItem 
            icon={<ShoppingCart className="h-5 w-5" />} 
            title="Reservas" 
            to="/owner-bookings" 
            isActive={pathname === '/owner-bookings'} 
          />
          <MenuItem 
            icon={<FileSpreadsheet className="h-5 w-5" />} 
            title="Orçamentos" 
            to="/owner-budgets" 
            isActive={pathname === '/owner-budgets'} 
          />
          <MenuItem 
            icon={<Star className="h-5 w-5" />} 
            title="Avaliações" 
            to="/owner/reviews" 
            isActive={pathname === '/owner/reviews'} 
          />
          <MenuItem 
            icon={<UserRound className="h-5 w-5" />} 
            title="Clientes" 
            to="/owner/clients" 
            isActive={pathname === '/owner/clients'} 
          />
          <MenuItem 
            icon={<MessageSquare className="h-5 w-5" />} 
            title="Mensagens de Contato" 
            to="/contact-messages" 
            isActive={pathname === '/contact-messages'} 
          />
        </>
      )}

      {/* Seção específica para o usuário com ID específico */}
      {user?.id === 'c78aafc8-6734-4e6b-8944-29cffa6424f1' && (
        <>
          {/* Se o usuário tiver o ID específico, garantimos que o link para mensagens de contato sempre aparece,
              mesmo que por algum motivo não tenha sido considerado proprietário acima */}
          {!isOwner && (
            <MenuItem 
              icon={<MessageSquare className="h-5 w-5" />} 
              title="Mensagens de Contato" 
              to="/contact-messages" 
              isActive={pathname === '/contact-messages'} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default Sidebar; 