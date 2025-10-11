import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, DollarSign, Zap, Clock, CheckCircle, XCircle, Trash2, Download } from 'lucide-react';
import { UsageRecord, UsageStats } from '../types';

interface UsageHistoryProps {
  onBack: () => void;
}

// Precios por token para cada modelo (en USD)
const MODEL_PRICING = {
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4.1': { input: 0.01, output: 0.03 },
  'o3': { input: 0.05, output: 0.15 },
  'o4-mini': { input: 0.00015, output: 0.0006 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
};

export const UsageHistory: React.FC<UsageHistoryProps> = ({ onBack }) => {
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsageHistory();
  }, []);

  const loadUsageHistory = () => {
    try {
      const stored = localStorage.getItem('chatgpt-usage-history');
      if (stored) {
        const records: UsageRecord[] = JSON.parse(stored);
        setUsageRecords(records);
        calculateStats(records);
      }
    } catch (error) {
      console.error('Error loading usage history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (records: UsageRecord[]) => {
    if (records.length === 0) {
      setStats({
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageCostPerRequest: 0,
        mostUsedModel: 'N/A'
      });
      return;
    }

    const totalRequests = records.length;
    const totalTokens = records.reduce((sum, record) => sum + record.totalTokens, 0);
    const totalCost = records.reduce((sum, record) => sum + record.cost, 0);
    const successfulRequests = records.filter(r => r.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const averageCostPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;

    // Encontrar el modelo más usado
    const modelCounts = records.reduce((acc, record) => {
      acc[record.model] = (acc[record.model] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedModel = Object.entries(modelCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    setStats({
      totalRequests,
      totalTokens,
      totalCost,
      successfulRequests,
      failedRequests,
      averageCostPerRequest,
      mostUsedModel
    });
  };

  const clearHistory = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todo el historial de uso? Esta acción no se puede deshacer.')) {
      localStorage.removeItem('chatgpt-usage-history');
      setUsageRecords([]);
      setStats(null);
    }
  };

  const exportHistory = () => {
    if (usageRecords.length === 0) return;

    const csvContent = [
      ['Fecha', 'Modelo', 'Imagen', 'Tokens de Entrada', 'Tokens de Salida', 'Total Tokens', 'Costo (USD)', 'Estado'],
      ...usageRecords.map(record => [
        new Date(record.timestamp).toLocaleString(),
        record.model,
        record.imageName,
        record.promptTokens.toString(),
        record.completionTokens.toString(),
        record.totalTokens.toString(),
        record.cost.toFixed(6),
        record.success ? 'Éxito' : 'Error'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial-uso-chatgpt-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6,
      maximumFractionDigits: 6
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Historial de Uso - ChatGPT
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {usageRecords.length > 0 && (
              <>
                <button
                  onClick={exportHistory}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar CSV</span>
                </button>
                <button
                  onClick={clearHistory}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpiar</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {usageRecords.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay historial de uso
            </h3>
            <p className="text-gray-600">
              El historial de uso de ChatGPT aparecerá aquí una vez que comiences a generar descripciones.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Estadísticas */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Total Solicitudes</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatNumber(stats.totalRequests)}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Total Tokens</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatNumber(stats.totalTokens)}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-600">Costo Total</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.totalCost)}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Modelo Más Usado</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {stats.mostUsedModel}
                  </p>
                </div>
              </div>
            )}

            {/* Tabla de historial */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Registro Detallado
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modelo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Imagen
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tokens
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Costo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usageRecords
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {record.model}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="max-w-xs truncate" title={record.imageName}>
                              {record.imageName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="text-xs text-gray-500">
                              Entrada: {formatNumber(record.promptTokens)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Salida: {formatNumber(record.completionTokens)}
                            </div>
                            <div className="font-medium">
                              Total: {formatNumber(record.totalTokens)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(record.cost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {record.success ? (
                              <span className="inline-flex items-center text-green-600">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                <span className="text-sm">Éxito</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-red-600">
                                <XCircle className="w-4 h-4 mr-1" />
                                <span className="text-sm">Error</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
