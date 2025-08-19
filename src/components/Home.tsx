import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Construction, Truck, Phone, Building, ShieldCheck, Map } from 'lucide-react';
import SEOHead from './SEO/SEOHead';
import LocationSchema from './SEO/LocationSchema';
import { EquipmentCatalogSchema } from './SEO/EquipmentCategorySchema';

const Home: React.FC = () => {
  const { user } = useAuth();

  // Dados para SEO
  const seoTitle = "NOME DA EMPRESA - Locação de Equipamentos para Construção Civil e Indústria";
  const seoDescription = "Empresa especializada em locação de equipamentos leves para construção civil e indústria. Oferecemos as melhores soluções para sua obra.";
  const seoKeywords = "locação equipamentos, aluguel máquinas, construção civil, andaimes, betoneiras, compactadores, rompedores, projeto mecânico, laudo técnico, NR-18, NR-10, NR-12";
  
  // Esquemas para estruturação de dados
  const locationSchemas = LocationSchema({ locationType: 'ambos' });
  const equipmentCatalogSchema = EquipmentCatalogSchema();
  const allSchemas = [...locationSchemas, equipmentCatalogSchema];

  return (
    <>
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl="/"
        schema={allSchemas}
        location="ambos"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 h-3/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                NOME DA EMPRESA
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-orange-100">
                Soluções completas em locação de equipamentos para construção civil e indústria
              </p>
              <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 bg-opacity-60 hover:bg-opacity-70 transition-colors duration-300 shadow-sm hover:shadow-md"
                  >
                    Acessar Dashboard
                  </Link>
                ) : (
                  <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
                    <Link
                      to="/equipamentos"
                      className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 bg-opacity-60 hover:bg-opacity-70 transition-colors duration-300 shadow-sm hover:shadow-md"
                    >
                      Ver Equipamentos
                    </Link>
                    <Link
                      to="/contato"
                      className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-300 backdrop-filter backdrop-blur-sm"
                    >
                      Solicitar Orçamento
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Unidades / Localização */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Nossas Unidades
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
                Estamos estrategicamente localizados para atender sua região.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="bg-orange-50 rounded-lg p-8 text-center transform transition-transform duration-500 hover:scale-105">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-orange-100">
                    <Building className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">Fortaleza</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Av. Dep. Paulino Rocha, 1881 - Cajazeiras<br />
                    Fortaleza - CE, 60864-311
                  </p>
                  <p className="mt-4 font-medium">
                    <a href="tel:+5585986101415" className="text-orange-600 hover:text-orange-800">
                      (85) 98610-1415
                    </a>
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-8 text-center transform transition-transform duration-500 hover:scale-105">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-orange-100">
                    <Building className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">Região Metropolitana</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Atendemos toda a região metropolitana de Fortaleza<br />
                    Caucaia, Maracanaú, Aquiraz e demais cidades
                  </p>
                  <p className="mt-4 font-medium">
                    <a href="tel:+5585986101415" className="text-orange-600 hover:text-orange-800">
                      (85) 98610-1415
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categorias de Equipamentos */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Equipamentos para Locação
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
                Temos uma ampla variedade de equipamentos para atender suas necessidades.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                <Link to="/equipamentos/andaimes" className="group">
                  <div className="bg-white rounded-lg p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors duration-300">
                      <Construction className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="mt-6 text-xl font-medium text-gray-900 group-hover:text-orange-600 transition-colors duration-300">Andaimes</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Andaimes fachadeiros, tubulares e multidirecionais para sua obra.
                    </p>
                  </div>
                </Link>

                <Link to="/equipamentos/betoneiras" className="group">
                  <div className="bg-white rounded-lg p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors duration-300">
                      <Construction className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="mt-6 text-xl font-medium text-gray-900 group-hover:text-orange-600 transition-colors duration-300">Betoneiras</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Betoneiras de diversos tamanhos para mistura de concreto.
                    </p>
                  </div>
                </Link>

                <Link to="/equipamentos/compactadores" className="group">
                  <div className="bg-white rounded-lg p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors duration-300">
                      <Construction className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="mt-6 text-xl font-medium text-gray-900 group-hover:text-orange-600 transition-colors duration-300">Compactadores</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Compactadores de solo tipo sapo, placas vibratórias e rolos.
                    </p>
                  </div>
                </Link>

                <Link to="/equipamentos/rompedores" className="group">
                  <div className="bg-white rounded-lg p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors duration-300">
                      <Construction className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="mt-6 text-xl font-medium text-gray-900 group-hover:text-orange-600 transition-colors duration-300">Rompedores</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Rompedores elétricos e pneumáticos para demolição.
                    </p>
                  </div>
                </Link>
              </div>
              
              <div className="mt-12 text-center">
                <Link
                  to="/equipamentos"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors duration-300 shadow-sm hover:shadow-md"
                >
                  Ver todos os equipamentos
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Serviços */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Nossos Serviços
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
                Além da locação, oferecemos serviços especializados para sua obra.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="bg-orange-50 rounded-lg p-8 text-center transform transition-transform duration-500 hover:scale-105">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-orange-100">
                    <Truck className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">Transporte</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Entrega e retirada dos equipamentos em sua obra em toda a região.
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-8 text-center transform transition-transform duration-500 hover:scale-105">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-orange-100">
                    <ShieldCheck className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">Laudos Técnicos</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Laudos e responsabilidade técnica conforme NR-18, NR-10 e NR-12.
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-8 text-center transform transition-transform duration-500 hover:scale-105">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-orange-100">
                    <Map className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">Projetos</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Projetos mecânicos e consultoria para implementação de equipamentos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Contato */}
        <div className="bg-orange-600">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Precisa de equipamentos para sua obra?</span>
              <span className="block text-orange-200">Entre em contato conosco hoje mesmo.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  to="/contato"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-orange-600 bg-white hover:bg-orange-50"
                >
                  Fale Conosco
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <a
                  href="tel:+5585986101415"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-700 hover:bg-orange-800"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Ligar Agora
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;