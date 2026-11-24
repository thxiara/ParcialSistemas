(() => {
    "use strict";

    const store = window.callCat;

    // Si la página no cargó el store, no hacemos nada
    if (!store) {
        console.error("Gatos: falta cargar js/pages/call-cats.js");
        return;
    }

    function clearError(element) {
        element.textContent = "";
        element.hidden = true;
        element.classList.remove("is-error");
        element.style.color = "";
    }

    // ------------------------------------------------------------------------
    // LISTADO
    // Se activa solo en listCat.html, que tiene <tbody id="cats-body">.
    // ------------------------------------------------------------------------
    const tableBody = document.getElementById("cats-body");

    if (tableBody) {
        const tableInfo = document.getElementById("table-info");
        const pagination = document.getElementById("pagination");

        const PER_PAGE = 7;

        let cats = [];
        let currentPage = 1;

        // Las celdas se crean con textContent, no con innerHTML: los datos vienen
        // de la base y así se evita inyección de HTML
        function createCell(value, className = "") {
            const cell = document.createElement("td");
            cell.textContent = value;
            if (className) cell.className = className;
            return cell;
        }

        function createRow(cat) {
            const row = document.createElement("tr");

            row.append(
                createCell(cat.name ?? ""),
                createCell(cat.breed ?? ""),
                createCell(String(cat.age ?? 0)),
                createCell(String(cat.id ?? "")),
            );

            const actionsCell = document.createElement("td");
            actionsCell.className = "cell-action";

            const editButton = document.createElement("button");
            editButton.addEventListener("click", () => {
                location.href = `/cat/edit?id=${encodeURIComponent(cat.id)}`;
            });
            editButton.textContent = "Editar";
            editButton.className = "home-button home-button-primary actionBtn";

            // Botón de borrado: se apoya en callCat.remove(), que ya existe.
            // Se usa delegación de eventos más abajo para no crear un listener
            // por fila.
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.dataset.deleteCat = cat.id;
            deleteButton.textContent = "Eliminar";
            deleteButton.className = "home-button home-button-secondary actionBtn";

            actionsCell.append(editButton, deleteButton);
            row.append(actionsCell);

            return row;
        }

        function renderEmpty(message) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 5;
            cell.className = "empty-row";
            cell.textContent = message;
            row.append(cell);
            tableBody.replaceChildren(row);
        }

        // Paginación del lado del cliente: se conserva porque listCat.html
        // ya trae #pagination y #table-info. Si no existen, se omite sin error.
        function renderPagination(totalPages) {
            if (!pagination) return;

            pagination.replaceChildren();

            const addButton = (label, page, { disabled = false, active = false, ellipsis = false } = {}) => {
                if (ellipsis) {
                    const span = document.createElement("span");
                    span.className = "page-ellipsis";
                    span.textContent = label;
                    pagination.append(span);
                    return;
                }

                const button = document.createElement("button");
                button.type = "button";
                button.className = "page-btn" + (active ? " active" : "");
                button.textContent = label;
                button.disabled = disabled;

                if (!disabled && !active) {
                    button.addEventListener("click", () => {
                        currentPage = page;
                        renderPage();
                    });
                }

                pagination.append(button);
            };

            addButton("‹", currentPage - 1, { disabled: currentPage === 1 });

            const pages = [];
            if (totalPages <= 8) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                if (currentPage > 3) pages.push("...");
                for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                    pages.push(i);
                }
                if (currentPage < totalPages - 2) pages.push("...");
                pages.push(totalPages);
            }

            pages.forEach(page => {
                if (page === "...") addButton("...", null, { ellipsis: true });
                else addButton(String(page), page, { active: page === currentPage });
            });

            addButton("›", currentPage + 1, { disabled: currentPage === totalPages });
        }

        function renderPage() {
            const total = cats.length;
            const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

            if (currentPage > totalPages) currentPage = totalPages;

            const start = (currentPage - 1) * PER_PAGE;
            const slice = cats.slice(start, start + PER_PAGE);

            if (slice.length === 0) {
                renderEmpty("No hay gatos cargados.");
            } else {
                tableBody.replaceChildren(...slice.map(createRow));
            }

            if (tableInfo) {
                tableInfo.textContent = total === 0
                    ? "Mostrando 0 de 0"
                    : `Mostrando ${start + 1}-${Math.min(start + PER_PAGE, total)} de ${total}`;
            }

            renderPagination(totalPages);
        }

        async function loadCats() {
            try {
                const list = await store.list();

                if (!Array.isArray(list)) {
                    throw new Error("La API no devolvió una lista de gatos. Revisá call-cats.js (.cats).");
                }

                cats = list;
                currentPage = 1;
                if (tableInfo) tableInfo.style.color = "";
                renderPage();
            } catch (error) {
                cats = [];
                const message = error instanceof Error && error.message
                    ? error.message
                    : "No se pudo cargar la lista de gatos.";

                renderEmpty("No se pudieron cargar los gatos.");

                if (tableInfo) {
                    tableInfo.textContent = message;
                    tableInfo.style.color = "#b00016";
                }
            }
        }

        // Delegación: un solo listener para todos los botones "Eliminar".
        tableBody.addEventListener("click", async event => {
            const button = event.target.closest("[data-delete-cat]");
            if (!button) return;

            const id = button.dataset.deleteCat;
            if (!window.confirm("¿Eliminar este gato?")) return;

            button.disabled = true;
            try {
                await store.remove(id);
                await loadCats();
            } catch (error) {
                button.disabled = false;
                window.alert(error instanceof Error ? error.message : "No se pudo eliminar el gato.");
            }
        });

        loadCats();
    }

    // ------------------------------------------------------------------------
    // FORMULARIO (alta y edición)
    // Se activa en addCat.html y editCat.html, ambos con
    // <form id="cat-form">.
    // ------------------------------------------------------------------------
    const form = document.getElementById("cat-form");

    if (!form) return;
    const title = form.querySelector(".form-title");
    const submitButton = form.querySelector('button[type="submit"]');
    const idInput = document.getElementById("id");
    const nameInput = document.getElementById("name");
    const breedInput = document.getElementById("breed");
    const ageInput = document.getElementById("age");

    // El modo se decide por la URL: /cat/edit?id=5 -> editar; si no, alta.
    const catId = new URLSearchParams(window.location.search).get("id");

    // Mensaje de estado del formulario, creado dinámicamente porque las vistas
    // no tienen un contenedor de feedback. 
    const feedback = document.createElement("p");
    feedback.className = "form-hint";
    feedback.setAttribute("role", "status");
    feedback.hidden = true;
    (title || form).insertAdjacentElement("afterend", feedback);

    function setFeedback(message, isError = false) {
        feedback.hidden = false;
        feedback.textContent = message;
        feedback.style.color = isError ? "#b00016" : "";
    }

    function readForm() {
        const cat = {
            name: nameInput.value.trim(),
            breed: breedInput.value.trim(),
            age: Number(ageInput.value)
        };

        return cat;
    }

    // Validación espejo de catController::validate(), limitada a los campos
    // existentes. reportValidity() ya cubre required/min
    function validate(cat) {
        if (cat.name === "" || cat.name.length > 40) {
            return "El nombre tiene que tener entre 1 y 40 caracteres.";
        }
        if (cat.breed === "" || cat.breed.length > 40) {
            return "La raza tiene que tener entre 1 y 40 caracteres.";
        }
        if (!Number.isInteger(cat.age) || cat.age < 0 || cat.age > 40) {
            return "La edad debe ser un entero entre 0 y 40.";
        }
        return null;
    }

    if (catId) {
        if (title) title.textContent = "Editar gato";
        if (submitButton) submitButton.textContent = "Guardar cambios";
        if (idInput) idInput.value = catId;
        if (submitButton) submitButton.disabled = true;

        store.get(catId)
            .then(cat => {
                if (!cat) throw new Error("No se encontró el gato.");

                nameInput.value = cat.name ?? "";
                breedInput.value = cat.breed ?? "";
                ageInput.value = String(cat.age ?? 0);
                if (submitButton) submitButton.disabled = false;
            })
            .catch(error => {
                if (submitButton) submitButton.disabled = false;
                setFeedback(
                    error instanceof Error ? error.message : "No se pudo cargar el gato.",
                    true
                );
            });
    } else {
        if (title) title.textContent = "Agregar gato";
        if (idInput) idInput.value = "";
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (!form.reportValidity()) return;

        const cat = readForm();
        const validationError = validate(cat);

        if (validationError) {
            setFeedback(validationError, true);
            return;
        }

        clearError(feedback);

        if (submitButton) submitButton.disabled = true;

        try {
            if (catId) {
                await store.update(catId, cat);
            } else {
                await store.create(cat);
            }

            setFeedback("Gato guardado correctamente.");

            window.setTimeout(() => {
                window.location.href = "/cat/list";
            }, 700);
        } catch (error) {
            if (submitButton) submitButton.disabled = false;
            setFeedback(
                error instanceof Error ? error.message : "No se pudo guardar el gato.",
                true
            );
        }
    });

})();
