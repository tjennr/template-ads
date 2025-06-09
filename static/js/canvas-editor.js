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
            backgroundColor: '#1a1a1a',
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
    }
    
    createTemplate1() {
        // Classic Layout - Image top, text bottom
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        
        // Title
        this.titleText = new fabric.Text(document.getElementById('titleText').value, {
            left: canvasWidth / 2,
            top: canvasHeight * 0.6,
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
            top: canvasHeight * 0.72,
            fontSize: parseInt(document.getElementById('subtitleSize').value),
            fill: document.getElementById('subtitleColor').value,
            fontFamily: 'Source Sans Pro, sans-serif',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            id: 'subtitle'
        });
        
        // CTA Button
        this.ctaText = new fabric.Text(document.getElementById('ctaText').value, {
            left: canvasWidth / 2,
            top: canvasHeight * 0.85,
            fontSize: parseInt(document.getElementById('ctaSize').value),
            fill: document.getElementById('ctaColor').value,
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            backgroundColor: '#0077B5',
            padding: 10,
            id: 'cta'
        });
        
        this.canvas.add(this.titleText, this.subtitleText, this.ctaText);
        this.canvas.renderAll();
    }
    
    createTemplate2() {
        // Modern Grid - Split layout
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        
        // Title
        this.titleText = new fabric.Text(document.getElementById('titleText').value, {
            left: canvasWidth * 0.25,
            top: canvasHeight * 0.3,
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
            left: canvasWidth * 0.25,
            top: canvasHeight * 0.45,
            fontSize: parseInt(document.getElementById('subtitleSize').value),
            fill: document.getElementById('subtitleColor').value,
            fontFamily: 'Source Sans Pro, sans-serif',
            textAlign: 'left',
            originX: 'left',
            originY: 'center',
            id: 'subtitle'
        });
        
        // CTA Button
        this.ctaText = new fabric.Text(document.getElementById('ctaText').value, {
            left: canvasWidth * 0.25,
            top: canvasHeight * 0.65,
            fontSize: parseInt(document.getElementById('ctaSize').value),
            fill: document.getElementById('ctaColor').value,
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            originX: 'left',
            originY: 'center',
            backgroundColor: '#0077B5',
            padding: 10,
            id: 'cta'
        });
        
        this.canvas.add(this.titleText, this.subtitleText, this.ctaText);
        this.canvas.renderAll();
    }
    
    createTemplate3() {
        // Minimalist - Centered everything
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        
        // Title
        this.titleText = new fabric.Text(document.getElementById('titleText').value, {
            left: canvasWidth / 2,
            top: canvasHeight * 0.35,
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
            top: canvasHeight * 0.5,
            fontSize: parseInt(document.getElementById('subtitleSize').value),
            fill: document.getElementById('subtitleColor').value,
            fontFamily: 'Source Sans Pro, sans-serif',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            id: 'subtitle'
        });
        
        // CTA Button
        this.ctaText = new fabric.Text(document.getElementById('ctaText').value, {
            left: canvasWidth / 2,
            top: canvasHeight * 0.7,
            fontSize: parseInt(document.getElementById('ctaSize').value),
            fill: document.getElementById('ctaColor').value,
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            backgroundColor: '#0077B5',
            padding: 8,
            id: 'cta'
        });
        
        this.canvas.add(this.titleText, this.subtitleText, this.ctaText);
        this.canvas.renderAll();
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
                // Main image positioning based on template
                img.set({
                    left: this.currentTemplate === 'template2' ? canvasWidth * 0.65 : canvasWidth / 2,
                    top: this.currentTemplate === 'template1' ? canvasHeight * 0.25 : canvasHeight * 0.3,
                    originX: 'center',
                    originY: 'center',
                    scaleX: 0.5,
                    scaleY: 0.5,
                    id: 'mainImage'
                });
                
                // Remove existing main image
                const existingMain = this.canvas.getObjects().find(obj => obj.id === 'mainImage');
                if (existingMain) {
                    this.canvas.remove(existingMain);
                }
                
                this.mainImage = img;
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
            }
            
            this.canvas.add(img);
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
