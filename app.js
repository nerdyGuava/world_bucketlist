/* ========================================================
   1. HARDCODED COUNTRY DATA STRUCTURE
   ======================================================== */
   const countriesData = [
    { 
      code: "JP", 
      name: "Japan", 
      visited: true, 
      date: "Visited", 
      icon: "🚅", 
      memory: "Riding the Shinkansen, the awesome Ryokan in Yufuin, soaking in the hot springs at Beppu, and hanging out with Riko San in Tokyo!", 
      images: [
        "photos/japan/tokyo.jpg",
        "photos/japan/yufuin.jpg",
        "photos/japan/beppu.jpg"
      ], 
      stampImg: "photos/japan/stamps/japan_visa.png" 
    },
    {
        code: "USA",
        name: "United States",
        visited: true,
        icon: "🇺🇸",
        memory: "Our homebase — where we met, fell in love, and started taking on the world together.",
        images: [
          "photos/us/tokyo.jpg",
          "photos/us/tokyo.jpg"
        ]
      },
    { 
      code: "TW", 
      name: "Taiwan", 
      visited: true, 
      date: "Visited", 
      icon: "🧋", 
      memory: "Pi Eve's fun wedding, all the delicious food, seeing Char's Dad be a slide, and ridiculously good tea and boba!", 
      images: [
        "photos/taiwan/wedding.jpg",
        "photos/taiwan/boba.jpg"
      ], 
      stampImg: "photos/taiwan/stamps/taiwan_visa.png" 
    },
    { 
      code: "TH", 
      name: "Thailand", 
      visited: true, 
      date: "Visited", 
      icon: "🌶️", 
      memory: "Visiting family, eating delicious spicy food, and having fancy hotel fun by the beaches!", 
      images: [
        "photos/thailand/family.jpg",
        "photos/thailand/beach.jpg"
      ], 
      stampImg: "photos/thailand/stamps/thailand_visa.png" 
    }
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
  
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
    .attr("id", "goldGradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "100%");
    
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#b8860b");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#d4af37");

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
  /* ==========================================================
   UPDATED EXPANDED BADGES DATA
   ========================================================== */
    /* ==========================================================
   REGION DEFINITIONS FOR BADGE CHECKS
   ========================================================== */
    const REGIONS = {
        asia: ["JP", "TW", "TH", "CN", "KR", "VN", "IN", "ID", "PH", "MY", "SG", "KH", "LA", "MM", "NP", "LK", "PK", "BD", "MN", "BT", "MV", "BN", "TL", "KZ", "UZ", "TM", "KG", "TJ", "AF", "IR", "IQ", "SA", "AE", "QA", "OM", "YE", "KW", "BH", "JO", "IL", "LB", "SY", "TR", "GE", "AM", "AZ", "CY"],
        europe: ["FR", "DE", "IT", "ES", "GB", "NL", "BE", "CH", "AT", "PT", "GR", "IE", "SE", "NO", "DK", "FI", "PL", "CZ", "HU", "RO", "BG", "HR", "SI", "SK", "EE", "LV", "LT", "IS", "MT", "AL", "MK", "BA", "RS", "ME", "XK", "MD", "UA", "BY", "AD", "MC", "SM", "VA", "LI", "LU"],
        africa: ["EG", "MA", "ZA", "KE", "TZ", "NG", "GH", "ET", "UG", "RW", "SN", "CI", "CM", "TN", "DZ", "LY", "SD", "AO", "MZ", "ZW", "NA", "BW", "ZM", "MG", "MU", "SC", "CV", "GM", "GN", "SL", "LR", "BF", "ML", "NE", "TD", "CF", "CG", "CD", "GA", "GQ", "ST", "DJ", "SO", "ER", "SS", "MW", "LS", "SZ", "KM", "BI", "TG", "BJ", "MR"],
        northAmerica: ["US", "CA", "MX", "GT", "BZ", "SV", "HN", "NI", "CR", "PA"],
        southAmerica: ["BR", "AR", "CL", "PE", "CO", "EC", "BO", "PY", "UY", "VE", "GY", "SR"],
        oceania: ["AU", "NZ", "FJ", "PG", "VU", "SB", "WS", "TO"],
        caribbean: ["AG", "BS", "BB", "CU", "DM", "DO", "GD", "HT", "JM", "KN", "LC", "VC", "TT"],
        seAsia: ["TH", "VN", "ID", "MY", "SG", "PH", "KH", "LA", "MM", "BN", "TL"],
        eastAsia: ["JP", "TW", "CN", "KR", "MN"],
        mena: ["EG", "MA", "DZ", "TN", "LY", "SA", "AE", "QA", "OM", "YE", "KW", "BH", "JO", "IL", "LB", "SY", "IQ", "IR"]
    };

   const badgesData = [
    // --- MILESTONES ---
    {
        id: "first_stamp",
        title: "Border Hopper",
        icon: "🛂",
        desc: "Cross your very first international border!",
        check: (visitedCodes) => visitedCodes.length >= 1
    },
    {
        id: "globetrotter_5",
        title: "Stamp Collector",
        icon: "🗺️",
        desc: "Visit 5 different countries.",
        check: (visitedCodes) => visitedCodes.length >= 5
    },
    {
        id: "globetrotter_10",
        title: "World Voyager",
        icon: "✈️",
        desc: "Visit 10 different countries.",
        check: (visitedCodes) => visitedCodes.length >= 10
    },

    // --- CONTINENT & REGION COMPLETION ---
    {
        id: "all_asia",
        title: "Asian Emperor",
        icon: "🐉",
        desc: "Visit all recognized countries in Asia (48/48)!",
        check: (visitedCodes) => {
        const asiaCodes = ["JP", "TW", "TH", "CN", "KR", "VN", "IN", "ID", "PH", "MY", "SG", "KH", "LA", "MM", "NP", "LK", "PK", "BD", "MN", "BT", "MV", "BN", "TL", "KZ", "UZ", "TM", "KG", "TJ", "AF", "IR", "IQ", "SA", "AE", "QA", "OM", "YE", "KW", "BH", "JO", "IL", "LB", "SY", "TR", "GE", "AM", "AZ", "CY"];
        return asiaCodes.every(code => visitedCodes.includes(code));
        }
    },
    {
        id: "all_europe",
        title: "European Sovereign",
        icon: "🏰",
        desc: "Visit all recognized countries in Europe (44/44)!",
        check: (visitedCodes) => {
        const europeCodes = ["FR", "DE", "IT", "ES", "GB", "NL", "BE", "CH", "AT", "PT", "GR", "IE", "SE", "NO", "DK", "FI", "PL", "CZ", "HU", "RO", "BG", "HR", "SI", "SK", "EE", "LV", "LT", "IS", "MT", "AL", "MK", "BA", "RS", "ME", "XK", "MD", "UA", "BY", "AD", "MC", "SM", "VA", "LI", "LU"];
        return europeCodes.every(code => visitedCodes.includes(code));
        }
    },
    {
        id: "all_africa",
        title: "African Monarch",
        icon: "🦁",
        desc: "Visit all recognized countries in Africa (54/54)!",
        check: (visitedCodes) => {
        const africaCodes = ["EG", "MA", "ZA", "KE", "TZ", "NG", "GH", "ET", "UG", "RWA", "SN", "CI", "CM", "TN", "DZ", "LY", "SD", "AO", "MZ", "ZW", "NA", "BW", "ZM", "MG", "MU", "SC", "CV", "GM", "GN", "SL", "LR", "BF", "ML", "NE", "TD", "CF", "CG", "CD", "GA", "GQ", "ST", "DJ", "SO", "ER", "SS", "MW", "LS", "SZ", "KM", "BI", "TG", "BJ", "MR"];
        return africaCodes.every(code => visitedCodes.includes(code));
        }
    },
    {
        id: "all_mena",
        title: "Sultan of MENA",
        icon: "🕌",
        desc: "Visit all countries in the Middle East & North Africa!",
        check: (visitedCodes) => {
        const menaCodes = ["EG", "MA", "DZ", "TN", "LY", "SA", "AE", "QA", "OM", "YE", "KW", "BH", "JO", "IL", "LB", "SY", "IQ", "IR"];
        return menaCodes.every(code => visitedCodes.includes(code));
        }
    },

    // --- CONTINENT HOPPING ---
    {
        id: "taste_of_continents",
        title: "Continent Sampler",
        icon: "🧭",
        desc: "Visit at least 1 country in every inhabited continent (Asia, Europe, Africa, North America, South America, Oceania)!",
        check: (visitedCodes) => {
        const continentGroups = {
            asia: ["JP", "TW", "TH", "CN", "KR", "VN", "IN", "ID", "PH", "MY", "SG", "KH", "LA", "MM", "NP", "LK", "PK", "BD", "MN", "BT", "MV", "BN", "TL", "KZ", "UZ", "TM", "KG", "TJ", "AF", "IR", "IQ", "SA", "AE", "QA", "OM", "YE", "KW", "BH", "JO", "IL", "LB", "SY", "TR", "GE", "AM", "AZ", "CY"],
            europe: ["FR", "DE", "IT", "ES", "GB", "NL", "BE", "CH", "AT", "PT", "GR", "IE", "SE", "NO", "DK", "FI", "PL", "CZ", "HU", "RO", "BG", "HR", "SI", "SK", "EE", "LV", "LT", "IS", "MT", "AL", "MK", "BA", "RS", "ME", "XK", "MD", "UA", "BY", "AD", "MC", "SM", "VA", "LI", "LU"],
            africa: ["EG", "MA", "ZA", "KE", "TZ", "NG", "GH", "ET", "UG", "RW", "SN", "CI", "CM", "TN", "DZ", "LY", "SD", "AO", "MZ", "ZW", "NA", "BW", "ZM", "MG", "MU", "SC", "CV", "GM", "GN", "SL", "LR", "BF", "ML", "NE", "TD", "CF", "CG", "CD", "GA", "GQ", "ST", "DJ", "SO", "ER", "SS", "MW", "LS", "SZ", "KM", "BI", "TG", "BJ", "MR"],
            northAmerica: ["US", "CA", "MX", "GT", "BZ", "SV", "HN", "NI", "CR", "PA", "CU", "JM", "HT", "DO", "BS", "BB", "TT"],
            southAmerica: ["BR", "AR", "CL", "PE", "CO", "EC", "BO", "PY", "UY", "VE", "GY", "SR"],
            oceania: ["AU", "NZ", "FJ", "PG", "VU", "SB", "WS", "TO"]
        };

        return Object.values(continentGroups).every(group => 
            group.some(code => visitedCodes.includes(code))
        );
        }
    },
    {
        id: "all_seven_continents",
        title: "Apex Adventurer",
        icon: "🧊",
        desc: "Step foot on all 7 continents (including Antarctica)!",
        check: (visitedCodes) => visitedCodes.includes("AQ") && 
        // Re-uses sampler check logic requiring all other 6
        ["JP", "FR", "EG", "US", "BR", "AU"].some(c => visitedCodes.includes(c))
    },

    // --- FUN REGIONAL & THEMATIC BADGES ---
    {
        id: "all_se_asia",
        title: "Southeast Asia Sovereign",
        icon: "🍜",
        desc: "Visit all recognized countries in Southeast Asia (11/11)!",
        check: (visitedCodes) => {
          const seAsiaCodes = [
            "TH", // Thailand
            "VN", // Vietnam
            "ID", // Indonesia
            "MY", // Malaysia
            "SG", // Singapore
            "PH", // Philippines
            "KH", // Cambodia
            "LA", // Laos
            "MM", // Myanmar
            "BN", // Brunei
            "TL"  // Timor-Leste
          ];
          return seAsiaCodes.every(code => visitedCodes.includes(code));
        }
      },
      {
        id: "east_asia_trio",
        title: "Far East Express",
        icon: "🗾",
        desc: "Experience China, Japan, and South Korea!",
        check: (visitedCodes) => ["CN", "JP", "KR"].every(code => visitedCodes.includes(code))
      },
    {
        id: "island_hopper",
        title: "Archipelago Explorer",
        icon: "🏝️",
        desc: "Visit 3 island nations (e.g. Japan, Taiwan, Philippines, Maldives)!",
        check: (visitedCodes) => {
        const islands = ["JP", "TW", "PH", "ID", "MV", "LK", "GB", "IE", "IS", "NZ", "FJ", "CU", "JM"];
        return visitedCodes.filter(code => islands.includes(code)).length >= 3;
        }
    },
    {
        id: "all_caribbean",
        title: "Caribbean Conqueror",
        icon: "🏝️",
        desc: "Visit all sovereign nations in the Caribbean (13/13)!",
        check: (visitedCodes) => {
          const caribbeanCodes = [
            "AG", // Antigua and Barbuda
            "BS", // Bahamas
            "BB", // Barbados
            "CU", // Cuba
            "DM", // Dominica
            "DO", // Dominican Republic
            "GD", // Grenada
            "HT", // Haiti
            "JM", // Jamaica
            "KN", // Saint Kitts and Nevis
            "LC", // Saint Lucia
            "VC", // Saint Vincent and the Grenadines
            "TT"  // Trinidad and Tobago
          ];
          return caribbeanCodes.every(code => visitedCodes.includes(code));
        }
      },
    {
        id: "first_asia",
        title: "Asian Trailblazer",
        icon: "🌏",
        desc: "Visit your very first country in Asia!",
        check: (visitedCodes) => REGIONS.asia.some(code => visitedCodes.includes(code))
    },
    {
        id: "first_europe",
        title: "European Pioneer",
        icon: "🌍",
        desc: "Visit your very first country in Europe!",
        check: (visitedCodes) => REGIONS.europe.some(code => visitedCodes.includes(code))
    },
    {
        id: "first_africa",
        title: "African Explorer",
        icon: "🌍",
        desc: "Visit your very first country in Africa!",
        check: (visitedCodes) => REGIONS.africa.some(code => visitedCodes.includes(code))
    },
    {
        id: "first_north_america",
        title: "North American Rover",
        icon: "🌎",
        desc: "Visit your very first country in North America!",
        check: (visitedCodes) => REGIONS.northAmerica.some(code => visitedCodes.includes(code))
    },
    {
        id: "first_south_america",
        title: "South American Scout",
        icon: "🌎",
        desc: "Visit your very first country in South America!",
        check: (visitedCodes) => REGIONS.southAmerica.some(code => visitedCodes.includes(code))
    },
    {
        id: "first_oceania",
        title: "Oceania Voyager",
        icon: "🌏",
        desc: "Visit your very first country in Oceania!",
        check: (visitedCodes) => REGIONS.oceania.some(code => visitedCodes.includes(code))
    },
    {
        id: "first_se_asia",
        title: "SE Asia Pioneer",
        icon: "🍜",
        desc: "Visit your very first country in Southeast Asia!",
        check: (visitedCodes) => REGIONS.seAsia.some(code => visitedCodes.includes(code))
    },
    {
        id: "first_east_asia",
        title: "East Asia Pioneer",
        icon: "⛩️",
        desc: "Visit your very first country in East Asia!",
        check: (visitedCodes) => REGIONS.eastAsia.some(code => visitedCodes.includes(code))
    },
    {
        id: "first_caribbean",
        title: "Caribbean Pioneer",
        icon: "🏝️",
        desc: "Visit your very first country in the Caribbean!",
        check: (visitedCodes) => REGIONS.caribbean.some(code => visitedCodes.includes(code))
    },
    {
        id: "first_mena",
        title: "MENA Pioneer",
        icon: "🕌",
        desc: "Visit your very first country in Middle East & North Africa!",
        check: (visitedCodes) => REGIONS.mena.some(code => visitedCodes.includes(code))
    },
    {
        id: "globetrotter_15",
        title: "Seasoned Explorer",
        icon: "🧭",
        desc: "Visit 15 different countries.",
        check: (visitedCodes) => visitedCodes.length >= 15
    },
    {
        id: "globetrotter_25",
        title: "Quarter-Century Navigator",
        icon: "🗺️",
        desc: "Visit 25 different countries.",
        check: (visitedCodes) => visitedCodes.length >= 25
    },
    {
        id: "globetrotter_50",
        title: "Half-Centurion Voyager",
        icon: "🥇",
        desc: "Visit 50 different countries!",
        check: (visitedCodes) => visitedCodes.length >= 50
    },
    {
        id: "globetrotter_75",
        title: "Global Wanderer",
        icon: "🌐",
        desc: "Visit 75 different countries!",
        check: (visitedCodes) => visitedCodes.length >= 75
    },
    {
        id: "globetrotter_100",
        title: "Century Club Member",
        icon: "💯",
        desc: "Join the elite Century Club by visiting 100 countries!",
        check: (visitedCodes) => visitedCodes.length >= 100
    },
    {
        id: "globetrotter_150",
        title: "Ultimate Odyssey",
        icon: "🌟",
        desc: "Visit 150 different countries!",
        check: (visitedCodes) => visitedCodes.length >= 150
    },
    {
        id: "all_countries_world",
        title: "Master of the Earth",
        icon: "👑",
        desc: "Visit every single recognized country on Earth (195/195)!",
        check: (visitedCodes) => visitedCodes.length >= 195
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