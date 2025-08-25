import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Loader, ExternalLink } from 'lucide-react';

const ServerStatusChecker = () => {
  // Replace these with your actual server URLs
  const servers = [
    {
      name: 'Server 1: Decision Tree Model',
      url: 'https://career-comm-priv-1.onrender.com/health', // Health check endpoint
      mainUrl: 'https://career-comm-priv-1.onrender.com'
    },
    {
      name: 'Server 2: Main Laravel Web App', 
      url: 'https://career-comm-main-laravel.onrender.com', // Health check endpoint
      mainUrl: 'https://career-comm-main-laravel.onrender.com'
    }
  ];

  const [serverStates, setServerStates] = useState(
    servers.map(() => ({ status: 'checking', startTime: Date.now(), responseTime: null }))
  );

  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every 100ms for smooth timing
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const checkServer = async (serverUrl, index) => {
    const startTime = Date.now();
    
    setServerStates(prev => prev.map((state, i) => 
      i === index 
        ? { ...state, status: 'checking', startTime, responseTime: null }
        : state
    ));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(serverUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      setServerStates(prev => prev.map((state, i) => 
        i === index 
          ? { 
              ...state, 
              status: response.ok ? 'online' : 'error',
              responseTime
            }
          : state
      ));
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      setServerStates(prev => prev.map((state, i) => 
        i === index 
          ? { 
              ...state, 
              status: 'error',
              responseTime
            }
          : state
      ));
    }
  };

  const checkAllServers = () => {
    servers.forEach((server, index) => {
      checkServer(server.url, index);
    });
  };

  useEffect(() => {
    checkAllServers();
  }, []);

  const getStatusDisplay = (state) => {
    const elapsedTime = (currentTime - state.startTime) / 1000;

    if (state.status === 'online') {
      return {
        text: `Online (${state.responseTime}ms)`,
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        color: 'text-green-600'
      };
    }

    if (state.status === 'error') {
      return {
        text: 'Error - Check URL',
        icon: <div className="w-5 h-5 bg-red-500 rounded-full" />,
        color: 'text-red-600'
      };
    }

    if (elapsedTime < 2) {
      return {
        text: 'Checking server status',
        icon: <Clock className="w-5 h-5 text-blue-500" />,
        color: 'text-blue-600'
      };
    }

    return {
      text: 'Waking up server...',
      icon: <Loader className="w-5 h-5 text-orange-500 animate-spin" />,
      color: 'text-orange-600'
    };
  };

  const allServersOnline = serverStates.every(state => state.status === 'online');

  const handleGoToMainPage = (mainUrl) => {
    window.open(mainUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">CCSuggest: Server Status Monitor</h1>
          <p className="text-gray-600">Checking and waking up your Render services</p>
        </div>

        <div className="space-y-6">
          {servers.map((server, index) => {
            const statusInfo = getStatusDisplay(serverStates[index]);
            const elapsedTime = ((currentTime - serverStates[index].startTime) / 1000).toFixed(1);

            return (
              <div key={index} className="border rounded-lg p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {statusInfo.icon}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{server.name}</h3>
                      <p className="text-sm text-gray-500">{server.mainUrl}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${statusInfo.color}`}>
                      {statusInfo.text}
                    </p>
                    {serverStates[index].status === 'checking' && (
                      <p className="text-sm text-gray-500">
                        {elapsedTime}s
                      </p>
                    )}
                  </div>
                </div>

                {serverStates[index].status === 'online' && (
                  <button
                    onClick={() => handleGoToMainPage(server.mainUrl)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Go to {server.name}</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={checkAllServers}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors mr-4"
          >
            Refresh Status
          </button>
          
          {allServersOnline && (
            <div className="mt-4">
              <p className="text-green-600 font-semibold mb-3">
                ✅ All servers are online and ready!
              </p>
              <div className="flex justify-center space-x-4">
                {servers.map((server, index) => (
                  <button
                    key={index}
                    onClick={() => handleGoToMainPage(server.mainUrl)}
                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <span>Go to {server.name}</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This tool helps wake up sleeping Render services by sending health check requests.</p>
          <p className="mt-1">Response times over 3 seconds typically indicate the server was sleeping.</p>
        </div>
      </div>
    </div>
  );
};

export default ServerStatusChecker;