import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, DollarSign, Zap, Clock, CheckCircle, XCircle, Trash2, Download, Filter, X, Users, User, RefreshCw } from 'lucide-react';
import { UsageRecord, UsageStats, UserPreferences } from '../types';
import { authService } from '../services/authService';
import { databaseService } from '../services/databaseService';
import { currencyService } from '../services/currencyService';
import { Popup } from './Popup';
import { usePopup } from '../hooks/usePopup';

interface UsageHistoryProps {
  onBack: () => void;
}

// Precios por token para cada modelo (en USD)
const MODEL_PRICING = {
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-4.1': { input: 0.01, output: 0.03 },
  'o3': { input: 0.05, output: 0.15 }
};

export const UsageHistory: React.FC<UsageHistoryProps> = ({ onBack }) => {
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<UsageRecord[]>([]);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser] = useState(authService.getCurrentUser());
  const [isRoot] = useState(authService.isRoot());
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    currency: 'USD',
    language: 'es',
    timezone: 'America/Mexico_City'
  });
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isUsingRealRates, setIsUsingRealRates] = useState(false);
  const { popupState, hidePopup, showConfirm, showAlert } = usePopup();
  
  // Filtros
  const [dateFilter, setDateFilter] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: '',
    endDate: ''
  });
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showUserSummary, setShowUserSummary] = useState(false);

  useEffect(() => {
    loadUsageHistory();
    loadUserPreferences();
    loadExchangeRates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [usageRecords, dateFilter, modelFilter, userFilter]);

  // Recargar preferencias cuando el usuario cambie la moneda o configuración de API
  useEffect(() => {
    const handleStorageChange = () => {
      loadUserPreferences();
      loadExchangeRates();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Actualizar tasas de cambio cada 5 minutos si están habilitadas
  useEffect(() => {
    if (isUsingRealRates) {
      const interval = setInterval(() => {
        loadExchangeRates();
      }, 5 * 60 * 1000); // 5 minutos

      return () => clearInterval(interval);
    }
  }, [isUsingRealRates]);

  const loadUsageHistory = () => {
    try {
      const stored = localStorage.getItem('chatgpt-usage-history');
      const adminBackup = localStorage.getItem('chatgpt-usage-history-admin-backup');
      
      let allRecords: UsageRecord[] = [];
      
      if (isRoot) {
        // Para administradores, cargar desde el respaldo si existe, sino desde el historial normal
        if (adminBackup) {
          allRecords = JSON.parse(adminBackup);
        } else if (stored) {
          allRecords = JSON.parse(stored);
          // Crear respaldo inicial
          localStorage.setItem('chatgpt-usage-history-admin-backup', JSON.stringify(allRecords));
        }
        
        // Sincronizar respaldo con historial actual (por si hay nuevos registros)
        if (stored && adminBackup) {
          const currentRecords: UsageRecord[] = JSON.parse(stored);
          const backupRecords: UsageRecord[] = JSON.parse(adminBackup);
          
          // Encontrar registros nuevos que no están en el respaldo
          const newRecords = currentRecords.filter(current => 
            !backupRecords.some(backup => backup.id === current.id)
          );
          
          // Agregar registros nuevos al respaldo
          if (newRecords.length > 0) {
            const updatedBackup = [...backupRecords, ...newRecords];
            localStorage.setItem('chatgpt-usage-history-admin-backup', JSON.stringify(updatedBackup));
            allRecords = updatedBackup;
          }
        }
      } else {
        // Para usuarios normales, cargar solo desde el historial normal
        if (stored) {
          allRecords = JSON.parse(stored);
        }
      }
      
      // Filtrar registros según el tipo de usuario
      let filteredRecords: UsageRecord[];
      if (isRoot) {
        // Root ve todos los registros (incluyendo los eliminados por usuarios)
        filteredRecords = allRecords;
      } else {
        // Usuario normal solo ve sus propios registros
        filteredRecords = allRecords.filter(record => 
          record.imageName.includes(currentUser?.username || '')
        );
      }
      
      setUsageRecords(filteredRecords);
      calculateStats(filteredRecords);
    } catch (error) {
      console.error('Error loading usage history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      if (currentUser) {
        const preferences = await databaseService.getUserPreferences(currentUser.username);
        setUserPreferences(preferences);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const loadExchangeRates = async () => {
    try {
      // Usar el servicio de monedas para obtener las tasas actuales
      setLastUpdate(currencyService.getLastUpdate());
      setIsUsingRealRates(currencyService.isUsingRealRates());
    } catch (error) {
      console.error('Error loading exchange rates:', error);
    }
  };

  const convertCurrency = (amountUSD: number, targetCurrency: string): number => {
    return currencyService.convertCurrency(amountUSD, 'USD', targetCurrency);
  };

  const applyFilters = () => {
    let filtered = [...usageRecords];

    // Filtro por modelo
    if (modelFilter !== 'all') {
      filtered = filtered.filter(record => record.model === modelFilter);
    }

    // Filtro por usuario (solo para administradores)
    if (userFilter !== 'all' && isRoot) {
      filtered = filtered.filter(record => {
        const username = record.imageName.split('_')[0] || 'unknown';
        return username === userFilter;
      });
    }

    // Filtro por fecha
    if (dateFilter.startDate) {
      const startDate = new Date(dateFilter.startDate);
      filtered = filtered.filter(record => new Date(record.timestamp) >= startDate);
    }

    if (dateFilter.endDate) {
      const endDate = new Date(dateFilter.endDate);
      endDate.setHours(23, 59, 59, 999); // Incluir todo el día
      filtered = filtered.filter(record => new Date(record.timestamp) <= endDate);
    }

    setFilteredRecords(filtered);
    calculateStats(filtered);
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
    if (isRoot) {
      // Administrador puede eliminar todo el historial
      showConfirm(
        'Eliminar todo el historial',
        '¿Estás seguro de que quieres eliminar TODO el historial de uso de TODOS los usuarios? Esta acción no se puede deshacer.',
        () => {
          localStorage.removeItem('chatgpt-usage-history');
          localStorage.removeItem('chatgpt-usage-history-admin-backup');
          setUsageRecords([]);
          setFilteredRecords([]);
          setStats(null);
          showAlert('Historial eliminado', 'Todo el historial de uso ha sido eliminado correctamente.', 'success');
        },
        {
          confirmText: 'Eliminar todo',
          cancelText: 'Cancelar',
          type: 'error'
        }
      );
    } else {
      // Usuario normal solo puede eliminar su propio historial
      showConfirm(
        'Eliminar mi historial',
        '¿Estás seguro de que quieres eliminar tu historial de uso personal? Esta acción no se puede deshacer.',
        () => {
          clearUserHistory();
          showAlert('Historial eliminado', 'Tu historial de uso personal ha sido eliminado correctamente.', 'success');
        },
        {
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
          type: 'warning'
        }
      );
    }
  };

  const clearUserHistory = () => {
    try {
      const stored = localStorage.getItem('chatgpt-usage-history');
      const adminBackup = localStorage.getItem('chatgpt-usage-history-admin-backup');
      
      if (stored) {
        const allRecords: UsageRecord[] = JSON.parse(stored);
        const currentUsername = currentUser?.username || '';
        
        // Filtrar para mantener solo los registros de otros usuarios
        const filteredRecords = allRecords.filter(record => 
          !record.imageName.includes(`${currentUsername}_`)
        );
        
        // Guardar los registros filtrados
        localStorage.setItem('chatgpt-usage-history', JSON.stringify(filteredRecords));
        
        // Actualizar el respaldo de administradores si existe
        if (adminBackup) {
          const adminRecords: UsageRecord[] = JSON.parse(adminBackup);
          // El respaldo de administradores mantiene TODOS los registros, incluyendo los eliminados
          // No se modifica el respaldo cuando un usuario normal elimina su historial
        }
        
        // Actualizar el estado local
        setUsageRecords([]);
        setFilteredRecords([]);
        setStats(null);
      }
    } catch (error) {
      console.error('Error clearing user history:', error);
    }
  };

  const deleteUserRecord = (username: string) => {
    showConfirm(
      `Eliminar historial de ${username}`,
      `¿Estás seguro de que quieres eliminar todo el historial de uso de "${username}"? Esta acción no se puede deshacer.`,
      () => {
        try {
          const stored = localStorage.getItem('chatgpt-usage-history');
          const adminBackup = localStorage.getItem('chatgpt-usage-history-admin-backup');
          
          if (stored) {
            const allRecords: UsageRecord[] = JSON.parse(stored);
            
            // Filtrar para mantener solo los registros de otros usuarios
            const filteredRecords = allRecords.filter(record => 
              !record.imageName.includes(`${username}_`)
            );
            
            // Guardar los registros filtrados
            localStorage.setItem('chatgpt-usage-history', JSON.stringify(filteredRecords));
          }
          
          // También actualizar el respaldo de administradores
          if (adminBackup) {
            const adminRecords: UsageRecord[] = JSON.parse(adminBackup);
            const filteredAdminRecords = adminRecords.filter(record => 
              !record.imageName.includes(`${username}_`)
            );
            localStorage.setItem('chatgpt-usage-history-admin-backup', JSON.stringify(filteredAdminRecords));
          }
          
          // Recargar el historial
          loadUsageHistory();
          showAlert('Historial eliminado', `El historial de uso de "${username}" ha sido eliminado correctamente.`, 'success');
        } catch (error) {
          console.error('Error deleting user records:', error);
          showAlert('Error', 'Hubo un error al eliminar el historial del usuario.', 'error');
        }
      },
      {
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'error'
      }
    );
  };

  const toggleUserSummary = () => {
    setShowUserSummary(!showUserSummary);
  };

  const getUserSummary = () => {
    const userStats: { [username: string]: { count: number; totalCost: number; lastActivity: string } } = {};
    
    usageRecords.forEach(record => {
      const username = record.imageName.split('_')[0] || 'unknown';
      if (!userStats[username]) {
        userStats[username] = {
          count: 0,
          totalCost: 0,
          lastActivity: record.timestamp
        };
      }
      userStats[username].count++;
      userStats[username].totalCost += record.cost;
      if (new Date(record.timestamp) > new Date(userStats[username].lastActivity)) {
        userStats[username].lastActivity = record.timestamp;
      }
    });
    
    return userStats;
  };

  const clearFilters = () => {
    setDateFilter({ startDate: '', endDate: '' });
    setModelFilter('all');
    setUserFilter('all');
  };

  const getUniqueModels = () => {
    const models = [...new Set(usageRecords.map(record => record.model))];
    return models.sort();
  };

  const getUniqueUsers = () => {
    const users = [...new Set(usageRecords.map(record => record.imageName.split('_')[0] || 'unknown'))];
    return users.sort();
  };

  const exportHistory = () => {
    if (filteredRecords.length === 0) return;

    const csvContent = [
      ['Fecha', 'Modelo', 'Imagen', 'Tokens de Entrada', 'Tokens de Salida', 'Total Tokens', `Costo (${userPreferences.currency})`, 'Estado'],
      ...filteredRecords.map(record => [
        new Date(record.timestamp).toLocaleString(),
        record.model,
        record.imageName,
        record.promptTokens.toString(),
        record.completionTokens.toString(),
        record.totalTokens.toString(),
        convertCurrency(record.cost, userPreferences.currency).toFixed(6),
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

  const formatCurrency = (amountUSD: number) => {
    const convertedAmount = convertCurrency(amountUSD, userPreferences.currency);
    const currencyCode = userPreferences.currency;
    
    // Configurar el formato según la moneda
    let minimumFractionDigits = 6;
    let maximumFractionDigits = 6;
    
    // Ajustar decimales según la moneda
    if (['JPY', 'KRW'].includes(currencyCode)) {
      minimumFractionDigits = 0;
      maximumFractionDigits = 0;
    } else if (['MXN', 'BRL', 'ARS', 'CLP', 'COP'].includes(currencyCode)) {
      minimumFractionDigits = 2;
      maximumFractionDigits = 2;
    }
    
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits,
      maximumFractionDigits
    }).format(convertedAmount);
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
              {isRoot ? (
                <Users className="w-6 h-6 text-blue-600" />
              ) : (
                <User className="w-6 h-6 text-blue-600" />
              )}
              <h1 className="text-xl font-semibold text-gray-900">
                {isRoot ? 'Historial de Uso - ChatGPT (Administrador)' : 'Mi Consumo - ChatGPT'}
              </h1>
              {isRoot && (
                <div className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Vista Completa
                </div>
              )}
              <div className={`ml-4 px-3 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${isUsingRealRates ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <DollarSign className="w-3 h-3" />
                <span>{userPreferences.currency}</span>
                {isUsingRealRates ? (
                  <span className="ml-1 text-green-600" title="Tasas de cambio reales de FreeCurrencyAPI">•</span>
                ) : (
                  <span className="ml-1 text-yellow-600" title="Tasas de cambio simuladas">~</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={async () => {
                await loadUserPreferences();
                await loadExchangeRates();
                if (isUsingRealRates) {
                  await currencyService.forceUpdate();
                  setLastUpdate(currencyService.getLastUpdate());
                }
              }}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-1"
              title="Actualizar configuración de moneda y tasas de cambio"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Actualizar</span>
            </button>
            {usageRecords.length > 0 && (
              <>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
                    showFilters 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtros</span>
                </button>
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
                  title={isRoot ? 'Eliminar todo el historial del sistema' : 'Eliminar solo mi historial personal'}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isRoot ? 'Limpiar Todo' : 'Limpiar Mío'}</span>
                </button>
                {isRoot && (
                  <button
                    onClick={toggleUserSummary}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                    title="Ver resumen de usuarios y sus registros"
                  >
                    <Users className="w-4 h-4" />
                    <span>Resumen Usuarios</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && usageRecords.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Limpiar filtros</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por fecha de inicio */}
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de inicio
              </label>
              <input
                type="date"
                id="start-date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Filtro por fecha de fin */}
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de fin
              </label>
              <input
                type="date"
                id="end-date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Filtro por modelo */}
            <div>
              <label htmlFor="model-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Modelo
              </label>
              <select
                id="model-filter"
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">Todos los modelos</option>
                {getUniqueModels().map(model => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por usuario - Solo para administradores */}
            {isRoot && (
              <div>
                <label htmlFor="user-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <select
                  id="user-filter"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">Todos los usuarios</option>
                  {getUniqueUsers().map(user => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Información de filtros activos */}
          {(dateFilter.startDate || dateFilter.endDate || modelFilter !== 'all' || (userFilter !== 'all' && isRoot)) && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Filtros activos:</strong>
                {dateFilter.startDate && ` Desde ${new Date(dateFilter.startDate).toLocaleDateString()}`}
                {dateFilter.endDate && ` Hasta ${new Date(dateFilter.endDate).toLocaleDateString()}`}
                {modelFilter !== 'all' && ` Modelo: ${modelFilter}`}
                {userFilter !== 'all' && isRoot && ` Usuario: ${userFilter}`}
                {' '}({filteredRecords.length} de {usageRecords.length} registros)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Resumen de Usuarios - Solo para administradores */}
      {showUserSummary && isRoot && usageRecords.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Resumen por Usuario</h3>
            <button
              onClick={() => setShowUserSummary(false)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Cerrar</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(getUserSummary()).map(([username, stats]) => (
              <div key={username} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{username}</h4>
                  <button
                    onClick={() => deleteUserRecord(username)}
                    className="text-red-600 hover:text-red-800"
                    title={`Eliminar historial de ${username}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Registros: {stats.count}</div>
                  <div>Costo total: {formatCurrency(stats.totalCost)}</div>
                  <div>Última actividad: {new Date(stats.lastActivity).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {usageRecords.length === 0 ? (
          <div className="text-center py-12">
            {isRoot ? (
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            ) : (
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            )}
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isRoot ? 'No hay historial de uso del sistema' : 'No tienes historial de uso'}
            </h3>
            <p className="text-gray-600">
              {isRoot 
                ? 'El historial de uso de ChatGPT de todos los usuarios aparecerá aquí una vez que comiencen a generar descripciones.'
                : 'Tu historial de uso de ChatGPT aparecerá aquí una vez que comiences a generar descripciones.'
              }
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
                    <span className="text-sm font-medium text-gray-600">
                      {isRoot ? 'Total Solicitudes' : 'Mis Solicitudes'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatNumber(stats.totalRequests)}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">
                      {isRoot ? 'Total Tokens' : 'Mis Tokens'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatNumber(stats.totalTokens)}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-600">
                      {isRoot ? 'Costo Total' : 'Mi Costo'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.totalCost)}
                  </p>
                  {userPreferences.currency !== 'USD' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Convertido desde USD (1 USD = {currencyService.getExchangeRate('USD', userPreferences.currency).toFixed(2)} {userPreferences.currency})
                      {isUsingRealRates && lastUpdate && (
                        <span className="ml-2 text-green-600">
                          • Actualizado: {lastUpdate.toLocaleTimeString()}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">
                      {isRoot ? 'Modelo Más Usado' : 'Mi Modelo Favorito'}
                    </span>
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
                  {isRoot ? 'Registro Detallado (Todos los Usuarios)' : 'Mi Registro de Uso'}
                </h2>
                {isRoot && (
                  <div className="mt-1">
                    <p className="text-sm text-gray-600">
                      Vista completa del consumo de todos los usuarios del sistema
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      ℹ️ Incluye registros eliminados por usuarios normales - Solo administradores pueden ver esta información
                    </p>
                  </div>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      {isRoot && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                      )}
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
                        Costo ({userPreferences.currency})
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      {isRoot && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.timestamp).toLocaleString()}
                          </td>
                          {isRoot && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {record.imageName.split('_')[0] || 'Desconocido'}
                              </span>
                            </td>
                          )}
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
                          {isRoot && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => deleteUserRecord(record.imageName.split('_')[0])}
                                className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                                title={`Eliminar historial de ${record.imageName.split('_')[0]}`}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Eliminar</span>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Popup */}
      <Popup
        isOpen={popupState.isOpen}
        onClose={hidePopup}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
        onConfirm={popupState.onConfirm}
        onCancel={popupState.onCancel}
        confirmText={popupState.confirmText}
        cancelText={popupState.cancelText}
        showButtons={popupState.showButtons}
      />
    </div>
  );
};
