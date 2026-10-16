import React from 'react';
import { RaptorProvider, useRaptor } from './context/RaptorContext';
import { LeftSidebar } from './components/navigation/LeftSidebar';
import { TopHeader } from './components/navigation/TopHeader';
import { InstitutionalAlertOverlay } from './components/navigation/InstitutionalAlertOverlay';
import { SalaOperacoesView } from './components/views/SalaOperacoesView';
import { PainelAtivoView } from './components/views/PainelAtivoView';
import { ScannerOportunidadesView } from './components/views/ScannerOportunidadesView';
import { ConselhoAgentesView } from './components/views/ConselhoAgentesView';
import { PesquisaQuantView } from './components/views/PesquisaQuantView';
import { RiscoLimitesView } from './components/views/RiscoLimitesView';
import { SimuladorPaperView } from './components/views/SimuladorPaperView';
import { DiarioTradesView } from './components/views/DiarioTradesView';
import { EventosMacroView } from './components/views/EventosMacroView';
import { ConfiguracoesApisView } from './components/views/ConfiguracoesApisView';
import { InstitutionalComplianceNotice } from './components/terminal/InstitutionalComplianceNotice';

const MainLayout: React.FC = () => {
  const { activeTab } = useRaptor();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased">
      {/* 1. Left Sidebar Navigation (Matching exact Screenshot 1 & 2) */}
      <LeftSidebar />

      {/* 2. Main Content View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <TopHeader />

        {/* Dynamic Page Router */}
        <main className="flex-1 p-3 sm:p-4 max-w-[1720px] w-full mx-auto">
          {activeTab === 'SALA_OPERACOES' && <SalaOperacoesView />}
          {activeTab === 'PAINEL_ATIVO' && <PainelAtivoView />}
          {activeTab === 'SCANNER_OPORTUNIDADES' && <ScannerOportunidadesView />}
          {activeTab === 'CONSELHO_AGENTES' && <ConselhoAgentesView />}
          {activeTab === 'PESQUISA_QUANT' && <PesquisaQuantView />}
          {activeTab === 'RISCO_LIMITES' && <RiscoLimitesView />}
          {activeTab === 'SIMULADOR_PAPER' && <SimuladorPaperView />}
          {activeTab === 'DIARIO_TRADES' && <DiarioTradesView />}
          {activeTab === 'EVENTOS_MACRO' && <EventosMacroView />}
          {activeTab === 'CONFIGURACOES_APIS' && <ConfiguracoesApisView />}
        </main>

        {/* Rodapé Institucional */}
        <InstitutionalComplianceNotice />
      </div>

      {/* Alerta Institucional Flutuante */}
      <InstitutionalAlertOverlay />
    </div>
  );
};

export function App() {
  return (
    <RaptorProvider>
      <MainLayout />
    </RaptorProvider>
  );
}

export default App;
