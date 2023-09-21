const form = document.getElementById("formLogin");

form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitForm();
});
const submitForm = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    await fetch(`${window.location.href}`, {
        method: "post",
        mode: "cors",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email,
            password: password,
        }),
    }).then(async (res) => {
        data = await res.json();
        if (data.status === "error") {
            Swal.fire({
                position: "center",
                icon: "error",
                title: data.payload,
                showConfirmButton: false,
                timer: 2500
            })
        }
        if (data.status === 'success') {
            const cartId = data.payload.cartId;
            sessionStorage.setItem("cartId", cartId);
            window.location.href = data.redirectTo;
        }
    })



}