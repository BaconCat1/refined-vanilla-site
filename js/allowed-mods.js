/**
 * Builds the Allowed Mods UI from a plain text source file.
 * Edit the data at /assets/data/allowed-mods-list.txt.
 */
const CLIENT_OFFICIAL_URLS = [
    { match: "fabric client", url: "https://fabricmc.net/" },
    { match: "forge client", url: "https://files.minecraftforge.net/" },
    { match: "lunar client", url: "https://www.lunarclient.com/" },
    { match: "minecraft console client", url: "https://github.com/MCCTeam/Minecraft-Console-Client" },
    { match: "quilt client", url: "https://quiltmc.org/" },
    { match: "vanilla client", url: "https://www.minecraft.net/" }
];

document.addEventListener("DOMContentLoaded", () => {
    const rootEl = document.getElementById("allowed-mods-root");
    if (!rootEl) return;

    const sourcePath = rootEl.dataset.source || "../assets/data/allowed-mods-list.txt";

    fetch(sourcePath, { cache: "no-store" })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load list (${response.status})`);
            }
            return response.text();
        })
        .then((text) => {
            const data = parseAllowedModsText(text);
            renderAllowedMods(rootEl, data);
        })
        .catch((error) => {
            rootEl.innerHTML = "";
            const errorEl = document.createElement("p");
            errorEl.className = "allowed-mods-error";
            errorEl.textContent = `Could not load allowed mods list. ${error.message}`;
            rootEl.appendChild(errorEl);
        });
});

function parseAllowedModsText(text) {
    const data = {
        clients: [],
        modPacks: [],
        modsByGroup: new Map()
    };

    let section = "";
    let currentGroup = "";

    const lines = text.split(/\r?\n/);
    lines.forEach((rawLine) => {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) return;

        const sectionMatch = line.match(/^\[(.+)]$/);
        if (sectionMatch) {
            section = sectionMatch[1].toLowerCase();
            currentGroup = "";
            return;
        }

        if (section === "allowed mods") {
            const groupMatch = line.match(/^([A-Za-z0-9-]+):$/);
            if (groupMatch) {
                currentGroup = groupMatch[1];
                if (currentGroup && !data.modsByGroup.has(currentGroup)) {
                    data.modsByGroup.set(currentGroup, []);
                }
                return;
            }

            if (!currentGroup) return;

            const groupItems = data.modsByGroup.get(currentGroup);
            groupItems.push(parseListItem(line));
            return;
        }

        if (section === "allowed clients") {
            data.clients.push(parseListItem(line));
            return;
        }

        if (section === "allowed mod packs") {
            data.modPacks.push(parseListItem(line));
        }
    });

    return data;
}

function renderAllowedMods(rootEl, data) {
    rootEl.innerHTML = "";

    const allMods = Array.from(data.modsByGroup.values()).flat();

    const summaryEl = document.createElement("div");
    summaryEl.className = "allowed-mods-summary";
    summaryEl.innerHTML = `
        <span><strong>${data.clients.length}</strong> Clients</span>
        <span><strong>${data.modPacks.length}</strong> Mod Pack${data.modPacks.length === 1 ? "" : "s"}</span>
        <span><strong>${allMods.length}</strong> Allowed Mods</span>
    `;

    const editNoteEl = document.createElement("p");
    editNoteEl.className = "allowed-mods-edit-note";
    editNoteEl.innerHTML = 'To update this list, edit <code>assets/data/allowed-mods-list.txt</code>.';

    const clientsCard = createChipCard("Allowed Clients", data.clients, (item) => getClientOfficialUrl(item));
    const packsCard = createChipCard("Allowed Mod Packs", data.modPacks, (item) => getModrinthSearchUrl(item, "modpacks"));

    const topCardsWrapEl = document.createElement("div");
    topCardsWrapEl.className = "allowed-mods-top-cards";
    topCardsWrapEl.append(clientsCard, packsCard);

    const searchWrapEl = document.createElement("div");
    searchWrapEl.className = "allowed-mods-search";

    const searchLabelEl = document.createElement("label");
    searchLabelEl.setAttribute("for", "allowed-mod-search");
    searchLabelEl.textContent = "Search allowed mods";

    const searchInputEl = document.createElement("input");
    searchInputEl.id = "allowed-mod-search";
    searchInputEl.type = "search";
    searchInputEl.placeholder = "Type a mod name...";
    searchInputEl.autocomplete = "off";

    searchWrapEl.append(searchLabelEl, searchInputEl);

    const groupsWrapEl = document.createElement("div");
    groupsWrapEl.className = "allowed-mod-groups";

    const emptyStateEl = document.createElement("p");
    emptyStateEl.className = "allowed-mods-empty";
    emptyStateEl.textContent = "No allowed mods match that search.";
    emptyStateEl.hidden = true;

    const renderGroups = (query) => {
        groupsWrapEl.innerHTML = "";
        const normalized = query.trim().toLowerCase();
        let renderedCount = 0;

        data.modsByGroup.forEach((mods, group) => {
            const filteredMods = normalized
                ? mods.filter((mod) => mod.label.toLowerCase().includes(normalized))
                : mods;

            if (filteredMods.length === 0) return;

            renderedCount += 1;

            const groupCardEl = document.createElement("article");
            groupCardEl.className = "allowed-mod-group-card";

            const titleEl = document.createElement("h3");
            titleEl.textContent = `${group} (${filteredMods.length})`;

            const listEl = document.createElement("ul");
            listEl.className = "allowed-mod-list";

            filteredMods.forEach((mod) => {
                const itemEl = document.createElement("li");
                const modUrl = mod.url || getModrinthSearchUrl(mod.label, "mods");
                const linkEl = createExternalLink(mod.label, modUrl);
                itemEl.appendChild(linkEl);
                listEl.appendChild(itemEl);
            });

            groupCardEl.append(titleEl, listEl);
            groupsWrapEl.appendChild(groupCardEl);
        });

        emptyStateEl.hidden = renderedCount > 0;
    };

    searchInputEl.addEventListener("input", () => {
        renderGroups(searchInputEl.value);
    });

    renderGroups("");

    rootEl.append(
        summaryEl,
        editNoteEl,
        topCardsWrapEl,
        searchWrapEl,
        groupsWrapEl,
        emptyStateEl
    );
}

function createChipCard(title, items, getUrl) {
    const cardEl = document.createElement("article");
    cardEl.className = "allowed-mods-card";

    const titleEl = document.createElement("h3");
    titleEl.textContent = title;

    const listEl = document.createElement("ul");
    listEl.className = "allowed-chip-list";

    items.forEach((item) => {
        const itemEl = document.createElement("li");
        const itemUrl = item.url || (typeof getUrl === "function" ? getUrl(item.label) : null);
        if (itemUrl) {
            const linkEl = createExternalLink(item.label, itemUrl);
            itemEl.appendChild(linkEl);
        } else {
            itemEl.textContent = item.label;
        }
        listEl.appendChild(itemEl);
    });

    cardEl.append(titleEl, listEl);

    return cardEl;
}

function getModrinthSearchUrl(name, section) {
    const base = section === "modpacks" ? "https://modrinth.com/modpacks" : "https://modrinth.com/mods";
    const params = new URLSearchParams({ q: name });
    return `${base}?${params.toString()}`;
}

function getClientOfficialUrl(name) {
    const normalized = name.trim().toLowerCase();
    const match = CLIENT_OFFICIAL_URLS.find((entry) => normalized.includes(entry.match));
    return match ? match.url : null;
}

function createExternalLink(label, href) {
    const linkEl = document.createElement("a");
    linkEl.href = href;
    linkEl.target = "_blank";
    linkEl.rel = "noopener noreferrer";
    linkEl.textContent = label;
    linkEl.setAttribute("aria-label", `${label} (opens in a new tab)`);
    return linkEl;
}

function parseListItem(raw) {
    const parts = raw.split(" | ");
    if (parts.length > 1) {
        const maybeUrl = parts[parts.length - 1].trim();
        if (/^https?:\/\//i.test(maybeUrl)) {
            return {
                label: parts.slice(0, -1).join(" | ").trim(),
                url: maybeUrl
            };
        }
    }

    return { label: raw, url: null };
}
