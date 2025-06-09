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
        });
        
        document.getElementById('subtitleColor').addEventListener('change', (e) => {
            this.updateTextStyle('subtitle', 'fill', e.target.value);
        });
        
        document.getElementById('subtitleSize').addEventListener('input', (e) => {
            this.updateTextStyle('subtitle', 'fontSize', parseInt(e.target.value));
        });
        
        document.getElementById('ctaColor').addEventListener('change', (e) => {
            this.updateTextStyle('cta', 'fill', e.target.value);
        });
        
        document.getElementById('ctaSize').addEventListener('input', (e) => {
            this.updateTextStyle('cta', 'fontSize', parseInt(e.target.value));
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
        
        document.getElementById('centerElements').addEventListener('click', () => {
            this.centerElements();
        });
    }
    
    loadTemplate(templateName) {
        this.canvas.clear();
        this.canvas.setBackgroundColor(document.getElementById('backgroundColor').value, this.canvas.renderAll.bind(this.canvas));
        
        const templates = {
            template1: this.createTemplate1,
            template2: this.createTemplate2,
            template3: this.createTemplate3
        };
        
        if (templates[templateName]) {
            templates[templateName].call(this);
        }
        
        // Re-add existing images if they exist and ensure proper layering
        if (this.mainImage) {
            this.addExistingImageToCanvas(this.mainImage, 'main');
        }
        if (this.logo) {
            this.addExistingImageToCanvas(this.logo, 'logo');
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
                // Apply dark overlay filter for better text readability
                clonedImg.filters = clonedImg.filters || [];
                if (!clonedImg.filters.some(filter => filter.type === 'Brightness')) {
                    clonedImg.filters.push(new fabric.Image.filters.Brightness({ brightness: -0.3 }));
                    clonedImg.applyFilters();
                }
                
                // Reposition main image based on current template
                clonedImg.set({
                    left: canvasWidth / 2,
                    top: this.currentTemplate === 'template1' ? canvasHeight * 0.3 : 
                         this.currentTemplate === 'template2' ? canvasHeight * 0.25 : canvasHeight * 0.2,
                    originX: 'center',
                    originY: 'center',
                    id: 'mainImage'
                });
                
                this.canvas.add(clonedImg);
                this.canvas.sendToBack(clonedImg);
                
                // Add dark overlay rectangle for even better text contrast
                const overlay = new fabric.Rect({
                    left: clonedImg.left,
                    top: clonedImg.top,
                    width: clonedImg.getScaledWidth(),
                    height: clonedImg.getScaledHeight(),
                    fill: 'rgba(0, 0, 0, 0.2)',
                    originX: 'center',
                    originY: 'center',
                    selectable: false,
                    evented: false,
                    id: 'imageOverlay'
                });
                
                this.canvas.add(overlay);
                this.canvas.sendToBack(overlay);
                this.canvas.sendToBack(clonedImg);
                
            } else if (type === 'logo') {
                // Keep logo in original position
                clonedImg.set({
                    id: 'logo'
                });
                
                this.canvas.add(clonedImg);
                if (this.canvas.getObjects().find(obj => obj.id === 'mainImage')) {
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
                // Apply dark overlay filter for better text readability
                img.filters.push(new fabric.Image.filters.Brightness({ brightness: -0.3 }));
                img.applyFilters();
                
                // Main image positioning based on template - adjusted for vertical canvas
                img.set({
                    left: canvasWidth / 2,
                    top: this.currentTemplate === 'template1' ? canvasHeight * 0.3 : 
                         this.currentTemplate === 'template2' ? canvasHeight * 0.25 : canvasHeight * 0.2,
                    originX: 'center',
                    originY: 'center',
                    scaleX: 0.6,
                    scaleY: 0.6,
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
                
                // Add dark overlay rectangle for even better text contrast
                const overlay = new fabric.Rect({
                    left: img.left,
                    top: img.top,
                    width: img.getScaledWidth(),
                    height: img.getScaledHeight(),
                    fill: 'rgba(0, 0, 0, 0.2)',
                    originX: 'center',
                    originY: 'center',
                    selectable: false,
                    evented: false,
                    id: 'imageOverlay'
                });
                
                // Remove existing overlay
                const existingOverlay = this.canvas.getObjects().find(obj => obj.id === 'imageOverlay');
                if (existingOverlay) {
                    this.canvas.remove(existingOverlay);
                }
                
                this.canvas.add(overlay);
                this.canvas.sendToBack(overlay);
                this.canvas.sendToBack(img);
                
            } else if (type === 'logo') {
                // Logo positioning
                img.set({
                    left: 50,
                    top: 50,
                    originX: 'left',
                    originY: 'top',
                    scaleX: 0.2,
                    scaleY: 0.2,
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
        this.loadTemplate(this.currentTemplate);
    }
    
    centerElements() {
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        
        this.canvas.getObjects().forEach(obj => {
            if (obj.id && obj.id.includes('text') || obj.id === 'title' || obj.id === 'subtitle' || obj.id === 'cta') {
                obj.set({
                    left: canvasWidth / 2,
                    originX: 'center'
                });
            }
        });
        
        this.canvas.renderAll();
    }
}

// Initialize the editor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TemplateAdsEditor();
});
