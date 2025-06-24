class TemplateAdsEditor {
    constructor() {
        this.canvas = null;
        this.currentTemplate = 'template1';
        this.currentOrientation = 'vertical';
        this.mainImage = null;
        this.logo = null;
        this.titleText = null;
        this.subtitleText = null;
        this.ctaText = null;
        this.background = null;
        
        // Undo system
        this.history = [];
        this.historyStep = -1;
        this.maxHistorySteps = 20;
        this.isLoadingTemplate = false;
        
        this.init();
    }
    
    init() {
        // Initialize Fabric.js canvas
        this.canvas = new fabric.Canvas('designCanvas', {
            backgroundColor: '#ffffff',
            selection: true, // Enable selection for text editing
            preserveObjectStacking: true
        });
        
        // Floating toolbar properties
        this.textToolbar = document.getElementById('textToolbar');
        this.selectedTextObject = null;
        this.ctaToolbar = document.getElementById('ctaToolbar');
        this.selectedCtaObject = null;
        this.backgroundToolbar = document.getElementById('backgroundToolbar');
        
        // Zoom properties
        this.zoomLevel = 1;
        this.minZoom = 0.25;
        this.maxZoom = 3;
        this.zoomStep = 0.25;
        
        // Smart guides properties
        this.guidelines = [];
        this.snapThreshold = 8; // pixels
        this.showingGuidelines = false;
        
        this.setCanvasDimensions();
        this.setupEventListeners();
        this.setupCanvasEvents();
        this.setupTextToolbarEvents();
        this.setupCtaToolbarEvents();
        this.setupBackgroundToolbarEvents();
        this.setupZoomEvents();
        this.setupResizeListener();
        
        // Initialize canvas with default content
        this.initializeDefaultContent();
    }

    initializeDefaultContent() {
        console.log('Initializing default content...');
        // Set loading flag to prevent undo states during initialization
        this.isLoadingTemplate = true;
        
        // First, ensure the canvas is properly set up
        this.canvas.clear();
        this.canvas.setBackgroundColor('#ffffff', this.canvas.renderAll.bind(this.canvas));
        
        // Load the default template structure
        this.loadTemplate(this.currentTemplate);
        
        // Load default image with proper error handling
        const defaultImagePath = 'static/images/default-placeholder.png';
        console.log('Loading default image from:', defaultImagePath);
        
        fabric.Image.fromURL(defaultImagePath, (img) => {
            if (!img) {
                console.error('Failed to load default image from:', defaultImagePath);
                this.isLoadingTemplate = false;
                return;
            }
            
            console.log('Default image loaded successfully');
            const canvasWidth = this.canvas.width;
            const canvasHeight = this.canvas.height;
            
            // Scale and position the main image
            const scaleX = canvasWidth / img.width;
            const scaleY = canvasHeight / img.height;
            const scale = Math.max(scaleX, scaleY);
            
            img.set({
                left: canvasWidth / 2,
                top: canvasHeight / 2,
                originX: 'center',
                originY: 'center',
                scaleX: scale,
                scaleY: scale,
                selectable: true,
                evented: true,
                id: 'mainImage'
            });
            
            // Remove any existing main image
            const existingImage = this.canvas.getObjects().find(obj => obj.id === 'mainImage');
            if (existingImage) {
                this.canvas.remove(existingImage);
            }
            
            this.canvas.add(img);
            this.canvas.sendToBack(img);
            this.mainImage = img;
            this.canvas.renderAll();
            
            // Now enable undo system and save the complete initial state
            this.isLoadingTemplate = false;
            
            // Clear any existing history and set this as the baseline
            this.history = [];
            this.historyStep = -1;
            this.saveState();
            
            console.log('Default template initialized successfully');
        }, {
            crossOrigin: 'anonymous'
        });
        
        this.updateFontFamilyDisplay();
        this.applyZoom();
    }

    loadDefaultImage() {
        // Load the default placeholder image on page load
        const defaultImagePath = '/static/images/default-placeholder.png';
        this.addImageToCanvas(defaultImagePath, 'main');
    }

    updateFontFamilyDisplay() {
        // This method is no longer needed since font family is handled by the floating toolbar
    }

    setCanvasDimensions() {
        let canvasWidth, canvasHeight;
        
        if (this.currentOrientation === 'horizontal') {
            // Horizontal: 1.91:1 aspect ratio
            canvasWidth = 1528;
            canvasHeight = 800;
        } else if (this.currentOrientation === 'square') {
            // Square: 1:1 aspect ratio
            canvasWidth = 800;
            canvasHeight = 800;
        } else {
            // Vertical: 4:5 aspect ratio
            canvasWidth = 640;
            canvasHeight = 800;
        }
        
        this.canvas.setDimensions({width: canvasWidth, height: canvasHeight});
        this.canvas.renderAll();
    }

    changeOrientation(orientation) {
        this.currentOrientation = orientation;
        
        // Update canvas dimensions
        this.setCanvasDimensions();
        
        // Reload current template to ensure proper layout for new orientation
        this.loadTemplate(this.currentTemplate);
        
        this.canvas.renderAll();
    }

    toggleCTA(enabled) {
        // Show/hide CTA button on canvas
        if (this.ctaGroup) {
            this.ctaGroup.set('visible', enabled);
            this.canvas.renderAll();
            this.saveState();
        }
    }

    updateTextEffect(textType, effectType, enabled) {
        let textObj = null;
        
        switch(textType) {
            case 'title':
                textObj = this.titleText;
                break;
            case 'subtitle':
                textObj = this.subtitleText;
                break;
        }
        
        if (textObj) {
            const effectColor = '#000000'; // Default effect color since effectColor input was removed
            
            if (effectType === 'shadow') {
                if (enabled) {
                    textObj.set('shadow', `${effectColor} 3px 3px 6px`);
                } else {
                    textObj.set('shadow', null);
                }
            } else if (effectType === 'outline') {
                if (enabled) {
                    textObj.set('stroke', effectColor);
                    textObj.set('strokeWidth', 2);
                } else {
                    textObj.set('stroke', null);
                    textObj.set('strokeWidth', 0);
                }
            }
            
            this.canvas.renderAll();
            this.saveState();
        }
    }

    updateEffectColor(color) {
        // Update shadow and outline colors for currently enabled effects
        const titleShadow = document.getElementById('titleShadow').checked;
        const subtitleShadow = document.getElementById('subtitleShadow').checked;
        const titleOutline = document.getElementById('titleOutline').checked;
        const subtitleOutline = document.getElementById('subtitleOutline').checked;
        
        if (titleShadow && this.titleText) {
            this.titleText.set('shadow', `${color} 3px 3px 6px`);
        }
        
        if (subtitleShadow && this.subtitleText) {
            this.subtitleText.set('shadow', `${color} 3px 3px 6px`);
        }
        
        if (titleOutline && this.titleText) {
            this.titleText.set('stroke', color);
        }
        
        if (subtitleOutline && this.subtitleText) {
            this.subtitleText.set('stroke', color);
        }
        
        this.canvas.renderAll();
        this.saveState();
    }

    setupResizeListener() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.setCanvasDimensions();
                // Reload current template to adjust element positions for new dimensions
                this.loadTemplate(this.currentTemplate);
            }, 250);
        });
    }
    
    setupOrientationDropdown() {
        const orientationBtn = document.getElementById('orientationBtn');
        const orientationMenu = document.getElementById('orientationMenu');
        const orientationOptions = document.querySelectorAll('#orientationMenu .control-option');
        
        // Toggle dropdown
        orientationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = orientationMenu.classList.contains('hidden');
            
            // Close template dropdown if open
            const templateMenu = document.getElementById('templateMenu');
            const templateBtn = document.getElementById('templateBtn');
            if (templateMenu && !templateMenu.classList.contains('hidden')) {
                templateMenu.classList.add('hidden');
                templateBtn.classList.remove('active');
            }
            
            if (isHidden) {
                orientationMenu.classList.remove('hidden');
                orientationBtn.classList.add('active');
            } else {
                orientationMenu.classList.add('hidden');
                orientationBtn.classList.remove('active');
            }
        });
        
        // Handle option selection
        orientationOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const orientation = option.getAttribute('data-orientation');
                
                // Update active state
                orientationOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Update button display
                const display = orientationBtn.querySelector('.control-option-display');
                display.innerHTML = option.innerHTML;
                
                // Change orientation
                this.changeOrientation(orientation);
                
                // Keep dropdown open - will close when clicking outside
            });
        });
        
        // Close dropdown when focus leaves the dropdown area
        orientationBtn.addEventListener('focusout', (e) => {
            // Use setTimeout to ensure the focus has moved before checking
            setTimeout(() => {
                const orientationDropdown = document.getElementById('orientationDropdown');
                if (!orientationDropdown.contains(document.activeElement)) {
                    orientationMenu.classList.add('hidden');
                    orientationBtn.classList.remove('active');
                }
            }, 0);
        });
        
        orientationOptions.forEach(option => {
            option.addEventListener('focusout', (e) => {
                setTimeout(() => {
                    const orientationDropdown = document.getElementById('orientationDropdown');
                    if (!orientationDropdown.contains(document.activeElement)) {
                        orientationMenu.classList.add('hidden');
                        orientationBtn.classList.remove('active');
                    }
                }, 0);
            });
        });
    }
    
    setupTemplateDropdown() {
        const templateBtn = document.getElementById('templateBtn');
        const templateMenu = document.getElementById('templateMenu');
        const templateOptions = document.querySelectorAll('#templateMenu .control-option');
        
        // Toggle dropdown
        templateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = templateMenu.classList.contains('hidden');
            
            // Close orientation dropdown if open
            const orientationMenu = document.getElementById('orientationMenu');
            const orientationBtn = document.getElementById('orientationBtn');
            if (orientationMenu && !orientationMenu.classList.contains('hidden')) {
                orientationMenu.classList.add('hidden');
                orientationBtn.classList.remove('active');
            }
            
            if (isHidden) {
                templateMenu.classList.remove('hidden');
                templateBtn.classList.add('active');
            } else {
                templateMenu.classList.add('hidden');
                templateBtn.classList.remove('active');
            }
        });
        
        // Handle option selection
        templateOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const template = option.getAttribute('data-template');
                
                // Update active state
                templateOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Update button display
                const display = templateBtn.querySelector('.control-option-display');
                display.innerHTML = option.innerHTML;
                
                // Load template
                this.currentTemplate = template;
                this.loadTemplate(template);
                
                // Keep dropdown open - will close when clicking outside
            });
        });
        
        // Close dropdown when focus leaves the dropdown area
        templateBtn.addEventListener('focusout', (e) => {
            // Use setTimeout to ensure the focus has moved before checking
            setTimeout(() => {
                const templateDropdown = document.getElementById('templateDropdown');
                if (!templateDropdown.contains(document.activeElement)) {
                    templateMenu.classList.add('hidden');
                    templateBtn.classList.remove('active');
                }
            }, 0);
        });
        
        templateOptions.forEach(option => {
            option.addEventListener('focusout', (e) => {
                setTimeout(() => {
                    const templateDropdown = document.getElementById('templateDropdown');
                    if (!templateDropdown.contains(document.activeElement)) {
                        templateMenu.classList.add('hidden');
                        templateBtn.classList.remove('active');
                    }
                }, 0);
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!document.getElementById('orientationDropdown').contains(e.target)) {
                const orientationMenu = document.getElementById('orientationMenu');
                const orientationBtn = document.getElementById('orientationBtn');
                if (orientationMenu && !orientationMenu.classList.contains('hidden')) {
                    orientationMenu.classList.add('hidden');
                    orientationBtn.classList.remove('active');
                }
            }
            
            if (!document.getElementById('templateDropdown').contains(e.target)) {
                const templateMenu = document.getElementById('templateMenu');
                const templateBtn = document.getElementById('templateBtn');
                if (templateMenu && !templateMenu.classList.contains('hidden')) {
                    templateMenu.classList.add('hidden');
                    templateBtn.classList.remove('active');
                }
            }
        });
    }
    
    setupEventListeners() {
        // Orientation dropdown
        this.setupOrientationDropdown();
        
        // Template dropdown
        this.setupTemplateDropdown();
        
        // Image uploads
        const mainImageUpload = document.getElementById('mainImageUpload');
        if (mainImageUpload) {
            mainImageUpload.addEventListener('change', (e) => {
                this.handleImageUpload(e, 'main');
            });
        }
        
        const logoUpload = document.getElementById('logoUpload');
        if (logoUpload) {
            logoUpload.addEventListener('change', (e) => {
                this.handleImageUpload(e, 'logo');
            });
        }
        
        // Text inputs
        const titleText = document.getElementById('titleText');
        if (titleText) {
            titleText.addEventListener('input', (e) => {
                this.updateText('title', e.target.value);
            });
        }
        
        const subtitleText = document.getElementById('subtitleText');
        if (subtitleText) {
            subtitleText.addEventListener('input', (e) => {
                this.updateText('subtitle', e.target.value);
            });
        }
        
        const ctaText = document.getElementById('ctaText');
        if (ctaText) {
            ctaText.addEventListener('input', (e) => {
                this.updateText('cta', e.target.value);
                this.updateCtaButtonSize();
            });
        }
        
        // CTA toggle - use correct ID
        const ctaCheckbox = document.getElementById('ctaCheckbox');
        if (ctaCheckbox) {
            ctaCheckbox.addEventListener('change', (e) => {
                this.toggleCTA(e.target.checked);
            });
        }

        // Orientation buttons removed - now handled by dropdown system


        
        // Export dropdown functionality
        const exportMainBtn = document.getElementById('exportMainBtn');
        if (exportMainBtn) {
            exportMainBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleExportDropdown();
            });
        }
        
        // Export buttons
        const exportPng = document.getElementById('exportPng');
        if (exportPng) {
            exportPng.addEventListener('click', () => {
                this.exportImage('png');
                this.hideExportDropdown();
            });
        }
        
        const exportJpg = document.getElementById('exportJpg');
        if (exportJpg) {
            exportJpg.addEventListener('click', () => {
                this.exportImage('jpg');
                this.hideExportDropdown();
            });
        }
        
        const exportPdf = document.getElementById('exportPdf');
        if (exportPdf) {
            exportPdf.addEventListener('click', () => {
                this.exportPdf();
                this.hideExportDropdown();
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!document.querySelector('.export-container').contains(e.target)) {
                this.hideExportDropdown();
            }
        });
        
        // Zoom controls
        const zoomIn = document.getElementById('zoomIn');
        if (zoomIn) {
            zoomIn.addEventListener('click', () => {
                this.zoomIn();
            });
        }
        
        const zoomOut = document.getElementById('zoomOut');
        if (zoomOut) {
            zoomOut.addEventListener('click', () => {
                this.zoomOut();
            });
        }
        
        const zoomToFit = document.getElementById('zoomToFit');
        if (zoomToFit) {
            zoomToFit.addEventListener('click', () => {
                this.zoomToFit();
            });
        }
        
        // Utility buttons
        const undoCanvas = document.getElementById('undoCanvas');
        if (undoCanvas) {
            undoCanvas.addEventListener('click', () => {
                this.undo();
            });
        }
        
        const redoCanvas = document.getElementById('redoCanvas');
        if (redoCanvas) {
            redoCanvas.addEventListener('click', () => {
                this.redo();
            });
        }
        
        const resetCanvas = document.getElementById('resetCanvas');
        if (resetCanvas) {
            resetCanvas.addEventListener('click', () => {
                this.resetCanvas();
            });
        }
        
        // Initialize slider fills on load
        this.initializeSliderFills();
        
        // Add keyboard accessibility for image upload labels
        this.setupImageUploadAccessibility();
        
        // Add keyboard accessibility for CTA checkbox
        this.setupCtaCheckboxAccessibility();
        
        // Setup brand font and color controls
        this.setupBrandControls();
        this.setupStockImageInterface();
    }

    setupCanvasEvents() {
        // Track canvas changes for undo functionality with debouncing
        this.canvas.on('object:added', () => {
            if (!this.isLoadingTemplate) {
                this.debouncedSaveState();
            }
        });
        this.canvas.on('object:removed', () => {
            if (!this.isLoadingTemplate) {
                this.debouncedSaveState();
            }
        });
        this.canvas.on('object:modified', () => {
            this.updateToolbarPosition();
            if (!this.isLoadingTemplate) {
                this.debouncedSaveState();
            }
        });
        this.canvas.on('path:created', () => {
            if (!this.isLoadingTemplate) {
                this.debouncedSaveState();
            }
        });
        
        // Smart guides functionality
        this.canvas.on('object:moving', (e) => this.handleObjectMoving(e));
        this.canvas.on('object:moved', () => this.clearGuidelines());
        this.canvas.on('selection:cleared', () => this.clearGuidelines());
        
        // Add keyboard accessibility for ad elements
        this.setupKeyboardAccessibility();
        
        // Enhanced click-based selection system for all ad elements
        this.canvas.on('mouse:up', (e) => {
            // Add a small delay to ensure the click event is properly processed
            setTimeout(() => {
                console.log('Mouse up on:', e.target ? e.target.id || e.target.type : 'background');
                
                if (e.target && (e.target.type === 'text' || e.target.type === 'textbox')) {
                    // Show toolbar for text elements
                    this.selectedTextObject = e.target;
                    this.canvas.setActiveObject(e.target);
                    this.hideCtaToolbar();
                    this.hideBackgroundToolbar();
                    this.showTextToolbar();
                    this.updateToolbarValues();
                    this.updateToolbarPosition();
                    console.log('Selected text object:', e.target.id);
                } else if (e.target && (e.target.id === 'ctaBackground' || e.target.id === 'cta' || e.target.id === 'ctaGroup')) {
                    // Handle CTA click - show CTA toolbar
                    if (e.target.id === 'ctaGroup') {
                        this.selectedCtaObject = e.target;
                        this.canvas.setActiveObject(e.target);
                    } else {
                        // Find the parent CTA group
                        this.selectedCtaObject = this.canvas.getObjects().find(obj => obj.id === 'ctaGroup');
                        if (this.selectedCtaObject) {
                            this.canvas.setActiveObject(this.selectedCtaObject);
                        }
                    }
                    this.hideTextToolbar();
                    this.hideBackgroundToolbar();
                    this.showCtaToolbar();
                    this.updateCtaToolbarValues();
                    this.updateCtaToolbarPosition();
                    console.log('Selected CTA object');
                } else if (e.target && (e.target.id === 'mainImage' || e.target.id === 'logo')) {
                    // Handle image clicks - make them selectable and moveable
                    this.canvas.setActiveObject(e.target);
                    this.hideTextToolbar();
                    this.hideCtaToolbar();
                    this.hideBackgroundToolbar();
                    console.log('Selected image:', e.target.id);
                } else if (!e.target) {
                    // Clicked on background (empty canvas area)
                    this.canvas.discardActiveObject();
                    this.hideTextToolbar();
                    this.hideCtaToolbar();
                    this.showBackgroundToolbar(e.pointer);
                    console.log('Selected background');
                } else if (e.target) {
                    // Clicked on other objects - make them selectable
                    this.canvas.setActiveObject(e.target);
                    this.hideTextToolbar();
                    this.hideCtaToolbar();
                    this.hideBackgroundToolbar();
                    console.log('Selected other object:', e.target.id || e.target.type);
                }
                this.canvas.renderAll();
            }, 50); // Small delay to ensure proper event handling
        });

        // Ensure toolbar updates position when text or CTA is moved
        this.canvas.on('object:moving', (e) => {
            if (e.target === this.selectedTextObject) {
                this.updateToolbarPosition();
            } else if (e.target === this.selectedCtaObject) {
                this.updateCtaToolbarPosition();
            }
        });



        // Hide toolbar when clicking completely outside the canvas
        document.addEventListener('click', (e) => {
            // Don't hide if clicking on any toolbar
            if (this.textToolbar && this.textToolbar.contains(e.target)) {
                return;
            }
            
            if (this.ctaToolbar && this.ctaToolbar.contains(e.target)) {
                return;
            }
            
            if (this.backgroundToolbar && this.backgroundToolbar.contains(e.target)) {
                return;
            }
            
            // Don't hide if clicking on the canvas itself (handled by canvas events)
            if (this.canvas.getElement().contains(e.target)) {
                return;
            }
            
            // Hide if clicking outside the canvas entirely
            this.hideTextToolbar();
            this.hideCtaToolbar();
            this.hideBackgroundToolbar();
            this.canvas.discardActiveObject();
            this.canvas.renderAll();
        });
    }

    setupKeyboardAccessibility() {
        // Make canvas focusable and add keyboard navigation
        const canvasElement = this.canvas.getElement();
        canvasElement.setAttribute('tabindex', '0');
        canvasElement.setAttribute('role', 'application');
        canvasElement.setAttribute('aria-label', 'Advertisement canvas editor. Use Tab to navigate between elements, Enter to select, and arrow keys to move selected elements.');
        
        // Track focusable objects on canvas
        this.focusableObjects = [];
        this.currentFocusIndex = -1;
        
        // Add keyboard event listeners to both canvas element and document
        canvasElement.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
        
        // Also add global keyboard listener for arrow keys when canvas has focus
        document.addEventListener('keydown', (e) => {
            // Only handle arrow keys if canvas is focused or an object is selected
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                const activeObject = this.canvas.getActiveObject();
                console.log('Arrow key pressed:', e.key, 'Active object:', activeObject ? activeObject.id || activeObject.type : 'none');
                if (activeObject) {
                    e.preventDefault();
                    this.moveSelectedObject(e.key, e.shiftKey);
                }
            }
        });
        
        // Update focusable objects when canvas changes
        this.canvas.on('object:added', () => this.updateFocusableObjects());
        this.canvas.on('object:removed', () => this.updateFocusableObjects());
        
        // Initial setup
        this.updateFocusableObjects();
    }

    updateFocusableObjects() {
        // Get all interactive objects on canvas including CTA when enabled and background
        this.focusableObjects = this.canvas.getObjects().filter(obj => 
            obj.id === 'title' || 
            obj.id === 'subtitle' || 
            obj.id === 'mainImage' || 
            obj.id === 'logo' ||
            (obj.id === 'ctaGroup' && obj.visible)
        );
        
        // Add background as a virtual focusable object
        this.focusableObjects.push({ id: 'background', virtual: true });
    }

    handleKeyboardNavigation(e) {
        // Tab navigation - allow tabbing out of canvas
        if (e.key === 'Tab') {
            // Only prevent default if we're navigating within canvas objects
            if (this.currentFocusIndex >= 0 && this.currentFocusIndex < this.focusableObjects.length - 1 && !e.shiftKey) {
                // Normal tab within canvas
                e.preventDefault();
                this.focusNextObject();
            } else if (this.currentFocusIndex > 0 && e.shiftKey) {
                // Shift+tab within canvas
                e.preventDefault();
                this.focusPreviousObject();
            } else if (this.currentFocusIndex === this.focusableObjects.length - 1 && !e.shiftKey) {
                // Tab out of canvas (forward)
                this.clearCanvasFocus();
                // Let browser handle natural tab flow
            } else if (this.currentFocusIndex === 0 && e.shiftKey) {
                // Tab out of canvas (backward)
                this.clearCanvasFocus();
                // Let browser handle natural tab flow
            } else if (this.currentFocusIndex === -1 && !e.shiftKey) {
                // First tab into canvas
                e.preventDefault();
                this.focusNextObject();
            }
        }
        
        // Enter to select/edit
        if (e.key === 'Enter' && this.currentFocusIndex >= 0) {
            e.preventDefault();
            const focusedObject = this.focusableObjects[this.currentFocusIndex];
            
            if (focusedObject.virtual && focusedObject.id === 'background') {
                // Show background toolbar when background is selected
                this.showBackgroundToolbar({ x: this.canvas.width / 2, y: this.canvas.height / 2 });
            } else {
                this.selectObject(focusedObject);
            }
        }
        
        // Arrow keys to move selected object
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject && !activeObject.virtual) {
                e.preventDefault();
                let moved = false;
                const moveDistance = e.shiftKey ? 10 : 5; // Hold Shift for larger movements
                
                switch(e.key) {
                    case 'ArrowLeft':
                        activeObject.set('left', Math.max(0, activeObject.left - moveDistance));
                        moved = true;
                        break;
                    case 'ArrowRight':
                        activeObject.set('left', Math.min(this.canvas.width - activeObject.getScaledWidth(), activeObject.left + moveDistance));
                        moved = true;
                        break;
                    case 'ArrowUp':
                        activeObject.set('top', Math.max(0, activeObject.top - moveDistance));
                        moved = true;
                        break;
                    case 'ArrowDown':
                        activeObject.set('top', Math.min(this.canvas.height - activeObject.getScaledHeight(), activeObject.top + moveDistance));
                        moved = true;
                        break;
                }
                
                if (moved) {
                    activeObject.setCoords(); // Update object coordinates
                    this.canvas.renderAll();
                    this.saveState();
                    
                    // Update toolbar positions if they're visible
                    if (activeObject === this.selectedTextObject) {
                        this.updateToolbarPosition();
                    } else if (activeObject === this.selectedCtaObject) {
                        this.updateCtaToolbarPosition();
                    }
                    
                    // Announce movement for screen readers
                    const announcement = `Moved ${activeObject.id || 'element'} to position ${Math.round(activeObject.left)}, ${Math.round(activeObject.top)}`;
                    this.announceMovement(announcement);
                }
            }
        }
        
        // Escape to deselect
        if (e.key === 'Escape') {
            this.canvas.discardActiveObject();
            this.hideTextToolbar();
            this.hideCtaToolbar();
            this.hideBackgroundToolbar();
            this.canvas.renderAll();
            this.currentFocusIndex = -1;
        }
    }

    focusNextObject() {
        if (this.focusableObjects.length === 0) return;
        
        this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableObjects.length;
        this.highlightFocusedObject();
    }

    focusPreviousObject() {
        if (this.focusableObjects.length === 0) return;
        
        this.currentFocusIndex = this.currentFocusIndex <= 0 
            ? this.focusableObjects.length - 1 
            : this.currentFocusIndex - 1;
        this.highlightFocusedObject();
    }

    highlightFocusedObject() {
        // Clear any existing selection first
        this.canvas.discardActiveObject();
        
        if (this.currentFocusIndex >= 0 && this.currentFocusIndex < this.focusableObjects.length) {
            const focusedObject = this.focusableObjects[this.currentFocusIndex];
            
            if (focusedObject.virtual && focusedObject.id === 'background') {
                // Handle virtual background object - just announce, don't show toolbar yet
                // Toolbar will be shown on Enter/Space key press
            } else {
                // Use regular selection highlighting for canvas objects
                this.canvas.setActiveObject(focusedObject);
                this.canvas.renderAll();
            }
            
            // Announce focused element for screen readers
            this.announceFocusedElement(focusedObject);
        }
    }

    selectObject(obj) {
        this.canvas.setActiveObject(obj);
        this.canvas.renderAll();
        
        // Show appropriate toolbar based on object type
        if (obj.id === 'title' || obj.id === 'subtitle') {
            this.selectedTextObject = obj;
            this.showTextToolbar();
            this.updateToolbarValues();
            this.updateToolbarPosition();
        } else if (obj.id === 'ctaGroup') {
            this.selectedCtaObject = obj;
            this.showCtaToolbar();
            this.updateCtaToolbarValues();
            this.updateCtaToolbarPosition();
        }
    }

    announceFocusedElement(obj) {
        let announcement = '';
        
        switch(obj.id) {
            case 'title':
                announcement = `Title text: ${obj.text || 'Your Amazing Product'}`;
                break;
            case 'subtitle':
                announcement = `Subtitle text: ${obj.text || 'Premium quality at affordable prices'}`;
                break;
            case 'ctaGroup':
                const ctaText = obj.getObjects().find(o => o.id === 'cta');
                announcement = `Call to action button: ${ctaText?.text || 'Shop Now'}`;
                break;
            case 'mainImage':
                announcement = 'Main image';
                break;
            case 'logo':
                announcement = 'Logo image';
                break;
            case 'background':
                announcement = 'Background color controls';
                break;
            default:
                announcement = 'Canvas element';
        }
        
        // Create temporary aria-live region for announcements
        const announcement_div = document.getElementById('accessibility-announcements') || 
            (() => {
                const div = document.createElement('div');
                div.id = 'accessibility-announcements';
                div.setAttribute('aria-live', 'polite');
                div.setAttribute('aria-atomic', 'true');
                div.style.position = 'absolute';
                div.style.left = '-10000px';
                div.style.width = '1px';
                div.style.height = '1px';
                div.style.overflow = 'hidden';
                document.body.appendChild(div);
                return div;
            })();
            
        announcement_div.textContent = announcement;
    }
    
    announceMovement(message) {
        // Create temporary aria-live region for announcements
        const announcement_div = document.getElementById('accessibility-announcements') || 
            (() => {
                const div = document.createElement('div');
                div.id = 'accessibility-announcements';
                div.setAttribute('aria-live', 'polite');
                div.setAttribute('aria-atomic', 'true');
                div.style.position = 'absolute';
                div.style.left = '-10000px';
                div.style.width = '1px';
                div.style.height = '1px';
                div.style.overflow = 'hidden';
                document.body.appendChild(div);
                return div;
            })();
        
        announcement_div.textContent = message;
    }
    
    moveSelectedObject(direction, isShiftPressed) {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject || activeObject.virtual) return;
        
        const moveDistance = isShiftPressed ? 10 : 5;
        let moved = false;
        
        switch(direction) {
            case 'ArrowLeft':
                activeObject.set('left', Math.max(0, activeObject.left - moveDistance));
                moved = true;
                break;
            case 'ArrowRight':
                activeObject.set('left', Math.min(this.canvas.width - activeObject.getScaledWidth(), activeObject.left + moveDistance));
                moved = true;
                break;
            case 'ArrowUp':
                activeObject.set('top', Math.max(0, activeObject.top - moveDistance));
                moved = true;
                break;
            case 'ArrowDown':
                activeObject.set('top', Math.min(this.canvas.height - activeObject.getScaledHeight(), activeObject.top + moveDistance));
                moved = true;
                break;
        }
        
        if (moved) {
            activeObject.setCoords();
            this.canvas.renderAll();
            this.saveState();
            
            // Update toolbar positions if they're visible
            if (activeObject === this.selectedTextObject) {
                this.updateToolbarPosition();
            } else if (activeObject === this.selectedCtaObject) {
                this.updateCtaToolbarPosition();
            }
            
            console.log(`Moved ${activeObject.id || 'element'} ${direction} by ${moveDistance}px`);
        }
    }

    clearCanvasFocus() {
        // Clear selection highlighting
        this.canvas.discardActiveObject();
        this.currentFocusIndex = -1;
        this.canvas.renderAll();
    }

    makeToolbarAccessible(toolbar) {
        // Make toolbar elements focusable and add proper tab order
        const focusableElements = toolbar.querySelectorAll('input, select, button');
        focusableElements.forEach((element, index) => {
            element.setAttribute('tabindex', '0');
            
            // Add keyboard event listener for Escape to close toolbar
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hideAllToolbars();
                    // Return focus to canvas
                    this.canvas.getElement().focus();
                } else if (e.key === 'Tab') {
                    // Handle tab navigation within toolbar
                    if (!e.shiftKey && index === focusableElements.length - 1) {
                        // Tab out of last element - return to canvas
                        e.preventDefault();
                        this.hideAllToolbars();
                        this.canvas.getElement().focus();
                    } else if (e.shiftKey && index === 0) {
                        // Shift+tab out of first element - return to canvas
                        e.preventDefault();
                        this.hideAllToolbars();
                        this.canvas.getElement().focus();
                    }
                }
            });
        });
        
        // Focus first element in toolbar
        if (focusableElements.length > 0) {
            setTimeout(() => {
                focusableElements[0].focus();
            }, 100);
        }
    }

    hideAllToolbars() {
        this.hideTextToolbar();
        this.hideCtaToolbar();
        this.hideBackgroundToolbar();
    }

    setupImageUploadAccessibility() {
        // Make image upload labels keyboard accessible
        const uploadLabels = document.querySelectorAll('.upload-label');
        uploadLabels.forEach(label => {
            label.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const fileInput = label.querySelector('input[type="file"]');
                    if (fileInput) {
                        fileInput.click();
                    }
                }
            });
        });
    }

    setupCtaCheckboxAccessibility() {
        // Make CTA checkbox keyboard accessible
        const ctaCheckbox = document.getElementById('ctaEnabled');
        if (ctaCheckbox) {
            ctaCheckbox.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    ctaCheckbox.checked = !ctaCheckbox.checked;
                    ctaCheckbox.dispatchEvent(new Event('change'));
                }
            });
        }
    }

    setupTextToolbarEvents() {
        // Get toolbar elements with null checks
        const fontFamilySelect = document.getElementById('toolbarFontFamily');
        const fontSizeInput = document.getElementById('toolbarFontSize');
        const textColorInput = document.getElementById('toolbarTextColor');
        const boldBtn = document.getElementById('toolbarBold');
        const italicBtn = document.getElementById('toolbarItalic');
        const underlineBtn = document.getElementById('toolbarUnderline');
        const textAlignSelect = document.getElementById('toolbarTextAlign');
        const effectsBtn = document.getElementById('effectsBtn');
        const effectsDropdown = document.getElementById('effectsDropdown');
        
        // Effect dropdown elements
        const shadowTypeSelect = document.getElementById('shadowType');
        const shadowColorInput = document.getElementById('shadowColor');
        const shadowColorWrapper = document.getElementById('shadowColorWrapper');
        const outlineTypeSelect = document.getElementById('outlineType');
        const outlineColorInput = document.getElementById('outlineColor');
        const outlineColorWrapper = document.getElementById('outlineColorWrapper');

        // Font family change
        if (fontFamilySelect) {
            fontFamilySelect.addEventListener('change', (e) => {
                if (this.selectedTextObject) {
                    this.selectedTextObject.set('fontFamily', e.target.value);
                    this.canvas.renderAll();
                    // Update sidebar brand controls
                    this.updateBrandControlsFromCanvas(this.selectedTextObject.id);
                }
            });
        }

        // Font size change (now number input instead of slider)
        if (fontSizeInput) {
            fontSizeInput.addEventListener('input', (e) => {
                if (this.selectedTextObject && e.target.value) {
                    const newSize = parseInt(e.target.value);
                    if (newSize >= 10 && newSize <= 80) {
                        this.selectedTextObject.set('fontSize', newSize);
                        this.canvas.renderAll();
                        this.updateToolbarPosition();
                        this.saveState();
                    }
                }
            });
        }

        // Text color change
        if (textColorInput) {
            textColorInput.addEventListener('input', (e) => {
                if (this.selectedTextObject) {
                    this.selectedTextObject.set('fill', e.target.value);
                    this.canvas.renderAll();
                    this.saveState();
                    // Update sidebar brand controls
                    this.updateBrandControlsFromCanvas(this.selectedTextObject.id);
                }
            });
        }

        // Bold toggle
        if (boldBtn) {
            boldBtn.addEventListener('click', (e) => {
                if (this.selectedTextObject) {
                    const currentWeight = this.selectedTextObject.fontWeight || 'normal';
                    const newWeight = currentWeight === 'bold' ? 'normal' : 'bold';
                    this.selectedTextObject.set('fontWeight', newWeight);
                    boldBtn.classList.toggle('active', newWeight === 'bold');
                    this.canvas.renderAll();
                    this.saveState();
                }
            });
        }

        // Italic toggle
        if (italicBtn) {
            italicBtn.addEventListener('click', (e) => {
                if (this.selectedTextObject) {
                    const currentStyle = this.selectedTextObject.fontStyle || 'normal';
                    const newStyle = currentStyle === 'italic' ? 'normal' : 'italic';
                    this.selectedTextObject.set('fontStyle', newStyle);
                    italicBtn.classList.toggle('active', newStyle === 'italic');
                    this.canvas.renderAll();
                    this.saveState();
                }
            });
        }

        // Underline toggle
        if (underlineBtn) {
            underlineBtn.addEventListener('click', (e) => {
                if (this.selectedTextObject) {
                    const currentUnderline = this.selectedTextObject.underline || false;
                    const newUnderline = !currentUnderline;
                    this.selectedTextObject.set('underline', newUnderline);
                    underlineBtn.classList.toggle('active', newUnderline);
                    this.canvas.renderAll();
                    this.saveState();
                }
            });
        }

        // Text alignment change
        if (textAlignSelect) {
            textAlignSelect.addEventListener('change', (e) => {
                if (this.selectedTextObject) {
                    this.selectedTextObject.set('textAlign', e.target.value);
                    this.canvas.renderAll();
                    this.saveState();
                }
            });
        }



        // Effects button toggle
        if (effectsBtn && effectsDropdown) {
            effectsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = effectsDropdown.classList.contains('show');
                if (isVisible) {
                    effectsDropdown.classList.remove('show');
                    effectsBtn.classList.remove('active');
                } else {
                    effectsDropdown.classList.add('show');
                    effectsBtn.classList.add('active');
                }
            });
        }

        // Shadow type select change
        if (shadowTypeSelect) {
            shadowTypeSelect.addEventListener('change', (e) => {
                if (!this.selectedTextObject) return;

                const shadowType = e.target.value;
                
                if (shadowType === 'none') {
                    this.selectedTextObject.set('shadow', null);
                    if (shadowColorWrapper) shadowColorWrapper.style.display = 'none';
                } else {
                    let blur, offsetX, offsetY;
                    switch (shadowType) {
                        case 'light':
                            blur = 2;
                            offsetX = 1;
                            offsetY = 1;
                            break;
                        case 'medium':
                            blur = 4;
                            offsetX = 2;
                            offsetY = 2;
                            break;
                        case 'heavy':
                            blur = 8;
                            offsetX = 4;
                            offsetY = 4;
                            break;
                        default:
                            blur = 4;
                            offsetX = 2;
                            offsetY = 2;
                    }
                    
                    const shadowColor = shadowColorInput ? shadowColorInput.value : '#000000';
                    this.selectedTextObject.set('shadow', {
                        color: shadowColor,
                        blur: blur,
                        offsetX: offsetX,
                        offsetY: offsetY
                    });
                    if (shadowColorWrapper) shadowColorWrapper.style.display = 'flex';
                }

                this.canvas.renderAll();
                this.saveState();
            });
        }

        // Outline type select change
        if (outlineTypeSelect) {
            outlineTypeSelect.addEventListener('change', (e) => {
                if (!this.selectedTextObject) return;

                const outlineType = e.target.value;
                
                if (outlineType === 'none') {
                    this.selectedTextObject.set('stroke', '');
                    this.selectedTextObject.set('strokeWidth', 0);
                    if (outlineColorWrapper) outlineColorWrapper.style.display = 'none';
                } else {
                    let strokeWidth;
                    switch (outlineType) {
                        case 'thin':
                            strokeWidth = 1;
                            break;
                        case 'medium':
                            strokeWidth = 2;
                            break;
                        case 'thick':
                            strokeWidth = 4;
                            break;
                        default:
                            strokeWidth = 2;
                    }
                    
                    const outlineColor = outlineColorInput ? outlineColorInput.value : '#ffffff';
                    this.selectedTextObject.set('stroke', outlineColor);
                    this.selectedTextObject.set('strokeWidth', strokeWidth);
                    if (outlineColorWrapper) outlineColorWrapper.style.display = 'flex';
                }

                this.canvas.renderAll();
                this.saveState();
            });
        }

        // Shadow color change
        if (shadowColorInput) {
            shadowColorInput.addEventListener('input', (e) => {
                if (this.selectedTextObject && this.selectedTextObject.shadow) {
                    this.selectedTextObject.shadow.color = e.target.value;
                    this.canvas.renderAll();
                    this.saveState();
                }
            });
        }

        // Outline color change
        if (outlineColorInput) {
            outlineColorInput.addEventListener('input', (e) => {
                if (this.selectedTextObject && this.selectedTextObject.stroke) {
                    this.selectedTextObject.set('stroke', e.target.value);
                    this.canvas.renderAll();
                    this.saveState();
                }
            });
        }

        // Close effects dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (effectsDropdown && effectsDropdown.classList.contains('show')) {
                const effectsWrapper = effectsDropdown.closest('.unified-effect-dropdown');
                if (!effectsWrapper || !effectsWrapper.contains(e.target)) {
                    effectsDropdown.classList.remove('show');
                    if (effectsBtn) effectsBtn.classList.remove('active');
                }
            }
        });
    }

    setupCtaToolbarEvents() {
        // Get CTA toolbar elements
        const fontFamilySelect = document.getElementById('ctaToolbarFontFamily');
        const fontSizeInput = document.getElementById('ctaToolbarFontSize');
        const textColorInput = document.getElementById('ctaToolbarTextColor');
        const buttonColorInput = document.getElementById('ctaToolbarButtonColor');

        // Font family change
        if (fontFamilySelect) {
            fontFamilySelect.addEventListener('change', (e) => {
                if (this.selectedCtaObject) {
                    const ctaText = this.selectedCtaObject.getObjects().find(obj => obj.id === 'cta');
                    if (ctaText) {
                        ctaText.set('fontFamily', e.target.value);
                        this.resizeCtaButtonToFitText(this.selectedCtaObject);
                        this.canvas.renderAll();
                        this.saveState();
                    }
                }
            });
        }

        // Font size change
        if (fontSizeInput) {
            fontSizeInput.addEventListener('input', (e) => {
                if (this.selectedCtaObject) {
                    const ctaText = this.selectedCtaObject.getObjects().find(obj => obj.id === 'cta');
                    if (ctaText) {
                        ctaText.set('fontSize', parseInt(e.target.value) || 18);
                        this.resizeCtaButtonToFitText(this.selectedCtaObject);
                        this.canvas.renderAll();
                        this.saveState();
                    }
                }
            });
        }

        // Text color change
        if (textColorInput) {
            textColorInput.addEventListener('input', (e) => {
                if (this.selectedCtaObject) {
                    const ctaText = this.selectedCtaObject.getObjects().find(obj => obj.id === 'cta');
                    if (ctaText) {
                        ctaText.set('fill', e.target.value);
                        this.canvas.renderAll();
                        this.saveState();
                    }
                }
            });
        }

        // Button color change
        if (buttonColorInput) {
            buttonColorInput.addEventListener('input', (e) => {
                if (this.selectedCtaObject) {
                    const ctaBackground = this.selectedCtaObject.getObjects().find(obj => obj.id === 'ctaBackground');
                    if (ctaBackground) {
                        ctaBackground.set('fill', e.target.value);
                        this.canvas.renderAll();
                        this.saveState();
                    }
                }
            });
        }
    }

    handleTextSelection(e) {
        const selectedObject = e.selected[0];
        
        if (selectedObject && (selectedObject.type === 'text' || selectedObject.type === 'textbox')) {
            this.selectedTextObject = selectedObject;
            this.showTextToolbar();
            this.updateToolbarValues();
            this.updateToolbarPosition();
        } else {
            this.hideTextToolbar();
        }
    }

    showTextToolbar() {
        this.textToolbar.classList.remove('hidden');
        this.makeToolbarAccessible(this.textToolbar);
    }

    hideTextToolbar() {
        this.textToolbar.classList.add('hidden');
        this.selectedTextObject = null;
    }

    showCtaToolbar() {
        this.ctaToolbar.classList.remove('hidden');
        this.makeToolbarAccessible(this.ctaToolbar);
    }

    hideCtaToolbar() {
        this.ctaToolbar.classList.add('hidden');
        this.selectedCtaObject = null;
    }

    updateCtaToolbarValues() {
        if (!this.selectedCtaObject) return;

        const ctaText = this.selectedCtaObject.getObjects().find(obj => obj.id === 'cta');
        const ctaBackground = this.selectedCtaObject.getObjects().find(obj => obj.id === 'ctaBackground');

        const fontFamilySelect = document.getElementById('ctaToolbarFontFamily');
        const fontSizeInput = document.getElementById('ctaToolbarFontSize');
        const textColorInput = document.getElementById('ctaToolbarTextColor');
        const buttonColorInput = document.getElementById('ctaToolbarButtonColor');

        if (ctaText && fontFamilySelect) {
            fontFamilySelect.value = ctaText.fontFamily || 'Source Sans Pro, sans-serif';
        }
        
        if (ctaText && fontSizeInput) {
            fontSizeInput.value = Math.round(ctaText.fontSize || 18);
        }
        
        if (ctaText && textColorInput) {
            textColorInput.value = ctaText.fill || '#ffffff';
        }
        
        if (ctaBackground && buttonColorInput) {
            buttonColorInput.value = ctaBackground.fill || '#0077B5';
        }
    }

    updateCtaToolbarPosition() {
        if (!this.selectedCtaObject) return;

        const canvasContainer = this.canvas.getElement().parentElement;
        const ctaRect = this.selectedCtaObject.getBoundingRect();
        const zoom = this.canvas.getZoom();
        
        // Position relative to canvas container
        const ctaX = (ctaRect.left + ctaRect.width / 2) * zoom;
        const ctaY = ctaRect.top * zoom - 10;

        // Ensure toolbar is positioned relative to canvas container
        this.ctaToolbar.style.position = 'absolute';
        this.ctaToolbar.style.left = `${ctaX - this.ctaToolbar.offsetWidth / 2}px`;
        this.ctaToolbar.style.top = `${ctaY - this.ctaToolbar.offsetHeight}px`;
        
        // Append to canvas container for proper positioning
        if (this.ctaToolbar.parentElement !== canvasContainer) {
            canvasContainer.appendChild(this.ctaToolbar);
        }
    }

    updateToolbarValues() {
        if (!this.selectedTextObject) return;

        const fontFamilySelect = document.getElementById('toolbarFontFamily');
        const fontSizeInput = document.getElementById('toolbarFontSize');
        const textColorInput = document.getElementById('toolbarTextColor');
        const boldBtn = document.getElementById('toolbarBold');
        const italicBtn = document.getElementById('toolbarItalic');
        const underlineBtn = document.getElementById('toolbarUnderline');
        const textAlignSelect = document.getElementById('toolbarTextAlign');
        
        // Get effect elements for new structure
        const shadowTypeSelect = document.getElementById('shadowType');
        const shadowColorInput = document.getElementById('shadowColor');
        const shadowColorWrapper = document.getElementById('shadowColorWrapper');
        const outlineTypeSelect = document.getElementById('outlineType');
        const outlineColorInput = document.getElementById('outlineColor');
        const outlineColorWrapper = document.getElementById('outlineColorWrapper');

        // Check if elements exist before setting values
        if (fontFamilySelect) {
            const currentFont = this.selectedTextObject.fontFamily || 'Source Sans Pro';
            fontFamilySelect.value = currentFont;
            
            // If the current font isn't in the dropdown options, add it temporarily
            if (!Array.from(fontFamilySelect.options).some(option => option.value === currentFont)) {
                const option = document.createElement('option');
                option.value = currentFont;
                if (option) {
                    option.textContent = currentFont;
                    fontFamilySelect.appendChild(option);
                    fontFamilySelect.value = currentFont;
                }
            }
        }
        
        if (fontSizeInput) {
            fontSizeInput.value = Math.round(this.selectedTextObject.fontSize || 24);
        }
        
        if (textColorInput) {
            textColorInput.value = this.selectedTextObject.fill || '#000000';
        }
        
        // Update formatting button states
        if (boldBtn) {
            const isBold = this.selectedTextObject.fontWeight === 'bold';
            boldBtn.classList.toggle('active', isBold);
        }
        
        if (italicBtn) {
            const isItalic = this.selectedTextObject.fontStyle === 'italic';
            italicBtn.classList.toggle('active', isItalic);
        }
        
        if (underlineBtn) {
            const isUnderline = this.selectedTextObject.underline === true;
            underlineBtn.classList.toggle('active', isUnderline);
        }
        
        // Update text alignment dropdown
        if (textAlignSelect) {
            const currentAlign = this.selectedTextObject.textAlign || 'left';
            textAlignSelect.value = currentAlign;
        }
        
        // Update shadow dropdown
        if (shadowTypeSelect) {
            if (this.selectedTextObject.shadow) {
                const blur = this.selectedTextObject.shadow.blur || 4;
                let shadowType = 'medium';
                
                if (blur <= 2) {
                    shadowType = 'light';
                } else if (blur >= 8) {
                    shadowType = 'heavy';
                } else {
                    shadowType = 'medium';
                }
                
                shadowTypeSelect.value = shadowType;
                if (shadowColorWrapper) shadowColorWrapper.style.display = 'block';
                if (shadowColorInput) {
                    shadowColorInput.value = this.selectedTextObject.shadow.color || '#000000';
                }
            } else {
                shadowTypeSelect.value = 'none';
                if (shadowColorWrapper) shadowColorWrapper.style.display = 'none';
            }
        }
        
        // Update outline dropdown
        if (outlineTypeSelect) {
            const hasStroke = this.selectedTextObject.stroke && this.selectedTextObject.strokeWidth > 0;
            
            if (!hasStroke) {
                outlineTypeSelect.value = 'none';
                if (outlineColorWrapper) outlineColorWrapper.style.display = 'none';
            } else {
                const strokeWidth = this.selectedTextObject.strokeWidth;
                let outlineType = 'medium';
                
                if (strokeWidth <= 1) {
                    outlineType = 'thin';
                } else if (strokeWidth >= 4) {
                    outlineType = 'thick';
                } else {
                    outlineType = 'medium';
                }
                
                outlineTypeSelect.value = outlineType;
                if (outlineColorWrapper) outlineColorWrapper.style.display = 'block';
                if (outlineColorInput) {
                    outlineColorInput.value = this.selectedTextObject.stroke || '#ffffff';
                }
            }
        }
    }

    updateToolbarPosition() {
        if (!this.selectedTextObject || this.textToolbar.classList.contains('hidden')) return;

        const canvasElement = this.canvas.getElement();
        const canvasRect = canvasElement.getBoundingClientRect();
        const objectBounds = this.selectedTextObject.getBoundingRect();
        
        // Calculate position relative to viewport
        const left = canvasRect.left + objectBounds.left + (objectBounds.width / 2) - (this.textToolbar.offsetWidth / 2);
        const top = canvasRect.top + objectBounds.top - this.textToolbar.offsetHeight - 10;
        
        // Ensure toolbar stays within viewport
        const maxLeft = window.innerWidth - this.textToolbar.offsetWidth - 10;
        const maxTop = window.innerHeight - this.textToolbar.offsetHeight - 10;
        
        this.textToolbar.style.left = Math.max(10, Math.min(left, maxLeft)) + 'px';
        this.textToolbar.style.top = Math.max(10, Math.min(top, maxTop)) + 'px';
    }

    debouncedSaveState() {
        // Debounce state saving to prevent excessive history entries
        clearTimeout(this.saveStateTimeout);
        this.saveStateTimeout = setTimeout(() => {
            this.saveState();
        }, 300);
    }

    saveState() {
        // Don't save state during template loading to prevent undo issues
        if (this.isLoadingTemplate) {
            return;
        }
        
        // Clear redo history when new action is performed
        if (this.historyStep < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyStep + 1);
        }
        
        // Add current state to history
        const state = JSON.stringify(this.canvas.toJSON(['id']));
        this.history.push(state);
        
        // Limit history size
        if (this.history.length > this.maxHistorySteps) {
            this.history = this.history.slice(-this.maxHistorySteps);
        }
        
        this.historyStep = this.history.length - 1;
        this.updateUndoRedoButtonStates();
    }

    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            const state = this.history[this.historyStep];
            
            // Temporarily disable event listeners to prevent saving state during undo
            this.canvas.off('object:added');
            this.canvas.off('object:removed');
            this.canvas.off('object:modified');
            
            this.canvas.loadFromJSON(state, () => {
                this.canvas.renderAll();
                // Re-enable event listeners
                this.setupCanvasEvents();
                this.updateUndoRedoButtonStates();
                this.updateObjectReferences();
            });
        }
    }

    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            const state = this.history[this.historyStep];
            
            // Temporarily disable event listeners to prevent saving state during redo
            this.canvas.off('object:added');
            this.canvas.off('object:removed');
            this.canvas.off('object:modified');
            
            this.canvas.loadFromJSON(state, () => {
                this.canvas.renderAll();
                // Re-enable event listeners
                this.setupCanvasEvents();
                this.updateUndoRedoButtonStates();
                this.updateObjectReferences();
            });
        }
    }

    updateUndoButtonState() {
        this.updateUndoRedoButtonStates();
    }

    updateUndoRedoButtonStates() {
        const undoButton = document.getElementById('undoCanvas');
        const redoButton = document.getElementById('redoCanvas');
        
        if (undoButton) {
            undoButton.disabled = this.historyStep <= 0;
        }
        
        if (redoButton) {
            redoButton.disabled = this.historyStep >= this.history.length - 1;
        }
    }

    updateObjectReferences() {
        // Update object references after undo
        const objects = this.canvas.getObjects();
        this.titleText = objects.find(obj => obj.id === 'title');
        this.subtitleText = objects.find(obj => obj.id === 'subtitle');
        this.ctaGroup = objects.find(obj => obj.id === 'ctaGroup');
        this.mainImage = objects.find(obj => obj.id === 'mainImage');
        this.logo = objects.find(obj => obj.id === 'logo');
    }
    
    initializeSliderFills() {
        const sliders = ['titleSize', 'subtitleSize', 'ctaSize'];
        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            if (slider) {
                this.updateSliderFill(slider);
            }
        });
    }
    
    captureCurrentStyling() {
        const styling = {
            backgroundColor: this.canvas.backgroundColor || '#ffffff',
            textElements: {},
            ctaElement: null
        };
        
        // Capture text element styling
        const objects = this.canvas.getObjects();
        objects.forEach(obj => {
            if (obj.id === 'title' || obj.id === 'subtitle') {
                styling.textElements[obj.id] = {
                    fontFamily: obj.fontFamily,
                    fontSize: obj.fontSize,
                    fill: obj.fill,
                    shadow: obj.shadow ? {
                        color: obj.shadow.color,
                        blur: obj.shadow.blur,
                        offsetX: obj.shadow.offsetX,
                        offsetY: obj.shadow.offsetY
                    } : null,
                    stroke: obj.stroke,
                    strokeWidth: obj.strokeWidth,
                    text: obj.text
                };
            } else if (obj.id === 'ctaGroup') {
                // Find the CTA text and background within the group
                const ctaText = obj.getObjects().find(item => item.id === 'cta');
                const ctaBackground = obj.getObjects().find(item => item.id === 'ctaBackground');
                
                if (ctaText && ctaBackground) {
                    styling.ctaElement = {
                        text: ctaText.text,
                        fontFamily: ctaText.fontFamily,
                        fontSize: ctaText.fontSize,
                        fill: ctaText.fill,
                        backgroundColor: ctaBackground.fill
                    };
                }
            }
        });
        
        return styling;
    }
    
    restoreCurrentStyling(styling) {
        if (!styling) return;
        
        // Restore background color
        this.canvas.setBackgroundColor(styling.backgroundColor, this.canvas.renderAll.bind(this.canvas));
        
        // Restore text element styling
        const objects = this.canvas.getObjects();
        objects.forEach(obj => {
            if (obj.id === 'title' || obj.id === 'subtitle') {
                const savedStyle = styling.textElements[obj.id];
                if (savedStyle) {
                    // Determine if we're in a split template (which uses white background)
                    const isSplitTemplate = this.currentTemplate === 'template4' || 
                                          this.currentTemplate === 'template5' || 
                                          this.currentTemplate === 'template6';
                    
                    // Only preserve fill color if it's been customized from defaults
                    const isDefaultWhiteText = savedStyle.fill === '#ffffff';
                    const isDefaultDarkText = savedStyle.fill === '#333333' || savedStyle.fill === '#666666';
                    
                    let fillColor = savedStyle.fill;
                    if (isSplitTemplate && isDefaultWhiteText) {
                        // Don't preserve white text on split templates, let template set dark color
                        fillColor = obj.fill; // Keep the template's default dark color
                    } else if (!isSplitTemplate && isDefaultDarkText) {
                        // Don't preserve dark text on full templates, let template set white color  
                        fillColor = obj.fill; // Keep the template's default white color
                    }
                    
                    obj.set({
                        fontFamily: savedStyle.fontFamily,
                        fontSize: savedStyle.fontSize,
                        fill: fillColor,
                        shadow: savedStyle.shadow,
                        stroke: savedStyle.stroke,
                        strokeWidth: savedStyle.strokeWidth
                    });
                    // Preserve custom text if it exists
                    if (savedStyle.text && savedStyle.text !== obj.text) {
                        obj.set('text', savedStyle.text);
                    }
                }
            } else if (obj.id === 'ctaGroup' && styling.ctaElement) {
                // Restore CTA styling
                const ctaText = obj.getObjects().find(item => item.id === 'cta');
                const ctaBackground = obj.getObjects().find(item => item.id === 'ctaBackground');
                
                if (ctaText) {
                    ctaText.set({
                        text: styling.ctaElement.text,
                        fontFamily: styling.ctaElement.fontFamily,
                        fontSize: styling.ctaElement.fontSize,
                        fill: styling.ctaElement.fill
                    });
                }
                
                if (ctaBackground) {
                    ctaBackground.set('fill', styling.ctaElement.backgroundColor);
                }
                
                // Resize CTA button to fit the text
                this.resizeCtaButtonToFitText(obj);
                
                // Update the group to reflect changes
                obj.addWithUpdate();
            }
        });
        
        this.canvas.renderAll();
    }
    
    resizeCtaButtonToFitText(ctaGroup) {
        if (!ctaGroup || ctaGroup.id !== 'ctaGroup') return;
        
        const ctaText = ctaGroup.getObjects().find(item => item.id === 'cta');
        const ctaBackground = ctaGroup.getObjects().find(item => item.id === 'ctaBackground');
        
        if (!ctaText || !ctaBackground) return;
        
        // Get text dimensions
        const textWidth = ctaText.width * ctaText.scaleX;
        const textHeight = ctaText.height * ctaText.scaleY;
        
        // Calculate button dimensions with padding
        const padding = 20;
        const minWidth = 120; // Minimum button width
        const buttonWidth = Math.max(textWidth + (padding * 2), minWidth);
        const buttonHeight = Math.max(textHeight + (padding * 1.2), 40);
        
        // Update background dimensions
        ctaBackground.set({
            width: buttonWidth,
            height: buttonHeight
        });
        
        // Center text within the button
        ctaText.set({
            left: 0,
            top: 0
        });
        
        // Update the group
        ctaGroup.addWithUpdate();
    }
    
    loadTemplate(templateName) {
        // Preserve current styling before clearing canvas
        const currentStyling = this.captureCurrentStyling();
        
        // Temporarily disable automatic state saving during template loading
        this.isLoadingTemplate = true;
        
        // Clear canvas completely to prevent formatting issues
        this.canvas.clear();
        this.canvas.setBackgroundColor('#ffffff', this.canvas.renderAll.bind(this.canvas));
        
        // Store current template name
        this.currentTemplate = templateName;
        
        // Clear object references to prevent stale references
        this.titleText = null;
        this.subtitleText = null;
        this.ctaGroup = null;
        this.ctaText = null;
        
        // Create template first to establish proper layout
        const templates = {
            template1: this.createTemplate1,
            template2: this.createTemplate2,
            template3: this.createTemplate3,
            template4: this.createTemplate4,
            template5: this.createTemplate5,
            template6: this.createTemplate6
        };
        
        if (templates[templateName]) {
            templates[templateName].call(this);
        }
        
        // Then add existing images with proper positioning
        if (this.mainImage) {
            this.addExistingImageToCanvas(this.mainImage, 'main');
        }
        if (this.logo) {
            this.addExistingImageToCanvas(this.logo, 'logo');
        }
        
        // Restore preserved styling after template creation
        this.restoreCurrentStyling(currentStyling);
        
        // Ensure proper final layering: background images at bottom, text on top
        this.enforceProperLayering();
        this.canvas.renderAll();
        
        // Re-enable state saving
        this.isLoadingTemplate = false;
    }
    
    enforceProperLayering() {
        // Get all objects
        const objects = this.canvas.getObjects();
        
        // Send main image and overlay to back
        objects.forEach(obj => {
            if (obj.id === 'mainImage') {
                this.canvas.sendToBack(obj);
            }
            if (obj.id === 'imageOverlay') {
                this.canvas.sendToBack(obj);
                // Make sure overlay is above main image but below everything else
                this.canvas.bringForward(obj);
            }
        });
        
        // Bring text elements to front
        objects.forEach(obj => {
            if (obj.id === 'title' || obj.id === 'subtitle' || obj.id === 'ctaGroup' || obj.id === 'cta') {
                this.canvas.bringToFront(obj);
            }
        });
        
        // Logo should be above images but can be below or above text (user's choice)
        objects.forEach(obj => {
            if (obj.id === 'logo') {
                // Bring logo above images but allow user to move it
                this.canvas.bringForward(obj);
            }
        });
        
        this.canvas.renderAll();
    }

    getLogoPositionForTemplate(templateName, canvasWidth, canvasHeight) {
        const margin = 30; // Consistent margin from edges
        switch(templateName) {
            case 'template1': // Classic Layout - top right with margin
                return {
                    left: canvasWidth - margin,
                    top: margin,
                    originX: 'right',
                    originY: 'top'
                };
            case 'template2': // Modern Grid - bottom right with margin (text is on left)
                return {
                    left: canvasWidth - margin,
                    top: canvasHeight - margin,
                    originX: 'right',
                    originY: 'bottom'
                };
            case 'template3': // Minimalist - top left with margin (centered text)
                return {
                    left: margin,
                    top: margin,
                    originX: 'left',
                    originY: 'top'
                };
            case 'template4': // Split Left - top right in text area
                return {
                    left: canvasWidth - margin,
                    top: margin,
                    originX: 'right',
                    originY: 'top'
                };
            case 'template5': // Split Right - top left in text area
                return {
                    left: margin,
                    top: margin,
                    originX: 'left',
                    originY: 'top'
                };
            case 'template6': // Split Top - bottom right in text area
                return {
                    left: canvasWidth - margin,
                    top: canvasHeight - margin,
                    originX: 'right',
                    originY: 'bottom'
                };
            default:
                return {
                    left: margin,
                    top: margin,
                    originX: 'left',
                    originY: 'top'
                };
        }
    }

    repositionLogoForTemplate(templateName) {
        const logo = this.canvas.getObjects().find(obj => obj.id === 'logo');
        if (logo) {
            const canvasWidth = this.canvas.getWidth();
            const canvasHeight = this.canvas.getHeight();
            const logoConfig = this.getLogoPositionForTemplate(templateName, canvasWidth, canvasHeight);
            
            logo.set({
                left: logoConfig.left,
                top: logoConfig.top,
                originX: logoConfig.originX,
                originY: logoConfig.originY,
                scaleX: 0.05,
                scaleY: 0.05
            });
            
            this.canvas.renderAll();
        }
    }

    updateAllTextFonts(fontFamily) {
        const textObjects = this.canvas.getObjects().filter(obj => 
            obj.type === 'text' || obj.type === 'textbox' || (obj.type === 'group' && obj._objects && obj._objects[1] && (obj._objects[1].type === 'text' || obj._objects[1].type === 'textbox'))
        );
        
        textObjects.forEach(obj => {
            if (obj.type === 'text' || obj.type === 'textbox') {
                obj.set('fontFamily', fontFamily);
            } else if (obj.type === 'group' && obj._objects && obj._objects[1]) {
                obj._objects[1].set('fontFamily', fontFamily);
                obj.addWithUpdate();
            }
        });
        
        this.canvas.renderAll();
        this.saveState();
    }

    getImageConfigForTemplate(templateName, canvasWidth, canvasHeight) {
        const isVertical = this.currentOrientation === 'vertical';
        
        switch(templateName) {
            case 'template1': // Classic - full canvas
            case 'template2': // Modern Grid - full canvas
            case 'template3': // Minimalist - full canvas
                return {
                    left: canvasWidth / 2,
                    top: canvasHeight / 2,
                    originX: 'center',
                    originY: 'center',
                    width: canvasWidth,
                    height: canvasHeight
                };
            case 'template4': // Split Right - Image right half, text left half
                if (isVertical) {
                    // Vertical: Image right half, text left half
                    return {
                        left: canvasWidth * 0.75,
                        top: canvasHeight / 2,
                        originX: 'center',
                        originY: 'center',
                        width: canvasWidth * 0.5,
                        height: canvasHeight
                    };
                } else {
                    // Horizontal: Image right half, text left half
                    return {
                        left: canvasWidth * 0.75,
                        top: canvasHeight / 2,
                        originX: 'center',
                        originY: 'center',
                        width: canvasWidth * 0.5,
                        height: canvasHeight
                    };
                }
            case 'template5': // Split Top - Image top half, text bottom half
                return {
                    left: canvasWidth / 2,
                    top: canvasHeight * 0.25,
                    originX: 'center',
                    originY: 'center',
                    width: canvasWidth,
                    height: canvasHeight * 0.5
                };
            case 'template6': // Split Bottom - Text top half, image bottom half
                return {
                    left: canvasWidth / 2,
                    top: canvasHeight * 0.75,
                    originX: 'center',
                    originY: 'center',
                    width: canvasWidth,
                    height: canvasHeight * 0.5
                };
            default:
                return {
                    left: canvasWidth / 2,
                    top: canvasHeight / 2,
                    originX: 'center',
                    originY: 'center',
                    width: canvasWidth,
                    height: canvasHeight
                };
        }
    }
    
    createTemplate1() {
        // Classic Layout - Image background with centered text
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        const isVertical = this.currentOrientation === 'vertical';
        
        // Title - white text over image, positioned for both orientations
        this.titleText = new fabric.Textbox(document.getElementById('titleText').value, {
            left: canvasWidth / 2,
            top: isVertical ? canvasHeight * 0.6 : canvasHeight * 0.65,
            fontSize: 40,
            fill: '#ffffff',
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            width: canvasWidth * 0.8,
            lockScalingFlip: true,
            noScaleCache: false,
            id: 'title'
        });
        
        // Subtitle - white text over image
        this.subtitleText = new fabric.Textbox(document.getElementById('subtitleText').value, {
            left: canvasWidth / 2,
            top: isVertical ? canvasHeight * 0.7 : canvasHeight * 0.75,
            fontSize: 24,
            fill: '#ffffff',
            fontFamily: 'Source Sans Pro, sans-serif',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            width: canvasWidth * 0.8,
            lockScalingFlip: true,
            noScaleCache: false,
            id: 'subtitle'
        });
        
        // CTA Button - Create rounded rectangle background
        const ctaButtonBg = new fabric.Rect({
            left: 0,
            top: 0,
            width: 120,
            height: 40,
            fill: '#0077B5',
            rx: 8,
            ry: 8,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            id: 'ctaBackground'
        });

        // CTA Button Text
        this.ctaText = new fabric.Text('Shop Now', {
            left: 0,
            top: 0,
            fontSize: 18,
            fill: '#ffffff',
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            id: 'cta'
        });

        // Group them together
        this.ctaGroup = new fabric.Group([ctaButtonBg, this.ctaText], {
            left: canvasWidth / 2,
            top: isVertical ? canvasHeight * 0.85 : canvasHeight * 0.88,
            originX: 'center',
            originY: 'center',
            id: 'ctaGroup'
        });
        
        this.canvas.add(this.titleText, this.subtitleText, this.ctaGroup);
        this.canvas.renderAll();
    }
    
    createTemplate2() {
        // Modern Grid - Split layout
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        
        // Title - white text over image
        this.titleText = new fabric.Textbox(document.getElementById('titleText')?.value || 'Your Title Here', {
            left: canvasWidth * 0.1,
            top: canvasHeight * 0.6,
            fontSize: 40,
            fill: '#ffffff',
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'left',
            originX: 'left',
            originY: 'center',
            width: canvasWidth * 0.8,
            lockScalingFlip: true,
            noScaleCache: false,
            id: 'title'
        });
        
        // Subtitle - white text over image
        this.subtitleText = new fabric.Textbox(document.getElementById('subtitleText')?.value || 'Your subtitle text', {
            left: canvasWidth * 0.1,
            top: canvasHeight * 0.7,
            fontSize: 24,
            fill: '#ffffff',
            fontFamily: 'Source Sans Pro, sans-serif',
            textAlign: 'left',
            originX: 'left',
            originY: 'center',
            width: canvasWidth * 0.8,
            lockScalingFlip: true,
            noScaleCache: false,
            id: 'subtitle'
        });
        
        // Calculate responsive button width based on text
        const ctaTextValue = document.getElementById('ctaText')?.value || 'Shop Now';
        
        // CTA Button - Create rounded rectangle background
        const ctaButtonBg = new fabric.Rect({
            left: 0,
            top: 0,
            width: 120,
            height: 40,
            fill: '#0077B5',
            rx: 8,
            ry: 8,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            id: 'ctaBackground'
        });

        // CTA Button Text
        this.ctaText = new fabric.Text('Shop Now', {
            left: 0,
            top: 0,
            fontSize: 18,
            fill: '#ffffff',
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            id: 'cta'
        });

        // Group them together
        this.ctaGroup = new fabric.Group([ctaButtonBg, this.ctaText], {
            left: canvasWidth * 0.1 + 60,
            top: canvasHeight * 0.85,
            originX: 'center',
            originY: 'center',
            id: 'ctaGroup'
        });
        
        this.canvas.add(this.titleText, this.subtitleText, this.ctaGroup);
        this.canvas.renderAll();
    }
    
    createTemplate3() {
        // Minimalist - Centered everything
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        
        // Title - white text over image
        this.titleText = new fabric.Textbox(document.getElementById('titleText')?.value || 'Your Title Here', {
            left: canvasWidth / 2,
            top: canvasHeight * 0.5,
            fontSize: 40,
            fill: '#ffffff',
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            width: canvasWidth * 0.8,
            lockScalingFlip: true,
            noScaleCache: false,
            id: 'title'
        });
        
        // Subtitle - white text over image
        this.subtitleText = new fabric.Textbox(document.getElementById('subtitleText')?.value || 'Your subtitle text', {
            left: canvasWidth / 2,
            top: canvasHeight * 0.65,
            fontSize: 24,
            fill: '#ffffff',
            fontFamily: 'Source Sans Pro, sans-serif',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            width: canvasWidth * 0.8,
            lockScalingFlip: true,
            noScaleCache: false,
            id: 'subtitle'
        });
        
        // Calculate responsive button width based on text
        const ctaTextValue = document.getElementById('ctaText')?.value || 'Shop Now';
        const tempText = new fabric.Text(ctaTextValue, {
            fontSize: 18,
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold'
        });
        const textWidth = tempText.width;
        const buttonWidth = Math.max(80, textWidth + 32); // 16px padding each side

        // CTA Button - Create rounded rectangle background
        const ctaButtonBg = new fabric.Rect({
            left: 0,
            top: 0,
            width: buttonWidth,
            height: 40,
            fill: '#0077B5',
            rx: 8,
            ry: 8,
            originX: 'center',
            originY: 'center',
            selectable: true,
            evented: true,
            id: 'ctaBackground'
        });

        // CTA Button Text
        this.ctaText = new fabric.Text(ctaTextValue, {
            left: 0,
            top: 0,
            fontSize: 18,
            fill: '#ffffff',
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            id: 'cta'
        });

        // Group them together
        this.ctaGroup = new fabric.Group([ctaButtonBg, this.ctaText], {
            left: canvasWidth / 2,
            top: canvasHeight * 0.8,
            originX: 'center',
            originY: 'center',
            id: 'ctaGroup'
        });
        
        this.canvas.add(this.titleText, this.subtitleText, this.ctaGroup);
        this.canvas.renderAll();
    }

    createTemplate4() {
        // Split Right - Image right half, text left half
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        const isVertical = this.currentOrientation === 'vertical';
        
        if (isVertical) {
            // Vertical: Image right half, text left half
            this.titleText = new fabric.Textbox(document.getElementById('titleText')?.value || 'Your Title Here', {
                left: canvasWidth * 0.25,
                top: canvasHeight * 0.4,
                fontSize: 40,
                fill: '#333333',
                fontFamily: 'Source Sans Pro, sans-serif',
                fontWeight: 'bold',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
                id: 'title',
                width: canvasWidth * 0.35,
                lockScalingFlip: true,
                noScaleCache: false,
                splitByGrapheme: false
            });
            
            this.subtitleText = new fabric.Textbox(document.getElementById('subtitleText')?.value || 'Your subtitle text', {
                left: canvasWidth * 0.25,
                top: canvasHeight * 0.55,
                fontSize: 24,
                fill: '#666666',
                fontFamily: 'Source Sans Pro, sans-serif',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
                id: 'subtitle',
                width: canvasWidth * 0.35,
                lockScalingFlip: true,
                noScaleCache: false,
                splitByGrapheme: false
            });
            
            const ctaButtonBg = new fabric.Rect({
                left: 0,
                top: 0,
                width: 120,
                height: 40,
                fill: '#0077B5',
                rx: 8,
                ry: 8,
                originX: 'center',
                originY: 'center',
                selectable: true,
                evented: true,
                id: 'ctaBackground'
            });

            this.ctaText = new fabric.Text('Shop Now', {
                left: 0,
                top: 0,
                fontSize: 18,
                fill: '#ffffff',
                fontFamily: 'Source Sans Pro, sans-serif',
                fontWeight: 'bold',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
                id: 'cta'
            });

            this.ctaGroup = new fabric.Group([ctaButtonBg, this.ctaText], {
                left: canvasWidth * 0.25,
                top: canvasHeight * 0.7,
                originX: 'center',
                originY: 'center',
                id: 'ctaGroup'
            });
        } else {
            // Horizontal: Image right half, text left half
            this.titleText = new fabric.Textbox(document.getElementById('titleText').value, {
                left: canvasWidth * 0.25,
                top: canvasHeight * 0.4,
                fontSize: 40,
                fill: '#333333',
                fontFamily: 'Source Sans Pro, sans-serif',
                fontWeight: 'bold',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
                id: 'title',
                width: canvasWidth * 0.35,
                lockScalingFlip: true,
                noScaleCache: false,
                splitByGrapheme: false
            });
            
            this.subtitleText = new fabric.Textbox(document.getElementById('subtitleText').value, {
                left: canvasWidth * 0.25,
                top: canvasHeight * 0.55,
                fontSize: 24,
                fill: '#666666',
                fontFamily: 'Source Sans Pro, sans-serif',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
                id: 'subtitle',
                width: canvasWidth * 0.35,
                lockScalingFlip: true,
                noScaleCache: false,
                splitByGrapheme: false
            });
            
            // Calculate responsive button width
            const ctaTextValue = document.getElementById('ctaText')?.value || 'Shop Now';
            const tempText = new fabric.Text(ctaTextValue, {
                fontSize: 18,
                fontFamily: 'Source Sans Pro, sans-serif',
                fontWeight: 'bold'
            });
            const buttonWidth = Math.max(80, tempText.width + 32);

            const ctaButtonBg = new fabric.Rect({
                left: 0,
                top: 0,
                width: buttonWidth,
                height: 40,
                fill: '#0077B5',
                rx: 8,
                ry: 8,
                originX: 'center',
                originY: 'center',
                selectable: true,
                evented: true,
                id: 'ctaBackground'
            });

            this.ctaText = new fabric.Text('Shop Now', {
                left: 0,
                top: 0,
                fontSize: 18,
                fill: '#ffffff',
                fontFamily: 'Source Sans Pro, sans-serif',
                fontWeight: 'bold',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
                id: 'cta'
            });

            this.ctaGroup = new fabric.Group([ctaButtonBg, this.ctaText], {
                left: canvasWidth * 0.25,
                top: canvasHeight * 0.7,
                originX: 'center',
                originY: 'center',
                id: 'ctaGroup'
            });
        }
        
        this.canvas.add(this.titleText, this.subtitleText, this.ctaGroup);
        this.canvas.renderAll();
    }

    createTemplate5() {
        // Split Top - Image covers top half, text on bottom half
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        
        // Title - positioned in bottom text area
        this.titleText = new fabric.Textbox(document.getElementById('titleText')?.value || 'Your Title Here', {
            left: canvasWidth / 2,
            top: canvasHeight * 0.65,
            fontSize: 40,
            fill: '#333333',
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            width: canvasWidth * 0.8,
            lockScalingFlip: true,
            noScaleCache: false,
            id: 'title'
        });
        
        // Subtitle - positioned in bottom text area
        this.subtitleText = new fabric.Textbox(document.getElementById('subtitleText')?.value || 'Your subtitle text', {
            left: canvasWidth / 2,
            top: canvasHeight * 0.78,
            fontSize: 24,
            fill: '#666666',
            fontFamily: 'Source Sans Pro, sans-serif',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            width: canvasWidth * 0.8,
            lockScalingFlip: true,
            noScaleCache: false,
            id: 'subtitle'
        });
        
        // Calculate responsive button width
        const ctaTextValue = document.getElementById('ctaText')?.value || 'Shop Now';
        const tempText = new fabric.Text(ctaTextValue, {
            fontSize: 18,
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold'
        });
        const buttonWidth = Math.max(80, tempText.width + 32);

        // CTA Button
        const ctaButtonBg = new fabric.Rect({
            left: 0,
            top: 0,
            width: buttonWidth,
            height: 40,
            fill: '#0077B5',
            rx: 8,
            ry: 8,
            originX: 'center',
            originY: 'center',
            selectable: true,
            evented: true,
            id: 'ctaBackground'
        });

        this.ctaText = new fabric.Text('Shop Now', {
            left: 0,
            top: 0,
            fontSize: 18,
            fill: '#ffffff',
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            id: 'cta'
        });

        this.ctaGroup = new fabric.Group([ctaButtonBg, this.ctaText], {
            left: canvasWidth / 2,
            top: canvasHeight * 0.9,
            originX: 'center',
            originY: 'center',
            id: 'ctaGroup'
        });
        
        this.canvas.add(this.titleText, this.subtitleText, this.ctaGroup);
        this.canvas.renderAll();
    }

    createTemplate6() {
        // Split Bottom - Text on top half, image covers bottom half
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        
        // Title - positioned in top text area
        this.titleText = new fabric.Textbox(document.getElementById('titleText')?.value || 'Your Title Here', {
            left: canvasWidth / 2,
            top: canvasHeight * 0.2,
            fontSize: 40,
            fill: '#333333',
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            width: canvasWidth * 0.8,
            lockScalingFlip: true,
            noScaleCache: false,
            id: 'title'
        });
        
        // Subtitle - positioned in top text area
        this.subtitleText = new fabric.Textbox(document.getElementById('subtitleText')?.value || 'Your subtitle text', {
            left: canvasWidth / 2,
            top: canvasHeight * 0.33,
            fontSize: 24,
            fill: '#666666',
            fontFamily: 'Source Sans Pro, sans-serif',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            width: canvasWidth * 0.8,
            lockScalingFlip: true,
            noScaleCache: false,
            id: 'subtitle'
        });
        
        // Calculate responsive button width
        const ctaTextValue = document.getElementById('ctaText')?.value || 'Shop Now';
        const tempText = new fabric.Text(ctaTextValue, {
            fontSize: 18,
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold'
        });
        const buttonWidth = Math.max(80, tempText.width + 32);

        // CTA Button - positioned in top text area
        const ctaButtonBg = new fabric.Rect({
            left: 0,
            top: 0,
            width: buttonWidth,
            height: 40,
            fill: '#0077B5',
            rx: 8,
            ry: 8,
            originX: 'center',
            originY: 'center',
            selectable: true,
            evented: true,
            id: 'ctaBackground'
        });

        this.ctaText = new fabric.Text('Shop Now', {
            left: 0,
            top: 0,
            fontSize: 18,
            fill: '#ffffff',
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            id: 'cta'
        });

        this.ctaGroup = new fabric.Group([ctaButtonBg, this.ctaText], {
            left: canvasWidth / 2,
            top: canvasHeight * 0.45,
            originX: 'center',
            originY: 'center',
            id: 'ctaGroup'
        });
        
        this.canvas.add(this.titleText, this.subtitleText, this.ctaGroup);
        this.canvas.renderAll();
    }
    
    addExistingImageToCanvas(existingImg, type) {
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        
        // Clone the existing image
        existingImg.clone((clonedImg) => {
            if (type === 'main') {
                // Get image dimensions and position based on current template
                const imageConfig = this.getImageConfigForTemplate(this.currentTemplate, canvasWidth, canvasHeight);
                
                // For split templates, scale to fill entire canvas then clip
                // For full templates, scale to fit designated area
                let scale;
                if (this.currentTemplate === 'template4' || this.currentTemplate === 'template5' || this.currentTemplate === 'template6') {
                    // Split templates: scale to fill entire canvas for proper coverage
                    const scaleToFitWidth = canvasWidth / clonedImg.width;
                    const scaleToFitHeight = canvasHeight / clonedImg.height;
                    scale = Math.max(scaleToFitWidth, scaleToFitHeight);
                } else {
                    // Full templates: scale to fit designated area
                    const scaleToFitWidth = imageConfig.width / clonedImg.width;
                    const scaleToFitHeight = imageConfig.height / clonedImg.height;
                    scale = Math.max(scaleToFitWidth, scaleToFitHeight);
                }
                
                // Position image based on template and orientation
                if (this.currentTemplate === 'template4' || this.currentTemplate === 'template5' || this.currentTemplate === 'template6') {
                    // Split templates: size and position to only occupy visible area
                    let targetWidth, targetHeight, targetLeft, targetTop;
                    
                    if (this.currentTemplate === 'template4') {
                        // Split Left: Image only on left half
                        targetWidth = canvasWidth * 0.5;
                        targetHeight = canvasHeight;
                        targetLeft = targetWidth / 2;
                        targetTop = canvasHeight / 2;
                    } else if (this.currentTemplate === 'template5') {
                        // Split Right: Image only on right half
                        targetWidth = canvasWidth * 0.5;
                        targetHeight = canvasHeight;
                        targetLeft = canvasWidth * 0.75;
                        targetTop = canvasHeight / 2;
                    } else if (this.currentTemplate === 'template6') {
                        // Split Top: Image only on top half
                        targetWidth = canvasWidth;
                        targetHeight = canvasHeight * 0.5;
                        targetLeft = canvasWidth / 2;
                        targetTop = targetHeight / 2;
                    }
                    
                    // Recalculate scale to fill the target area
                    const scaleToFitWidth = targetWidth / clonedImg.width;
                    const scaleToFitHeight = targetHeight / clonedImg.height;
                    const splitScale = Math.max(scaleToFitWidth, scaleToFitHeight);
                    
                    clonedImg.set({
                        left: targetLeft,
                        top: targetTop,
                        originX: 'center',
                        originY: 'center',
                        scaleX: splitScale,
                        scaleY: splitScale,
                        id: 'mainImage'
                    });
                } else {
                    // Full templates: position in designated area
                    clonedImg.set({
                        left: imageConfig.left,
                        top: imageConfig.top,
                        originX: imageConfig.originX,
                        originY: imageConfig.originY,
                        scaleX: scale,
                        scaleY: scale,
                        id: 'mainImage'
                    });
                }

                // Add clipping for split templates, remove for full templates
                if (this.currentTemplate === 'template4') {
                    // Split Left: Clip to left half
                    clonedImg.clipPath = new fabric.Rect({
                        left: 0, top: 0, width: canvasWidth * 0.5, height: canvasHeight, absolutePositioned: true
                    });
                } else if (this.currentTemplate === 'template5') {
                    // Split Right: Clip to right half
                    clonedImg.clipPath = new fabric.Rect({
                        left: canvasWidth * 0.5, top: 0, width: canvasWidth * 0.5, height: canvasHeight, absolutePositioned: true
                    });
                } else if (this.currentTemplate === 'template6') {
                    // Split Top: Clip to top half
                    clonedImg.clipPath = new fabric.Rect({
                        left: 0, top: 0, width: canvasWidth, height: canvasHeight * 0.5, absolutePositioned: true
                    });
                } else {
                    // Full templates: Remove any existing clipping
                    clonedImg.clipPath = null;
                }
                
                // Remove any existing main image first
                const existingMain = this.canvas.getObjects().find(obj => obj.id === 'mainImage');
                if (existingMain) {
                    this.canvas.remove(existingMain);
                }
                
                // Add main image
                this.canvas.add(clonedImg);
                this.canvas.sendToBack(clonedImg);
                
                this.canvas.sendToBack(clonedImg);
                
            } else if (type === 'logo') {
                // Remove any existing logo first
                const existingLogo = this.canvas.getObjects().find(obj => obj.id === 'logo');
                if (existingLogo) {
                    this.canvas.remove(existingLogo);
                }
                
                // Position logo based on current template
                const currentTemplate = this.currentTemplate || 'template1';
                let logoConfig = this.getLogoPositionForTemplate(currentTemplate, canvasWidth, canvasHeight);
                
                clonedImg.set({
                    left: logoConfig.left,
                    top: logoConfig.top,
                    originX: logoConfig.originX,
                    originY: logoConfig.originY,
                    scaleX: 0.05,
                    scaleY: 0.05,
                    id: 'logo'
                });
                
                this.canvas.add(clonedImg);
                // Logo should be above main image but below text
                const mainImage = this.canvas.getObjects().find(obj => obj.id === 'mainImage');
                if (mainImage) {
                    this.canvas.bringForward(clonedImg);
                }
            }
            
            this.canvas.renderAll();
        });
    }
    
    handleImageUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('file', file);
        
        fetch('/upload-image', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.addImageToCanvas(data.data_url, type);
            } else {
                alert('Upload failed: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        });
    }
    
    addImageToCanvas(dataUrl, type) {
        fabric.Image.fromURL(dataUrl, (img) => {
            const canvasWidth = this.canvas.getWidth();
            const canvasHeight = this.canvas.getHeight();
            
            if (type === 'main') {
                // Get image dimensions and position based on current template
                const imageConfig = this.getImageConfigForTemplate(this.currentTemplate, canvasWidth, canvasHeight);
                
                // For split templates, scale to fill entire canvas then clip
                // For full templates, scale to fit designated area
                let scale;
                if (this.currentTemplate === 'template4' || this.currentTemplate === 'template5' || this.currentTemplate === 'template6') {
                    // Split templates: scale to fill entire canvas for proper coverage
                    const scaleToFitWidth = canvasWidth / img.width;
                    const scaleToFitHeight = canvasHeight / img.height;
                    scale = Math.max(scaleToFitWidth, scaleToFitHeight);
                } else {
                    // Full templates: scale to fit designated area
                    const scaleToFitWidth = imageConfig.width / img.width;
                    const scaleToFitHeight = imageConfig.height / img.height;
                    scale = Math.max(scaleToFitWidth, scaleToFitHeight);
                }
                
                // Position image based on template and orientation
                if (this.currentTemplate === 'template4' || this.currentTemplate === 'template5' || this.currentTemplate === 'template6') {
                    // Split templates: size and position to only occupy visible area
                    let targetWidth, targetHeight, targetLeft, targetTop;
                    
                    if (this.currentTemplate === 'template4') {
                        // Split Left: Image only on left half
                        targetWidth = canvasWidth * 0.5;
                        targetHeight = canvasHeight;
                        targetLeft = targetWidth / 2;
                        targetTop = canvasHeight / 2;
                    } else if (this.currentTemplate === 'template5') {
                        // Split Right: Image only on right half
                        targetWidth = canvasWidth * 0.5;
                        targetHeight = canvasHeight;
                        targetLeft = canvasWidth * 0.75;
                        targetTop = canvasHeight / 2;
                    } else if (this.currentTemplate === 'template6') {
                        // Split Top: Image only on top half
                        targetWidth = canvasWidth;
                        targetHeight = canvasHeight * 0.5;
                        targetLeft = canvasWidth / 2;
                        targetTop = targetHeight / 2;
                    }
                    
                    // Recalculate scale to fill the target area
                    const scaleToFitWidth = targetWidth / img.width;
                    const scaleToFitHeight = targetHeight / img.height;
                    const splitScale = Math.max(scaleToFitWidth, scaleToFitHeight);
                    
                    img.set({
                        left: targetLeft,
                        top: targetTop,
                        originX: 'center',
                        originY: 'center',
                        scaleX: splitScale,
                        scaleY: splitScale,
                        id: 'mainImage'
                    });
                } else {
                    // Full templates: position in designated area
                    img.set({
                        left: imageConfig.left,
                        top: imageConfig.top,
                        originX: imageConfig.originX,
                        originY: imageConfig.originY,
                        scaleX: scale,
                        scaleY: scale,
                        id: 'mainImage'
                    });
                }

                // Add clipping for split templates, remove for full templates
                if (this.currentTemplate === 'template4') {
                    // Split Left: Clip to left half
                    img.clipPath = new fabric.Rect({
                        left: 0, top: 0, width: canvasWidth * 0.5, height: canvasHeight, absolutePositioned: true
                    });
                } else if (this.currentTemplate === 'template5') {
                    // Split Right: Clip to right half
                    img.clipPath = new fabric.Rect({
                        left: canvasWidth * 0.5, top: 0, width: canvasWidth * 0.5, height: canvasHeight, absolutePositioned: true
                    });
                } else if (this.currentTemplate === 'template6') {
                    // Split Top: Clip to top half
                    img.clipPath = new fabric.Rect({
                        left: 0, top: 0, width: canvasWidth, height: canvasHeight * 0.5, absolutePositioned: true
                    });
                } else {
                    // Full templates: Remove any existing clipping
                    img.clipPath = null;
                }
                
                // Remove existing main image
                const existingMain = this.canvas.getObjects().find(obj => obj.id === 'mainImage');
                if (existingMain) {
                    this.canvas.remove(existingMain);
                }
                
                this.mainImage = img;
                
                // Add image and send to back so text appears in front
                this.canvas.add(img);
                this.canvas.sendToBack(img);
                
            } else if (type === 'logo') {
                // Determine logo position based on current template
                const currentTemplate = this.currentTemplate || 'template1';
                let logoConfig = this.getLogoPositionForTemplate(currentTemplate, canvasWidth, canvasHeight);
                
                img.set({
                    left: logoConfig.left,
                    top: logoConfig.top,
                    originX: logoConfig.originX,
                    originY: logoConfig.originY,
                    scaleX: 0.05,
                    scaleY: 0.05,
                    id: 'logo'
                });
                
                // Remove existing logo
                const existingLogo = this.canvas.getObjects().find(obj => obj.id === 'logo');
                if (existingLogo) {
                    this.canvas.remove(existingLogo);
                }
                
                this.logo = img;
                
                // Add logo and keep it in front of main image but behind text
                this.canvas.add(img);
                if (this.mainImage) {
                    this.canvas.bringForward(img);
                }
            }
            
            this.canvas.renderAll();
        });
    }
    
    updateText(textType, value) {
        let textObj = null;
        
        switch(textType) {
            case 'title':
                textObj = this.titleText;
                break;
            case 'subtitle':
                textObj = this.subtitleText;
                break;
            case 'cta':
                // For CTA, we need to update the text within the group
                if (this.ctaGroup && this.ctaGroup._objects && this.ctaGroup._objects[1]) {
                    this.ctaGroup._objects[1].set('text', value);
                    this.ctaGroup.addWithUpdate();
                    // Resize button to fit new text
                    this.updateCtaButtonSize();
                    this.canvas.renderAll();
                    this.saveState();
                    return;
                }
                textObj = this.ctaText;
                break;
        }
        
        if (textObj) {
            if (textObj.type === 'textbox') {
                textObj.set('text', value);
                // Force textbox to recalculate wrapping
                textObj._forceClearCache = true;
                textObj.initDimensions();
            } else {
                textObj.set('text', value);
            }
            this.canvas.renderAll();
            this.saveState();
        }
    }
    
    updateTextStyle(textType, property, value) {
        let textObj = null;
        
        switch(textType) {
            case 'title':
                textObj = this.titleText;
                break;
            case 'subtitle':
                textObj = this.subtitleText;
                break;
            case 'cta':
                // For CTA, we need to update the text within the group
                if (this.ctaGroup && this.ctaGroup._objects && this.ctaGroup._objects[1]) {
                    this.ctaGroup._objects[1].set(property, value);
                    this.ctaGroup.addWithUpdate();
                    this.canvas.renderAll();
                    this.saveState();
                    return;
                }
                textObj = this.ctaText;
                break;
        }
        
        if (textObj) {
            textObj.set(property, value);
            this.canvas.renderAll();
            this.saveState();
        }
    }
    
    updateSliderFill(slider) {
        const min = parseFloat(slider.min) || 0;
        const max = parseFloat(slider.max) || 100;
        const value = parseFloat(slider.value) || 0;
        const percentage = ((value - min) / (max - min)) * 100;
        
        slider.style.setProperty('--fill-percent', `${percentage}%`);
    }
    
    exportImage(format) {
        const dataURL = this.canvas.toDataURL({
            format: format === 'jpg' ? 'jpeg' : 'png',
            quality: 0.95,
            multiplier: 2 // Higher resolution
        });
        
        fetch('/export-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageData: dataURL,
                format: format
            })
        })
        .then(response => {
            if (response.ok) {
                return response.blob();
            } else {
                throw new Error('Export failed');
            }
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `template_ad.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Export error:', error);
            alert('Export failed. Please try again.');
        });
    }
    
    exportPdf() {
        const dataURL = this.canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2
        });
        
        fetch('/export-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageData: dataURL
            })
        })
        .then(response => {
            if (response.ok) {
                return response.blob();
            } else {
                throw new Error('PDF export failed');
            }
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'template_ad.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('PDF export error:', error);
            alert('PDF export failed. Please try again.');
        });
    }
    
    resetCanvas() {
        try {
            // Reset form values to defaults - only access elements that exist
            const titleText = document.getElementById('titleText');
            const subtitleText = document.getElementById('subtitleText');
            const ctaText = document.getElementById('ctaText');
            const ctaEnabled = document.getElementById('ctaEnabled');
            const mainImageUpload = document.getElementById('mainImageUpload');
            const logoUpload = document.getElementById('logoUpload');
            
            if (titleText) titleText.value = 'Your Amazing Product';
            if (subtitleText) subtitleText.value = 'Premium quality at affordable prices';
            if (ctaText) ctaText.value = 'Shop Now';
            if (ctaEnabled) ctaEnabled.checked = true;
            
            // Clear file inputs
            if (mainImageUpload) mainImageUpload.value = '';
            if (logoUpload) logoUpload.value = '';
            
            // Clear canvas completely
            this.canvas.clear();
            this.canvas.setBackgroundColor('#ffffff', this.canvas.renderAll.bind(this.canvas));
            
            // Reset image references
            this.mainImage = null;
            this.logo = null;
            
            // Preserve current template and orientation
            const currentTemplate = this.currentTemplate;
            const currentOrientation = this.currentOrientation;
            
            // Set canvas dimensions for current orientation
            this.setCanvasDimensions();
            
            // Reload current template with default values
            this.loadTemplate(currentTemplate);
            
            // Load default images after template is loaded
            setTimeout(() => {
                this.loadDefaultImage();
            }, 100);
            
            // Hide any open toolbars
            this.hideTextToolbar();
            this.hideCtaToolbar();
            this.hideBackgroundToolbar();
            
            // Clear history and save the reset state
            this.history = [];
            this.historyStep = -1;
            this.saveState();
            
            // Update focusable objects for keyboard navigation
            this.updateFocusableObjects();
            
            console.log('Canvas reset to default state');
        } catch (error) {
            console.error('Error during reset:', error);
            // Even if there's an error, try to clear the canvas
            this.canvas.clear();
            this.canvas.setBackgroundColor('#ffffff', this.canvas.renderAll.bind(this.canvas));
            this.loadTemplate('template1');
        }
    }
    
    setupZoomEvents() {
        // Only button-based zoom controls - no mouse wheel zoom
    }

    // Zoom functionality
    zoomIn() {
        if (this.zoomLevel < this.maxZoom) {
            this.zoomLevel = Math.min(this.maxZoom, this.zoomLevel + this.zoomStep);
            this.applyZoom();
        }
    }
    
    zoomOut() {
        if (this.zoomLevel > this.minZoom) {
            this.zoomLevel = Math.max(this.minZoom, this.zoomLevel - this.zoomStep);
            this.applyZoom();
        }
    }
    
    zoomToFit() {
        const container = document.querySelector('.canvas-container-centered');
        const containerWidth = container.clientWidth - 40; // Account for padding
        const containerHeight = container.clientHeight - 40;
        
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        
        const scaleX = containerWidth / canvasWidth;
        const scaleY = containerHeight / canvasHeight;
        
        this.zoomLevel = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
        this.applyZoom();
    }
    
    applyZoom() {
        const canvasWrapper = document.querySelector('.canvas-wrapper-zoom');
        canvasWrapper.style.transform = `scale(${this.zoomLevel})`;
        
        // Update zoom level display
        const zoomLevelElement = document.getElementById('zoomLevel');
        if (zoomLevelElement) {
            zoomLevelElement.textContent = Math.round(this.zoomLevel * 100) + '%';
        }
        
        // Update zoom button states
        const zoomInBtn = document.getElementById('zoomIn');
        const zoomOutBtn = document.getElementById('zoomOut');
        if (zoomInBtn) zoomInBtn.disabled = this.zoomLevel >= this.maxZoom;
        if (zoomOutBtn) zoomOutBtn.disabled = this.zoomLevel <= this.minZoom;
    }

    repositionElementsForOrientation() {
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        const objects = this.canvas.getObjects();

        objects.forEach(obj => {
            if (obj.id === 'title' || obj.id === 'subtitle' || obj.id === 'ctaGroup') {
                this.repositionTextElementForOrientation(obj, canvasWidth, canvasHeight);
            }
        });
    }

    repositionTextElementForOrientation(textObj, canvasWidth, canvasHeight) {
        const templateName = this.currentTemplate;
        const isVertical = this.currentOrientation === 'vertical';
        const isSquare = this.currentOrientation === 'square';

        // Get new positioning based on template and orientation
        if (templateName === 'template4') {
            if (isVertical) {
                // Vertical: text on bottom half
                if (textObj.id === 'title') {
                    textObj.set({ left: canvasWidth / 2, top: canvasHeight * 0.65 });
                } else if (textObj.id === 'subtitle') {
                    textObj.set({ left: canvasWidth / 2, top: canvasHeight * 0.75 });
                } else if (textObj.id === 'ctaGroup') {
                    textObj.set({ left: canvasWidth / 2, top: canvasHeight * 0.88 });
                }
            } else if (isSquare) {
                // Square: text on bottom half
                if (textObj.id === 'title') {
                    textObj.set({ left: canvasWidth / 2, top: canvasHeight * 0.7 });
                } else if (textObj.id === 'subtitle') {
                    textObj.set({ left: canvasWidth / 2, top: canvasHeight * 0.8 });
                } else if (textObj.id === 'ctaGroup') {
                    textObj.set({ left: canvasWidth / 2, top: canvasHeight * 0.9 });
                }
            } else {
                // Horizontal: text on right half
                if (textObj.id === 'title') {
                    textObj.set({ left: canvasWidth * 0.75, top: canvasHeight * 0.4 });
                } else if (textObj.id === 'subtitle') {
                    textObj.set({ left: canvasWidth * 0.75, top: canvasHeight * 0.55 });
                } else if (textObj.id === 'ctaGroup') {
                    textObj.set({ left: canvasWidth * 0.75, top: canvasHeight * 0.7 });
                }
            }
        } else if (templateName === 'template5') {
            if (isVertical) {
                // Vertical: text on top half
                if (textObj.id === 'title') {
                    textObj.set({ left: canvasWidth / 2, top: canvasHeight * 0.25 });
                } else if (textObj.id === 'subtitle') {
                    textObj.set({ left: canvasWidth / 2, top: canvasHeight * 0.35 });
                } else if (textObj.id === 'ctaGroup') {
                    textObj.set({ left: canvasWidth / 2, top: canvasHeight * 0.45 });
                }
            } else if (isSquare) {
                // Square: text on top half
                if (textObj.id === 'title') {
                    textObj.set({ left: canvasWidth / 2, top: canvasHeight * 0.25 });
                } else if (textObj.id === 'subtitle') {
                    textObj.set({ left: canvasWidth / 2, top: canvasHeight * 0.35 });
                } else if (textObj.id === 'ctaGroup') {
                    textObj.set({ left: canvasWidth / 2, top: canvasHeight * 0.45 });
                }
            } else {
                // Horizontal: text on left half
                if (textObj.id === 'title') {
                    textObj.set({ left: canvasWidth * 0.25, top: canvasHeight * 0.4 });
                } else if (textObj.id === 'subtitle') {
                    textObj.set({ left: canvasWidth * 0.25, top: canvasHeight * 0.55 });
                } else if (textObj.id === 'ctaGroup') {
                    textObj.set({ left: canvasWidth * 0.25, top: canvasHeight * 0.7 });
                }
            }
        } else {
            // Full coverage templates - center positioning
            if (textObj.id === 'title') {
                textObj.set({ left: canvasWidth / 2, top: canvasHeight * 0.7 });
            } else if (textObj.id === 'subtitle') {
                textObj.set({ left: canvasWidth / 2, top: canvasHeight * 0.8 });
            } else if (textObj.id === 'ctaGroup') {
                textObj.set({ left: canvasWidth / 2, top: canvasHeight * 0.9 });
            }
        }
    }

    repositionImageForOrientation(imageObj) {
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        const imageConfig = this.getImageConfigForTemplate(this.currentTemplate, canvasWidth, canvasHeight);

        // Update image positioning and sizing for split templates
        if (this.currentTemplate === 'template4' || this.currentTemplate === 'template5' || this.currentTemplate === 'template6') {
            // Split templates: resize and position image to only occupy visible area
            let targetWidth, targetHeight, targetLeft, targetTop;
            
            if (this.currentTemplate === 'template4') {
                // Split Left: Image only on left half
                targetWidth = canvasWidth * 0.5;
                targetHeight = canvasHeight;
                targetLeft = targetWidth / 2;
                targetTop = canvasHeight / 2;
            } else if (this.currentTemplate === 'template5') {
                // Split Right: Image only on right half
                targetWidth = canvasWidth * 0.5;
                targetHeight = canvasHeight;
                targetLeft = canvasWidth * 0.75; // Center of right half
                targetTop = canvasHeight / 2;
            } else if (this.currentTemplate === 'template6') {
                // Split Top: Image only on top half
                targetWidth = canvasWidth;
                targetHeight = canvasHeight * 0.5;
                targetLeft = canvasWidth / 2;
                targetTop = targetHeight / 2;
            }
            
            // Scale image to fill the target area completely
            const scaleToFitWidth = targetWidth / imageObj.width;
            const scaleToFitHeight = targetHeight / imageObj.height;
            const scale = Math.max(scaleToFitWidth, scaleToFitHeight);

            imageObj.set({
                left: targetLeft,
                top: targetTop,
                originX: 'center',
                originY: 'center',
                scaleX: scale,
                scaleY: scale
            });
            
            // Add clipping to contain image within its designated area
            if (this.currentTemplate === 'template4') {
                // Split Left: Clip to left half
                imageObj.clipPath = new fabric.Rect({
                    left: 0, top: 0, width: canvasWidth * 0.5, height: canvasHeight, absolutePositioned: true
                });
            } else if (this.currentTemplate === 'template5') {
                // Split Right: Clip to right half
                imageObj.clipPath = new fabric.Rect({
                    left: canvasWidth * 0.5, top: 0, width: canvasWidth * 0.5, height: canvasHeight, absolutePositioned: true
                });
            } else if (this.currentTemplate === 'template6') {
                // Split Top: Clip to top half
                imageObj.clipPath = new fabric.Rect({
                    left: 0, top: 0, width: canvasWidth, height: canvasHeight * 0.5, absolutePositioned: true
                });
            }
        } else {
            // Full coverage templates
            const scaleToFitWidth = canvasWidth / imageObj.width;
            const scaleToFitHeight = canvasHeight / imageObj.height;
            const scale = Math.max(scaleToFitWidth, scaleToFitHeight);

            imageObj.set({
                left: canvasWidth / 2,
                top: canvasHeight / 2,
                originX: 'center',
                originY: 'center',
                scaleX: scale,
                scaleY: scale
            });
            
            // Remove clipping for full coverage
            imageObj.clipPath = null;
        }
    }

    // CTA Button methods
    updateCtaBackgroundColor(color) {
        if (this.ctaGroup) {
            const objects = this.ctaGroup.getObjects();
            const background = objects.find(obj => obj.id === 'ctaBackground');
            if (background) {
                background.set('fill', color);
                this.canvas.renderAll();
                this.saveState();
            }
        }
    }

    updateCtaButtonSize() {
        if (this.ctaGroup && this.ctaText) {
            const objects = this.ctaGroup.getObjects();
            const background = objects.find(obj => obj.id === 'ctaBackground');
            
            if (background && this.ctaText) {
                // Calculate responsive width based on text
                const textWidth = this.ctaText.width * this.ctaText.scaleX;
                const padding = 32; // 16px padding on each side
                const minWidth = 80;
                const newWidth = Math.max(minWidth, textWidth + padding);
                
                // Update background size
                background.set({
                    width: newWidth,
                    height: Math.max(40, this.ctaText.height * this.ctaText.scaleY + 16)
                });
                
                // Ensure text remains centered in the background
                this.ctaText.set({
                    left: 0,
                    top: 0
                });
                
                this.canvas.renderAll();
                this.saveState();
            }
        }
    }

    // Export dropdown methods
    toggleExportDropdown() {
        const dropdown = document.getElementById('exportDropdown');
        const mainBtn = document.getElementById('exportMainBtn');
        
        if (dropdown.classList.contains('hidden')) {
            this.showExportDropdown();
        } else {
            this.hideExportDropdown();
        }
    }

    showExportDropdown() {
        const dropdown = document.getElementById('exportDropdown');
        const mainBtn = document.getElementById('exportMainBtn');
        
        dropdown.classList.remove('hidden');
        mainBtn.classList.add('active');
    }

    hideExportDropdown() {
        const dropdown = document.getElementById('exportDropdown');
        const mainBtn = document.getElementById('exportMainBtn');
        
        dropdown.classList.add('hidden');
        mainBtn.classList.remove('active');
    }

    showBackgroundToolbar(pointer) {
        if (!this.backgroundToolbar) return;
        
        this.backgroundToolbar.classList.remove('hidden');
        this.makeToolbarAccessible(this.backgroundToolbar);
        
        // Position the toolbar near the click point
        const canvasContainer = this.canvas.getElement().parentElement;
        const rect = canvasContainer.getBoundingClientRect();
        
        let left = pointer.x + rect.left + 20;
        let top = pointer.y + rect.top - 50;
        
        // Keep toolbar within viewport
        const toolbarWidth = 280;
        const toolbarHeight = 60;
        
        if (left + toolbarWidth > window.innerWidth) {
            left = window.innerWidth - toolbarWidth - 20;
        }
        if (top < 20) {
            top = 20;
        }
        if (top + toolbarHeight > window.innerHeight) {
            top = window.innerHeight - toolbarHeight - 20;
        }
        
        this.backgroundToolbar.style.left = left + 'px';
        this.backgroundToolbar.style.top = top + 'px';
        
        // Update color picker to current background color
        const backgroundColorPicker = document.getElementById('backgroundColorPicker');
        if (backgroundColorPicker) {
            backgroundColorPicker.value = this.canvas.backgroundColor || '#ffffff';
        }
    }

    hideBackgroundToolbar() {
        if (this.backgroundToolbar) {
            this.backgroundToolbar.classList.add('hidden');
        }
    }

    setupBackgroundToolbarEvents() {
        const backgroundColorPicker = document.getElementById('backgroundColorPicker');
        const resetBackgroundButton = document.getElementById('resetBackgroundColor');

        // Background color change
        if (backgroundColorPicker) {
            backgroundColorPicker.addEventListener('input', (e) => {
                this.canvas.setBackgroundColor(e.target.value, this.canvas.renderAll.bind(this.canvas));
                this.saveState();
            });
        }

        // Reset background color to white
        if (resetBackgroundButton) {
            resetBackgroundButton.addEventListener('click', () => {
                this.canvas.setBackgroundColor('#ffffff', this.canvas.renderAll.bind(this.canvas));
                if (backgroundColorPicker) {
                    backgroundColorPicker.value = '#ffffff';
                }
                this.saveState();
            });
        }
    }

    // Smart guides functionality
    handleObjectMoving(e) {
        const activeObject = e.target;
        if (!activeObject || activeObject.isGuideline) return;

        this.clearGuidelines();
        
        const activeObjectBounds = this.getObjectBounds(activeObject);
        const guides = this.findAlignmentGuides(activeObject, activeObjectBounds);
        
        if (guides.length > 0) {
            this.drawGuidelines(guides);
            // Removed automatic snapping - guides are now visual only
        }
    }

    getObjectBounds(obj) {
        const bounds = obj.getBoundingRect();
        return {
            left: bounds.left,
            top: bounds.top,
            right: bounds.left + bounds.width,
            bottom: bounds.top + bounds.height,
            centerX: bounds.left + bounds.width / 2,
            centerY: bounds.top + bounds.height / 2,
            width: bounds.width,
            height: bounds.height
        };
    }

    findAlignmentGuides(activeObject, activeBounds) {
        const guides = [];
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        
        // Canvas center guides
        const canvasCenterX = canvasWidth / 2;
        const canvasCenterY = canvasHeight / 2;
        
        if (Math.abs(activeBounds.centerX - canvasCenterX) < this.snapThreshold) {
            guides.push({
                type: 'vertical',
                position: canvasCenterX,
                start: 0,
                end: canvasHeight,
                isCanvas: true
            });
        }
        
        if (Math.abs(activeBounds.centerY - canvasCenterY) < this.snapThreshold) {
            guides.push({
                type: 'horizontal',
                position: canvasCenterY,
                start: 0,
                end: canvasWidth,
                isCanvas: true
            });
        }

        // Object alignment guides
        const objects = this.canvas.getObjects().filter(obj => 
            obj !== activeObject && 
            obj.visible && 
            !obj.virtual &&
            !obj.isGuideline &&
            obj.id !== 'background'
        );

        objects.forEach(obj => {
            const objBounds = this.getObjectBounds(obj);
            
            // Vertical alignment guides
            if (Math.abs(activeBounds.left - objBounds.left) < this.snapThreshold) {
                guides.push({
                    type: 'vertical',
                    position: objBounds.left,
                    start: Math.min(activeBounds.top, objBounds.top) - 20,
                    end: Math.max(activeBounds.bottom, objBounds.bottom) + 20,
                    isCanvas: false
                });
            }
            
            if (Math.abs(activeBounds.right - objBounds.right) < this.snapThreshold) {
                guides.push({
                    type: 'vertical',
                    position: objBounds.right,
                    start: Math.min(activeBounds.top, objBounds.top) - 20,
                    end: Math.max(activeBounds.bottom, objBounds.bottom) + 20,
                    isCanvas: false
                });
            }
            
            if (Math.abs(activeBounds.centerX - objBounds.centerX) < this.snapThreshold) {
                guides.push({
                    type: 'vertical',
                    position: objBounds.centerX,
                    start: Math.min(activeBounds.top, objBounds.top) - 20,
                    end: Math.max(activeBounds.bottom, objBounds.bottom) + 20,
                    isCanvas: false
                });
            }
            
            // Horizontal alignment guides
            if (Math.abs(activeBounds.top - objBounds.top) < this.snapThreshold) {
                guides.push({
                    type: 'horizontal',
                    position: objBounds.top,
                    start: Math.min(activeBounds.left, objBounds.left) - 20,
                    end: Math.max(activeBounds.right, objBounds.right) + 20,
                    isCanvas: false
                });
            }
            
            if (Math.abs(activeBounds.bottom - objBounds.bottom) < this.snapThreshold) {
                guides.push({
                    type: 'horizontal',
                    position: objBounds.bottom,
                    start: Math.min(activeBounds.left, objBounds.left) - 20,
                    end: Math.max(activeBounds.right, objBounds.right) + 20,
                    isCanvas: false
                });
            }
            
            if (Math.abs(activeBounds.centerY - objBounds.centerY) < this.snapThreshold) {
                guides.push({
                    type: 'horizontal',
                    position: objBounds.centerY,
                    start: Math.min(activeBounds.left, objBounds.left) - 20,
                    end: Math.max(activeBounds.right, objBounds.right) + 20,
                    isCanvas: false
                });
            }
        });

        return guides;
    }

    drawGuidelines(guides) {
        this.clearGuidelines();
        
        guides.forEach(guide => {
            let guideLine;
            
            if (guide.type === 'vertical') {
                guideLine = new fabric.Line([guide.position, guide.start, guide.position, guide.end], {
                    stroke: guide.isCanvas ? '#FF6B6B' : '#4ECDC4',
                    strokeWidth: 1,
                    strokeDashArray: [5, 5],
                    selectable: false,
                    evented: false,
                    excludeFromExport: true,
                    isGuideline: true
                });
            } else {
                guideLine = new fabric.Line([guide.start, guide.position, guide.end, guide.position], {
                    stroke: guide.isCanvas ? '#FF6B6B' : '#4ECDC4',
                    strokeWidth: 1,
                    strokeDashArray: [5, 5],
                    selectable: false,
                    evented: false,
                    excludeFromExport: true,
                    isGuideline: true
                });
            }
            
            this.guidelines.push(guideLine);
            this.canvas.add(guideLine);
        });
        
        this.showingGuidelines = true;
        this.canvas.renderAll();
        
        // Auto-hide guidelines after 2 seconds
        setTimeout(() => {
            if (this.showingGuidelines) {
                this.clearGuidelines();
            }
        }, 2000);
    }

    snapToGuides(activeObject, guides) {
        const activeBounds = this.getObjectBounds(activeObject);
        
        guides.forEach(guide => {
            if (guide.type === 'vertical') {
                const snapPosition = guide.position - activeBounds.width / 2;
                if (Math.abs(activeBounds.centerX - guide.position) < this.snapThreshold) {
                    activeObject.set('left', snapPosition);
                }
            } else {
                const snapPosition = guide.position - activeBounds.height / 2;
                if (Math.abs(activeBounds.centerY - guide.position) < this.snapThreshold) {
                    activeObject.set('top', snapPosition);
                }
            }
        });
        
        activeObject.setCoords();
    }

    clearGuidelines() {
        if (this.guidelines.length > 0) {
            this.guidelines.forEach(guideLine => {
                this.canvas.remove(guideLine);
            });
            this.guidelines = [];
            this.showingGuidelines = false;
            this.canvas.renderAll();
        }
    }

    setupBrandControls() {
        // Title font and color controls
        const titleFontSelect = document.getElementById('titleFontSelect');
        const titleColorSelect = document.getElementById('titleColorSelect');
        const subtitleFontSelect = document.getElementById('subtitleFontSelect');
        const subtitleColorSelect = document.getElementById('subtitleColorSelect');

        if (titleFontSelect) {
            titleFontSelect.addEventListener('change', (e) => {
                this.updateTextStyle('title', 'fontFamily', e.target.value);
                this.updateFloatingToolbarFont('title', e.target.value);
                this.saveState();
                // Ensure font selector maintains value
                setTimeout(() => this.maintainBrandFontSelection('title'), 100);
            });
        }

        if (titleColorSelect) {
            titleColorSelect.addEventListener('input', (e) => {
                this.updateTextStyle('title', 'fill', e.target.value);
                this.updateFloatingToolbarColor('title', e.target.value);
                this.saveState();
                // Maintain font selector value
                this.maintainBrandFontSelection('title');
            });
        }

        if (subtitleFontSelect) {
            subtitleFontSelect.addEventListener('change', (e) => {
                this.updateTextStyle('subtitle', 'fontFamily', e.target.value);
                this.updateFloatingToolbarFont('subtitle', e.target.value);
                this.saveState();
                // Ensure font selector maintains value
                setTimeout(() => this.maintainBrandFontSelection('subtitle'), 100);
            });
        }

        if (subtitleColorSelect) {
            subtitleColorSelect.addEventListener('input', (e) => {
                this.updateTextStyle('subtitle', 'fill', e.target.value);
                this.updateFloatingToolbarColor('subtitle', e.target.value);
                this.saveState();
                // Maintain font selector value
                this.maintainBrandFontSelection('subtitle');
            });
        }
        
        // Initialize brand controls with current canvas values
        this.initializeBrandControlValues();
    }

    initializeBrandControlValues() {
        // Set initial values based on canvas text objects
        setTimeout(() => {
            const titleObj = this.canvas.getObjects().find(obj => obj.id === 'title');
            const subtitleObj = this.canvas.getObjects().find(obj => obj.id === 'subtitle');
            
            if (titleObj) {
                const titleFontSelect = document.getElementById('titleFontSelect');
                const titleColorSelect = document.getElementById('titleColorSelect');
                if (titleFontSelect) {
                    // Clean font family name
                    let fontFamily = titleObj.fontFamily || 'Source Sans Pro';
                    if (fontFamily.includes(',')) {
                        fontFamily = fontFamily.split(',')[0].trim();
                    }
                    titleFontSelect.value = fontFamily;
                    console.log('Title font initialized to:', fontFamily);
                }
                if (titleColorSelect) {
                    titleColorSelect.value = titleObj.fill || '#ffffff';
                    console.log('Title color initialized to:', titleObj.fill);
                }
            }
            
            if (subtitleObj) {
                const subtitleFontSelect = document.getElementById('subtitleFontSelect');
                const subtitleColorSelect = document.getElementById('subtitleColorSelect');
                if (subtitleFontSelect) {
                    // Clean font family name
                    let fontFamily = subtitleObj.fontFamily || 'Source Sans Pro';
                    if (fontFamily.includes(',')) {
                        fontFamily = fontFamily.split(',')[0].trim();
                    }
                    subtitleFontSelect.value = fontFamily;
                    console.log('Subtitle font initialized to:', fontFamily);
                }
                if (subtitleColorSelect) {
                    subtitleColorSelect.value = subtitleObj.fill || '#ffffff';
                    console.log('Subtitle color initialized to:', subtitleObj.fill);
                }
            }
        }, 1500);
    }

    updateFloatingToolbarFont(textType, fontFamily) {
        // Update floating toolbar font selector if it's currently showing
        const toolbarFontSelect = document.getElementById('toolbarFontFamily');
        if (toolbarFontSelect && this.selectedTextObject && this.selectedTextObject.id === textType) {
            toolbarFontSelect.value = fontFamily;
        }
    }

    updateFloatingToolbarColor(textType, color) {
        // Update floating toolbar color picker if it's currently showing
        const toolbarColorInput = document.getElementById('toolbarTextColor');
        if (toolbarColorInput && this.selectedTextObject && this.selectedTextObject.id === textType) {
            toolbarColorInput.value = color;
        }
    }

    updateBrandControlsFromCanvas(textType) {
        // Update sidebar brand controls when canvas elements change
        const textObj = this.canvas.getObjects().find(obj => obj.id === textType);
        if (!textObj) return;

        // Clean font family name
        let fontFamily = textObj.fontFamily || 'Source Sans Pro';
        if (fontFamily.includes(',')) {
            fontFamily = fontFamily.split(',')[0].trim();
        }

        if (textType === 'title') {
            const titleFontSelect = document.getElementById('titleFontSelect');
            const titleColorSelect = document.getElementById('titleColorSelect');
            if (titleFontSelect) titleFontSelect.value = fontFamily;
            if (titleColorSelect) titleColorSelect.value = textObj.fill || '#ffffff';
        } else if (textType === 'subtitle') {
            const subtitleFontSelect = document.getElementById('subtitleFontSelect');
            const subtitleColorSelect = document.getElementById('subtitleColorSelect');
            if (subtitleFontSelect) subtitleFontSelect.value = fontFamily;
            if (subtitleColorSelect) subtitleColorSelect.value = textObj.fill || '#ffffff';
        }
    }

    maintainBrandFontSelection(textType) {
        // Ensure font selector displays current font after any changes
        const textObj = this.canvas.getObjects().find(obj => obj.id === textType);
        if (!textObj) return;

        // Clean font family name by removing fallback fonts
        let fontFamily = textObj.fontFamily || 'Source Sans Pro';
        if (fontFamily.includes(',')) {
            fontFamily = fontFamily.split(',')[0].trim();
        }
        
        if (textType === 'title') {
            const titleFontSelect = document.getElementById('titleFontSelect');
            if (titleFontSelect && titleFontSelect.value !== fontFamily) {
                titleFontSelect.value = fontFamily;
                console.log('Maintained title font selector value:', fontFamily);
            }
        } else if (textType === 'subtitle') {
            const subtitleFontSelect = document.getElementById('subtitleFontSelect');
            if (subtitleFontSelect && subtitleFontSelect.value !== fontFamily) {
                subtitleFontSelect.value = fontFamily;
                console.log('Maintained subtitle font selector value:', fontFamily);
            }
        }
    }

    setupStockImageInterface() {
        // Setup tab switching
        const imageTabs = document.querySelectorAll('.image-tab');
        const uploadTab = document.getElementById('uploadTab');
        const stockTab = document.getElementById('stockTab');
        const generateTab = document.getElementById('generateTab');
        
        // Initialize tab visibility - show only upload tab by default
        if (uploadTab && stockTab && generateTab) {
            uploadTab.classList.remove('hidden');
            stockTab.classList.add('hidden');
            generateTab.classList.add('hidden');
            
            // Ensure upload tab is marked as active
            const uploadTabButton = document.querySelector('.image-tab[data-tab="upload"]');
            if (uploadTabButton) {
                imageTabs.forEach(t => t.classList.remove('active'));
                uploadTabButton.classList.add('active');
            }
        }
        
        imageTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabType = tab.getAttribute('data-tab');
                
                // Update tab active states
                imageTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Hide all tab content first
                if (uploadTab) uploadTab.classList.add('hidden');
                if (stockTab) stockTab.classList.add('hidden');
                if (generateTab) generateTab.classList.add('hidden');
                
                // Show the selected tab content
                if (tabType === 'upload' && uploadTab) {
                    uploadTab.classList.remove('hidden');
                } else if (tabType === 'stock' && stockTab) {
                    stockTab.classList.remove('hidden');
                } else if (tabType === 'generate' && generateTab) {
                    generateTab.classList.remove('hidden');
                }
            });
        });
        
        // Setup stock image search
        const stockSearchInput = document.getElementById('stockSearchInput');
        const stockSearchBtn = document.getElementById('stockSearchBtn');
        
        const performSearch = () => {
            const query = stockSearchInput.value.trim();
            if (!query) return;
            
            this.searchStockImages(query);
        };
        
        stockSearchBtn.addEventListener('click', performSearch);
        stockSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
        
        // Setup AI image generation
        const generatePromptInput = document.getElementById('generatePromptInput');
        const generateImageBtn = document.getElementById('generateImageBtn');
        
        const performGeneration = () => {
            const prompt = generatePromptInput.value.trim();
            if (!prompt) return;
            
            this.generateAIImage(prompt);
        };
        
        generateImageBtn.addEventListener('click', performGeneration);
        generatePromptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performGeneration();
            }
        });
    }

    async searchStockImages(query) {
        const stockResults = document.getElementById('stockResults');
        
        // Show loading state
        stockResults.innerHTML = '<div class="stock-loading"><i class="fas fa-spinner fa-spin"></i> Searching stock images...</div>';
        
        try {
            const orientation = this.currentOrientation === 'horizontal' ? 'horizontal' : 
                              this.currentOrientation === 'vertical' ? 'vertical' : null;
            
            const params = new URLSearchParams({
                query: query,
                per_page: 20
            });
            
            if (orientation) {
                params.append('orientation', orientation);
            }
            
            const response = await fetch(`/api/shutterstock/search?${params}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Search failed');
            }
            
            this.displayStockImages(data.images);
            
        } catch (error) {
            console.error('Stock search error:', error);
            let errorMessage = 'Failed to search stock images';
            
            if (error.message.includes('credentials not configured')) {
                errorMessage = 'Shutterstock API credentials not configured. Please contact support.';
            }
            
            stockResults.innerHTML = `<div class="stock-error">${errorMessage}</div>`;
        }
    }

    displayStockImages(images) {
        const stockResults = document.getElementById('stockResults');
        
        if (!images || images.length === 0) {
            stockResults.innerHTML = '<div class="stock-empty">No images found. Try a different search term.</div>';
            return;
        }
        
        const gridHTML = `
            <div class="stock-grid">
                ${images.map(image => `
                    <div class="stock-image-item" data-url="${image.preview_url}" data-id="${image.id}">
                        <img src="${image.preview_url}" alt="${image.description}" loading="lazy">
                    </div>
                `).join('')}
            </div>
        `;
        
        stockResults.innerHTML = gridHTML;
        
        // Add click handlers for stock images
        const stockItems = stockResults.querySelectorAll('.stock-image-item');
        stockItems.forEach(item => {
            item.addEventListener('click', () => {
                const imageUrl = item.getAttribute('data-url');
                this.useStockImage(imageUrl);
            });
        });
    }

    async useStockImage(imageUrl) {
        try {
            const response = await fetch(`/api/shutterstock/download?url=${encodeURIComponent(imageUrl)}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Download failed');
            }
            
            // Add the stock image to canvas
            this.addImageToCanvas(data.image_data, 'main');
            
        } catch (error) {
            console.error('Stock image download error:', error);
            alert('Failed to add image to canvas. Please try again.');
        }
    }

    async generateAIImage(prompt) {
        const generateResults = document.getElementById('generateResults');
        
        // Show loading state
        generateResults.innerHTML = '<div class="stock-loading"><i class="fas fa-spinner fa-spin"></i> Generating AI image...</div>';
        
        try {
            const response = await fetch('/api/openai/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                    orientation: this.currentOrientation
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Generation failed');
            }
            
            this.displayGeneratedImage(data.image_url);
            
        } catch (error) {
            console.error('AI generation error:', error);
            let errorMessage = 'Failed to generate AI image';
            
            if (error.message.includes('credentials not configured')) {
                errorMessage = 'OpenAI API credentials not configured. Please contact support.';
            }
            
            generateResults.innerHTML = `<div class="stock-error">${errorMessage}</div>`;
        }
    }

    displayGeneratedImage(imageUrl) {
        const generateResults = document.getElementById('generateResults');
        
        const imageHTML = `
            <div class="generated-image-container">
                <div class="generated-image-item" data-url="${imageUrl}">
                    <img src="${imageUrl}" alt="Generated image" loading="lazy">
                    <div class="use-image-overlay">
                        <button class="use-image-btn">Use This Image</button>
                    </div>
                </div>
            </div>
        `;
        
        generateResults.innerHTML = imageHTML;
        
        // Add click handler for generated image
        const generateItem = generateResults.querySelector('.generated-image-item');
        if (generateItem) {
            generateItem.addEventListener('click', () => {
                const imageUrl = generateItem.getAttribute('data-url');
                this.useGeneratedImage(imageUrl);
            });
        }
    }

    async useGeneratedImage(imageUrl) {
        try {
            // Convert image URL to base64 for canvas
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            
            const reader = new FileReader();
            reader.onload = () => {
                this.addImageToCanvas(reader.result, 'main');
            };
            reader.readAsDataURL(blob);
            
        } catch (error) {
            console.error('Generated image use error:', error);
            alert('Failed to add image to canvas. Please try again.');
        }
    }

}

// Initialize the editor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TemplateAdsEditor();
});
