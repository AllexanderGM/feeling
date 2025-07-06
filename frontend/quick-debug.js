// Quick Debug Script for UsersManagement
// Copy and paste this into browser console while on /admin/users page

console.log('🚀 Starting Quick Debug for UsersManagement');

// Check if we're on the right page
if (!window.location.pathname.includes('/admin/users')) {
  console.log('❌ Not on /admin/users page. Navigate there first.');
} else {
  console.log('✅ On UsersManagement page');
}

// Function to check table content
const checkTable = () => {
  const table = document.querySelector('[aria-label="Tabla de Usuarios"]');
  const tableBody = document.querySelector('tbody');
  const rows = document.querySelectorAll('tbody tr');
  
  console.log('📊 TABLE CHECK:');
  console.log('- Table element found:', !!table);
  console.log('- Table body found:', !!tableBody);
  console.log('- Rows count:', rows.length);
  
  if (rows.length > 0) {
    console.log('- First row content:', rows[0].textContent);
  } else {
    console.log('- Table body content:', tableBody?.textContent || 'No tbody');
  }
  
  // Check for loading or empty states
  const emptyContent = document.querySelector('[data-slot="empty-content"]');
  const loadingContent = document.querySelector('[data-slot="loading-content"]');
  
  if (emptyContent) {
    console.log('- Empty content message:', emptyContent.textContent);
  }
  
  if (loadingContent) {
    console.log('- Loading content message:', loadingContent.textContent);
  }
};

// Function to check localStorage/sessionStorage
const checkStorage = () => {
  console.log('💾 STORAGE CHECK:');
  const authData = localStorage.getItem('auth');
  const userData = localStorage.getItem('user');
  
  console.log('- Auth data exists:', !!authData);
  console.log('- User data exists:', !!userData);
  
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      console.log('- Auth data:', parsed);
    } catch (e) {
      console.log('- Auth data parse error:', e);
    }
  }
};

// Function to check recent network requests
const checkNetworkRequests = () => {
  console.log('🌐 NETWORK CHECK:');
  const entries = performance.getEntriesByType('resource');
  const userRequests = entries.filter(entry => entry.name.includes('/users'));
  
  console.log('- User-related requests found:', userRequests.length);
  
  userRequests.forEach((request, index) => {
    console.log(`- Request ${index + 1}:`, {
      url: request.name,
      duration: request.duration,
      status: request.responseStatus || 'Unknown'
    });
  });
};

// Function to check for JavaScript errors
const checkErrors = () => {
  console.log('❌ ERROR CHECK:');
  console.log('- Setting up error listeners...');
  
  // Override console.error to catch errors
  const originalError = console.error;
  console.error = (...args) => {
    console.log('🚨 ERROR CAUGHT:', args);
    originalError.apply(console, args);
  };
  
  // Listen for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.log('🚨 UNHANDLED REJECTION:', event.reason);
  });
};

// Function to intercept API calls
const interceptAPI = () => {
  console.log('🕵️ API INTERCEPT: Setting up...');
  
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const url = args[0];
    
    if (url.includes('/users')) {
      console.log('🌐 API CALL:', url);
      
      try {
        const response = await originalFetch(...args);
        const clonedResponse = response.clone();
        
        console.log('📨 API RESPONSE:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        if (response.ok) {
          const data = await clonedResponse.json();
          console.log('📊 API DATA:', data);
          console.log('📊 Data type:', typeof data);
          console.log('📊 Is array:', Array.isArray(data));
          console.log('📊 Length:', data?.length || 'N/A');
          
          if (Array.isArray(data) && data.length > 0) {
            console.log('📊 First item:', data[0]);
            console.log('📊 Properties:', Object.keys(data[0]));
          }
        } else {
          const errorText = await clonedResponse.text();
          console.log('❌ API ERROR:', errorText);
        }
        
        return response;
      } catch (error) {
        console.log('❌ API FETCH ERROR:', error);
        throw error;
      }
    }
    
    return originalFetch(...args);
  };
};

// Function to check component state
const checkComponentState = () => {
  console.log('⚛️ COMPONENT STATE CHECK:');
  
  // Check if debug data is available
  if (window.__USERS_DEBUG_DATA) {
    console.log('- Debug data available:', window.__USERS_DEBUG_DATA);
    console.log('- Debug data length:', window.__USERS_DEBUG_DATA.length);
  } else {
    console.log('- No debug data available (add console logs to component)');
  }
  
  // Try to find React elements
  const reactElements = document.querySelectorAll('[data-reactroot], #root');
  console.log('- React elements found:', reactElements.length);
};

// Run all checks
console.log('🔍 Running all checks...');
checkTable();
checkStorage();
checkNetworkRequests();
checkErrors();
interceptAPI();
checkComponentState();

// Set up periodic checks
console.log('⏰ Setting up periodic checks...');
const interval = setInterval(() => {
  console.log('--- PERIODIC CHECK ---');
  checkTable();
  checkComponentState();
}, 10000);

// Stop periodic checks after 2 minutes
setTimeout(() => {
  clearInterval(interval);
  console.log('⏰ Stopped periodic checks');
}, 120000);

console.log('🚀 Quick Debug setup complete!');
console.log('💡 Now try refreshing the page or navigating to /admin/users');
console.log('💡 Check console for detailed logs as the component loads');