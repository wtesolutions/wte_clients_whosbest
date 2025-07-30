/**
 * WhosBest.org - Main JavaScript
 * A comprehensive script handling all site-wide functionality
 * Created: July 2025
 */

// Immediately Invoked Function Expression to avoid global scope pollution
(function() {
  'use strict';

  // ======================================
  // GLOBAL VARIABLES & CONFIGURATION
  // ======================================
  const WhosBest = {
    config: {
      animationDelay: 100,
      scrollOffset: 80,
      debounceDelay: 300,
      throttleDelay: 150,
      breakpoints: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280
      }
    },
    cache: {
      windowWidth: window.innerWidth,
      scrollTop: window.pageYOffset || document.documentElement.scrollTop,
      isNavOpen: false,
      isScrolling: false,
      recentlyViewed: JSON.parse(localStorage.getItem('whosbest_recentlyViewed')) || [],
      favorites: JSON.parse(localStorage.getItem('whosbest_favorites')) || []
    },
    dom: {},
    init: function() {
      this.cacheDOM();
      this.bindEvents();
      this.initializeComponents();
      this.handleResponsiveElements();
      this.initAnimations();
    },
    cacheDOM: function() {
      // Navigation elements
      this.dom.navbar = document.getElementById('navbar');
      this.dom.navbarMenu = document.getElementById('navbar-menu');
      this.dom.navbarToggle = document.getElementById('navbar-toggle');
      this.dom.navLinks = document.querySelectorAll('.navbar-link');
      
      // Common interactive elements
      this.dom.staggerItems = document.querySelectorAll('.stagger-item');
      this.dom.forms = document.querySelectorAll('form');
      this.dom.searchInputs = document.querySelectorAll('input[type="search"], input[id*="search"]');
      this.dom.filterSelects = document.querySelectorAll('select[id*="filter"], select[id*="sort"]');
      
      // Share and export elements
      this.dom.shareButtons = document.querySelectorAll('[id*="share-btn"]');
      this.dom.exportButtons = document.querySelectorAll('[id*="export-btn"]');
      this.dom.shareOptions = document.querySelectorAll('[id*="share-options"]');
      this.dom.exportOptions = document.querySelectorAll('[id*="export-options"]');
      
      // Lists and cards
      this.dom.hospitalCards = document.querySelectorAll('.hospital-card');
      this.dom.categoryCards = document.querySelectorAll('.category-card');
      this.dom.listCards = document.querySelectorAll('.list-card');
    },
    bindEvents: function() {
      // Window events
      window.addEventListener('scroll', this.utils.throttle(this.handleScroll.bind(this), this.config.throttleDelay));
      window.addEventListener('resize', this.utils.debounce(this.handleResize.bind(this), this.config.debounceDelay));
      window.addEventListener('load', this.handlePageLoad.bind(this));
      
      // Navigation events
      if (this.dom.navbarToggle) {
        this.dom.navbarToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
      }
      
      // Bind anchor links for smooth scrolling
      document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', this.smoothScroll.bind(this));
      });
      
      // Bind search inputs
      this.dom.searchInputs.forEach(input => {
        input.addEventListener('keyup', this.utils.debounce(this.handleSearch.bind(this), 300));
      });
      
      // Bind filter selects
      this.dom.filterSelects.forEach(select => {
        select.addEventListener('change', this.handleFilter.bind(this));
      });
      
      // Bind share and export buttons
      this.dom.shareButtons.forEach(button => {
        button.addEventListener('click', this.toggleShareOptions.bind(this));
      });
      
      this.dom.exportButtons.forEach(button => {
        button.addEventListener('click', this.toggleExportOptions.bind(this));
      });
      
      // Bind form submissions
      this.dom.forms.forEach(form => {
        form.addEventListener('submit', this.handleFormSubmit.bind(this));
      });
      
      // Close dropdowns when clicking outside
      document.addEventListener('click', this.closeDropdowns.bind(this));
      
      // Bind specific share actions
      document.querySelectorAll('[id^="share-"]').forEach(element => {
        if (element.id !== 'share-btn' && element.id !== 'share-options') {
          element.addEventListener('click', this.handleShare.bind(this));
        }
      });
      
      // Bind specific export actions
      document.querySelectorAll('[id^="export-"]').forEach(element => {
        if (element.id !== 'export-btn' && element.id !== 'export-options') {
          element.addEventListener('click', this.handleExport.bind(this));
        }
      });
    },
    initializeComponents: function() {
      // Initialize any third-party components or plugins
      this.initTooltips();
      this.initLazyLoading();
      
      // Set active navigation based on current page
      this.setActiveNavigation();
      
      // Initialize local storage utilities
      this.initLocalStorage();
      
      // Check if specific page initializations are needed
      if (document.getElementById('hospital-list')) {
        this.initializeHospitalList();
      }
      
      if (document.getElementById('healthcare-lists')) {
        this.initializeCategoryLists();
      }
    },

    // ======================================
    // NAVIGATION & SCROLLING
    // ======================================
    handleScroll: function() {
      this.cache.scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      this.cache.isScrolling = true;
      
      // Add scrolled class to navbar when scrolled down
      if (this.dom.navbar) {
        if (this.cache.scrollTop > 50) {
          this.dom.navbar.classList.add('navbar-scrolled');
        } else {
          this.dom.navbar.classList.remove('navbar-scrolled');
        }
      }
      
      // Handle scroll-triggered animations
      this.handleScrollAnimations();
      
      this.cache.isScrolling = false;
    },
    
    toggleMobileMenu: function(e) {
      if (e) e.preventDefault();
      
      this.cache.isNavOpen = !this.cache.isNavOpen;
      this.dom.navbarMenu.classList.toggle('open', this.cache.isNavOpen);
      
      // Change icon if using Font Awesome
      if (this.dom.navbarToggle.querySelector('i')) {
        const icon = this.dom.navbarToggle.querySelector('i');
        if (this.cache.isNavOpen) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-times');
        } else {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    },
    
    smoothScroll: function(e) {
      e.preventDefault();
      const targetId = e.currentTarget.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Close mobile menu if open
        if (this.cache.isNavOpen) {
          this.toggleMobileMenu();
        }
        
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = targetPosition - this.config.scrollOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    },
    
    setActiveNavigation: function() {
      // Get current page path
      const currentPath = window.location.pathname;
      
      this.dom.navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // Check if the link href matches the current path
        if (currentPath === linkPath || 
            (currentPath.includes(linkPath) && linkPath !== '/' && linkPath !== '/index.html')) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
        
        // Special case for home page
        if ((currentPath === '/' || currentPath === '/index.html') && 
            (linkPath === '/' || linkPath === '/index.html')) {
          link.classList.add('active');
        }
      });
    },

    // ======================================
    // SEARCH & FILTERING
    // ======================================
    handleSearch: function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const searchContext = this.getSearchContext(e.target);
      
      if (!searchContext) return;
      
      const items = document.querySelectorAll(searchContext.itemSelector);
      let visibleCount = 0;
      
      items.forEach(item => {
        const itemText = item.textContent.toLowerCase();
        const shouldShow = searchTerm === '' || itemText.includes(searchTerm);
        
        item.style.display = shouldShow ? '' : 'none';
        if (shouldShow) visibleCount++;
      });
      
      // Show/hide no results message
      const noResultsElement = document.getElementById(searchContext.noResultsId);
      if (noResultsElement) {
        noResultsElement.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    },
    
    getSearchContext: function(searchElement) {
      // Determine what we're searching based on the search input's ID or closest container
      const id = searchElement.id;
      
      if (id === 'search-hospitals' || searchElement.closest('#hospital-list')) {
        return {
          itemSelector: '.hospital-card',
          noResultsId: 'no-results'
        };
      } else if (id === 'search-lists' || searchElement.closest('#healthcare-lists')) {
        return {
          itemSelector: '.category-card',
          noResultsId: 'no-results'
        };
      } else {
        // Generic search for list items
        const closestList = searchElement.closest('[id$="-list"]');
        if (closestList) {
          return {
            itemSelector: `#${closestList.id} .card, #${closestList.id} .list-card, #${closestList.id} .category-card`,
            noResultsId: 'no-results'
          };
        }
      }
      
      return null;
    },
    
    handleFilter: function(e) {
      const filterId = e.target.id;
      
      // Determine which filter function to call based on the filter ID
      if (filterId.includes('hospital')) {
        this.filterHospitals();
      } else if (filterId.includes('healthcare')) {
        this.filterCategoryLists();
      } else {
        // Generic filtering based on data attributes
        this.filterGenericItems(e.target);
      }
    },
    
    filterHospitals: function() {
      const regionFilter = document.getElementById('filter-region')?.value || 'all';
      const specialtyFilter = document.getElementById('filter-specialty')?.value || 'all';
      const sortBy = document.getElementById('sort-by')?.value || 'rank';
      const searchTerm = document.getElementById('search-hospitals')?.value.toLowerCase() || '';
      
      // Get all hospitals and convert to array for sorting
      let hospitals = Array.from(this.dom.hospitalCards);
      
      // Filter hospitals
      hospitals = hospitals.filter(hospital => {
        const hospitalRegion = hospital.dataset.region;
        const hospitalSpecialties = hospital.dataset.specialties?.split(',') || [];
        const hospitalText = hospital.textContent.toLowerCase();
        
        const matchesRegion = regionFilter === 'all' || hospitalRegion === regionFilter;
        const matchesSpecialty = specialtyFilter === 'all' || hospitalSpecialties.includes(specialtyFilter);
        const matchesSearch = searchTerm === '' || hospitalText.includes(searchTerm);
        
        return matchesRegion && matchesSpecialty && matchesSearch;
      });
      
      // Sort hospitals
      hospitals.sort((a, b) => {
        switch(sortBy) {
          case 'name':
            return a.dataset.name.localeCompare(b.dataset.name);
          case 'patient-score':
            return parseFloat(b.dataset.patientScore) - parseFloat(a.dataset.patientScore);
          case 'quality-score':
            return parseFloat(b.dataset.qualityScore) - parseFloat(a.dataset.qualityScore);
          case 'innovation-score':
            return parseFloat(b.dataset.innovationScore) - parseFloat(a.dataset.innovationScore);
          default: // rank
            return parseInt(a.dataset.rank) - parseInt(b.dataset.rank);
        }
      });
      
      // Hide all hospitals first
      this.dom.hospitalCards.forEach(hospital => {
        hospital.style.display = 'none';
      });
      
      // Show filtered and sorted hospitals
      hospitals.forEach((hospital, index) => {
        hospital.style.display = '';
        // Update rank display if sorting by something other than rank
        if (sortBy !== 'rank') {
          const rankElement = hospital.querySelector('.hospital-rank');
          if (rankElement) rankElement.textContent = index + 1;
        } else {
          const rankElement = hospital.querySelector('.hospital-rank');
          if (rankElement) rankElement.textContent = hospital.dataset.rank;
        }
      });
      
      // Show message if no results
      const noResultsElement = document.getElementById('no-results');
      if (hospitals.length === 0) {
        if (!noResultsElement) {
          const hospitalList = document.getElementById('hospital-list');
          if (hospitalList) {
            const noResults = document.createElement('div');
            noResults.id = 'no-results';
            noResults.className = 'text-center py-8';
            noResults.innerHTML = `
              <i class="fas fa-search fa-3x text-gray-400 mb-4"></i>
              <h3 class="text-xl font-semibold mb-2">No matching hospitals found</h3>
              <p class="text-gray-600">Try adjusting your filters or search terms</p>
            `;
            hospitalList.appendChild(noResults);
          }
        } else {
          noResultsElement.style.display = 'block';
        }
      } else if (noResultsElement) {
        noResultsElement.style.display = 'none';
      }
    },
    
    filterCategoryLists: function() {
      const typeFilter = document.getElementById('filter-type')?.value || 'all';
      const regionFilter = document.getElementById('filter-region')?.value || 'all';
      const searchTerm = document.getElementById('search-lists')?.value.toLowerCase() || '';
      
      let visibleCount = 0;
      
      document.querySelectorAll('#healthcare-lists .category-card').forEach(item => {
        const itemType = item.dataset.type;
        const itemRegion = item.dataset.region;
        const itemText = item.textContent.toLowerCase();
        
        const matchesType = typeFilter === 'all' || itemType === typeFilter;
        const matchesRegion = regionFilter === 'all' || itemRegion === regionFilter;
        const matchesSearch = searchTerm === '' || itemText.includes(searchTerm);
        
        if (matchesType && matchesRegion && matchesSearch) {
          item.style.display = '';
          visibleCount++;
        } else {
          item.style.display = 'none';
        }
      });
      
      // Show/hide no results message
      const noResultsElement = document.getElementById('no-results');
      if (noResultsElement) {
        noResultsElement.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    },
    
    filterGenericItems: function(filterElement) {
      // Get the filter type from the element ID
      const filterType = filterElement.id.replace('filter-', '').replace('sort-', '');
      
      // Find the closest container that might have filterable items
      const container = filterElement.closest('section')?.querySelector('[class$="-list"], [class$="-grid"], [id$="-list"], [id$="-grid"]');
      
      if (!container) return;
      
      // Get all filterable items in the container
      const items = container.querySelectorAll('.card, .list-card, .category-card, [data-filterable="true"]');
      
      // Get all active filters
      const activeFilters = {};
      container.closest('section').querySelectorAll('select[id^="filter-"], select[id^="sort-"]').forEach(select => {
        const type = select.id.replace('filter-', '').replace('sort-', '');
        activeFilters[type] = select.value;
      });
      
      // Get search term if a search input exists
      const searchInput = container.closest('section').querySelector('input[type="search"], input[id*="search"]');
      const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
      
      let visibleCount = 0;
      
      // Filter items based on data attributes
      items.forEach(item => {
        let shouldShow = true;
        
        // Check each active filter against item data attributes
        for (const [type, value] of Object.entries(activeFilters)) {
          if (value !== 'all') {
            const itemValue = item.dataset[type];
            
            if (!itemValue || (itemValue.includes(',') && !itemValue.split(',').includes(value)) || 
                (!itemValue.includes(',') && itemValue !== value)) {
              shouldShow = false;
              break;
            }
          }
        }
        
        // Check search term
        if (shouldShow && searchTerm) {
          const itemText = item.textContent.toLowerCase();
          shouldShow = itemText.includes(searchTerm);
        }
        
        // Show or hide the item
        item.style.display = shouldShow ? '' : 'none';
        if (shouldShow) visibleCount++;
      });
      
      // Show/hide no results message
      const noResultsElement = container.closest('section').querySelector('.no-results, #no-results');
      if (noResultsElement) {
        noResultsElement.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    },

    // ======================================
    // SHARE & EXPORT FUNCTIONALITY
    // ======================================
    toggleShareOptions: function(e) {
      e.preventDefault();
      
      // Close all export options first
      this.dom.exportOptions.forEach(options => {
        options.style.display = 'none';
      });
      
      // Toggle the share options dropdown
      const shareBtn = e.currentTarget;
      const shareOptions = shareBtn.nextElementSibling || document.getElementById('share-options');
      
      if (shareOptions) {
        // Close all other share options first
        this.dom.shareOptions.forEach(options => {
          if (options !== shareOptions) {
            options.style.display = 'none';
          }
        });
        
        // Toggle this share options dropdown
        shareOptions.style.display = shareOptions.style.display === 'block' ? 'none' : 'block';
      }
    },
    
    toggleExportOptions: function(e) {
      e.preventDefault();
      
      // Close all share options first
      this.dom.shareOptions.forEach(options => {
        options.style.display = 'none';
      });
      
      // Toggle the export options dropdown
      const exportBtn = e.currentTarget;
      const exportOptions = exportBtn.nextElementSibling || document.getElementById('export-options');
      
      if (exportOptions) {
        // Close all other export options first
        this.dom.exportOptions.forEach(options => {
          if (options !== exportOptions) {
            options.style.display = 'none';
          }
        });
        
        // Toggle this export options dropdown
        exportOptions.style.display = exportOptions.style.display === 'block' ? 'none' : 'block';
      }
    },
    
    closeDropdowns: function(e) {
      // Close share options if clicking outside
      if (!e.target.closest('[id*="share-container"]')) {
        this.dom.shareOptions.forEach(options => {
          options.style.display = 'none';
        });
      }
      
      // Close export options if clicking outside
      if (!e.target.closest('[id*="export-container"]')) {
        this.dom.exportOptions.forEach(options => {
          options.style.display = 'none';
        });
      }
    },
    
    handleShare: function(e) {
      e.preventDefault();
      
      const shareType = e.currentTarget.id.replace('share-', '');
      const pageUrl = encodeURIComponent(window.location.href);
      const pageTitle = encodeURIComponent(document.title);
      
      switch (shareType) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`, '_blank');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`, '_blank');
          break;
        case 'email':
          window.location.href = `mailto:?subject=${pageTitle}&body=Check out this page: ${pageUrl}`;
          break;
        case 'link':
          navigator.clipboard.writeText(window.location.href).then(() => {
            this.showNotification('Link copied to clipboard!');
          });
          break;
      }
      
      // Close the share options dropdown
      const shareOptions = e.currentTarget.closest('.share-options');
      if (shareOptions) {
        shareOptions.style.display = 'none';
      }
    },
    
    handleExport: function(e) {
      e.preventDefault();
      
      const exportType = e.currentTarget.id.replace('export-', '');
      
      switch (exportType) {
        case 'pdf':
          this.exportToPDF();
          break;
        case 'csv':
          this.exportToCSV();
          break;
        case 'print':
          window.print();
          break;
      }
      
      // Close the export options dropdown
      const exportOptions = e.currentTarget.closest('.export-options');
      if (exportOptions) {
        exportOptions.style.display = 'none';
      }
    },
    
    exportToPDF: function() {
      // This would typically use a library like jsPDF
      // For now, we'll just show a notification
      this.showNotification('Generating PDF export... This feature would download a PDF of the current page.');
    },
    
    exportToCSV: function() {
      // Identify what data to export based on the current page
      let data = [];
      let filename = 'whosbest-export.csv';
      
      if (document.getElementById('hospital-list')) {
        // Export hospital data
        data = this.extractHospitalData();
        filename = 'top-hospitals.csv';
      } else {
        // Generic export - just show notification
        this.showNotification('Generating CSV export... This feature would download a CSV file of the data.');
        return;
      }
      
      if (data.length === 0) {
        this.showNotification('No data available to export.');
        return;
      }
      
      // Create CSV content
      const csvContent = this.convertToCSV(data);
      
      // Create download link
      const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
    },
    
    extractHospitalData: function() {
      const data = [['Rank', 'Hospital Name', 'Location', 'Specialties', 'Patient Score', 'Quality Score', 'Innovation Score', 'Overall Score']];
      
      this.dom.hospitalCards.forEach(hospital => {
        if (hospital.style.display !== 'none') {
          const rank = hospital.querySelector('.hospital-rank')?.textContent.trim() || '';
          const name = hospital.querySelector('.hospital-name')?.textContent.trim() || '';
          const location = hospital.querySelector('.hospital-location span')?.textContent.trim() || '';
          
          // Get specialties
          const specialtyTags = hospital.querySelectorAll('.specialty-tag');
          const specialties = Array.from(specialtyTags).map(tag => tag.textContent.trim()).join(', ');
          
          // Get scores
          const patientScore = hospital.querySelector('.rating-item:nth-child(1) .rating-value')?.textContent.trim() || '';
          const qualityScore = hospital.querySelector('.rating-item:nth-child(2) .rating-value')?.textContent.trim() || '';
          const innovationScore = hospital.querySelector('.rating-item:nth-child(3) .rating-value')?.textContent.trim() || '';
          const overallScore = hospital.querySelector('.rating-item:nth-child(4) .rating-value')?.textContent.trim() || '';
          
          data.push([rank, name, location, specialties, patientScore, qualityScore, innovationScore, overallScore]);
        }
      });
      
      return data;
    },
    
    convertToCSV: function(data) {
      return data.map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
        ).join(',')
      ).join('\n');
    },

    // ======================================
    // ANIMATIONS & VISUAL EFFECTS
    // ======================================
    initAnimations: function() {
      // Initialize staggered animations for list items
      setTimeout(() => {
        this.dom.staggerItems.forEach(item => {
          item.style.opacity = '1';
        });
      }, this.config.animationDelay);
      
      // Initialize any other animations
      this.initScrollAnimations();
    },
    
    initScrollAnimations: function() {
      // Find elements that should animate on scroll
      const animatedElements = document.querySelectorAll('.animate-on-scroll');
      
      if (animatedElements.length === 0) return;
      
      // Create IntersectionObserver if supported
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animated');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });
        
        animatedElements.forEach(element => {
          observer.observe(element);
        });
      } else {
        // Fallback for browsers that don't support IntersectionObserver
        animatedElements.forEach(element => {
          element.classList.add('animated');
        });
      }
    },
    
    handleScrollAnimations: function() {
      // This would handle any animations that need to respond to scroll position
      // For example, parallax effects or progress indicators
      
      // Example: Update a reading progress bar if it exists
      const progressBar = document.getElementById('reading-progress');
      if (progressBar) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPosition = window.scrollY;
        const scrollPercentage = (scrollPosition / docHeight) * 100;
        progressBar.style.width = `${scrollPercentage}%`;
      }
    },
    
    initTooltips: function() {
      // Initialize tooltips for elements with data-tooltip attribute
      const tooltipElements = document.querySelectorAll('[data-tooltip]');
      
      tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', e => {
          const tooltipText = e.target.getAttribute('data-tooltip');
          
          if (!tooltipText) return;
          
          // Create tooltip element
          const tooltip = document.createElement('div');
          tooltip.className = 'tooltip';
          tooltip.textContent = tooltipText;
          document.body.appendChild(tooltip);
          
          // Position tooltip
          const rect = e.target.getBoundingClientRect();
          tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10 + window.scrollY}px`;
          tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
          
          // Show tooltip
          setTimeout(() => {
            tooltip.classList.add('visible');
          }, 10);
          
          // Store tooltip reference
          e.target.tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', e => {
          if (e.target.tooltip) {
            e.target.tooltip.classList.remove('visible');
            
            // Remove tooltip after animation
            setTimeout(() => {
              if (e.target.tooltip && e.target.tooltip.parentNode) {
                e.target.tooltip.parentNode.removeChild(e.target.tooltip);
                e.target.tooltip = null;
              }
            }, 300);
          }
        });
      });
    },
    
    // ======================================
    // FORM HANDLING
    // ======================================
    handleFormSubmit: function(e) {
      // Get the form
      const form = e.currentTarget;
      
      // Check if the form has a data-ajax attribute
      const isAjax = form.hasAttribute('data-ajax');
      
      // Validate form
      if (!this.validateForm(form)) {
        e.preventDefault();
        return false;
      }
      
      // If it's an AJAX form, handle submission via AJAX
      if (isAjax) {
        e.preventDefault();
        this.submitFormAjax(form);
        return false;
      }
      
      // For regular forms, let the default behavior handle it
      return true;
    },
    
    validateForm: function(form) {
      let isValid = true;
      const requiredFields = form.querySelectorAll('[required]');
      const emailFields = form.querySelectorAll('input[type="email"]');
      
      // Remove any existing error messages
      form.querySelectorAll('.form-error').forEach(error => {
        error.parentNode.removeChild(error);
      });
      
      // Check required fields
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          this.showFieldError(field, 'This field is required');
          isValid = false;
        }
      });
      
      // Validate email fields
      emailFields.forEach(field => {
        if (field.value.trim() && !this.utils.isValidEmail(field.value)) {
          this.showFieldError(field, 'Please enter a valid email address');
          isValid = false;
        }
      });
      
      // Check for custom validation
      const customValidationFields = form.querySelectorAll('[data-validate]');
      customValidationFields.forEach(field => {
        const validationType = field.getAttribute('data-validate');
        const value = field.value.trim();
        
        if (value) {
          switch (validationType) {
            case 'phone':
              if (!this.utils.isValidPhone(value)) {
                this.showFieldError(field, 'Please enter a valid phone number');
                isValid = false;
              }
              break;
            case 'zip':
              if (!this.utils.isValidZip(value)) {
                this.showFieldError(field, 'Please enter a valid ZIP code');
                isValid = false;
              }
              break;
            case 'url':
              if (!this.utils.isValidUrl(value)) {
                this.showFieldError(field, 'Please enter a valid URL');
                isValid = false;
              }
              break;
          }
        }
      });
      
      return isValid;
    },
    
    showFieldError: function(field, message) {
      // Create error message element
      const errorElement = document.createElement('div');
      errorElement.className = 'form-error';
      errorElement.textContent = message;
      errorElement.style.color = 'var(--color-error)';
      errorElement.style.fontSize = 'var(--font-size-sm)';
      errorElement.style.marginTop = '0.25rem';
      
      // Add error class to field
      field.classList.add('error');
      
      // Insert error message after the field
      field.parentNode.insertBefore(errorElement, field.nextSibling);
      
      // Focus the first field with an error
      if (!document.querySelector('.form-error')) {
        field.focus();
      }
    },
    
    submitFormAjax: function(form) {
      // Show loading state
      form.classList.add('loading');
      const submitButton = form.querySelector('[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.originalText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
      }
      
      // Collect form data
      const formData = new FormData(form);
      const formDataObject = {};
      formData.forEach((value, key) => {
        formDataObject[key] = value;
      });
      
      // For demo purposes, simulate an AJAX request
      setTimeout(() => {
        // Simulate successful submission
        form.classList.remove('loading');
        form.classList.add('submitted');
        
        // Reset button
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = submitButton.dataset.originalText;
        }
        
        // Show success message
        const successMessage = form.getAttribute('data-success-message') || 'Form submitted successfully!';
        this.showNotification(successMessage, 'success');
        
        // Reset form
        form.reset();
        
      }, 1500);
      
      // In a real implementation, you would use fetch or XMLHttpRequest to submit the form
      /*
      fetch(form.action, {
        method: form.method || 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => response.json())
      .then(data => {
        // Handle successful response
        form.classList.remove('loading');
        form.classList.add('submitted');
        
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = submitButton.dataset.originalText;
        }
        
        const successMessage = form.getAttribute('data-success-message') || 'Form submitted successfully!';
        this.showNotification(successMessage, 'success');
        
        form.reset();
      })
      .catch(error => {
        // Handle error
        form.classList.remove('loading');
        
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = submitButton.dataset.originalText;
        }
        
        const errorMessage = 'There was an error submitting the form. Please try again.';
        this.showNotification(errorMessage, 'error');
        
        console.error('Form submission error:', error);
      });
      */
    },

    // ======================================
    // LOCAL STORAGE UTILITIES
    // ======================================
    initLocalStorage: function() {
      // Initialize recently viewed items
      this.updateRecentlyViewed();
      
      // Initialize favorites
      this.updateFavorites();
      
      // Bind favorite toggle buttons
      document.querySelectorAll('.favorite-toggle').forEach(button => {
        button.addEventListener('click', this.toggleFavorite.bind(this));
      });
    },
    
    updateRecentlyViewed: function() {
      // Get current page info
      const currentPath = window.location.pathname;
      const currentTitle = document.title;
      
      // Skip certain page types
      if (currentPath === '/' || 
          currentPath === '/index.html' || 
          currentPath.includes('/categories.html') ||
          currentPath.includes('/about.html') ||
          currentPath.includes('/contact.html')) {
        return;
      }
      
      // Find page type and ID
      let pageType = '';
      let pageId = '';
      
      if (currentPath.includes('/lists/')) {
        pageType = 'list';
        pageId = currentPath.split('/').pop().replace('.html', '');
      } else if (currentPath.includes('/categories/')) {
        pageType = 'category';
        pageId = currentPath.split('/').pop().replace('.html', '');
      }
      
      if (!pageType || !pageId) return;
      
      // Get image for the page
      let pageImage = '';
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        pageImage = ogImage.getAttribute('content');
      }
      
      // Create page object
      const pageObject = {
        type: pageType,
        id: pageId,
        title: currentTitle,
        path: currentPath,
        image: pageImage,
        timestamp: new Date().getTime()
      };
      
      // Add to recently viewed
      let recentlyViewed = this.cache.recentlyViewed;
      
      // Remove if already exists
      recentlyViewed = recentlyViewed.filter(item => item.path !== currentPath);
      
      // Add to beginning
      recentlyViewed.unshift(pageObject);
      
      // Limit to 10 items
      if (recentlyViewed.length > 10) {
        recentlyViewed = recentlyViewed.slice(0, 10);
      }
      
      // Update cache and localStorage
      this.cache.recentlyViewed = recentlyViewed;
      localStorage.setItem('whosbest_recentlyViewed', JSON.stringify(recentlyViewed));
      
      // Update recently viewed UI if it exists
      this.updateRecentlyViewedUI();
    },
    
    updateRecentlyViewedUI: function() {
      const recentlyViewedContainer = document.getElementById('recently-viewed-container');
      if (!recentlyViewedContainer) return;
      
      const recentlyViewed = this.cache.recentlyViewed;
      
      if (recentlyViewed.length === 0) {
        recentlyViewedContainer.style.display = 'none';
        return;
      }
      
      // Show container
      recentlyViewedContainer.style.display = 'block';
      
      // Get list element
      const recentlyViewedList = document.getElementById('recently-viewed-list');
      if (!recentlyViewedList) return;
      
      // Clear list
      recentlyViewedList.innerHTML = '';
      
      // Add items
      recentlyViewed.forEach(item => {
        const listItem = document.createElement('div');
        listItem.className = 'recently-viewed-item';
        
        const itemImage = item.image || '../assets/placeholder.jpg';
        const itemTitle = item.title.split('|')[0].trim();
        
        listItem.innerHTML = `
          <a href="${item.path}" class="recently-viewed-link">
            <div class="recently-viewed-image">
              <img src="${itemImage}" alt="${itemTitle}">
            </div>
            <div class="recently-viewed-content">
              <h4 class="recently-viewed-title">${itemTitle}</h4>
              <p class="recently-viewed-type">${item.type === 'list' ? 'Ranking' : 'Category'}</p>
            </div>
          </a>
        `;
        
        recentlyViewedList.appendChild(listItem);
      });
    },
    
    updateFavorites: function() {
      // Update favorites UI if it exists
      const favoritesContainer = document.getElementById('favorites-container');
      if (!favoritesContainer) return;
      
      const favorites = this.cache.favorites;
      
      if (favorites.length === 0) {
        favoritesContainer.style.display = 'none';
        return;
      }
      
      // Show container
      favoritesContainer.style.display = 'block';
      
      // Get list element
      const favoritesList = document.getElementById('favorites-list');
      if (!favoritesList) return;
      
      // Clear list
      favoritesList.innerHTML = '';
      
      // Add items
      favorites.forEach(item => {
        const listItem = document.createElement('div');
        listItem.className = 'favorite-item';
        
        const itemImage = item.image || '../assets/placeholder.jpg';
        const itemTitle = item.title;
        
        listItem.innerHTML = `
          <a href="${item.path}" class="favorite-link">
            <div class="favorite-image">
              <img src="${itemImage}" alt="${itemTitle}">
            </div>
            <div class="favorite-content">
              <h4 class="favorite-title">${itemTitle}</h4>
              <p class="favorite-type">${item.type === 'list' ? 'Ranking' : 'Category'}</p>
            </div>
          </a>
          <button class="favorite-remove" data-id="${item.id}" data-type="${item.type}">
            <i class="fas fa-times"></i>
          </button>
        `;
        
        favoritesList.appendChild(listItem);
      });
      
      // Bind remove buttons
      document.querySelectorAll('.favorite-remove').forEach(button => {
        button.addEventListener('click', this.removeFavorite.bind(this));
      });
    },
    
    toggleFavorite: function(e) {
      e.preventDefault();
      
      const button = e.currentTarget;
      const itemId = button.getAttribute('data-id');
      const itemType = button.getAttribute('data-type');
      const itemTitle = button.getAttribute('data-title');
      const itemPath = button.getAttribute('data-path') || window.location.pathname;
      const itemImage = button.getAttribute('data-image') || '';
      
      if (!itemId || !itemType) return;
      
      let favorites = this.cache.favorites;
      
      // Check if already favorited
      const existingIndex = favorites.findIndex(item => item.id === itemId && item.type === itemType);
      
      if (existingIndex !== -1) {
        // Remove from favorites
        favorites.splice(existingIndex, 1);
        button.classList.remove('active');
        button.querySelector('i').classList.remove('fas');
        button.querySelector('i').classList.add('far');
        this.showNotification('Removed from favorites', 'info');
      } else {
        // Add to favorites
        favorites.push({
          id: itemId,
          type: itemType,
          title: itemTitle,
          path: itemPath,
          image: itemImage,
          timestamp: new Date().getTime()
        });
        button.classList.add('active');
        button.querySelector('i').classList.remove('far');
        button.querySelector('i').classList.add('fas');
        this.showNotification('Added to favorites', 'success');
      }
      
      // Update cache and localStorage
      this.cache.favorites = favorites;
      localStorage.setItem('whosbest_favorites', JSON.stringify(favorites));
      
      // Update favorites UI
      this.updateFavorites();
    },
    
    removeFavorite: function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const button = e.currentTarget;
      const itemId = button.getAttribute('data-id');
      const itemType = button.getAttribute('data-type');
      
      if (!itemId || !itemType) return;
      
      let favorites = this.cache.favorites;
      
      // Find and remove the favorite
      const existingIndex = favorites.findIndex(item => item.id === itemId && item.type === itemType);
      
      if (existingIndex !== -1) {
        favorites.splice(existingIndex, 1);
        
        // Update cache and localStorage
        this.cache.favorites = favorites;
        localStorage.setItem('whosbest_favorites', JSON.stringify(favorites));
        
        // Update favorites UI
        this.updateFavorites();
        
        // Update any related favorite toggle buttons
        document.querySelectorAll(`.favorite-toggle[data-id="${itemId}"][data-type="${itemType}"]`).forEach(btn => {
          btn.classList.remove('active');
          if (btn.querySelector('i')) {
            btn.querySelector('i').classList.remove('fas');
            btn.querySelector('i').classList.add('far');
          }
        });
        
        this.showNotification('Removed from favorites', 'info');
      }
    },

    // ======================================
    // RESPONSIVE BEHAVIOR
    // ======================================
    handleResize: function() {
      // Update cache
      this.cache.windowWidth = window.innerWidth;
      
      // Handle responsive elements
      this.handleResponsiveElements();
      
      // Close mobile menu if window is resized to desktop
      if (this.cache.windowWidth >= this.config.breakpoints.md && this.cache.isNavOpen) {
        this.cache.isNavOpen = false;
        this.dom.navbarMenu.classList.remove('open');
        
        if (this.dom.navbarToggle.querySelector('i')) {
          const icon = this.dom.navbarToggle.querySelector('i');
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    },
    
    handleResponsiveElements: function() {
      // Adjust any elements that need to change based on screen size
      const isMobile = this.cache.windowWidth < this.config.breakpoints.md;
      const isTablet = this.cache.windowWidth >= this.config.breakpoints.md && this.cache.windowWidth < this.config.breakpoints.lg;
      const isDesktop = this.cache.windowWidth >= this.config.breakpoints.lg;
      
      // Example: Adjust card layouts
      if (isMobile) {
        document.querySelectorAll('.grid-cols-3, .grid-cols-4').forEach(grid => {
          grid.classList.add('grid-cols-1');
          grid.classList.remove('grid-cols-3', 'grid-cols-4');
        });
      } else if (isTablet) {
        document.querySelectorAll('.grid-cols-4').forEach(grid => {
          grid.classList.add('grid-cols-2');
          grid.classList.remove('grid-cols-4');
        });
      }
      
      // Example: Adjust hospital cards for mobile
      if (isMobile) {
        document.querySelectorAll('.hospital-card').forEach(card => {
          if (!card.classList.contains('mobile-layout')) {
            card.classList.add('mobile-layout');
          }
        });
      } else {
        document.querySelectorAll('.hospital-card.mobile-layout').forEach(card => {
          card.classList.remove('mobile-layout');
        });
      }
    },
    
    handlePageLoad: function() {
      // Remove any loading indicators
      document.body.classList.remove('loading');
      document.body.classList.add('loaded');
      
      // Initialize lazy loading
      this.initLazyLoading();
      
      // Check for hash in URL and scroll to it
      if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
          setTimeout(() => {
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = targetPosition - this.config.scrollOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }, 100);
        }
      }
    },

    // ======================================
    // PERFORMANCE OPTIMIZATIONS
    // ======================================
    initLazyLoading: function() {
      // Lazy load images
      const lazyImages = document.querySelectorAll('img[data-src]');
      
      if (lazyImages.length === 0) return;
      
      // Use IntersectionObserver if available
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              
              // Also handle srcset if present
              if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
              }
              
              img.classList.add('loaded');
              observer.unobserve(img);
            }
          });
        });
        
        lazyImages.forEach(img => {
          imageObserver.observe(img);
        });
      } else {
        // Fallback for browsers without IntersectionObserver
        lazyImages.forEach(img => {
          img.src = img.dataset.src;
          
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          
          img.classList.add('loaded');
        });
      }
    },

    // ======================================
    // SPECIALIZED PAGE INITIALIZATIONS
    // ======================================
    initializeHospitalList: function() {
      // Initialize hospital list specific functionality
      console.log('Initializing hospital list page');
      
      // Set up initial filtering
      this.filterHospitals();
    },
    
    initializeCategoryLists: function() {
      // Initialize category lists specific functionality
      console.log('Initializing category lists page');
      
      // Set up initial filtering
      this.filterCategoryLists();
    },

    // ======================================
    // UTILITY FUNCTIONS
    // ======================================
    showNotification: function(message, type = 'info') {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.textContent = message;
      
      // Add to document
      document.body.appendChild(notification);
      
      // Show notification
      setTimeout(() => {
        notification.classList.add('visible');
      }, 10);
      
      // Hide and remove after delay
      setTimeout(() => {
        notification.classList.remove('visible');
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
    },
    
    utils: {
      // Debounce function to limit how often a function can be called
      debounce: function(func, delay) {
        let timeout;
        return function() {
          const context = this;
          const args = arguments;
          clearTimeout(timeout);
          timeout = setTimeout(() => func.apply(context, args), delay);
        };
      },
      
      // Throttle function to limit how often a function can be called
      throttle: function(func, limit) {
        let inThrottle;
        return function() {
          const context = this;
          const args = arguments;
          if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
          }
        };
      },
      
      // Email validation
      isValidEmail: function(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
      },
      
      // Phone validation (US format)
      isValidPhone: function(phone) {
        const re = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
        return re.test(String(phone));
      },
      
      // ZIP code validation (US format)
      isValidZip: function(zip) {
        const re = /^\d{5}(-\d{4})?$/;
        return re.test(String(zip));
      },
      
      // URL validation
      isValidUrl: function(url) {
        try {
          new URL(url);
          return true;
        } catch (e) {
          return false;
        }
      },
      
      // Format date
      formatDate: function(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
      },
      
      // Format number with commas
      formatNumber: function(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      },
      
      // Generate random ID
      generateId: function(prefix = 'id') {
        return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
      }
    }
  };

  // Initialize everything when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    WhosBest.init();
  });

})();
