class StarWarsExplorer {
    constructor() {
        this.baseURL = 'https://swapi.py4e.com/api';
        this.currentData = null;
        this.currentPage = 1;
        this.currentCategory = null;
        this.searchTerm = '';
        
        this.dataCache = {
            people: [],
            planets: [],
            films: [],
            species: [],
            vehicles: [],
            starships: []
        };
        
        this.dataSummary = {
            people: { total: 0, loaded: false },
            planets: { total: 0, loaded: false },
            films: { total: 0, loaded: false },
            species: { total: 0, loaded: false },
            vehicles: { total: 0, loaded: false },
            starships: { total: 0, loaded: false }
        };
        
        this.init();
        this.createStars();
        this.preloadCriticalData();
    }

    init() {
        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        document.querySelectorAll('.category-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.loadCategory(category);
            });
        });

        document.getElementById('prevPage').addEventListener('click', () => this.changePage(-1));
        document.getElementById('nextPage').addEventListener('click', () => this.changePage(1));

        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    createStars() {
        const starsContainer = document.getElementById('stars');
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            starsContainer.appendChild(star);
        }
    }

    async preloadCriticalData() {
        try {
            await this.fetchAllDataFromEndpoint('films');
        } catch (error) {
        }
    }

    async fetchAllDataFromEndpoint(endpoint) {
        if (this.dataSummary[endpoint].loaded) {
            return this.dataCache[endpoint];
        }

        try {
            let allData = [];
            let nextUrl = `${this.baseURL}/${endpoint}/`;
            let pageCount = 0;

            while (nextUrl) {
                pageCount++;
                const response = await fetch(nextUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                const itemsWithCategory = data.results.map(item => ({
                    ...item,
                    category: endpoint
                }));
                
                allData = allData.concat(itemsWithCategory);
                nextUrl = data.next;
                await this.delay(100);
            }

            this.dataCache[endpoint] = allData;
            this.dataSummary[endpoint] = {
                total: allData.length,
                loaded: true
            };

            return allData;

        } catch (error) {
            throw error;
        }
    }

    async fetchAllData() {
        const endpoints = ['people', 'planets', 'films', 'species', 'vehicles', 'starships'];
        const startTime = Date.now();

        try {
            const fetchPromises = endpoints.map(async (endpoint) => {
                try {
                    const data = await this.fetchAllDataFromEndpoint(endpoint);
                    return { endpoint, data, success: true };
                } catch (error) {
                    return { endpoint, data: [], success: false, error };
                }
            });

            const results = await Promise.all(fetchPromises);
            const endTime = Date.now();
            const totalTime = (endTime - startTime) / 1000;

            let totalItems = 0;
            const summary = {};

            results.forEach(({ endpoint, data, success, error }) => {
                if (success) {
                    summary[endpoint] = {
                        count: data.length,
                        status: 'success',
                        sampleTitles: data.slice(0, 3).map(item => item.name || item.title)
                    };
                    totalItems += data.length;
                } else {
                    summary[endpoint] = {
                        count: 0,
                        status: 'failed',
                        error: error.message
                    };
                }
            });

            return {
                cache: this.dataCache,
                summary,
                totalItems,
                fetchTime: totalTime
            };

        } catch (error) {
            throw error;
        }
    }

    async handleSearch() {
        const searchTerm = document.getElementById('searchInput').value.trim();
        if (!searchTerm) return;

        this.searchTerm = searchTerm;
        this.showLoading();

        try {
            const endpoints = ['people', 'planets', 'starships', 'vehicles', 'films', 'species'];
            const loadPromises = endpoints.map(async (endpoint) => {
                if (!this.dataSummary[endpoint].loaded) {
                    return this.fetchAllDataFromEndpoint(endpoint);
                }
                return this.dataCache[endpoint];
            });

            await Promise.all(loadPromises);
            const searchResults = this.searchInCache(searchTerm);
            
            this.hideLoading();
            this.displaySearchResults(searchResults, searchTerm);

        } catch (error) {
            this.hideLoading();
            this.showNoResults();
        }
    }

    searchInCache(searchTerm) {
        const results = [];
        const lowerSearchTerm = searchTerm.toLowerCase();

        Object.entries(this.dataCache).forEach(([category, items]) => {
            items.forEach(item => {
                const searchableText = JSON.stringify(item).toLowerCase();
                if (searchableText.includes(lowerSearchTerm)) {
                    results.push({ ...item, category });
                }
            });
        });

        results.sort((a, b) => {
            const aTitle = (a.name || a.title || '').toLowerCase();
            const bTitle = (b.name || b.title || '').toLowerCase();
            
            const aExactMatch = aTitle.includes(lowerSearchTerm);
            const bExactMatch = bTitle.includes(lowerSearchTerm);
            
            if (aExactMatch && !bExactMatch) return -1;
            if (!aExactMatch && bExactMatch) return 1;
            
            return aTitle.localeCompare(bTitle);
        });

        return results;
    }

    displaySearchResults(results, searchTerm) {
        if (results.length === 0) {
            this.showNoResults();
            return;
        }

        this.currentData = { results };
        this.currentCategory = 'search';
        
        document.getElementById('resultsTitle').textContent = 
            `Resultados para "${searchTerm}" (${results.length} encontrados)`;
        
        this.hideElement('resultsHeader', false);
        this.hideElement('noResults', true);
        
        document.getElementById('prevPage').style.display = 'none';
        document.getElementById('nextPage').style.display = 'none';
        document.getElementById('pageInfo').style.display = 'none';

        this.renderResults(results);
    }

    async loadCategory(category) {
        this.currentCategory = category;
        this.currentPage = 1;
        this.searchTerm = '';
        document.getElementById('searchInput').value = '';
        
        this.showLoading();

        try {
            const allData = await this.fetchAllDataFromEndpoint(category);
            const itemsPerPage = 10;
            const totalPages = Math.ceil(allData.length / itemsPerPage);
            const startIndex = (this.currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const pageData = allData.slice(startIndex, endIndex);

            const paginatedData = {
                results: pageData,
                count: allData.length,
                next: this.currentPage < totalPages ? 'next' : null,
                previous: this.currentPage > 1 ? 'previous' : null
            };
            
            this.currentData = { 
                ...paginatedData, 
                allData,
                itemsPerPage 
            };
            
            this.hideLoading();
            this.displayResults(paginatedData, category);

        } catch (error) {
            this.hideLoading();
            this.showNoResults();
        }
    }

    displayResults(data, category) {
        const categoryNames = {
            people: 'Personajes',
            planets: 'Planetas',
            starships: 'Naves Espaciales',
            vehicles: 'Vehículos',
            films: 'Películas',
            species: 'Especies'
        };

        document.getElementById('resultsTitle').textContent = categoryNames[category];
        this.hideElement('resultsHeader', false);
        this.hideElement('noResults', true);
        
        document.getElementById('prevPage').style.display = 'inline-block';
        document.getElementById('nextPage').style.display = 'inline-block';
        document.getElementById('pageInfo').style.display = 'inline-block';
        
        this.updatePaginationControls(data);
        this.renderResults(data.results);
    }

    renderResults(results) {
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = '';

        results.forEach((item, index) => {
            const card = this.createCard(item, index);
            resultsContainer.appendChild(card);
        });
    }

    createCard(item, index) {
        const card = document.createElement('div');
        card.className = 'bg-black/60 rounded-xl p-6 card-hover slide-in glow-blue';
        card.style.animationDelay = `${index * 0.1}s`;

        const title = item.name || item.title;
        const category = item.category || this.currentCategory;
        
        card.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <h3 class="text-xl font-bold text-yellow-400 flex-1">${title}</h3>
                <span class="text-xs bg-blue-600 px-2 py-1 rounded-full">${this.getCategoryDisplayName(category)}</span>
            </div>
            <div class="space-y-2 text-sm text-gray-300">
                ${this.getCardContent(item, category)}
            </div>
            <button class="mt-4 bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors w-full">
                Ver Detalles
            </button>
        `;

        card.addEventListener('click', () => this.openModal(item, category));
        return card;
    }

    getCategoryDisplayName(category) {
        const names = {
            people: 'Personaje',
            planets: 'Planeta',
            starships: 'Nave',
            vehicles: 'Vehículo',
            films: 'Película',
            species: 'Especie'
        };
        return names[category] || category;
    }

    getCardContent(item, category) {
        switch(category) {
            case 'people':
                return `
                    <p>Género: ${item.gender || 'N/A'}</p>
                    <p>Año de nacimiento: ${item.birth_year || 'N/A'}</p>
                    <p>Color de ojos: ${item.eye_color || 'N/A'}</p>
                `;
            case 'planets':
                return `
                    <p>Clima: ${item.climate || 'N/A'}</p>
                    <p>Población: ${this.formatNumber(item.population) || 'N/A'}</p>
                    <p>Terreno: ${item.terrain || 'N/A'}</p>
                `;
            case 'starships':
                return `
                    <p>Modelo: ${item.model || 'N/A'}</p>
                    <p>Pasajeros: ${item.passengers || 'N/A'}</p>
                    <p>Velocidad máxima: ${item.max_atmosphering_speed || 'N/A'}</p>
                `;
            case 'vehicles':
                return `
                    <p>Modelo: ${item.model || 'N/A'}</p>
                    <p>Pasajeros: ${item.passengers || 'N/A'}</p>
                    <p>Costo: ${this.formatNumber(item.cost_in_credits) || 'N/A'} créditos</p>
                `;
            case 'films':
                return `
                    <p>Fecha de lanzamiento: ${item.release_date || 'N/A'}</p>
                    <p>Director: ${item.director || 'N/A'}</p>
                    <p>Episodio: ${item.episode_id || 'N/A'}</p>
                `;
            case 'species':
                return `
                    <p>Altura promedio: ${item.average_height || 'N/A'} cm</p>
                    <p>Esperanza de vida: ${item.average_lifespan || 'N/A'}</p>
                    <p>Idioma: ${item.language || 'N/A'}</p>
                `;
            default:
                return '<p>Información disponible en detalles</p>';
        }
    }

    formatNumber(value) {
        if (!value || value === 'unknown' || value === 'n/a') return null;
        const num = parseInt(value.toString().replace(/,/g, ''));
        if (isNaN(num)) return value;
        return num.toLocaleString();
    }

    openModal(item, category) {
        const modal = document.getElementById('modal');
        const title = item.name || item.title;
        
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalContent').innerHTML = this.getModalContent(item, category);
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    getModalContent(item, category) {
        let content = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
        
        Object.entries(item).forEach(([key, value]) => {
            if (key !== 'created' && key !== 'edited' && key !== 'url' && key !== 'category') {
                const displayKey = this.formatKey(key);
                let displayValue;
                
                if (Array.isArray(value)) {
                    displayValue = `${value.length} elementos`;
                } else if (key === 'opening_crawl') {
                    displayValue = value ? value.substring(0, 200) + '...' : 'N/A';
                } else if (key === 'population' || key === 'cost_in_credits') {
                    displayValue = this.formatNumber(value) || 'N/A';
                } else {
                    displayValue = value || 'N/A';
                }
                
                content += `
                    <div class="bg-gray-800/50 p-3 rounded-lg">
                        <div class="text-yellow-400 font-semibold text-​sm">${displayKey}</div>
                        <div class="text-white text-sm mt-1">${displayValue}</div>
                    </div>
                `;
            }
        });
        
        content += '</div>';
        
        if (category === 'films') {
            content += this.getFilmRelatedData(item);
        }
        
        return content;
    }

    getFilmRelatedData(film) {
        let relatedContent = '<div class="mt-6 pt-6 border-t border-gray-700">';
        relatedContent += '<h4 class="text-lg font-semibold text-yellow-400 mb-4">Datos Relacionados</h4>';
        relatedContent += '<div class="grid grid-cols-1 md:grid-cols-3 gap-4">';
        
        const relations = [
            { key: 'characters', label: 'Personajes' },
            { key: 'planets', label: 'Planetas' },
            { key: 'starships', label: 'Naves' }
        ];
        
        relations.forEach(({ key, label }) => {
            const count = Array.isArray(film[key]) ? film[key].length : 0;
            relatedContent += `
                <div class="bg-gray-800/50 p-3 rounded-lg text-center">
                    <div class="text-yellow-400 font-semibold">${label}</div>
                    <div class="text-white text-lg">${count}</div>
                </div>
            `;
        });
        
        relatedContent += '</div></div>';
        return relatedContent;
    }

    formatKey(key) {
        const keyMap = {
            'name': 'Nombre',
            'title': 'Título',
            'height': 'Altura',
            'mass': 'Masa',
            'hair_color': 'Color de cabello',
            'skin_color': 'Color de piel',
            'eye_color': 'Color de ojos',
            'birth_year': 'Año de nacimiento',
            'gender': 'Género',
            'homeworld': 'Mundo natal',
            'films': 'Películas',
            'species': 'Especies',
            'vehicles': 'Vehículos',
            'starships': 'Naves espaciales',
            'rotation_period': 'Período de rotación',
            'orbital_period': 'Período orbital',
            'diameter': 'Diámetro',
            'climate': 'Clima',
            'gravity': 'Gravedad',
            'terrain': 'Terreno',
            'surface_water': 'Agua superficial',
            'population': 'Población',
            'residents': 'Residentes',
            'model': 'Modelo',
            'manufacturer': 'Fabricante',
            'cost_in_credits': 'Costo en créditos',
            'length': 'Longitud',
            'max_atmosphering_speed': 'Velocidad máxima atmosférica',
            'crew': 'Tripulación',
            'passengers': 'Pasajeros',
            'cargo_capacity': 'Capacidad de carga',
            'consumables': 'Consumibles',
            'hyperdrive_rating': 'Clasificación hiperpropulsor',
            'MGLT': 'MGLT',
            'starship_class': 'Clase de nave',
            'pilots': 'Pilotos',
            'vehicle_class': 'Clase de vehículo',
            'episode_id': 'ID del episodio',
            'opening_crawl': 'Texto de apertura',
            'director': 'Director',
            'producer': 'Productor',
            'release_date': 'Fecha de lanzamiento',
            'characters': 'Personajes',
            'planets': 'Planetas',
            'classification': 'Clasificación',
            'designation': 'Designación',
            'average_height': 'Altura promedio',
            'skin_colors': 'Colores de piel',
            'hair_colors': 'Colores de cabello',
            'eye_colors': 'Colores de ojos',
            'average_lifespan': 'Esperanza de vida promedio',
            'language': 'Idioma',
            'people': 'Personas'
        };
        
        return keyMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    closeModal() {
        document.getElementById('modal').classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    async changePage(direction) {
        if (!this.currentData || this.currentCategory === 'search') return;

        const newPage = this.currentPage + direction;
        const totalItems = this.currentData.allData ? this.currentData.allData.length : 0;
        const itemsPerPage = this.currentData.itemsPerPage || 10;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        if (newPage < 1 || newPage > totalPages) return;

        this.currentPage = newPage;
        this.showLoading();
        
        try {
            const startIndex = (this.currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const pageData = this.currentData.allData.slice(startIndex, endIndex);

            const paginatedData = {
                results: pageData,
                count: totalItems,
                next: this.currentPage < totalPages ? 'next' : null,
                previous: this.currentPage > 1 ? 'previous' : null
            };
            
            this.currentData = { 
                ...paginatedData, 
                allData: this.currentData.allData,
                itemsPerPage 
            };
            
            this.hideLoading();
            this.updatePaginationControls(paginatedData);
            this.renderResults(pageData);
            
            document.getElementById('resultsHeader').scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            this.hideLoading();
        }
    }

    updatePaginationControls(data) {
        document.getElementById('prevPage').disabled = !data.previous;
        document.getElementById('nextPage').disabled = !data.next;
        
        const totalResults = data.count || 0;
        const itemsPerPage = this.currentData.itemsPerPage || 10;
        const totalPages = Math.ceil(totalResults / itemsPerPage);
        
        document.getElementById('pageInfo').textContent = 
            `Página ${this.currentPage} de ${totalPages} (${totalResults} total)`;
    }

    showLoading() {
        this.hideElement('loading', false);
        this.hideElement('results', true);
        this.hideElement('resultsHeader', true);
        this.hideElement('noResults', true);
    }

    hideLoading() {
        this.hideElement('loading', true);
        this.hideElement('results', false);
    }

    showNoResults() {
        this.hideElement('loading', true);
        this.hideElement('results', true);
        this.hideElement('resultsHeader', true);
        this.hideElement('noResults', false);
    }

    hideElement(elementId, hide) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.toggle('hidden', hide);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getDataSummary() {
        const summary = {
            totalItemsLoaded: 0,
            categories: {},
            loadedCategories: [],
            pendingCategories: []
        };

        Object.entries(this.dataSummary).forEach(([category, info]) => {
            summary.categories[category] = info;
            summary.totalItemsLoaded += info.total;
            
            if (info.loaded) {
                summary.loadedCategories.push(category);
            } else {
                summary.pendingCategories.push(category);
            }
        });

        return summary;
    }

    logCurrentState() {
    }

    resetExplorer() {
        this.currentData = null;
        this.currentPage = 1;
        this.currentCategory = null;
        this.searchTerm = '';
        
        document.getElementById('searchInput').value = '';
        
        this.hideElement('resultsHeader', true);
        this.hideElement('results', true);
        this.hideElement('noResults', true);
        this.hideElement('loading', true);
    }

    async getRandomItem() {
        const categories = ['people', 'planets', 'starships', 'vehicles', 'films', 'species'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        if (!this.dataSummary[randomCategory].loaded) {
            await this.fetchAllDataFromEndpoint(randomCategory);
        }
        
        const categoryData = this.dataCache[randomCategory];
        if (categoryData.length === 0) return null;
        
        const randomItem = categoryData[Math.floor(Math.random() * categoryData.length)];
        return { ...randomItem, category: randomCategory };
    }

    exportData(category = null) {
        if (category && this.dataCache[category]) {
            return JSON.stringify({
                category,
                count: this.dataCache[category].length,
                data: this.dataCache[category],
                exportedAt: new Date().toISOString()
            }, null, 2);
        }
        
        return JSON.stringify({
            summary: this.getDataSummary(),
            allData: this.dataCache,
            exportedAt: new Date().toISOString()
        }, null, 2);
    }

    getStatistics() {
        const stats = {
            totalItems: 0,
            categories: {},
            topCategories: [],
            searchableFields: new Set(),
            lastUpdated: new Date().toISOString()
        };

        Object.entries(this.dataCache).forEach(([category, items]) => {
            stats.totalItems += items.length;
            stats.categories[category] = {
                count: items.length,
                loaded: this.dataSummary[category].loaded
            };

            items.forEach(item => {
                Object.keys(item).forEach(key => {
                    if (key !== 'created' && key !== 'edited' && key !== 'url') {
                        stats.searchableFields.add(key);
                    }
                });
            });
        });

        stats.topCategories = Object.entries(stats.categories)
            .sort(([,a], [,b]) => b.count - a.count)
            .map(([category, data]) => ({ category, ...data }));

        stats.searchableFields = Array.from(stats.searchableFields);
        
        return stats;
    }

    validateData() {
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            categories: {}
        };

        Object.entries(this.dataCache).forEach(([category, items]) => {
            const categoryValidation = {
                itemCount: items.length,
                hasRequiredFields: true,
                missingFields: [],
                duplicates: []
            };

            const requiredFields = this.getRequiredFields(category);
            const fieldCounts = {};

            items.forEach((item, index) => {
                requiredFields.forEach(field => {
                    if (!item[field]) {
                        categoryValidation.hasRequiredFields = false;
                        categoryValidation.missingFields.push(`Item ${index}: missing ${field}`);
                    }
                });

                const itemKey = item.name || item.title || `item_${index}`;
                if (fieldCounts[itemKey]) {
                    categoryValidation.duplicates.push(itemKey);
                } else {
                    fieldCounts[itemKey] = 1;
                }
            });

            validation.categories[category] = categoryValidation;

            if (!categoryValidation.hasRequiredFields) {
                validation.isValid = false;
                validation.errors.push(`${category}: Missing required fields`);
            }

            if (categoryValidation.duplicates.length > 0) {
                validation.warnings.push(`${category}: Potential duplicates found`);
            }
        });

        return validation;
    }

    getRequiredFields(category) {
        const requiredFields = {
            people: ['name', 'gender'],
            planets: ['name', 'climate'],
            starships: ['name', 'model'],
            vehicles: ['name', 'model'],
            films: ['title', 'director'],
            species: ['name', 'classification']
        };

        return requiredFields[category] || ['name'];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.starWarsExplorer = new StarWarsExplorer();
    
    window.explorerDebug = {
        getState: () => window.starWarsExplorer.logCurrentState(),
        getSummary: () => window.starWarsExplorer.getDataSummary(),
        getStats: () => window.starWarsExplorer.getStatistics(),
        validate: () => window.starWarsExplorer.validateData(),
        reset: () => window.starWarsExplorer.resetExplorer(),
        randomItem: () => window.starWarsExplorer.getRandomItem(),
        export: (category) => window.starWarsExplorer.exportData(category),
        fetchAll: () => window.starWarsExplorer.fetchAllData()
    };
});