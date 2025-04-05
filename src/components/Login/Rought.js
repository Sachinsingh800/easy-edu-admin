  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://www.backend.thenewstale.com/admin/auth/logInAdmin', {
        email: username,
        password,
      });

      if (response.data.status) {
        Cookies.set('token', response.data.token);
        navigate('/dashboard');
      } 
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Axios error (HTTP error)
        const { response } = error;
        // Set the error message
        const errorMessage = response.data.message;
        alert(errorMessage);
      } else {
        // Network error (e.g., no internet connection)
        alert("Something went wrong");
      }
    }
  };