class TemplateAdsEditor {
    constructor() {
        this.canvas = null;
        this.currentTemplate = 'template1';
        this.mainImage = null;
        this.logo = null;
        this.titleText = null;
        this.subtitleText = null;
        this.ctaText = null;
        this.background = null;
        
        this.init();
    }
    
    init() {
        // Initialize Fabric.js canvas
        this.canvas = new fabric.Canvas('designCanvas', {
            backgroundColor: '#ffffff',
            selection: true,
            preserveObjectStacking: true
        });
        
        this.setupEventListeners();
        this.loadTemplate(this.currentTemplate);
    }
    
    setupEventListeners() {
        // Template selection
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTemplate = btn.dataset.template;
                this.loadTemplate(this.currentTemplate);
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
        });
        
        // Color and size controls
        document.getElementById('titleColor').addEventListener('change', (e) => {
            this.updateTextStyle('title', 'fill', e.target.value);
        });
        
        document.getElementById('titleSize').addEventListener('input', (e) => {
            this.updateTextStyle('title', 'fontSize', parseInt(e.target.value));
            this.updateSliderFill(e.target);
        });
        
        document.getElementById('subtitleColor').addEventListener('change', (e) => {
            this.updateTextStyle('subtitle', 'fill', e.target.value);
        });
        
        document.getElementById('subtitleSize').addEventListener('input', (e) => {
            this.updateTextStyle('subtitle', 'fontSize', parseInt(e.target.value));
            this.updateSliderFill(e.target);
        });
        
        document.getElementById('ctaColor').addEventListener('change', (e) => {
            this.updateTextStyle('cta', 'fill', e.target.value);
        });
        
        document.getElementById('ctaSize').addEventListener('input', (e) => {
            this.updateTextStyle('cta', 'fontSize', parseInt(e.target.value));
            this.updateSliderFill(e.target);
        });
        
        document.getElementById('backgroundColor').addEventListener('change', (e) => {
            this.canvas.setBackgroundColor(e.target.value, this.canvas.renderAll.bind(this.canvas));
        });
        
        // Export buttons
        document.getElementById('exportPng').addEventListener('click', () => {
            this.exportImage('png');
        });
        
        document.getElementById('exportJpg').addEventListener('click', () => {
            this.exportImage('jpg');
        });
        
        document.getElementById('exportPdf').addEventListener('click', () => {
            this.exportPdf();
        });
        
        // Utility buttons
        document.getElementById('resetCanvas').addEventListener('click', () => {
            this.resetCanvas();
        });
        
        // Initialize slider fills on load
        this.initializeSliderFills();
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
        this.canvas.clear();
        this.canvas.setBackgroundColor(document.getElementById('backgroundColor').value, this.canvas.renderAll.bind(this.canvas));
        
        // Store current template name
        this.currentTemplate = templateName;
        
        // First add any existing images to maintain proper layering
        if (this.mainImage) {
            this.addExistingImageToCanvas(this.mainImage, 'main');
        }
        if (this.logo) {
            this.addExistingImageToCanvas(this.logo, 'logo');
        }
        
        // Then create text elements on top
        const templates = {
            template1: this.createTemplate1,
            template2: this.createTemplate2,
            template3: this.createTemplate3
        };
        
        if (templates[templateName]) {
            templates[templateName].call(this);
        }
        
        // Reposition existing logo for new template
        this.repositionLogoForTemplate(templateName);
        
        // Ensure proper final layering: background images at bottom, text on top
        this.enforceProperLayering();
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
                scaleX: 0.08,
                scaleY: 0.08
            });
            
            this.canvas.renderAll();
        }
    }
    
    createTemplate1() {
        // Classic Layout - Image top, text bottom
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        
        // Title
        this.titleText = new fabric.Text(document.getElementById('titleText').value, {
            left: canvasWidth / 2,
            top: canvasHeight * 0.65,
            fontSize: parseInt(document.getElementById('titleSize').value),
            fill: document.getElementById('titleColor').value,
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            shadow: 'rgba(0,0,0,0.9) 3px 3px 8px',
            id: 'title'
        });
        
        // Subtitle
        this.subtitleText = new fabric.Text(document.getElementById('subtitleText').value, {
            left: canvasWidth / 2,
            top: canvasHeight * 0.75,
            fontSize: parseInt(document.getElementById('subtitleSize').value),
            fill: document.getElementById('subtitleColor').value,
            fontFamily: 'Source Sans Pro, sans-serif',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            shadow: 'rgba(0,0,0,0.9) 2px 2px 6px',
            id: 'subtitle'
        });
        
        // CTA Button - Create rounded rectangle background
        const ctaButtonBg = new fabric.Rect({
            left: canvasWidth / 2,
            top: canvasHeight * 0.88,
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
        this.ctaText = new fabric.Text(document.getElementById('ctaText').value, {
            left: canvasWidth / 2,
            top: canvasHeight * 0.88,
            fontSize: parseInt(document.getElementById('ctaSize').value),
            fill: document.getElementById('ctaColor').value,
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
            top: canvasHeight * 0.88,
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
        
        // Title
        this.titleText = new fabric.Text(document.getElementById('titleText').value, {
            left: canvasWidth * 0.1,
            top: canvasHeight * 0.6,
            fontSize: parseInt(document.getElementById('titleSize').value),
            fill: document.getElementById('titleColor').value,
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'left',
            originX: 'left',
            originY: 'center',
            shadow: 'rgba(0,0,0,0.9) 3px 3px 8px',
            id: 'title'
        });
        
        // Subtitle
        this.subtitleText = new fabric.Text(document.getElementById('subtitleText').value, {
            left: canvasWidth * 0.1,
            top: canvasHeight * 0.7,
            fontSize: parseInt(document.getElementById('subtitleSize').value),
            fill: document.getElementById('subtitleColor').value,
            fontFamily: 'Source Sans Pro, sans-serif',
            textAlign: 'left',
            originX: 'left',
            originY: 'center',
            shadow: 'rgba(0,0,0,0.9) 2px 2px 6px',
            id: 'subtitle'
        });
        
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
        this.ctaText = new fabric.Text(document.getElementById('ctaText').value, {
            left: canvasWidth * 0.1 + 60,
            top: canvasHeight * 0.85,
            fontSize: parseInt(document.getElementById('ctaSize').value),
            fill: document.getElementById('ctaColor').value,
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
        
        // Title
        this.titleText = new fabric.Text(document.getElementById('titleText').value, {
            left: canvasWidth / 2,
            top: canvasHeight * 0.5,
            fontSize: parseInt(document.getElementById('titleSize').value),
            fill: document.getElementById('titleColor').value,
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            shadow: 'rgba(0,0,0,0.9) 3px 3px 8px',
            id: 'title'
        });
        
        // Subtitle
        this.subtitleText = new fabric.Text(document.getElementById('subtitleText').value, {
            left: canvasWidth / 2,
            top: canvasHeight * 0.65,
            fontSize: parseInt(document.getElementById('subtitleSize').value),
            fill: document.getElementById('subtitleColor').value,
            fontFamily: 'Source Sans Pro, sans-serif',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            shadow: 'rgba(0,0,0,0.9) 2px 2px 6px',
            id: 'subtitle'
        });
        
        // CTA Button - Create rounded rectangle background
        const ctaButtonBg = new fabric.Rect({
            left: canvasWidth / 2,
            top: canvasHeight * 0.8,
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
        this.ctaText = new fabric.Text(document.getElementById('ctaText').value, {
            left: canvasWidth / 2,
            top: canvasHeight * 0.8,
            fontSize: parseInt(document.getElementById('ctaSize').value),
            fill: document.getElementById('ctaColor').value,
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
    
    addExistingImageToCanvas(existingImg, type) {
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        
        // Clone the existing image
        existingImg.clone((clonedImg) => {
            if (type === 'main') {
                
                // Calculate automatic fitting scale to fill canvas area
                const imageAspectRatio = clonedImg.width / clonedImg.height;
                const canvasAspectRatio = canvasWidth / canvasHeight;
                
                let scaleX, scaleY;
                // Calculate scale to completely fill canvas (may crop image)
                const scaleToFitWidth = canvasWidth / clonedImg.width;
                const scaleToFitHeight = canvasHeight / clonedImg.height;
                
                // Use the larger scale to ensure complete coverage
                const scale = Math.max(scaleToFitWidth, scaleToFitHeight);
                scaleX = scale;
                scaleY = scale;
                
                // Position image to cover the entire canvas
                clonedImg.set({
                    left: canvasWidth / 2,
                    top: canvasHeight / 2,
                    originX: 'center',
                    originY: 'center',
                    scaleX: scaleX,
                    scaleY: scaleY,
                    id: 'mainImage'
                });
                
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
                const currentTemplate = document.querySelector('input[name="template"]:checked')?.value || 'template1';
                let logoConfig = this.getLogoPositionForTemplate(currentTemplate, canvasWidth, canvasHeight);
                
                clonedImg.set({
                    left: logoConfig.left,
                    top: logoConfig.top,
                    originX: logoConfig.originX,
                    originY: logoConfig.originY,
                    scaleX: 0.08,
                    scaleY: 0.08,
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
                
                // Calculate automatic fitting scale to fill canvas area
                const imageAspectRatio = img.width / img.height;
                const canvasAspectRatio = canvasWidth / canvasHeight;
                
                let scaleX, scaleY;
                // Calculate scale to completely fill canvas (may crop image)
                const scaleToFitWidth = canvasWidth / img.width;
                const scaleToFitHeight = canvasHeight / img.height;
                
                // Use the larger scale to ensure complete coverage
                const scale = Math.max(scaleToFitWidth, scaleToFitHeight);
                scaleX = scale;
                scaleY = scale;
                
                // Position image to cover the entire canvas
                img.set({
                    left: canvasWidth / 2,
                    top: canvasHeight / 2,
                    originX: 'center',
                    originY: 'center',
                    scaleX: scaleX,
                    scaleY: scaleY,
                    id: 'mainImage'
                });
                
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
                const currentTemplate = document.querySelector('input[name="template"]:checked')?.value || 'template1';
                let logoConfig = this.getLogoPositionForTemplate(currentTemplate, canvasWidth, canvasHeight);
                
                img.set({
                    left: logoConfig.left,
                    top: logoConfig.top,
                    originX: logoConfig.originX,
                    originY: logoConfig.originY,
                    scaleX: 0.08,
                    scaleY: 0.08,
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
                    return;
                }
                textObj = this.ctaText;
                break;
        }
        
        if (textObj) {
            textObj.set('text', value);
            this.canvas.renderAll();
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
                    return;
                }
                textObj = this.ctaText;
                break;
        }
        
        if (textObj) {
            textObj.set(property, value);
            this.canvas.renderAll();
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
        // Clear all stored images
        this.mainImage = null;
        this.logo = null;
        
        // Reset form values to defaults
        document.getElementById('titleText').value = 'Your Title Here';
        document.getElementById('subtitleText').value = 'Your subtitle text goes here';
        document.getElementById('ctaText').value = 'Get Started';
        document.getElementById('titleSize').value = '48';
        document.getElementById('subtitleSize').value = '24';
        document.getElementById('ctaSize').value = '16';
        document.getElementById('titleColor').value = '#333333';
        document.getElementById('subtitleColor').value = '#666666';
        document.getElementById('ctaColor').value = '#ffffff';
        document.getElementById('backgroundColor').value = '#ffffff';
        
        // Clear file inputs
        document.getElementById('mainImageUpload').value = '';
        document.getElementById('logoUpload').value = '';
        
        // Clear canvas completely
        this.canvas.clear();
        this.canvas.setBackgroundColor('#ffffff', this.canvas.renderAll.bind(this.canvas));
        
        // Reload current template with default values
        this.loadTemplate(this.currentTemplate || 'template1');
        
        // Re-initialize slider fills
        this.initializeSliderFills();
    }
    

}

// Initialize the editor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TemplateAdsEditor();
});
