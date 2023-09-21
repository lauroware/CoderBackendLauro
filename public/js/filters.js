const nextPage = (page) => {
    let nextPage = Number(page) + 1
    let newUrl = moveUrl({ page: nextPage })
    window.location.href = newUrl;
}
const prevPage = (page) => {
    let prevPage = Number(page) - 1
    let newUrl = moveUrl({ page: prevPage })
    window.location.href = newUrl;
}
const addQuery = (query) => {
    let newUrl = moveUrl({ query })
    window.location.href = newUrl
}
const sortAsc = (sort) => {
    sort = "asc"
    let newUrl = moveUrl({ sort })
    window.location.href = newUrl;
}
const sortDes = (sort) => {
    sort = "desc"
    let newUrl = moveUrl({ sort })
    window.location.href = newUrl;
}
const moveUrl = (filters) => {
    let url = window.location.href;
    let filterExist = url.includes("?")
    let query = ''
    let newFilters = {};
    if (filterExist) {
        query = url.split("?")[1];
        const params = new URLSearchParams(query);
        for (const [key, value] of params) {
            newFilters[key] = value;
        }
    }
    for (const [key, value] of Object.entries(filters)) {
        newFilters[key] = value;
    }
    const params = new URLSearchParams(newFilters);

    const newUrl = url.split("?")[0] + "?" + params.toString();
    return newUrl;
}


removeFilters = () => {
    let newUrl = `${window.location.protocol}//${window.location.host}/api/products`;
    window.location.href = newUrl;
} 