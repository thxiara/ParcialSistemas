// Habla con la API (/api/cat). Cada función devuelve una promesa
// La cuál sera cumplida con el recibo de una respuesta en forma de json por parte de la API 
(() => {
    async function call(endpoint, method = "GET", body = null) {
        const data = await API.request(endpoint, method, body);
        if (!data?.success) {
            throw new Error(data?.message || "No se pudo conectar con el servidor.");
        }
        return data;
    }

    window.callCat = {
        async list() {
            return (await call("/cat")).cats;
        },

        async get(id) {
            return (await call(`/cat/${encodeURIComponent(id)}`)).cat;
        },

        async create(cat) {
            return (await call("/cat", "POST", cat)).cat;
        },

        async update(id, cat) {
            return (await call(`/cat/${encodeURIComponent(id)}`, "PUT", cat)).cat;
        },

        async remove(id) {
            await call(`/cat/${encodeURIComponent(id)}`, "DELETE");
        },
    };
})();
