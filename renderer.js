window.electronAPI.onDeepLink((data) => {
        console.log('Received deep link:', data);
        const message = document.createElement('p');
        message.textContent = `Deep link received: ${data}`;
        document.body.appendChild(message);
      });