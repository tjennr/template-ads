class TemplateAdsEditor {
    constructor() {
        this.canvas = null;
        this.currentTemplate = 'template1';
        this.currentOrientation = 'horizontal';
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
        // Create initial template content without waiting for image load
        this.loadTemplate(this.currentTemplate);
        
        // Load default image in background
        const defaultImagePath = '/static/images/default-office.jpg';
        fabric.Image.fromURL(defaultImagePath, (img) => {
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
            
            this.canvas.add(img);
            this.canvas.sendToBack(img);
            this.mainImage = img;
            this.canvas.renderAll();
            this.saveState();
        });
        
        this.updateFontFamilyDisplay();
        this.applyZoom();
    }

    loadDefaultImage() {
        // Load the default office image on page load
        const defaultImagePath = '/static/images/default-office.jpg';
        this.addImageToCanvas(defaultImagePath, 'main');
    }

    updateFontFamilyDisplay() {
        // This method is no longer needed since font family is handled by the floating toolbar
    }

    setCanvasDimensions() {
        let canvasWidth, canvasHeight;
        
        if (this.currentOrientation === 'horizontal') {
            // Horizontal: 5:4 aspect ratio
            canvasWidth = 1000;
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
        
        // Update button states
        document.querySelectorAll('.orientation-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-orientation="${orientation}"]`).classList.add('active');
        
        // Update canvas dimensions
        this.setCanvasDimensions();
        
        // Reload current template to ensure proper layout for new orientation
        this.loadTemplate(this.currentTemplate);
        
        this.canvas.renderAll();
        this.saveState();
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
    
    setupEventListeners() {
        // Template selection
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTemplate = btn.dataset.template;
                this.loadTemplate(this.currentTemplate);
                this.saveState();
            });
        });
        
        // Image uploads
        document.getElementById('mainImageUpload').addEventListener('change', (e) => {
            this.handleImageUpload(e, 'main');
        });
        
        document.getElementById('logoUpload').addEventListener('change', (e) => {
            this.handleImageUpload(e, 'logo');
        });
        
        // Text inputs
        document.getElementById('titleText').addEventListener('input', (e) => {
            this.updateText('title', e.target.value);
        });
        
        document.getElementById('subtitleText').addEventListener('input', (e) => {
            this.updateText('subtitle', e.target.value);
        });
        
        document.getElementById('ctaText').addEventListener('input', (e) => {
            this.updateText('cta', e.target.value);
            this.updateCtaButtonSize();
        });
        
        // CTA toggle
        document.getElementById('ctaEnabled').addEventListener('change', (e) => {
            this.toggleCTA(e.target.checked);
        });

        // Orientation buttons
        document.getElementById('horizontalBtn').addEventListener('click', () => {
            this.changeOrientation('horizontal');
        });

        document.getElementById('squareBtn').addEventListener('click', () => {
            this.changeOrientation('square');
        });

        document.getElementById('verticalBtn').addEventListener('click', () => {
            this.changeOrientation('vertical');
        });


        
        // Export dropdown functionality
        const exportMainBtn = document.getElementById('exportMainBtn');
        const exportDropdown = document.getElementById('exportDropdown');
        
        exportMainBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleExportDropdown();
        });
        
        // Export buttons
        document.getElementById('exportPng').addEventListener('click', () => {
            this.exportImage('png');
            this.hideExportDropdown();
        });
        
        document.getElementById('exportJpg').addEventListener('click', () => {
            this.exportImage('jpg');
            this.hideExportDropdown();
        });
        
        document.getElementById('exportPdf').addEventListener('click', () => {
            this.exportPdf();
            this.hideExportDropdown();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!document.querySelector('.export-container').contains(e.target)) {
                this.hideExportDropdown();
            }
        });
        
        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.zoomIn();
        });
        
        document.getElementById('zoomOut').addEventListener('click', () => {
            this.zoomOut();
        });
        
        document.getElementById('zoomFit').addEventListener('click', () => {
            this.zoomToFit();
        });
        
        // Utility buttons
        document.getElementById('undoCanvas').addEventListener('click', () => {
            this.undo();
        });
        
        document.getElementById('resetCanvas').addEventListener('click', () => {
            this.resetCanvas();
        });
        
        // Initialize slider fills on load
        this.initializeSliderFills();
    }

    setupCanvasEvents() {
        // Track canvas changes for undo functionality with debouncing
        this.canvas.on('object:added', () => this.debouncedSaveState());
        this.canvas.on('object:removed', () => this.debouncedSaveState());
        this.canvas.on('object:modified', () => {
            this.updateToolbarPosition();
            this.debouncedSaveState();
        });
        this.canvas.on('path:created', () => this.debouncedSaveState());
        
        // Simple click-based text selection system
        this.canvas.on('mouse:up', (e) => {
            // Small delay to ensure click is registered properly
            setTimeout(() => {
                if (e.target && (e.target.type === 'text' || e.target.type === 'textbox')) {
                    // Show toolbar for text elements
                    this.selectedTextObject = e.target;
                    this.showTextToolbar();
                    this.updateToolbarValues();
                    this.updateToolbarPosition();
                    this.hideBackgroundToolbar();
                } else if (e.target && (e.target.id === 'ctaBackground' || e.target.id === 'cta' || e.target.id === 'ctaGroup')) {
                    // Handle CTA click - show CTA toolbar
                    if (e.target.id === 'ctaGroup') {
                        this.selectedCtaObject = e.target;
                    } else {
                        // Find the parent CTA group
                        this.selectedCtaObject = this.canvas.getObjects().find(obj => obj.id === 'ctaGroup');
                    }
                    this.hideBackgroundToolbar();
                } else if (!e.target) {
                    // Clicked on background (empty canvas area)
                    this.hideTextToolbar();
                    this.hideCtaToolbar();
                    this.showBackgroundToolbar(e.pointer);
                } else {
                    // Clicked on other objects (images, etc.)
                    this.hideTextToolbar();
                    this.hideCtaToolbar();
                    this.hideBackgroundToolbar();
                    
                    if (this.selectedCtaObject) {
                        this.hideTextToolbar(); // Hide text toolbar first
                        this.showCtaToolbar();
                        this.updateCtaToolbarValues();
                        this.updateCtaToolbarPosition();
                    }
                }
            }, 100);
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
            // Don't hide if clicking on the toolbar itself
            if (this.textToolbar.contains(e.target)) {
                return;
            }
            
            // Don't hide if clicking on CTA toolbar
            if (this.ctaToolbar && this.ctaToolbar.contains(e.target)) {
                return;
            }
            
            // Don't hide if clicking on background toolbar
            if (this.backgroundToolbar && this.backgroundToolbar.contains(e.target)) {
                return;
            }
            
            // Hide if clicking outside the canvas entirely
            if (!this.canvas.getElement().contains(e.target)) {
                this.hideTextToolbar();
                this.hideCtaToolbar();
                this.hideBackgroundToolbar();
            }
        });
    }

    setupTextToolbarEvents() {
        // Get toolbar elements with null checks
        const fontFamilySelect = document.getElementById('toolbarFontFamily');
        const fontSizeInput = document.getElementById('toolbarFontSize');
        const textColorInput = document.getElementById('toolbarTextColor');
        const shadowBtn = document.getElementById('toolbarShadow');
        const outlineBtn = document.getElementById('toolbarOutline');
        const effectColorInput = document.getElementById('toolbarEffectColor');

        // Font family change
        if (fontFamilySelect) {
            fontFamilySelect.addEventListener('change', (e) => {
                if (this.selectedTextObject) {
                    this.selectedTextObject.set('fontFamily', e.target.value);
                    this.canvas.renderAll();
                }
            });
        }

        // Font size change
        if (fontSizeInput) {
            fontSizeInput.addEventListener('input', (e) => {
                if (this.selectedTextObject && e.target.value) {
                    this.selectedTextObject.set('fontSize', parseInt(e.target.value));
                    this.canvas.renderAll();
                    this.updateToolbarPosition();
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
                }
            });
        }

        // Shadow toggle
        if (shadowBtn) {
            shadowBtn.addEventListener('click', (e) => {
                if (this.selectedTextObject) {
                    const hasShadow = this.selectedTextObject.shadow;
                    if (hasShadow) {
                        this.selectedTextObject.set('shadow', null);
                        e.target.classList.remove('active');
                    } else {
                        const effectColor = effectColorInput ? effectColorInput.value : '#000000';
                        this.selectedTextObject.set('shadow', {
                            color: effectColor,
                            blur: 4,
                            offsetX: 2,
                            offsetY: 2
                        });
                        e.target.classList.add('active');
                    }
                    this.canvas.renderAll();
                }
            });
        }

        // Outline toggle
        if (outlineBtn) {
            outlineBtn.addEventListener('click', (e) => {
                if (this.selectedTextObject) {
                    const hasStroke = this.selectedTextObject.stroke;
                    if (hasStroke) {
                        this.selectedTextObject.set('stroke', '');
                        this.selectedTextObject.set('strokeWidth', 0);
                        e.target.classList.remove('active');
                    } else {
                        const effectColor = effectColorInput ? effectColorInput.value : '#000000';
                        this.selectedTextObject.set('stroke', effectColor);
                        this.selectedTextObject.set('strokeWidth', 2);
                        e.target.classList.add('active');
                    }
                    this.canvas.renderAll();
                }
            });
        }

        // Effect color change
        if (effectColorInput) {
            effectColorInput.addEventListener('change', (e) => {
                if (this.selectedTextObject) {
                    if (shadowBtn && shadowBtn.classList.contains('active') && this.selectedTextObject.shadow) {
                        this.selectedTextObject.shadow.color = e.target.value;
                    }
                    
                    if (outlineBtn && outlineBtn.classList.contains('active') && this.selectedTextObject.stroke) {
                        this.selectedTextObject.set('stroke', e.target.value);
                    }
                    
                    this.canvas.renderAll();
                }
            });
        }
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
    }

    hideTextToolbar() {
        this.textToolbar.classList.add('hidden');
        this.selectedTextObject = null;
    }

    showCtaToolbar() {
        this.ctaToolbar.classList.remove('hidden');
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
        const shadowBtn = document.getElementById('toolbarShadow');
        const outlineBtn = document.getElementById('toolbarOutline');
        const effectColorInput = document.getElementById('toolbarEffectColor');

        // Check if elements exist before setting values
        if (fontFamilySelect) {
            const currentFont = this.selectedTextObject.fontFamily || 'Source Sans Pro';
            fontFamilySelect.value = currentFont;
            
            // If the current font isn't in the dropdown options, add it temporarily
            if (!Array.from(fontFamilySelect.options).some(option => option.value === currentFont)) {
                const option = document.createElement('option');
                option.value = currentFont;
                option.textContent = currentFont;
                fontFamilySelect.appendChild(option);
                fontFamilySelect.value = currentFont;
            }
        }
        
        if (fontSizeInput) {
            fontSizeInput.value = Math.round(this.selectedTextObject.fontSize || 24);
        }
        
        if (textColorInput) {
            textColorInput.value = this.selectedTextObject.fill || '#000000';
        }
        
        // Update shadow button state
        if (shadowBtn) {
            if (this.selectedTextObject.shadow) {
                shadowBtn.classList.add('active');
                if (effectColorInput) {
                    effectColorInput.value = this.selectedTextObject.shadow.color || '#000000';
                }
            } else {
                shadowBtn.classList.remove('active');
            }
        }
        
        // Update outline button state
        if (outlineBtn) {
            if (this.selectedTextObject.stroke) {
                outlineBtn.classList.add('active');
                if (effectColorInput) {
                    effectColorInput.value = this.selectedTextObject.stroke || '#000000';
                }
            } else {
                outlineBtn.classList.remove('active');
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
        this.updateUndoButtonState();
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
                this.updateUndoButtonState();
                this.updateObjectReferences();
            });
        }
    }

    updateUndoButtonState() {
        const undoButton = document.getElementById('undoCanvas');
        if (undoButton) {
            undoButton.disabled = this.historyStep <= 0;
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
    
    loadTemplate(templateName) {
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
        
        // Ensure proper final layering: background images at bottom, text on top
        this.enforceProperLayering();
        this.canvas.renderAll();
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
            case 'template4': // Split Layout - adapt based on orientation
                if (isVertical) {
                    // Vertical: top half for image
                    return {
                        left: canvasWidth / 2,
                        top: canvasHeight * 0.25,
                        originX: 'center',
                        originY: 'center',
                        width: canvasWidth,
                        height: canvasHeight * 0.5
                    };
                } else {
                    // Horizontal: left half for image
                    return {
                        left: canvasWidth * 0.25,
                        top: canvasHeight / 2,
                        originX: 'center',
                        originY: 'center',
                        width: canvasWidth * 0.5,
                        height: canvasHeight
                    };
                }
            case 'template5': // Split Layout - adapt based on orientation
                if (isVertical) {
                    // Vertical: bottom half for image
                    return {
                        left: canvasWidth / 2,
                        top: canvasHeight * 0.75,
                        originX: 'center',
                        originY: 'center',
                        width: canvasWidth,
                        height: canvasHeight * 0.5
                    };
                } else {
                    // Horizontal: right half for image
                    return {
                        left: canvasWidth * 0.75,
                        top: canvasHeight / 2,
                        originX: 'center',
                        originY: 'center',
                        width: canvasWidth * 0.5,
                        height: canvasHeight
                    };
                }
            case 'template6': // Split Layout - adapt based on orientation
                if (isVertical) {
                    // Vertical: center area for image
                    return {
                        left: canvasWidth / 2,
                        top: canvasHeight / 2,
                        originX: 'center',
                        originY: 'center',
                        width: canvasWidth * 0.8,
                        height: canvasHeight * 0.6
                    };
                } else {
                    // Horizontal: top half for image
                    return {
                        left: canvasWidth / 2,
                        top: canvasHeight * 0.25,
                        originX: 'center',
                        originY: 'center',
                        width: canvasWidth,
                        height: canvasHeight * 0.5
                    };
                }
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
        this.titleText = new fabric.Text(document.getElementById('titleText').value, {
            left: canvasWidth / 2,
            top: isVertical ? canvasHeight * 0.6 : canvasHeight * 0.65,
            fontSize: 40,
            fill: '#ffffff',
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            id: 'title'
        });
        
        // Subtitle - white text over image
        this.subtitleText = new fabric.Text(document.getElementById('subtitleText').value, {
            left: canvasWidth / 2,
            top: isVertical ? canvasHeight * 0.7 : canvasHeight * 0.75,
            fontSize: 24,
            fill: '#ffffff',
            fontFamily: 'Source Sans Pro, sans-serif',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            id: 'subtitle'
        });
        
        // CTA Button - Create rounded rectangle background
        const ctaButtonBg = new fabric.Rect({
            left: canvasWidth / 2,
            top: isVertical ? canvasHeight * 0.85 : canvasHeight * 0.88,
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
            left: canvasWidth / 2,
            top: isVertical ? canvasHeight * 0.85 : canvasHeight * 0.88,
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
        this.titleText = new fabric.Text(document.getElementById('titleText')?.value || 'Your Title Here', {
            left: canvasWidth * 0.1,
            top: canvasHeight * 0.6,
            fontSize: 40,
            fill: '#ffffff',
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'left',
            originX: 'left',
            originY: 'center',
            id: 'title'
        });
        
        // Subtitle - white text over image
        this.subtitleText = new fabric.Text(document.getElementById('subtitleText')?.value || 'Your subtitle text', {
            left: canvasWidth * 0.1,
            top: canvasHeight * 0.7,
            fontSize: 24,
            fill: '#ffffff',
            fontFamily: 'Source Sans Pro, sans-serif',
            textAlign: 'left',
            originX: 'left',
            originY: 'center',
            id: 'subtitle'
        });
        
        // Calculate responsive button width based on text
        const ctaTextValue = document.getElementById('ctaText')?.value || 'Shop Now';
        
        // CTA Button - Create rounded rectangle background
        const ctaButtonBg = new fabric.Rect({
            left: canvasWidth * 0.1,
            top: canvasHeight * 0.85,
            width: 120,
            height: 40,
            fill: '#0077B5',
            rx: 8,
            ry: 8,
            originX: 'left',
            originY: 'center',
            selectable: false,
            evented: false,
            id: 'ctaBackground'
        });

        // CTA Button Text
        this.ctaText = new fabric.Text('Shop Now', {
            left: canvasWidth * 0.1 + 60,
            top: canvasHeight * 0.85,
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
            left: canvasWidth * 0.1,
            top: canvasHeight * 0.85,
            originX: 'left',
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
        this.titleText = new fabric.Text(document.getElementById('titleText')?.value || 'Your Title Here', {
            left: canvasWidth / 2,
            top: canvasHeight * 0.5,
            fontSize: 40,
            fill: '#ffffff',
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            id: 'title'
        });
        
        // Subtitle - white text over image
        this.subtitleText = new fabric.Text(document.getElementById('subtitleText')?.value || 'Your subtitle text', {
            left: canvasWidth / 2,
            top: canvasHeight * 0.65,
            fontSize: 24,
            fill: '#ffffff',
            fontFamily: 'Source Sans Pro, sans-serif',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
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
            left: canvasWidth / 2,
            top: canvasHeight * 0.8,
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
            left: canvasWidth / 2,
            top: canvasHeight * 0.8,
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
        // Split Layout - Adapts based on orientation
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        const isVertical = this.currentOrientation === 'vertical';
        
        if (isVertical) {
            // Vertical: Image left half, text right half
            this.titleText = new fabric.Textbox(document.getElementById('titleText')?.value || 'Your Title Here', {
                left: canvasWidth * 0.75,
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
                splitByGrapheme: false
            });
            
            this.subtitleText = new fabric.Textbox(document.getElementById('subtitleText')?.value || 'Your subtitle text', {
                left: canvasWidth * 0.75,
                top: canvasHeight * 0.55,
                fontSize: 24,
                fill: '#666666',
                fontFamily: 'Source Sans Pro, sans-serif',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
                id: 'subtitle',
                width: canvasWidth * 0.35,
                splitByGrapheme: false
            });
            
            const ctaButtonBg = new fabric.Rect({
                left: canvasWidth * 0.75,
                top: canvasHeight * 0.7,
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
                left: canvasWidth * 0.75,
                top: canvasHeight * 0.7,
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
                left: canvasWidth * 0.75,
                top: canvasHeight * 0.7,
                originX: 'center',
                originY: 'center',
                id: 'ctaGroup'
            });
        } else {
            // Horizontal: Image left half, text right half
            this.titleText = new fabric.Textbox(document.getElementById('titleText')?.value || 'Your Title Here', {
                left: canvasWidth * 0.75, // Match Split Right positioning
                top: canvasHeight * 0.4,
                fontSize: 40, // Match Split Right font size
                fill: '#333333',
                fontFamily: 'Source Sans Pro, sans-serif',
                fontWeight: 'bold',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
                id: 'title',
                width: canvasWidth * 0.35, // Match Split Right width
                splitByGrapheme: false
            });
            
            this.subtitleText = new fabric.Textbox(document.getElementById('subtitleText')?.value || 'Your subtitle text', {
                left: canvasWidth * 0.75, // Match Split Right positioning
                top: canvasHeight * 0.55,
                fontSize: 24, // Match Split Right font size
                fill: '#666666',
                fontFamily: 'Source Sans Pro, sans-serif',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
                id: 'subtitle',
                width: canvasWidth * 0.35, // Match Split Right width
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
                left: canvasWidth * 0.75, // Match Split Right positioning
                top: canvasHeight * 0.7,
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
                left: canvasWidth * 0.75, // Match Split Right positioning
                top: canvasHeight * 0.7,
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
                left: canvasWidth * 0.75, // Match Split Right positioning
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
        // Split Layout - Adapts based on orientation
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
                splitByGrapheme: false
            });
            
            const ctaButtonBg = new fabric.Rect({
                left: canvasWidth * 0.25,
                top: canvasHeight * 0.7,
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
                left: canvasWidth * 0.25,
                top: canvasHeight * 0.7,
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
                left: canvasWidth * 0.25,
                top: canvasHeight * 0.7,
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
                left: canvasWidth * 0.25,
                top: canvasHeight * 0.7,
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

    createTemplate6() {
        // Split Top - Image covers top half, text on bottom half
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        
        // Title - positioned in bottom text area, using color scheme
        this.titleText = new fabric.Text(document.getElementById('titleText')?.value || 'Your Title Here', {
            left: canvasWidth / 2,
            top: canvasHeight * 0.65,
            fontSize: 40,
            fill: '#333333',
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            id: 'title'
        });
        
        // Subtitle - positioned in bottom text area, using color scheme
        this.subtitleText = new fabric.Text(document.getElementById('subtitleText')?.value || 'Your subtitle text', {
            left: canvasWidth / 2,
            top: canvasHeight * 0.78,
            fontSize: 24,
            fill: '#666666',
            fontFamily: 'Source Sans Pro, sans-serif',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
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
            left: canvasWidth / 2,
            top: canvasHeight * 0.9,
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
            left: canvasWidth / 2,
            top: canvasHeight * 0.9,
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

                // Add clipping to contain image within its designated area
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

                // Add clipping to contain image within its designated area
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
        // Reset form values to defaults
        document.getElementById('titleText').value = 'Your Amazing Product';
        document.getElementById('subtitleText').value = 'Premium quality at affordable prices';
        document.getElementById('ctaText').value = 'Shop Now';
        document.getElementById('ctaSize').value = '18';
        document.getElementById('ctaColor').value = '#ffffff';
        
        // Clear file inputs
        document.getElementById('mainImageUpload').value = '';
        document.getElementById('logoUpload').value = '';
        
        // Clear canvas completely
        this.canvas.clear();
        this.canvas.setBackgroundColor('#ffffff', this.canvas.renderAll.bind(this.canvas));
        
        // Reset image references
        this.mainImage = null;
        this.logo = null;
        
        // Reload current template with default values
        this.loadTemplate(this.currentTemplate || 'template1');
        
        // Load default images after template is loaded
        this.loadDefaultImage();
        
        // Re-initialize slider fills
        this.initializeSliderFills();
        
        // Save the reset state
        this.saveState();
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
        document.getElementById('zoomLevel').textContent = Math.round(this.zoomLevel * 100) + '%';
        
        // Update zoom button states
        document.getElementById('zoomIn').disabled = this.zoomLevel >= this.maxZoom;
        document.getElementById('zoomOut').disabled = this.zoomLevel <= this.minZoom;
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

}

// Initialize the editor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TemplateAdsEditor();
});
