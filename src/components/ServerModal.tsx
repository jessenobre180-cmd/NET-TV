import React, { useState } from 'react';
import { 
  Server, Globe, Activity, Plus, Check, Trash2, 
  RefreshCw, X, Shield, ArrowRight, Zap, Radio
} from 'lucide-react';
import { StreamingServer } from '../types';
import { api } from '../services/api';

interface ServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: StreamingServer[];
  activeServer: StreamingServer | null;
  onSelectServer: (server: StreamingServer) => void;
  onServersUpdated: () => void;
}

export const ServerModal: React.FC<ServerModalProps> = ({
  isOpen,
  onClose,
  servers,
  activeServer,
  onSelectServer,
  onServersUpdated
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingResults, setPingResults] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Add Server Form State
  const [newServerName, setNewServerName] = useState('');
  const [newServerUrl, setNewServerUrl] = useState('');
  const [newServerRegion, setNewServerRegion] = useState('América do Sul (Brasil)');
  const [newServerType, setNewServerType] = useState<'cdn' | 'backup' | 'custom' | 'hls'>('cdn');
  const [isDefault, setIsDefault] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestPings = async () => {
    setIsTestingPing(true);
    setFeedbackMsg(null);
    
    // Simulate real ping checks across the edge nodes
    await new Promise(r => setTimeout(r, 600));
    const results: Record<string, number> = {};
    servers.forEach(s => {
      // Small jitter around current ping for realism
      const jitter = Math.floor(Math.random() * 8) - 4;
      results[s.id] = Math.max(8, s.pingMs + jitter);
    });
    setPingResults(results);
    setIsTestingPing(false);
    setFeedbackMsg('Latência atualizada para todos os servidores.');
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newServerName.trim()) {
      setFormError('Por favor informe o nome do servidor.');
      return;
    }

    if (!newServerUrl.trim()) {
      setFormError('Por favor informe a URL base ou endereço do servidor.');
      return;
    }

    try {
      setIsSubmitting(true);
      const randomPing = Math.floor(Math.random() * 35) + 12;
      const created = await api.addServer({
        name: newServerName.trim(),
        baseUrl: newServerUrl.trim(),
        region: newServerRegion,
        type: newServerType,
        status: 'online',
        pingMs: randomPing,
        isDefault
      });

      // Reset form
      setNewServerName('');
      setNewServerUrl('');
      setIsDefault(false);
      setShowAddForm(false);
      onServersUpdated();
      
      // Auto-select newly created server
      onSelectServer(created);
      setFeedbackMsg(`Servidor "${created.name}" adicionado e conectado com sucesso!`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao adicionar servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteServer = async (id: string, name: string) => {
    if (confirm(`Deseja realmente remover o servidor "${name}"?`)) {
      try {
        await api.deleteServer(id);
        onServersUpdated();
      } catch (err: any) {
        alert(err.message || 'Erro ao remover servidor');
      }
    }
  };

  const getServerBadge = (type: StreamingServer['type']) => {
    switch (type) {
      case 'cdn':
        return <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold">CDN Edge</span>;
      case 'backup':
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold">Backup Cloud</span>;
      case 'hls':
        return <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-semibold">HLS Stream</span>;
      case 'custom':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">Personalizado</span>;
    }
  };

  const getLatencyColor = (ping: number) => {
    if (ping <= 30) return { text: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Excelente' };
    if (ping <= 70) return { text: 'text-amber-400', bg: 'bg-amber-500', label: 'Bom' };
    return { text: 'text-rose-400', bg: 'bg-rose-500', label: 'Normal' };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Servidores de Transmissão NetTV
              </h2>
              <p className="text-xs text-zinc-400">
                Gerencie nós de streaming e alterne rotas de baixa latência em tempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Actions Bar */}
        <div className="p-5 pb-2 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Servidores Disponíveis ({servers.length})
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestPings}
              disabled={isTestingPing}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs border border-zinc-800 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingPing ? 'animate-spin text-red-500' : ''}`} />
              <span>{isTestingPing ? 'Testando...' : 'Testar Latência'}</span>
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-red-900/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Fechar Cadastro' : 'Adicionar Servidor'}</span>
            </button>
          </div>
        </div>

        {/* Add Server Form Drawer */}
        {showAddForm && (
          <form onSubmit={handleAddServer} className="mx-5 mb-4 p-4 rounded-xl bg-zinc-900/90 border border-red-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-red-500" />
                Cadastrar Novo Servidor ou CDN
              </span>
              <span className="text-[11px] text-zinc-400">Preencha os dados do nó de streaming</span>
            </div>

            {formError && (
              <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Nome do Servidor *</label>
                <input
                  type="text"
                  placeholder="ex: CDN São Paulo - Node 02"
                  value={newServerName}
                  onChange={e => setNewServerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Região Geográfica</label>
                <select
                  value={newServerRegion}
                  onChange={e => setNewServerRegion(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="América do Sul (Brasil)">América do Sul (Brasil)</option>
                  <option value="América do Sul (Sul)">América do Sul (Sul)</option>
                  <option value="América do Norte (EUA)">América do Norte (EUA)</option>
                  <option value="Europa Central">Europa Central</option>
                  <option value="Rede Local / P2P">Rede Local / P2P Privado</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-zinc-400 mb-1">URL Base ou Endpoint Streaming *</label>
                <input
                  type="text"
                  placeholder="ex: https://sp2.cdn.nettv.internal ou http://192.168.1.100:8000"
                  value={newServerUrl}
                  onChange={e => setNewServerUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Tipo de Arquitetura</label>
                <select
                  value={newServerType}
                  onChange={e => setNewServerType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="cdn">CDN Edge de Alta Velocidade</option>
                  <option value="backup">Servidor Cloud Backup</option>
                  <option value="hls">Servidor HLS / IPTV</option>
                  <option value="custom">Nó Personalizado / Privado</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={e => setIsDefault(e.target.checked)}
                    className="rounded bg-zinc-950 border-zinc-800 text-red-600 focus:ring-0"
                  />
                  <span>Definir como servidor padrão</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Cadastrando...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Salvar e Adicionar</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Server List */}
        <div className="p-5 pt-1 space-y-2.5 max-h-[420px] overflow-y-auto">
          {servers.map((server, idx) => {
            const isCurrent = activeServer?.id === server.id;
            const currentPing = pingResults[server.id] || server.pingMs;
            const latency = getLatencyColor(currentPing);

            return (
              <div
                key={`${server.id}-${idx}`}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isCurrent 
                    ? 'bg-zinc-900 border-red-500/50 shadow-lg shadow-red-950/20' 
                    : 'bg-zinc-900/50 border-zinc-800/80 hover:bg-zinc-900/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isCurrent ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {server.type === 'hls' ? <Radio className="w-4 h-4" /> : <Server className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm truncate">{server.name}</span>
                      {getServerBadge(server.type)}
                      {server.isDefault && (
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-mono">
                          Padrão
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-zinc-500" />
                        {server.region}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="font-mono text-[11px] text-zinc-500 truncate max-w-[200px]">
                        {server.baseUrl}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800">
                  {/* Ping status */}
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-zinc-800">
                    <span className={`w-2 h-2 rounded-full ${latency.bg} animate-pulse`} />
                    <span className={`font-mono text-xs font-bold ${latency.text}`}>
                      {currentPing}ms
                    </span>
                    <span className="text-[10px] text-zinc-500 hidden sm:inline">
                      ({latency.label})
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {isCurrent ? (
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Ativo
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          onSelectServer(server);
                          setFeedbackMsg(`Conectado ao servidor "${server.name}"!`);
                          setTimeout(() => setFeedbackMsg(null), 3000);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-red-600 hover:text-white text-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <span>Conectar</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {/* Delete button (only for servers with id starting with srv- that are not srv-1) */}
                    {server.id !== 'srv-1' && (
                      <button
                        onClick={() => handleDeleteServer(server.id, server.name)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remover servidor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            Transmissão com roteamento inteligente de CDN NetTV
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
          >
            Concluir
          </button>
        </div>

      </div>
    </div>
  );
};
