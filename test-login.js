// Quick test script to debug admin login
const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'stownsend@musicalartsinstitute.org',
        password: 'password123'
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Login successful:', data);
    } else {
      const error = await response.text();
      console.log('Login failed:', error);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
};

testLogin();