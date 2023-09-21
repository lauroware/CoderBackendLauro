const deleteUserById = async (uid) => {
    await fetch(`${window.location.href}/users/${uid}`, {
        method: "delete",
        mode: "cors",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => response.json())
        .then(() => {
            window.location.reload();
        });
};

const updateUserRole = async (uid) => {
    const newRole = document.getElementById(`newRole-${uid}`).value;
    const data = {}

    if (newRole) {
        data.uid = uid;
        data.newRole = newRole;
    }
    await fetch(`${window.location.href}/users/${uid}`, {
        method: "put",
        mode: "cors",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then((response) => response.json())
        .then(() => {
            window.location.reload();
        })
        .catch((error) => {
            console.error("Error updating user role:", error);
        });

}

const deleteProductById = async (pid) => {
    await fetch(`${window.location.protocol}//${window.location.host}/api/products/${pid}`, {
        method: "delete",
        mode: "cors",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => response.json())
        .then(() => {
            window.location.reload();
        });
}

const createNewProduct = async () => {
    const newTitle = document.getElementById("title").value;
    const newDescription = document.getElementById("description").value;
    const newPrice = document.getElementById("price").value;
    const newThumbnail = document.getElementById("thumbnail").value;
    const newCode = document.getElementById("code").value;
    const newStock = document.getElementById("stock").value;
    const newCategory = document.getElementById("category").value;

    const data = {
        title: newTitle,
        description: newDescription,
        price: newPrice,
        thumbnail: newThumbnail,
        code: newCode,
        stock: newStock,
        category: newCategory
    };

    await fetch(`${window.location.protocol}//${window.location.host}/api/products/`, {
        method: "post",
        mode: "cors",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    }).then((response) => response.json())
        .then(() => {
            window.location.reload();
        })
        .catch((error) => {
            console.error("Error creating new product:", error);
        })

}

const updateProduct = async (pid) => {
    const data = {};

    const newTitle = document.getElementById(`newTitle-${pid}`).value;
    const newDescription = document.getElementById(`newDescription-${pid}`).value;
    const newPrice = document.getElementById(`newPrice-${pid}`).value;
    const newStock = document.getElementById(`newStock-${pid}`).value;
    const newCategory = document.getElementById(`newCategory-${pid}`).value;

    if (newTitle || newDescription || newPrice || newStock || newCategory) {
        data.pid = pid;
        data.updates = {
            title: newTitle,
            description: newDescription,
            price: parseFloat(newPrice),
            stock: newStock,
            category: newCategory
        }
    }

    await fetch(`${window.location.protocol}//${window.location.host}/api/products/${pid}`, {
        method: "put",
        mode: "cors",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then((response) => response.json())
        .then((res) => {
            window.location.reload();
        })
        .catch((error) => {
            console.error("Error updating product:", error);
        });
};