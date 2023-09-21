const restorePassword = async () => {
  const newPassword = document.getElementById("newPassword").value;
  const email = document.getElementById("email").value;

  if (newPassword) {
    // Enviar el correo electrónico con el token
    await fetch(
      `${window.location.protocol}//${window.location.host}/auth/sendTokenToEmail`,
      {
        method: "post",
        mode: "cors",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        Swal.fire({
          title: "Ingresa el código recibido en su dirección de email:",
          input: "text",
          showCancelButton: true,
          confirmButtonText: "Verificar",
          showLoaderOnConfirm: true,
          preConfirm: (code) => {
            if (code) {
              data.email = email;
              data.code = code;
              data.newPassword = newPassword;

              return fetch(
                `${window.location.protocol}//${window.location.host}/auth/restorePassword`,
                {
                  method: "put",
                  mode: "cors",
                  cache: "no-cache",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(data),
                }
              )
                .then((response) => response.json())
                .then((data) => {
                  console.log(data.message);
                  window.location.href = "/auth/login";
                })
                .catch((error) => {
                  console.error("Error updating user password:", error);
                });
            } else {
              Swal.showValidationMessage("Debes ingresar el código");
            }
          },
          allowOutsideClick: () => !Swal.isLoading(),
        });
      })
      .catch((error) => {
        console.error("Error sending token:", error);
      });
  }
};
