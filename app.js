/* ========================================================
   1. HARDCODED COUNTRY DATA STRUCTURE
   ======================================================== */
   const countriesData = [
    { 
      code: "JP", 
      name: "Japan", 
      visited: true, 
      date: "Spring 2025", 
      icon: "⛩️", 
      memory: "Cherry blossoms in Tokyo, incredible ramen in Kyoto, and exploring bamboo groves!", 
      images: [
        "photos/japan/tokyo.jpg",
        "photos/japan/kyoto.jpg"
      ], 
      stampImg: "photos/japan/stamps/japan_visa.png" 
    },
    { 
      code: "FR", 
      name: "France", 
      visited: true, 
      date: "Autumn 2024", 
      icon: "🥐", 
      memory: "Eiffel tower sparkles at night, endless fresh baguettes, and art at the Louvre.", 
      images: [
        "photos/france/paris.jpg"
      ], 
      stampImg: "photos/france/stamps/france_visa.png" 
    },
    { 
      code: "MX", 
      name: "Mexico", 
      visited: true, 
      date: "Winter 2023", 
      icon: "🌮", 
      memory: "Street tacos in Mexico City and ancient pyramids at Teotihuacan!", 
      images: [
        "photos/mexico/cdmx.jpg"
      ], 
      stampImg: "photos/mexico/stamps/mexico_visa.png" 
    },
    { code: "CA", name: "Canada", visited: false },
    { code: "GB", name: "United Kingdom", visited: false },
    { code: "IT", name: "Italy", visited: false },
    { code: "DE", name: "Germany", visited: false },
    { code: "ES", name: "Spain", visited: false },
    { code: "AU", name: "Australia", visited: false },
    { code: "BR", name: "Brazil", visited: false },
    { code: "EG", name: "Egypt", visited: false },
    { code: "IS", name: "Iceland", visited: false }
    // Add more countries as your travels expand!
  ];
  
  /* Map lookup object for quick country access by name */
  const countryMap = {};
  countriesData.forEach(c => countryMap[c.name] = c);
  
  /* ==========================================================
     2. INITIALIZE PROGRESS BAR & STAMPS
     ========================================================== */
  function initDashboard() {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    const visitedCount = countriesData.filter(c => c.visited).length;
    // Total recognized UN countries approx 195
    const totalCountries = 195; 
    const percentage = Math.round((visitedCount / totalCountries) * 100);
  
    if (progressBar) progressBar.style.width = Math.max(percentage, 2) + '%';
    if (progressText) progressText.textContent = `${visitedCount} / ${totalCountries} Countries Visited (${percentage}%)`;
  
    renderBadges();
    renderStampsGallery();
  }
  
  /* ==========================================================
     3. RENDER D3 WORLD MAP
     ========================================================== */
  function initMap() {
    const width = 960;
    const height = 500;
  
    const svg = d3.select("#mapSvg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "100%");
  
    // Add Whimsical Gradient Definition for Visited Countries
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
    .attr("id", "visitedGradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "100%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#ff70a6");  /* Bubblegum Pink */
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#ffd670"); /* Sunny Yellow */
  
    const g = svg.append("g");
  
    // D3 Natural Earth Projection for Global View
    const projection = d3.geoNaturalEarth1()
      .scale(160)
      .translate([width / 2, height / 2]);
  
    const path = d3.geoPath().projection(projection);
  
    // Zoom & Pan handler
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => g.attr("transform", event.transform));
  
    svg.call(zoom);
  
    // Load World Atlas TopoJSON
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(world => {
        const countriesGeo = topojson.feature(world, world.objects.countries).features;
  
        g.selectAll("path")
          .data(countriesGeo)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("class", d => {
            const countryData = countryMap[d.properties.name];
            return `country ${countryData && countryData.visited ? 'visited' : ''}`;
          })
          .on("click", (event, d) => {
            const countryData = countryMap[d.properties.name];
            if (countryData && countryData.visited) {
              openModal(countryData);
            }
          });
      })
      .catch(err => console.error("Error loading world topology:", err));
  
    // Controls
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetZoomBtn = document.getElementById('resetZoomBtn');
  
    if (zoomInBtn) zoomInBtn.onclick = () => svg.transition().duration(300).call(zoom.scaleBy, 1.3);
    if (zoomOutBtn) zoomOutBtn.onclick = () => svg.transition().duration(300).call(zoom.scaleBy, 0.7);
    if (resetZoomBtn) resetZoomBtn.onclick = () => svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity);
  }
  
  /* ==========================================================
     4. PHOTO PREVIEWS & MODALS
     ========================================================== */
  function renderPhotoPreviews(images) {
    if (!images || images.length === 0) return '';
  
    const maxPreviews = 3;
    const previewList = images.slice(0, maxPreviews);
    const extraCount = images.length - maxPreviews;
  
    let photosHtml = '<div class="photo-preview-row">';
  
    previewList.forEach((src, index) => {
      const isLast = index === maxPreviews - 1 && extraCount > 0;
      photosHtml += `
        <div class="photo-thumb-wrapper" onclick="openGallery(${index})">
          <img src="${src}" class="photo-thumb" alt="Country photo" />
          ${isLast ? `<span class="more-overlay">+${extraCount} More</span>` : ''}
        </div>
      `;
    });
  
    photosHtml += '</div>';
    return photosHtml;
  }
  
  const modalOverlay = document.getElementById('modalOverlay');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');
  
  if (modalClose) {
    modalClose.addEventListener('click', () => modalOverlay.style.display = 'none');
  }
  
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.style.display = 'none';
    });
  }
  
  function openModal(country) {
    currentGalleryImages = country.images || [];
    const photoHTML = renderPhotoPreviews(country.images);
  
    modalContent.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 8px;">${country.icon || '✈️'}</div>
        <h3 style="font-family: 'Cinzel', serif; letter-spacing: 1px; color: var(--accent-gold);">${country.name} Visa</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">Visited: <strong>${country.date}</strong></p>
        
        ${photoHTML}
  
        <div style="background: var(--bg-secondary); border: 1px dashed var(--border-gold); padding: 14px; border-radius: 8px; font-style: italic; margin-bottom: 12px; color: var(--text-main);">
          "${country.memory}"
        </div>
      </div>
    `;
    modalOverlay.style.display = 'flex';
  }
  
  /* ==========================================================
     5. GLOBAL BADGES DEFINITIONS
     ========================================================== */
  const badgesData = [
    {
      id: "first_stamp",
      title: "First Passport Stamp",
      icon: "🛂",
      desc: "Cross your first international border!",
      check: (visitedCodes) => visitedCodes.length >= 1
    },
    {
      id: "globe_trotter",
      title: "Globe Trotter",
      icon: "🌍",
      desc: "Visit 5 different countries!",
      check: (visitedCodes) => visitedCodes.length >= 5
    },
    {
      id: "euro_tripper",
      title: "European Voyager",
      icon: "🏰",
      desc: "Visit France, Germany, and Italy!",
      check: (visitedCodes) => ["FR", "DE", "IT"].every(code => visitedCodes.includes(code))
    },
    {
      id: "north_america",
      title: "Americas Neighbor",
      icon: "🌮",
      desc: "Visit Canada and Mexico!",
      check: (visitedCodes) => ["CA", "MX"].every(code => visitedCodes.includes(code))
    }
  ];
  
  function renderBadges() {
    const badgeGrid = document.getElementById('badgeGrid');
    if (!badgeGrid) return;
  
    badgeGrid.innerHTML = '';
    const visitedCodes = countriesData.filter(c => c.visited).map(c => c.code);
  
    badgesData.forEach(badge => {
      const isUnlocked = badge.check(visitedCodes);
  
      const badgeCard = document.createElement('div');
      badgeCard.className = `badge-card ${isUnlocked ? 'unlocked' : ''}`;
      
      badgeCard.innerHTML = `
        <span class="badge-icon">${badge.icon}</span>
        <div class="badge-title">${badge.title}</div>
        <div class="badge-desc">${badge.desc}</div>
        <span class="badge-status">${isUnlocked ? 'Unlocked ✨' : '🔒 Locked'}</span>
      `;
  
      badgeGrid.appendChild(badgeCard);
    });
  }
  
  /* ==========================================================
     6. LIGHTBOX & STAMPS CAROUSEL
     ========================================================== */
  let currentGalleryImages = [];
  let currentImageIndex = 0;
  
  function openGallery(index = 0) {
    if (!currentGalleryImages.length) return;
    currentImageIndex = index;
    updateGalleryImage();
    document.getElementById('galleryOverlay').style.display = 'flex';
  }
  
  function updateGalleryImage() {
    const imgElem = document.getElementById('galleryImage');
    const counterElem = document.getElementById('galleryCounter');
    
    if (imgElem) imgElem.src = currentGalleryImages[currentImageIndex];
    if (counterElem) counterElem.textContent = `${currentImageIndex + 1} / ${currentGalleryImages.length}`;
  }
  
  const galleryClose = document.getElementById('galleryClose');
  const prevImgBtn = document.getElementById('prevImgBtn');
  const nextImgBtn = document.getElementById('nextImgBtn');
  
  if (galleryClose) galleryClose.onclick = () => document.getElementById('galleryOverlay').style.display = 'none';
  
  if (prevImgBtn) {
    prevImgBtn.onclick = () => {
      currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
      updateGalleryImage();
    };
  }
  
  if (nextImgBtn) {
    nextImgBtn.onclick = () => {
      currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
      updateGalleryImage();
    };
  }
  
  function renderStampsGallery() {
    const stampsGrid = document.getElementById('stampsGalleryGrid');
    if (!stampsGrid) return;
  
    stampsGrid.innerHTML = '';
  
    const unlockedStamps = countriesData
      .filter(country => country.visited && country.stampImg)
      .map(country => country.stampImg);
  
    countriesData.forEach(country => {
      if (country.stampImg) {
        const stampDiv = document.createElement('div');
        stampDiv.className = `stamp-item ${country.visited ? 'unlocked' : 'locked'}`;
        stampDiv.title = `${country.name} Visa Stamp`;
  
        stampDiv.innerHTML = `<img src="${country.stampImg}" alt="${country.name} Stamp" />`;
  
        stampDiv.addEventListener('click', () => {
          if (country.visited) {
            const clickedIndex = unlockedStamps.indexOf(country.stampImg);
            openStampGallery(unlockedStamps, clickedIndex >= 0 ? clickedIndex : 0);
          }
        });
  
        stampsGrid.appendChild(stampDiv);
      }
    });
  }
  
  function openStampGallery(allStamps, startIndex = 0) {
    if (!allStamps.length) return;
    currentGalleryImages = allStamps;
    currentImageIndex = startIndex;
    updateGalleryImage();
    document.getElementById('galleryOverlay').style.display = 'flex';
  }
  
  /* ==========================================================
     7. BACKGROUND PRE-DECODING
     ========================================================== */
  function predecodeAllPhotos() {
    countriesData.forEach(country => {
      if (country.visited && country.images && country.images.length) {
        country.images.forEach(src => {
          const img = new Image();
          img.src = src;
          if (img.decode) {
            img.decode().catch(() => {});
          }
        });
      }
  
      if (country.stampImg && country.visited) {
        const stampImg = new Image();
        stampImg.src = country.stampImg;
        if (stampImg.decode) {
          stampImg.decode().catch(() => {});
        }
      }
    });
  }
  
  /* ==========================================================
     8. APP INITIALIZATION
     ========================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initMap();
    predecodeAllPhotos();
  });