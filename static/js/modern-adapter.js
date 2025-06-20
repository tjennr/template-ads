// Modern UI Adapter for Template Ads Editor
class ModernUIAdapter {
    constructor() {
        this.canvas = null;
        this.editor = null;
        this.init();
    }

    init() {
        // Wait for canvas to be available
        if (document.getElementById('designCanvas')) {
            this.initCanvas();
            this.setupEventHandlers();
        } else {
            setTimeout(() => this.init(), 100);
        }
    }

    initCanvas() {
        // Initialize Fabric.js canvas
        this.canvas = new fabric.Canvas('designCanvas', {
            backgroundColor: '#ffffff',
            selection: true,
            preserveObjectStacking: true
        });

        // Set default canvas size
        this.canvas.setDimensions({
            width: 640,
            height: 800
        });

        // Add default content
        this.loadDefaultTemplate();
    }

    loadDefaultTemplate() {
        // Add default title
        const title = new fabric.Text('Your Amazing Product', {
            left: 50,
            top: 100,
            fontFamily: 'Source Sans Pro',
            fontSize: 36,
            fontWeight: 'bold',
            fill: '#333333'
        });

        // Add default subtitle
        const subtitle = new fabric.Text('Premium quality at affordable prices', {
            left: 50,
            top: 160,
            fontFamily: 'Source Sans Pro',
            fontSize: 18,
            fill: '#666666'
        });

        // Add default CTA button
        const ctaRect = new fabric.Rect({
            left: 50,
            top: 220,
            width: 140,
            height: 50,
            fill: '#ff7f50',
            rx: 8,
            ry: 8
        });

        const ctaText = new fabric.Text('Shop Now', {
            left: 120,
            top: 240,
            fontFamily: 'Source Sans Pro',
            fontSize: 16,
            fontWeight: 'bold',
            fill: '#ffffff',
            originX: 'center',
            originY: 'center'
        });

        const ctaGroup = new fabric.Group([ctaRect, ctaText], {
            left: 50,
            top: 220
        });

        this.canvas.add(title);
        this.canvas.add(subtitle);
        this.canvas.add(ctaGroup);
        this.canvas.renderAll();

        // Store references
        this.titleText = title;
        this.subtitleText = subtitle;
        this.ctaGroup = ctaGroup;
    }

    setupEventHandlers() {
        // Template selection
        const templateSelect = document.getElementById('templateSelect');
        if (templateSelect) {
            templateSelect.addEventListener('change', (e) => {
                this.switchTemplate(e.target.value);
            });
        }

        // Orientation selection
        const orientationRadios = document.querySelectorAll('input[name="orientation"]');
        orientationRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.changeOrientation(e.target.value);
                    this.updateOrientationUI(e.target.value);
                }
            });
        });

        // Font selection
        const titleFont = document.getElementById('titleFont');
        if (titleFont) {
            titleFont.addEventListener('change', (e) => {
                if (this.titleText) {
                    this.titleText.set('fontFamily', e.target.value);
                    this.canvas.renderAll();
                }
            });
        }

        const subtitleFont = document.getElementById('subtitleFont');
        if (subtitleFont) {
            subtitleFont.addEventListener('change', (e) => {
                if (this.subtitleText) {
                    this.subtitleText.set('fontFamily', e.target.value);
                    this.canvas.renderAll();
                }
            });
        }

        // Text content updates
        const titleText = document.getElementById('titleText');
        if (titleText) {
            titleText.addEventListener('input', (e) => {
                if (this.titleText) {
                    this.titleText.set('text', e.target.value);
                    this.canvas.renderAll();
                }
            });
        }

        const subtitleText = document.getElementById('subtitleText');
        if (subtitleText) {
            subtitleText.addEventListener('input', (e) => {
                if (this.subtitleText) {
                    this.subtitleText.set('text', e.target.value);
                    this.canvas.renderAll();
                }
            });
        }

        const ctaText = document.getElementById('ctaText');
        if (ctaText) {
            ctaText.addEventListener('input', (e) => {
                if (this.ctaGroup && this.ctaGroup._objects && this.ctaGroup._objects[1]) {
                    this.ctaGroup._objects[1].set('text', e.target.value);
                    this.canvas.renderAll();
                }
            });
        }

        // CTA color
        const ctaColor = document.getElementById('ctaColor');
        if (ctaColor) {
            ctaColor.addEventListener('input', (e) => {
                if (this.ctaGroup && this.ctaGroup._objects && this.ctaGroup._objects[0]) {
                    this.ctaGroup._objects[0].set('fill', e.target.value);
                    this.canvas.renderAll();
                }
            });
        }

        // Image upload
        const imageUpload = document.getElementById('imageUpload');
        const editBtn = document.querySelector('.edit-btn');
        if (imageUpload && editBtn) {
            editBtn.addEventListener('click', () => {
                imageUpload.click();
            });
            
            imageUpload.addEventListener('change', (e) => {
                this.handleImageUpload(e, 'main');
            });
        }

        // Logo upload
        const logoUpload = document.getElementById('logoUpload');
        const uploadPlaceholder = document.querySelector('.upload-placeholder');
        if (logoUpload && uploadPlaceholder) {
            uploadPlaceholder.addEventListener('click', () => {
                logoUpload.click();
            });
            
            logoUpload.addEventListener('change', (e) => {
                this.handleImageUpload(e, 'logo');
            });
        }

        // Header buttons
        const cancelBtn = document.querySelector('.btn-outline-secondary');
        const saveBtn = document.querySelector('.btn-primary');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetCanvas();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportCanvas();
            });
        }
    }

    switchTemplate(templateId) {
        // Clear canvas and reload with new template
        this.canvas.clear();
        this.loadDefaultTemplate();
    }

    changeOrientation(orientation) {
        if (orientation === 'square') {
            this.canvas.setDimensions({ width: 640, height: 640 });
        } else if (orientation === 'vertical') {
            this.canvas.setDimensions({ width: 640, height: 800 });
        } else {
            this.canvas.setDimensions({ width: 800, height: 640 });
        }
        this.canvas.renderAll();
    }

    updateOrientationUI(orientation) {
        const orientationRadios = document.querySelectorAll('input[name="orientation"]');
        orientationRadios.forEach(radio => {
            const label = radio.closest('.ratio-option');
            if (label) {
                label.classList.toggle('active', radio.value === orientation);
            }
        });
    }

    handleImageUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const imgElement = new Image();
            imgElement.onload = () => {
                const fabricImg = new fabric.Image(imgElement, {
                    left: type === 'logo' ? 350 : 50,
                    top: type === 'logo' ? 50 : 300,
                    scaleX: type === 'logo' ? 0.3 : 0.5,
                    scaleY: type === 'logo' ? 0.3 : 0.5
                });
                
                this.canvas.add(fabricImg);
                this.canvas.renderAll();

                // Update UI preview
                if (type === 'main') {
                    const currentImage = document.getElementById('currentImage');
                    if (currentImage) {
                        currentImage.src = e.target.result;
                    }
                }
            };
            imgElement.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    resetCanvas() {
        this.canvas.clear();
        this.loadDefaultTemplate();
        
        // Reset form values
        const titleText = document.getElementById('titleText');
        const subtitleText = document.getElementById('subtitleText');
        const ctaText = document.getElementById('ctaText');
        
        if (titleText) titleText.value = 'Your Amazing Product';
        if (subtitleText) subtitleText.value = 'Premium quality at affordable prices';
        if (ctaText) ctaText.value = 'Shop Now';
    }

    exportCanvas() {
        const dataURL = this.canvas.toDataURL({
            format: 'png',
            quality: 1
        });
        
        // Create download link
        const link = document.createElement('a');
        link.download = 'advertisement.png';
        link.href = dataURL;
        link.click();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.modernUIAdapter = new ModernUIAdapter();
});