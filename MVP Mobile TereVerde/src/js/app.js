 document.addEventListener('DOMContentLoaded', () => {

  // Verifica se os dados foram carregados
    if (typeof mockData === 'undefined') {
        console.error("ERRO: O arquivo data/db.js não foi carregado ou mockData não existe.");
        alert("Erro ao carregar dados. Verifique o console.");
        return;
    }
  
  // --- Variáveis de Estado ---
  let isAdminLoggedIn = false;
  let leafletMap = null;

  // --- Seletores do DOM ---
  const mainContent = document.getElementById('main-content');
  const allPages = document.querySelectorAll('.page');
  const navButtons = document.querySelectorAll('.nav-button');
  const adminLoginBtn = document.getElementById('admin-login-btn');
  const adminLogoutBtn = document.getElementById('admin-logout-btn');

  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form');
  const btnCancelLogin = document.getElementById('btn-cancel-login');
  const loginError = document.getElementById('login-error');

  const modalNovidade = document.getElementById('modal-add-novidade');
  const formNovidade = document.getElementById('form-add-novidade');
  const btnShowModalNovidades = document.getElementById('btn-show-modal-novidades');
  const btnCancelNovidade = document.getElementById('btn-cancel-novidade');

  const modalHorarios = document.getElementById('modal-set-horarios');
  const btnShowModalHorarios = document.getElementById('btn-show-modal-horarios');
  const btnCancelHorarios = document.getElementById('btn-cancel-horarios');

  // --- Funções de Renderização ---
  function renderNovidades() {
    const lista = document.getElementById('novidades-lista');
    if (!lista) return;
    lista.innerHTML = '';

    const alertColors = {
      info: 'bg-blue-100 border-blue-500 text-blue-700',
      aviso: 'bg-yellow-100 border-yellow-500 text-yellow-700',
      perigo: 'bg-red-100 border-red-500 text-red-700',
    };

    const iconColors = {
      info: 'fa-info-circle text-blue-500',
      aviso: 'fa-exclamation-triangle text-yellow-500',
      perigo: 'fa-exclamation-circle text-red-500',
    };

    if (mockData.novidades.length === 0) {
      lista.innerHTML = '<p class="text-gray-500 text-sm">Nenhuma novidade no momento.</p>';
      return;
    }

    mockData.novidades.forEach((item) => {
      const card = document.createElement('div');
      card.className = `border-l-4 p-4 rounded-md shadow-sm ${alertColors[item.tipo] || alertColors.info}`;
      card.innerHTML = `
        <div class="flex items-start">
          <i class="fas ${iconColors[item.tipo] || iconColors.info} text-xl mr-3 mt-1"></i>
          <div>
            <h4 class="font-bold">${item.titulo}</h4>
            <p class="text-sm">${item.descricao}</p>
          </div>
        </div>
      `;
      lista.appendChild(card);
    });
  }

  function renderAtracoes() {
    const lista = document.getElementById('atracoes-lista');
    if (!lista) return;
    lista.innerHTML = '';

    mockData.atracoes.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1';
      card.innerHTML = `
        <img src="${item.imagem}" alt="${item.titulo}" class="w-full h-40 object-cover">
        <div class="p-4">
          <h3 class="text-lg font-bold text-gray-800">${item.titulo}</h3>
          <p class="text-sm text-gray-600 mb-3">${item.descricao}</p>
          <div class="flex justify-between items-center text-sm">
            <span class="font-semibold text-green-700">${item.tipo}</span>
            <div class="space-x-3">
              <span class="text-gray-600"><i class="fas fa-tachometer-alt mr-1"></i> ${item.dificuldade}</span>
              ${item.tempo ? `<span class="text-gray-600"><i class="fas fa-clock mr-1"></i> ${item.tempo}</span>` : ''}
            </div>
          </div>
        </div>
      `;
      lista.appendChild(card);
    });
  }

  function renderEventos() {
    const lista = document.getElementById('eventos-lista');
    if (!lista) return;
    lista.innerHTML = '';

    if (mockData.eventos.length === 0) {
      lista.innerHTML = '<p class="text-gray-500 text-sm">Nenhum evento programado.</p>';
      return;
    }

    mockData.eventos.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-lg shadow-md p-4';
      card.innerHTML = `
        <h3 class="text-lg font-bold text-gray-800">${item.titulo}</h3>
        <p class="text-sm font-semibold text-green-600 mb-1"><i class="fas fa-calendar-alt mr-2"></i>${item.data}</p>
        <p class="text-sm text-gray-500 mb-2"><i class="fas fa-map-marker-alt mr-2"></i>${item.local}</p>
        <p class="text-sm text-gray-600">${item.descricao}</p>
      `;
      lista.appendChild(card);
    });
  }

  // --- Funções do Mapa ---
  function initMap() {
    if (leafletMap) return;

    try {
      leafletMap = L.map('map').setView([-22.425, -42.985], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(leafletMap);

      mockData.atracoes.forEach(item => {
        if (item.coords) {
          const iconHTML = item.tipo === 'Trilha' ? '<i class="fas fa-hiking text-white"></i>' : '<i class="fas fa-water text-white"></i>';

          const customIcon = L.divIcon({
            html: `<div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${item.tipo === 'Trilha' ? 'bg-green-600' : 'bg-blue-600'}">${iconHTML}</div>`,
            className: 'bg-transparent border-none',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          L.marker(item.coords, { icon: customIcon })
            .addTo(leafletMap)
            .bindPopup(`<b>${item.titulo}</b><br>${item.dificuldade}`);
        }
      });

    } catch (e) {
      console.error("Erro ao inicializar o mapa:", e);
      document.getElementById('map').innerHTML = "<p class='text-red-500'>Erro ao carregar o mapa. Verifique sua conexão.</p>";
    }
  }

  // --- Funções de Navegação ---
  function navigateTo(pageId) {
    allPages.forEach(page => {
      page.classList.add('hidden');
      page.classList.remove('active');
    });

    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
      targetPage.classList.remove('hidden');
      targetPage.classList.add('active');
      mainContent.scrollTop = 0;
    }

    navButtons.forEach(button => {
      if (button.dataset.page === pageId) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });

    if (pageId === 'mapa') {
      setTimeout(() => {
        if (!leafletMap) {
          initMap();
        } else {
          leafletMap.invalidateSize();
        }
      }, 100);
    }
  }

  // --- Funções de Modal ---
  function showModal(modalElement) {
    modalElement.classList.remove('invisible', 'opacity-0');
  }

  function hideModal(modalElement) {
    modalElement.classList.add('invisible', 'opacity-0');
    if (loginError) loginError.classList.add('hidden');
  }

  // --- Funções de Admin ---
  function handleAdminLogin(event) {
    event.preventDefault();
    const username = loginForm.username.value;
    const password = loginForm.password.value;

    if (username === 'admin' && password === '1234') {
      isAdminLoggedIn = true;
      hideModal(loginModal);
      adminLoginBtn.classList.add('hidden');
      adminLogoutBtn.classList.remove('hidden');
      navigateTo('admin');
    } else {
      loginError.classList.remove('hidden');
    }
  }

  function handleAdminLogout() {
    isAdminLoggedIn = false;
    adminLoginBtn.classList.remove('hidden');
    adminLogoutBtn.classList.add('hidden');
    navigateTo('inicio');
  }

  function handleAddNovidade(event) {
    event.preventDefault();
    const titulo = formNovidade['novidade-titulo'].value;
    const descricao = formNovidade['novidade-descricao'].value;
    const tipo = formNovidade['novidade-tipo'].value;

    const novaNovidade = {
      id: Date.now(),
      titulo: titulo,
      descricao: descricao,
      tipo: tipo
    };

    mockData.novidades.unshift(novaNovidade);

    formNovidade.reset();
    hideModal(modalNovidade);

    renderNovidades();
  }

  // --- Event Listeners ---
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const pageId = button.dataset.page;
      if (isAdminLoggedIn && pageId === 'inicio') {
        navigateTo('admin');
      } else {
        navigateTo(pageId);
      }
    });
  });

  adminLoginBtn.addEventListener('click', () => showModal(loginModal));
  btnCancelLogin.addEventListener('click', () => hideModal(loginModal));
  loginModal.addEventListener('click', (e) => {
    if(e.target === loginModal) hideModal(loginModal);
  });
  loginForm.addEventListener('submit', handleAdminLogin);

  adminLogoutBtn.addEventListener('click', handleAdminLogout);

  btnShowModalNovidades.addEventListener('click', () => showModal(modalNovidade));
  btnCancelNovidade.addEventListener('click', () => hideModal(modalNovidade));
  modalNovidade.addEventListener('click', (e) => {
    if(e.target === modalNovidade) hideModal(modalNovidade);
  });
  formNovidade.addEventListener('submit', handleAddNovidade);

  btnShowModalHorarios.addEventListener('click', () => showModal(modalHorarios));
  btnCancelHorarios.addEventListener('click', () => hideModal(modalHorarios));
  modalHorarios.addEventListener('click', (e) => {
    if(e.target === modalHorarios) hideModal(modalHorarios);
  });

  // --- Inicialização da Aplicação ---
  function initApp() {
    renderNovidades();
    renderAtracoes();
    renderEventos();
    navigateTo('inicio');
  }

  initApp();
});