import os
import io
import base64
import uuid
from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from flask import render_template, request, jsonify, send_file, current_app
from werkzeug.utils import secure_filename
from app import app

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Main page with the template ads designer"""
    return render_template('index.html')

@app.route('/zoom-solutions')
def zoom_solutions():
    """Demo page showing different zoom solution options"""
    return render_template('zoom-solutions.html')

@app.route('/upload-image', methods=['POST'])
def upload_image():
    """Handle image upload for user photos and logos"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file selected'})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'})
        
        if file and allowed_file(file.filename):
            # Generate unique filename
            filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            
            # Save and process image
            file.save(filepath)
            
            # Convert to base64 for frontend use
            with open(filepath, 'rb') as img_file:
                img_data = base64.b64encode(img_file.read()).decode('utf-8')
                img_format = filepath.split('.')[-1].upper()
                if img_format == 'JPG':
                    img_format = 'JPEG'
                
                return jsonify({
                    'success': True,
                    'filename': filename,
                    'data_url': f'data:image/{img_format.lower()};base64,{img_data}'
                })
        else:
            return jsonify({'success': False, 'error': 'Invalid file type. Please upload PNG, JPG, JPEG, GIF, BMP, or WEBP files.'})
    
    except Exception as e:
        current_app.logger.error(f'Upload error: {str(e)}')
        return jsonify({'success': False, 'error': 'Upload failed. Please try again.'})

@app.route('/export-image', methods=['POST'])
def export_image():
    """Export the canvas as PNG or JPG"""
    try:
        data = request.get_json()
        image_data = data.get('imageData')
        format_type = data.get('format', 'png').lower()
        
        if not image_data:
            return jsonify({'success': False, 'error': 'No image data provided'})
        
        # Remove data URL prefix
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if exporting as JPG
        if format_type == 'jpg' or format_type == 'jpeg':
            if image.mode in ('RGBA', 'LA', 'P'):
                # Create white background
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            format_type = 'JPEG'
        else:
            format_type = 'PNG'
        
        # Save to BytesIO
        img_io = io.BytesIO()
        image.save(img_io, format=format_type, quality=95 if format_type == 'JPEG' else None)
        img_io.seek(0)
        
        filename = f'template_ad_{uuid.uuid4().hex[:8]}.{format_type.lower()}'
        
        return send_file(
            img_io,
            mimetype=f'image/{format_type.lower()}',
            as_attachment=True,
            download_name=filename
        )
    
    except Exception as e:
        current_app.logger.error(f'Export error: {str(e)}')
        return jsonify({'success': False, 'error': 'Export failed. Please try again.'})

@app.route('/export-pdf', methods=['POST'])
def export_pdf():
    """Export the canvas as PDF"""
    try:
        data = request.get_json()
        image_data = data.get('imageData')
        
        if not image_data:
            return jsonify({'success': False, 'error': 'No image data provided'})
        
        # Remove data URL prefix
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Create PDF
        pdf_io = io.BytesIO()
        pdf_canvas = canvas.Canvas(pdf_io, pagesize=letter)
        
        # Calculate dimensions to fit on page
        page_width, page_height = letter
        img_width, img_height = image.size
        
        # Scale image to fit page while maintaining aspect ratio
        scale = min((page_width - 72) / img_width, (page_height - 72) / img_height)  # 72 points = 1 inch margin
        new_width = img_width * scale
        new_height = img_height * scale
        
        # Center image on page
        x = (page_width - new_width) / 2
        y = (page_height - new_height) / 2
        
        # Convert PIL image to ReportLab ImageReader
        img_buffer = io.BytesIO()
        image.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        img_reader = ImageReader(img_buffer)
        
        # Draw image on PDF
        pdf_canvas.drawImage(img_reader, x, y, new_width, new_height)
        pdf_canvas.save()
        
        pdf_io.seek(0)
        filename = f'template_ad_{uuid.uuid4().hex[:8]}.pdf'
        
        return send_file(
            pdf_io,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )
    
    except Exception as e:
        current_app.logger.error(f'PDF export error: {str(e)}')
        return jsonify({'success': False, 'error': 'PDF export failed. Please try again.'})

@app.errorhandler(413)
def too_large(e):
    return jsonify({'success': False, 'error': 'File too large. Maximum size is 16MB.'}), 413

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'success': False, 'error': 'Internal server error. Please try again.'}), 500
