// Modern UI Adapter for Template Ads Editor
class ModernUIAdapter {
    constructor(editor) {
        this.editor = editor;
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Template selection
        const templateSelect = document.getElementById('templateSelect');
        if (templateSelect) {
            templateSelect.addEventListener('change', (e) => {
                this.editor.loadTemplate(e.target.value);
            });
        }

        // Orientation selection
        const orientationRadios = document.querySelectorAll('input[name="orientation"]');
        orientationRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.editor.changeOrientation(e.target.value);
                }
            });
        });

        // Font selection
        const titleFont = document.getElementById('titleFont');
        if (titleFont) {
            titleFont.addEventListener('change', (e) => {
                this.editor.updateAllTextFonts(e.target.value);
            });
        }

        const subtitleFont = document.getElementById('subtitleFont');
        if (subtitleFont) {
            subtitleFont.addEventListener('change', (e) => {
                this.editor.updateAllTextFonts(e.target.value);
            });
        }

        // Text content updates
        const titleText = document.getElementById('titleText');
        if (titleText) {
            titleText.addEventListener('input', (e) => {
                this.editor.updateText('title', e.target.value);
            });
        }

        const subtitleText = document.getElementById('subtitleText');
        if (subtitleText) {
            subtitleText.addEventListener('input', (e) => {
                this.editor.updateText('subtitle', e.target.value);
            });
        }

        const ctaText = document.getElementById('ctaText');
        if (ctaText) {
            ctaText.addEventListener('input', (e) => {
                this.editor.updateText('cta', e.target.value);
            });
        }

        // CTA color
        const ctaColor = document.getElementById('ctaColor');
        if (ctaColor) {
            ctaColor.addEventListener('change', (e) => {
                this.editor.updateCtaBackgroundColor(e.target.value);
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
                this.editor.handleImageUpload(e, 'main');
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
                this.editor.handleImageUpload(e, 'logo');
            });
        }

        // Header buttons
        const cancelBtn = document.querySelector('.btn-outline-secondary');
        const saveBtn = document.querySelector('.btn-primary');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.editor.resetCanvas();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.editor.exportImage('png');
            });
        }
    }

    // Update UI elements when canvas changes
    updateTemplateSelector(templateId) {
        const templateSelect = document.getElementById('templateSelect');
        if (templateSelect) {
            templateSelect.value = templateId;
        }
    }

    updateOrientationSelector(orientation) {
        const orientationRadios = document.querySelectorAll('input[name="orientation"]');
        orientationRadios.forEach(radio => {
            radio.checked = radio.value === orientation;
            const label = radio.closest('.ratio-option');
            if (label) {
                label.classList.toggle('active', radio.checked);
            }
        });
    }

    updateTextInputs(title, subtitle, cta) {
        const titleInput = document.getElementById('titleText');
        const subtitleInput = document.getElementById('subtitleText');
        const ctaInput = document.getElementById('ctaText');

        if (titleInput) titleInput.value = title || '';
        if (subtitleInput) subtitleInput.value = subtitle || '';
        if (ctaInput) ctaInput.value = cta || '';
    }

    updateCurrentImage(imageSrc) {
        const currentImage = document.getElementById('currentImage');
        if (currentImage && imageSrc) {
            currentImage.src = imageSrc;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for the main editor to be initialized
    if (window.templateEditor) {
        window.modernAdapter = new ModernUIAdapter(window.templateEditor);
    } else {
        // If editor isn't ready, wait a bit and try again
        setTimeout(() => {
            if (window.templateEditor) {
                window.modernAdapter = new ModernUIAdapter(window.templateEditor);
            }
        }, 100);
    }
});