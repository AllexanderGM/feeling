// Debug script for UsersManagement component
// This script will help identify issues with the API request and data display

console.log('🔍 Starting UsersManagement Debug Script');

// 1. Check if the component is properly loaded
if (window.location.pathname.includes('/admin/users')) {
  console.log('✅ On UsersManagement page');
  
  // 2. Check if the API request was made
  const checkNetworkRequests = () => {
    console.log('📡 Checking network requests...');
    
    // Check if there are any fetch requests in the network tab
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('/users') || entry.name.includes('/api/users')) {
          console.log('🌐 API Request found:', {
            url: entry.name,
            duration: entry.duration,
            responseStart: entry.responseStart,
            responseEnd: entry.responseEnd
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['navigation', 'resource'] });
  };
  
  // 3. Check React component state
  const checkReactState = () => {
    console.log('⚛️ Checking React component state...');
    
    // Try to access React DevTools data
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('✅ React DevTools available');
      
      // Look for the UsersManagement component in the fiber tree
      const findUsersManagementComponent = (fiber) => {
        if (fiber.type && fiber.type.name === 'UsersManagement') {
          console.log('🎯 Found UsersManagement component:', fiber);
          console.log('📊 Component state:', fiber.memoizedState);
          console.log('🔗 Component props:', fiber.memoizedProps);
        }
        
        if (fiber.child) findUsersManagementComponent(fiber.child);
        if (fiber.sibling) findUsersManagementComponent(fiber.sibling);
      };
      
      // Start from root
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__.rendererInterfaces) {
        Object.values(window.__REACT_DEVTOOLS_GLOBAL_HOOK__.rendererInterfaces).forEach(renderer => {
          if (renderer.findFiberByHostInstance) {
            const rootElement = document.querySelector('#root');
            if (rootElement) {
              const fiber = renderer.findFiberByHostInstance(rootElement);
              if (fiber) findUsersManagementComponent(fiber);
            }
          }
        });
      }
    }
  };
  
  // 4. Check for JavaScript errors
  const checkJSErrors = () => {
    console.log('❌ Checking for JavaScript errors...');
    
    const originalError = console.error;
    console.error = (...args) => {
      console.log('🚨 JavaScript Error detected:', args);
      originalError.apply(console, args);
    };
    
    // Check for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.log('🚨 Unhandled Promise Rejection:', event.reason);
    });
  };
  
  // 5. Check local storage and session storage
  const checkStorageData = () => {
    console.log('💾 Checking storage data...');
    
    const authData = localStorage.getItem('auth');
    const userData = localStorage.getItem('user');
    
    console.log('🔐 Auth data:', authData ? JSON.parse(authData) : 'No auth data');
    console.log('👤 User data:', userData ? JSON.parse(userData) : 'No user data');
  };
  
  // 6. Intercept fetch requests
  const interceptFetch = () => {
    console.log('🕵️ Intercepting fetch requests...');
    
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0];
      console.log('🌐 Fetch request:', url);
      
      try {
        const response = await originalFetch(...args);
        const clonedResponse = response.clone();
        
        if (url.includes('/users')) {
          console.log('👥 Users API response status:', response.status);
          console.log('👥 Users API response headers:', Object.fromEntries(response.headers.entries()));
          
          if (response.ok) {
            const data = await clonedResponse.json();
            console.log('📊 Users API response data:', data);
            console.log('📊 Users count:', Array.isArray(data) ? data.length : 'Not an array');
            
            if (Array.isArray(data)) {
              console.log('👤 First user sample:', data[0]);
              console.log('🔍 User properties:', Object.keys(data[0] || {}));
            }
          } else {
            const errorText = await clonedResponse.text();
            console.log('❌ API Error response:', errorText);
          }
        }
        
        return response;
      } catch (error) {
        console.log('❌ Fetch error:', error);
        throw error;
      }
    };
  };
  
  // 7. Check DOM elements
  const checkDOMElements = () => {
    console.log('🏗️ Checking DOM elements...');
    
    const table = document.querySelector('[aria-label="Tabla de Usuarios"]');
    const tableBody = document.querySelector('tbody');
    const rows = document.querySelectorAll('tbody tr');
    
    console.log('📊 Table element:', table);
    console.log('📊 Table body:', tableBody);
    console.log('📊 Table rows count:', rows.length);
    
    if (rows.length === 0) {
      console.log('⚠️ No table rows found - this might be the issue');
    }
    
    // Check for loading states
    const loadingElements = document.querySelectorAll('[data-loading="true"], .loading');
    console.log('⏳ Loading elements:', loadingElements.length);
    
    // Check for error messages
    const errorElements = document.querySelectorAll('[data-error="true"], .error');
    console.log('❌ Error elements:', errorElements.length);
  };
  
  // 8. Check useUser hook data
  const checkUserHookData = () => {
    console.log('🪝 Checking useUser hook data...');
    
    // This will run periodically to check if data changes
    const interval = setInterval(() => {
      // Look for users data in React component state
      const usersData = window.__USERS_DEBUG_DATA;
      if (usersData) {
        console.log('📊 Users data from hook:', usersData);
        console.log('📊 Users array length:', usersData.length);
        clearInterval(interval);
      }
    }, 1000);
    
    // Clear interval after 10 seconds
    setTimeout(() => {
      clearInterval(interval);
    }, 10000);
  };
  
  // Run all checks
  checkNetworkRequests();
  checkReactState();
  checkJSErrors();
  checkStorageData();
  interceptFetch();
  checkDOMElements();
  checkUserHookData();
  
  // Set up periodic DOM checks
  setInterval(() => {
    checkDOMElements();
  }, 5000);
  
  console.log('🔍 Debug script setup complete. Check the console for detailed information.');
  console.log('💡 To help debug further, add this to your useUser hook in the fetchUsers function:');
  console.log('   window.__USERS_DEBUG_DATA = usersData;');
  
} else {
  console.log('❌ Not on UsersManagement page. Navigate to /admin/users to run this debug script.');
}